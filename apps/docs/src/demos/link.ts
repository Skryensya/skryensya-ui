import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Link demos shared by both locales. Locale-owned hrefs come from the pages. */

/** Two links in a paragraph: underline always, tone optional. */
export const linkTree = (t: Translate, href: string): UsageTree => ({
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
      options: { href, linkTone: "primary" },
      children: t("demo.link.primary"),
    },
    t("demo.link.after"),
  ],
});

export const tileLinkTree = (_t: Translate, href: string): UsageTree => ({
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
