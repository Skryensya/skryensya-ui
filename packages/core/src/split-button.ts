import type { ComponentContract } from "./contract.js";
export const splitButtonParts = {
  root: "sk-split-button",
  primary: "sk-split-button__primary",
  trigger: "sk-split-button__trigger",
} as const;

/*
 * SPLIT BUTTON, the contract — a primary action and a Menu, welded into one control.
 *
 * There is no enhancer and no machine of its own, and that is the point: everything that behaves
 * here belongs to the Menu beside it. What this component contributes is the weld — the shared
 * radius, the hairline between the halves — so it is a COMPOSITION, and the template says so by
 * taking a Menu in a slot rather than rebuilding one from a list.
 *
 * That was the blocker until now. The React binding built its menu from a flat `menuItems` prop
 * and handed it `triggerClassName`, which a composed Menu cannot receive: the class belongs to
 * whoever renders that button, and that is Menu. The stylesheet reaches it by structure instead
 * (`.sk-split-button > .sk-menu > button`), and the coupling disappears.
 */
export const splitButtonContract = {
  id: "split-button",
  css: "@skryensya/core/components/split-button.css",
  parts: splitButtonParts,

  options: {},

  signatures: {
    SplitButton: {
      intent: ["primary-action-with-alternatives", "default-plus-more", "save-and-save-as"],
      host: { element: "div" },
      options: [],
      slots: {
        /** The default action's label — the one most people want. */
        children: { accepts: "text", required: true },
        /** The alternatives, as a Menu. */
        menu: { accepts: "signature", of: ["Menu"], required: true },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "button",
            part: "primary",
            also: ["sk-button", "sk-interactive"],
            attrs: { type: "button", "data-variant": "primary" },
            slot: "children",
          },
          { slot: "menu" },
        ],
      },
      react: { from: "@skryensya/react/split-button", name: "SplitButton" },
    },
  },
} as const satisfies ComponentContract;
