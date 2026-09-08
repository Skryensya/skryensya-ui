import type { ComponentContract } from "./contract.js";

/*
 * TOOLTIP, the contract.
 *
 * A tooltip is an AUXILIARY DESCRIPTION, never the name of the control nor the only place a piece of
 * data lives. The machine hangs `aria-describedby` off the trigger while it is open, not
 * `aria-labelledby`: the trigger already has to have an accessible name of its own (its text, or an
 * `aria-label` if it is icon-only) and the tooltip EXTENDS it.
 *
 * That restriction is not purism, it is what makes the component honest in two scenarios that have
 * no fix inside the component:
 *
 *   1. TOUCH. There is no hover. Zag opens on `pointerenter` and on `focus` (gated by
 *      `isFocusVisible`, so a mouse click does not trigger it). On a phone the tooltip is barely seen.
 *   2. NO JS. The content is painted hidden and only the machine opens it; without the vanilla layer
 *      mounted it never appears.
 *
 * In both cases no information is lost BECAUSE the contract forbids there being information there
 * that is not somewhere else. A tooltip that is the only source of something is a bug in whoever
 * uses it, and the system cannot detect it: that is why it is written up here.
 *
 * WCAG 1.4.13 (Content on Hover or Focus) asks for three things, and all three hold BY DEFAULT:
 *
 *   - Dismissible: Escape closes, without moving the pointer or the focus.
 *   - Persistent: it does not close itself on a timer.
 *   - Hoverable: the pointer can reach the tooltip without it disappearing. This is the machine's
 *     `interactive` option, and here it comes on.
 *
 * That default is measured, not assumed. With `interactive` off the content gets
 * `pointer-events: none`, the pointer never reaches it and the tooltip closes on the way: that FAILS
 * the criterion. The temptation is to turn it off reasoning "a descriptive tooltip has nothing to
 * click", and that is a misreading: hoverable does not exist so the tooltip can be operated, it
 * exists so it can be READ, which is exactly what someone with screen magnification or a tremor needs.
 *
 * It can be turned off (`data-interactive="false"` / `interactive={false}`). Turning it off is
 * stepping outside the criterion knowingly.
 */

import { anchorPlacements, anchorPlacementToZag, type AnchorPlacement } from "./anchored.js";

export type TooltipOpenChangeDetails = {
  open: boolean;
};

/**
 * Which side of the trigger it comes out of. The vocabulary is the Anchoring pattern's (ADR-11), not
 * one of the tooltip's own: they are the same four sides in logical axes any anchored box asks for,
 * and having them twice meant having two that could drift apart. These aliases stay because they are
 * the name the tooltip's contract was already documented with.
 */
export type TooltipPlacement = AnchorPlacement;

export const tooltipPlacements = anchorPlacements;

export const tooltipPlacementToZag = anchorPlacementToZag;

/**
 * A TOOLTIP COMES OUT ABOVE, and it is the only anchored one that does not fall downward: below is
 * what the pointer just touched and what it is about to touch.
 *
 * It is here and not only in the stylesheet because three places have to agree on the same side: the
 * box's `position-area`, the ARROW's (which no longer hangs off the box and cannot deduce it) and the
 * placement passed to the machine for the fallback. When the default lived only in the CSS the three
 * drifted apart as soon as nobody authored `data-sk-placement`: the box came out above, the arrow
 * below and the machine placed it below. The bindings resolve against this constant and write the
 * result, so a missing placement stops being a fourth case.
 */
export const tooltipDefaultPlacement: TooltipPlacement = "block-start";

export type TooltipOptions = {
  id?: string;
  /** ms before opening on hover. Zag uses 400 by default. */
  openDelay?: number;
  /** ms before closing on leave. Zag uses 150 by default. */
  closeDelay?: number;
  /**
   * WCAG 1.4.13 "hoverable": the tooltip stays open if the pointer enters it. `true` by default;
   * turning it off makes the component fail the criterion.
   */
  interactive?: boolean;
  /** Which side it comes out of. `block-start` by default. */
  placement?: TooltipPlacement;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: TooltipOpenChangeDetails) => void;
};

/*
 * The parts mirror `@zag-js/tooltip`'s anatomy (trigger, positioner, content, arrow, arrowTip), with
 * one difference: `arrowTip` does not exist here. Zag splits the arrow in two, a container that
 * positions and a rotated child that paints; our diamond is ONE single element, because on the
 * browser path `position-area` positions it and two boxes are not needed for that.
 *
 * The arrow is OPTIONAL in both layers and has no part of its own: it is authored with the pattern's
 * class (`sk-anchored-arrow`) inside the positioner, and from there it inherits the hooks this
 * component paints it with. That it comes out of the TRIGGER and not the center of the box is the
 * pattern's geometry, told there.
 */
export const tooltipParts = {
  root: "sk-tooltip",
  trigger: "sk-tooltip__trigger",
  positioner: "sk-tooltip__positioner",
  content: "sk-tooltip__content",
} as const;

export type TooltipPart = keyof typeof tooltipParts;
export type TooltipPartClass = (typeof tooltipParts)[TooltipPart];

