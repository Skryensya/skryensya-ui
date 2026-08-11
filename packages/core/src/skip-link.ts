import type { ComponentContract } from "./contract.js";

/*
 * SKIP LINK, the first thing on the page and the one nobody sees.
 *
 * A page begins with chrome: a banner, a brand, a row of global links, a search trigger. Someone
 * reading with a keyboard or a screen reader arrives at that chrome on EVERY page and has to walk
 * through it before reaching anything they came for. WCAG 2.4.1 (Bypass Blocks) is the requirement;
 * a link at the top of the document that jumps past the repeated part is the answer the platform
 * already has for it, and it needs no script: an in-page `href` is a browser feature.
 *
 * WHY THIS IS A CONTRACT AND NOT A RECIPE ON TOP OF `sk-visually-hidden`, which is where it lived
 * implicitly until now (`patterns/visually-hidden.css` even names the skip link in a comment as the
 * reason its `:focus-visible` escape hatch exists):
 *
 *   - That escape hatch restores the link to `position: static`, which means the link takes LAYOUT
 *     the moment it is focused, and the page jumps under the reader at the exact instant they are
 *     trying to read where they landed. A skip link has to appear WITHOUT reflowing anything, which
 *     is a different rule, not a variation of the same one.
 *   - "Hidden until focused" is the whole component. Composed by hand it is four declarations that
 *     every consumer has to get right on their own, and getting one wrong is invisible: nobody sees
 *     the link, which is what it looks like when it works.
 *
 * IT IS A LINK, not a button with an onClick. The platform moves focus, restores it on Back, gives
 * it a real context menu and a middle-click: everything a scripted jump has to reimplement badly.
 *
 * THERE MAY BE SEVERAL, and that is why this signature takes one destination rather than a list of
 * them. A page with a persistent index reasonably offers two, one to the content and one to the
 * navigation, and a page with neither offers none; a `links` collection would have made the common
 * case (exactly one) carry an array, and would have put the ORDER inside an option where nobody
 * looks. The order is the decision here, not a detail: the first one is what everybody gets, so it
 * should answer the question most readers arrived with, which is almost always "let me read this
 * page" rather than "let me go somewhere else". Composing them is `<SkipLink>` twice, in the order
 * they should be offered.
 */
export const skipLinkParts = {
  root: "sk-skip-link",
} as const;

export type SkipLinkPart = keyof typeof skipLinkParts;
export type SkipLinkPartClass = (typeof skipLinkParts)[SkipLinkPart];

/**
 * THE TARGET HAS TO BE FOCUSABLE, and that is the one thing this component cannot do for you.
 *
 * Following an in-page link scrolls in every browser, but only some of them move FOCUS to the
 * destination; in the rest the next Tab continues from where the link was, which lands the reader
 * back in the chrome they just asked to skip. `tabindex="-1"` on the destination is what closes
 * that gap, and it is a property of the destination, not of the link, so it is named here as the
 * rule it is rather than emitted onto an element this contract does not own.
 */
export const SKIP_LINK_TARGET_TABINDEX = "-1";

export const skipLinkContract = {
  id: "skip-link",
  css: "@skryensya/core/components/skip-link.css",
  parts: skipLinkParts,

  options: {
    /**
     * Where it jumps. In-page and therefore an id (`#main-nav`), which is what makes this the
     * platform's own navigation rather than a scripted one.
     */
    href: { type: "string", attr: "href" },
  },

  /*
   * NO `a11y` BLOCK, and the absence is the interesting part: the rules this component actually has
   * (the destination is focusable, nothing focusable comes before it, and content is offered before
   * navigation when there are two) are all about elements or siblings the tree does not contain.
   * `a11y` rules are decided from a usage tree by the validator, and none of these is; claiming
   * them here would put a rule in the manifest that nothing can ever check. They live in the
   * overlay and on the page instead, which is where a rule a machine cannot settle belongs.
   */
  signatures: {
    SkipLink: {
      intent: ["skip-link", "bypass-blocks", "skip-to-content", "skip-to-navigation", "wcag-2-4-1"],
      host: { element: "a" },
      options: ["href"],
      requires: ["href"],
      slots: { children: { accepts: "text", required: true } },
      template: {
        element: "a",
        part: "root",
        also: ["sk-interactive"],
        host: true,
        slot: "children",
      },
      react: { from: "@skryensya/react/skip-link", name: "SkipLink" },
    },
  },
} as const satisfies ComponentContract;
