import { fireEvent, waitFor } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountUserSelect } from "./user-select.js";

type User = { id: string; name: string; email: string; disabled?: boolean };

const users: User[] = [
  { id: "jane", name: "Jane Cooper", email: "jane@company.com" },
  { id: "maria", name: "Maria Fuentes", email: "maria@company.com" },
  { id: "marco", name: "Marco Rossi", email: "marco@company.com" },
  { id: "john", name: "John Alder", email: "john@company.com" },
  { id: "alex", name: "Alex Kim", email: "alex@company.com", disabled: true },
];

const row = (user: User) => `
  <div class="sk-select__item sk-interactive" data-sk-select-item data-value="${user.id}" data-email="${user.email}" ${user.disabled ? "data-disabled" : ""}>
    <span class="sk-avatar" data-size="sm" role="img" aria-label="${user.name}"><span class="sk-avatar__fallback" aria-hidden="true">${user.name.slice(0, 2)}</span></span>
    <span class="sk-combobox__item-copy">
      <span class="sk-select__item-text" data-sk-select-item-text>${user.name}</span>
      <span class="sk-select__item-text sk-combobox__item-description">${user.email}</span>
    </span>
    <span class="sk-select__item-indicator" data-sk-select-item-indicator aria-hidden="true"><svg class="sk-icon"></svg></span>
  </div>`;

function markup(roster: User[] = users) {
  return `<div class="sk-select" data-sk-user-select id="assignees" data-placeholder="Select users">
    <div class="sk-select__control" data-sk-select-control>
      <button class="sk-select__trigger sk-interactive" data-sk-select-trigger type="button">
        <span class="sk-select__value" data-sk-select-value></span>
        <span class="sk-select__indicator" data-sk-select-indicator aria-hidden="true">
          <span data-state="closed"><svg class="sk-icon"></svg></span>
          <span data-state="open"><svg class="sk-icon"></svg></span>
        </span>
      </button>
    </div>
    <div class="sk-select__positioner" data-sk-select-positioner>
      <div class="sk-select__content" data-sk-select-content>
        <input class="sk-input" data-sk-user-select-search type="search" placeholder="Search users..." />
        ${roster.map(row).join("")}
      </div>
    </div>
  </div>`;
}

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  expect(mountUserSelect(document)).toBe(1);
  return root;
}

const parts = (root: HTMLElement) => ({
  trigger: root.querySelector("[data-sk-select-trigger]") as HTMLElement,
  value: root.querySelector("[data-sk-select-value]") as HTMLElement,
  search: root.querySelector("[data-sk-user-select-search]") as HTMLInputElement,
  items: [...root.querySelectorAll<HTMLElement>("[data-sk-select-item]")],
  empty: root.querySelector("[data-sk-user-select-empty]") as HTMLElement,
  clear: root.querySelector("[data-sk-user-select-clear]") as HTMLButtonElement,
  footer: root.querySelector("[data-sk-user-select-footer]") as HTMLElement,
});

const shown = (root: HTMLElement) => parts(root).items.filter((n) => !n.hidden);
const type = (input: HTMLInputElement, value: string) => {
  input.value = value;
  fireEvent.input(input);
};

