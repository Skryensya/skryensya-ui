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
 * A value along a range, on the native `<input type="range">`. Everything a slider needs (keyboard,
 * touch, screen-reader announcement of the value) the platform already ships, so this contract adds
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
    /**
     * Where the thumb STARTS. Spelled `value` in markup because that is the attribute a range input
     * takes, and `defaultValue` in React because that is what React calls the same idea.
     *
     * The rename is the whole point rather than a nicety: `value` in React means CONTROLLED, so a
     * tree that emitted it handed over a slider whose thumb could not move: the author asked for an
     * initial position and got a locked control, which every static check called correct. A
     * composition is data and has no state to own, so the initial value is the only one it can mean.
     */
    value: { type: "number", default: 0, attr: "value", prop: "defaultValue" },
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
      /*
       * The fill follows the thumb only if something recomputes it: CSS can read the initial `value`
       * but has no selector for the current one. React does it in its own render; authored markup
       * needs the enhancer, and without this attribute it never attached: every emitted slider
       * painted its starting fraction and then kept it while the thumb moved away.
       */
      mount: "data-sk-slider",
    },
  },
} as const satisfies ComponentContract;
