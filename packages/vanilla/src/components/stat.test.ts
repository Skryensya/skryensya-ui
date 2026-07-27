import { animateStatCount, formatStatCount, statCountEasingEnter } from "@skryensya/core/stat";
import { afterEach, describe, expect, it, vi } from "vitest";
import { connectStat, mountStat } from "./stat.js";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("animateStatCount", () => {
  it("jumps to the end when duration is zero", () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();
    animateStatCount({ from: 0, to: 100, duration: 0, onUpdate, onComplete });
    expect(onUpdate).toHaveBeenCalledWith(100);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("eases from start to end across frames", () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => undefined);

    const values: number[] = [];
    animateStatCount({
      from: 0,
      to: 100,
      duration: 1000,
      easing: statCountEasingEnter,
      onUpdate: (n) => values.push(n),
    });

    now = 0;
    frames.shift()?.(0);
    now = 500;
    frames.shift()?.(500);
    now = 1000;
    frames.shift()?.(1000);

    expect(values[0]).toBeGreaterThanOrEqual(0);
    expect(values.at(-1)).toBe(100);
    expect(values.some((n) => n > 0 && n < 100)).toBe(true);
  });
});

describe("formatStatCount", () => {
  it("keeps prefix, suffix and fraction digits stable", () => {
    expect(formatStatCount(1204.5, { locale: "en-US", suffix: " €", fractionDigits: 1 })).toBe(
      "1,204.5 €",
    );
  });
});

describe("Stat vanilla enhancer", () => {
  it("counts up authored values when data-animate is set", () => {
    document.body.innerHTML = `<div class="sk-stat" data-sk-stat data-animate>
  <span class="sk-stat__label">Pedidos</span>
  <span class="sk-stat__value" data-count="1204" data-locale="en-US">1,204</span>
</div>`;
    const root = document.body.firstElementChild;
    if (!(root instanceof HTMLElement)) throw new Error("expected root");
    const value = root.querySelector(".sk-stat__value");
    if (!(value instanceof HTMLElement)) throw new Error("expected value");

    Object.defineProperty(root, "ownerDocument", { value: document });
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private readonly cb: IntersectionObserverCallback) {}
        observe() {
          this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
        }
        disconnect() {}
        unobserve() {}
        takeRecords() {
          return [];
        }
        root = null;
        rootMargin = "";
        thresholds = [];
      },
    );
    // A one-method stub: the enhancer only ever reads getPropertyValue off this, so it goes through
    // `unknown` rather than pretending to be the other 510 properties of CSSStyleDeclaration.
    vi.spyOn(globalThis, "getComputedStyle").mockReturnValue({
      getPropertyValue: () => "0ms",
    } as unknown as CSSStyleDeclaration);

    expect(mountStat(document)).toBe(1);
    expect(value.querySelector(".sk-stat__value-sizer")?.textContent).toBe("1,204");
    expect(value.querySelector(".sk-stat__value-tick")?.textContent).toBe("1,204");
  });

  it("ignores stats without data-animate", () => {
    document.body.innerHTML = `<div class="sk-stat" data-sk-stat>
  <span class="sk-stat__value">99</span>
</div>`;
    expect(mountStat(document)).toBe(0);
  });

  it("connectStat requires data-count", () => {
    document.body.innerHTML = `<div class="sk-stat" data-sk-stat data-animate>
  <span class="sk-stat__value">99</span>
</div>`;
    const root = document.body.firstElementChild;
    if (!(root instanceof HTMLElement)) throw new Error("expected root");
    expect(() => connectStat(root)).toThrow(/data-count/);
  });
});
