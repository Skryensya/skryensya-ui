/*
 * SLIDER, a styled native range input.
 *
 * It stays a real <input type="range">: keyboard, form participation and the accessibility tree
 * come from the platform, and the component only skins the track and thumb. The filled portion is
 * exposed as a custom property so the fill can be painted without JavaScript.
 */
export const sliderParts = {
  root: "ds-slider",
} as const;

export type SliderPart = keyof typeof sliderParts;
export type SliderPartClass = (typeof sliderParts)[SliderPart];

/** The custom property carrying the filled fraction (0–1) the track paints against. */
export const sliderFillProperty = "--ds-slider-fill";

/** Filled fraction (0–1) for a value within [min, max]. Guards an empty or inverted range. */
export function sliderFill(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0;
  return Math.min(Math.max((value - min) / (max - min), 0), 1);
}
