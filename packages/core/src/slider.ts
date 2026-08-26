import type { ComponentContract } from "./contract.js";

/*
 * SLIDER, backed by @zag-js/slider.
 *
 * The old skin was a native <input type="range">. That kept the thumb box contained inside the
 * input, so at 100% the visible knob still stopped short of the visual line end. Zag's machine gives
 * us the same keyboard/form/a11y contract while positioning the thumb over a real track whose 100%
 * point is the end of the line.
 */
export const sliderParts = {
  root: "sk-slider",
  control: "sk-slider__control",
  track: "sk-slider__track",
  range: "sk-slider__range",
  thumb: "sk-slider__thumb",
  input: "sk-slider__input",
  rangeRoot: "sk-slider-range",
  rangeControl: "sk-slider-range__control",
  rangeTrack: "sk-slider-range__track",
  rangeFill: "sk-slider-range__fill",
  rangeLow: "sk-slider-range__low",
  rangeHigh: "sk-slider-range__high",
  rangeLowInput: "sk-slider-range__low-input",
  rangeHighInput: "sk-slider-range__high-input",
} as const;

export type SliderPart = keyof typeof sliderParts;
export type SliderPartClass = (typeof sliderParts)[SliderPart];

export const sliderAttrs = {
  root: "data-sk-slider",
  control: "data-sk-slider-control",
  track: "data-sk-slider-track",
  range: "data-sk-slider-range-part",
  thumb: "data-sk-slider-thumb",
  input: "data-sk-slider-input",
  rangeRoot: "data-sk-slider-range",
  rangeControl: "data-sk-slider-range-control",
  rangeTrack: "data-sk-slider-range-track",
  rangeFill: "data-sk-slider-range-fill",
  rangeLow: "data-sk-slider-range-low",
  rangeHigh: "data-sk-slider-range-high",
  rangeLowInput: "data-sk-slider-range-low-input",
  rangeHighInput: "data-sk-slider-range-high-input",
} as const;

/** Filled fraction (0–1) for a value within [min, max]. Guards an empty or inverted range. */
export function sliderFill(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0;
  return Math.min(Math.max((value - min) / (max - min), 0), 1);
}

/** Each thumb's runtime `min`/`max`, bounded by where the OTHER thumb currently sits. */
export function sliderRangeBounds(
  low: number,
  high: number,
  min: number,
  max: number,
): { lowMin: number; lowMax: number; highMin: number; highMax: number } {
  return { lowMin: min, lowMax: high, highMin: low, highMax: max };
}

/** Defensive only: an author who sets `lowValue` above `highValue` gets a valid range back. */
export function clampSliderRange(low: number, high: number): { low: number; high: number } {
  return low <= high ? { low, high } : { low: high, high: low };
}

export const sliderContract = {
  id: "slider",
  css: "@skryensya/core/components/slider.css",
  parts: sliderParts,

  options: {
    value: { type: "number", default: 0, attr: "data-value", prop: "defaultValue", machineInput: true },
    min: { type: "number", default: 0, attr: "data-min", machineInput: true },
    max: { type: "number", default: 100, attr: "data-max", machineInput: true },
    step: { type: "number", attr: "data-step", machineInput: true },
    name: { type: "string", attr: "data-name", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },

    lowValue: { type: "number", default: 0, attr: "data-low-value", prop: "defaultLowValue", machineInput: true },
    highValue: { type: "number", default: 100, attr: "data-high-value", prop: "defaultHighValue", machineInput: true },
    lowLabel: { type: "string", attr: "aria-label", machineInput: true },
    highLabel: { type: "string", attr: "aria-label", machineInput: true },
  },

  signatures: {
    Slider: {
      intent: ["value-in-a-range", "volume", "adjust-a-number-roughly"],
      host: { element: "div" },
      options: ["value", "min", "max", "step", "name", "disabled"],
      slots: {},
      template: {
        element: "div",
        part: "root",
        host: true,
        mount: sliderAttrs.root,
        children: [
          {
            element: "div",
            part: "control",
            mount: sliderAttrs.control,
            children: [
              {
                element: "div",
                part: "track",
                mount: sliderAttrs.track,
                children: [{ element: "div", part: "range", mount: sliderAttrs.range }],
              },
              {
                element: "div",
                part: "thumb",
                mount: sliderAttrs.thumb,
                children: [
                  {
                    element: "input",
                    part: "input",
                    mount: sliderAttrs.input,
                    options: ["name"],
                    attrs: { type: "text", hidden: "" },
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/slider", name: "Slider" },
    },

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
        mount: sliderAttrs.rangeRoot,
        children: [
          {
            element: "div",
            part: "rangeControl",
            mount: sliderAttrs.rangeControl,
            children: [
              {
                element: "div",
                part: "rangeTrack",
                mount: sliderAttrs.rangeTrack,
                children: [{ element: "div", part: "rangeFill", mount: sliderAttrs.rangeFill }],
              },
              {
                element: "div",
                part: "rangeLow",
                mount: sliderAttrs.rangeLow,
                options: ["lowLabel"],
                children: [{ element: "input", part: "rangeLowInput", mount: sliderAttrs.rangeLowInput, attrs: { type: "text", hidden: "" } }],
              },
              {
                element: "div",
                part: "rangeHigh",
                mount: sliderAttrs.rangeHigh,
                options: ["highLabel"],
                children: [{ element: "input", part: "rangeHighInput", mount: sliderAttrs.rangeHighInput, attrs: { type: "text", hidden: "" } }],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/slider", name: "SliderRange" },
    },
  },
} as const satisfies ComponentContract;
