import { fireEvent } from "@testing-library/dom";
import { flushSync } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import { mountListbox } from "./listbox.js";

const item = (value: string, label: string, extra = "") =>
  `<li class="sk-listbox__item" data-sk-listbox-item data-value="${value}" ${extra}>` +
  `<span class="sk-listbox__item-text" data-sk-listbox-item-text>${label}</span>` +
  `<span class="sk-listbox__item-indicator" data-sk-listbox-item-indicator aria-hidden="true"></span></li>`;

function mount(rootAttrs = "", items = [item("a", "Alfa"), item("b", "Beta"), item("c", "Gamma")]): HTMLElement {
  document.body.innerHTML = `<div class="sk-listbox" data-sk-listbox ${rootAttrs}>
    <span class="sk-listbox__label" data-sk-listbox-label>Letras</span>
    <ul class="sk-listbox__content" data-sk-listbox-content>${items.join("")}</ul>
  </div>`;
  expect(mountListbox(document)).toBe(1);
  flushSync();
  return document.querySelector<HTMLElement>("[data-sk-listbox]")!;
}

const options = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>("[role='option']")];
const selected = (root: HTMLElement) => options(root).filter((o) => o.getAttribute("aria-selected") === "true").map((o) => o.dataset.value);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Listbox (@zag-js/listbox), vanilla", () => {
  it("names the listbox with its label and starts from the options marked selected", () => {
    const root = mount("", [item("a", "Alfa"), item("b", "Beta", "data-default-selected"), item("c", "Gamma")]);
    const list = root.querySelector("[role='listbox']")!;

    expect(list.getAttribute("aria-labelledby")).toBe(root.querySelector("[data-sk-listbox-label]")!.id);
    expect(selected(root)).toEqual(["b"]);
  });

  it("replaces the choice in single mode and reports it", () => {
    const root = mount();
    const changes: string[][] = [];
    root.addEventListener("sk:listboxvaluechange", (e) => changes.push((e as CustomEvent).detail.value));

    fireEvent.click(options(root)[0]!);
    flushSync();
    fireEvent.click(options(root)[2]!);
    flushSync();

    expect(selected(root)).toEqual(["c"]);
    expect(changes).toEqual([["a"], ["c"]]);
  });

  it("toggles each option on its own in multiple mode", () => {
    const root = mount('data-selection-mode="multiple"');
    const list = root.querySelector("[role='listbox']")!;
    expect(list.getAttribute("aria-multiselectable")).toBe("true");

    fireEvent.click(options(root)[0]!);
    flushSync();
    fireEvent.click(options(root)[1]!);
    flushSync();
    fireEvent.click(options(root)[0]!);
    flushSync();

    expect(selected(root)).toEqual(["b"]);
  });

  it("never selects a disabled option", () => {
    const root = mount("", [item("a", "Alfa"), item("b", "Beta", "data-disabled")]);

    fireEvent.click(options(root)[1]!);
    flushSync();

    expect(options(root)[1]!.getAttribute("aria-disabled")).toBe("true");
    expect(selected(root)).toEqual([]);
  });
});
