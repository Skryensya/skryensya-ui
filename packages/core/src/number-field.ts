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
  hint: "sk-number-field__hint",
} as const;

export const numberFieldAttrs = {
  root: "data-sk-number-field",
  label: "data-sk-number-field-label",
  control: "data-sk-number-field-control",
  input: "data-sk-number-field-input",
  increment: "data-sk-number-field-increment",
  decrement: "data-sk-number-field-decrement",
} as const;

/**
 * A number input that is a composition, not an `<input type="number">`.
 *
 * The native control is unusable in practice: its spinners are unstyleable, its wheel behaviour is
 * hostile, and it silently accepts text that is not a number. So this is `type="text"` with
 * `inputmode="decimal"` and a machine that owns parsing, clamping and locale formatting. The two
 * triggers are real Buttons: the shape, the state layer and the hit target come with them, and Zag
 * writes their accessible names from `translations`.
 *
 * Its label is a slot rather than a FormField, because the machine has to own the `for`/`id` pair to
 * keep the announced value in sync with the formatted one.
 */
/** The DOM events this family dispatches on its root, `sk:<family><event>` like every other. */
export const numberFieldEvents = {
  /** Detail: `{ value: string, valueAsNumber: number }`. */
  valueChange: "sk:numberfieldvaluechange",
} as const;

export const numberFieldContract = {
  id: "number-field",
  category: "forms",
  css: "@skryensya/core/components/number-field.css",
  parts: numberFieldParts,
  events: numberFieldEvents,
  eventDetails: {
    valueChange: { detail: { value: "string", valueAsNumber: "number" }, reactProp: "onValueChange", source: "root", trigger: "input" },
  },
  hooks: [
    "--sk-number-field-bg",
    "--sk-number-field-border-color",
    "--sk-number-field-border-width",
    "--sk-number-field-fg",
    "--sk-number-field-gap",
    "--sk-number-field-hint-color",
    "--sk-number-field-invalid-border-color",
    "--sk-number-field-label-color",
    "--sk-number-field-min-inline-size",
    "--sk-number-field-radius",
    "--sk-number-field-shadow",
    "--sk-number-field-step-color",
    "--sk-number-field-step-inset",
    "--sk-number-field-step-radius",
    "--sk-number-field-wash",
  ],

  options: {
    /** Submitted with the form. The machine writes it onto the real input. */
    name: { type: "string", attr: "name", machineInput: true },
    /** Initial uncontrolled value. Authored markup puts it on the input; React names the prop. */
    defaultValue: { type: "string", attr: "value", prop: "defaultValue", machineInput: true },
    /** Locale used by the formatter. The vanilla enhancer inherits it from the root's `lang`. */
    locale: { type: "string", default: "en", attr: "lang", machineInput: true },
    /** Inclusive floor. When both ends are authored, must sit at or below `max`. */
    min: { type: "number", attr: "min", machineInput: true, between: { max: "max" } },
    /** Inclusive ceiling. When both ends are authored, must sit at or above `min`. */
    max: { type: "number", attr: "max", machineInput: true, between: { min: "min" } },
    step: { type: "number", attr: "step", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "", machineInput: true },
    readOnly: { type: "boolean", default: false, attr: "readonly", trueValue: "", machineInput: true },
    required: { type: "boolean", default: false, attr: "required", trueValue: "", machineInput: true },
    /**
     * The field failed validation. Paints the control (`[data-invalid]`) AND feeds Zag so the
     * spinbutton is `aria-invalid`. React already had the prop; authored markup had neither.
     */
    invalid: { type: "boolean", default: false, attr: "data-invalid", trueValue: "", machineInput: true },
    /*
     * The triggers are icon-only, so these ARE their accessible names. Authored markup carries them
     * as `aria-label`; React passes them as `translations` and Zag writes the same attribute back.
     */
    decrementLabel: { type: "string", default: "Decrease", attr: "aria-label", machineInput: true },
    incrementLabel: { type: "string", default: "Increase", attr: "aria-label", machineInput: true },
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
        "invalid",
        "decrementLabel",
        "incrementLabel",
      ],
      /** Host id / a11y names beyond owned label and machine name. */
      forward: ["id", "aria-*"],
      slots: {
        label: { accepts: "text", required: true },
        hint: { accepts: "text" },
      },
      mount: "data-sk-number-field",
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
      ],
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
          { element: "span", part: "hint", whenGiven: "hint", slot: "hint" },
        ],
      },
      react: { from: "@skryensya/react/number-field", name: "NumberField" },
    },
  },
} as const satisfies ComponentContract;
