import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * Two ranges side by side, one enabled and one disabled.
 *
 * It converts because `value` now says WHERE THE THUMB STARTS in both bindings: the contract spells
 * it `value` in markup and `defaultValue` in React. Emitting React's `value` made the control
 * controlled with no handler to change it, so the demo rendered a slider nobody could move.
 */

/** One thumb at rest: root, control, track, fill and thumb. The hidden input is not labelled. */
export const sliderAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("sliderPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "slider",
      signature: "Slider",
      options: { value: 65 },
      attrs: { "aria-label": t("demo.slider.volume"), style: "inline-size: 16rem" },
    },
    items: [
      namePart(".sk-slider", "block-start"),
      namePart(".sk-slider__control", "inline-start"),
      namePart(".sk-slider__track", "block-end"),
      namePart(".sk-slider__range", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-slider__thumb", "inline-end"),
    ],
  },
});

export const sliderTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    {
      contract: "slider",
      signature: "Slider",
      options: { value: 65 },
      attrs: { "aria-label": t("demo.slider.volume") },
    },
    {
      contract: "slider",
      signature: "Slider",
      options: { value: 30, disabled: true },
      attrs: { "aria-label": t("demo.slider.brightness") },
    },
  ],
});

/*
 * Two thumbs from the same Zag machine under one host. Neither thumb can be dragged past the other;
 * the machine publishes each thumb's current ARIA bounds and the fill percentages.
 */
export const sliderRangeTree = (t: Translate): UsageTree => ({
  contract: "slider",
  signature: "SliderRange",
  options: {
    lowValue: 20,
    highValue: 80,
    min: 0,
    max: 100,
    lowLabel: t("demo.slider.priceMin"),
    highLabel: t("demo.slider.priceMax"),
  },
});
