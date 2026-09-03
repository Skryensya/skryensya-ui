import {
  BACK_TO_TOP_DEFAULT_THRESHOLD,
  backToTopParseThreshold,
  backToTopScrollBehavior,
  backToTopShouldReveal,
} from "@skryensya/core/back-to-top";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectBackToTop, mountBackToTop } from "./back-to-top.js";

/*
 * The pure half lives in Core, which ships no test runner, so it is exercised here (the same place
 * `hotkey`'s matcher is). The enhancer half needs three browser facts jsdom does not give in a
 * useful form: a settable scroll position, `matchMedia`, and a `scrollTo` that records instead of
 * warning. The tests own all three.
 */
describe("core: pure behavior", () => {
  it("reveals at or past the threshold, never before", () => {
    expect(backToTopShouldReveal(0, 400)).toBe(false);
    expect(backToTopShouldReveal(399, 400)).toBe(false);
    expect(backToTopShouldReveal(400, 400)).toBe(true);
    expect(backToTopShouldReveal(1200, 400)).toBe(true);
  });

  it("shows from the first pixel when the threshold is 0", () => {
    expect(backToTopShouldReveal(0, 0)).toBe(true);
    expect(backToTopShouldReveal(1, 0)).toBe(true);
  });

  it("treats a broken threshold as the default, not as always- or never-on", () => {
    expect(backToTopShouldReveal(500, Number.NaN)).toBe(true); // 500 >= 400
    expect(backToTopShouldReveal(300, Number.NaN)).toBe(false);
    expect(backToTopShouldReveal(300, -1)).toBe(false);
  });

  it("never reveals on a non-finite scroll position", () => {
    expect(backToTopShouldReveal(Number.NaN, 0)).toBe(false);
  });

  it("parses data-threshold, falling back to the default on empty or unparseable input", () => {
    expect(backToTopParseThreshold("800")).toBe(800);
    expect(backToTopParseThreshold("0")).toBe(0);
    expect(backToTopParseThreshold(null)).toBe(BACK_TO_TOP_DEFAULT_THRESHOLD);
    expect(backToTopParseThreshold("")).toBe(BACK_TO_TOP_DEFAULT_THRESHOLD);
    expect(backToTopParseThreshold("nope")).toBe(BACK_TO_TOP_DEFAULT_THRESHOLD);
    expect(backToTopParseThreshold("-5")).toBe(BACK_TO_TOP_DEFAULT_THRESHOLD);
  });

  it("animates the scroll unless the reader asked for less motion", () => {
    expect(backToTopScrollBehavior(false)).toBe("smooth");
    expect(backToTopScrollBehavior(true)).toBe("auto");
  });
});

describe("connectBackToTop", () => {
  const cleanups: Array<() => void> = [];
  let scrollTo: ReturnType<typeof vi.spyOn>;
  let reducedMotion = false;

  const setScrollY = (y: number) =>
    Object.defineProperty(window, "scrollY", { configurable: true, value: y });

  beforeEach(() => {
    // A synchronous rAF so a scroll event settles the state within the test tick. Returns 0 so the
    // enhancer's `frame` guard clears after `sync()` has already run, and the next scroll schedules.
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
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
    cleanups.splice(0).forEach((off) => off());
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  const connect = (root: HTMLElement) => {
    const off = connectBackToTop(root);
    cleanups.push(off);
    return off;
  };

  const mountButton = (attrs = ""): HTMLButtonElement => {
    document.body.innerHTML = `<button class="sk-back-to-top sk-interactive" type="button" data-sk-back-to-top ${attrs} hidden><span class="sk-back-to-top__label">Volver arriba</span></button>`;
    return document.querySelector<HTMLButtonElement>("[data-sk-back-to-top]")!;
  };

  it("stays hidden below the threshold and reveals once past it", () => {
    const button = mountButton(); // default threshold, scrollY 0
    connect(button);
    expect(button.hasAttribute("hidden")).toBe(true);

    setScrollY(500);
    window.dispatchEvent(new Event("scroll"));
    expect(button.hasAttribute("hidden")).toBe(false);

    setScrollY(100);
    window.dispatchEvent(new Event("scroll"));
    expect(button.hasAttribute("hidden")).toBe(true);
  });

  it("honours a custom data-threshold", () => {
    const button = mountButton('data-threshold="50"');
    connect(button);

    setScrollY(80);
    window.dispatchEvent(new Event("scroll"));
    expect(button.hasAttribute("hidden")).toBe(false);
  });

  it("returns the window to the top on click, smoothly by default", () => {
    const button = mountButton();
    connect(button);

    button.click();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "smooth" });
  });

  it("jumps instantly when the reader prefers reduced motion", () => {
    reducedMotion = true;
    const button = mountButton();
    connect(button);

    button.click();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });

  it("moves focus to `target` after the scroll, without starting a second one", () => {
    document.body.innerHTML = `
      <a id="top" href="#" tabindex="-1">arriba</a>
      <button class="sk-back-to-top" type="button" data-sk-back-to-top data-target="#top" hidden><span class="sk-back-to-top__label">Volver arriba</span></button>`;
    const button = document.querySelector<HTMLElement>("[data-sk-back-to-top]")!;
    const destination = document.getElementById("top")!;
    const focusSpy = vi.spyOn(destination, "focus");
    connect(button);

    button.click();
    expect(scrollTo).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("acts on a named inner scroller instead of the window", () => {
    document.body.innerHTML = `
      <div id="pane"></div>
      <button class="sk-back-to-top" type="button" data-sk-back-to-top data-scroller="#pane" hidden><span class="sk-back-to-top__label">Volver arriba</span></button>`;
    const pane = document.getElementById("pane") as HTMLElement;
    const button = document.querySelector<HTMLElement>("[data-sk-back-to-top]")!;
    const paneScrollTo = vi.spyOn(pane, "scrollTo").mockImplementation(() => {});
    Object.defineProperty(pane, "scrollTop", { configurable: true, get: () => 600 });
    connect(button);

    pane.dispatchEvent(new Event("scroll"));
    expect(button.hasAttribute("hidden")).toBe(false);

    button.click();
    expect(paneScrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "smooth" });
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("stops syncing once cleaned up", () => {
    const button = mountButton();
    const off = connectBackToTop(button);

    setScrollY(900);
    window.dispatchEvent(new Event("scroll"));
    expect(button.hasAttribute("hidden")).toBe(false);

    off();
    setScrollY(0);
    window.dispatchEvent(new Event("scroll"));
    expect(button.hasAttribute("hidden")).toBe(false); // listener gone, state frozen
  });

  it("mounts once per authored root", () => {
    mountButton();
    expect(mountBackToTop(document)).toBe(1);
    expect(mountBackToTop(document)).toBe(0);
  });
});
