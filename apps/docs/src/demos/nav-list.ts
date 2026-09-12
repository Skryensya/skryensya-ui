import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * ONE group with a labelled list, an icon link, a trailing count, and a nested sub-list: enough of
 * the pattern's own parts to name the landmark without filling the frame with a full product nav.
 */
export const navListAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("navListPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "nav-list",
      signature: "NavList",
      attrs: { "aria-label": t("demo.navList.productLabel"), style: "inline-size: 14rem" },
      children: [
        {
          contract: "nav-list",
          signature: "NavListGroup",
          slots: { label: t("demo.navList.groupWork") },
          children: [
            link(t("demo.navList.dashboard"), "/app/dashboard", "info", { current: true }),
            link(t("demo.navList.inbox"), "/app/inbox", "file", { trailing: "8" }),
            link(t("demo.navList.customers"), "/app/customers", "user", {
              nested: {
                contract: "nav-list",
                signature: "NavListGroup",
                children: [
                  link(t("demo.navList.allCustomers"), "/app/customers"),
                  link(t("demo.navList.segments"), "/app/segments"),
                ],
              },
            }),
          ],
        },
      ],
    },
    items: [
      namePart(".sk-nav-list", "block-start"),
      namePart(".sk-nav-list__group", "inline-start"),
      namePart(".sk-nav-list__group-label", "inline-end"),
      namePart(".sk-nav-list__list", "inline-start", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-nav-list__item", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-nav-list__link", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-nav-list__label", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-nav-list__trailing", "block-end"),
    ],
  },
});

const icon = (name: string): UsageTree => ({
  contract: "icon",
  signature: "Icon",
  options: { name },
});

const link = (
  label: string,
  href: string,
  iconName?: string,
  extra: { current?: boolean; trailing?: string; nested?: UsageTree } = {},
): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(extra.current ? { current: true } : {}) },
  slots: {
    ...(iconName ? { icon: icon(iconName) } : {}),
    ...(extra.trailing ? { trailing: extra.trailing } : {}),
    ...(extra.nested ? { nested: extra.nested } : {}),
  },
  children: label,
});

/*
 * Sidebar-like product navigation: more than a toy pair of links, with real grouping, active route,
 * icons, trailing counters, and a destination that owns sub-destinations through NavListLink.nested.
 * The stage stays narrow because nav-list is always sized by a sidebar, drawer, or navbar host.
 */
export const navListProductTree = (
  t: Translate,
  hrefs: { dashboard: string; inbox: string; customers: string; segments: string; automations: string; settings: string },
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": t("demo.navList.productLabel") },
  children: [
    {
      contract: "nav-list",
      signature: "NavListGroup",
      slots: { label: t("demo.navList.groupWork") },
      children: [
        link(t("demo.navList.dashboard"), hrefs.dashboard, "info", { current: true }),
        link(t("demo.navList.inbox"), hrefs.inbox, "file", { trailing: "8" }),
        link(t("demo.navList.customers"), hrefs.customers, "user", {
          nested: {
            contract: "nav-list",
            signature: "NavListGroup",
            children: [
              link(t("demo.navList.allCustomers"), hrefs.customers),
              link(t("demo.navList.segments"), hrefs.segments),
            ],
          },
        }),
      ],
    },
    {
      contract: "nav-list",
      signature: "NavListGroup",
      slots: { label: t("demo.navList.groupOperate") },
      children: [
        link(t("demo.navList.automations"), hrefs.automations, "refresh"),
        link(t("demo.navList.settings"), hrefs.settings, "settings"),
      ],
    },
  ],
});

/* Horizontal nav-list as a navbar guest: the same NavListGroup wrapper remains, just unlabelled. */
export const navListHorizontalTree = (
  t: Translate,
  hrefs: { overview: string; projects: string; reports: string; team: string },
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  options: { orientation: "horizontal" },
  attrs: { "aria-label": t("demo.navList.horizontalLabel") },
  children: {
    contract: "nav-list",
    signature: "NavListGroup",
    children: [
      link(t("demo.navList.overview"), hrefs.overview, undefined, { current: true }),
      link(t("demo.navList.projects"), hrefs.projects),
      link(t("demo.navList.reports"), hrefs.reports),
      link(t("demo.navList.team"), hrefs.team),
    ],
  },
});

/*
 * Disclosure navigation, like a docs rail or settings drawer: groups open and close, but the items
 * remain links rather than menuitems. The second group starts closed to make the defaultOpen contract visible.
 */
export const navListCollapsibleTree = (
  t: Translate,
  hrefs: { start: string; components: string; tokens: string; profile: string; billing: string },
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": t("demo.navList.collapsibleNavLabel") },
  children: [
    {
      contract: "nav-list",
      signature: "NavListGroup",
      options: { collapsible: true, defaultOpen: true },
      slots: { label: t("demo.navList.docs") },
      children: [
        link(t("demo.navList.start"), hrefs.start, "info", { current: true }),
        link(t("demo.navList.components"), hrefs.components, "folder"),
        link(t("demo.navList.tokens"), hrefs.tokens, "edit"),
      ],
    },
    {
      contract: "nav-list",
      signature: "NavListGroup",
      options: { collapsible: true, defaultOpen: false },
      slots: { label: t("demo.navList.account") },
      children: [
        link(t("demo.navList.profile"), hrefs.profile, "user"),
        link(t("demo.navList.billing"), hrefs.billing, "file"),
      ],
    },
  ],
});
