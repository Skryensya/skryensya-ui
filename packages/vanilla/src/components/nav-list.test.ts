import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountNavListGroup } from "./nav-list.js";

function markup({ defaultOpen = true }: { defaultOpen?: boolean } = {}) {
  document.body.innerHTML = `<nav class="sk-nav-list" data-orientation="vertical">
    <div class="sk-nav-list__group">
      <button
        type="button"
        class="sk-nav-list__group-label sk-interactive"
        data-sk-nav-list-group-trigger
        aria-expanded="${defaultOpen ? "true" : "false"}"
      >Configuración</button>
      <ul class="sk-nav-list__list" data-sk-nav-list-group-list ${defaultOpen ? "" : "hidden"}>
        <li class="sk-nav-list__item"><a class="sk-nav-list__link" href="/general">General</a></li>
      </ul>
    </div>
  </nav>`;
  const trigger = document.querySelector<HTMLButtonElement>("[data-sk-nav-list-group-trigger]")!;
  expect(mountNavListGroup(document)).toBe(1);
  return trigger;
}

const list = () => document.querySelector<HTMLElement>("[data-sk-nav-list-group-list]")!;

afterEach(() => {
  const trigger = document.querySelector<HTMLElement>("[data-sk-nav-list-group-trigger]");
  if (trigger) destroyMount(trigger);
  document.body.innerHTML = "";
});

describe("NavListGroup collapsible enhancer", () => {
  it("generates an id and wires aria-controls to the list, on mount", () => {
    const trigger = markup();
    const id = list().id;
    expect(id).not.toBe("");
    expect(trigger.getAttribute("aria-controls")).toBe(id);
  });

  it("preserves an authored id instead of generating a second one", () => {
    document.body.innerHTML = `<nav class="sk-nav-list"><div class="sk-nav-list__group">
      <button type="button" data-sk-nav-list-group-trigger aria-expanded="true">Config</button>
      <ul id="settings-list" data-sk-nav-list-group-list><li>x</li></ul>
    </div></nav>`;
    expect(mountNavListGroup(document)).toBe(1);
    expect(document.querySelector("[data-sk-nav-list-group-trigger]")!.getAttribute("aria-controls")).toBe(
      "settings-list",
    );
  });

  it("toggles aria-expanded and the list's hidden state on click", () => {
    const trigger = markup({ defaultOpen: true });
    expect(list().hidden).toBe(false);

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(list().hidden).toBe(true);

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(list().hidden).toBe(false);
  });

  it("starts hidden when authored with aria-expanded=false", () => {
    markup({ defaultOpen: false });
    expect(list().hidden).toBe(true);
  });

  it("Enter/Space toggle it — native <button> behavior, nothing this enhancer has to wire itself", () => {
    const trigger = markup();
    // A native button already fires a "click" event for Enter/Space; this just confirms the
    // enhancer's own handler is the click listener, not something narrower.
    trigger.click();
    expect(list().hidden).toBe(true);
  });

  it("Escape closes the open dropdown from anywhere inside it and returns focus to the trigger", () => {
    const trigger = markup({ defaultOpen: true });
    const link = list().querySelector<HTMLAnchorElement>("a")!;
    link.focus();
    fireEvent.keyDown(link, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(list().hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  it("Escape does nothing when the dropdown is already closed", () => {
    const trigger = markup({ defaultOpen: false });
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});
