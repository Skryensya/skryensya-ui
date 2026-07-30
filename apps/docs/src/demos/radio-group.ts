import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * One of the page's two demos converts. The other, TileRadioGroup, does not and cannot yet: it
 * writes `sk-tile__title` and `sk-tile__description`, and no signature emits either — Tile's
 * template is a host with a `children` slot, with no TileTitle/TileDescription to nest inside it.
 * A title-and-description tile IS the point of that demo, so it stays authored rather than being
 * flattened into something the contract happens to be able to say.
 *
 * This one was blocked too until a moment ago, and the page said so in a comment. The contract
 * declared `value` but not the React name for it, so the emitter wrote `value` — React's CONTROLLED
 * prop — and the demo would have rendered a group nobody could change. `prop: "defaultValue"` is
 * the same one-line fix Slider, Tabs and TimeField already carry.
 */

/** An exclusive choice between three plans. Plan names are product nouns and stay written. */
export const radioGroupTree = (t: Translate): UsageTree => ({
  contract: "radio-group",
  signature: "RadioGroup",
  options: { name: "plan", value: "pro", orientation: "vertical" },
  attrs: { "aria-label": t("demo.radioGroup.label") },
  slots: {
    items: [
      { options: { value: "basic" }, slots: { label: "Basic" } },
      { options: { value: "pro" }, slots: { label: "Professional" } },
      { options: { value: "enterprise" }, slots: { label: "Enterprise" } },
    ],
  },
});
