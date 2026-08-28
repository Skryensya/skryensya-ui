import { describe, expect, it } from "vitest";
import { formatOklch, oklchToRgb, parseOklch, rgbToOklch, type RgbColor } from "./color.js";

/*
 * Every RGB value below round-trips through OKLCH and back within a rounding tolerance: the two
 * bindings' OKLCH channel-input row calls THIS conversion on every keystroke, and a color picker
 * whose value drifts on its own round trip reads as broken far more visibly than a wrong test
 * assertion here would.
 */
const roundTrips = (rgb: RgbColor, tolerance = 1) => {
  const back = oklchToRgb(rgbToOklch(rgb));
  expect(back.r, "r").toBeCloseTo(rgb.r, 0);
  expect(back.g, "g").toBeCloseTo(rgb.g, 0);
  expect(back.b, "b").toBeCloseTo(rgb.b, 0);
  for (const channel of ["r", "g", "b"] as const) {
    expect(Math.abs(back[channel] - rgb[channel])).toBeLessThanOrEqual(tolerance);
  }
};

describe("rgbToOklch / oklchToRgb", () => {
  it("round-trips black, white and grey exactly", () => {
    roundTrips({ r: 0, g: 0, b: 0 });
    roundTrips({ r: 255, g: 255, b: 255 });
    roundTrips({ r: 128, g: 128, b: 128 });
  });

  it("round-trips the three primaries and their complements", () => {
    roundTrips({ r: 255, g: 0, b: 0 });
    roundTrips({ r: 0, g: 255, b: 0 });
    roundTrips({ r: 0, g: 0, b: 255 });
    roundTrips({ r: 0, g: 255, b: 255 });
    roundTrips({ r: 255, g: 0, b: 255 });
    roundTrips({ r: 255, g: 255, b: 0 });
  });

  it("round-trips an arbitrary desaturated color", () => {
    roundTrips({ r: 180, g: 140, b: 90 });
  });

  it("matches the CSS Color 4 spec's own worked example for pure red", () => {
    // https://www.w3.org/TR/css-color-4/#color-conversion-code  -  oklch(62.8% 0.2577 29.23deg).
    const oklch = rgbToOklch({ r: 255, g: 0, b: 0 });
    expect(oklch.l).toBeCloseTo(0.62796, 3);
    expect(oklch.c).toBeCloseTo(0.25768, 3);
    expect(oklch.h).toBeCloseTo(29.23, 0);
  });

  it("carries alpha through unchanged in both directions", () => {
    const oklch = rgbToOklch({ r: 255, g: 0, b: 0, alpha: 0.5 });
    expect(oklch.alpha).toBe(0.5);
    const rgb = oklchToRgb({ ...oklch, alpha: 0.25 });
    expect(rgb.alpha).toBe(0.25);
  });

  it("clamps an out-of-sRGB-gamut OKLCH color to valid 0–255 channels instead of throwing", () => {
    // A saturation the sRGB gamut cannot reach at this lightness/hue.
    const rgb = oklchToRgb({ l: 0.7, c: 0.5, h: 30 });
    for (const channel of [rgb.r, rgb.g, rgb.b]) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(255);
    }
  });

  it("gives a fully desaturated color a near-zero chroma and a real (non-NaN) hue", () => {
    // Exact-zero chroma only holds in exact arithmetic; the matrix math leaves a/b at floating-
    // point noise for an equal r=g=b input, so the invariant worth pinning is "negligible
    // chroma, hue still a real number" rather than a specific hue degree.
    const oklch = rgbToOklch({ r: 128, g: 128, b: 128 });
    expect(oklch.c).toBeLessThan(1e-6);
    expect(Number.isNaN(oklch.h)).toBe(false);
  });

  it("picks hue 0, by convention, for the one input where chroma is EXACTLY zero", () => {
    // atan2(0, 0) is 0 by spec, unlike the floating-point-noise case above.
    const oklch = rgbToOklch({ r: 0, g: 0, b: 0 });
    expect(oklch.c).toBe(0);
    expect(oklch.h).toBe(0);
  });
});

describe("parseOklch / formatOklch", () => {
  it("parses the plain-number form", () => {
    expect(parseOklch("oklch(0.7 0.15 250)")).toEqual({ l: 0.7, c: 0.15, h: 250, alpha: undefined });
  });

  it("parses percentage lightness, deg hue and an alpha component", () => {
    expect(parseOklch("oklch(62.8% 0.2577 29.23deg / 50%)")).toEqual({
      l: 0.628,
      c: 0.2577,
      h: 29.23,
      alpha: 0.5,
    });
  });

  it("treats `none` as 0 for any component", () => {
    expect(parseOklch("oklch(none none none)")).toEqual({ l: 0, c: 0, h: 0, alpha: undefined });
  });

  it("returns null for anything that is not a well-formed oklch() string", () => {
    expect(parseOklch("not a color")).toBeNull();
    expect(parseOklch("rgb(255 0 0)")).toBeNull();
    expect(parseOklch("oklch(0.7 0.15)")).toBeNull();
    expect(parseOklch("")).toBeNull();
  });

  it("round-trips through format then parse", () => {
    const original = { l: 0.628, c: 0.2577, h: 29.23, alpha: 0.5 };
    const parsed = parseOklch(formatOklch(original));
    expect(parsed?.l).toBeCloseTo(original.l, 3);
    expect(parsed?.c).toBeCloseTo(original.c, 3);
    expect(parsed?.h).toBeCloseTo(original.h, 1);
    expect(parsed?.alpha).toBeCloseTo(original.alpha, 2);
  });

  it("omits the alpha segment entirely when alpha is opaque", () => {
    expect(formatOklch({ l: 0.5, c: 0.1, h: 100, alpha: 1 })).not.toContain("/");
    expect(formatOklch({ l: 0.5, c: 0.1, h: 100 })).not.toContain("/");
  });
});
