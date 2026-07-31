import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/** A collapsible shell with NavList as its guest and enough adjacent content to make the rail legible. */
export const sidebarTree = (
  t: Translate,
  hrefs: { home: string; reports: string },
): UsageTree => ({
  contract: "box",
  signature: "Box",
  attrs: { class: "app-shell" },
  children: [
    {
      contract: "sidebar",
      signature: "Sidebar",
      options: { defaultCollapsed: false },
      attrs: { id: "app-sidebar" },
      children: [
        {
          contract: "sidebar",
          signature: "SidebarHeader",
          children: {
            contract: "sidebar",
            signature: "SidebarTrigger",
            options: { label: t("demo.sidebar.collapse") },
            slots: {
              icon: { contract: "icon", signature: "Icon", options: { name: "menu" } },
            },
          },
        },
        {
          contract: "sidebar",
          signature: "SidebarContent",
          children: {
            contract: "nav-list",
            signature: "NavList",
            attrs: { "aria-label": t("demo.sidebar.nav") },
            children: {
              contract: "nav-list",
              signature: "NavListGroup",
              slots: {
                label: t("demo.sidebar.workspace"),
                children: [
                  {
                    contract: "nav-list",
                    signature: "NavListLink",
                    options: { current: true, href: hrefs.home },
                    slots: {
                      icon: { contract: "icon", signature: "Icon", options: { name: "info" } },
                      children: t("demo.sidebar.home"),
                    },
                  },
                  {
                    contract: "nav-list",
                    signature: "NavListLink",
                    options: { href: hrefs.reports },
                    slots: {
                      icon: { contract: "icon", signature: "Icon", options: { name: "calendar" } },
                      trailing: "12",
                      children: t("demo.sidebar.reports"),
                    },
                  },
                ],
              },
            },
          },
        },
        { contract: "sidebar", signature: "SidebarSeparator" },
        { contract: "sidebar", signature: "SidebarFooter", children: "v0.3.0" },
      ],
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { class: "app-shell__main" },
      children: {
        contract: "typography",
        signature: "Text",
        children: t("demo.sidebar.content"),
      },
    },
  ],
});
