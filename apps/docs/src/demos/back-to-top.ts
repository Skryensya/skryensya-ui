import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
 */
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
      /* Small on purpose: the preview stage is short, so a page-scale 400 would need more scroll
         than there is room for. */
      options: { threshold: 96 },
      children: t("backToTop.demoLabel"),
    },
  ],
});
