import { fireEvent, waitFor, within } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { mountTagsInput } from "./tags-input.js";

/*
 * The vanilla half of TagsInput. Every assertion here has a twin in
 * `packages/react/src/components/tags-input.test.tsx`: the two bindings drive the SAME machine, so
 * a suite that checked only one would let the pair drift where the contract promises it cannot.
 *
 * The markup is what `emitMarkup` produces for the canonical tree, not markup invented here.
 */
function mount(
  options: { tags?: string[]; max?: number; allowDuplicates?: boolean; readOnly?: boolean } = {},
): HTMLElement {
  const tags = options.tags ?? [];
  const max = options.max === undefined ? "" : ` data-max="${options.max}"`;
  const allowDuplicates = options.allowDuplicates ? " data-allow-duplicates" : "";
  const readOnly = options.readOnly ? " data-readonly" : "";
  const items = tags
    .map(
      (tag) => `<span class="sk-tags-input__item" data-sk-tags-input-item data-value="${tag}">
        <span class="sk-tags-input__item-preview sk-tag" data-sk-tags-input-item-preview data-removable>
          <span class="sk-tags-input__item-text sk-tag__label" data-sk-tags-input-item-text>${tag}</span>
          <button class="sk-tags-input__item-remove sk-tag__remove sk-button sk-interactive" data-sk-tags-input-item-remove aria-label="Remove" type="button" data-variant="ghost" data-tone="neutral" data-size="sm" data-icon-only data-sk-button><span data-sk-icon="close" data-sk-icon-size="md"></span></button>
        </span>
        <input class="sk-tags-input__item-input" data-sk-tags-input-item-input type="text" hidden>
      </span>`,
    )
    .join("");

  document.body.innerHTML = `<div class="sk-tags-input" data-sk-tags-input data-delimiter=","${max}${allowDuplicates}${readOnly} data-name="topics">
    <div class="sk-tags-input__control" data-sk-tags-input-control>
      <span class="sk-tags-input__items" data-sk-tags-input-items>${items}</span>
      <input class="sk-tags-input__input" data-sk-tags-input-input aria-label="Topics" placeholder="Add one" type="text" autocomplete="off">
    </div>
    <input class="sk-tags-input__hidden" data-sk-tags-input-hidden type="text" hidden>
  </div>`;

  return document.body.firstElementChild as HTMLElement;
}

const tagsOf = (root: HTMLElement) =>
  Array.from(root.querySelectorAll(".sk-tags-input__item-text")).map((node) => node.textContent?.trim());

const entryOf = (root: HTMLElement) => within(root).getByRole("textbox", { name: "Topics" }) as HTMLInputElement;

/*
 * Typing takes a focus, a wait and an `input` event, for the reasons the React suite spells out:
 * `TYPE` is only handled once the machine is in `focused:input`, and Zag reads the entry through
 * `onInput`.
 *
 * `focusIn`, NOT `focus`: `@zag-js/svelte` maps `onFocus` to the `focusin` event, so a `focus` event
 * reaches nothing here even though it works in the React binding.
 */
const type = async (root: HTMLElement, value: string) => {
  const entry = entryOf(root);
  fireEvent.focusIn(entry);
  await waitFor(() => expect(entry.closest(".sk-tags-input__control")?.hasAttribute("data-focus")).toBe(true));
  fireEvent.input(entry, { target: { value } });
  return entry;
};

describe("TagsInput enhancer", () => {
  it("enhances an authored root, once", () => {
    const root = mount({ tags: ["react"] });
    expect(mountTagsInput(root)).toBe(1);
    expect(mountTagsInput(root)).toBe(0);
  });

  it("takes the authored tags over as its own value", () => {
    // The authored list is the seed: the enhancer reads it, then replaces it with the live one, so
    // the same tags are still there and there is only one of each.
    const root = mount({ tags: ["react", "svelte"] });
    mountTagsInput(root);

    expect(tagsOf(root)).toEqual(["react", "svelte"]);
    expect(root.querySelectorAll(".sk-tags-input__items")).toHaveLength(1);
  });

  it("keeps the authored accessible name on the entry", () => {
    const root = mount();
    mountTagsInput(root);

    expect(within(root).getByRole("textbox", { name: "Topics" })).toBeTruthy();
  });

  it("commits what was typed on Enter, whatever it is", async () => {
    const root = mount();
    mountTagsInput(root);

    const entry = await type(root, "astro");
    fireEvent.keyDown(entry, { key: "Enter" });

    await waitFor(() => expect(tagsOf(root)).toEqual(["astro"]));
  });

  it("commits on the delimiter too", async () => {
    const root = mount();
    mountTagsInput(root);

    const entry = await type(root, "astro");
    /* The delimiter arrives as its own input event, because that is how typing works. */
    fireEvent.input(entry, { target: { value: "astro," } });

    await waitFor(() => expect(tagsOf(root)).toEqual(["astro"]));
  });

  it("removes a tag from its own delete control", async () => {
    const root = mount({ tags: ["react", "svelte"] });
    mountTagsInput(root);

    fireEvent.click(within(root).getAllByRole("button", { name: "Remove" })[0]!);

    await waitFor(() => expect(tagsOf(root)).toEqual(["svelte"]));
  });

  it("drops a duplicate rather than adding it", async () => {
    const root = mount({ tags: ["react"] });
    mountTagsInput(root);

    const entry = await type(root, "react");
    fireEvent.keyDown(entry, { key: "Enter" });

    await waitFor(() => expect(entry.value).toBe(""));
    expect(tagsOf(root)).toEqual(["react"]);
  });

  it("takes duplicates when the markup asked for them", async () => {
    const root = mount({ tags: ["react"], allowDuplicates: true });
    mountTagsInput(root);

    const entry = await type(root, "react");
    fireEvent.keyDown(entry, { key: "Enter" });

    await waitFor(() => expect(tagsOf(root)).toEqual(["react", "react"]));
  });

  it("refuses a tag past max and leaves the text in the entry", async () => {
    const root = mount({ tags: ["react"], max: 1 });
    mountTagsInput(root);

    const entry = await type(root, "astro");
    fireEvent.keyDown(entry, { key: "Enter" });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(tagsOf(root)).toEqual(["react"]);
    expect(entry.value).toBe("astro");
  });

  it("dispatches the contract's own event on the root", async () => {
    const root = mount();
    mountTagsInput(root);
    const onEvent = vi.fn();
    root.addEventListener("sk:tagsinputvaluechange", onEvent);

    const entry = await type(root, "astro");
    fireEvent.keyDown(entry, { key: "Enter" });

    await waitFor(() => expect(onEvent).toHaveBeenCalled());
    expect((onEvent.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: ["astro"] });
  });

  it("carries the value on the hidden input, so a plain form submit works", () => {
    const root = mount({ tags: ["react", "svelte"] });
    mountTagsInput(root);

    const hidden = root.querySelector<HTMLInputElement>(".sk-tags-input__hidden");
    expect(hidden?.getAttribute("name")).toBe("topics");
    expect(hidden?.value).toBe("react, svelte");
  });
});
