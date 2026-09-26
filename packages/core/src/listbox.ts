import type { ComponentContract, OptionsOf } from "./contract.js";

/*
 * LISTBOX, a list you choose from in place, on `@zag-js/listbox` (the SAME machine in both bindings,
 * through `@skryensya/core/machines`, ADR-0010).
 *
 * WHAT IT IS NEXT TO ITS NEIGHBOURS. Select and Combobox are a listbox that OPENS from a trigger; this
 * is the listbox itself, always open, taking the room its options need. It is for a choice the reader
 * should see whole while making it (a view, a few filters, the items to act on), not for a field that
 * sits closed in a form.
 *
 * NOT A FORM CONTROL, the same as Zag's: there is no hidden input and no `name`. A choice that has to be
 * submitted is a Select, a RadioGroup or a CheckboxGroup, which the platform already posts.
 *
 * THE INITIAL SELECTION IS PER ITEM (`defaultSelected`), not one `value` on the root: the one shape
 * that says "these three" as easily as "this one", in markup and in a tree alike.
 */

export const listboxParts = {
  root: "sk-listbox",
  label: "sk-listbox__label",
  /** The `role="listbox"` element, and the one that takes focus. */
  content: "sk-listbox__content",
  item: "sk-listbox__item",
  itemText: "sk-listbox__item-text",
  /** The check on a selected option. Decorative: `aria-selected` is what is announced. */
  itemIndicator: "sk-listbox__item-indicator",
} as const;

export type ListboxPart = keyof typeof listboxParts;

export const listboxAttrs = {
  root: "data-sk-listbox",
  label: "data-sk-listbox-label",
  content: "data-sk-listbox-content",
  item: "data-sk-listbox-item",
  itemText: "data-sk-listbox-item-text",
  itemIndicator: "data-sk-listbox-item-indicator",
} as const;

export const listboxEvents = {
  /** On the root, bubbling. Detail: `{ value: string[] }`, every selected value after the change. */
  valueChange: "sk:listboxvaluechange",
} as const;

export type ListboxValueChangeDetails = { value: string[] };

export type ListboxItem = {
  value: string;
  label: string;
  disabled?: boolean;
  defaultSelected?: boolean;
};

/** The values an authored list starts with: every item marked `defaultSelected`, in order. */
export function listboxDefaultValue(items: readonly ListboxItem[]): string[] {
  return items.filter((item) => item.defaultSelected).map((item) => item.value);
}

export const listboxContract = {
  id: "listbox",
  category: "forms",
  css: "@skryensya/core/components/listbox.css",
  parts: listboxParts,
  events: listboxEvents,
  eventDetails: {
    valueChange: { detail: { value: "string[]" }, reactProp: "onValueChange", source: "root", trigger: "item" },
  },
  hooks: [
    "--sk-listbox-bg",
    "--sk-listbox-border-color",
    "--sk-listbox-gap",
    "--sk-listbox-item-disabled-fg",
    "--sk-listbox-item-fg",
    "--sk-listbox-item-padding",
    "--sk-listbox-item-radius",
    "--sk-listbox-item-selected-fg",
    "--sk-listbox-label-fg",
    "--sk-listbox-max-block-size",
    "--sk-listbox-padding",
    "--sk-listbox-radius",
  ],

  options: {
    /**
     * `single` replaces the choice; `multiple` toggles each option on its own; `extended` is the
     * desktop file-list model, where a plain click replaces and Ctrl/Cmd or Shift adds.
     */
    selectionMode: {
      type: "enum",
      values: ["single", "multiple", "extended"],
      default: "single",
      attr: "data-selection-mode",
      machineInput: true,
    },
    /** Which arrow keys move through the options, and which way they flow. */
    orientation: {
      type: "enum",
      values: ["vertical", "horizontal"],
      default: "vertical",
      attr: "data-orientation",
      machineInput: true,
    },
    /** The whole list: nothing can be highlighted or chosen. */
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
  },

  signatures: {
    Listbox: {
      intent: ["choose-in-place", "always-open-list", "multi-select-list", "pick-from-visible-options"],
      host: { element: "div" },
      mount: listboxAttrs.root,
      options: ["selectionMode", "orientation", "disabled"],
      forward: ["id", "aria-*"],
      compose: [{ of: "icon", systemOwned: true }],
      slots: {
        /** What the list is a choice of. Visible, and the listbox's name. */
        label: { accepts: "text", required: true },
        items: {
          accepts: "items",
          required: true,
          minItems: 1,
          item: {
            key: "value",
            options: {
              value: { type: "string", attr: "data-value" },
              disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
              /** Chosen when the list first renders. Several may be, when the mode allows it. */
              defaultSelected: { type: "boolean", default: false, attr: "data-default-selected", trueValue: "" },
            },
            slots: { label: { accepts: "text", required: true } },
            requires: ["value"],
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "span", part: "label", mount: listboxAttrs.label, slot: "label" },
          {
            element: "ul",
            part: "content",
            mount: listboxAttrs.content,
            children: [
              {
                element: "li",
                part: "item",
                also: ["sk-interactive"],
                mount: listboxAttrs.item,
                repeat: "items",
                itemOptions: ["value", "disabled", "defaultSelected"],
                children: [
                  { element: "span", part: "itemText", mount: listboxAttrs.itemText, itemSlot: "label" },
                  {
                    element: "span",
                    part: "itemIndicator",
                    mount: listboxAttrs.itemIndicator,
                    attrs: { "aria-hidden": "true" },
                    children: [{ element: "span", attrs: { "data-sk-icon": "check", "data-sk-icon-size": "md" } }],
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/listbox", name: "Listbox" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated. */
export type ListboxOptions = OptionsOf<typeof listboxContract>;
