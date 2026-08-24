import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Megamenu, MegamenuTrigger } from "./megamenu.js";
import { ImageFrame } from "./image-frame.js";

/** The hover-intent timers call `setState` outside any React event handler `act()` already wraps
 *  `fireEvent` in. Advancing them has to be wrapped explicitly, or the resulting DOM update isn't
 *  guaranteed to have committed by the time the very next assertion reads it. */
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

/*
 * Same fixture shape as the vanilla suite (`megamenu.test.ts`): "Products" carries a links column
 * plus an `ImageFrame` column (for the preview-swap tests), "Resources" is links-only.
 */
function Fixture() {
  return (
    <Megamenu label="Main">
      <MegamenuTrigger
        columns={[
          <div key="links">
            <a key="overview" href="/overview" data-sk-megamenu-preview="/overview.jpg" data-sk-megamenu-preview-alt="Overview">
              Overview
            </a>
            <a key="pricing" href="/pricing" data-sk-megamenu-preview="/pricing.jpg" data-sk-megamenu-preview-alt="Pricing">
              Pricing
            </a>
          </div>,
          <ImageFrame key="image" src="/default.jpg" alt="Default" />,
        ]}
      >
        Products
      </MegamenuTrigger>
      <MegamenuTrigger
        columns={[
          <div key="links">
            <a key="docs" href="/docs">
              Documentation
            </a>
            <a key="guides" href="/guides">
              Guides
            </a>
          </div>,
        ]}
      >
        Resources
      </MegamenuTrigger>
    </Megamenu>
  );
}

const trigger = (ui: ReturnType<typeof render>, name: string) => ui.getByRole("button", { name });
const content = () => document.querySelector<HTMLElement>("[data-sk-megamenu-content]")!;
const visiblePanel = () => content().querySelector<HTMLElement>(".sk-megamenu__panel--visible")!;

