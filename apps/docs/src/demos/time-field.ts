import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The segmented shell. Locale is owned by the page (`es-DO` / `en-US`) so the hour cycle the stage
 * teaches matches the language around it. `value` lands as `data-value` in markup and `defaultValue`
 * in React — the same binding-aware rename Slider uses.
 *
 * The native `<input type="time">` demo stays authored: there is no contract for a platform control.
 */

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
