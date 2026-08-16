import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Combobox } from "./combobox.js";

const items = [
  { value: "argelia", label: "Argelia" },
  { value: "argentina", label: "Argentina" },
  { value: "chile", label: "Chile" },
];

const setup = (props: Partial<Parameters<typeof Combobox>[0]> = {}) => {
  const ui = render(<Combobox items={items} label="País" {...props} />);
  const input = ui.getByRole("combobox", { name: "País" }) as HTMLInputElement;
  return { ui, input };
};

describe("Combobox", () => {
  it("keeps the typed search when the field is left without a selection", async () => {
    const { ui, input } = setup();

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "arg" } });
    await waitFor(() => expect(ui.getAllByRole("option")).toHaveLength(2));

    // Leaving with nothing chosen: the machine would revert the input, `selectionBehavior: preserve`
    // is what keeps the user's work on screen.
    fireEvent.blur(input);

    await waitFor(() => expect(input.value).toBe("arg"));
  });

  it("writes the chosen label and reopens on the whole list", async () => {
    const { ui, input } = setup();

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "arg" } });
    fireEvent.click(await ui.findByRole("option", { name: "Argentina" }));

    await waitFor(() => expect(input.value).toBe("Argentina"));

    fireEvent.click(input);
    await waitFor(() =>
      expect(ui.getAllByRole("option")).toHaveLength(items.length),
    );
  });

  it("spends the query on each chip when multiple", async () => {
    const { ui, input } = setup({ multiple: true });

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "arg" } });
    fireEvent.click(await ui.findByRole("option", { name: "Argentina" }));

    // The chip carries the answer, so the input is free for the next search — on the whole list.
    await waitFor(() => expect(input.value).toBe(""));
    expect(ui.getAllByRole("option")).toHaveLength(items.length);
    expect(ui.getByRole("listitem").textContent).toContain("Argentina");
  });

  it("marks the highlight as keyboard-driven so the option can carry the focus ring", async () => {
    const { ui, input } = setup();

    fireEvent.click(input);
    const listbox = await ui.findByRole("listbox");
    // `pointer` at rest, matching the enhancer: no key has moved the highlight yet, and only
    // `keyboard` changes what is drawn. This read `toBeUndefined()` while the two bindings
    // disagreed about the attribute before anyone had touched the control.
    expect(listbox.dataset.highlightSource).toBe("pointer");

    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => expect(listbox.dataset.highlightSource).toBe("keyboard"));
    // The control gives its ring up while an option holds it — one ring on screen at a time.
    expect(
      ui.container.querySelector(".sk-combobox")?.hasAttribute("data-virtual-focus"),
    ).toBe(true);

    fireEvent.pointerMove(listbox);

    await waitFor(() => expect(listbox.dataset.highlightSource).toBe("pointer"));
    expect(
      ui.container.querySelector(".sk-combobox")?.hasAttribute("data-virtual-focus"),
    ).toBe(false);
  });

  it("moves aria-selected onto the highlighted option before Enter commits anything", async () => {
    const { ui, input } = setup();

    fireEvent.click(input);
    await ui.findAllByRole("option");

    // Nothing chosen yet, nothing highlighted yet: no option should claim to be "selected".
    for (const option of ui.getAllByRole("option"))
      expect(option.hasAttribute("aria-selected")).toBe(false);

    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Matches the WAI reference implementation (`combobox-autocomplete.js`,
    // `setCurrentOptionStyle`): the option under `aria-activedescendant` carries
    // `aria-selected="true"` while the user is only previewing it, not the previously chosen value.
    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Argelia" }).getAttribute("aria-selected"),
      ).toBe("true"),
    );
    expect(
      ui.getByRole("option", { name: "Argentina" }).hasAttribute("aria-selected"),
    ).toBe(false);

    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Argentina" }).getAttribute("aria-selected"),
      ).toBe("true"),
    );
    expect(
      ui.getByRole("option", { name: "Argelia" }).hasAttribute("aria-selected"),
    ).toBe(false);
  });

  it("keeps aria-selected tied to the chosen chips when multiple, not the highlight", async () => {
    const { ui, input } = setup({ multiple: true });

    fireEvent.click(input);
    await ui.findAllByRole("option");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Nothing chosen yet: the highlight alone must not produce aria-selected in multiple mode
    // either — only single-select borrows the highlight for it.
    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Argelia" }).hasAttribute("data-highlighted"),
      ).toBe(true),
    );
    expect(
      ui.getByRole("option", { name: "Argelia" }).hasAttribute("aria-selected"),
    ).toBe(false);

    fireEvent.click(ui.getByRole("option", { name: "Argelia" }));

    // Choosing it as a chip is what turns aria-selected on: with chips, it means "part of the
    // chosen set" (`aria-multiselectable="true"`), not "currently previewed".
    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Argelia" }).getAttribute("aria-selected"),
      ).toBe("true"),
    );
  });
});
