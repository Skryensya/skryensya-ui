import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * One appearance contract for every native text control: `sk-input` goes on `<input>`,
 * `<textarea>` and any other native text entry element. A second class per element would be a
 * second set of hooks to keep in sync for what is, visually, the same control.
 */
export const inputParts = {
  root: "sk-input",
} as const;

export type InputPart = keyof typeof inputParts;
export type InputPartClass = (typeof inputParts)[InputPart];

/*
 * The control a FormField wraps. Two signatures over one appearance: `sk-input` goes on `<input>` and
 * on `<textarea>` alike, because visually they are the same control and a second class would be a
 * second set of hooks to keep in step.
 *
 * There is no `invalid` option and no `id`: both arrive from the FormField's wiring. A control that
 * carried its own `aria-invalid` could disagree with the error message beside it, and an id the
 * author typed would not be the one the label points at.
 */
export const inputContract = {
  id: "input",
  category: "forms",
  css: "@skryensya/core/components/input.css",
  parts: inputParts,
  hooks: [
    "--sk-input-bg",
    "--sk-input-border-color",
    "--sk-input-border-width",
    "--sk-input-disabled-bg",
    "--sk-input-disabled-border-color",
    "--sk-input-disabled-fg",
    "--sk-input-fg",
    "--sk-input-font-size",
    "--sk-input-gap",
    "--sk-input-height",
    "--sk-input-invalid-border-color",
    "--sk-input-invalid-fg",
    "--sk-input-line-height",
    "--sk-input-padding-x",
    "--sk-input-padding-y",
    "--sk-input-placeholder-fg",
    "--sk-input-radius",
    "--sk-input-readonly-bg",
    "--sk-input-readonly-border-color",
    "--sk-input-shadow",
    "--sk-input-wash",
  ],

  options: {
    /** Named `controlSize` in the binding: `size` is already a native attribute of `<input>`. */
    controlSize: { type: "enum", values: ["sm", "md", "lg"], attr: "data-size" },
    /**
     * The native type. Its default is declared here rather than left implicit: React writes
     * type="text" and authored markup omitting it would read as a divergence at G2 that is not one.
     */
    type: { type: "string", default: "text", attr: "type" },
    name: { type: "string", attr: "name" },
    placeholder: { type: "string", attr: "placeholder" },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
  },

  signatures: {
    Input: {
      intent: ["text-entry", "single-line-input", "email", "password", "search-field"],
      host: { element: "input" },
      options: ["controlSize", "type", "name", "placeholder", "disabled"],
      /*
       * Native control state the CSS already paints (`:read-only`) and seed values. `id` /
       * `aria-invalid` normally arrive from FormField wiring; authored `id` is still accepted when
       * a tree stands the control alone or pins a known id.
       */
      forward: ["id", "readonly", "value", "autocomplete", "required", "maxlength", "minlength", "pattern", "min", "max", "step", "aria-*"],
      parents: ["FormField"],
      slots: {},
      template: { element: "input", part: "root", host: true },
      react: { from: "@skryensya/react/input", name: "Input" },
    },

    /*
     * "Native" names the CONTROL (a real `<input type="time">`, `<input type="color">`), never
     * a refusal of the shared appearance: this still carries `sk-input` and may take `controlSize`,
     * the same class and height channel `Input`/`Textarea` use. A native time input with no border,
     * no shared height and a focus ring the browser invented is not what "native" was meant to
     * buy here, only the platform owning selection/keyboard/validation/IME is. It has no `parents`
     * so it can stand alone (with an authored name) or sit under FormField for label wiring.
     */
    NativeInput: {
      intent: ["styled-native-input", "platform-control", "native-time-input"],
      host: { element: "input" },
      options: ["controlSize", "type", "name", "disabled"],
      forward: ["id", "readonly", "value", "autocomplete", "required", "maxlength", "minlength", "pattern", "min", "max", "step", "aria-*"],
      /*
       * `type` is the whole point of this signature: without it NativeInput is just Input that
       * skipped FormField. Require it so a tree cannot quietly pick NativeInput for a plain text
       * field.
       */
      requires: ["type"],
      slots: {},
      template: { element: "input", part: "root", host: true },
      react: { from: "@skryensya/react/input", name: "NativeInput" },
    },

    Textarea: {
      intent: ["multi-line-input", "long-text", "comment", "description-entry"],
      host: { element: "textarea" },
      options: ["controlSize", "name", "placeholder", "disabled"],
      forward: ["id", "readonly", "value", "autocomplete", "required", "maxlength", "minlength", "rows", "cols", "aria-*"],
      parents: ["FormField"],
      slots: {},
      template: { element: "textarea", part: "root", host: true },
      react: { from: "@skryensya/react/input", name: "Textarea" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated: adding a size to the contract's `controlSize` enum is the only edit. */
export type InputSize = OptionValue<typeof inputContract.options.controlSize>;
