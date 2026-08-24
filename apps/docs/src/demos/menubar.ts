import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * `menubar-editor`, the WAI-ARIA APG example this pattern is named after: File/Edit, each opening
 * one level of commands. `MenubarItem`'s own label is its `children` slot (text); the dropdown
 * itself is a SEPARATE slot, `items`. The contract's own vocabulary, distinct from the React
 * binding's `label`/`children` split (documented in `menubar.ts`'s own file banner).
 *
 * `items` is `Menu`'s own item shape verbatim (`menu.ts`'s `menuItemShape`), an `ItemInput[]`, NOT
 * a nested `UsageTree`: `MenubarMenu`/`MenubarMenuItem`, the hand-rolled signatures this demo used
 * to build with, are gone from the contract (see the header comment on `packages/core/src/
 * menubar.ts`. A dropdown IS a real `Menu` popup now, not a second description of one).
 */
const dropdownItem = (value: string, label: string): ItemInput => ({
  options: { value },
  slots: { label },
});

/** A dropdown entry that navigates instead of firing a command: `menuItemShape`'s own `href`
 *  (`menu.ts`), a real `<a>` in the rendered dropdown. */
const navDropdownItem = (value: string, label: string, href: string): ItemInput => ({
  options: { value, href },
  slots: { label },
});

/*
 * A SUBMENU standing where a dropdown item would: `children` is the same recursive collection
 * slot `menuItemShape` declares (`menu.ts`'s own `children: { accepts: "items", recursive: true }`),
 * so this is not special MENUBAR machinery. A bar item's dropdown is a real `Menu` popup, and
 * arbitrarily nested submenus are `Menu`'s own feature, inherited for free (see `menubar.ts`'s file
 * banner and the `menubarPage.contractBody` copy: the bar's OWN hand-rolled behaviour stops at one
 * level of DROPDOWN per top-level item; a dropdown's own CONTENTS nest exactly as deep as `Menu`'s
 * already do).
 */
const submenuItem = (value: string, label: string, children: readonly ItemInput[]): ItemInput => ({
  options: { value },
  slots: { label, children },
});

/*
 * `Menubar.children` accepts SIGNATURE nodes, of `MenubarItem` (a real UsageTree, per the
 * contract's `slots.children`), unlike `MenubarItem.items` below it, which accepts the flat
 * `ItemInput[]` array `dropdownItem` builds. One level down, one shape down. `MenubarItem`
 * declares no options of its own (`options: []`). Only `children` (its label, text) and `items`
 * (its dropdown, optional).
 */
const topItem = (label: string, items?: readonly ItemInput[]): UsageTree => ({
  contract: "menubar",
  signature: "MenubarItem",
  children: label,
  ...(items ? { slots: { items } } : {}),
});

/** Same shape, `nav: true`. The trigger renders as `nav-list`'s own link instead of a Button
 *  (`menubar.ts`'s own doc on the option). Every bit of Menubar's behavior is unchanged. */
const topItemNav = (label: string, items: readonly ItemInput[]): UsageTree => ({
  contract: "menubar",
  signature: "MenubarItem",
  options: { nav: true },
  children: label,
  slots: { items },
});

export const menubarTree = (t: Translate): UsageTree => ({
  contract: "menubar",
  signature: "Menubar",
  options: { label: t("demo.menubar.label") },
  children: [
    topItem(t("demo.menubar.file"), [
      dropdownItem("new", t("demo.menubar.new")),
      dropdownItem("open", t("demo.menubar.open")),
      dropdownItem("save", t("demo.menubar.save")),
    ]),
    topItem(t("demo.menubar.edit"), [
      dropdownItem("undo", t("demo.menubar.undo")),
      dropdownItem("redo", t("demo.menubar.redo")),
    ]),
  ],
});

export const menubarSubmenuTree = (t: Translate): UsageTree => ({
  contract: "menubar",
  signature: "Menubar",
  options: { label: t("demo.menubar.label") },
  children: [
    topItem(t("demo.menubar.file"), [
      dropdownItem("new", t("demo.menubar.new")),
      dropdownItem("open", t("demo.menubar.open")),
      dropdownItem("save", t("demo.menubar.save")),
      submenuItem("export", t("demo.menubar.export"), [
        dropdownItem("pdf", t("demo.menubar.pdf")),
        dropdownItem("csv", t("demo.menubar.csv")),
      ]),
      dropdownItem("print", t("demo.menubar.print")),
    ]),
    topItem(t("demo.menubar.edit"), [
      dropdownItem("undo", t("demo.menubar.undo")),
      dropdownItem("redo", t("demo.menubar.redo")),
    ]),
  ],
});

/*
 * WAI's own `menubar-navigation` example: a menubar used for SITE navigation, not application
 * commands. Every top item opens a dropdown of real destinations. `nav: true` (`topItemNav`)
 * renders each trigger as `nav-list`'s own link (`sk-nav-list__link`/`__label`), and every
 * dropdown entry carries a real `href` (`navDropdownItem`), so the whole thing is actually built
 * from nav-list's elements and real links: not a Button wearing nav-list's colors.
 */
export const menubarNavTree = (t: Translate): UsageTree => ({
  contract: "menubar",
  signature: "Menubar",
  options: { label: t("demo.navbar.nav") },
  children: [
    topItemNav(t("demo.menubar.destinations"), [
      navDropdownItem("home", t("demo.navbar.home"), "/"),
      navDropdownItem("projects", t("demo.navbar.projects"), "/proyectos"),
      navDropdownItem("reports", t("demo.navbar.reports"), "/reportes"),
      navDropdownItem("team", t("demo.navbar.team"), "/equipo"),
    ]),
  ],
});
