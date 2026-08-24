import { afterEach, describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountBreadcrumb } from "./breadcrumb.js";

function crumb(label: string, href: string): string {
  return `<li class="sk-breadcrumb__item">
    <a class="sk-breadcrumb__link" href="${href}" title="${label}">${label}</a>
    <span aria-hidden="true" class="sk-breadcrumb__separator">/</span>
  </li>`;
}

function current(label: string): string {
  return `<li class="sk-breadcrumb__item">
    <span aria-current="page" class="sk-breadcrumb__current">${label}</span>
  </li>`;
}

function markup(items: readonly string[], collapsedLabel?: string): void {
  document.body.innerHTML = `<nav aria-label="Breadcrumb" class="sk-breadcrumb" data-sk-breadcrumb
    ${collapsedLabel ? `data-collapsed-label="${collapsedLabel}"` : ""}>
    <ol class="sk-breadcrumb__list" role="list">${items.join("")}</ol>
  </nav>`;
}

function list(): HTMLOListElement {
  return document.querySelector<HTMLOListElement>(".sk-breadcrumb__list")!;
}

/** The real crumbs directly under the list, excluding the ellipsis `<li>` it sits beside. */
function topLevelItems(): HTMLElement[] {
  return Array.from(list().querySelectorAll<HTMLElement>(":scope > .sk-breadcrumb__item:not(.sk-breadcrumb__item--collapse)"));
}

/** Same, but only the ones the enhancer has not hidden. */
function visibleTopLevelItems(): HTMLElement[] {
  return topLevelItems().filter((item) => !item.hidden);
}

function labelOf(item: Element): string | null | undefined {
  return item.querySelector(".sk-breadcrumb__link, .sk-breadcrumb__current")?.textContent;
}

/**
 * jsdom does no layout, so both read 0 by default. The enhancer measures a CLONE of the list (see
 * breadcrumb.ts's own comment on why: the live list's items are flex-shrinkable, so its own
 * `scrollWidth` would never actually exceed `clientWidth`). The clone does not exist until mount,
 * so its `scrollWidth` is stubbed at the `HTMLOListElement.prototype` level instead of on one
 * instance, restored in `afterEach`.
 */
function forceOverflow(overflow: boolean): void {
  const root = document.querySelector<HTMLElement>("[data-sk-breadcrumb]")!;
  Object.defineProperty(root, "clientWidth", { configurable: true, value: 100 });
  Object.defineProperty(HTMLOListElement.prototype, "scrollWidth", {
    configurable: true,
    get: () => (overflow ? 500 : 50),
  });
}

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-breadcrumb]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
  delete (HTMLOListElement.prototype as { scrollWidth?: unknown }).scrollWidth;
});

