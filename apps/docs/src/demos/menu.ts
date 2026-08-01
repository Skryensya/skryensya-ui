import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/**
 * File actions: a plain command, a checkbox that shows its state, and a submenu.
 *
 * The submenu is the point — it is a whole Menu standing where an item would, and in the tree that
 * is just an entry whose `children` are entries. Format names stay written: PDF and CSV read the
 * same in every language.
 */
export const menuTree = (t: Translate): UsageTree => ({
  contract: "menu",
  signature: "Menu",
  options: { label: t("demo.menu.label") },
  slots: {
    trigger: t("demo.menu.trigger"),
    items: [
      { options: { value: "rename" }, slots: { label: t("demo.menu.rename") } },
      {
        options: { value: "favorite", kind: "checkbox" },
        slots: { label: t("demo.menu.favorite") },
      },
      {
        options: { value: "export" },
        slots: {
          label: t("demo.menu.export"),
          children: [
            { options: { value: "pdf" }, slots: { label: "PDF" } },
            { options: { value: "csv" }, slots: { label: "CSV" } },
          ],
        },
      },
    ],
  },
});
