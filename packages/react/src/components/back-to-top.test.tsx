import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackToTop } from "./back-to-top.js";

/*
 * The React half of the same contract `connectBackToTop` realizes. jsdom gives neither a settable
 * scroll position nor `matchMedia` nor a recording `scrollTo`, so the test owns all three, the same
 * way the Vanilla suite does. What is pinned: `hidden` tracks the threshold, the click returns the
 * scroller to its start with a motion that respects the reader's preference, and `target` moves
 * focus without a second scroll.
 */
describe("BackToTop", () => {
  let scrollTo: ReturnType<typeof vi.fn>;
  let reducedMotion = false;

  const setScrollY = (y: number) =>
    Object.defineProperty(window, "scrollY", { configurable: true, value: y });

  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    reducedMotion = false;
    window.matchMedia = vi.fn().mockImplementation((media: string) => ({
      media,
      get matches() {
        return reducedMotion;
      },
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      onchange: null,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    setScrollY(0);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  const scroll = (target: Window | Element = window) => act(() => void fireEvent.scroll(target));

  it("renders hidden, and names the control from its children once shown", () => {
    const ui = render(<BackToTop>Volver arriba</BackToTop>);
    const button = ui.getByRole("button", { hidden: true });

    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.hasAttribute("hidden")).toBe(true);
    expect(button.classList.contains("sk-back-to-top")).toBe(true);
    expect(button.classList.contains("sk-interactive")).toBe(true);
    // The label rides in its own part so the stylesheet can clip it to a name-only box.
    expect(button.querySelector(".sk-back-to-top__label")?.textContent).toBe("Volver arriba");

    // Revealed, it is a button with that accessible name - no `hidden` filter needed.
    setScrollY(600);
    scroll();
    expect(ui.getByRole("button", { name: "Volver arriba" })).toBe(button);
  });

  it("reveals once scrolled past the threshold and hides again above it", () => {
    const ui = render(<BackToTop threshold={400}>Volver arriba</BackToTop>);
    const button = ui.container.querySelector<HTMLButtonElement>(".sk-back-to-top")!;

    setScrollY(500);
    scroll();
    expect(button.hasAttribute("hidden")).toBe(false);

    setScrollY(120);
    scroll();
    expect(button.hasAttribute("hidden")).toBe(true);
  });

  it("returns the window to the top on click, smoothly by default", () => {
    const ui = render(<BackToTop>Volver arriba</BackToTop>);
    setScrollY(800);
    scroll();

    fireEvent.click(ui.getByRole("button", { name: "Volver arriba" }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "smooth" });
  });

  it("jumps instantly when the reader prefers reduced motion", () => {
    reducedMotion = true;
    const ui = render(<BackToTop>Volver arriba</BackToTop>);
    setScrollY(800);
    scroll();

    fireEvent.click(ui.container.querySelector<HTMLButtonElement>(".sk-back-to-top")!);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });

  it("moves focus to `target` after scrolling, without a second scroll", () => {
    document.body.insertAdjacentHTML("afterbegin", '<a id="top" href="#" tabindex="-1">arriba</a>');
    const destination = document.getElementById("top")!;
    const focusSpy = vi.spyOn(destination, "focus");

    const ui = render(<BackToTop target="#top">Volver arriba</BackToTop>);
    setScrollY(800);
    scroll();

    fireEvent.click(ui.container.querySelector<HTMLButtonElement>(".sk-back-to-top")!);
    expect(scrollTo).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("acts on a named inner scroller instead of the window", () => {
    document.body.insertAdjacentHTML("afterbegin", '<div id="pane"></div>');
    const pane = document.getElementById("pane") as HTMLElement;
    const paneScrollTo = vi.fn();
    pane.scrollTo = paneScrollTo as unknown as typeof pane.scrollTo;
    Object.defineProperty(pane, "scrollTop", { configurable: true, get: () => 600 });

    const ui = render(<BackToTop scroller="#pane">Volver arriba</BackToTop>);
    const button = ui.container.querySelector<HTMLButtonElement>(".sk-back-to-top")!;

    scroll(pane);
    expect(button.hasAttribute("hidden")).toBe(false);

    fireEvent.click(button);
    expect(paneScrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "smooth" });
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("still calls a consumer's onClick, and lets it opt out of the scroll", () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const ui = render(<BackToTop onClick={onClick}>Volver arriba</BackToTop>);
    setScrollY(800);
    scroll();

    fireEvent.click(ui.container.querySelector<HTMLButtonElement>(".sk-back-to-top")!);
    expect(onClick).toHaveBeenCalledOnce();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
