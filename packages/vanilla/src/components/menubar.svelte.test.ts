import { fireEvent } from "@testing-library/dom";
import { flushSync } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { getMenuApi } from "./Menu.svelte";
import { mountMenu } from "./menu.js";
import { mountMenubar } from "./menubar.js";

/*
 * A 3-item bar matching WAI's own `menubar-editor` shape: "Archivo" (2 commands), "Editar" (2
 * commands), "Ayuda" (a direct command, no dropdown — the leaf-item case). Each dropdown is now a
 * real `[data-sk-menu]` root — the exact markup `menuPopupTemplate`/`menuItemShape` emit — mounted by
 * `mountMenu`, the same enhancer any standalone Menu uses. `.svelte.test.ts`, not `.test.ts`: this
 * needs the real Svelte runtime now that a dropdown is Zag-machine-backed, not a plain hidden toggle.
 */
function markup() {
  document.body.innerHTML = `<div class="sk-menubar" data-sk-menubar role="menubar" aria-label="Editor">
    <div class="sk-menubar__item-wrapper" data-sk-menu>
      <button type="button" role="menuitem" data-sk-menubar-item data-sk-menu-trigger>Archivo</button>
      <div data-sk-menu-positioner>
        <div data-sk-menu-content role="menu">
          <div data-sk-menu-item data-value="new"><span data-sk-menu-item-label>Nuevo</span></div>
          <div data-sk-menu-item data-value="open"><span data-sk-menu-item-label>Abrir</span></div>
        </div>
      </div>
    </div>
    <div class="sk-menubar__item-wrapper" data-sk-menu>
      <button type="button" role="menuitem" data-sk-menubar-item data-sk-menu-trigger>Editar</button>
      <div data-sk-menu-positioner>
        <div data-sk-menu-content role="menu">
          <div data-sk-menu-item data-value="cut"><span data-sk-menu-item-label>Cortar</span></div>
          <div data-sk-menu-item data-value="paste"><span data-sk-menu-item-label>Pegar</span></div>
        </div>
      </div>
    </div>
    <div class="sk-menubar__item-wrapper" data-sk-menu>
      <button type="button" role="menuitem" data-sk-menubar-item data-sk-menu-trigger>Ayuda</button>
    </div>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-menubar]")!;
  expect(mountMenu(document)).toBe(3);
  expect(mountMenubar(document)).toBe(1);
  flushSync();
  return root;
}

const items = () => Array.from(document.querySelectorAll<HTMLButtonElement>("[data-sk-menubar-item]"));
const archivo = () => items()[0]!;
const editar = () => items()[1]!;
const ayuda = () => items()[2]!;
const wrapperOf = (trigger: HTMLElement) => trigger.closest<HTMLElement>("[data-sk-menu]")!;
const isOpen = (trigger: HTMLElement) => getMenuApi(wrapperOf(trigger))?.open ?? false;
const contentOf = (trigger: HTMLElement) => wrapperOf(trigger).querySelector<HTMLElement>("[data-sk-menu-content]");
const menuItemsOf = (trigger: HTMLElement) =>
  Array.from(contentOf(trigger)?.querySelectorAll<HTMLElement>("[data-sk-menu-item]") ?? []);

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-menubar]");
  if (root) destroyMount(root);
  document.querySelectorAll<HTMLElement>("[data-sk-menu]").forEach((el) => destroyMount(el));
  document.body.innerHTML = "";
});

describe("Menubar vanilla enhancer, dropdowns as real Menu instances", () => {
  it("gives exactly one top-level item a tab stop on mount; the leaf item gets no menu wiring", () => {
    const root = markup();
    const stops = items().filter((item) => item.tabIndex === 0);
    expect(stops).toEqual([archivo()]);
    expect(root.getAttribute("role")).toBe("menubar");
    expect(ayuda().hasAttribute("aria-haspopup")).toBe(false);
    expect(archivo().getAttribute("aria-haspopup")).toBe("menu");
  });

  it("Right/Left move between top-level items, wrapping, without opening anything", () => {
    const root = markup();
    archivo().focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(document.activeElement).toBe(editar());
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(ayuda()); // wrapped
    expect(isOpen(archivo())).toBe(false);
  });

  it("clicking a trigger opens its own dropdown via Zag, wired through data-sk-menu-trigger", () => {
    const root = markup();
    fireEvent.click(archivo());
    flushSync();
    expect(isOpen(archivo())).toBe(true);
    expect(root).toBeTruthy(); // keeps `root` referenced for the afterEach cleanup lookup
  });

  it("clicking a sibling trigger while one dropdown is open closes the first", () => {
    markup();
    fireEvent.click(archivo());
    flushSync();
    expect(isOpen(archivo())).toBe(true);
    fireEvent.click(editar());
    flushSync();
    expect(isOpen(archivo())).toBe(false);
    expect(isOpen(editar())).toBe(true);
  });

  it("moving Right/Left while a dropdown is open closes it and opens the adjacent item's dropdown", () => {
    const root = markup();
    fireEvent.click(archivo());
    flushSync();
    expect(isOpen(archivo())).toBe(true);
    contentOf(archivo())!.focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    flushSync();
    expect(isOpen(archivo())).toBe(false);
    expect(isOpen(editar())).toBe(true);
  });

  it("moving to the leaf item (no dropdown) while one was open just closes it — no dropdown to open", () => {
    const root = markup();
    fireEvent.click(editar());
    flushSync();
    expect(isOpen(editar())).toBe(true);
    contentOf(editar())!.focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    flushSync();
    expect(isOpen(editar())).toBe(false);
    expect(document.activeElement).toBe(ayuda());
  });

  it("Left/Right inside an open dropdown's own item list are the bar's business only via handoff, not item navigation", () => {
    // Sanity check on the new division of labor: the bar's own items are exposed for Menu's machine
    // to navigate (Down/Up), not this file's concern — verified indirectly by menuItemsOf() finding
    // the authored items Menu.svelte reads.
    markup();
    expect(menuItemsOf(archivo())).toHaveLength(2);
    expect(menuItemsOf(editar())).toHaveLength(2);
    expect(menuItemsOf(ayuda())).toHaveLength(0);
  });

  /*
   * `menuItemShape`'s `href` (menu.ts) is what a menubar dropdown needs for real navigation
   * entries — this is Menu's own behavior, not menubar-specific, so it mounts a standalone
   * `[data-sk-menu]` (the exact shape `menuPopupTemplate` now emits for an item with `href`)
   * rather than reusing the bar fixture above.
   */
  it("wires role=menuitem onto an authored <a> item the same as a <div> command", () => {
    document.body.innerHTML = `<div class="sk-menu" data-sk-menu aria-label="Ir a">
      <button type="button" data-sk-menu-trigger>Ir a</button>
      <div data-sk-menu-positioner>
        <div data-sk-menu-content role="menu">
          <a data-sk-menu-item data-value="docs" href="/docs"><span data-sk-menu-item-label>Documentación</span></a>
        </div>
      </div>
    </div>`;
    const root = document.querySelector<HTMLElement>("[data-sk-menu]")!;
    expect(mountMenu(document)).toBe(1);
    flushSync();
    const link = document.querySelector<HTMLAnchorElement>("[data-sk-menu-item]")!;
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("role")).toBe("menuitem");
    destroyMount(root);
  });

  /*
   * `nav: true` (`menubar.ts`) only swaps the trigger's CLASSES for `nav-list`'s own
   * (`sk-nav-list__link`/`__label` instead of `sk-button`) — the enhancer's own attachment is
   * class-agnostic (`data-sk-menubar-item`/roles only), so the exact same behavior the plain-bar
   * tests above already cover should hold unchanged on this markup too.
   */
  it("wires up identically when the trigger is nav-list's own link instead of a Button", () => {
    document.body.innerHTML = `<div class="sk-menubar" data-sk-menubar role="menubar" aria-label="Principal">
      <div class="sk-menubar__item-wrapper sk-menu" data-sk-menu>
        <button type="button" role="menuitem" class="sk-nav-list__link" data-sk-menubar-item data-sk-menu-trigger>
          <span class="sk-nav-list__label">Inicio</span>
        </button>
        <div data-sk-menu-positioner>
          <div data-sk-menu-content role="menu">
            <a data-sk-menu-item data-value="docs" href="/docs"><span data-sk-menu-item-label>Documentación</span></a>
          </div>
        </div>
      </div>
    </div>`;
    const root = document.querySelector<HTMLElement>("[data-sk-menubar]")!;
    expect(mountMenu(document)).toBe(1);
    expect(mountMenubar(document)).toBe(1);
    flushSync();
    const trigger = document.querySelector<HTMLButtonElement>("[data-sk-menubar-item]")!;
    expect(trigger.tabIndex).toBe(0);
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    fireEvent.click(trigger);
    flushSync();
    expect(isOpen(trigger)).toBe(true);
    destroyMount(root);
  });
});
