import type { ComponentContract } from "./contract.js";

/*
 * SLIDER, a styled native range input.
 *
 * It stays a real <input type="range">: keyboard, form participation and the accessibility tree
 * come from the platform, and the component only skins the track and thumb. The filled portion is
 * exposed as a custom property so the fill can be painted without JavaScript.
 */
export const sliderParts = {
  root: "sk-slider",
} as const;

export type SliderPart = keyof typeof sliderParts;
export type SliderPartClass = (typeof sliderParts)[SliderPart];

/** The custom property carrying the filled fraction (0–1) the track paints against. */
export const sliderFillProperty = "--sk-slider-fill";

/** Filled fraction (0–1) for a value within [min, max]. Guards an empty or inverted range. */
export function sliderFill(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0;
  return Math.min(Math.max((value - min) / (max - min), 0), 1);
}

/*
 * A value along a range, on the native `<input type="range">`. Everything a slider needs — keyboard,
 * touch, screen-reader announcement of the value — the platform already ships, so this contract adds
 * paint and nothing else.
 *
 * The fill is derived from the value, never typed: a track that says 60 and looks 40 is a lie the
 * author could not see.
 */
export const sliderContract = {
  id: "slider",
  css: "@skryensya/core/components/slider.css",
  parts: sliderParts,

  options: {
    value: { type: "number", default: 0, attr: "value" },
    min: { type: "number", default: 0, attr: "min" },
    max: { type: "number", default: 100, attr: "max" },
    step: { type: "number", attr: "step" },
    name: { type: "string", attr: "name" },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
  },

  signatures: {
    Slider: {
      intent: ["value-in-a-range", "volume", "adjust-a-number-roughly"],
      host: { element: "input" },
      options: ["value", "min", "max", "step", "name", "disabled"],
      slots: {},
      template: {
        element: "input",
        part: "root",
        host: true,
        attrs: { type: "range" },
        // A fraction, not a percent: the CSS reads `--sk-slider-fill` as 0–1.
        style: [{ property: "--sk-slider-fill", percentOf: ["value", "max"], as: "fraction" }],
      },
      react: { from: "@skryensya/react/slider", name: "Slider" },
    },
  },
} as const satisfies ComponentContract;
