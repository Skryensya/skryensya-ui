import type { ComponentContract, OptionValue } from "./contract.js";
import { inputFormatNames } from "./input-format.js";

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
/*
 * The one channel authored markup has for hearing the result of a `format` check. React gets the
 * same result through `onValidate`; both carry the identical detail, which is what keeps a consumer
 * on either side able to write its own message instead of the default one.
 */
export const inputEvents = {
  /** Detail: `{ ok: boolean, reason?: InputFormatReason, normalized?: string }`. */
  validate: "sk:inputvalidate",
} as const;

export const inputContract = {
  id: "input",
  category: "forms",
  css: "@skryensya/core/components/input.css",
  parts: inputParts,
  events: inputEvents,
  eventDetails: {
    validate: {
      detail: { ok: "boolean", reason: "InputFormatReason | undefined", normalized: "string | undefined" },
      reactProp: "onValidate",
      source: "root",
      /* No `trigger`: the root itself is what fires this, on typing and on leaving the field, and
         one pass is the enhancer's own on mount. There is no separate part a person activates. */
    },
  },
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
    /**
     * Validation the control owns, for the values the platform has no check for.
     *
     * NOT a `pattern`, and the difference is the whole reason this is an option rather than a
     * regular expression on the markup: a RUT's check digit is arithmetic and a Chilean phone
     * number is a numbering plan, neither of which a regular expression can express. Each value
     * names a real validator in `@skryensya/core/input-format`, and what a format decides is "is
     * this a real one", never "does this look like one".
     *
     * Composes with `type` rather than replacing it: `format="email"` on a `type="email"` input
     * keeps the platform's own keyboard and its own check, and adds the one the platform omits.
     *
     * An EMPTY field never fails a format. Emptiness is `required`'s question, and FormField's
     * wiring already delivers that one.
     */
    format: { type: "enum", values: inputFormatNames, attr: "data-format" },
    /**
     * Which country's numbering plan reads a national-format phone number, as an ISO 3166-1 alpha-2
     * code ("CL", "AR", "US"). Only `format="phone"` uses it.
     *
     * Optional, and its absence is a supported composition rather than an oversight: a field that
     * expects `+56 9 ...` needs no default, because the number says which plan it belongs to. What
     * the option buys is letting someone type `912345678`, which is what a person in Chile filling
     * in a Chilean form actually types. Without either, the value is reported as `country` rather
     * than as malformed, because it is the FIELD that is underspecified and not the value.
     *
     * Not an enum: the list is ISO's, it has 249 entries, and restating it here would be a second
     * copy of a standard going stale in a contract.
     */
    country: { type: "string", attr: "data-country", pattern: { source: "^[A-Z]{2}$", example: "CL" } },
    /**
     * Replaces the message a failed `format` would have written, for a field whose own wording is
     * better than the default ("Check the RUT on your carnet" beats "That check digit does not
     * match"). One sentence for the whole control: a consumer that wants a different message per
     * reason listens for `sk:inputvalidate` / `onValidate` and reads `reason` off the detail.
     */
    errorLabel: { type: "string", attr: "data-error-label" },
  },

  signatures: {
    Input: {
      intent: ["text-entry", "single-line-input", "email", "password", "search-field"],
      host: { element: "input" },
      options: ["controlSize", "type", "name", "placeholder", "disabled", "format", "country", "errorLabel"],
      /*
       * NO `mount` ATTRIBUTE, unlike most enhanced signatures, and it is worth saying why rather
       * than reading as an omission. `format` already writes `data-format`, which is the only state
       * there is to enhance, so a `data-sk-input` beside it would carry no information a selector
       * cannot already get. It is not free either: it pushed every emitted Input past the emitter's
       * print width, turning one-line markup into six in every code sample on the site, for an
       * attribute that means nothing on the ordinary text fields that are most of them.
       *
       * `runtime/registry.ts` selects `input[data-format]`, qualified by ELEMENT because `chart`
       * writes a `data-format` of its own for currency formatting and the two must not collide.
       */
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
