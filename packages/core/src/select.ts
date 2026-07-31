import type { ComponentContract } from "./contract.js";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectValueChangeDetails = {
  value: string[];
};

export type SelectOptions = {
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string | readonly string[];
  defaultValue?: string | readonly string[];
  placeholder?: string;
  options?: readonly SelectOption[];
  onValueChange?: (details: SelectValueChangeDetails) => void;
};

export const selectEvents = {
  valueChange: "sk-value-change",
} as const;

export const selectParts = {
  native: "sk-select-native",
  root: "sk-select",
  control: "sk-select__control",
  label: "sk-select__label",
  trigger: "sk-select__trigger",
  value: "sk-select__value",
  indicator: "sk-select__indicator",
  positioner: "sk-select__positioner",
  content: "sk-select__content",
  item: "sk-select__item",
  itemText: "sk-select__item-text",
  itemIndicator: "sk-select__item-indicator",
} as const;

export type SelectPart = keyof typeof selectParts;
export type SelectPartClass = (typeof selectParts)[SelectPart];


/*
 * SELECT, the contract — two signatures for two genuinely different components.
 *
 * `Select.native` is a real `<select>`: the browser owns selection, keyboard, form submission and
 * accessibility, and the system contributes one class. `Select` is the enhanced one, which exists
 * only when you need a controlled collection, item markup, positioning or the `sk-value-change`
 * event. Appearance stopped being a reason to replace the native control.
 *
 * Writing this contract turned up a divergence the docs had been carrying quietly: React renders a
 * `control` wrapper around the label and trigger, and the hand-authored markup on the docs page has
 * none. The CSS has zero rules for `__control`, so it was tempting to call React wrong — but the
 * vanilla enhancer already looks for `[data-sk-select-control]` and spreads Zag's props onto it when
 * it exists. Both bindings support the fuller shape; only the authored markup was short. So the
 * template below is the fuller one, and the page's markup was the incomplete source of truth all
 * along — which is the entire argument for emitting it instead of typing it.
 */
export const selectContract = {
  id: "select",
  css: "@skryensya/core/components/select.css",
  parts: selectParts,

  options: {
    /** Submitted under this name, and what makes the hidden native control worth rendering. */
    name: { type: "string", attr: "name" },
    /**
     * The selected value. React spells it `defaultValue`: `value` there is the CONTROLLED prop, and
     * emitting it freezes the control. Same line Slider, Tabs, RadioGroup, TimeField and Segmented
     * carry — Segmented's absence was measured as a demo nobody could click.
     */
    value: { type: "string", attr: "data-value", prop: "defaultValue", machineInput: true },
    /** Shown in the trigger while nothing is selected. */
    placeholder: { type: "string", attr: "data-placeholder", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    required: { type: "boolean", default: false, attr: "data-required", trueValue: "", machineInput: true },
  },

  signatures: {
    "Select.native": {
      intent: ["a-standard-choice", "one-of-a-known-list", "form-field"],
      host: { element: "select" },
      options: ["name", "disabled", "required"],
      slots: {
        /** The choices. A native `<option>` each — no item markup, which is the tradeoff. */
        items: {
          accepts: "items",
          required: true,
          /* The contract keys it `items` like every other collection; React calls it `options`. */
          prop: "options",
          item: {
            key: "value",
            options: {
              value: { type: "string", attr: "value" },
              disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
            },
            slots: { label: { accepts: "text", required: true } },
          },
        },
      },
      template: {
        element: "select",
        part: "native",
        host: true,
        children: [
          {
            element: "option",
            repeat: "items",
            itemOptions: ["value", "disabled"],
            itemSlot: "label",
          },
        ],
      },
      react: { from: "@skryensya/react/select-native", name: "NativeSelect" },
    },

    Select: {
      intent: ["controlled-collection", "item-markup", "positioned-listbox", "value-change-event"],
      host: { element: "div" },
      mount: "data-sk-select",
      options: ["name", "value", "placeholder", "disabled", "required"],
      portals: true,
      slots: {
        /** Names the control. Absent means something else nearby names it. */
        label: { accepts: "text" },
        items: {
          accepts: "items",
          required: true,
          prop: "options",
          item: {
            key: "value",
            options: {
              value: { type: "string", attr: "data-value" },
              disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
            },
            slots: { label: { accepts: "text", required: true } },
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          /*
           * NO hidden `<select>` here, deliberately. Both bindings already produce their own —
           * React through Zag's `getHiddenSelectProps`, and the vanilla enhancer accepts an authored
           * `[data-sk-select-hidden]` without requiring one. Emitting it from the template would
           * need the `<option>`s to spell the entry key as `value`, where the listbox `<li>` spells
           * the same entry as `data-value`, and a template node cannot override an item option's
           * attribute per node. Form participation is the binding's job; the markup teaches shape.
           */
          {
            element: "div",
            part: "control",
            mount: "data-sk-select-control",
            children: [
              {
                element: "label",
                part: "label",
                mount: "data-sk-select-label",
                slot: "label",
                whenGiven: "label",
              },
              {
                element: "button",
                part: "trigger",
                also: ["sk-anchor", "sk-interactive"],
                mount: "data-sk-select-trigger",
                attrs: { type: "button" },
                children: [
                  { element: "span", part: "value", mount: "data-sk-select-value" },
                  {
                    element: "span",
                    part: "indicator",
                    mount: "data-sk-select-indicator",
                    attrs: { "aria-hidden": "true" },
                    children: [
                      {
                        element: "span",
                        attrs: { "data-state": "closed" },
                        children: [{ element: "span", attrs: { "data-sk-icon": "chevron-down" } }],
                      },
                      {
                        element: "span",
                        attrs: { "data-state": "open" },
                        children: [{ element: "span", attrs: { "data-sk-icon": "chevron-up" } }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            element: "div",
            part: "positioner",
            also: ["sk-anchored"],
            mount: "data-sk-select-positioner",
            children: [
              {
                element: "ul",
                part: "content",
                mount: "data-sk-select-content",
                children: [
                  {
                    element: "li",
                    part: "item",
                    also: ["sk-interactive"],
                    mount: "data-sk-select-item",
                    repeat: "items",
                    itemOptions: ["value", "disabled"],
                    children: [
                      {
                        element: "span",
                        part: "itemText",
                        mount: "data-sk-select-item-text",
                        itemSlot: "label",
                      },
                      {
                        element: "span",
                        part: "itemIndicator",
                        mount: "data-sk-select-item-indicator",
                        children: [{ element: "span", attrs: { "data-sk-icon": "check" } }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/select", name: "Select" },
    },
  },
} as const satisfies ComponentContract;
