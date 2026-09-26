import { placeholderHrefs } from "../lib/placeholder-hrefs";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type NavbarHrefs = { home: string; projects: string; reports: string; team: string };

type NavbarDestination = keyof NavbarHrefs;

/*
 * The destinations the navbar demos share: the bar changes around them, the list does not. Home is
 * always the current page. A demo may take fewer of them; the anatomy does, to fit its drawing.
 */
const navbarLinks = (
  t: Translate,
  hrefs: NavbarHrefs,
  destinations: readonly NavbarDestination[] = ["home", "projects", "reports", "team"],
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  options: { orientation: "horizontal" },
  attrs: { "aria-label": t("demo.navbar.nav") },
  children: {
    contract: "nav-list",
    signature: "NavListGroup",
    children: destinations.map((destination) => ({
      contract: "nav-list",
      signature: "NavListLink",
      options: { href: hrefs[destination], ...(destination === "home" ? { current: true } : {}) },
      children: t(`demo.navbar.${destination}`),
    })),
  },
});

/*
 * The bar holds a brand, a horizontal nav-list guest, and two actions. "Atlas" stays written: it
 * is a product name. Locale-owned paths come from the page.
 *
 * The hand-written HTML skipped NavListGroup; the contract requires it (a `<li>` needs a `<ul>`),
 * so the tree always nests the group, even when it has no label.
 */
export const navbarTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => ({
  contract: "navbar",
  signature: "Navbar",
  children: [
    {
      contract: "navbar",
      signature: "NavbarBrand",
      children: "Atlas",
    },
    navbarLinks(t, hrefs),
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

/*
 * NO CONTAINER, and no option for it either: the bar's surface is four hooks (`bg`, `wash`,
 * `elevation`, `border-color`), so a consumer who wants the bar to sit on the page rather than on a
 * surface re-declares them, the same way any shell is restyled. The padding stays: it is what keeps
 * the brand off the viewport's edge once there is no bar edge to measure from.
 *
 * The guest follows: a tinted current link reads as a chip once there is no bar around it, so the
 * current page keeps its colour and emphasis and drops the fill. Scoped to `.sk-navbar .sk-nav-list`
 * because the list declares its own defaults on its root; a hook set on the bar alone would lose.
 */
export const navbarBareCss = `.sk-navbar {
  --sk-navbar-bg: transparent;
  --sk-navbar-wash: none;
  --sk-navbar-elevation: none;
  --sk-navbar-border-color: transparent;
}

.sk-navbar .sk-nav-list {
  --sk-nav-list-link-current-bg: transparent;
  --sk-nav-list-link-current-fg: var(--color-text-primary);
}`;

/** The same bar with no surface of its own: a marketing header sitting straight on the page. */
export const navbarBareTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => ({
  contract: "navbar",
  signature: "Navbar",
  children: [
    {
      contract: "navbar",
      signature: "NavbarBrand",
      children: "Atlas",
    },
    navbarLinks(t, hrefs),
    {
      contract: "navbar",
      signature: "NavbarActions",
      children: [
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost" },
          children: t("demo.navbar.signIn"),
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { tone: "accent" },
          children: t("demo.navbar.getStarted"),
        },
      ],
    },
  ],
});

/*
 * An app's bar: the actions are tools rather than calls to action, so they go icon-only, each with
 * its own accessible name, and the account closes the row. The avatar is a node in the actions
 * slot like any other; the bar does not need to know it is a person.
 */
export const navbarAppTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => ({
  contract: "navbar",
  signature: "Navbar",
  children: [
    {
      contract: "navbar",
      signature: "NavbarBrand",
      children: "Atlas",
    },
    navbarLinks(t, hrefs),
    {
      contract: "navbar",
      signature: "NavbarActions",
      children: [
        {
          contract: "button",
          signature: "Button.action",
          options: { iconOnly: true, variant: "ghost" },
          attrs: { "aria-label": t("demo.navbar.search") },
          children: { contract: "icon", signature: "Icon", options: { name: "search" } },
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { iconOnly: true, variant: "ghost" },
          attrs: { "aria-label": t("demo.navbar.settings") },
          children: { contract: "icon", signature: "Icon", options: { name: "settings" } },
        },
        {
          contract: "avatar",
          signature: "Avatar.initials",
          options: { name: "Ada Lovelace", size: "sm" },
          children: "AL",
        },
      ],
    },
  ],
});

/*
 * Brand, nav guest and actions: the three regions a Navbar always composes.
 *
 * A SMALLER BAR than the usage demo: three links and one action. Every anatomy is drawn at a design
 * width of the frame or 36rem, whichever is wider (`annotation.css`), and the full bar is wider than
 * what 36rem leaves once the bubbles have their gutters. The canvas scales the whole drawing down, but
 * it cannot scale a specimen that was squeezed first, so on a phone the links were ellipsised to "H."
 * and "P…". Each region still holds something, which is all the drawing needs to point at.
 */
export const navbarAnatomyTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("navbarPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Atlas" },
        navbarLinks(t, hrefs, ["home", "projects", "team"]),
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: {
            contract: "button",
            signature: "Button.action",
            options: { tone: "accent" },
            children: t("demo.navbar.newProject"),
          },
        },
      ],
    },
    items: [
      namePart(".sk-navbar", "block-start", { mark: "bracket" }),
      namePart(".sk-navbar__brand", "inline-start"),
      namePart(".sk-nav-list", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-navbar__actions", "inline-end"),
    ],
  },
});

