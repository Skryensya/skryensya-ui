import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountMegamenu } from "./megamenu.js";

/*
 * The exact shape `megamenuContract`'s template (core/src/megamenu.ts) emits: a `<nav>` root, a
 * `<ul>` of `<li>` items each holding a trigger and its OWN positioner/content pair. The enhancer
 * collapses these N pairs into one shared panel at connect time (see megamenu.ts's own header
 * comment), which is exactly the behavior under test here. "Products" carries both a links column
 * and an image column (for the preview-swap tests); "Resources" is links-only.
 */
function markup(): HTMLElement {
  document.body.innerHTML = `<nav data-sk-megamenu aria-label="Main">
    <ul class="sk-megamenu__list" role="list">
      <li class="sk-megamenu__item">
        <button data-sk-megamenu-trigger type="button" aria-expanded="false">Products</button>
        <div data-sk-megamenu-positioner>
          <div data-sk-megamenu-content>
            <div class="sk-nav-list__group">
              <a class="sk-nav-list__link" href="/overview" data-sk-megamenu-preview="/overview.jpg" data-sk-megamenu-preview-alt="Overview">Overview</a>
              <a class="sk-nav-list__link" href="/pricing" data-sk-megamenu-preview="/pricing.jpg" data-sk-megamenu-preview-alt="Pricing">Pricing</a>
            </div>
            <div class="sk-image-frame">
              <img class="sk-image-frame__media" src="/default.jpg" alt="Default" />
            </div>
          </div>
        </div>
      </li>
      <li class="sk-megamenu__item">
        <button data-sk-megamenu-trigger type="button" aria-expanded="false">Resources</button>
        <div data-sk-megamenu-positioner>
          <div data-sk-megamenu-content>
            <div class="sk-nav-list__group">
              <a class="sk-nav-list__link" href="/docs">Documentation</a>
              <a class="sk-nav-list__link" href="/guides">Guides</a>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </nav>`;
  const root = document.body.firstElementChild as HTMLElement;
  expect(mountMegamenu(document)).toBe(1);
  return root;
}

const triggers = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>("[data-sk-megamenu-trigger]"));
const sharedContent = (root: HTMLElement) => root.querySelector<HTMLElement>("[data-sk-megamenu-content]")!;
const visiblePanel = (root: HTMLElement) => sharedContent(root).querySelector<HTMLElement>(".sk-megamenu__panel--visible")!;
const isOpen = (root: HTMLElement, index: number) => triggers(root)[index]!.getAttribute("aria-expanded") === "true";

