import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * `menubar-editor`, the WAI-ARIA APG example this pattern is named after: File/Edit, each opening
 * one level of commands. `MenubarItem`'s own label is its `children` slot (text); the dropdown
 * itself is a SEPARATE slot, `items` — the contract's own vocabulary, distinct from the React
 * binding's `label`/`children` split (documented in `menubar.ts`'s own file banner).
 */
const menuItem = (label: string): UsageTree => ({
  contract: "menubar",
  signature: "MenubarMenuItem",
  children: label,
});

const dropdown = (...labels: string[]): UsageTree => ({
  contract: "menubar",
  signature: "MenubarMenu",
  children: labels.map(menuItem),
});

const topItem = (label: string, menu?: UsageTree): UsageTree => ({
  contract: "menubar",
  signature: "MenubarItem",
  children: label,
  ...(menu ? { slots: { items: menu } } : {}),
});

export const menubarTree = (t: Translate): UsageTree => ({
  contract: "menubar",
  signature: "Menubar",
  options: { label: t("demo.menubar.label") },
  children: [
    topItem(
      t("demo.menubar.file"),
      dropdown(t("demo.menubar.new"), t("demo.menubar.open"), t("demo.menubar.save")),
    ),
    topItem(t("demo.menubar.edit"), dropdown(t("demo.menubar.undo"), t("demo.menubar.redo"))),
  ],
});
