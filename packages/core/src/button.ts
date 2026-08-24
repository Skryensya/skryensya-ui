import type { ComponentContract, OptionsOf, OptionValue } from "./contract.js";

export const buttonParts = {
  root: "sk-button",
  interactive: "sk-interactive",
} as const;

export type ButtonPart = keyof typeof buttonParts;
export type ButtonPartClass = (typeof buttonParts)[ButtonPart];

/*
 * Two signatures over one export. `href` is the discriminant and the tag switch: every appearance
 * works identically on either host, only the semantics differ. Passing it drops `disabled` (a link
 * cannot be disabled and stay a link) and `type`; omitting it keeps the native button contract.
 *
 * There is no `ButtonLink` contract. It was a thin wrapper forwarding to Button with `href`, and the
 * reconstruction resolves deprecations in code instead of carrying two paths (decision 28).
 */
export const buttonContract = {
  id: "button",
  css: "@skryensya/core/components/button.css",
  parts: buttonParts,

  options: {
    variant: {
      type: "enum",
      values: ["neutral", "subtle", "translucent", "accent", "danger", "ghost"],
      default: "neutral",
      attr: "data-variant",
    },
    size: {
      type: "enum",
      values: ["sm", "md", "lg"],
      default: "md",
      attr: "data-size",
    },
    /*
     * The icon-only shape: a control-sized square holding a single glyph. Orthogonal to variant and
     * size, any of those can be icon-only. Presence-only in the DOM, hence the empty `trueValue`.
     */
    iconOnly: {
      type: "boolean",
      default: false,
      attr: "data-icon-only",
      trueValue: "",
    },
    /*
     * Welds the START (leading) edge flat against a neighbor. A button that has ANOTHER control
     * glued to that side (a split button's primary half beside its menu trigger, a segmented
     * group's middle members). Removes BOTH things a round, bordered corner there would get
     * wrong: the corner's own rounding (reads as a gap between two separate controls instead of
     * a seam in one welded shape) AND the edge's own border color (for any variant that paints
     * one: `neutral`, `subtle`, `translucent`. A visible border sitting right next to whatever
     * the neighbor paints on ITS OWN touching edge doubles the seam into two competing lines;
     * `primary`/`danger`/`ghost` never had this problem, their own border is already transparent,
     * which is exactly why the bug stayed hidden until an example paired two `neutral` halves).
     * Orthogonal to every other axis: any variant, any size, can be welded. Presence-only, like
     * `iconOnly`. See `weldEnd` for the opposite edge. A control welded on BOTH sides (a
     * segmented group's middle member) sets both at once.
     */
    weldStart: {
      type: "boolean",
      default: false,
      attr: "data-weld-start",
      trueValue: "",
    },
    /** Same idea, the opposite edge; see `weldStart`'s own doc. */
    weldEnd: {
      type: "boolean",
      default: false,
      attr: "data-weld-end",
      trueValue: "",
    },
    href: {
      type: "string",
      attr: "href",
    },
    /*
     * Unavailable right now. Native `disabled` AND `aria-disabled`: the first is what stops the
     * click and the form, the second is what a screen reader announces on a control it can still
     * land on. Only on the action signature: a link cannot be disabled and stay a link.
     */
    disabled: {
      type: "boolean",
      default: false,
      attr: "disabled",
      trueValue: "",
    },
  },

  signatures: {
    "Button.action": {
      intent: ["action", "submit", "destructive-action"],
      host: { element: "button", when: { href: "absent" } },
      options: ["variant", "size", "iconOnly", "weldStart", "weldEnd", "disabled"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "button",
        part: "root",
        also: [buttonParts.interactive],
        host: true,
        // The announcement, beside the behaviour: `disabled` stops the click, `aria-disabled` is
        // what a screen reader reads on a control it can still land on.
        attrsWhen: [{ option: "disabled", equals: "true", attrs: { "aria-disabled": "true" } }],
        slot: "children",
      },
      react: { from: "@skryensya/react/button", name: "Button" },
      mount: "data-sk-button",
    },

    "Button.navigation": {
      intent: ["navigation", "single-destination"],
      host: { element: "a", when: { href: "present" } },
      options: ["variant", "size", "iconOnly", "weldStart", "weldEnd", "href"],
      requires: ["href"],
      forbids: ["disabled", "type"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "a",
        part: "root",
        also: [buttonParts.interactive],
        host: true,
        slot: "children",
      },
      react: { from: "@skryensya/react/button", name: "Button" },
      mount: "data-sk-button",
    },
  },

  a11y: [
    {
      when: { iconOnly: true },
      requiresOneOf: ["aria-label", "aria-labelledby"],
      because:
        "A square control shows no text, so the host owns the accessible name; the icon child is decorative.",
    },
  ],
} as const satisfies ComponentContract;

/*
 * Derived, never restated. Adding a variant is one edit (in the contract above), and both bindings
 * follow. `disabled` is deliberately absent: it is a native attribute of the `<button>` host, not an
 * option this contract maps onto one, and `Button.navigation` forbids it outright.
 */
export type ButtonVariant = OptionValue<typeof buttonContract.options.variant>;
export type ButtonSize = OptionValue<typeof buttonContract.options.size>;
export type ButtonOptions = OptionsOf<typeof buttonContract>;
