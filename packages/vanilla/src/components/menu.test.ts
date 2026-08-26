import { fireEvent } from "@testing-library/dom";
import { flushSync } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { getMenuApi } from "./menu-registry.js";
import { mountMenu } from "./menu.js";

/*
 * The exact shape `menuPopupTemplate`/`menuItemShape` emit (core/src/menu.ts): a `[data-sk-menu]`
 * root, a trigger, a positioner/content pair, plain-item/checkbox/radio/separator entries, and one
 * nested `[data-sk-menu]` standing in for a submenu entry. A whole menu where an item would be,
 * never a nested list inside one (see that file's header comment on why).
 */
function markup(): HTMLElement {
  document.body.innerHTML = `<div class="sk-menu" data-sk-menu aria-label="File actions">
    <button class="sk-button sk-interactive" data-sk-menu-trigger type="button">
      <span>Actions</span>
    </button>
    <div class="sk-menu__positioner" data-sk-menu-positioner>
      <div class="sk-menu__content" data-sk-menu-content>
        <div class="sk-menu__item sk-interactive" data-sk-menu-item data-value="new" data-value-text="New file">
          <span class="sk-menu__item-label" data-sk-menu-item-label>New file</span>
        </div>
        <div class="sk-menu__item sk-interactive" data-sk-menu-item data-value="delete" data-value-text="Delete" disabled>
          <span class="sk-menu__item-label" data-sk-menu-item-label>Delete</span>
        </div>
        <div class="sk-menu__item sk-interactive" data-sk-menu-item data-value="wrap" data-type="checkbox" data-value-text="Word wrap">
          <span class="sk-menu__item-label" data-sk-menu-item-label>Word wrap</span>
          <span class="sk-menu__item-indicator" data-sk-menu-item-indicator aria-hidden="true"></span>
        </div>
        <div class="sk-menu__item sk-interactive" data-sk-menu-item data-value="left" data-type="radio" data-group="align" data-value-text="Left">
          <span class="sk-menu__item-label" data-sk-menu-item-label>Left</span>
          <span class="sk-menu__item-indicator" data-sk-menu-item-indicator aria-hidden="true"></span>
        </div>
        <div class="sk-menu__item sk-interactive" data-sk-menu-item data-value="right" data-type="radio" data-group="align" data-value-text="Right">
          <span class="sk-menu__item-label" data-sk-menu-item-label>Right</span>
          <span class="sk-menu__item-indicator" data-sk-menu-item-indicator aria-hidden="true"></span>
        </div>
        <div class="sk-menu" data-sk-menu>
          <button class="sk-menu__item sk-interactive sk-anchor" data-sk-menu-trigger type="button">
            <span class="sk-menu__item-label" data-sk-menu-item-label>Share</span>
          </button>
          <div class="sk-menu__positioner" data-sk-menu-positioner data-sk-submenu>
            <div class="sk-menu__content" data-sk-menu-content>
              <div class="sk-menu__item sk-interactive" data-sk-menu-item data-value="email" data-value-text="Email">
                <span class="sk-menu__item-label" data-sk-menu-item-label>Email</span>
              </div>
            </div>
          </div>
        </div>
        <a class="sk-menu__item sk-interactive" data-sk-menu-item data-value="docs" data-value-text="Documentation" href="/docs">
          <span class="sk-menu__item-label" data-sk-menu-item-label>Documentation</span>
        </a>
      </div>
    </div>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-menu]")!;
  expect(mountMenu(document)).toBe(2); // the top-level root plus the nested submenu root
  flushSync();
  return root;
}

const trigger = (root: HTMLElement) => root.querySelector<HTMLButtonElement>(":scope > [data-sk-menu-trigger]")!;
const content = (root: HTMLElement) => root.querySelector<HTMLElement>(":scope > [data-sk-menu-positioner] > [data-sk-menu-content]")!;
const itemsOf = (root: HTMLElement) => Array.from(content(root).querySelectorAll<HTMLElement>(":scope > [data-sk-menu-item]"));
const itemByValue = (root: HTMLElement, value: string) =>
  itemsOf(root).find((node) => node.dataset.value === value)!;
const submenuRoot = (root: HTMLElement) => content(root).querySelector<HTMLElement>(":scope > [data-sk-menu]")!;
const isOpen = (root: HTMLElement) => getMenuApi(root)?.open ?? false;

/*
 * `@zag-js/dismissable`'s escape/outside-dismiss wiring (Escape, outside pointerdown) attaches its
 * document-level listeners behind `defer: true`. A real `requestAnimationFrame`, not a microtask -
 * and the outside-pointerdown path adds a SECOND deferred layer on top (`@zag-js/interact-outside`'s
 * own `defer` wrapper, then a `setTimeout(0)` before the actual `doc.addEventListener` call). A
 * `flushSync()` alone never reaches any of that: Escape needs one real frame, outside-pointerdown
 * needs two frames plus a macrotask before it will even see the press, then one more frame to react
 * to it. Measured empirically against this exact machine; see the two dismiss tests below.
 */
const tick = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const macrotask = () => new Promise<void>((r) => setTimeout(r, 0));
const dismissableReady = async () => {
  await tick();
  await tick();
  await macrotask();
};

afterEach(() => {
  // Submenu roots must be destroyed before their parent: `Menu.svelte`'s own `parent`/`instances`
  // lookup depends on the parent still being registered while a child cleans up.
  document.querySelectorAll<HTMLElement>("[data-sk-menu]").forEach((el) => destroyMount(el));
  document.body.innerHTML = "";
});

describe("Menu vanilla enhancer", () => {
  it("wires ARIA on mount and stays closed", () => {
    const root = markup();
    expect(trigger(root).getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger(root).getAttribute("aria-expanded")).toBe("false");
    expect(isOpen(root)).toBe(false);
  });

  it("opens on trigger click and closes on Escape, returning focus to the trigger", async () => {
    const root = markup();
    fireEvent.click(trigger(root));
    flushSync();
    expect(isOpen(root)).toBe(true);
    expect(trigger(root).getAttribute("aria-expanded")).toBe("true");
    await tick(); // lets the machine's own initial-focus effect move focus onto the content

    fireEvent.keyDown(content(root), { key: "Escape" });
    flushSync();
    expect(isOpen(root)).toBe(false);
    await tick(); // focus restoration to the trigger runs after the close transition, not inline with it
    expect(document.activeElement).toBe(trigger(root));
  });

  it("closes on an outside pointer press", async () => {
    const root = markup();
    fireEvent.click(trigger(root));
    flushSync();
    expect(isOpen(root)).toBe(true);
    await dismissableReady();

    fireEvent.pointerDown(document.body, { clientX: 5, clientY: 5 });
    flushSync();
    await tick();
    expect(isOpen(root)).toBe(false);
  });

  it("selecting a plain item emits sk-select with its value and closes the menu", () => {
    const root = markup();
    const handler = vi.fn();
    root.addEventListener("sk-select", handler);
    fireEvent.click(trigger(root));
    flushSync();

    fireEvent.click(itemByValue(root, "new"));
    flushSync();

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "new" } }));
    expect(isOpen(root)).toBe(false);
  });

  it("never fires sk-select for a disabled item, and the menu stays open", () => {
    const root = markup();
    const handler = vi.fn();
    root.addEventListener("sk-select", handler);
    fireEvent.click(trigger(root));
    flushSync();

    fireEvent.click(itemByValue(root, "delete"));
    flushSync();

    expect(handler).not.toHaveBeenCalled();
  });

  it("toggles a checkbox item's data-checked and emits sk-checked-change", () => {
    const root = markup();
    const handler = vi.fn();
    root.addEventListener("sk-checked-change", handler);
    const wrap = itemByValue(root, "wrap");
    fireEvent.click(trigger(root));
    flushSync();

    expect(wrap.hasAttribute("data-checked")).toBe(false);
    fireEvent.click(wrap);
    flushSync();

    expect(wrap.hasAttribute("data-checked")).toBe(true);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: "wrap", checked: true } }),
    );
  });

  it("keeps a radio group mutually exclusive within the same data-group", () => {
    const root = markup();
    const left = itemByValue(root, "left");
    const right = itemByValue(root, "right");
    fireEvent.click(trigger(root));
    flushSync();

    fireEvent.click(left);
    flushSync();
    expect(left.hasAttribute("data-checked")).toBe(true);
    expect(right.hasAttribute("data-checked")).toBe(false);

    // Choosing a radio option closes the menu, same as a plain command. Reopen for the second pick.
    fireEvent.click(trigger(root));
    flushSync();
    fireEvent.click(right);
    flushSync();
    expect(right.hasAttribute("data-checked")).toBe(true);
    expect(left.hasAttribute("data-checked")).toBe(false);
  });

  it("renders an href entry as a real anchor with role=menuitem", () => {
    const root = markup();
    const link = itemByValue(root, "docs");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("role")).toBe("menuitem");
  });

  it("ArrowDown moves the highlight through the item list, skipping the disabled one", async () => {
    const root = markup();
    fireEvent.click(trigger(root));
    flushSync();
    await tick(); // the machine focuses its own content before keyboard navigation does anything

    fireEvent.keyDown(content(root), { key: "ArrowDown" });
    flushSync();
    expect(itemByValue(root, "new").hasAttribute("data-highlighted")).toBe(true);

    // "delete" is disabled (see markup()); ArrowDown skips straight past it to "wrap".
    fireEvent.keyDown(content(root), { key: "ArrowDown" });
    flushSync();
    expect(itemByValue(root, "wrap").hasAttribute("data-highlighted")).toBe(true);
    expect(itemByValue(root, "new").hasAttribute("data-highlighted")).toBe(false);
    expect(itemByValue(root, "delete").hasAttribute("data-highlighted")).toBe(false);
  });

  it("nests a real second Menu instance for a submenu entry, closed until asked", () => {
    const root = markup();
    const sub = submenuRoot(root);
    expect(getMenuApi(sub)).toBeDefined();
    expect(isOpen(sub)).toBe(false);
    expect(trigger(sub).getAttribute("aria-haspopup")).toBe("menu");
  });

  it("selecting a submenu item closes the whole tree, parent included", () => {
    const root = markup();
    const sub = submenuRoot(root);
    fireEvent.click(trigger(root));
    flushSync();
    fireEvent.click(trigger(sub));
    flushSync();
    expect(isOpen(sub)).toBe(true);

    fireEvent.click(itemByValue(sub, "email"));
    flushSync();

    expect(isOpen(sub)).toBe(false);
    expect(isOpen(root)).toBe(false);
  });
});
