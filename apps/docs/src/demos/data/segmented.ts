import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/** The three ranges a Segmented offers, which is the only thing that differs between its demos. */
export const segmentedItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "day" }, slots: { label: t("demo.segmented.day") } },
  { options: { value: "week" }, slots: { label: t("demo.segmented.week") } },
  { options: { value: "month" }, slots: { label: t("demo.segmented.month") } },
];
