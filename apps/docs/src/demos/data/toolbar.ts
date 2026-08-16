import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/** The screen presets one of the nested toolbar's radiogroups offers. */
export const toolbarScreenItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "free" }, slots: { label: t("demo.toolbar.free") } },
  { options: { value: "tablet" }, slots: { label: t("demo.toolbar.tablet") } },
  { options: { value: "mobile" }, slots: { label: t("demo.toolbar.mobile") } },
];

/** The bindings the other one offers. Both names are written, in every locale. */
export const toolbarBindingItems: readonly ItemInput[] = [
  { options: { value: "vanilla" }, slots: { label: "Vanilla" } },
  { options: { value: "react" }, slots: { label: "React" } },
];