afterEach(() => {
  // Without this, `connect()`'s own document-level `pointerdown` capture listener and any pending
  // hover-intent `setTimeout` outlive the test that scheduled them. A REAL timer installed before a
  // later test switches to `vi.useFakeTimers()` is untouched by that switch (fake timers only affect
  // NEW scheduling calls), so it can still fire mid-suite and touch a root a later test never
  // expected touched. Found via a genuine order-dependent flake: this file's first test passed in
  // isolation but failed only as part of the full suite, on `dataset.state` reading "closed" instead
  // of `undefined` on a just-mounted root.
  const root = document.querySelector<HTMLElement>("[data-sk-megamenu]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("Megamenu vanilla enhancer", () => {
  it("collapses the N authored positioners into one shared panel, sized by a hidden ruler", () => {
    const root = markup();
    expect(root.querySelectorAll("[data-sk-megamenu-positioner]")).toHaveLength(1);
    expect(root.querySelectorAll("[data-sk-megamenu-content]")).toHaveLength(1);
    expect(sharedContent(root).querySelector(".sk-megamenu__ruler")).not.toBeNull();
    expect(sharedContent(root).querySelectorAll(".sk-megamenu__ruler > .sk-megamenu__panel")).toHaveLength(2);
    for (const trigger of triggers(root)) {
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      // The Disclosure (Navigation) pattern this component deliberately follows instead of Menu
      // Button (core/megamenu.ts's own header comment) never carries `aria-haspopup`/`role="menu"`
      //. A screen reader announces "button, collapsed", never "has a menu", and Tab still walks
      // through the panel's own links in normal document order. Guards against a regression that
      // "helpfully" adds Menu-pattern ARIA here, which would silently break that assumption.
      expect(trigger.hasAttribute("aria-haspopup")).toBe(false);
    }
    // Seeded at connect time, not left absent until the first open/close (megamenu.ts's own
    // comment on why): `megamenu.css`'s `[data-state="open"]` rule has nothing to gate against
    // otherwise, and the panel needs its `display: none` default from the very first paint.
    expect(sharedContent(root).dataset.state).toBe("closed");
  });

  it("clicking a trigger opens its panel with that trigger's own columns", () => {
    const root = markup();
    fireEvent.click(triggers(root)[0]!);

    expect(isOpen(root, 0)).toBe(true);
    expect(sharedContent(root).dataset.state).toBe("open");
    expect(visiblePanel(root).textContent).toContain("Overview");
  });

  it("clicking the SAME trigger again closes it. A toggle", () => {
    const root = markup();
    fireEvent.click(triggers(root)[0]!);
    fireEvent.click(triggers(root)[0]!);

    expect(isOpen(root, 0)).toBe(false);
    expect(sharedContent(root).dataset.state).toBe("closed");
  });

  it("clicking a DIFFERENT trigger switches the shared panel's content, exclusively", () => {
    const root = markup();
    fireEvent.click(triggers(root)[0]!);
    fireEvent.click(triggers(root)[1]!);

    expect(isOpen(root, 0)).toBe(false);
    expect(isOpen(root, 1)).toBe(true);
    expect(sharedContent(root).dataset.state).toBe("open");
    expect(visiblePanel(root).textContent).toContain("Documentation");
    expect(visiblePanel(root).textContent).not.toContain("Overview");
  });

  it("opens on hover intent after its delay, not immediately", () => {
    vi.useFakeTimers();
    const root = markup();
    fireEvent.pointerEnter(triggers(root)[0]!);
    expect(isOpen(root, 0)).toBe(false);

    vi.advanceTimersByTime(150);
    expect(isOpen(root, 0)).toBe(true);
  });

  it("cancels the open-intent timer when the pointer leaves before the delay elapses", () => {
    vi.useFakeTimers();
    const root = markup();
    fireEvent.pointerEnter(triggers(root)[0]!);
    fireEvent.pointerLeave(triggers(root)[0]!);
    vi.advanceTimersByTime(150);

    expect(isOpen(root, 0)).toBe(false);
  });

  it("closes on hover intent after its own delay once the pointer leaves both trigger and panel", () => {
    vi.useFakeTimers();
    const root = markup();
    fireEvent.click(triggers(root)[0]!);
    fireEvent.pointerLeave(triggers(root)[0]!);
    vi.advanceTimersByTime(150);

    expect(isOpen(root, 0)).toBe(false);
    expect(sharedContent(root).dataset.state).toBe("closed");
  });

  it("re-entering the shared panel cancels its pending close", () => {
    vi.useFakeTimers();
    const root = markup();
    fireEvent.click(triggers(root)[0]!);
    fireEvent.pointerLeave(triggers(root)[0]!);
    const positioner = root.querySelector<HTMLElement>("[data-sk-megamenu-positioner]")!;
    fireEvent.pointerEnter(positioner);
    vi.advanceTimersByTime(150);

    expect(isOpen(root, 0)).toBe(true);
  });

  it("Escape closes the open panel and returns focus to its trigger", () => {
    const root = markup();
    fireEvent.click(triggers(root)[0]!);
    fireEvent.keyDown(root, { key: "Escape" });

    expect(isOpen(root, 0)).toBe(false);
    expect(document.activeElement).toBe(triggers(root)[0]);
  });

  it("focus leaving the whole bar closes the open panel", () => {
    const root = markup();
    fireEvent.click(triggers(root)[0]!);
    fireEvent.focusOut(root, { relatedTarget: document.body });

    expect(isOpen(root, 0)).toBe(false);
  });

  it("focus moving from a trigger into its own (portalled-out) panel does NOT close it", () => {
    const root = markup();
    fireEvent.click(triggers(root)[0]!);
    const link = visiblePanel(root).querySelector<HTMLAnchorElement>(".sk-nav-list__link")!;
    fireEvent.focusOut(root, { relatedTarget: link });

    expect(isOpen(root, 0)).toBe(true);
  });

  it("hovering a preview link swaps the image, reverting once every preview link is left", () => {
    const root = markup();
    fireEvent.click(triggers(root)[0]!);
    const img = visiblePanel(root).querySelector<HTMLImageElement>(".sk-image-frame__media")!;
    const [overview, pricing] = Array.from(visiblePanel(root).querySelectorAll<HTMLAnchorElement>(".sk-nav-list__link"));

    fireEvent.pointerOver(overview!);
    expect(img.src).toContain("/overview.jpg");
    expect(img.alt).toBe("Overview");

    // Moving to a DIFFERENT preview link swaps again, not reverting to the default in between.
    fireEvent.pointerOut(overview!, { relatedTarget: pricing });
    fireEvent.pointerOver(pricing!);
    expect(img.src).toContain("/pricing.jpg");

    fireEvent.pointerOut(pricing!, { relatedTarget: root });
    expect(img.src).toContain("/default.jpg");
    expect(img.alt).toBe("Default");
  });
});
