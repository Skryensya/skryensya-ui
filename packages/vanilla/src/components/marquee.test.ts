import {
  marqueeDurationSeconds,
  marqueeGapFill,
  marqueeInitialPlaying,
} from "@skryensya/core/marquee";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectMarquee, mountMarquee } from "./marquee.js";

describe("core: marquee decisions", () => {
  it("derives constant velocity from duration-scale cadence", () => {
    expect(marqueeDurationSeconds(480, 960)).toBe(9.6);
    expect(marqueeDurationSeconds(480, 1440)).toBeCloseTo(14.4);
    expect(marqueeDurationSeconds(480, 640)).toBe(6.4);
    expect(marqueeDurationSeconds(0, 960)).toBe(0);
    expect(marqueeDurationSeconds(480, 0)).toBe(0);
    expect(marqueeDurationSeconds(Number.NaN, 960)).toBe(0);
  });

  it("widens gaps only when one run cannot cover its viewport", () => {
    // 530px of content in a 691px window: two copies leave 161px empty once per cycle.
    const fill = marqueeGapFill(530, 6, 691);
    expect(530 + fill * 6).toBeCloseTo(691);
    // A run that already reaches across is left exactly as authored.
    expect(marqueeGapFill(800, 6, 691)).toBe(0);
    expect(marqueeGapFill(691, 6, 691)).toBe(0);
    // Nothing to spread the distance over, and nothing to measure against.
    expect(marqueeGapFill(530, 0, 691)).toBe(0);
    expect(marqueeGapFill(Number.NaN, 6, 691)).toBe(0);
    expect(marqueeGapFill(530, 6, Number.NaN)).toBe(0);
  });

  it("starts only automatic motion, and never against reduced motion", () => {
    expect(marqueeInitialPlaying("manual", false)).toBe(false);
    expect(marqueeInitialPlaying("auto", false)).toBe(true);
    expect(marqueeInitialPlaying("auto", true)).toBe(false);
  });
});

describe("connectMarquee", () => {
  let reduced = false;
  let onPreferenceChange: (() => void) | undefined;
  const cleanups: Array<() => void> = [];

  beforeEach(() => {
    reduced = false;
    onPreferenceChange = undefined;
    window.matchMedia = vi.fn().mockImplementation((media: string) => ({
      media,
      get matches() {
        return reduced;
      },
      addEventListener(_type: string, listener: () => void) {
        onPreferenceChange = listener;
      },
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      onchange: null,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() {}
    });
  });

  afterEach(() => {
    cleanups.splice(0).forEach((cleanup) => cleanup());
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /**
   * `viewportWidth` is what a browser reports for the window the strip travels through; jsdom lays
   * nothing out, so both measurements are stubbed. The default of 0 is the "run already covers it"
   * case, which is why the older assertions still read the authored width.
   */
  function render(start: "manual" | "auto" = "manual", viewportWidth = 0, control = true): HTMLElement {
    const playing = start === "auto";
    const items = "<span>Alpha</span><span>Beta</span><span>Gamma</span><span>Delta</span>";
    const toggle = control
      ? `<button class="sk-marquee__toggle sk-button sk-interactive" type="button" data-icon-only aria-pressed="${playing}">
          <span class="sk-marquee__glyph" aria-hidden="true"></span>
          <span data-action="play" ${playing ? "hidden" : ""}>Play</span>
          <span data-action="pause" ${playing ? "" : "hidden"}>Pause</span>
        </button>`
      : "";
    document.body.innerHTML = `
      <div class="sk-marquee" data-sk-marquee data-start="${start}" data-state="${playing ? "playing" : "paused"}" style="--sk-marquee-cadence-duration: 960ms">
        <div class="sk-marquee__viewport"><div class="sk-marquee__track">
          <div class="sk-marquee__content">${items}</div>
          <div class="sk-marquee__content" aria-hidden="true">${items}</div>
        </div></div>
        ${toggle}
      </div>`;
    const root = document.querySelector<HTMLElement>("[data-sk-marquee]")!;
    const viewport = root.querySelector<HTMLElement>(".sk-marquee__viewport")!;
    const content = root.querySelector<HTMLElement>(".sk-marquee__content:not([aria-hidden])")!;
    Object.defineProperty(content, "scrollWidth", { configurable: true, value: 480 });
    Object.defineProperty(viewport, "clientWidth", { configurable: true, value: viewportWidth });
    return root;
  }

  function connect(root: HTMLElement) {
    const cleanup = connectMarquee(root);
    cleanups.push(cleanup);
  }

  it("keeps requested motion paused until Play, then swaps the available action", () => {
    const root = render();
    connect(root);
    const toggle = root.querySelector<HTMLButtonElement>("button")!;

    expect(root.dataset.state).toBe("paused");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    toggle.click();
    expect(root.dataset.state).toBe("playing");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.querySelector<HTMLElement>("[data-action=play]")!.hidden).toBe(true);
    expect(toggle.querySelector<HTMLElement>("[data-action=pause]")!.hidden).toBe(false);
  });

  it("starts autoplay and derives duration from measured content", () => {
    const root = render("auto");
    connect(root);

    expect(root.dataset.state).toBe("playing");
    expect(root.style.getPropertyValue("--sk-marquee-duration")).toBe("9.6s");
    expect(root.style.getPropertyValue("--sk-marquee-gap-fill")).toBe("0px");
  });

  it("fills a short run up to its viewport and times the widened run, not the authored one", () => {
    // 480px of content across four items, inside a 600px window: 30px per gap closes the hole.
    const root = render("auto", 600);
    connect(root);

    expect(root.style.getPropertyValue("--sk-marquee-gap-fill")).toBe("30px");
    // 600px at the 960ms cadence per 48px step, so the wider run also takes proportionally longer.
    expect(root.style.getPropertyValue("--sk-marquee-duration")).toBe("12s");
  });

  it("stops when reduced motion turns on and resumes unmodified autoplay when it turns off", () => {
    const root = render("auto");
    connect(root);

    reduced = true;
    onPreferenceChange?.();
    expect(root.dataset.state).toBe("paused");

    reduced = false;
    onPreferenceChange?.();
    expect(root.dataset.state).toBe("playing");
  });

  it("never lets a preference cycle override an explicit pause", () => {
    const root = render("auto");
    connect(root);
    root.querySelector<HTMLButtonElement>("button")!.click();

    reduced = true;
    onPreferenceChange?.();
    reduced = false;
    onPreferenceChange?.();
    expect(root.dataset.state).toBe("paused");
  });

  it("runs an uncontrolled autoplay strip without a toggle to talk to", () => {
    // `control` is opt-in, so this is the shape the emitter writes for a plain ambient strip.
    const root = render("auto", 0, false);
    connect(root);

    expect(root.querySelector(".sk-marquee__toggle")).toBeNull();
    // Nothing to press means nothing that could have paused it.
    expect(root.dataset.state).toBe("playing");
    // The measurement is the enhancer's real job and does not depend on the control existing.
    expect(root.style.getPropertyValue("--sk-marquee-duration")).toBe("9.6s");

    // A preference cycle still reaches it; the CSS is what keeps the run static under reduce.
    reduced = true;
    onPreferenceChange?.();
    expect(root.dataset.state).toBe("paused");
    reduced = false;
    onPreferenceChange?.();
    expect(root.dataset.state).toBe("playing");
  });

  it("mounts each authored root only once", () => {
    render();
    expect(mountMarquee(document)).toBe(1);
    expect(mountMarquee(document)).toBe(0);
  });
});
