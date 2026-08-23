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
  /*
   * `class` rides through to the root untouched by the contract (see `attrs`'s own doc). Without
   * it the root is a bare, unstyled `div`: its items are `label`s with no layout declared for
   * their PARENT, so they stack as plain blocks flush against each other. `sk-inline` (flex row)
   * looks like the fix but is not: `.sk-tile--interactive:where(label){inline-size:100%}` makes
   * every item claim the FULL flex line, so a row of them still stacks one per line. `sk-tile-grid`
   * is tile.css's own gutter utility for exactly this — a grid track bounds each item's 100% to its
   * own column instead of the whole row, which is what actually puts them side by side with a gap.
   */
  attrs: { "aria-label": t("demo.radioGroup.label"), class: "sk-tile-grid" },
  slots: { items: tileRadioGroupItems(t) },
});
