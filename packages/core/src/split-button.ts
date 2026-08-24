import type { ComponentContract } from "./contract.js";
export const splitButtonParts = {
  root: "sk-split-button",
} as const;

/*
 * SPLIT BUTTON, the contract: an accent action and a Menu, welded into one control.
 *
 * There is no enhancer and no machine of its own, and that is the point: everything that behaves
 * here belongs to the Menu beside it. What this component contributes is the WELD alone. The
 * hairline seam, the layout that holds two independent controls flush against each other. And
 * nothing else. Not even an "action" part of its own: the `action` slot takes a composed
 * `Button.action` signature directly, the same way `menu` already took a composed `Menu` rather
 * than being rebuilt from a flat prop. An author writes a REAL `<Button weldEnd>`, not a
 * `<button class="sk-split-button__action">` this contract used to render on its own. The fill,
 * the size, the squared seam corner are `Button`'s own vocabulary end to end
 * (`variant`/`size`/`weldEnd`, `button.ts`), never restated here. The trigger reaches the exact
 * same rules through Menu's own `triggerVariant`/`triggerSize`/`triggerWeldStart`/
 * `triggerIconOnly` (menu.ts), which write to the identical attribute names Button itself uses -
 * a Menu trigger with those four set IS an icon-only Button in every way but one (the squared
 * corner), not a look-alike this component paints separately.
 *
 * This file's own stylesheet, as a result, has nothing left to say about fill, size, or radius -
 * only the layout and the seam are genuinely split-button-specific concerns; the rest was never
 * this component's to own. Owning it anyway was the bug an earlier pass here kept re-discovering:
 * a bare `.sk-split-button__action` class ties `.sk-button`'s own specificity, so which
 * stylesheet the page happened to load second silently decided which variant actually painted.
 * Composing a real `Button` removes even the CLASS that bug needed to exist, not just the CSS.
 *
 * Both halves are the AUTHOR's own composition now, in vanilla/compiled markup. This contract
 * cannot reach INTO an authored slot's own options to pair `action`'s `variant`/`weldEnd` with
 * the composed Menu's `triggerVariant`/`triggerWeldStart`; an author sets both by hand, the same
 * way `triggerLabel` was already the author's own responsibility. The React binding below keeps a
 * flat-prop convenience surface (`variant`/`size`/`onClick` directly on `<SplitButton>`) for the
 * common case, and internally renders a real `<Button>` and pairs its own Menu automatically. But
 * that convenience is this ONE binding's own choice, not something the contract provides or could.
 *
 * `role="group"`: WAI-ARIA has no dedicated "split button" pattern (confirmed against the APG
 * itself. Menu Button and Button are the two patterns actually in play here, both audited on
 * their own pages), but ARIA17's general grouping guidance is squarely on point: two related
 * controls read as one unit to assistive tech the same way they read as one unit visually. `label`
 * is optional, not required. Each half already announces its own name (the action's own visible
 * text, the trigger's own `triggerLabel`), so the group name is a nice-to-have qualifier, not the
 * only source of either button's identity.
 */
export const splitButtonContract = {
  id: "split-button",
  css: "@skryensya/core/components/split-button.css",
  parts: splitButtonParts,

  options: {
    /** The group's own accessible name; see this file's own `role="group"` doc for why it is
     *  optional. */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    SplitButton: {
      intent: ["primary-action-with-alternatives", "default-plus-more", "save-and-save-as"],
      host: { element: "div" },
      options: ["label"],
      slots: {
        /** The default action, a real composed `Button.action`. The author sets `weldEnd` (and
         *  whatever `variant`/`size` this control's dominant action calls for) on it directly. */
        action: { accepts: "signature", of: ["Button.action"], required: true },
        /** The alternatives, as a Menu. The author pairs `triggerVariant`/`triggerSize`/
         *  `triggerWeldStart`/`triggerIconOnly` with the action's own values by hand. */
        menu: { accepts: "signature", of: ["Menu"], required: true },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "group" },
        children: [{ slot: "action" }, { slot: "menu" }],
      },
      react: { from: "@skryensya/react/split-button", name: "SplitButton" },
    },
  },
} as const satisfies ComponentContract;
