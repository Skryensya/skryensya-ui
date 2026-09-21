import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TagsInput } from "./tags-input.js";

const tagsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".sk-tags-input__item-text")).map((node) => node.textContent);

/*
 * TYPING INTO THIS MACHINE TAKES THREE STEPS AND A TICK, and getting any of them wrong looks like
 * the component silently doing nothing:
 *
 *   - FOCUS FIRST, AND WAIT. `TYPE` is only handled in the machine's `focused:input` state, and the
 *     input's `onFocus` sends `FOCUS` inside a `queueMicrotask`. Typing in the same tick as the
 *     focus sends `TYPE` to `idle`, which drops it: the value never reaches the machine and Enter
 *     then commits an empty string.
 *   - `input`, NOT `change`. Zag reads the entry through `onInput`; a `change` event reaches
 *     nothing, even though the DOM value visibly updates.
 *   - The entry is UNCONTROLLED (Zag hands it a `defaultValue`), so the DOM value updating proves
 *     nothing about the machine having seen it.
 */
const type = async (entry: HTMLElement, value: string) => {
  entry.focus();
  await waitFor(() =>
    expect(entry.closest(".sk-tags-input__control")?.hasAttribute("data-focus")).toBe(true),
  );
  fireEvent.input(entry, { target: { value } });
};

const commit = (entry: HTMLElement) => fireEvent.keyDown(entry, { key: "Enter" });

describe("TagsInput", () => {
  it("renders the tags it starts with, as composed Tags", () => {
    // The chip is a Tag, not a drawing of one: the class is what says so.
    const ui = render(<TagsInput defaultValue={["react", "svelte"]} label="Topics" />);

    expect(tagsOf(ui.container)).toEqual(["react", "svelte"]);
    expect(ui.container.querySelector(".sk-tags-input__item-preview")?.className).toContain("sk-tag");
    expect(ui.container.querySelector(".sk-tags-input__item-text")?.className).toContain("sk-tag__label");
  });

  it("names the entry, which is the control a reader lands on", () => {
    const ui = render(<TagsInput label="Topics" placeholder="Add one" />);
    const entry = ui.getByRole("textbox", { name: "Topics" });

    expect(entry.className).toContain("sk-tags-input__input");
    expect(entry.getAttribute("placeholder")).toBe("Add one");
  });

  it("commits what was typed on Enter, whatever it is", async () => {
    // The difference from a Combobox: the vocabulary is the person's, not the page's.
    const onValueChange = vi.fn();
    const ui = render(<TagsInput label="Topics" onValueChange={onValueChange} />);

    const entry = ui.getByRole("textbox", { name: "Topics" });
    await type(entry, "astro");
    commit(entry);

    await waitFor(() => expect(tagsOf(ui.container)).toEqual(["astro"]));
    expect(onValueChange).toHaveBeenCalledWith({ value: ["astro"] });
  });

  it("commits on the delimiter too, which is what a pasted list has between its values", async () => {
    const ui = render(<TagsInput label="Topics" />);

    const entry = ui.getByRole("textbox", { name: "Topics" });
    await type(entry, "astro");
    /*
     * The delimiter arrives as its OWN input event, because that is how typing works: the machine
     * reads a value ending in the delimiter as "commit what came before it", and it only has what
     * the preceding `TYPE` events gave it. One event carrying "astro," commits nothing, which is
     * the shape of this bug when it is written as a single `fireEvent`.
     */
    fireEvent.input(entry, { target: { value: "astro," } });

    await waitFor(() => expect(tagsOf(ui.container)).toEqual(["astro"]));
  });

  it("removes a tag from its own delete control", async () => {
    const ui = render(<TagsInput defaultValue={["react", "svelte"]} label="Topics" removeLabel="Remove" />);

    fireEvent.click(ui.getAllByRole("button", { name: "Remove" })[0]!);

    await waitFor(() => expect(tagsOf(ui.container)).toEqual(["svelte"]));
  });

  it("drops a duplicate rather than adding it, and clears the entry anyway", async () => {
    // Measured against the machine: with `allowDuplicates` off the value is de-duplicated on the way
    // in, so nothing is announced and nothing is rejected. The tag simply does not appear twice.
    const onValueChange = vi.fn();
    const ui = render(<TagsInput defaultValue={["react"]} label="Topics" onValueChange={onValueChange} />);

    const entry = ui.getByRole("textbox", { name: "Topics" }) as HTMLInputElement;
    await type(entry, "react");
    commit(entry);

    await waitFor(() => expect(entry.value).toBe(""));
    expect(tagsOf(ui.container)).toEqual(["react"]);
  });

  it("takes duplicates when it was asked to", async () => {
    const ui = render(<TagsInput allowDuplicates defaultValue={["react"]} label="Topics" />);

    const entry = ui.getByRole("textbox", { name: "Topics" });
    await type(entry, "react");
    commit(entry);

    await waitFor(() => expect(tagsOf(ui.container)).toEqual(["react", "react"]));
  });

  it("refuses a tag past max and leaves the text in the entry", async () => {
    // The refusal is silent, and the entry keeping its text is the only signal there is: a page that
    // needs to say why counts the tags itself. Asserted here so the behaviour cannot change quietly.
    const ui = render(<TagsInput defaultValue={["react"]} label="Topics" max={1} />);

    const entry = ui.getByRole("textbox", { name: "Topics" }) as HTMLInputElement;
    await type(entry, "astro");
    commit(entry);

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(tagsOf(ui.container)).toEqual(["react"]);
    expect(entry.value).toBe("astro");
  });

  it("carries the value on the hidden input, so a plain form submit works", () => {
    const ui = render(<TagsInput defaultValue={["react", "svelte"]} label="Topics" name="topics" />);
    const hidden = ui.container.querySelector<HTMLInputElement>(".sk-tags-input__hidden");

    expect(hidden?.getAttribute("name")).toBe("topics");
    expect(hidden?.value).toBe("react, svelte");
  });

  it("dispatches the contract's own event beside the React callback", async () => {
    const onEvent = vi.fn();
    const ui = render(<TagsInput label="Topics" />);
    ui.container.firstElementChild?.addEventListener("sk:tagsinputvaluechange", onEvent);

    const entry = ui.getByRole("textbox", { name: "Topics" });
    await type(entry, "astro");
    commit(entry);

    await waitFor(() => expect(onEvent).toHaveBeenCalled());
    expect((onEvent.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: ["astro"] });
  });

  it("reflects read-only and invalid on the root, and leaves disabled off", () => {
    const ui = render(<TagsInput defaultValue={["react"]} invalid label="Topics" readOnly />);
    const root = ui.container.firstElementChild;

    expect(root?.getAttribute("data-invalid")).toBe("");
    expect(root?.getAttribute("data-readonly")).toBe("");
    expect(root?.hasAttribute("data-disabled")).toBe(false);
  });
});
