import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Layout's demos, one export per page — the data counterpart of `react-demos/layout.tsx`, which keeps
 * the islands the pages that are not converted yet still mount.
 */

/** A surface with a heading, a line of prose and an action: the three things Box has to hold up. */
export const boxTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "lg" },
  children: [
    { contract: "typography", signature: "Heading", children: t("demo.box.title") },
    { contract: "typography", signature: "Text", children: t("demo.box.body") },
    { contract: "button", signature: "Button.action", children: t("demo.box.action") },
  ],
});
