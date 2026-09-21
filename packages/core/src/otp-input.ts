import type { ComponentContract } from "./contract.js";

/*
 * OTP INPUT: a one-time code, one native `<input>` per digit, over `@zag-js/pin-input`.
 *
 * SEGMENTS ARE REAL INPUTS, not a single field the machine repaints. Each one keeps native selection,
 * IME and mobile autofill; the machine's whole job is coordinating them: advancing focus, absorbing
 * a pasted code across all of them at once, and keeping one shared value in sync. That is the same
 * bar `Input`/`Textarea` hold the platform to (decision 8), extended over N fields instead of one.
 *
 * `otp` DEFAULTS TO `true` HERE, the one place this contract overrides the machine's own default
 * (Zag ships `false`). It is what turns on `autocomplete="one-time-code"`, the hook iOS and Android
 * read to offer the SMS code as a keyboard suggestion, and forces a numeric keypad on mobile. A
 * contract whose whole reason to exist is one-time codes defaulting that off would be an oversight,
 * not a neutral choice.
 *
 * NO ZAG MACHINE COVERS PASTE-ACROSS-SEGMENTS OR SMS AUTOFILL FROM SCRATCH; that arithmetic is
 * exactly what `@zag-js/pin-input` already is, so this wraps it rather than re-deriving it (decision
 * 10: one machine, two adapters).
 */
export const otpInputParts = {
  root: "sk-otp-input",
  label: "sk-otp-input__label",
  hint: "sk-otp-input__hint",
  control: "sk-otp-input__control",
  segment: "sk-otp-input__segment",
  /** The form participant: one input carrying the whole code, the way `Rating`'s own does. */
  hiddenInput: "sk-otp-input__hidden",
} as const;

export type OtpInputPart = keyof typeof otpInputParts;
export type OtpInputPartClass = (typeof otpInputParts)[OtpInputPart];

export const otpInputAttrs = {
  root: "data-sk-otp-input",
  control: "data-sk-otp-input-control",
  segment: "data-sk-otp-input-segment",
  hiddenInput: "data-sk-otp-input-hidden",
} as const;

/** The DOM events this family dispatches on its root, `sk:<family><event>` like every other. */
export const otpInputEvents = {
  /** Detail: `{ value: string }`. Fires on every keystroke, paste and deletion. */
  valueChange: "sk:otpinputvaluechange",
  /** Detail: `{ value: string }`. Fires once, the instant the last segment fills. */
  valueComplete: "sk:otpinputvaluecomplete",
  /**
   * Detail: `{ char: string, index: number }`. A keystroke or paste that does not match `type`
   * (a letter typed into a numeric code): the WRONG CHARACTER, never the whole code, which is why
   * `char` and not `value`.
   */
  invalid: "sk:otpinputinvalid",
} as const;

