import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { segmentedItems } from "./data/segmented";

/** Three ranges, the first selected. */
export const segmentedTree = (t: Translate): UsageTree => ({
  contract: "segmented",
  signature: "Segmented",
  options: { value: "day", label: t("demo.segmented.label") },
  slots: { items: segmentedItems(t) },
});
