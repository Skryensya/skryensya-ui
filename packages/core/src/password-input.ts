import type { ComponentContract } from "./contract.js";

/*
 * PASSWORD INPUT, a password field with a show/hide toggle, on `@zag-js/password-input` (the SAME
 * machine in both bindings, through `@skryensya/core/machines`, ADR-0010).
 *
 * Zag owns the visibility state, the `type` swap between `password` and `text`, the label/input ids,
 * the toggle's name and `aria-expanded`, and hiding the value again on submit and reset, so a
 * revealed password never survives into the next page or a cleared form.
 *
 * WHAT IS OURS AND NOT ZAG'S: the keyboard. Zag's toggle is `tabIndex: -1` and listens only to
 * `pointerdown` (it keeps focus in the field while you click). A keyboard user can neither reach it
 * nor press it, which fails WCAG 2.1.1. Both bindings make it a tab stop again and toggle on a click
 * whose `detail` is 0, the click a keyboard produces. A pointer click still goes through Zag's
 * `pointerdown` alone: its `detail` is 1, so it is never counted twice.
 *
 * Its label is a slot rather than a FormField, for NumberField's reason: the machine has to own the
 * `for`/`id` pair.
 */

export const passwordInputParts = {
  root: "sk-password-input",
  label: "sk-password-input__label",
  control: "sk-password-input__control",
  input: "sk-password-input__input",
  /** The show/hide button. An icon-only Button, composed. */
  visibilityTrigger: "sk-password-input__visibility-trigger",
  hint: "sk-password-input__hint",
} as const;

export type PasswordInputPart = keyof typeof passwordInputParts;

export const passwordInputAttrs = {
  root: "data-sk-password-input",
  label: "data-sk-password-input-label",
  control: "data-sk-password-input-control",
  input: "data-sk-password-input-input",
  visibilityTrigger: "data-sk-password-input-trigger",
  /** On the trigger: its accessible name while the password is shown. `aria-label` holds the other. */
  hideLabel: "data-hide-label",
  defaultVisible: "data-default-visible",
  ignorePasswordManagers: "data-ignore-password-managers",
} as const;

/** The DOM events this family dispatches on its root, `sk:<family><event>` like every other. */
export const passwordInputEvents = {
  /** Detail: `{ visible: boolean }`. */
  visibilityChange: "sk:passwordinputvisibilitychange",
} as const;

/** A click the keyboard produced (Enter or Space on a focused button), not a pointer. */
export function isKeyboardClick(event: { readonly detail: number }): boolean {
  return event.detail === 0;
}

