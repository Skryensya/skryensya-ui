import type { ComponentContract } from "./contract.js";

export type NumberFieldValueChangeDetails = {
  value: string;
  valueAsNumber: number;
};

export const numberFieldParts = {
  root: "sk-number-field",
  label: "sk-number-field__label",
  control: "sk-number-field__control",
  input: "sk-number-field__input",
  increment: "sk-number-field__increment",
  decrement: "sk-number-field__decrement",
  scrubber: "sk-number-field__scrubber",
  hint: "sk-number-field__hint",
} as const;

export const numberFieldAttrs = {
  root: "data-sk-number-field",
  label: "data-sk-number-field-label",
  control: "data-sk-number-field-control",
  input: "data-sk-number-field-input",
  increment: "data-sk-number-field-increment",
  decrement: "data-sk-number-field-decrement",
  scrubber: "data-sk-number-field-scrubber",
} as const;

/**
 * A number input that is a composition, not an `<input type="number">`.
 *
 * The native control is unusable in practice — its spinners are unstyleable, its wheel behaviour is
 * hostile, and it silently accepts text that is not a number — so this is `type="text"` with
 * `inputmode="decimal"` and a machine that owns parsing, clamping and locale formatting. The two
 * triggers are real Buttons: the shape, the state layer and the hit target come with them, and Zag
 * writes their accessible names from `translations`.
 *
 * Its label is a slot rather than a Field, because the machine has to own the `for`/`id` pair to
 * keep the announced value in sync with the formatted one.
 */
export const numberFieldContract = {
  id: "number-field",
  css: "@skryensya/core/components/number-field.css",
  parts: numberFieldParts,

  options: {
    /** Submitted with the form. The machine writes it onto the real input. */
    name: { type: "string", attr: "name", machineInput: true },
    /** Initial uncontrolled value. Authored markup puts it on the input; React names the prop. */
    defaultValue: { type: "string", attr: "value", prop: "defaultValue", machineInput: true },
    /** Locale used by the formatter. The vanilla enhancer inherits it from the root's `lang`. */
    locale: { type: "string", attr: "lang", machineInput: true },
    min: { type: "number", attr: "min", machineInput: true },
    max: { type: "number", attr: "max", machineInput: true },
    step: { type: "number", attr: "step", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "", machineInput: true },
    readOnly: { type: "boolean", default: false, attr: "readonly", trueValue: "", machineInput: true },
    required: { type: "boolean", default: false, attr: "required", trueValue: "", machineInput: true },
    /*
     * The triggers are icon-only, so these ARE their accessible names. Authored markup carries them
     * as `aria-label`; React passes them as `translations` and Zag writes the same attribute back.
     */
    decrementLabel: { type: "string", default: "Disminuir", attr: "aria-label", machineInput: true },
    incrementLabel: { type: "string", default: "Aumentar", attr: "aria-label", machineInput: true },
  },

  signatures: {
    NumberField: {
      intent: ["number-input", "quantity", "stepper", "amount", "spinner"],
      host: { element: "div" },
      options: [
        "name",
        "defaultValue",
        "locale",
        "min",
        "max",
        "step",
        "disabled",
        "readOnly",
        "required",
        "decrementLabel",
        "incrementLabel",
      ],
      slots: { label: { accepts: "text", required: true } },
      mount: "data-sk-number-field",
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "label", part: "label", mount: "data-sk-number-field-label", slot: "label" },
          {
            element: "div",
            part: "control",
            mount: "data-sk-number-field-control",
            children: [
              {
                element: "button",
                part: "decrement",
                also: ["sk-button", "sk-interactive"],
                mount: "data-sk-number-field-decrement",
                options: ["decrementLabel"],
                attrs: { type: "button", "data-variant": "ghost", "data-size": "sm", "data-icon-only": "" },
                children: [{ element: "span", attrs: { "data-sk-icon": "remove", "data-sk-icon-size": "sm" } }],
              },
              {
                element: "input",
                part: "input",
                mount: "data-sk-number-field-input",
                options: ["name", "defaultValue", "min", "max", "step", "disabled", "readOnly", "required"],
                attrs: { type: "text", inputmode: "decimal", autocomplete: "off" },
              },
              {
                element: "button",
                part: "increment",
                also: ["sk-button", "sk-interactive"],
                mount: "data-sk-number-field-increment",
                options: ["incrementLabel"],
                attrs: { type: "button", "data-variant": "ghost", "data-size": "sm", "data-icon-only": "" },
                children: [{ element: "span", attrs: { "data-sk-icon": "add", "data-sk-icon-size": "sm" } }],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/number-field", name: "NumberField" },
    },
  },
} as const satisfies ComponentContract;
