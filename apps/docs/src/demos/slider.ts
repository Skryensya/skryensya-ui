import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Two ranges side by side, one enabled and one disabled.
 *
 * It converts because `value` now says WHERE THE THUMB STARTS in both bindings: the contract spells
 * it `value` in markup and `defaultValue` in React. Emitting React's `value` made the control
 * controlled with no handler to change it, so the demo rendered a slider nobody could move.
 */
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
