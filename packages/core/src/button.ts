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
    /*
     * HOW LOUD, and nothing about what it means. The two used to be one enum, which is why a quiet
     * destructive button was unsayable: four emphases times three intents is twelve combinations and
     * a single list spelled six of them, picking arbitrarily which. You got loud-destructive but not
     * quiet-destructive, quiet-neutral but not quiet-primary.
     *
     *   solid        the fill carries it. A form's submit, a confirm.
     *   soft         a fill that recedes: present, not competing. (This was `subtle`.)
     *   ghost        ink only. Toolbars, action rows, anywhere a box per control would be noise.
     *   translucent  soft, for an UNKNOWN surface behind: over media, over a colored card. Slightly
     *                impure on this axis (it is really a surface adaptation), and kept here anyway
     *                because a third axis for one value would cost more than it explains.
     */
    variant: {
      type: "enum",
      values: ["solid", "soft", "ghost", "translucent"],
      default: "solid",
      attr: "data-variant",
    },
    /*
     * WHAT IT MEANS, and nothing about how loud. `tone` is already this system's word for exactly
     * this - Badge, Tag and Callout all publish it - and Button was the odd one out, spelling
     * `variant="danger"` for the thing Badge spells `tone="danger"`. One word, one meaning.
     *
     * THREE, not Badge's five. A badge REPORTS a state, so `success` and `warning` are things it can
     * truthfully say. A button PERFORMS an action, and there is no such thing as a warning action or
     * a success action; the closest real one is destructive, which is `danger`. Adding the other two
     * would publish four cells nobody can describe the meaning of.
     *
     * Every combination is legal and every one has a use, which is the point of splitting the axis:
     * `ghost` + `danger` is a delete in an action row, `solid` + `danger` the confirm it opens.
     */
    tone: {
      type: "enum",
      values: ["neutral", "accent", "danger"],
      default: "neutral",
      attr: "data-tone",
    },
    /*
     * `xs` is the floor of the scale, not a fourth step someone felt like adding: it paints at
     * `--size-control-xs`, which sits exactly on WCAG 2.2 SC 2.5.8's 24px target minimum. It
     * exists for a control that has to read as a NODE rather than as a button parked somewhere -
     * comment-thread's fold handle is the case that asked for it, riding on the thread's own rail,
     * where `sm` was as wide as the avatar above it and competed with it. The hit area does not
     * shrink with the face: `.sk-button::after` still expands to `--size-touch-target`.
     */
    size: {
      type: "enum",
      values: ["xs", "sm", "md", "lg"],
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
     * one: `solid`, `soft`, `translucent`. A visible border sitting right next to whatever the
     * neighbor paints on ITS OWN touching edge doubles the seam into two competing lines; a
     * toned fill and `ghost` never had this problem, their own border is already transparent,
     * which is exactly why the bug stayed hidden until an example paired two neutral halves).
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
    /*
     * A TOGGLE'S OWN STATE. Bold in a toolbar, an upvote, Play/Pause: a button that stays on.
     *
     * Three states, not two, which is why it carries both `trueValue` and `falseValue` the way
     * layout's `wrap` does. ABSENT means "not a toggle at all" and is the right answer for almost
     * every button; `false` means "a toggle, currently off", which is a thing a screen reader
     * announces and a plain button must never claim. Writing the attribute unconditionally would
     * turn every button in the system into a toggle that is off.
     *
     * Action only. `Button.navigation` forbids it: a link goes somewhere, it does not stay pressed,
     * and `aria-pressed` on an anchor is a promise the element cannot keep.
     */
    pressed: {
      type: "boolean",
      attr: "aria-pressed",
      trueValue: "true",
      falseValue: "false",
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
      options: ["variant", "tone", "size", "iconOnly", "weldStart", "weldEnd", "pressed", "disabled"],
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
      options: ["variant", "tone", "size", "iconOnly", "weldStart", "weldEnd", "href"],
      requires: ["href"],
      forbids: ["disabled", "type", "pressed"],
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
export type ButtonTone = OptionValue<typeof buttonContract.options.tone>;
export type ButtonSize = OptionValue<typeof buttonContract.options.size>;
export type ButtonOptions = OptionsOf<typeof buttonContract>;