describe("Breadcrumb collapse enhancer", () => {
  it("does nothing to a trail short enough that nothing is worth collapsing", () => {
    markup([crumb("Inicio", "/"), crumb("Categoría", "/c"), current("Producto")]);
    forceOverflow(true);
    expect(mountBreadcrumb(document)).toBe(1);

    const root = document.querySelector<HTMLElement>("[data-sk-breadcrumb]")!;
    expect(root.hasAttribute("data-sk-breadcrumb-ready")).toBe(false);
    expect(root.querySelector(".sk-breadcrumb__item--collapse")).toBeNull();
  });

  it("leaves a trail that fits on one line untouched", () => {
    markup([crumb("Inicio", "/"), crumb("A", "/a"), crumb("B", "/b"), current("Producto")]);
    forceOverflow(false);
    mountBreadcrumb(document);

    const ellipsis = document.querySelector<HTMLElement>(".sk-breadcrumb__item--collapse")!;
    expect(ellipsis.hidden).toBe(true);
    expect(visibleTopLevelItems().map(labelOf)).toEqual(["Inicio", "A", "B", "Producto"]);
  });

  it("opens a real Menu of the hidden ancestors when the trail does not fit", () => {
    markup([crumb("Inicio", "/"), crumb("A", "/a"), crumb("B", "/b"), current("Producto")], "Ver niveles ocultos");
    forceOverflow(true);
    mountBreadcrumb(document);

    const root = document.querySelector<HTMLElement>("[data-sk-breadcrumb]")!;
    expect(root.hasAttribute("data-sk-breadcrumb-ready")).toBe(true);

    const ellipsis = document.querySelector<HTMLElement>(".sk-breadcrumb__item--collapse")!;
    expect(ellipsis.hidden).toBe(false);
    expect(ellipsis.hasAttribute("data-sk-menu")).toBe(true);
    expect(ellipsis.classList.contains("sk-menu")).toBe(true);

    const trigger = ellipsis.querySelector<HTMLButtonElement>(".sk-breadcrumb__collapse-trigger")!;
    expect(trigger.getAttribute("aria-label")).toBe("Ver niveles ocultos");
    expect(trigger.hasAttribute("data-sk-menu-trigger")).toBe(true);
    // Zag's own trigger props, patched in by the mounted Menu machine.
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");

    const content = ellipsis.querySelector<HTMLElement>("[data-sk-menu-content]")!;
    expect(content.getAttribute("role")).toBe("menu");

    const menuItems = Array.from(content.querySelectorAll<HTMLElement>("[data-sk-menu-item]"));
    expect(menuItems).toHaveLength(2);
    expect(menuItems.map((item) => item.querySelector(".sk-menu__item-label")?.textContent)).toEqual(["A", "B"]);
    expect(menuItems.map((item) => item.tagName)).toEqual(["A", "A"]);
    expect(menuItems.map((item) => item.getAttribute("href"))).toEqual(["/a", "/b"]);
    expect(menuItems.every((item) => item.getAttribute("role") === "menuitem")).toBe(true);

    // The original crumbs are hidden, not moved: still direct children of the list, in place.
    expect(topLevelItems().map(labelOf)).toEqual(["Inicio", "A", "B", "Producto"]);
    expect(visibleTopLevelItems().map(labelOf)).toEqual(["Inicio", "Producto"]);
  });

  it("re-derives the collapse on every resize, expanding first so it never gets stuck", () => {
    let capturedCallback: ResizeObserverCallback | null = null;
    const OriginalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        capturedCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;

    markup([crumb("Inicio", "/"), crumb("A", "/a"), crumb("B", "/b"), current("Producto")]);
    forceOverflow(true);
    mountBreadcrumb(document);
    expect(document.querySelector<HTMLElement>(".sk-breadcrumb__item--collapse")!.hidden).toBe(false);

    // The container widened enough that the full trail now fits on one line.
    forceOverflow(false);
    capturedCallback!([] as ResizeObserverEntry[], {} as ResizeObserver);
    expect(document.querySelector<HTMLElement>(".sk-breadcrumb__item--collapse")!.hidden).toBe(true);
    expect(visibleTopLevelItems()).toHaveLength(4);

    // And narrows back: the ellipsis returns, still hiding the same two ancestors.
    forceOverflow(true);
    capturedCallback!([] as ResizeObserverEntry[], {} as ResizeObserver);
    const ellipsis = document.querySelector<HTMLElement>(".sk-breadcrumb__item--collapse")!;
    expect(ellipsis.hidden).toBe(false);
    expect(visibleTopLevelItems().map(labelOf)).toEqual(["Inicio", "Producto"]);

    globalThis.ResizeObserver = OriginalResizeObserver;
  });

  it("restores every crumb to visible on unmount", () => {
    markup([crumb("Inicio", "/"), crumb("A", "/a"), crumb("B", "/b"), current("Producto")]);
    forceOverflow(true);
    mountBreadcrumb(document);

    const root = document.querySelector<HTMLElement>("[data-sk-breadcrumb]")!;
    destroyMount(root);

    expect(root.hasAttribute("data-sk-breadcrumb-ready")).toBe(false);
    expect(root.querySelector(".sk-breadcrumb__item--collapse")).toBeNull();
    expect(visibleTopLevelItems().map(labelOf)).toEqual(["Inicio", "A", "B", "Producto"]);
  });
});
