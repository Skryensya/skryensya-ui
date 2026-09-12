import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * The bar holds a brand, a horizontal nav-list guest, and two actions. "Atlas" stays written: it
 * is a product name. Locale-owned paths come from the page.
 *
 * The hand-written HTML skipped NavListGroup; the contract requires it (a `<li>` needs a `<ul>`),
 * so the tree always nests the group, even when it has no label.
 */
export const navbarTree = (
  t: Translate,
  hrefs: { home: string; projects: string; reports: string; team: string },
): UsageTree => ({
  contract: "navbar",
  signature: "Navbar",
  children: [
    {
      contract: "navbar",
      signature: "NavbarBrand",
      children: "Atlas",
    },
    {
      contract: "nav-list",
      signature: "NavList",
      options: { orientation: "horizontal" },
      attrs: { "aria-label": t("demo.navbar.nav") },
      children: {
        contract: "nav-list",
        signature: "NavListGroup",
        children: [
          {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: hrefs.home, current: true },
            children: t("demo.navbar.home"),
          },
          {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: hrefs.projects },
            children: t("demo.navbar.projects"),
          },
          {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: hrefs.reports },
            children: t("demo.navbar.reports"),
          },
          {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: hrefs.team },
            children: t("demo.navbar.team"),
          },
        ],
      },
    },
    {
      contract: "navbar",
      signature: "NavbarActions",
      children: [
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost" },
          children: t("demo.navbar.invite"),
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { tone: "accent" },
          children: t("demo.navbar.newProject"),
        },
      ],
    },
  ],
});


/** Brand, nav guest and actions: the three regions a Navbar always composes. */
export const navbarAnatomyTree = (
  t: Translate,
  hrefs: { home: string; projects: string; reports: string; team: string },
): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("navbarPage.anatomyLabel"), inert: true },
  slots: {
    subject: navbarTree(t, hrefs),
    items: [
      namePart(".sk-navbar", "block-start"),
      namePart(".sk-navbar__brand", "inline-start"),
      namePart(".sk-nav-list", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-navbar__actions", "inline-end"),
    ],
  },
});

