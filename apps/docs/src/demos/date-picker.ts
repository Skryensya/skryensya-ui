import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The date picker three ways: native, enhanced, and disabled.
 *
 * The native one has its own signature now — `DatePicker.native` — for the reason `Select.native`
 * has one: choosing between them is choosing WHO OWNS the behaviour, the browser or an enhancer, and
 * no flag should be able to stand in for that decision.
 *
 * `timeZone` is a real IANA zone and stays written: it is the same string in every language.
 */

export const datePickerTree = (t: Translate): UsageTree => ({
  contract: "date-picker",
  signature: "DatePicker",
  options: {
    locale: t("demo.datePicker.locale"),
    name: "checkin",
    placeholder: t("demo.datePicker.placeholder"),
    clearLabel: t("demo.datePicker.clear"),
    timeZone: "America/Santo_Domingo",
  },
  slots: { label: t("demo.datePicker.label") },
});

export const datePickerDisabledTree = (t: Translate): UsageTree => ({
  contract: "date-picker",
  signature: "DatePicker",
  options: {
    locale: t("demo.datePicker.locale"),
    placeholder: t("demo.datePicker.placeholder"),
    clearLabel: t("demo.datePicker.clear"),
    disabled: true,
  },
  slots: { label: t("demo.datePicker.label") },
});

/** The layer that works with no script at all: a real `<input type="date">` in the same chrome. */
export const nativeDatePickerTree = (t: Translate): UsageTree => ({
  contract: "date-picker",
  signature: "DatePicker.native",
  options: { name: "arrival", locale: t("demo.datePicker.locale") },
  slots: { label: t("demo.datePicker.label") },
});
