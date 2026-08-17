export type { Api as MenuApi, Service as MenuService } from "@zag-js/menu";

export type MenuItemKind = "item" | "checkbox" | "radio" | "separator";

export type MenuItem = {
  value: string;
  /** Every kind but `"separator"` needs one; a divider has nothing to announce. */
  label?: string;
  disabled?: boolean;
  kind?: MenuItemKind;
  /** Marks a destructive command (Delete, Remove, …). See the `tone` item option below for why. */
  tone?: "danger";
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
  /*
   * Not template parts: the compiler never emits these, they are created imperatively. `safeArea`
   * exists while a submenu is open and the pointer is near its trigger (`menu-safe-area.ts`, and it
   * is real machinery, not decoration — see that file); the two `intentReadout` parts exist only
   * while `debugSafetyTriangle` is on (`menu-intent-readout.ts`). Named here anyway, same as every
   * other class in this file, so those modules and menu.css share ONE source for the string
   * instead of a hand-typed copy in each.
   */
  safeArea: "sk-menu__safe-area",
  intentReadout: "sk-menu__intent-readout",
  intentReadoutDot: "sk-menu__intent-readout-dot",
} as const;

export const menuAttrs = {
  root: "data-sk-menu",
  trigger: "data-sk-menu-trigger",
  contextTrigger: "data-sk-menu-context-trigger",
  positioner: "data-sk-menu-positioner",
  content: "data-sk-menu-content",
  item: "data-sk-menu-item",
  optionItem: "data-sk-menu-option-item",
  /** On the TRIGGER while its safe area is mounted; menu.css raises the trigger for exactly that long. */
  safeArea: "data-sk-menu-safe-area",
  separator: "data-sk-menu-separator",
  group: "data-sk-menu-group",
  groupLabel: "data-sk-menu-group-label",
  debugSafetyTriangle: "data-sk-menu-debug-intent",
} as const;

export type MenuOpenChangeDetails = { open: boolean };
export type MenuSelectionDetails = { value: string };


import type { ComponentContract } from "./contract.js";

