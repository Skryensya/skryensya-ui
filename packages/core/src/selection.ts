import type { ComponentContract } from "./contract.js";

export type CheckedState = boolean | "indeterminate";

export type CheckedChangeDetails = {
  checked: CheckedState;
};

export type RadioValueChangeDetails = {
  value: string | null;
};

export type RadioGroupOrientation = "horizontal" | "vertical";

export const selectionParts = {
  checkbox: "sk-checkbox",
  checkboxInput: "sk-checkbox__input",
  checkboxControl: "sk-checkbox__control",
  checkboxIndicator: "sk-checkbox__indicator",
  checkboxLabel: "sk-checkbox__label",
  radioGroup: "sk-radio-group",
  radio: "sk-radio",
  radioInput: "sk-radio__input",
  radioControl: "sk-radio__control",
  radioIndicator: "sk-radio__indicator",
  radioLabel: "sk-radio__label",
  switch: "sk-switch",
  switchInput: "sk-switch__input",
  switchControl: "sk-switch__control",
  switchThumb: "sk-switch__thumb",
  switchLabel: "sk-switch__label",
} as const;

export type SelectionPart = keyof typeof selectionParts;
export type SelectionPartClass = (typeof selectionParts)[SelectionPart];

/*
 * The two native selection controls, and the one place the system owns MORE structure than the
 * author does.
 *
 * A checkbox is five elements for one boolean: a `<label>` wrapping a real `<input>`, a painted
 * control beside it, two indicator spans inside that, and the text. The author supplies one thing —
 * the label — and the contract supplies the rest, because none of it is a choice: the native input
 * has to be there for form participation and keyboard, and the paint has to be `aria-hidden` so the
 * control is announced once, not twice.
 *
 * The label needs no `for` and the input needs no `id`: wrapping IS the association. That is the
 * platform's own rule, and it is why this contract has no wiring while Field is made of it.
 */
