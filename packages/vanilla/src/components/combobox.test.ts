import { fireEvent, waitFor } from "@testing-library/dom";
import { describe, expect, it } from "vitest";
import { mountCombobox } from "./combobox.js";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  mountCombobox(root);
  return root;
}

const item = (value: string, label: string) => `
  <div class="sk-combobox__item" data-sk-combobox-item data-value="${value}" data-value-text="${label}">
    <span class="sk-combobox__item-label" data-sk-combobox-item-text>${label}</span>
  </div>`;

const markup = `<div class="sk-combobox" data-sk-combobox>
  <label class="sk-combobox__label" data-sk-combobox-label>País</label>
  <div class="sk-combobox__control" data-sk-combobox-control>
    <div class="sk-combobox__value" data-sk-combobox-value>
      <input class="sk-combobox__input" data-sk-combobox-input placeholder="Buscar país" />
    </div>
    <button class="sk-combobox__clear" data-sk-combobox-clear type="button" hidden></button>
    <span class="sk-combobox__trigger" data-sk-combobox-trigger aria-hidden="true"></span>
  </div>
  <div class="sk-combobox__positioner" data-sk-combobox-positioner>
    <div class="sk-combobox__content" data-sk-combobox-content>
      ${item("argelia", "Argelia")}
      ${item("argentina", "Argentina")}
      ${item("chile", "Chile")}
    </div>
  </div>
</div>`;

const parts = (root: HTMLElement) => ({
  input: root.querySelector("[data-sk-combobox-input]") as HTMLInputElement,
  content: root.querySelector("[data-sk-combobox-content]") as HTMLElement,
  items: [...root.querySelectorAll<HTMLElement>("[data-sk-combobox-item]")],
});

const shown = (root: HTMLElement) => parts(root).items.filter((n) => !n.hidden);

const type = (input: HTMLInputElement, value: string) => {
  input.value = value;
  fireEvent.input(input);
};

describe("Combobox Vanilla contracts", () => {
  it("keeps the typed search when the field is left without a selection", async () => {
    const root = mount(markup);
    const { input } = parts(root);

    fireEvent.click(input);
    type(input, "arg");
    await waitFor(() => expect(shown(root)).toHaveLength(2));

    // Leaving with nothing chosen: the machine would revert the input, `selectionBehavior: preserve`
    // is what keeps the user's work on screen.
    fireEvent.focusOut(input);

    await waitFor(() => expect(input.value).toBe("arg"));
  });

  it("writes the chosen label and reopens on the whole list", async () => {
    const root = mount(markup);
    const { input, items } = parts(root);

    fireEvent.click(input);
    type(input, "arg");
    fireEvent.click(items[1]);

    await waitFor(() => expect(input.value).toBe("Argentina"));
    expect(shown(root)).toHaveLength(items.length);
  });

  it("hands the filtered collection to the machine before it renders", async () => {
    const root = mount(markup);
    const { input } = parts(root);

    fireEvent.click(input);
    type(input, "chi");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // The first arrow must land on the first FILTERED row, not the first authored one. The filter
    // swaps the machine's collection by mutating its props and leans on the store's own batched
    // notification to publish it; if that ordering ever breaks, the machine highlights Argelia here.
    await waitFor(() => {
      const highlighted = parts(root).items.find((n) =>
        n.hasAttribute("data-highlighted"),
      );
      expect(highlighted?.dataset.valueText).toBe("Chile");
    });
  });

  it("spends the query on each chip when multiple", async () => {
    const root = mount(markup.replace("data-sk-combobox>", "data-sk-combobox data-multiple>"));
    const { input, items } = parts(root);

    fireEvent.click(input);
    type(input, "arg");
    fireEvent.click(items[1]);

    // The chip carries the answer, so the input is free for the next search. On the whole list.
    await waitFor(() => expect(input.value).toBe(""));
    expect(shown(root)).toHaveLength(items.length);
    expect(
      root.querySelector("[data-sk-combobox-selected-items]")?.textContent,
    ).toContain("Argentina");
  });

  it("marks the highlight as keyboard-driven so the option can carry the focus ring", async () => {
    const root = mount(markup);
    const { input, content, items } = parts(root);

    fireEvent.click(input);
    expect(content.dataset.highlightSource).toBe("pointer");

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(content.dataset.highlightSource).toBe("keyboard");
    // The control gives its ring up while an option holds it. One ring on screen at a time.
    await waitFor(() => expect(root.hasAttribute("data-virtual-focus")).toBe(true));

    fireEvent.pointerMove(items[0]);

    expect(content.dataset.highlightSource).toBe("pointer");
    expect(root.hasAttribute("data-virtual-focus")).toBe(false);
  });

  it("moves aria-selected onto the highlighted option before Enter commits anything", async () => {
    const root = mount(markup);
    const { input, items } = parts(root);

    fireEvent.click(input);
    // Nothing chosen yet, nothing highlighted yet: no option should claim to be "selected".
    for (const option of items) expect(option.hasAttribute("aria-selected")).toBe(false);

    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Matches the WAI reference implementation (`combobox-autocomplete.js`,
    // `setCurrentOptionStyle`): the option under `aria-activedescendant` carries
    // `aria-selected="true"` while the user is only previewing it, not the previously chosen value.
    await waitFor(() => expect(items[0].getAttribute("aria-selected")).toBe("true"));
    expect(items[1].hasAttribute("aria-selected")).toBe(false);

    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => expect(items[1].getAttribute("aria-selected")).toBe("true"));
    expect(items[0].hasAttribute("aria-selected")).toBe(false);
  });

  it("keeps aria-selected tied to the chosen chips when multiple, not the highlight", async () => {
    const root = mount(markup.replace("data-sk-combobox>", "data-sk-combobox data-multiple>"));
    const { input, items } = parts(root);

    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Nothing chosen yet: the highlight alone must not produce aria-selected in multiple mode
    // either. Only single-select borrows the highlight for it.
    await waitFor(() => expect(items[0].hasAttribute("data-highlighted")).toBe(true));
    expect(items[0].hasAttribute("aria-selected")).toBe(false);

    fireEvent.click(items[0]);

    // Choosing it as a chip is what turns aria-selected on: with chips, it means "part of the
    // chosen set" (`aria-multiselectable="true"`), not "currently previewed".
    await waitFor(() => expect(items[0].getAttribute("aria-selected")).toBe("true"));
  });
});