export const otpInputContract = {
  id: "otp-input",
  category: "forms",
  css: "@skryensya/core/components/otp-input.css",
  parts: otpInputParts,
  events: otpInputEvents,
  eventDetails: {
    valueChange: { detail: { value: "string" }, reactProp: "onValueChange", source: "root" },
    valueComplete: { detail: { value: "string" }, reactProp: "onValueComplete", source: "root" },
    invalid: { detail: { char: "string", index: "number" }, reactProp: "onValueInvalid", source: "root" },
  },
  hooks: [
    "--sk-otp-input-bg",
    "--sk-otp-input-border-color",
    "--sk-otp-input-fg",
    "--sk-otp-input-gap",
    "--sk-otp-input-hint-color",
    "--sk-otp-input-invalid-border-color",
    "--sk-otp-input-label-color",
    "--sk-otp-input-radius",
    "--sk-otp-input-segment-size",
  ],

  options: {
    /**
     * How many segments the code has. INPUT TO A COMPUTATION rather than an attribute: it decides
     * how many `<input>`s the emitter writes and nothing reads it back off the DOM afterward, the
     * same reason Pagination's `total` never lands on the markup either.
     */
    count: { type: "number", default: 6, min: 1, integer: true, computedInput: true },
    type: { type: "enum", values: ["numeric", "alphanumeric"], default: "numeric", attr: "data-type", machineInput: true },
    /** Password-style dots instead of the typed characters. */
    mask: { type: "boolean", default: false, attr: "data-mask", trueValue: "", machineInput: true },
    /**
     * `autocomplete="one-time-code"` and a numeric keypad on mobile. See this file's own banner.
     * Default TRUE, so nothing is written for the common case; an author who wants it off writes
     * `data-otp="false"` (the same "write only the exception" shape `chart.ts`'s own `labels` uses).
     */
    otp: { type: "boolean", default: true, attr: "data-otp", falseValue: "false", machineInput: true },
    /** Shown in the segment that currently has focus; every other segment stays blank while typing. */
    placeholder: { type: "string", default: "○", attr: "data-placeholder", machineInput: true },
    name: { type: "string", attr: "data-name", machineInput: true },
    /** Initial uncontrolled value, as one string ("123456"); each binding splits it per segment. */
    defaultValue: { type: "string", default: "", attr: "data-default-value", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    readOnly: { type: "boolean", default: false, attr: "data-readonly", trueValue: "", machineInput: true },
    required: { type: "boolean", default: false, attr: "required", trueValue: "", machineInput: true },
    invalid: { type: "boolean", default: false, attr: "data-invalid", trueValue: "", machineInput: true },
    /**
     * Each segment's own accessible name. `{index}` (1-based) and `{count}` stand for the numbers.
     * The default is Zag's own wording, parametrized: its built-in translation is hardcoded English
     * ("pin code 3 of 6"), which is invisible to an author who never reads the library's source and
     * would ship the wrong locale on a Spanish page. Same shape as Rating's own `itemLabel`.
     */
    segmentLabel: { type: "string", default: "Code {index} of {count}", attr: "data-item-label", machineInput: true },
  },

  signatures: {
    OtpInput: {
      intent: ["one-time-code", "otp", "verification-code", "sms-code", "2fa-code", "pin-code"],
      host: { element: "div" },
      options: [
        "count",
        "type",
        "mask",
        "otp",
        "placeholder",
        "name",
        "defaultValue",
        "disabled",
        "readOnly",
        "required",
        "invalid",
        "segmentLabel",
      ],
      /** Host id / a11y beyond the owned label slot. */
      forward: ["id", "aria-*"],
      mount: otpInputAttrs.root,
      slots: {
        /*
         * A slot and not FormField, the same reasoning `number-field.ts`'s own banner states: the
         * machine owns the `for`/id pairing across N segments plus a hidden input, and a FormField's
         * six-id wiring only ever targets ONE control.
         */
        label: { accepts: "text", required: true },
        hint: { accepts: "text" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "label", part: "label", mount: "data-sk-otp-input-label", slot: "label" },
          {
            element: "div",
            part: "control",
            mount: otpInputAttrs.control,
            children: [
              {
                repeatComputed: { window: "otp-segments", from: ["count"], key: "index" },
                element: "input",
                part: "segment",
                also: ["sk-interactive"],
                mount: otpInputAttrs.segment,
                attrs: { type: "text", autocomplete: "off" },
              },
            ],
          },
          {
            element: "input",
            part: "hiddenInput",
            mount: otpInputAttrs.hiddenInput,
            options: ["name", "defaultValue", "disabled", "readOnly", "required"],
            attrs: { type: "text", "aria-hidden": "true", tabindex: "-1" },
          },
          { element: "span", part: "hint", whenGiven: "hint", slot: "hint" },
        ],
      },
      react: { from: "@skryensya/react/otp-input", name: "OtpInput" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated: adding a value to the contract's own enum is the only edit. */
export type OtpInputType = NonNullable<(typeof otpInputContract.options.type)["values"]>[number];
