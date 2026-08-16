import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * One labelled group, two destinations. The trailing count is a proper noun of sorts (a number),
 * so it stays written. Locale-owned paths come from the page.
 *
 * The stage needs `measure="14rem"`: a nav-list is sized by its host (a sidebar rail), and across
 * the full stage it reads as nothing anyone ships.
 */
export const navListTree = (
  t: Translate,
  hrefs: { home: string; reports: string },
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": t("demo.navList.label") },
  children: {
    contract: "nav-list",
    signature: "NavListGroup",
    slots: { label: t("demo.navList.group") },
    children: [
      {
        contract: "nav-list",
        signature: "NavListLink",
        options: { href: hrefs.home, current: true },
        slots: {
          icon: { contract: "icon", signature: "Icon", options: { name: "info" } },
        },
        children: t("demo.navList.home"),
      },
      {
        contract: "nav-list",
        signature: "NavListLink",
        options: { href: hrefs.reports },
        slots: {
          icon: { contract: "icon", signature: "Icon", options: { name: "calendar" } },
          trailing: "12",
        },
        children: t("demo.navList.reports"),
      },
    ],
  },
});

/*
 * The collapsible group added for the WAI-ARIA "Disclosure (navigation)" pattern: a `<button>`
 * with `aria-expanded`/`aria-controls`, not `<details>` — the reference example for THIS pattern
 * uses a button, not the native element every other disclosure in this system reaches for first.
 * Escape closes it and returns focus to the trigger; arrows/Home/End stay unimplemented, the
 * pattern's own text marks them optional.
 */
export const navListCollapsibleTree = (
  t: Translate,
  hrefs: { settings: string; billing: string },
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": t("demo.navList.collapsibleNavLabel") },
  children: {
    contract: "nav-list",
    signature: "NavListGroup",
    options: { collapsible: true },
    slots: { label: t("demo.navList.account") },
    children: [
      {
        contract: "nav-list",
        signature: "NavListLink",
        options: { href: hrefs.settings },
        slots: {
          icon: { contract: "icon", signature: "Icon", options: { name: "settings" } },
        },
        children: t("demo.navList.settings"),
      },
      {
        contract: "nav-list",
        signature: "NavListLink",
        options: { href: hrefs.billing },
        slots: {
          icon: { contract: "icon", signature: "Icon", options: { name: "file" } },
        },
        children: t("demo.navList.billing"),
      },
    ],
  },
});
