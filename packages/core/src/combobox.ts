import type { ComponentContract } from "./contract.js";
import { selectableItemShape } from "./select.js";

export type ComboboxItem = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export const comboboxParts = {
  root: "sk-combobox",
  label: "sk-combobox__label",
  control: "sk-combobox__control",
  value: "sk-combobox__value",
  selectedItems: "sk-combobox__selected-items",
  selectedItem: "sk-combobox__selected-item",
  selectedItemLabel: "sk-combobox__selected-item-label",
  removeTrigger: "sk-combobox__remove-trigger",
  input: "sk-combobox__input",
  trigger: "sk-combobox__trigger",
  clear: "sk-combobox__clear",
  positioner: "sk-combobox__positioner",
  content: "sk-combobox__content",
  item: "sk-combobox__item",
  itemCopy: "sk-combobox__item-copy",
  itemLabel: "sk-combobox__item-label",
  itemIndicator: "sk-combobox__item-indicator",
  itemDescription: "sk-combobox__item-description",
  empty: "sk-combobox__empty",
  status: "sk-combobox__status",
} as const;

export const comboboxAttrs = {
  root: "data-sk-combobox",
  label: "data-sk-combobox-label",
  control: "data-sk-combobox-control",
  input: "data-sk-combobox-input",
  value: "data-sk-combobox-value",
  selectedItems: "data-sk-combobox-selected-items",
  removeTrigger: "data-sk-combobox-remove-trigger",
  trigger: "data-sk-combobox-trigger",
  clear: "data-sk-combobox-clear",
  positioner: "data-sk-combobox-positioner",
  content: "data-sk-combobox-content",
  item: "data-sk-combobox-item",
  empty: "data-sk-combobox-empty",
  itemText: "data-sk-combobox-item-text",
  itemIndicator: "data-sk-combobox-item-indicator",
  status: "data-sk-combobox-status",
  hint: "data-sk-combobox-hint",
  error: "data-sk-combobox-error",
} as const;

export type ComboboxValueChangeDetails = { value: string[] };
export type ComboboxInputChangeDetails = { inputValue: string };

/*
 * COMBOBOX, the contract: a text field that filters a list, with the list positioned against it.
 *
 * Publishing this one turned up the same class of divergence three times, and it is worth naming
 * because it is structural rather than accidental. React renders the clear control, the empty
 * message and the chip row CONDITIONALLY: they are absent from the DOM until there is something to
 * clear, no results, or a selection. The enhancer cannot work that way: it takes the markup it is
 * given and toggles `hidden`, because authored markup is static by definition. So the two bindings
 * disagreed about how many elements exist in the resting state, and only one of them can be what a
 * template says.
 *
 * The template is the static shape, so React was changed to render-and-hide as well. That is not a
 * concession to the emitter: `hidden` keeps the element out of the accessibility tree just as
 * absence does, and it is the binding that agrees with the CSS, which styles `[hidden]` rather than
 * assuming the node is gone.
 *
 * `data-value-text` is the other thing this needs and Select did not. The enhancer builds its
 * collection by reading each row, and a row here holds a label, a description and an indicator, so
 * `textContent` is three strings glued together, not the label. `attrsFromItemSlot` copies the label
 * slot into the attribute the enhancer actually reads, which means the two can never disagree.
 */
