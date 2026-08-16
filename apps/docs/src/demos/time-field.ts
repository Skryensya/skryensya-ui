import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Segmented and native time controls share the page's locale-owned field name. */

/** A departure time, already set. Locale and field name are owned by the page. */
export const timeFieldTree = (
  t: Translate,
  opts: { locale: string; name: string },
): UsageTree => ({
  contract: "time-field",
  signature: "TimeField",
  options: {
    locale: opts.locale,
    value: "09:30",
    name: opts.name,
  },
  slots: { label: t("demo.timeField.label") },
});

export const timeFieldNativeTree = (
  t: Translate,
  opts: { name: string },
): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.timeField.label") },
  children: {
    contract: "input",
    signature: "NativeInput",
    options: { type: "time", name: opts.name },
  },
});
