import type { ComponentContract, OptionsOf } from "./contract.js";

/*
 * BACK TO TOP, the control that only exists once you have scrolled away from where it takes you.
 *
 * A long page has one move a reader makes over and over: get back to the start. The keyboard has
 * `Home`, a trackpad has a hard flick, and neither is discoverable; a button pinned to a corner is
 * the affordance that says the move exists. It is chrome of nothing but itself, like `Toc` and
 * `SkipLink`, and it earns a contract for the same reason `Toc` did: its defining behaviour is not a
 * value an author sets at compose time. Whether it is visible depends on where the reader has
 * scrolled to, which is a runtime fact, which is the exact line that separates every contract with a
 * machine (or, here, a hand-written enhancer) from the CSS-only patterns beside it.
 *
 * IT IS NOT `SkipLink`. That one goes FIRST in the document, is reached by Tab before anything else,
 * and jumps through a real in-page anchor so the platform owns the scroll, the focus move and the
 * Back button. This one appears LATE, is reached by pointer or by tabbing to the corner, and calls
 * `scrollTo` on a scroller that may not be the document at all. Different element (`button`, not
 * `a`), different reason, different point in the reading.
 *
 * WHY A PURE CORE + TWO BINDINGS AND NO MACHINE: no `@zag-js/*` covers "reveal past a scroll
 * threshold", so the interactive part is written the three-way `hotkey` way. The pure half here is
 * two decisions with no DOM in them - is it past the threshold, and does the scroll animate - and
 * they are unit-tested from the Vanilla suite because Core ships no test runner. The DOM shell (the
 * scroll listener, the `scrollTo` call, the optional focus move) lives in each binding.
 */
export const backToTopParts = {
  root: "sk-back-to-top",
  /** Wraps the `chevron-up` icon so the stylesheet has a stable hook for it before and after the
   *  icon enhancer swaps the placeholder for an `<svg>`. Decorative (`aria-hidden`): the label
   *  names the control. */
  icon: "sk-back-to-top__icon",
  /** Wraps the slotted label so the stylesheet can clip it to a name-only box while the chevron
   *  carries the visible affordance. A consumer that wants a labelled pill un-clips it. */
  label: "sk-back-to-top__label",
} as const;

export type BackToTopPart = keyof typeof backToTopParts;
export type BackToTopPartClass = (typeof backToTopParts)[BackToTopPart];

/** The enhancer's attachment point. Present in authored markup by construction; React needs none. */
export const backToTopAttrs = {
  root: "data-sk-back-to-top",
} as const;

export type BackToTopAttr = keyof typeof backToTopAttrs;
export type BackToTopAttrName = (typeof backToTopAttrs)[BackToTopAttr];

/* ---------------------------------------------------------------------------------------------- *
 * Pure behavior - no DOM, no framework. Tested from `packages/vanilla/src/components/back-to-top.test.ts`.
 * ---------------------------------------------------------------------------------------------- */

/** Pixels a scroller travels from its start before the control is worth showing. One viewport is
 *  too eager on a tall screen and too shy on a short one; a fixed distance is predictable and a
 *  consumer retunes it with `threshold`. */
export const BACK_TO_TOP_DEFAULT_THRESHOLD = 400;

/**
 * Is the control past its reveal point? `>=` so a threshold of 0 shows it the instant the reader
 * leaves the top. A non-finite or negative threshold is treated as the default rather than trusted:
 * a `data-threshold="oops"` should not make the button either always-on or never-on.
 */
export function backToTopShouldReveal(scrollTop: number, threshold: number): boolean {
  if (!Number.isFinite(scrollTop)) return false;
  const limit =
    Number.isFinite(threshold) && threshold >= 0 ? threshold : BACK_TO_TOP_DEFAULT_THRESHOLD;
  return scrollTop >= limit;
}

/**
 * Reads a `data-threshold` string into a usable number. Empty / absent / unparseable all fall back
 * to the default, so the enhancer never has to special-case a missing attribute.
 */
export function backToTopParseThreshold(raw: string | null | undefined): number {
  if (raw == null || raw === "") return BACK_TO_TOP_DEFAULT_THRESHOLD;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : BACK_TO_TOP_DEFAULT_THRESHOLD;
}

