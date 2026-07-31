import type { ComponentContract } from "./contract.js";

export type InputSize = "sm" | "md" | "lg";

export type InputOptions = {
  size?: InputSize;
  invalid?: boolean;
  disabled?: boolean;
};

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
 * The control a Field wraps. Two signatures over one appearance: `sk-input` goes on `<input>` and on
 * `<textarea>` alike, because visually they are the same control and a second class would be a second
 * set of hooks to keep in step.
 *
 * There is no `invalid` option and no `id`: both arrive from the Field's wiring. A control that
 * carried its own `aria-invalid` could disagree with the error message beside it, and an id the
 * author typed would not be the one the label points at.
 */
export const inputContract = {
  id: "input",
  css: "@skryensya/core/components/input.css",
  parts: inputParts,

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
      parents: ["Field"],
      slots: {},
      template: { element: "input", part: "root", host: true },
      react: { from: "@skryensya/react/input", name: "Input" },
    },

    NativeInput: {
      intent: ["unstyled-native-input", "platform-control", "native-time-input"],
      host: { element: "input" },
      options: ["type", "name", "disabled"],
      slots: {},
      template: { element: "input", host: true },
      react: { from: "@skryensya/react/input", name: "NativeInput" },
    },

    Textarea: {
      intent: ["multi-line-input", "long-text", "comment", "description-entry"],
      host: { element: "textarea" },
      options: ["controlSize", "name", "placeholder", "disabled"],
      parents: ["Field"],
      slots: {},
      template: { element: "textarea", part: "root", host: true },
      react: { from: "@skryensya/react/input", name: "Textarea" },
    },
  },
} as const satisfies ComponentContract;