/*
 * MENU, the contract: a trigger, a floating list, and submenus that nest without limit.
 *
 * The recursion is the whole shape. A submenu here is not a nested list inside an item: it is a
 * WHOLE MENU standing where an item would, with its own trigger styled as an item and its own
 * positioner. So the entry is written once, named, and points back at itself through the entry's
 * `children` slot: the DATA has a bottom, the template does not.
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
 *   - React had no `.sk-menu` wrapper around a submenu. Vanilla needs one (it is where the second
 *     machine mounts), and once the CSS above stopped punishing it, React carrying it too cost
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
    /** The menu's accessible name: the root's own. An item's name is its label. */
    label: { type: "string", attr: "aria-label" },
    /**
     * The TRIGGER BUTTON's own accessible name — separate from `label` on purpose. `trigger`
     * (the slot) is usually visible text, and a button's accessible name already comes from its
     * own content for free; `label` is deliberately a MORE DESCRIPTIVE string for the menu as a
     * whole ("File actions" vs. a terser visible "Actions"), and reusing it here would overwrite
     * the trigger's own visible text with a DIFFERENT string — a WCAG 2.5.3 "Label in Name"
     * mismatch between what a sighted user reads and what a screen reader announces.
     *
     * This exists for the case `label` cannot cover: an ICON-ONLY trigger (a real split-button's
     * dropdown segment, a toolbar's "more actions" `…` button — the pattern industry-wide, no
     * visible text at all, `aria-label` alone). Leave `trigger` empty and set this instead; the
     * chevron this template always paints stays the only visible content, and the button still
     * announces a real name.
     */
    triggerLabel: { type: "string", attr: "aria-label" },
    disabled: {
      type: "boolean",
      default: false,
      attr: "data-disabled",
      trueValue: "",
      machineInput: true,
    },
    /**
     * A tighter row for a dense command menu, same idiom as List's own `data-density="compact"`.
     * Only the root carries this in the tree; the React binding also has to copy it onto the
     * (portalled) positioner by hand, the same reason it re-declares `.sk-menu`'s appearance hooks
     * there in menu.css.
     */
    density: { type: "enum", values: ["compact"], attr: "data-density" },
    /*
     * Paints the SAFE AREA (menu-safe-area.ts) live over every submenu this Menu owns, plus a
     * status line saying whether it is currently holding the pointer. This is not new behavior and
     * not a drawing OF the behavior: the safe area is a real element that exists on every submenu
     * whether or not this flag is on, and the flag only gives it a fill so it can be seen, for
     * teaching or debugging.
     *
     * Only the root carries this in the tree. Vanilla needs nothing further: nested submenu roots
     * are real DOM descendants, and `root.closest(…)` finds the flag on an ancestor. React portals,
     * so it re-threads the boolean down through every `Submenu` level and re-stamps it there, the
     * same reason `density` does.
     */
    debugSafetyTriangle: {
      type: "boolean",
      default: false,
      attr: menuAttrs.debugSafetyTriangle,
      trueValue: "",
    },
  },

  signatures: {
    Menu: {
      intent: ["a-list-of-commands", "actions-behind-a-trigger", "submenu"],
      host: { element: "div" },
      mount: menuAttrs.root,
      options: ["label", "triggerLabel", "disabled", "density", "debugSafetyTriangle"],
      portals: true,
      slots: {
        /**
         * What opens it. Text, or a composed control — or nothing at all: an icon-only trigger (the
         * real split-button / toolbar-overflow pattern) leaves this empty and names the button with
         * `triggerLabel` instead, since the chevron below is painted either way.
         */
        trigger: { accepts: "node" },
        items: {
          accepts: "items",
          required: true,
          prop: "items",
          item: {
            key: "value",
            options: {
              value: { type: "string", attr: "data-value" },
              disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
              /**
               * `checkbox` or `radio`. Absent means a plain command, which shows no indicator.
               * `separator` is a third, unrelated shape: a divider between commands, not a command
               * with a variant, so the item template below excludes it explicitly rather than
               * folding it into "any kind given" the way the indicator does for the other two.
               */
              kind: { type: "enum", values: ["checkbox", "radio", "separator"], attr: "data-type" },
              /**
               * Marks a destructive command (Delete, Remove, …). The ONLY value is `"danger"`, the
               * same one-value-enum shape `disabled` and `kind` already use elsewhere in this system
               * for "there is exactly one alternate state, and its absence is the default": a second
               * value would be a different concept (a general-purpose "tone" axis), not this one.
               * Sets `color` alone; the shared state layer (`sk-interactive`, already `also`'d onto
               * every item) reads `currentColor` for its own hover/press tint, so a danger item's
               * hover wash comes out red for free, the same mechanism a danger Button uses.
               */
              tone: { type: "enum", values: ["danger"], attr: "data-tone" },
            },
            slots: {
              /** Every entry but a `kind: "separator"` needs one; a divider announces nothing. */
              label: { accepts: "text" },
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
            // Claims `triggerLabel` for ITSELF (the `attr: "aria-label"` on the option already says
            // where — no `optionAttrs` rename needed): the root above never sees this option at all,
            // the same "one option, one element" split `label` (root) already keeps clean.
            options: ["triggerLabel"],
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
                            itemOptions: ["value", "disabled", "kind", "tone"],
                            whenItemSlotMissing: "children",
                            whenItemNotEquals: { option: "kind", equals: "separator" },
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
                          /*
                           * A divider between commands, not a command: no label, no click, no
                           * indicator. `role="separator"` is what tells assistive tech that too, the
                           * ARIA menu role for exactly this shape.
                           */
                          {
                            element: "div",
                            part: "separator",
                            mount: menuAttrs.separator,
                            attrs: { role: "separator" },
                            whenItemEquals: { option: "kind", equals: "separator" },
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
