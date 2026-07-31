import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/** A bounded quantity with explicit names for both icon-only steppers. */
export const numberFieldTree = (t: Translate): UsageTree => ({
  contract: "number-field",
  signature: "NumberField",
  options: {
    defaultValue: "5",
    decrementLabel: t("demo.numberField.decrement"),
    incrementLabel: t("demo.numberField.increment"),
    max: 20,
    min: 0,
    name: "quantity",
    step: 1,
  },
  slots: { label: t("demo.numberField.label") },
});
