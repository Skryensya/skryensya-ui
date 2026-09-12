import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * THE ANATOMY: labelled pill so every part is painted. Default chrome clips the label to a name-only
 * box; a diagram that named an invisible part would be worse than omitting it. Threshold 0 keeps the
 * control revealed without a scroll listener (same move the static specimen uses). Anatomy CSS below
 * parks it in flow and un-clips the label.
 */
export const backToTopAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("backToTop.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "back-to-top",
      signature: "BackToTop",
      options: { threshold: 0 },
      children: t("backToTop.demoLabel"),
    },
    items: [
      namePart(".sk-back-to-top", "block-start"),
      namePart(".sk-back-to-top__icon", "inline-start"),
      namePart(".sk-back-to-top__label", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/** In-flow labelled pill for the anatomy frame: not the page-corner placement the live demos use. */
export const backToTopAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject .sk-back-to-top {
  position: static;
  --sk-back-to-top-size: auto;
  padding-inline: var(--space-inset-md);
  gap: var(--space-inline-xs);
}

.sk-annotated__subject .sk-back-to-top__label {
  position: static;
  inline-size: auto;
  block-size: auto;
  overflow: visible;
  clip-path: none;
}`;

/*
 * TWO demos, because the component has two things worth seeing and one frame cannot show both at
 * once.
 *
 *   backToTopTree        the specimen: `threshold: 0`, always visible, so the Reference and Style
 *                        hooks tabs have a painted element to resolve against and the reader gets a
 *                        "here is the object" before the behaviour.
 *   backToTopScrollTree  the behaviour: a column tall enough to scroll inside a `scroll` stage, with
 *                        the button set to a small threshold. The reader scrolls the preview, the
 *                        button pops in, they click it, it carries them back. This is the demo.
 *
 * BOTH NEED `backToTopDemoCss`, and that is the contract working as intended rather than a gap: the
 * component no longer positions itself (see `components/back-to-top.css`), so every consumer places
 * it, and a demo is a consumer. Without it the button lands in normal flow  -  for the scroll demo
 * that means it scrolls away with the paragraphs, which is precisely the behaviour the demo exists
 * to show it does NOT have.
 */

/*
 * The demo's own placement: pinned to the preview stage's own corner.
 *
 * `fixed` inside the frame resolves against the FRAME's viewport, not the docs page, because each
 * stage is its own document (`ComponentPreview`'s srcdoc). So this is the whole page-level placement
 * story in miniature, which is what makes it worth showing here rather than hiding in the layout.
 *
 * Passed to BOTH bindings through `ComponentPreview`'s `css` prop, the same way `menuContextCss`
 * is: a demo whose Vanilla half is placed and whose React half is not would be two demos wearing
 * one label.
 */
export const backToTopDemoCss = `.sk-back-to-top {
  position: fixed;
  inset-block-end: var(--space-inset-md);
  inset-inline-end: var(--space-inset-md);
  z-index: var(--z-sticky);
}`;
export const backToTopTree = (t: Translate): UsageTree => ({
  contract: "back-to-top",
  signature: "BackToTop",
  options: { threshold: 0 },
  children: t("backToTop.demoLabel"),
});

export const backToTopScrollTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    { contract: "typography", signature: "Text", children: t("backToTop.scrollDemoP1") },
    { contract: "typography", signature: "Text", children: t("backToTop.scrollDemoP2") },
    { contract: "typography", signature: "Text", children: t("backToTop.scrollDemoP3") },
    {
      contract: "back-to-top",
      signature: "BackToTop",
      /*
       * 48, not the page-scale 400 and not the 96 this had first: the stage is short, and the demo
       * has to REVEAL the button with room to spare on either side of the trip. Measured with the
       * reading measure the page caps this at, the column scrolls 105px, so a 96 threshold cleared
       * itself by nine pixels  -  the button appeared in the last moment of the travel, and any
       * reflow of the copy would have taken even that away. Half the range each way is what makes
       * the reveal legible as a reveal.
       */
      options: { threshold: 48 },
      children: t("backToTop.demoLabel"),
    },
  ],
});
