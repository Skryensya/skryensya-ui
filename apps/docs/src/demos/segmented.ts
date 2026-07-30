import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Three ranges, the first selected. The group's name goes in `attrs`, not `options`: `aria-label` is
 * passed to the host untouched, and Segmented's contract does not map it.
 */
export const segmentedTree = (t: Translate): UsageTree => ({
  contract: "segmented",
  signature: "Segmented",
  options: { value: "day" },
  attrs: { "aria-label": t("demo.segmented.label") },
  slots: {
    items: [
      { options: { value: "day" }, slots: { label: t("demo.segmented.day") } },
      { options: { value: "week" }, slots: { label: t("demo.segmented.week") } },
      { options: { value: "month" }, slots: { label: t("demo.segmented.month") } },
    ],
  },
});
