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
});
