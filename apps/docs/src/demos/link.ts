import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The prose pair: text-coloured link and primary-coloured link in one sentence. TileLink stays
 * authored — tile title/description parts are declared and unreachable.
 *
 * Locale-owned href comes from the page (`/componentes/link` vs `/en/components/link`).
 */

/** Two links in a paragraph — underline always, tone optional. */
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