/**
 * How the return scroll should move. `"smooth"` normally; `"auto"` (an instant jump) when the reader
 * has asked for less motion. The caller passes the media-query result so this stays DOM-free.
 */
export function backToTopScrollBehavior(prefersReducedMotion: boolean): "auto" | "smooth" {
  return prefersReducedMotion ? "auto" : "smooth";
}

/* ---------------------------------------------------------------------------------------------- *
 * Contract
 * ---------------------------------------------------------------------------------------------- */

export const backToTopContract = {
  id: "back-to-top",
  css: "@skryensya/core/components/back-to-top.css",
  parts: backToTopParts,

  options: {
    /**
     * Distance the scroller must travel from its start before the control reveals itself. The
     * enhancer reads it off the DOM and computes visibility from it; React takes it as a prop. It
     * configures the behaviour rather than the markup, so it never lands as a rendered value on
     * either side.
     */
    threshold: {
      type: "number",
      default: BACK_TO_TOP_DEFAULT_THRESHOLD,
      attr: "data-threshold",
      machineInput: true,
    },
    /**
     * A CSS selector for the scroll container this returns to its start. Omitted: the page's own
     * root scroller. For a layout whose scroll lives in an inner `overflow` pane, point at that.
     */
    scroller: {
      type: "string",
      attr: "data-scroller",
      machineInput: true,
    },
    /**
     * A selector (`#top`) for a focusable element at the start of the scroller to move focus to
     * after the scroll, so the next Tab continues from the top instead of from a control that is now
     * off-screen. Omitted: focus stays put and only the scroll happens - the common, least
     * surprising choice for a pointer user. The target has to be focusable itself (`tabindex="-1"`
     * if it is a landmark or heading), the same rule `SkipLink`'s destination has.
     */
    target: {
      type: "string",
      attr: "data-target",
      machineInput: true,
    },
  },

  signatures: {
    BackToTop: {
      intent: [
        "back-to-top",
        "scroll-to-top",
        "return-to-top",
        "scroll-restore",
        "jump-to-start",
      ],
      host: { element: "button" },
      mount: backToTopAttrs.root,
      options: ["threshold", "scroller", "target"],
      /*
       * A REQUIRED TEXT SLOT, and it is the accessible name. The visible affordance is a `chevron-up`
       * from the bound icon set (`Icon`, decision 2: Core names the ROLE, the set draws it); the
       * label is clipped to a name-only box (like `SkipLink`, and for the same reason a bare icon
       * needs `aria-label` elsewhere). Required text on a `button` means the control is always named,
       * so there is no `a11y` rule to evaluate - the guarantee is structural. A consumer who wants a
       * labelled pill un-clips `sk-back-to-top__label` in CSS; the name is already there.
       */
      slots: { children: { accepts: "text", required: true } },
      template: {
        element: "button",
        part: "root",
        also: ["sk-interactive"],
        host: true,
        /*
         * `hidden` from the start: the control is an enhancement, so with no script it stays out of
         * the way rather than pinned to the corner doing nothing. The enhancer (and React's state)
         * remove it once the reader is past the threshold.
         */
        attrs: { type: "button", hidden: "" },
        children: [
          /*
           * `chevron-up`, BAKED IN rather than composed, the same call `Details` makes for its
           * disclosure mark: a back-to-top always points one way, so the role is the contract's to
           * name, not the author's to pass. Authored markup emits the `[data-sk-icon]` placeholder
           * that the icon enhancer swaps for the set's `<svg>`; React renders `<Icon>` directly. The
           * wrapper is `aria-hidden` (the label is the name) and gives the stylesheet a stable hook.
           */
          {
            element: "span",
            part: "icon",
            attrs: { "aria-hidden": "true" },
            /* `sm`, matched to the root's own footprint (`--size-control-md`, packages/core/css/
             * components/back-to-top.css): a `md` glyph read heavy once the button itself dropped
             * from `-lg`, the ratio between chevron and box was what the earlier size actually got
             * right, not the absolute px. */
            children: [{ element: "span", attrs: { "data-sk-icon": "chevron-up", "data-sk-icon-size": "sm" } }],
          },
          { element: "span", part: "label", slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/back-to-top", name: "BackToTop" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated. */
export type BackToTopOptions = OptionsOf<typeof backToTopContract>;