export const passwordInputContract = {
  id: "password-input",
  category: "forms",
  css: "@skryensya/core/components/password-input.css",
  parts: passwordInputParts,
  events: passwordInputEvents,
  eventDetails: {
    visibilityChange: {
      detail: { visible: "boolean" },
      reactProp: "onVisibilityChange",
      source: "root",
      trigger: "visibilityTrigger",
    },
  },
  hooks: [
    "--sk-password-input-bg",
    "--sk-password-input-border-color",
    "--sk-password-input-border-width",
    "--sk-password-input-fg",
    "--sk-password-input-gap",
    "--sk-password-input-hint-color",
    "--sk-password-input-invalid-border-color",
    "--sk-password-input-label-color",
    "--sk-password-input-min-inline-size",
    "--sk-password-input-radius",
    "--sk-password-input-shadow",
    "--sk-password-input-toggle-color",
    "--sk-password-input-toggle-inset",
    "--sk-password-input-toggle-radius",
    "--sk-password-input-wash",
  ],

  options: {
    /** Submitted with the form. */
    name: { type: "string", attr: "name", machineInput: true },
    /**
     * What the browser and a password manager should do: fill a saved password (`current-password`,
     * a sign-in) or offer to generate and save one (`new-password`, a sign-up or a change).
     */
    autoComplete: {
      type: "enum",
      values: ["current-password", "new-password"],
      default: "current-password",
      attr: "autocomplete",
      machineInput: true,
    },
    placeholder: { type: "string", attr: "placeholder" },
    /** Start with the password shown. For a field whose value is being chosen, never for a sign-in. */
    defaultVisible: { type: "boolean", default: false, attr: "data-default-visible", trueValue: "", machineInput: true },
    /**
     * Tell the common password managers to leave this field alone: a one-off secret, a PIN, a field
     * that is a password in shape but not an account's. Zag writes their five opt-out attributes.
     */
    ignorePasswordManagers: {
      type: "boolean",
      default: false,
      attr: "data-ignore-password-managers",
      trueValue: "",
      machineInput: true,
    },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "", machineInput: true },
    readOnly: { type: "boolean", default: false, attr: "readonly", trueValue: "", machineInput: true },
    required: { type: "boolean", default: false, attr: "required", trueValue: "", machineInput: true },
    /** Paints the control and makes the input `aria-invalid`, like NumberField. */
    invalid: { type: "boolean", default: false, attr: "data-invalid", trueValue: "", machineInput: true },
    /*
     * The toggle is icon-only, so these ARE its accessible names, one per state. Authored markup
     * carries the resting one as `aria-label` and the other as `data-hide-label`; React passes both
     * as `translations` and Zag writes the right one back.
     */
    showLabel: { type: "string", default: "Show password", attr: "aria-label", machineInput: true },
    hideLabel: { type: "string", default: "Hide password", attr: "data-hide-label", machineInput: true },
  },

  signatures: {
    PasswordInput: {
      intent: ["password", "password-field", "show-hide-password", "sign-in-password", "new-password"],
      host: { element: "div" },
      options: [
        "name",
        "autoComplete",
        "placeholder",
        "defaultVisible",
        "ignorePasswordManagers",
        "disabled",
        "readOnly",
        "required",
        "invalid",
        "showLabel",
        "hideLabel",
      ],
      forward: ["id", "aria-*"],
      slots: {
        label: { accepts: "text", required: true },
        hint: { accepts: "text" },
      },
      mount: "data-sk-password-input",
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      template: {
        element: "div",
        part: "root",
        host: true,
        options: ["defaultVisible", "ignorePasswordManagers", "invalid"],
        children: [
          { element: "label", part: "label", mount: "data-sk-password-input-label", slot: "label" },
          {
            element: "div",
            part: "control",
            mount: "data-sk-password-input-control",
            children: [
              {
                element: "input",
                part: "input",
                mount: "data-sk-password-input-input",
                options: ["name", "autoComplete", "placeholder", "disabled", "readOnly", "required"],
                attrs: { type: "password", autocapitalize: "off", spellcheck: "false" },
              },
              {
                element: "button",
                part: "visibilityTrigger",
                also: ["sk-button", "sk-interactive", "sk-icon-toggle"],
                mount: "data-sk-password-input-trigger",
                options: ["showLabel", "hideLabel"],
                attrs: {
                  type: "button",
                  "data-variant": "ghost",
                  "data-size": "sm",
                  "data-icon-only": "",
                  "data-state": "hidden",
                  "aria-expanded": "false",
                },
                children: [
                  {
                    element: "span",
                    attrs: { "data-face": "show", "aria-hidden": "true" },
                    children: [{ element: "span", attrs: { "data-sk-icon": "visibility", "data-sk-icon-size": "sm" } }],
                  },
                  {
                    element: "span",
                    attrs: { "data-face": "hide", "aria-hidden": "true" },
                    children: [{ element: "span", attrs: { "data-sk-icon": "visibility-off", "data-sk-icon-size": "sm" } }],
                  },
                ],
              },
            ],
          },
          { element: "span", part: "hint", whenGiven: "hint", slot: "hint" },
        ],
      },
      react: { from: "@skryensya/react/password-input", name: "PasswordInput" },
    },
  },
} as const satisfies ComponentContract;
