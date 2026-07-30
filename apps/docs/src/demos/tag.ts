import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Tag's row of tones, plus the two removable ones.
 *
 * `tokens`, `react` and `frontend` are written here rather than translated: they are the words the
 * demo is ABOUT, and they read the same in every language. The remove button's accessible name is
 * built from one pattern (`Quitar {name}` / `Remove {name}`) so the two never disagree on which tag
 * a control removes.
 */
export const tagTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    { contract: "tag", signature: "Tag", children: t("demo.tag.design") },
    { contract: "tag", signature: "Tag", options: { tone: "accent" }, children: "tokens" },
    { contract: "tag", signature: "Tag", options: { tone: "success" }, children: t("demo.tag.active") },
    { contract: "tag", signature: "Tag", options: { tone: "warning" }, children: "beta" },
    {
      contract: "tag",
      signature: "Tag",
      options: { tone: "danger" },
      children: t("demo.tag.deprecated"),
    },
    {
      contract: "tag",
      signature: "Tag",
      options: {
        tone: "accent",
        removable: true,
        removeLabel: t("demo.tag.remove", { name: "react" }),
      },
      children: "react",
    },
    {
      contract: "tag",
      signature: "Tag",
      options: { removable: true, removeLabel: t("demo.tag.remove", { name: "frontend" }) },
      children: "frontend",
    },
  ],
});
