import type { ComponentContract } from "./contract.js";
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

/*
 * DATE PICKER, the contract — half authored, half derived, and the split is the whole design.
 *
 * The CONTROL is markup: a label, an input, a clear control and the button that opens the panel. The
 * enhancer finds those by their part classes and patches them, which is why the template has to draw
 * them and why getting one wrong is a runtime throw rather than a quiet miss. The CALENDAR is not
 * markup at all — it is derived from the machine's state, so both bindings generate it and neither
 * composition nor template says anything about it, exactly as in `calendarContract`.
 *
 * `value`, `min` and `max` are new to the enhancer, which read none of them: an authored date picker
 * could not express a starting date or a permitted range, while the React binding accepted all three
 * and the other half dropped them.
 */
export const datePickerContract = {
  id: "date-picker",
  css: "@skryensya/core/components/date-picker.css",
  parts: datePickerParts,

  options: {
    /** Submitted under this name. */
    name: { type: "string", attr: "data-name", machineInput: true },
    /**
     * The starting date, ISO. Space-separated names both ends of a range. React spells it
     * `defaultValue` — `value` there is the CONTROLLED prop.
     */
    value: { type: "string", attr: "data-value", prop: "defaultValue", machineInput: true },
    min: { type: "string", attr: "data-min", machineInput: true },
    max: { type: "string", attr: "data-max", machineInput: true },
    selectionMode: {
      type: "enum",
      values: ["single", "range"],
      default: "single",
      attr: "data-selection-mode",
      machineInput: true,
    },
    locale: { type: "string", default: "es", attr: "data-locale", machineInput: true },
    timeZone: { type: "string", default: "UTC", attr: "data-time-zone", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    readOnly: { type: "boolean", default: false, attr: "data-readonly", trueValue: "", machineInput: true },
    required: { type: "boolean", default: false, attr: "data-required", trueValue: "", machineInput: true },
    /** Shown in the input while it is empty. */
    placeholder: { type: "string", attr: "placeholder" },
  },

  signatures: {
    DatePicker: {
      intent: ["pick-a-date-in-a-form", "date-field", "calendar-behind-an-input"],
      host: { element: "div" },
      mount: "data-sk-date-picker",
      options: [
        "name",
        "value",
        "min",
        "max",
        "selectionMode",
        "locale",
        "timeZone",
        "disabled",
        "readOnly",
        "required",
        "placeholder",
      ],
      portals: true,
      slots: {
        /** Names the field. */
        label: { accepts: "text" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "label", part: "label", slot: "label", whenGiven: "label" },
          {
            /* The anchor is the whole control, not the calendar button: the panel lines up with the
             * field it is editing. */
            element: "div",
            part: "control",
            also: ["sk-anchor"],
            children: [
              { element: "input", part: "input", options: ["placeholder"] },
              {
                element: "button",
                part: "clear",
                also: ["sk-button", "sk-interactive"],
                attrs: {
                  type: "button",
                  "aria-label": "Limpiar",
                  "data-icon-only": "",
                  "data-size": "sm",
                  "data-variant": "ghost",
                },
                children: [
                  { element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "sm" } },
                ],
              },
              {
                element: "button",
                part: "trigger",
                also: ["sk-button", "sk-interactive"],
                attrs: {
                  type: "button",
                  "data-icon-only": "",
                  "data-size": "sm",
                  "data-variant": "ghost",
                },
                children: [
                  { element: "span", attrs: { "data-sk-icon": "calendar", "data-sk-icon-size": "sm" } },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/date-picker", name: "DatePicker" },
    },
  },
} as const satisfies ComponentContract;