export const checkboxContract = {
  id: "checkbox",
  css: "@skryensya/core/components/checkbox.css",
  parts: selectionParts,

  options: {
    name: { type: "string", attr: "name" },
    value: { type: "string", attr: "value" },
    checked: { type: "boolean", default: false, attr: "checked", trueValue: "" },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
    required: { type: "boolean", default: false, attr: "required", trueValue: "" },
    orientation: {
      type: "enum",
      values: ["vertical", "horizontal"],
      default: "vertical",
      attr: "data-orientation",
    },
  },

  signatures: {
    Checkbox: {
      intent: ["boolean-choice", "opt-in", "accept-terms", "toggle-one-setting"],
      host: { element: "input" },
      options: ["name", "value", "checked", "disabled", "required"],
      slots: {
        /** The visible text. Absent means the control is named by something else nearby. */
        children: { accepts: "node" },
      },
      template: {
        element: "label",
        part: "checkbox",
        children: [
          {
            element: "input",
            part: "checkboxInput",
            host: true,
            attrs: { type: "checkbox" },
          },
          /*
           * The paint. `aria-hidden` is load-bearing: the native input above is what a screen reader
           * announces, and a second visible control would announce the same choice twice.
           */
          {
            element: "span",
            part: "checkboxControl",
            also: ["sk-interactive"],
            attrs: { "aria-hidden": "true" },
            children: [
              {
                element: "span",
                part: "checkboxIndicator",
                attrs: { "data-state": "checked" },
                children: [{ element: "span", attrs: { "data-sk-icon": "check", "data-sk-icon-size": "sm" } }],
              },
              {
                element: "span",
                part: "checkboxIndicator",
                attrs: { "data-state": "indeterminate" },
                children: [{ element: "span", attrs: { "data-sk-icon": "remove", "data-sk-icon-size": "sm" } }],
              },
            ],
          },
          { element: "span", part: "checkboxLabel", whenGiven: "children", slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/selection", name: "Checkbox" },
    },

  },
} as const satisfies ComponentContract;

/*
 * A switch is its own family, not a checkbox variant: it means "this takes effect now" where a
 * checkbox means "this will be submitted", and it has its own stylesheet. They share a source module
 * and nothing else.
 */
export const switchContract = {
  id: "switch",
  css: "@skryensya/core/components/switch.css",
  parts: selectionParts,

  options: {
    name: { type: "string", attr: "name" },
    value: { type: "string", attr: "value" },
    checked: { type: "boolean", default: false, attr: "checked", trueValue: "" },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
  },

  signatures: {
    Switch: {
      intent: ["on-off", "immediate-setting", "enable-feature"],
      host: { element: "input" },
      options: ["name", "value", "checked", "disabled"],
      slots: { children: { accepts: "node" } },
      template: {
        element: "label",
        part: "switch",
        children: [
          { element: "input", part: "switchInput", host: true, attrs: { type: "checkbox", role: "switch" } },
          {
            element: "span",
            part: "switchControl",
            attrs: { "aria-hidden": "true" },
            children: [{ element: "span", part: "switchThumb" }],
          },
          { element: "span", part: "switchLabel", whenGiven: "children", slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/selection", name: "Switch" },
    },
  },
} as const satisfies ComponentContract;

/*
 * One choice from a set, and the only selection family that is a collection.
 *
 * A radio is not a checkbox that happens to be exclusive: what makes it exclusive is the shared
 * `name` on every input, which is the platform's own mechanism and belongs to the GROUP, not to any
 * one option. Composing radios as loose children would leave that name to the author to repeat
 * correctly on each one — the same class of invariant a tab's key is, and the same answer: entries.
 *
 * `required` is likewise the group's: a set where one option is required means the SET is required.
 */
export const radioGroupContract = {
  id: "radio-group",
  css: "@skryensya/core/components/radio-group.css",
  parts: selectionParts,

  options: {
    /** Shared by every input, and what makes the choice exclusive. The group's, never an option's. */
    name: { type: "string", attr: "name" },
    /**
     * The selected option, named by its key. A GROUP property: exclusivity is the claim that only
     * one can be selected, so no entry can own it.
     *
     * React spells it `defaultValue`, and the difference is not cosmetic: `value` there is the
     * CONTROLLED prop, so emitting it would freeze the demo on whichever option it named. The
     * markup's `data-value` is a starting point the machine then owns, which is what
     * `defaultValue` means. Same reasoning, same fix as Slider, Tabs and TimeField.
     */
    value: { type: "string", attr: "data-value", machineInput: true, prop: "defaultValue" },
    /**
     * Two attributes, one value: the CSS reads `data-orientation` and the accessibility tree reads
     * `aria-orientation`, and a radiogroup owes the second one — arrow keys move along the axis it
     * announces. The template writes both from this single option.
     */
    orientation: {
      type: "enum",
      values: ["vertical", "horizontal"],
      default: "vertical",
      attr: "data-orientation",
      alsoAttr: "aria-orientation",
    },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
    required: { type: "boolean", default: false, attr: "required", trueValue: "" },
  },

  signatures: {
    RadioGroup: {
      intent: ["one-of-many", "exclusive-choice", "pick-a-single-option"],
      host: { element: "div" },
      options: ["name", "value", "orientation", "disabled", "required"],
      requires: ["name"],
      slots: {
        items: {
          accepts: "items",
          required: true,
          item: {
            key: "value",
            options: {
              value: { type: "string", attr: "value" },
              disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
            },
            slots: { label: { accepts: "node", required: true } },
          },
        },
      },
      template: {
        element: "div",
        part: "radioGroup",
        host: true,
        // The role is the contract's, not the author's: a div full of radios is not a radiogroup
        // until it says so, and every binding owes the same announcement.
        attrs: { role: "radiogroup" },
        children: [
          {
            element: "label",
            part: "radio",
            repeat: "items",
            children: [
              {
                element: "input",
                part: "radioInput",
                attrs: { type: "radio" },
                options: ["name", "required"],
                itemOptions: ["value", "disabled"],
                selectedBy: { option: "value", attr: "checked" },
              },
              {
                element: "span",
                part: "radioControl",
                attrs: { "aria-hidden": "true" },
                children: [{ element: "span", part: "radioIndicator" }],
              },
              { element: "span", part: "radioLabel", itemSlot: "label" },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/selection", name: "RadioGroup" },
    },
  },
} as const satisfies ComponentContract;