describe("Megamenu (React)", () => {
  it("renders one shared panel, sized by a hidden ruler holding every trigger's columns", () => {
    const ui = render(<Fixture />);
    expect(document.querySelectorAll("[data-sk-megamenu-content]")).toHaveLength(1);
    expect(content().querySelector(".sk-megamenu__ruler")).not.toBeNull();
    expect(content().querySelectorAll(".sk-megamenu__ruler > .sk-megamenu__panel")).toHaveLength(2);
    expect(trigger(ui, "Products").getAttribute("aria-expanded")).toBe("false");
    expect(trigger(ui, "Resources").getAttribute("aria-expanded")).toBe("false");
    // The Disclosure (Navigation) pattern this component deliberately follows instead of Menu
    // Button (core/megamenu.ts's own header comment) never carries `aria-haspopup`/`role="menu"` -
    // a screen reader announces "button, collapsed", never "has a menu", and Tab still walks
    // through the panel's own links in normal document order. Guards against a regression that
    // "helpfully" adds Menu-pattern ARIA here, which would silently break that assumption.
    expect(trigger(ui, "Products").hasAttribute("aria-haspopup")).toBe(false);
  });

  it("clicking a trigger opens its panel with that trigger's own columns", () => {
    const ui = render(<Fixture />);
    fireEvent.click(trigger(ui, "Products"));

    expect(trigger(ui, "Products").getAttribute("aria-expanded")).toBe("true");
    expect(content().dataset.state).toBe("open");
    expect(visiblePanel().textContent).toContain("Overview");
  });

  it("clicking the SAME trigger again closes it. A toggle", () => {
    const ui = render(<Fixture />);
    fireEvent.click(trigger(ui, "Products"));
    fireEvent.click(trigger(ui, "Products"));

    expect(trigger(ui, "Products").getAttribute("aria-expanded")).toBe("false");
    expect(content().dataset.state).toBe("closed");
  });

  it("clicking a DIFFERENT trigger switches the shared panel's content, exclusively", () => {
    const ui = render(<Fixture />);
    fireEvent.click(trigger(ui, "Products"));
    fireEvent.click(trigger(ui, "Resources"));

    expect(trigger(ui, "Products").getAttribute("aria-expanded")).toBe("false");
    expect(trigger(ui, "Resources").getAttribute("aria-expanded")).toBe("true");
    expect(visiblePanel().textContent).toContain("Documentation");
    expect(visiblePanel().textContent).not.toContain("Overview");
  });

  it("opens on hover intent after its delay, not immediately", () => {
    vi.useFakeTimers();
    const ui = render(<Fixture />);
    fireEvent.pointerEnter(trigger(ui, "Products"));
    expect(trigger(ui, "Products").getAttribute("aria-expanded")).toBe("false");

    advance(150);
    expect(trigger(ui, "Products").getAttribute("aria-expanded")).toBe("true");
    vi.useRealTimers();
  });

  it("cancels the open-intent timer when the pointer leaves before the delay elapses", () => {
    vi.useFakeTimers();
    const ui = render(<Fixture />);
    fireEvent.pointerEnter(trigger(ui, "Products"));
    fireEvent.pointerLeave(trigger(ui, "Products"));
    advance(150);

    expect(trigger(ui, "Products").getAttribute("aria-expanded")).toBe("false");
    vi.useRealTimers();
  });

  it("closes on hover intent after its own delay once the pointer leaves both trigger and panel", () => {
    vi.useFakeTimers();
    const ui = render(<Fixture />);
    fireEvent.click(trigger(ui, "Products"));
    fireEvent.pointerLeave(trigger(ui, "Products"));
    advance(150);

    expect(trigger(ui, "Products").getAttribute("aria-expanded")).toBe("false");
    expect(content().dataset.state).toBe("closed");
    vi.useRealTimers();
  });

  it("re-entering the shared panel cancels its pending close", () => {
    vi.useFakeTimers();
    const ui = render(<Fixture />);
    fireEvent.click(trigger(ui, "Products"));
    fireEvent.pointerLeave(trigger(ui, "Products"));
    const positioner = document.querySelector<HTMLElement>("[data-sk-megamenu-positioner]")!;
    fireEvent.pointerEnter(positioner);
    advance(150);

    expect(trigger(ui, "Products").getAttribute("aria-expanded")).toBe("true");
    vi.useRealTimers();
  });

  it("Escape closes the open panel and returns focus to its trigger", () => {
    const ui = render(<Fixture />);
    const productsTrigger = trigger(ui, "Products");
    fireEvent.click(productsTrigger);
    fireEvent.keyDown(productsTrigger, { key: "Escape" });

    expect(productsTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(productsTrigger);
  });

  it("focus leaving the whole bar closes the open panel", () => {
    const ui = render(<Fixture />);
    fireEvent.click(trigger(ui, "Products"));
    fireEvent.blur(trigger(ui, "Products"), { relatedTarget: document.body });

    expect(trigger(ui, "Products").getAttribute("aria-expanded")).toBe("false");
  });

  it("focus moving from a trigger into its own (portalled-out) panel does NOT close it", () => {
    const ui = render(<Fixture />);
    const productsTrigger = trigger(ui, "Products");
    fireEvent.click(productsTrigger);
    const link = visiblePanel().querySelector("a")!;
    fireEvent.blur(productsTrigger, { relatedTarget: link });

    expect(productsTrigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("hovering a preview link swaps the image, reverting once every preview link is left", () => {
    const ui = render(<Fixture />);
    fireEvent.click(trigger(ui, "Products"));
    const img = visiblePanel().querySelector<HTMLImageElement>(".sk-image-frame__media")!;
    const [overview, pricing] = Array.from(visiblePanel().querySelectorAll<HTMLAnchorElement>("a"));

    fireEvent.pointerOver(overview!);
    expect(img.src).toContain("/overview.jpg");
    expect(img.alt).toBe("Overview");

    fireEvent.pointerOut(overview!, { relatedTarget: pricing });
    fireEvent.pointerOver(pricing!);
    expect(img.src).toContain("/pricing.jpg");

    const root = document.querySelector<HTMLElement>("nav[aria-label='Main']")!;
    fireEvent.pointerOut(pricing!, { relatedTarget: root });
    expect(img.src).toContain("/default.jpg");
    expect(img.alt).toBe("Default");
  });
});
