import { PLACEHOLDER_HREF } from "../lib/placeholder-hrefs";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/* Link demos shared by both locales. Locale-owned hrefs come from the pages. */

/** Two links in a paragraph: underline always, tone optional. */
export const linkTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "typography",
  signature: "Text",
  children: [
    t("demo.link.before"),
    {
      contract: "typography",
      signature: "Link",
      options: { href },
      children: t("demo.link.neutral"),
    },
    t("demo.link.middle"),
    {
      contract: "typography",
      signature: "Link",
      options: { href, linkTone: "accent" },
      children: t("demo.link.accent"),
    },
    t("demo.link.after"),
  ],
});

export const tileLinkTree = (_t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "tile",
  signature: "TileLink",
  options: { href },
  children: {
    contract: "tile",
    signature: "TileContent",
    slots: {
      title: "Usage details",
      description: "Open the account usage report.",
    },
  },
});

/*
 * One part, and it only means something inside a sentence: the paragraph is `sk-text`, the anchor in
 * it is `sk-link`. Both are ringed so the reader sees which of the two the link class belongs to.
 */
export const linkAnatomyTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("linkPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "typography",
      signature: "Text",
      attrs: { style: "max-inline-size: 26rem;" },
      children: [
        t("demo.link.before"),
        { contract: "typography", signature: "Link", options: { href }, children: t("demo.link.neutral") },
        t("demo.link.after"),
      ],
    },
    items: [
      namePart(".sk-text", "inline-start", { mark: "bracket" }),
      namePart(".sk-link", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});
