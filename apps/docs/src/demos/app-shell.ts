import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const icon = (name: string): UsageTree => ({
  contract: "icon",
  signature: "Icon",
  options: { name },
});

const navLink = (
  t: Translate,
  key: "overview" | "deployments" | "settings" | "billing",
  iconName: string,
  href: string,
  current = false,
  trailing?: string,
): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(current ? { current: true } : {}) },
  slots: {
    icon: icon(iconName),
    ...(trailing ? { trailing } : {}),
    children: t(`demo.appShell.nav.${key}`),
  },
});


/**
 * A full application shell: global chrome, its own collapsible Sidebar, and a populated work area.
 * It renders directly in the Templates document inside an isolated demo region; every element stays
 * a published contract signature.
 */
export const appShellTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: { contract: "navbar", signature: "NavbarBrand", children: "Northstar" },
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { class: "app-shell" },
      children: [
        {
          contract: "sidebar",
          signature: "Sidebar",
          attrs: { id: "release-sidebar" },
          children: [
            {
              contract: "sidebar",
              signature: "SidebarTrigger",
              options: { label: t("demo.appShell.collapse"), floating: true },
              slots: { icon: icon("chevron-left") },
            },
            {
              contract: "sidebar",
              signature: "SidebarContent",
              children: {
                contract: "nav-list",
                signature: "NavList",
                attrs: { "aria-label": t("demo.appShell.navigation") },
                children: [
                  {
                    contract: "nav-list",
                    signature: "NavListGroup",
                    slots: {
                      label: t("demo.appShell.workspace"),
                      children: [
                        navLink(t, "overview", "info", "#overview", true),
                        navLink(t, "deployments", "calendar", "#deployments", false, "12"),
                      ],
                    },
                  },
                  {
                    contract: "nav-list",
                    signature: "NavListGroup",
                    slots: {
                      label: t("demo.appShell.manage"),
                      children: [
                        navLink(t, "settings", "settings", "#settings"),
                        navLink(t, "billing", "file", "#billing"),
                      ],
                    },
                  },
                ],
              },
            },
            { contract: "sidebar", signature: "SidebarSeparator" },
            {
              contract: "sidebar",
              signature: "SidebarFooter",
              children: {
                contract: "typography",
                signature: "Text",
                options: { size: "sm" },
                children: "Helena Park",
              },
            },
          ],
        },
        {
          contract: "layout",
          signature: "Main",
          attrs: { class: "app-shell__main" },
        },
      ],
    },
  ],
});

/**
 * A destination that carries its own sub-destinations underneath it: `nav-list`'s `nested` slot
 * (contracts/semantic/nav-list.yaml): a `NavListGroup` inside the SAME `<li>` as the link, not
 * inside the parent group's list, so it stays valid HTML and needs no label of its own. The link
 * above it already says what it is.
 */
const projectLink = (t: Translate, name: string, href: string, current = false): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(current ? { current: true } : {}) },
  slots: {
    children: name,
    nested: {
      contract: "nav-list",
      signature: "NavListGroup",
      slots: {
        children: [
          {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: `${href}/resumen` },
            slots: { children: t("demo.appShell.nested.overview") },
          },
          {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: `${href}/configuracion` },
            slots: { children: t("demo.appShell.nested.settings") },
          },
        ],
      },
    },
  },
});

/**
 * The same shell, hosting the OTHER legal Sidebar shape (contracts/semantic/sidebar.yaml): a list
 * with sub-levels has no row to collapse to a rail of icons, so this one carries a
 * `SidebarResizeHandle` instead of a `SidebarTrigger`. Narrower on drag, never iconified, every
 * label still readable (ellipsis, never a bare icon strip) down to a minimum so low
 * (`minInlineSize`) that dragged all the way in, the panel reads as a bare edge rather than a
 * column with something illegible crammed into it.
 *
 * The nested navigation itself (`projectLink`, above) is a `NavList` with `NavListLink.nested`,
 * not a `TreeView`: a file tree names FILES, which are not navigable destinations, while this
 * shell's rail is exactly that. A list of destinations, some of which have their own
 * sub-destinations. `NavList` is what nav-list.yaml's `useWhen` already says that is.
 */
export const appShellExplorerTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: { contract: "navbar", signature: "NavbarBrand", children: "Northstar" },
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { class: "app-shell" },
      children: [
        {
          contract: "sidebar",
          signature: "Sidebar",
          attrs: { id: "explorer-shell-sidebar" },
          // 10px: a sliver too narrow to hold a readable label or icon, on purpose. A sub-level
          // nav has no icon-only rail to fall back to (contracts/semantic/sidebar.yaml), so its
          // floor is "still a visible edge", not "still legible".
          options: { minInlineSize: "10px" },
          children: [
            {
              contract: "sidebar",
              signature: "SidebarHeader",
              children: { contract: "typography", signature: "Text", children: t("demo.appShell.nested.header") },
            },
            {
              contract: "sidebar",
              signature: "SidebarContent",
              children: {
                contract: "nav-list",
                signature: "NavList",
                attrs: { "aria-label": t("demo.appShell.nested.navigation") },
                children: {
                  contract: "nav-list",
                  signature: "NavListGroup",
                  slots: {
                    label: t("demo.appShell.workspace"),
                    children: [
                      projectLink(t, "Northstar", "#northstar", true),
                      projectLink(t, "Atlas", "#atlas"),
                    ],
                  },
                },
              },
            },
            {
              contract: "sidebar",
              signature: "SidebarResizeHandle",
              options: { label: t("demo.appShell.nested.resize") },
            },
          ],
        },
        {
          contract: "layout",
          signature: "Main",
          attrs: { class: "app-shell__main" },
        },
      ],
    },
  ],
});
