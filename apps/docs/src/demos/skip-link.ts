import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
