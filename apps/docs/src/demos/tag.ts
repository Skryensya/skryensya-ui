import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const tag = (children: string, options: Record<string, string | boolean> = {}): UsageTree => ({
  contract: "tag",
  signature: "Tag",
  ...(Object.keys(options).length > 0 ? { options } : {}),
  children,
});

const tagLink = (children: string, href: string, options: Record<string, string | boolean> = {}): UsageTree => ({
  contract: "tag",
  signature: "Tag.link",
  options: { href, ...options },
  children,
});

/* The smallest honest tag: a keyword attached to content, no status semantics and no action. */
export const tagSimpleTree = (t: Translate): UsageTree => tag(t("demo.tag.design"));

/* Tones in one row: the shape stays Tag, while color communicates the keyword's role. */
export const tagTonesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    tag(t("demo.tag.design")),
    tag("tokens", { tone: "accent" }),
    tag(t("demo.tag.active"), { tone: "success" }),
    tag("beta", { tone: "warning" }),
    tag(t("demo.tag.deprecated"), { tone: "danger" }),
  ],
});

/*
 * Linked keywords: each chip is one navigation target. It cannot also be dismissible; removable tags
 * use a separate button instead of nesting a button inside an anchor.
 */
export const tagLinksTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    tagLink(t("demo.tag.design"), "/topics/design"),
    tagLink("tokens", "/topics/tokens", { tone: "accent" }),
    tagLink(t("demo.tag.active"), "/topics/active", { tone: "success" }),
  ],
});

/*
 * Complete filter bar: removable applied facets. The remove button's accessible name names the exact
 * facet it clears, because the visible X is decorative and every tag owns a different action.
 */
export const tagRemovableTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    tag("react", {
      tone: "accent",
      removable: true,
      removeLabel: t("demo.tag.remove", { name: "react" }),
    }),
    tag("frontend", {
      removable: true,
      removeLabel: t("demo.tag.remove", { name: "frontend" }),
    }),
    tag(t("demo.tag.active"), {
      tone: "success",
      removable: true,
      removeLabel: t("demo.tag.remove", { name: t("demo.tag.active") }),
    }),
  ],
});
