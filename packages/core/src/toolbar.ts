import type { ComponentContract } from "./contract.js";

export type ToolbarOrientation = "horizontal" | "vertical";

export const toolbarParts = {
  root: "sk-toolbar",
  group: "sk-toolbar__group",
  separator: "sk-toolbar__separator",
} as const;

export const toolbarAttrs = {
  root: "data-sk-toolbar",
  item: "data-sk-toolbar-item",
} as const;

/*
 * A bar of controls with ONE tab stop, which is the whole reason it exists: without it, twenty
 * buttons are twenty stops and a keyboard user pays for the density.
 *
 * A composite widget inside it (a Segmented, Tabs) already has its own roving tabindex, so the
 * toolbar counts it as one stop rather than N — decision 27, and the reason the enhancer filters by
 * `tabindex` instead of by "is focusable".
 */
export const toolbarContract = {
  id: "toolbar",
  css: "@skryensya/core/components/toolbar.css",
  parts: toolbarParts,

  options: {
    orientation: {
      type: "enum",
      values: ["horizontal", "vertical"],
      default: "horizontal",
      attr: "data-orientation",
      alsoAttr: "aria-orientation",
    },
    /** Names the bar. A page with two toolbars needs each told apart. */
    label: { type: "string", attr: "aria-label" },
    /** Whether focus wraps at either end. Vanilla reads the presence attribute; React reads the prop. */
    loopFocus: {
      type: "boolean",
      default: true,
      attr: "data-loop-focus",
      trueValue: "",
      machineInput: true,
    },
  },

  signatures: {
    Toolbar: {
      intent: ["bar-of-controls", "editor-toolbar", "grouped-actions"],
      host: { element: "div" },
      options: ["orientation", "label", "loopFocus"],
      requires: ["label"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "toolbar" },
        slot: "children",
      },
      mount: "data-sk-toolbar",
      react: { from: "@skryensya/react/toolbar", name: "Toolbar" },
    },

    ToolbarGroup: {
      intent: ["related-controls-together"],
      host: { element: "div" },
      options: [],
      parents: ["Toolbar"],
      slots: { children: { accepts: "node", required: true } },
      // A named grouping the toolbar's roving focus treats as one region.
      template: { element: "div", part: "group", host: true, attrs: { role: "group" }, slot: "children" },
      react: { from: "@skryensya/react/toolbar", name: "ToolbarGroup" },
    },

    ToolbarSeparator: {
      intent: ["divide-two-groups"],
      host: { element: "span" },
      options: [],
      parents: ["Toolbar"],
      slots: {},
      // Decorative: the gap between groups is what a sighted user sees, and a screen reader has the
      // groups themselves.
      template: { element: "span", part: "separator", host: true, attrs: { "aria-hidden": "true" } },
      react: { from: "@skryensya/react/toolbar", name: "ToolbarSeparator" },
    },
  },
} as const satisfies ComponentContract;
