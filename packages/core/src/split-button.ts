import type { ComponentContract } from "./contract.js";
export const splitButtonParts = {
  root: "sk-split-button",
  primary: "sk-split-button__primary",
  trigger: "sk-split-button__trigger",
} as const;

/*
 * SPLIT BUTTON, the contract: a primary action and a Menu, welded into one control.
 *
 * There is no enhancer and no machine of its own, and that is the point: everything that behaves
 * here belongs to the Menu beside it. What this component contributes is the weld: the shared
 * radius, the hairline between the halves. So it is a COMPOSITION, and the template says so by
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

  options: {
    /**
     * The primary action's own color — `primary` by default, since this contract names a single
     * STABLE, DOMINANT action (the contract doc above), and a filled primary reads that way. The
     * menu segment always matches: `split-button.css` reads this SAME attribute off the primary
     * button via a sibling selector and re-derives the trigger's own fill from it, so the two
     * halves can never land on a mismatched pairing (a primary-blue action beside a danger-red
     * dropdown). Restricted to the three variants that make sense for a dominant action —
     * `Button`'s own `neutral`/`subtle`/`translucent` are for a control that is NOT the one thing
     * on the screen most needing attention, which a split button's primary half always is.
     */
    variant: { type: "enum", values: ["primary", "danger", "ghost"], default: "primary", attr: "data-variant" },
    /**
     * Same idea as `variant`: the primary button's own `Button`-vocabulary size, and the menu
     * segment re-derives its own proportions from the SAME attribute via the sibling selector in
     * `split-button.css`, so the two halves stay one control at every size, not a full-size action
     * beside a touch-target-sized dropdown.
     */
    size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-size" },
  },

  signatures: {
    SplitButton: {
      intent: ["primary-action-with-alternatives", "default-plus-more", "save-and-save-as"],
      host: { element: "div" },
      options: ["variant", "size"],
      slots: {
        /** The default action's label: the one most people want. */
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
            // Claims `variant`/`size` for itself — `Button`'s own existing `[data-variant]`/
            // `[data-size]` rules (button.css) already do the rest, no split-button-specific CSS
            // needed for THIS half; only the composed Menu trigger needs new rules to follow.
            options: ["variant", "size"],
            attrs: { type: "button" },
            slot: "children",
          },
          { slot: "menu" },
        ],
      },
      react: { from: "@skryensya/react/split-button", name: "SplitButton" },
    },
  },
} as const satisfies ComponentContract;
