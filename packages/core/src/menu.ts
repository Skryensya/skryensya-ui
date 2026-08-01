export type { Api as MenuApi, Service as MenuService } from "@zag-js/menu";

export type MenuItemKind = "item" | "checkbox" | "radio";

export type MenuItem = {
  value: string;
  label: string;
  disabled?: boolean;
  kind?: MenuItemKind;
  checked?: boolean;
  group?: string;
  children?: readonly MenuItem[];
};

export const menuParts = {
  root: "sk-menu",
  trigger: "sk-menu__trigger",
  positioner: "sk-menu__positioner",
  content: "sk-menu__content",
  item: "sk-menu__item",
  itemLabel: "sk-menu__item-label",
  itemIndicator: "sk-menu__item-indicator",
  separator: "sk-menu__separator",
  group: "sk-menu__group",
  groupLabel: "sk-menu__group-label",
} as const;

export const menuAttrs = {
  root: "data-sk-menu",
  trigger: "data-sk-menu-trigger",
  contextTrigger: "data-sk-menu-context-trigger",
  positioner: "data-sk-menu-positioner",
  content: "data-sk-menu-content",
  item: "data-sk-menu-item",
  optionItem: "data-sk-menu-option-item",
  separator: "data-sk-menu-separator",
  group: "data-sk-menu-group",
  groupLabel: "data-sk-menu-group-label",
} as const;

export type MenuOpenChangeDetails = { open: boolean };
export type MenuSelectionDetails = { value: string };


import type { ComponentContract } from "./contract.js";

/*
 * MENU, the contract — a trigger, a floating list, and submenus that nest without limit.
 *
 * The recursion is the whole shape. A submenu here is not a nested list inside an item: it is a
 * WHOLE MENU standing where an item would, with its own trigger styled as an item and its own
 * positioner. So the entry is written once, named, and points back at itself through the entry's
 * `children` slot — the DATA has a bottom, the template does not.
 *
 * `kind` is present only on the entries that need it, and that presence is load-bearing: the check
 * indicator exists exactly when an entry declares a kind, because a plain command has nothing to
 * indicate. The authored markup already worked that way (`data-type="checkbox"` on that one item
 * and nothing on the others); the contract now says so instead of leaving it to whoever types it.
 *
 * Submenus carry no static `aria-label`. Both bindings run Zag, whose content props point the list
 * at its own trigger with `aria-labelledby`, so a second name in the markup would be a second
 * source for one fact. The ROOT keeps `label`: it has no trigger above it and needs a name before
 * JavaScript runs.
 *
 * Publishing this contract is what first put the two bindings side by side, and they did not agree.
 * Six divergences, every one of them a real defect rather than a difference of opinion, all fixed
 * where they belonged rather than written down as known:
 *
 *   - `.sk-menu` is `inline-flex`, so the submenu's wrapper shrink-wrapped its row while the
 *     siblings filled the panel, and the `<button>` inside it kept its native border. CSS, both.
 *   - Nothing hid the check indicator when an item was UNCHECKED, so authored markup showed a tick
 *     on an unchecked checkbox while React showed none. CSS again.
 *   - React drew the trigger chevron, the check and the submenu arrow only when a caller passed
 *     them, and as text glyphs. The template paints all three, so React defaults to the same icons.
 *   - The submenu trigger was a `<button>` in markup and a `<div>` in React.
 *   - React skipped Zag's item-text props, so the label a screen reader reads was named in one
 *     binding only.
 *   - React had no `.sk-menu` wrapper around a submenu. Vanilla needs one — it is where the second
 *     machine mounts — and once the CSS above stopped punishing it, React carrying it too cost
 *     nothing and made the nesting identical.
 *
 * None of this was visible to `verify-stages.mjs`, which measures the stage root that React portals
 * its content out of. It took G2, and G2 had never run on a portalling component: menu, select and
 * tooltip are the only three, and none had a canonical tree until now.
 */
