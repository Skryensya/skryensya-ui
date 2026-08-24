import type { ComponentContract } from "./contract.js";

export type CheckedState = boolean | "indeterminate";

export type CheckedChangeDetails = {
  checked: CheckedState;
};

export type RadioValueChangeDetails = {
  value: string | null;
};

/**
 * What a CheckboxGroup reports: which children are checked, and the state that leaves the parent in.
 *
 * Both, and not just the values, because `checked` is the part a consumer cannot cheaply recompute
 * without also knowing how many children there are, which is the group's business, not the
 * listener's.
 */
export type CheckboxGroupValueChangeDetails = {
  value: readonly string[];
  checked: CheckedState;
};

export const checkboxGroupEvents = {
  valueChange: "sk:checkboxgroupvaluechange",
} as const;

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

/**
 * The checkbox family's parts: everything the three controls share, plus the two boxes only the
 * GROUP has.
 *
 * They are here and not in `selectionParts` because that map is the `parts` of all three contracts
 * at once, and a contract's parts are part of its published surface: adding a checkbox-group class
 * to the shared map moved the surface hash of Switch and RadioGroup, which had gained nothing and
 * had no entry to write about it. A family that grows a part should be the only family that
 * changes.
 */
export const checkboxParts = {
  ...selectionParts,
  checkboxGroup: "sk-checkbox-group",
  checkboxGroupItems: "sk-checkbox-group__items",
} as const;

/*
 * The two native selection controls, and the one place the system owns MORE structure than the
 * author does.
 *
 * A checkbox is five elements for one boolean: a `<label>` wrapping a real `<input>`, a painted
 * control beside it, two indicator spans inside that, and the text. The author supplies one thing,
 * the label, and the contract supplies the rest, because none of it is a choice: the native input
 * has to be there for form participation and keyboard, and the paint has to be `aria-hidden` so the
 * control is announced once, not twice.
 *
 * The label needs no `for` and the input needs no `id`: wrapping IS the association. That is the
 * platform's own rule, and it is why this contract has no wiring while FormField is made of it.
 */
export const checkboxContract = {
  id: "checkbox",
  css: "@skryensya/core/components/checkbox.css",
  parts: checkboxParts,

  options: {
    name: { type: "string", attr: "name" },
    value: { type: "string", attr: "value" },
    checked: { type: "boolean", default: false, attr: "checked", trueValue: "" },
    defaultChecked: {
      type: "boolean",
      default: false,
      attr: "checked",
      prop: "defaultChecked",
      trueValue: "",
    },
    defaultIndeterminate: {
      type: "boolean",
      default: false,
      attr: "data-default-indeterminate",
      prop: "defaultIndeterminate",
      trueValue: "",
    },
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
      options: ["name", "value", "checked", "defaultChecked", "defaultIndeterminate", "disabled", "required"],
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

    /*
     * Many checkboxes and one that speaks for them, and the only signature here whose state is
     * DERIVED rather than authored.
     *
     * The parent is not a fourth option: it holds no `name` and no `value`, submits nothing, and
     * cannot be set to a value of its own. What it shows is a reading of its children. All, none,
     * or some, and what a click on it means is "make every child agree with me". That is why
     * `defaultIndeterminate` is absent from its options while Checkbox has it: on a lone checkbox
     * indeterminate is a state an author can assert, and here asserting it would be asserting
     * something the children may be about to contradict.
     *
     * Which children start checked is per-child data (`defaultChecked` on the entry), NOT a group
     * `value` the way RadioGroup has one. Exclusivity is what makes a radio group's selection the
     * group's; a checkbox group has no such claim, so the fact stays with the entry it is about.
     *
     * `role="group"` and not `radiogroup`: nothing here is exclusive, and the group is named by the
     * parent's own label, which is the one piece of text that already describes the whole set.
     */
    CheckboxGroup: {
      intent: ["select-all", "check-many-at-once", "partial-selection", "parent-checkbox"],
      host: { element: "div" },
      options: ["name", "orientation", "disabled", "required"],
      requires: ["name"],
      mount: "data-sk-checkbox-group",
      slots: {
        /** The parent's text, and the group's accessible name via `labelledBySlot` below. */
        label: { accepts: "node", required: true },
        items: {
          accepts: "items",
          required: true,
          item: {
            key: "value",
            options: {
              value: { type: "string", attr: "value" },
              defaultChecked: { type: "boolean", default: false, attr: "checked", trueValue: "" },
              disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
            },
            slots: { label: { accepts: "node", required: true } },
          },
        },
      },
      template: {
        element: "div",
        part: "checkboxGroup",
        host: true,
        attrs: { role: "group" },
        labelledBySlot: "label",
        children: [
          {
            element: "label",
            part: "checkbox",
            children: [
              /*
               * No `name`, no `value`, and that absence is the contract: a form that submits this
               * group gets the children's values and nothing standing for "all of them", which
               * would be a fourth value the server never asked for.
               */
              {
                element: "input",
                part: "checkboxInput",
                mount: "data-sk-checkbox-group-all",
                attrs: { type: "checkbox" },
                options: ["disabled"],
              },
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
              { element: "span", part: "checkboxLabel", slot: "label" },
            ],
          },
          {
            element: "div",
            part: "checkboxGroupItems",
            children: [
              {
                element: "label",
                part: "checkbox",
                repeat: "items",
                children: [
                  {
                    element: "input",
                    part: "checkboxInput",
                    mount: "data-sk-checkbox-group-item",
                    attrs: { type: "checkbox" },
                    options: ["name", "required"],
                    itemOptions: ["value", "defaultChecked", "disabled"],
                  },
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
                  { element: "span", part: "checkboxLabel", itemSlot: "label" },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/selection", name: "CheckboxGroup" },
    },
  },

  events: checkboxGroupEvents,
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
 * correctly on each one, the same class of invariant a tab's key is, and the same answer: entries.
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
     * `aria-orientation`, and a radiogroup owes the second one: arrow keys move along the axis it
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