describe("UserSelect Vanilla contracts", () => {
  it("opens on trigger click, closes on Escape and returns focus to the trigger", async () => {
    const root = mount(markup());
    const { trigger } = parts(root);

    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });

    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("selects a user and represents it with the authored avatar and name in the trigger", async () => {
    const root = mount(markup());
    const { trigger, value } = parts(root);

    fireEvent.click(trigger);
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="jane"]') as HTMLElement);

    await waitFor(() => expect(trigger.getAttribute("aria-label")).toBe("Select users, Jane Cooper selected"));
    expect(value.querySelector(".sk-avatar")).toBeTruthy();
    expect(value.textContent).toContain("Jane Cooper");
    // The dropdown never closes on select.
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("supports selecting multiple users without closing, then deselecting one", async () => {
    const root = mount(markup());
    const { trigger, value } = parts(root);

    fireEvent.click(trigger);
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="jane"]') as HTMLElement);
    await waitFor(() => expect(trigger.getAttribute("aria-label")).toContain("Jane Cooper"));
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="maria"]') as HTMLElement);

    await waitFor(() => expect(trigger.getAttribute("aria-label")).toBe("Select users, 2 users selected"));
    expect(value.querySelectorAll(".sk-avatar")).toHaveLength(2);

    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="jane"]') as HTMLElement);

    await waitFor(() => expect(trigger.getAttribute("aria-label")).toBe("Select users, Maria Fuentes selected"));
  });

  it("filters by name and by email without touching the current selection", async () => {
    const root = mount(markup());
    const { trigger, search } = parts(root);

    fireEvent.click(trigger);
    type(search, "mar");
    await waitFor(() => expect(shown(root).map((n) => n.dataset.value)).toEqual(["maria", "marco"]));

    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="maria"]') as HTMLElement);
    await waitFor(() => expect(trigger.getAttribute("aria-label")).toContain("Maria Fuentes"));

    type(search, "john@company.com");
    await waitFor(() => expect(shown(root)).toHaveLength(1));
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="john"]') as HTMLElement);

    await waitFor(() => expect(trigger.getAttribute("aria-label")).toBe("Select users, 2 users selected"));
  });

  it("keeps a selection made under a search filter once the filter is cleared", async () => {
    const root = mount(markup());
    const { trigger, search } = parts(root);

    fireEvent.click(trigger);
    type(search, "mar");
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="maria"]') as HTMLElement);

    type(search, "");
    await waitFor(() => expect(shown(root)).toHaveLength(users.length));
    expect(
      (root.querySelector('[data-sk-select-item][data-value="maria"]') as HTMLElement).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("shows Clear all once something is selected and empties the selection", async () => {
    const root = mount(markup());
    const { trigger, clear, footer } = parts(root);

    fireEvent.click(trigger);
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="jane"]') as HTMLElement);
    await waitFor(() => expect(footer.hidden).toBe(false));

    fireEvent.click(clear);

    await waitFor(() => expect(trigger.getAttribute("aria-label")).toBe("Select users"));
    expect(footer.hidden).toBe(true);
  });

  it("never selects a disabled user", async () => {
    const root = mount(markup());
    const { trigger } = parts(root);
    const alex = root.querySelector('[data-sk-select-item][data-value="alex"]') as HTMLElement;

    fireEvent.click(trigger);
    await waitFor(() => expect(alex.getAttribute("aria-disabled")).toBe("true"));

    fireEvent.click(alex);

    expect(trigger.getAttribute("aria-label")).toBe("Select users");
  });

  it("selects the arrow-highlighted user on Enter from the search field", async () => {
    const root = mount(markup());
    const { trigger, search } = parts(root);

    fireEvent.click(trigger);
    fireEvent.keyDown(search, { key: "ArrowDown" });
    await waitFor(() =>
      expect((root.querySelector('[data-sk-select-item][data-value="jane"]') as HTMLElement).hasAttribute("data-highlighted")).toBe(
        true,
      ),
    );

    fireEvent.keyDown(search, { key: "Enter" });

    await waitFor(() => expect(trigger.getAttribute("aria-label")).toContain("Jane Cooper"));
  });

  it("types a literal space in the search field instead of toggling the highlighted user", async () => {
    const root = mount(markup());
    const { trigger, search } = parts(root);

    fireEvent.click(trigger);
    fireEvent.keyDown(search, { key: "ArrowDown" });
    await waitFor(() =>
      expect((root.querySelector('[data-sk-select-item][data-value="jane"]') as HTMLElement).hasAttribute("data-highlighted")).toBe(
        true,
      ),
    );

    type(search, "jane cooper");
    fireEvent.keyDown(search, { key: " " });

    expect(trigger.getAttribute("aria-label")).toBe("Select users");
    expect(search.value).toBe("jane cooper");
  });

  it("distinguishes an empty roster from a search with no matches", async () => {
    const root = mount(markup([]));
    const { trigger, empty } = parts(root);

    fireEvent.click(trigger);
    await waitFor(() => expect(empty.hidden).toBe(false));
    expect(empty.textContent).toBe("No users available");
  });

  it("says a search has no matches, distinctly from an empty roster", async () => {
    const root = mount(markup());
    const { trigger, search, empty } = parts(root);

    fireEvent.click(trigger);
    type(search, "zzz");

    await waitFor(() => expect(empty.hidden).toBe(false));
    expect(empty.textContent).toBe('No users found for "zzz"');
  });

  it("destroying the mount stops the machine", async () => {
    const root = mount(markup());
    const { trigger } = parts(root);
    const handler = vi.fn();
    root.addEventListener("sk:userselectvaluechange", handler);

    fireEvent.click(trigger);
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="jane"]') as HTMLElement);
    await waitFor(() => expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: ["jane"] } })));

    destroyMount(root);
    handler.mockClear();
    fireEvent.click(trigger);
    fireEvent.click(root.querySelector('[data-sk-select-item][data-value="maria"]') as HTMLElement);
    expect(handler).not.toHaveBeenCalled();
  });
});
