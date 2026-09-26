import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * One link, because one link is the whole component: a second SHAPE would be a decision nobody
 * should have to make, and a second INSTANCE is just this tree written twice (see `skipLinkPairTree`
 * below, which is exactly that).
 *
 * What the preview cannot show is the interesting half, and that is a fact about the component
 * rather than a shortcoming of the frame: it is invisible until it has focus, so the page tells the
 * reader to press Tab inside the preview instead of drawing a state that only exists while focused.
 */
export const skipLinkTree = (t: Translate): UsageTree => ({
  contract: "skip-link",
  signature: "SkipLink",
  options: { href: "#main-content" },
  children: t("skipLink.demoContentLabel"),
});

/*
 * The pair, in the order they should be offered: content first.
 *
 * Wrapped in a Stack only because a usage tree has one root and these are siblings; the wrapper is
 * the demo's, not the pattern's. In a real document they sit loose at the top of the `<body>`, which
 * is what the code beside this preview shows.
 */
export const skipLinkPairTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "skip-link",
      signature: "SkipLink",
      options: { href: "#main-content" },
      children: t("skipLink.demoContentLabel"),
    },
    {
      contract: "skip-link",
      signature: "SkipLink",
      options: { href: "#main-nav" },
      children: t("skipLink.demoNavLabel"),
    },
  ],
});

/*
 * One part, drawn in the state nobody sees it in at rest: focused. `skipLinkAnatomyCss` puts the
 * focus rule's box on it and takes it out of `position: fixed`, because a diagram of an element that
 * is clipped to one pixel would be a diagram of nothing.
 */
export const skipLinkAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("skipLink.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "skip-link",
      signature: "SkipLink",
      options: { href: "#main-content" },
      children: t("skipLink.demoContentLabel"),
    },
    items: [
      namePart(".sk-skip-link", "block-start", { ringPlacement: "offset", ringDistance: 4 }),
    ],
  },
});

export const skipLinkAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject a.sk-skip-link {
  position: static;
  inline-size: auto;
  block-size: auto;
  overflow: visible;
  clip-path: none;
  padding: var(--sk-skip-link-padding-block) var(--sk-skip-link-padding-inline);
  border: 1px solid var(--sk-skip-link-border-color);
  box-shadow: var(--sk-skip-link-shadow);
}`;
