import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE ANATOMY SPECIMEN: frozen open markup. A live Menubar cannot hold a dropdown open in an inert
 * frame (Menu's dismiss layer closes it on the first pointer press). No mount attributes. The open
 * item's dropdown reuses Menu's positioner/content with `data-state="open"`; static positioning in
 * `menubarAnatomyCss` keeps the panel in Annotated's measured box.
 */
const menubarAnatomySpecimen = (t: Translate): string => `<div class="sk-menubar" role="menubar" aria-label="${t("demo.menubar.label")}">
  <div class="sk-menubar__item-wrapper sk-menu">
    <button
      class="sk-menubar__item sk-button sk-interactive sk-anchor"
      type="button"
      role="menuitem"
      aria-expanded="true"
      aria-haspopup="menu"
      data-variant="ghost"
      data-size="sm"
      tabindex="-1"
    >
      ${t("demo.menubar.file")}
      <span class="sk-menubar__item-indicator" aria-hidden="true">
        <span data-sk-icon="chevron-down" data-sk-icon-size="md"></span>
      </span>
    </button>
    <div class="sk-menu__positioner sk-anchored">
      <div class="sk-menu__content" data-state="open" role="menu">
        <div class="sk-menu__item sk-interactive" role="menuitem">
          <span class="sk-menu__item-label">${t("demo.menubar.new")}</span>
        </div>
        <div class="sk-menu__item sk-interactive" role="menuitem">
          <span class="sk-menu__item-label">${t("demo.menubar.open")}</span>
        </div>
        <div class="sk-menu__item sk-interactive" role="menuitem">
          <span class="sk-menu__item-label">${t("demo.menubar.save")}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="sk-menubar__item-wrapper sk-menu">
    <button
      class="sk-menubar__item sk-button sk-interactive sk-anchor"
      type="button"
      role="menuitem"
      aria-expanded="false"
      aria-haspopup="menu"
      data-variant="ghost"
      data-size="sm"
      tabindex="-1"
    >
      ${t("demo.menubar.edit")}
      <span class="sk-menubar__item-indicator" aria-hidden="true">
        <span data-sk-icon="chevron-down" data-sk-icon-size="md"></span>
      </span>
    </button>
  </div>
</div>`;

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

export const menubarAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("menubarPage.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${menubarAnatomySpecimen(t)}
  </div>
  ${label(".sk-menubar", "block-start", "sk-menubar", ' data-ring-placement="offset" data-ring-distance="8"')}
  ${label(".sk-menubar__item-wrapper", "inline-start", "sk-menubar__item-wrapper")}
  ${label(".sk-menubar__item", "inline-start", "sk-menubar__item", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-menubar__item-indicator", "inline-end", "sk-menubar__item-indicator")}
  ${label(".sk-menu__positioner", "inline-start", "sk-menu__positioner")}
  ${label(".sk-menu__content", "inline-end", "sk-menu__content")}
  ${label(".sk-menu__item", "inline-end", "sk-menu__item", ' data-ring-placement="offset" data-ring-distance="3"')}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

export const menubarAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
  --sk-demo-menu-panel: 9.5rem;
}

.sk-annotated .sk-menu__content {
  min-inline-size: var(--sk-demo-menu-panel);
}

.sk-annotated__subject > .sk-menubar {
  display: inline-flex;
  gap: var(--space-inline-xs);
  align-items: flex-start;
}

.sk-annotated .sk-menubar__item-wrapper {
  display: inline-grid;
  justify-items: start;
  gap: var(--space-stack-md);
}

.sk-annotated .sk-menubar__item-wrapper > .sk-menu__positioner {
  position: static;
  inline-size: max-content;
}

.sk-annotated__subject {
  text-align: center;
}`;

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
