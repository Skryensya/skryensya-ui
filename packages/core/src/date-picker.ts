export type { DateValue } from "@zag-js/date-picker";

export type DatePickerSelectionMode = "single" | "range";

// El chrome del calendario (encabezado, grillas, vistas, `getTwoLetterWeekdayLabel`) vive en
// `./calendar.js`, no acá: DatePicker sólo posee el campo editable que lo abre.

export const datePickerParts = {
  root: "sk-date-picker",
  label: "sk-date-picker__label",
  control: "sk-date-picker__control",
  input: "sk-date-picker__input",
  trigger: "sk-date-picker__trigger",
  clear: "sk-date-picker__clear",
  positioner: "sk-date-picker__positioner",
  content: "sk-date-picker__content",
} as const;

export const datePickerAttrs = {
  root: "data-sk-date-picker",
  label: "data-sk-date-picker-label",
  control: "data-sk-date-picker-control",
  input: "data-sk-date-picker-input",
  trigger: "data-sk-date-picker-trigger",
  clear: "data-sk-date-picker-clear",
  positioner: "data-sk-date-picker-positioner",
  content: "data-sk-date-picker-content",
} as const;

export type DatePickerValueChangeDetails = { value: string[] };
