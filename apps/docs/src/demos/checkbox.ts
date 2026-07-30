import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/**
 * Only the basic checkbox is authorable today. The parent/children demo derives indeterminate
 * state, and TileCheckbox uses a surface signature that the published catalogue does not expose.
 */
export const checkboxTree = (t: Translate): UsageTree => ({
  contract: "checkbox",
  signature: "Checkbox",
  options: { name: "alerts", value: "email" },
  children: t("demo.checkbox.emailAlerts"),
});