export const comboboxContract = {
  id: "combobox",
  css: "@skryensya/core/components/combobox.css",
  parts: comboboxParts,

  options: {
    /** Submitted under this name. Lives on the input, like every other form attribute here. */
    name: { type: "string", attr: "name" },
    /**
     * The chosen value. React spells it `defaultValue`: `value` there is the CONTROLLED prop, and
     * emitting it freezes the field. The same line Select, Slider, Tabs, RadioGroup, TimeField and
     * Segmented carry.
     */
    value: { type: "string", attr: "data-value", prop: "defaultValue", machineInput: true },
    /** Shown in the input while it is empty. */
    placeholder: { type: "string", attr: "placeholder" },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
    required: { type: "boolean", default: false, attr: "required", trueValue: "" },
    readOnly: { type: "boolean", default: false, attr: "readonly", trueValue: "" },
    /** More than one choice at a time, each shown as a removable chip above the input. */
    multiple: { type: "boolean", default: false, attr: "data-multiple", machineInput: true },
    /** Whether a search that matches nothing is still a value. */
    allowCustomValue: {
      type: "boolean",
      default: false,
      attr: "data-allow-custom-value",
      machineInput: true,
    },
  },

  signatures: {
    Combobox: {
      intent: ["filter-a-long-list", "type-to-search", "one-of-many-known-values", "form-field"],
      host: { element: "div" },
      mount: "data-sk-combobox",
      options: [
        "name",
        "value",
        "placeholder",
        "disabled",
        "required",
        "readOnly",
        "multiple",
        "allowCustomValue",
      ],
      portals: true,
      slots: {
        /** Names the field. Required because the enhancer refuses to run without one. */
        label: { accepts: "text", required: true },
        /** Guidance shown before anything goes wrong. */
        hint: { accepts: "text" },
        /** What went wrong. Its presence is what makes the field invalid. */
        error: { accepts: "text" },
        items: {
          accepts: "items",
          required: true,
          /* `selectableItemShape` (`select.ts`) plus one extra optional slot: the label/description
             pair a plain choice doesn't need. */
          item: {
            ...selectableItemShape,
            slots: {
              ...selectableItemShape.slots,
              /** A second line under the label, for when the label alone is ambiguous. */
              description: { accepts: "text" },
            },
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        also: ["sk-form-field"],
        host: true,
        children: [
          {
            element: "label",
            part: "label",
            also: ["sk-form-field__label"],
            mount: "data-sk-combobox-label",
            slot: "label",
          },
          {
            element: "div",
            also: ["sk-form-field__hint"],
            mount: "data-sk-combobox-hint",
            slot: "hint",
            whenGiven: "hint",
          },
          {
            /* The anchor is the whole control, not the chevron: the list lines up with the field
             * being typed in, and anchoring it to a 32px square would tuck it under the button. */
            element: "div",
            part: "control",
            also: ["sk-anchor"],
            mount: "data-sk-combobox-control",
            children: [
              {
                element: "div",
                part: "value",
                mount: "data-sk-combobox-value",
                children: [
                  {
                    element: "input",
                    part: "input",
                    mount: "data-sk-combobox-input",
                    options: ["name", "placeholder", "disabled", "required", "readOnly"],
                  },
                ],
              },
              {
                element: "button",
                part: "clear",
                also: ["sk-button", "sk-interactive"],
                mount: "data-sk-combobox-clear",
                attrs: {
                  type: "button",
                  "data-icon-only": "",
                  "data-size": "sm",
                  "data-variant": "ghost",
                },
                children: [{ element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "sm" } }],
              },
              /*
               * Decorative, not a second control: Zag's own `getTriggerProps()` already defaults
               * this to `tabIndex: -1` (never a Tab stop), and every existing open path — typing,
               * `openOnClick` on the input itself — never went through it either. What made it
               * read as an independent button was purely visual (its own `.sk-button` ghost hover/
               * pressed feedback on a mouse hover/click Zag still wired up), not a real second
               * interaction surface. `aria-hidden` and a plain `span` remove that affordance
               * instead of just restyling it; the input's own `role="combobox"` +
               * `aria-expanded` already say everything a screen reader needs.
               */
              {
                element: "span",
                part: "trigger",
                mount: "data-sk-combobox-trigger",
                attrs: { "aria-hidden": "true" },
                children: [
                  {
                    element: "span",
                    attrs: { "data-state": "closed" },
                    children: [
                      { element: "span", attrs: { "data-sk-icon": "chevron-down", "data-sk-icon-size": "md" } },
                    ],
                  },
                  {
                    element: "span",
                    attrs: { "data-state": "open" },
                    children: [
                      { element: "span", attrs: { "data-sk-icon": "chevron-up", "data-sk-icon-size": "md" } },
                    ],
                  },
                ],
              },
            ],
          },
          {
            element: "div",
            also: ["sk-form-field__error"],
            mount: "data-sk-combobox-error",
            slot: "error",
            whenGiven: "error",
          },
          {
            /* How many results the filter left, for a reader who cannot see the list shrink. */
            element: "div",
            part: "status",
            also: ["sk-visually-hidden"],
            mount: "data-sk-combobox-status",
            attrs: { role: "status", "aria-atomic": "true" },
          },
          {
            element: "div",
            part: "positioner",
            also: ["sk-anchored"],
            mount: "data-sk-combobox-positioner",
            children: [
              {
                element: "div",
                part: "content",
                also: ["sk-scrollbar"],
                mount: "data-sk-combobox-content",
                children: [
                  {
                    element: "div",
                    part: "item",
                    also: ["sk-interactive"],
                    mount: "data-sk-combobox-item",
                    repeat: "items",
                    itemOptions: ["value", "disabled"],
                    /* What the enhancer reads to build its collection. The row's `textContent` is
                     * label + description + indicator glued together, which is not the label. */
                    attrsFromItemSlot: {
                      "data-value-text": "label",
                      "data-description": "description",
                    },
                    children: [
                      {
                        element: "span",
                        part: "itemCopy",
                        children: [
                          {
                            element: "span",
                            part: "itemLabel",
                            mount: "data-sk-combobox-item-text",
                            itemSlot: "label",
                          },
                          {
                            element: "span",
                            part: "itemDescription",
                            itemSlot: "description",
                            whenItemSlotGiven: "description",
                          },
                        ],
                      },
                      {
                        element: "span",
                        part: "itemIndicator",
                        mount: "data-sk-combobox-item-indicator",
                        text: "✓",
                      },
                    ],
                  },
                  {
                    element: "div",
                    part: "empty",
                    mount: "data-sk-combobox-empty",
                    attrs: { role: "presentation" },
                    text: "Sin resultados",
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/combobox", name: "Combobox" },
    },
  },
} as const satisfies ComponentContract;
