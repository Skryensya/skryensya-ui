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
  rangeRoot: "sk-slider-range",
  rangeTrack: "sk-slider-range__track",
  rangeFill: "sk-slider-range__fill",
  rangeLow: "sk-slider-range__low",
  rangeHigh: "sk-slider-range__high",
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
 * MULTI-THUMB — two native range inputs, not WAI's own custom `role="slider"` SVG widget (the one
 * example the APG publishes for this pattern). Chosen deliberately: two `<input type="range">`
 * already get keyboard, touch, form participation and the accessibility tree from the platform for
 * free — WAI's own custom-widget example carries an explicit caveat that "some users of touch-based
 * assistive technologies may experience difficulty" with a hand-rolled slider, exactly the class of
 * problem a native element never has. The one thing native does NOT give for free is stopping one
 * thumb from being dragged past the other; `sliderRangeBounds` is that, and nothing else.
 */

/** Each thumb's runtime `min`/`max`, bounded by where the OTHER thumb currently sits — the low
 *  thumb can never be dragged past the high one, or vice versa, without either input's native
 *  clamping ever needing to know about the other. */
export function sliderRangeBounds(
  low: number,
  high: number,
  min: number,
  max: number,
): { lowMin: number; lowMax: number; highMin: number; highMax: number } {
  return { lowMin: min, lowMax: high, highMin: low, highMax: max };
}

/** Defensive only: an author who sets `lowValue` above `highValue` gets a valid range back, low
 *  and high swapped, rather than an inverted one no CSS gradient or bound math accounted for. */
export function clampSliderRange(low: number, high: number): { low: number; high: number } {
  return low <= high ? { low, high } : { low: high, high: low };
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

    /** Where each thumb of `SliderRange` starts — same `value`/`defaultValue` split as `value`
     *  above, and for the same reason: a composition is data, never state to lock a thumb to. */
    lowValue: { type: "number", default: 0, attr: "value", prop: "defaultLowValue" },
    highValue: { type: "number", default: 100, attr: "value", prop: "defaultHighValue" },
    /** A range input carries no implicit name, and here there are TWO thumbs to tell apart — WAI's
     *  own multi-thumb example names them distinctly ("Hotel Minimum Price" / "...Maximum Price"),
     *  never just "value", so both are required rather than defaulted. */
    lowLabel: { type: "string", attr: "aria-label" },
    highLabel: { type: "string", attr: "aria-label" },
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

    /*
     * Two native `<input type="range">`, not one — see the file's own "MULTI-THUMB" banner above
     * for why this is the chosen shape over WAI's custom SVG widget. The wrapper is the host so a
     * consumer's own `id`/`class`/`data-*` land in the one place a two-input control has to carry
     * them; the low/high inputs are internal structure, never composed by the author, the same way
     * `NumberField`'s own increment/decrement buttons are.
     */
    SliderRange: {
      intent: ["range-in-a-range", "min-max-filter", "price-range", "two-thumb-slider"],
      host: { element: "div" },
      options: ["lowValue", "highValue", "lowLabel", "highLabel", "min", "max", "step", "disabled"],
      requires: ["lowLabel", "highLabel"],
      slots: {},
      template: {
        element: "div",
        part: "rangeRoot",
        host: true,
        children: [
          { element: "div", part: "rangeTrack", attrs: { "aria-hidden": "true" } },
          {
            element: "div",
            part: "rangeFill",
            attrs: { "aria-hidden": "true" },
            mount: "data-sk-slider-range-fill",
            // Initial paint only — same caveat `Slider`'s own `style` entry documents: static,
            // ignorant of `min`, corrected for real by the enhancer/React on mount.
            style: [
              { property: "--sk-slider-range-fill-start", percentOf: ["lowValue", "max"], as: "fraction" },
              { property: "--sk-slider-range-fill-end", percentOf: ["highValue", "max"], as: "fraction" },
            ],
          },
          {
            // `also: ["sk-slider"]` — the single Slider's thumb/track/focus-ring styling is
            // reused wholesale, not restated; `slider.css`'s own `.sk-slider-range` rules are only
            // the DELTA a two-input overlay needs (position, a transparent track, pointer-events).
            element: "input",
            part: "rangeLow",
            also: ["sk-slider"],
            options: ["lowValue", "lowLabel", "min", "max", "step", "disabled"],
            attrs: { type: "range" },
            mount: "data-sk-slider-range-low",
          },
          {
            element: "input",
            part: "rangeHigh",
            also: ["sk-slider"],
            options: ["highValue", "highLabel", "min", "max", "step", "disabled"],
            attrs: { type: "range" },
            mount: "data-sk-slider-range-high",
          },
        ],
      },
      react: { from: "@skryensya/react/slider", name: "SliderRange" },
      mount: "data-sk-slider-range",
    },
  },
} as const satisfies ComponentContract;