/** The hooks the vanilla layer scans for on authored markup. */
export const tooltipAttrs = {
  root: "data-sk-anchor",
  trigger: "data-sk-anchor-trigger",
  positioner: "data-sk-anchor-positioner",
  content: "data-sk-anchor-content",
  /**
   * The requested placement. It is authored on the ROOT and ends up on the POSITIONER: in React the
   * positioner is portaled to the body, where inheritance from the root no longer reaches, so the
   * stylesheet reads it there. The arrow reads it from the positioner too, with the child combinator.
   */
  placement: "data-sk-placement",
} as const;

export type TooltipAttr = keyof typeof tooltipAttrs;
export type TooltipAttrName = (typeof tooltipAttrs)[TooltipAttr];

/*
 * A hint that expands a control's own name; never replaces it. Wired as `aria-describedby`, so the
 * control must already be named: a tooltip that IS the name disappears for anyone who never hovers.
 *
 * `portals` is the honest part. React portals the floating content out of the subtree so an ancestor
 * with `overflow: hidden` cannot clip it; authored markup keeps the positioner in place and lets CSS
 * anchoring position it (decision 25). Two strategies for one job; declared here so a consumer can
 * scope the portal, and so the symmetry gate knows to look inside one container rather than two.
 */
export const tooltipContract = {
  id: "tooltip",
  css: "@skryensya/core/components/tooltip.css",
  parts: tooltipParts,

  options: {
    placement: {
      type: "enum",
      values: ["block-start", "block-end", "inline-start", "inline-end"],
      /*
       * `block-start`, matching `tooltipDefaultPlacement` above; the constant this file exports so
       * that the box, the arrow and the machine name one side. It read `block-end` here, which is
       * the PATTERN's default and the one thing a tooltip deliberately does not share: below is what
       * the pointer just touched. So a tree that left placement alone emitted `block-end` into the
       * markup while the React binding resolved `block-start`, and the same tooltip came out on
       * opposite sides of its trigger in the two bindings.
       */
      default: "block-start",
      attr: "data-sk-placement",
      /*
       * Machine configuration: the enhancer reads it off the root because authored markup has no
       * other channel, React passes it as a prop, and Zag never writes it back.
       */
      machineInput: true,
    },
    /**
     * Draw the small arrow pointing at the trigger. Off unless asked for, in both bindings.
     *
     * It was unreachable from a tree until now: authored markup writes a `sk-anchored-arrow` span
     * inside the positioner, React takes an `arrow` prop, and the contract declared neither; so
     * every emitted tooltip came out without one while all three documented demos draw one.
     *
     * The attribute is bookkeeping rather than wiring: the enhancer finds the arrow by the pattern's
     * class, not by this. It is marked machine input so the gate reads it as configuration present
     * on one side by construction, which is what it is.
     */
    arrow: { type: "boolean", attr: "data-arrow", trueValue: "", machineInput: true },
  },

  signatures: {
    Tooltip: {
      intent: ["hint", "expand-a-control-name", "explain-an-icon-button"],
      host: { element: "span" },
      mount: "data-sk-anchor",
      options: ["placement", "arrow"],
      portals: true,
      slots: {
        /** The control being described. It carries its own accessible name. */
        children: { accepts: "signature", required: true },
        /** The hint: keep it short, as it is a description, not documentation. */
        content: { accepts: "text", required: true },
      },
      /*
       * THE TRIGGER IS A WRAPPER, and it was the missing half of this template.
       *
       * The enhancer scans for `[data-sk-anchor-trigger]`, `[data-sk-anchor-positioner]` and
       * `[data-sk-anchor-content]` and patches Zag's props onto whatever it finds. Only the
       * positioner was ever written, so an emitted tooltip had no trigger to bind and could never
       * open in Vanilla; the component was published and unusable from a tree at the same time.
       *
       * It has to be an element of our own rather than the consumer's control, because
       * `getTriggerProps` returns BUTTON props: putting them on their control would work only if
       * their control were a button, and wrapping it in one of ours would put two controls in the
       * tab order for one action. A span carries the props and the anchor name and stays out of the
       * way, which is exactly what the React binding already did and the template did not say.
       */
      template: {
        element: "span",
        part: "root",
        host: true,
        children: [
          {
            element: "span",
            part: "trigger",
            also: ["sk-anchor"],
            mount: "data-sk-anchor-trigger",
            slot: "children",
          },
          {
            element: "div",
            part: "positioner",
            also: ["sk-anchored"],
            mount: "data-sk-anchor-positioner",
            children: [
              /* Decorative by construction: it repeats the box's own direction, and the box is
                 already announced through `aria-describedby`. */
              {
                element: "span",
                also: ["sk-anchored-arrow"],
                attrs: { "aria-hidden": "true" },
                whenGiven: "arrow",
              },
              {
                element: "div",
                part: "content",
                mount: "data-sk-anchor-content",
                attrs: { role: "tooltip" },
                slot: "content",
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/tooltip", name: "Tooltip" },
    },
  },
} as const satisfies ComponentContract;
