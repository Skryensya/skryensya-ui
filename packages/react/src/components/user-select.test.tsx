import { fireEvent, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { UserSelect, type UserSelectProps, type UserSelectUser } from "./user-select.js";

const users: UserSelectUser[] = [
  { id: "jane", name: "Jane Cooper", email: "jane@company.com" },
  { id: "maria", name: "Maria Fuentes", email: "maria@company.com" },
  { id: "marco", name: "Marco Rossi", email: "marco@company.com" },
  { id: "john", name: "John Alder", email: "john@company.com" },
  { id: "alex", name: "Alex Kim", email: "alex@company.com", disabled: true },
];

// UserSelect is fully controlled (like Select/Combobox): the harness owns `value` so a click can be
// followed by an assertion on what the *next* render looks like, the same shape a real consumer has.
function Harness(props: Partial<UserSelectProps> & { onChange?: (value: string[]) => void }) {
  const [value, setValue] = useState<string[]>(props.value ? [...props.value] : []);
  return (
    <UserSelect
      placeholder="Select users"
      {...props}
      onValueChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
      users={props.users ?? users}
      value={value}
    />
  );
}

describe("UserSelect", () => {
  it("opens on trigger click and closes on Escape, returning focus to the trigger", async () => {
    const ui = render(<Harness />);
    const trigger = ui.getByRole("combobox", { name: "Select users" });

    fireEvent.click(trigger);
    const search = await ui.findByRole("searchbox");
    await waitFor(() => expect(ui.getAllByRole("option")).toHaveLength(users.length));

    fireEvent.keyDown(search, { key: "Escape" });

    await waitFor(() => expect(ui.queryAllByRole("option")).toHaveLength(0));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("selects a user and represents it with an avatar and name in the trigger", async () => {
    const onChange = vi.fn();
    const ui = render(<Harness onChange={onChange} />);
    const trigger = ui.getByRole("combobox", { name: "Select users" });

    fireEvent.click(trigger);
    fireEvent.click(await ui.findByRole("option", { name: /Jane Cooper/ }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(["jane"]));
    expect(trigger.getAttribute("aria-label")).toBe("Select users, Jane Cooper selected");
    // The dropdown never closes on select: the listbox is still there for the next pick.
    expect(ui.getAllByRole("option").length).toBeGreaterThan(0);
  });

  it("supports selecting multiple users without closing, then deselecting one", async () => {
    const onChange = vi.fn();
    const ui = render(<Harness onChange={onChange} />);
    const trigger = ui.getByRole("combobox", { name: "Select users" });

    fireEvent.click(trigger);
    fireEvent.click(await ui.findByRole("option", { name: /Jane Cooper/ }));
    fireEvent.click(await ui.findByRole("option", { name: /Maria Fuentes/ }));

    await waitFor(() => expect(trigger.getAttribute("aria-label")).toBe("Select users, 2 users selected"));

    fireEvent.click(ui.getByRole("option", { name: /Jane Cooper/ }));

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(["maria"]));
  });

  it("filters by name and by email without touching the current selection", async () => {
    const ui = render(<Harness />);
    const trigger = ui.getByRole("combobox", { name: "Select users" });

    fireEvent.click(trigger);
    const search = await ui.findByRole("searchbox");

    fireEvent.change(search, { target: { value: "mar" } });
    await waitFor(() =>
      expect(ui.getAllByRole("option").map((option) => option.textContent)).toEqual([
        expect.stringContaining("Maria Fuentes"),
        expect.stringContaining("Marco Rossi"),
      ]),
    );

    fireEvent.click(ui.getByRole("option", { name: /Maria Fuentes/ }));
    await waitFor(() => expect(trigger.getAttribute("aria-label")).toContain("Maria Fuentes"));
    fireEvent.click(ui.getByRole("option", { name: /Marco Rossi/ }));
    await waitFor(() => expect(trigger.getAttribute("aria-label")).toContain("2 users"));

    fireEvent.change(search, { target: { value: "john@company.com" } });
    await waitFor(() => expect(ui.getAllByRole("option")).toHaveLength(1));
    fireEvent.click(ui.getByRole("option", { name: /John Alder/ }));

    await waitFor(() => expect(trigger.getAttribute("aria-label")).toBe("Select users, 3 users selected"));
  });

  it("keeps a selection made under a search filter once the filter is cleared", async () => {
    const ui = render(<Harness />);
    const trigger = ui.getByRole("combobox", { name: "Select users" });

    fireEvent.click(trigger);
    const search = await ui.findByRole("searchbox");
    fireEvent.change(search, { target: { value: "mar" } });
    fireEvent.click(await ui.findByRole("option", { name: /Maria Fuentes/ }));

    fireEvent.change(search, { target: { value: "" } });
    await waitFor(() => expect(ui.getAllByRole("option")).toHaveLength(users.length));
    expect(ui.getByRole("option", { name: /Maria Fuentes/ }).getAttribute("aria-selected")).toBe("true");
  });

  it("shows Clear all once something is selected and empties the value", async () => {
    const onChange = vi.fn();
    const ui = render(<Harness onChange={onChange} />);
    const trigger = ui.getByRole("combobox", { name: "Select users" });

    fireEvent.click(trigger);
    fireEvent.click(await ui.findByRole("option", { name: /Jane Cooper/ }));

    const clear = await ui.findByRole("button", { name: "Clear all" });
    fireEvent.click(clear);

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith([]));
    expect(trigger.getAttribute("aria-label")).toBe("Select users");
  });

  it("never selects a disabled user", async () => {
    const onChange = vi.fn();
    const ui = render(<Harness onChange={onChange} />);
    const trigger = ui.getByRole("combobox", { name: "Select users" });

    fireEvent.click(trigger);
    const option = await ui.findByRole("option", { name: /Alex Kim/ });
    expect(option.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(option);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("selects the arrow-highlighted user on Enter from the search field", async () => {
    const onChange = vi.fn();
    const ui = render(<Harness onChange={onChange} />);
    const trigger = ui.getByRole("combobox", { name: "Select users" });

    fireEvent.click(trigger);
    const search = await ui.findByRole("searchbox");

    fireEvent.keyDown(search, { key: "ArrowDown" });
    await waitFor(() => expect(ui.getByRole("option", { name: /Jane Cooper/ }).dataset.highlighted).toBe(""));

    fireEvent.keyDown(search, { key: "Enter" });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(["jane"]));
  });

  it("types a literal space in the search field instead of toggling the highlighted user", async () => {
    const onChange = vi.fn();
    const ui = render(<Harness onChange={onChange} />);
    fireEvent.click(ui.getByRole("combobox", { name: "Select users" }));
    const search = (await ui.findByRole("searchbox")) as HTMLInputElement;

    fireEvent.keyDown(search, { key: "ArrowDown" });
    await waitFor(() => expect(ui.getByRole("option", { name: /Jane Cooper/ }).dataset.highlighted).toBe(""));

    fireEvent.change(search, { target: { value: "jane cooper" } });
    fireEvent.keyDown(search, { key: " " });

    expect(onChange).not.toHaveBeenCalled();
    expect(search.value).toBe("jane cooper");
  });

  it("says a roster is empty, distinctly from a search with no matches", async () => {
    const ui = render(<Harness users={[]} />);
    fireEvent.click(ui.getByRole("combobox", { name: "Select users" }));
    expect(await ui.findByText("No users available")).toBeTruthy();
  });

  it("says a search has no matches, distinctly from an empty roster", async () => {
    const ui = render(<Harness />);
    fireEvent.click(ui.getByRole("combobox", { name: "Select users" }));
    const search = await ui.findByRole("searchbox");
    fireEvent.change(search, { target: { value: "zzz" } });

    expect(await ui.findByText('No users found for "zzz"')).toBeTruthy();
  });

  it("shows the loading pattern instead of the empty state while loading", async () => {
    const ui = render(<Harness loading />);
    fireEvent.click(ui.getByRole("combobox", { name: "Select users" }));

    expect(await ui.findByText("Loading users...")).toBeTruthy();
    expect(ui.queryByText("No users available")).toBeNull();
  });

  it("represents a multi-user selection with GroupedAvatar's own overflow", async () => {
    const ui = render(<Harness value={["jane", "maria", "marco", "john"]} maxAvatars={2} />);
    const trigger = ui.getByRole("combobox");

    expect(trigger.getAttribute("aria-label")).toBe("Select users, 4 users selected");
    expect(ui.getByText("+2")).toBeTruthy();
  });
});
