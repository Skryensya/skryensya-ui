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
 * here belongs to the Menu beside it. What this component contributes is the WELD alone — the
 * hairline seam, the layout that holds two independent controls flush against each other — and
 * nothing else, on purpose. The fill, the size, the squared corner at the seam: all of that is
 * `Button`'s own vocabulary (`variant`/`size`/`squareStart`/`squareEnd`, `button.ts`), reused
 * verbatim by BOTH halves. The primary segment is a real `.sk-button`, styled by the exact same
 * `[data-variant]`/`[data-size]`/`[data-square-end]` rules any other Button on the page reads
 * (button.css never gets a split-button-specific override); the trigger reaches the SAME rules
 * through Menu's own `triggerVariant`/`triggerSize`/`triggerSquareStart` (menu.ts), which write
 * to the identical attribute names, not a copy of Button's CSS restated here. This file's own
 * stylesheet, as a result, has nothing left to say about fill or radius — only the layout and the
 * seam are genuinely split-button-specific concerns; the rest was never this component's to own,
 * and giving it that ownership was the bug an earlier pass here kept re-discovering (a bare
 * `.sk-split-button__primary` class ties `.sk-button`'s own specificity, so which stylesheet the
 * page happened to load second silently decided which button variant actually painted).
 *
 * A COMPOSITION, and the template says so by taking a Menu in a slot rather than rebuilding one
 * from a list — an author composing the `menu` slot by hand is responsible for setting the SAME
 * `triggerVariant`/`triggerSize`/`triggerSquareStart` on their own Menu that they gave this
 * contract's own `variant`/`size`, the same way they are already responsible for `triggerLabel`.
 * This component's own React binding automates that pairing for its flat-prop fallback path (no
 * `menu` composed by hand); nothing at the CONTRACT level can enforce it for a hand-composed one,
 * because nothing at the contract level ever reaches INTO an authored slot's own options.
 *
 * `role="group"`: WAI-ARIA has no dedicated "split button" pattern (confirmed against the APG
 * itself — Menu Button and Button are the two patterns actually in play here, both audited on
 * their own pages), but ARIA17's general grouping guidance is squarely on point: two related
 * controls read as one unit to assistive tech the same way they read as one unit visually. `label`
 * is optional, not required — each half already announces its own name (the primary's own visible
 * text, the trigger's own `triggerLabel`), so the group name is a nice-to-have qualifier, not the
 * only source of either button's identity.
 */
export const splitButtonContract = {
  id: "split-button",
  css: "@skryensya/core/components/split-button.css",
  parts: splitButtonParts,

  options: {
    /**
     * The primary action's own `Button` variant — `primary` by default, since this contract names
     * a single STABLE, DOMINANT action (the contract doc above), and a filled primary reads that
     * way. Restricted to the three variants that make sense for a dominant action — `Button`'s own
     * `neutral`/`subtle`/`translucent` are for a control that is NOT the one thing on the screen
     * most needing attention, which a split button's primary half always is. An author composing
     * the `menu` slot by hand passes the SAME value to their own Menu's `triggerVariant`.
     */
    variant: { type: "enum", values: ["primary", "danger", "ghost"], default: "primary", attr: "data-variant" },
    /** The primary action's own `Button` size. An author composing the `menu` slot by hand passes
     *  the SAME value to their own Menu's `triggerSize`. */
    size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-size" },
    /** The group's own accessible name — see this file's own `role="group"` doc for why it is
     *  optional. */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    SplitButton: {
      intent: ["primary-action-with-alternatives", "default-plus-more", "save-and-save-as"],
      host: { element: "div" },
      options: ["variant", "size", "label"],
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
        attrs: { role: "group" },
        children: [
          {
            element: "button",
            part: "primary",
            also: ["sk-button", "sk-interactive"],
            // Claims `variant`/`size` for itself — `Button`'s own existing `[data-variant]`/
            // `[data-size]` rules (button.css) already do the rest. `data-square-end` is a
            // STATIC fact, never author-configurable: the primary half of a split button always
            // has a trigger glued to its end side, there is no scenario where this control exists
            // without one.
            options: ["variant", "size"],
            attrs: { type: "button", "data-square-end": "" },
            slot: "children",
          },
          { slot: "menu" },
        ],
      },
      react: { from: "@skryensya/react/split-button", name: "SplitButton" },
    },
  },
} as const satisfies ComponentContract;
