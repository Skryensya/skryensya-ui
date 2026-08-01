import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The enhanced date picker, twice: enabled and disabled.
 *
 * The NATIVE demo on both pages stays authored, and that is not an oversight — the contract has one
 * signature and it is the enhanced control. A bare `<input type="date">` inside the shared field
 * chrome is the no-JS layer, not a composition of this component, so there is nothing to emit.
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
