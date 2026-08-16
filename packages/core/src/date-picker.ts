import type { ComponentContract } from "./contract.js";
export type { DateValue } from "@zag-js/date-picker";

/*
 * The two DatePicker-only strings that Zag's `defaultTranslations` also hardcodes in English: the
 * trigger button's open/close label and the popover's own accessible name. See `calendar.ts` for
 * the shared day/view/prev/next ones — this file only adds what `Calendar` never renders.
 */
const isEnglishLocale = (locale: string) => locale.toLocaleLowerCase().startsWith("en");

export function defaultTriggerLabel(locale: string) {
  const en = isEnglishLocale(locale);
  return (open: boolean) =>
    open ? (en ? "Close calendar" : "Cerrar calendario") : en ? "Open calendar" : "Abrir calendario";
}

export function defaultContentLabel(locale: string) {
  return isEnglishLocale(locale) ? "calendar" : "calendario";
}

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
 * DATE PICKER: the contract; half authored, half derived, and the split is the whole design.
 *
 * The CONTROL is markup: a label, an input, a clear control and the button that opens the panel. The
 * enhancer finds those by their part classes and patches them, which is why the template has to draw
 * them and why getting one wrong is a runtime throw rather than a quiet miss. The CALENDAR is not
 * markup at all; it is derived from the machine's state, so both bindings generate it and neither
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
     * `defaultValue`; `value` there is the CONTROLLED prop.
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
    /**
     * Names the control that wipes the date. An option rather than a literal in the template: this
     * is the only user-visible STRING the component emits on its own, and a hardcoded one renders
     * Spanish on an English page.
     */
    clearLabel: { type: "string", default: "Limpiar", attr: "aria-label" },
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
        "clearLabel",
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
                options: ["clearLabel"],
                attrs: {
                  type: "button",
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

    /*
     * THE NATIVE DATE FIELD: the layer that works with no script at all.
     *
     * A real `<input type="date">` inside the same field chrome, so the enhanced control and this
     * one read as the SAME field rather than two designs. The browser owns the picker, the keyboard,
     * the locale format and form submission; the system contributes the label wiring and the box.
     *
     * Its own signature rather than an option on `DatePicker`, for the reason `Select.native` is
     * one: choosing between them is choosing who owns the behaviour, and no flag should be able to
     * stand in for that decision. There is no enhancer here and there is nothing to enhance.
     */
    "DatePicker.native": {
      intent: ["a-standard-date-field", "form-field", "no-javascript"],
      host: { element: "div" },
      options: ["name", "locale"],
      slots: {
        /** Names the field. Required: a bare date input announces only its format. */
        label: { accepts: "text", required: true },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "label", part: "label", slot: "label" },
          {
            element: "div",
            part: "control",
            children: [
              {
                element: "input",
                part: "input",
                attrs: { type: "date" },
                options: ["name", "locale"],
                /* The enhanced control reads these off data-attributes because its enhancer has no
                   other channel. A native input wants the real ones; the browser is the consumer
                   here, not a script. */
                optionAttrs: { name: "name", locale: "lang" },
                /*
                 * NAMED BY `aria-labelledby`, not by `for`, and the reason is the stage rather
                 * than the markup. `for`/`id` is the better pair here; it also focuses the input
                 * when the label is clicked, which on a date field is most of what a label is for;
                 * but it needs an AUTHORED id, and both bindings render into one document in the
                 * gate, so any literal id collides and each label reaches the other binding's input.
                 * The generated kind is prefixed per case and cannot. Worth revisiting if the stage
                 * ever gives each binding its own document.
                 */
                labelledBySlot: "label",
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/date-picker", name: "NativeDatePicker" },
    },

  },
} as const satisfies ComponentContract;
