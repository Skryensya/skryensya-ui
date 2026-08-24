import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * DOCUMENTATION SITE. Three columns, and each one answers a different question: the Sidebar says
 * "where else can I go", the article says "what is this", the `Toc` says "what is on THIS page".
 * Collapsing the third into the first is the usual mistake and it costs the reader the only cheap
 * way to see a long page's shape.
 *
 * The rail is a `NavList` with collapsible groups rather than a `TreeView`. A docs rail lists
 * DESTINATIONS, and nav-list.yaml's own `useWhen` is exactly that (see the note in `app-shell.ts`,
 * which turns down the same substitution for the same reason).
 */

const docLink = (label: string, href: string, current = false): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(current ? { current: true } : {}) },
  children: label,
});

const group = (label: string, children: UsageTree[]): UsageTree => ({
  contract: "nav-list",
  signature: "NavListGroup",
  options: { collapsible: true, defaultOpen: true },
  slots: { label, children },
});

export const docsSiteTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Lumen Docs" },
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: [
            /*
             * The search affordance is a Button carrying a `Kbd`, not an `Input`: this control does
             * not accept text where it stands. It opens a CommandPalette. A text box that cannot be
             * typed into is a lie the whole pattern is built on avoiding, and the shortcut hint is
             * what tells a reader it is a door rather than a field.
             */
            {
              contract: "button",
              signature: "Button.action",
              options: { variant: "subtle" },
              children: [
                { contract: "icon", signature: "Icon", options: { name: "search", size: "sm" } },
                t("demo.docsSite.search"),
                { contract: "kbd", signature: "Kbd", children: "⌘K" },
              ],
            },
            {
              contract: "button",
              signature: "Button.action",
              options: { variant: "accent" },
              children: t("demo.docsSite.getStarted"),
            },
          ],
        },
      ],
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { class: "app-shell" },
      children: [
        {
          contract: "sidebar",
          signature: "Sidebar",
          attrs: { id: "docs-template-sidebar" },
          children: [
            {
              contract: "sidebar",
              signature: "SidebarContent",
              children: {
                contract: "nav-list",
                signature: "NavList",
                attrs: { "aria-label": t("demo.docsSite.navigation") },
                children: [
                  group(t("demo.docsSite.groupStart"), [
                    docLink(t("demo.docsSite.linkInstall"), "#instalacion"),
                    docLink(t("demo.docsSite.linkQuickstart"), "#inicio-rapido", true),
                    docLink(t("demo.docsSite.linkTokens"), "#tokens"),
                  ]),
                  group(t("demo.docsSite.groupGuides"), [
                    docLink(t("demo.docsSite.linkTheming"), "#theming"),
                    docLink(t("demo.docsSite.linkForms"), "#formularios"),
                    docLink(t("demo.docsSite.linkA11y"), "#accesibilidad"),
                  ]),
                  group(t("demo.docsSite.groupReference"), [
                    docLink(t("demo.docsSite.linkApi"), "#api"),
                    docLink(t("demo.docsSite.linkChangelog"), "#changelog"),
                  ]),
                ],
              },
            },
            {
              contract: "sidebar",
              signature: "SidebarResizeHandle",
              options: { label: t("demo.docsSite.resize") },
            },
          ],
        },
        {
          contract: "layout",
          signature: "Main",
          attrs: { class: "app-shell__main" },
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "lg" },
            children: [
              {
                contract: "breadcrumb",
                signature: "Breadcrumb",
                options: { label: t("demo.docsSite.breadcrumbLabel") },
                slots: {
                  items: [
                    { options: { href: "#docs" }, slots: { label: t("demo.docsSite.crumbDocs") } },
                    {
                      options: { href: "#empezar" },
                      slots: { label: t("demo.docsSite.groupStart") },
                    },
                    {
                      options: { current: true },
                      slots: { label: t("demo.docsSite.linkQuickstart") },
                    },
                  ],
                },
              },
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h1", flush: true },
                children: t("demo.docsSite.title"),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "lg", tone: "secondary" },
                children: t("demo.docsSite.lede"),
              },
              {
                contract: "callout",
                signature: "Callout",
                options: { tone: "info" },
                slots: {
                  icon: { contract: "icon", signature: "Icon", options: { name: "info" } },
                  title: t("demo.docsSite.calloutTitle"),
                },
                children: t("demo.docsSite.calloutBody"),
              },
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h3", flush: true },
                attrs: { id: "instalar" },
                children: t("demo.docsSite.sectionInstall"),
              },
              {
                contract: "typography",
                signature: "Text",
                children: t("demo.docsSite.sectionInstallBody"),
              },
              /*
               * `ProcessList`, and the catalogue decides this one outright: these are instructions
               * to read and carry out, and `Steps.avoidWhen` names that case by hand: "son
               * instrucciones para leer y hacer; eso es un ProcessList". `OrderedList` was the wrong
               * answer for the same reason from the other side: it is a list whose ORDER carries
               * meaning, but its rows have no step anatomy, and `ListItem.leading` only accepts an
               * `Icon` or an `Avatar.initials`: never a numeral, so the numbers had to be smuggled
               * in as text the contract does not allow. ProcessList draws its own.
               */
              {
                contract: "process-list",
                signature: "ProcessList",
                children: [
                  {
                    contract: "process-list",
                    signature: "ProcessListItem",
                    slots: { title: t("demo.docsSite.step1") },
                  },
                  {
                    contract: "process-list",
                    signature: "ProcessListItem",
                    slots: { title: t("demo.docsSite.step2") },
                  },
                  {
                    contract: "process-list",
                    signature: "ProcessListItem",
                    slots: { title: t("demo.docsSite.step3") },
                  },
                ],
              },
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h3", flush: true },
                attrs: { id: "siguiente" },
                children: t("demo.docsSite.sectionNext"),
              },
              {
                contract: "typography",
                signature: "Text",
                children: t("demo.docsSite.sectionNextBody"),
              },
            ],
          },
        },
        /*
         * The page rail. `Toc`'s host IS an `<aside>`, so it needs no wrapper to be a landmark -
         * the class only gives it a width and its own scroll inside the shell (site.css).
         */
        {
          contract: "toc",
          signature: "Toc",
          options: { title: t("demo.docsSite.onThisPage") },
          attrs: { class: "docs-template__toc" },
          slots: {
            items: [
              {
                options: { href: "#instalar", current: true },
                slots: { children: t("demo.docsSite.sectionInstall") },
              },
              {
                options: { href: "#paso-1", level: "h3" },
                slots: { children: t("demo.docsSite.step1Short") },
              },
              {
                options: { href: "#paso-2", level: "h3" },
                slots: { children: t("demo.docsSite.step2Short") },
              },
              {
                options: { href: "#siguiente" },
                slots: { children: t("demo.docsSite.sectionNext") },
              },
            ],
          },
        },
      ],
    },
  ],
});
