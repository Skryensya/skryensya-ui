/*
 * THE CLAMPED FRACTION, once.
 *
 * Four components need "where does this value sit between these bounds, as 0..1": Meter, Slider,
 * Progress and Chart. Each had written it out, and `meterFraction` and `sliderFill` were byte-for-
 * byte identical apart from the name; `progressFraction` and `chartFraction` were the same thing
 * with `min` fixed at 0, differing only in whether the clamp ran before or after the division,
 * which is unobservable.
 *
 * The four public names STAY, as one-line wrappers in their own contracts. They read correctly at
 * their call sites (a slider fills, a meter reports a fraction) and a consumer importing
 * `sliderFill` should not have to learn that a shared utility exists. What is shared is the
 * behaviour, so a bug fixed here is fixed in all four instead of in whichever one someone noticed.
 */

/** `value` between `min` and `max`, clamped to 0..1. Zero for any non-finite input or empty range. */
export function clampedFraction(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0;
  return Math.min(Math.max((value - min) / (max - min), 0), 1);
}
