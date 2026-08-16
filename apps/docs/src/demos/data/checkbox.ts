import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/** The permissions a CheckboxGroup offers, one of them checked from the start. */
export const checkboxGroupItems = (t: Translate): readonly ItemInput[] => [
  {
    options: { value: "read", defaultChecked: true },
    slots: { label: t("demo.checkbox.read") },
  },
  { options: { value: "write" }, slots: { label: t("demo.checkbox.write") } },
  { options: { value: "admin" }, slots: { label: t("demo.checkbox.admin") } },
];
