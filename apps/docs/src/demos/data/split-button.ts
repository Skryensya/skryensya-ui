import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/** The variants of the default action, which is everything the split half of the button offers. */
export const splitButtonMenuItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "save-copy" }, slots: { label: t("demo.splitButton.copy") } },
  { options: { value: "save-template" }, slots: { label: t("demo.splitButton.template") } },
];
