import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { radioGroupItems, tileRadioGroupItems } from "./data/radio-group";

/* Native and tile radio groups share one authored choice model: see `data/radio-group.ts`. */

/** An exclusive choice between three plans. */
export const radioGroupTree = (t: Translate): UsageTree => ({
  contract: "radio-group",
  signature: "RadioGroup",
  options: { name: "plan", value: "pro", orientation: "vertical" },
  attrs: { "aria-label": t("demo.radioGroup.label") },
  slots: { items: radioGroupItems },
});

export const tileRadioGroupTree = (t: Translate): UsageTree => ({
  contract: "tile",
  signature: "TileRadioGroup",
  options: { name: "plan-tile", defaultValue: "pro", orientation: "horizontal" },
  attrs: { "aria-label": t("demo.radioGroup.label") },
  slots: { items: tileRadioGroupItems(t) },
});
