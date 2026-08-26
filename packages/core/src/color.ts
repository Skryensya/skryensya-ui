/*
 * OKLCH ↔ sRGB, pure math, no machine.
 *
 * `@zag-js/color-picker` (the machine `color-picker.ts`'s `ColorPicker` signature runs on, see
 * `@skryensya/core/machines`) only understands rgba/hsla/hsba: OKLCH support was proposed
 * (chakra-ui/zag#2446) and closed in favor of an official implementation landing in Zag's own
 * v2, with no release date yet. The interactive area and both channel rails already operate in
 * the machine's own internal HSB space regardless of which text format is showing, so an OKLCH
 * channel-input row does not need the MACHINE to know the color space at all — it only needs to
 * read the machine's real color (always convertible to sRGB) and write back through one.
 *
 * This is that conversion, kept here rather than duplicated per binding for the same reason
 * `calendar.ts` keeps its own date math here: pure, framework-agnostic behaviour belongs in core
 * whether or not a machine happens to sit next to it (ADR-0010's "a machine is not a tenant"
 * argument applies just as well to plain functions).
 *
 * The math is Björn Ottosson's own public-domain reference implementation for OKLab
 * (https://bottosson.github.io/posts/oklab/), the same one culori and every current OKLCH tool
 * (including the browser's own CSS `oklch()` support) implement. OKLCH is OKLab's polar form:
 * same L, C = hypot(a, b), H = atan2(b, a) in degrees.
 */

/** 0–255 per channel, alpha 0–1. The shape every other RGB value in this codebase already uses. */
export type RgbColor = { r: number; g: number; b: number; alpha?: number };

/** L is 0–1 (CSS writes it as a percentage), C is unbounded but rarely exceeds ~0.4, H in degrees. */
export type OklchColor = { l: number; c: number; h: number; alpha?: number };

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** IEC 61966-2-1: the sRGB transfer function, both directions. */
function srgbChannelToLinear(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearChannelToSrgb(value: number): number {
  const c = value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  return clamp(Math.round(c * 255), 0, 255);
}

/** Linear sRGB → OKLab, Ottosson's own matrices. */
function linearRgbToOklab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/** OKLab → linear sRGB, the inverse matrices. */
function oklabToLinearRgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

/** sRGB → OKLCH. Out-of-gamut input (there is none here; RGB is always in gamut) never applies. */
export function rgbToOklch(rgb: RgbColor): OklchColor {
  const lr = srgbChannelToLinear(rgb.r);
  const lg = srgbChannelToLinear(rgb.g);
  const lb = srgbChannelToLinear(rgb.b);
  const { L, a, b } = linearRgbToOklab(lr, lg, lb);

  const c = Math.hypot(a, b);
  // atan2(0, 0) is 0, which is already the right answer for a fully desaturated color (grey/
  // black/white): hue is meaningless there, and 0 is as good a convention as any other.
  const hRad = Math.atan2(b, a);
  const h = (hRad * 180) / Math.PI;

  return { l: L, c, h: h < 0 ? h + 360 : h, alpha: rgb.alpha };
}

/**
 * OKLCH → sRGB, clamped to the sRGB gamut. OKLCH covers a wider gamut than sRGB can display; a
 * color a reader types (or an OKLCH round-trip from a saturated sRGB one) can land outside it.
 * Clamping the FINAL 0–255 channels (rather than refusing the value, or attempting gamut
 * mapping) keeps this a pure, always-succeeding function: the picker's other channel rows
 * already show whatever the clamped result actually is, so there is no silent mismatch for the
 * reader to hit later.
 */
export function oklchToRgb(oklch: OklchColor): RgbColor {
  const hRad = (oklch.h * Math.PI) / 180;
  const a = oklch.c * Math.cos(hRad);
  const b = oklch.c * Math.sin(hRad);

  const linear = oklabToLinearRgb(oklch.l, a, b);
  return {
    r: linearChannelToSrgb(linear.r),
    g: linearChannelToSrgb(linear.g),
    b: linearChannelToSrgb(linear.b),
    alpha: oklch.alpha,
  };
}

/**
 * `oklch(L C H)` / `oklch(L C H / A)`, the CSS Color 4 syntax. `L` accepts a bare 0–1 number or
 * a percentage (`62%`); `H` accepts a bare number or an explicit `deg` (`120deg`); `none` (any
 * component) parses as `0`, matching how the browser itself treats a missing/powerless channel.
 * Returns `null` rather than throwing: a color-picker's own hand-typed input is exactly the case
 * where invalid text arrives on every keystroke, and the caller decides what to do with that,
 * same as `calendar.ts`'s `parseCalendarDate` does for a bad date string.
 */
export function parseOklch(input: string): OklchColor | null {
  const match = input
    .trim()
    .match(
      /^oklch\(\s*(none|[\d.]+%?)\s+(none|[\d.]+)\s+(none|[\d.]+(?:deg)?)\s*(?:\/\s*(none|[\d.]+%?)\s*)?\)$/i,
    );
  if (!match) return null;
  const [, lRaw, cRaw, hRaw, alphaRaw] = match;

  const l = lRaw === "none" ? 0 : lRaw.endsWith("%") ? Number.parseFloat(lRaw) / 100 : Number.parseFloat(lRaw);
  const c = cRaw === "none" ? 0 : Number.parseFloat(cRaw);
  const h = hRaw === "none" ? 0 : Number.parseFloat(hRaw);
  const alpha =
    alphaRaw === undefined
      ? undefined
      : alphaRaw === "none"
        ? 0
        : alphaRaw.endsWith("%")
          ? Number.parseFloat(alphaRaw) / 100
          : Number.parseFloat(alphaRaw);

  if ([l, c, h].some((n) => Number.isNaN(n)) || (alpha !== undefined && Number.isNaN(alpha))) return null;
  return { l, c, h, alpha };
}

/**
 * The inverse of `parseOklch`. `L` and alpha as percentages (`62%`, matching how the browser's
 * own devtools echo an `oklch()` value back), `C` and `H` as plain numbers, three decimal places:
 * enough precision that a round trip through `oklchToRgb` → `rgbToOklch` → `formatOklch` never
 * visibly drifts, without printing the long tail of floating-point noise the raw math produces.
 */
export function formatOklch(oklch: OklchColor): string {
  const l = `${round(oklch.l * 100, 2)}%`;
  const c = round(oklch.c, 4);
  const h = round(oklch.h, 2);
  const alpha = oklch.alpha === undefined || oklch.alpha >= 1 ? "" : ` / ${round(oklch.alpha * 100, 1)}%`;
  return `oklch(${l} ${c} ${h}${alpha})`;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
