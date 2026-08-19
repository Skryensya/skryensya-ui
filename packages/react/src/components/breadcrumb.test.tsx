import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "./breadcrumb.js";
import type { BreadcrumbItem } from "@skryensya/core/breadcrumb";

const longTrail: readonly BreadcrumbItem[] = [
  { label: "Inicio", href: "/" },
  { label: "A", href: "/a" },
  { label: "B", href: "/b" },
  { label: "Producto" },
];

/**
 * jsdom does no layout, so `nav.clientWidth` and the shadow list's `scrollWidth` — the pair the
 * component actually compares — both read 0 unless a test overrides them.
 */
function forceOverflow(container: HTMLElement, overflow: boolean): void {
  const nav = container.querySelector<HTMLElement>(".sk-breadcrumb")!;
  const shadow = container.querySelector<HTMLOListElement>('.sk-breadcrumb__list[aria-hidden="true"]')!;
  Object.defineProperty(nav, "clientWidth", { configurable: true, value: 100 });
  Object.defineProperty(shadow, "scrollWidth", { configurable: true, value: overflow ? 500 : 100 });
}

function visibleList(container: HTMLElement): HTMLOListElement {
  return container.querySelector<HTMLOListElement>('.sk-breadcrumb__list:not([aria-hidden="true"])')!;
}

/** Swaps in a ResizeObserver stub that hands back its callback, so a test can fire it directly. */
function captureResizeObserver(): { fire: () => void } {
  let callback: ResizeObserverCallback | null = null;
  const Original = globalThis.ResizeObserver;
  class Stub {
    constructor(cb: ResizeObserverCallback) {
      callback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = Stub as unknown as typeof ResizeObserver;
  return {
    fire: () => {
      globalThis.ResizeObserver = Original;
      act(() => callback!([] as ResizeObserverEntry[], {} as ResizeObserver));
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Breadcrumb", () => {
  it("renders a plain, uncollapsed trail when it is short enough that nothing is worth collapsing", () => {
    const ui = render(
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Categoría", href: "/c" }, { label: "Producto" }]} />,
    );
    expect(ui.container.querySelector(".sk-breadcrumb__item--collapse")).toBeNull();
    expect(ui.getByText("Producto").getAttribute("aria-current")).toBe("page");
  });

  it("opens a real Menu of the hidden ancestors when the trail overflows its container", () => {
    const resize = captureResizeObserver();
    const ui = render(<Breadcrumb collapsedLabel="Ver niveles ocultos" items={longTrail} />);
    forceOverflow(ui.container, true);
    resize.fire();

    const trigger = ui.container.querySelector<HTMLButtonElement>(".sk-breadcrumb__collapse-trigger")!;
    expect(trigger.getAttribute("aria-label")).toBe("Ver niveles ocultos");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");

    // `MenuPopup` portals to `document.body` by default, outside `ui.container`.
    const content = document.querySelector<HTMLElement>('[role="menu"]')!;
    expect(content.className).toContain("sk-menu__content");

    const menuItems = Array.from(content.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    expect(menuItems.map((item) => item.querySelector(".sk-menu__item-label")?.textContent)).toEqual(["A", "B"]);
    expect(menuItems.map((item) => item.tagName)).toEqual(["A", "A"]);
    expect(menuItems.map((item) => item.getAttribute("href"))).toEqual(["/a", "/b"]);

    // First and current stay in the main list, on either side of the ellipsis.
    const topLevel = Array.from(visibleList(ui.container).children).filter(
      (el) => !el.classList.contains("sk-breadcrumb__item--collapse"),
    );
    expect(topLevel.map((el) => el.textContent)).toEqual(["Inicio/", "Producto"]);
  });

  it("leaves a trail that fits on one line uncollapsed", () => {
    const resize = captureResizeObserver();
    const ui = render(<Breadcrumb items={longTrail} />);
    forceOverflow(ui.container, false);
    resize.fire();

    expect(ui.container.querySelector(".sk-breadcrumb__item--collapse")).toBeNull();
    // `aria-hidden` on the shadow list excludes its 3 duplicate links from this query.
    expect(ui.getAllByRole("link")).toHaveLength(3);
  });

  it("re-measures on every resize, even shrinking from an already-expanded state", () => {
    const resize = captureResizeObserver();
    const ui = render(<Breadcrumb items={longTrail} />);

    // Starts expanded (nothing overflows in jsdom by default) and the container then shrinks.
    expect(ui.container.querySelector(".sk-breadcrumb__item--collapse")).toBeNull();
    forceOverflow(ui.container, true);
    resize.fire();
    expect(ui.container.querySelector(".sk-breadcrumb__item--collapse")).not.toBeNull();
  });
});
