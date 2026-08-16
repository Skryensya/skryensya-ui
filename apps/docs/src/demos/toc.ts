import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { tocIconItems, tocItems, tocNestedItems } from "./data/toc";

/* Plain, nested (h2/h3) and icon-bearing Toc compositions shared by both locales. The entries
 * themselves are data: see `data/toc.ts`. */

export const tocPlainTree = (t: Translate): UsageTree => ({
  contract: "toc",
  signature: "Toc",
  options: { title: t("demo.toc.title") },
  slots: { items: tocItems(t) },
});

export const tocNestedTree = (t: Translate): UsageTree => ({
  contract: "toc",
  signature: "Toc",
  options: { title: t("demo.toc.title") },
  slots: { items: tocNestedItems(t) },
});

export const tocIconsTree = (t: Translate): UsageTree => ({
  contract: "toc",
  signature: "Toc",
  options: { title: t("demo.toc.title") },
  slots: { items: tocIconItems(t) },
});