export const menuContract = {
  id: "menu",
  css: "@skryensya/core/components/menu.css",
  parts: menuParts,

  options: {
    /** The menu's accessible name. The root's own — an item's name is its label. */
    label: { type: "string", attr: "aria-label" },
    disabled: {
      type: "boolean",
      default: false,
      attr: "data-disabled",
      trueValue: "",
      machineInput: true,
    },
  },

  signatures: {
    Menu: {
      intent: ["a-list-of-commands", "actions-behind-a-trigger", "submenu"],
      host: { element: "div" },
      mount: menuAttrs.root,
      options: ["label", "disabled"],
      portals: true,
      slots: {
        /** What opens it. Text, or a composed control. */
        trigger: { accepts: "node", required: true },
        items: {
          accepts: "items",
          required: true,
          prop: "items",
          item: {
            key: "value",
            options: {
              value: { type: "string", attr: "data-value" },
              disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
              /** `checkbox` or `radio`. Absent means a plain command, which shows no indicator. */
              kind: { type: "enum", values: ["checkbox", "radio"], attr: "data-type" },
            },
            slots: {
              label: { accepts: "text", required: true },
              /** Entries of its own make this one a submenu rather than a command. */
              children: { accepts: "items", recursive: true },
            },
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "button",
            part: "trigger",
            also: ["sk-button", "sk-interactive", "sk-anchor"],
            mount: menuAttrs.trigger,
            attrs: { type: "button" },
            slot: "trigger",
            children: [
              {
                element: "span",
                attrs: { "aria-hidden": "true" },
                children: [{ element: "span", attrs: { "data-sk-icon": "chevron-down", "data-sk-icon-size": "md" } }],
              },
            ],
          },
          {
            element: "div",
            part: "positioner",
            also: ["sk-anchored"],
            mount: menuAttrs.positioner,
            children: [
              {
                element: "div",
                part: "content",
                mount: menuAttrs.content,
                children: [
                  {
                    repeat: "items",
                    children: [
                      {
                        name: "entry",
                        children: [
                          {
                            element: "div",
                            part: "item",
                            also: ["sk-interactive"],
                            mount: menuAttrs.item,
                            itemOptions: ["value", "disabled", "kind"],
                            whenItemSlotMissing: "children",
                            children: [
                              { element: "span", part: "itemLabel", itemSlot: "label" },
                              {
                                element: "span",
                                part: "itemIndicator",
                                attrs: { "aria-hidden": "true" },
                                whenItemGiven: "kind",
                                children: [{ element: "span", attrs: { "data-sk-icon": "check", "data-sk-icon-size": "md" } }],
                              },
                            ],
                          },
                          {
                            element: "div",
                            part: "root",
                            mount: menuAttrs.root,
                            whenItemSlotGiven: "children",
                            children: [
                              {
                                element: "button",
                                part: "item",
                                also: ["sk-interactive", "sk-anchor"],
                                mount: menuAttrs.trigger,
                                attrs: { type: "button" },
                                children: [
                                  { element: "span", part: "itemLabel", itemSlot: "label" },
                                  {
                                    element: "span",
                                    part: "itemIndicator",
                                    attrs: { "aria-hidden": "true" },
                                    children: [
                                      { element: "span", attrs: { "data-sk-icon": "chevron-right", "data-sk-icon-size": "md" } },
                                    ],
                                  },
                                ],
                              },
                              {
                                element: "div",
                                part: "positioner",
                                also: ["sk-anchored"],
                                mount: menuAttrs.positioner,
                                attrs: { "data-sk-submenu": "" },
                                children: [
                                  {
                                    element: "div",
                                    part: "content",
                                    mount: menuAttrs.content,
                                    children: [{ repeatItemSlot: "children", recurse: "entry" }],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/menu", name: "Menu" },
    },
  },
} as const satisfies ComponentContract;
