import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * A navigation drawer, `Vaul.drawer`, which is what this page has always said it is: "un drawer ES
 * un Vaul".
 *
 * The page's own `demo-drawer__*` classes come along, and that works because every one of them lands
 * on an element that is a signature HOST. A tree can hand a class to a host; it cannot reach inside
 * another signature's template. That is exactly the line `card` falls on the wrong side of, and it
 * is worth seeing the two next to each other: the same kind of decoration, convertible here and not
 * there, decided by WHERE it attaches rather than by what it is.
 */
const link = (t: Translate, key: string, href: string, icon: string, extra?: UsageTree | string): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(key === "summary" ? { current: true } : {}) },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: icon } },
    children: t(`demo.drawer.${key}` as never),
    ...(extra ? { trailing: extra } : {}),
  },
});

export const drawerTree = (t: Translate): UsageTree => ({
  contract: "vaul",
  signature: "Vaul.drawer",
  options: { edge: "inline-start", open: true, label: t("demo.drawer.label") },
  attrs: { id: "demo-drawer" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm", inlineAlign: "center" },
      attrs: { class: "demo-drawer__header" },
      children: [
        {
          contract: "typography",
          signature: "Text",
          attrs: { class: "demo-drawer__brand" },
          children: t("demo.drawer.brand"),
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost", iconOnly: true },
          attrs: { "aria-label": t("demo.drawer.close"), "data-sk-vaul-close": "" },
          children: { contract: "icon", signature: "Icon", options: { name: "close" } },
        },
      ],
    },
    {
      contract: "nav-list",
      signature: "NavList",
      attrs: { class: "demo-drawer__nav", "aria-label": t("demo.drawer.main") },
      children: [
        {
          contract: "nav-list",
          signature: "NavListGroup",
          slots: {
            label: t("demo.drawer.work"),
            children: [
              link(t, "summary", "#resumen", "info"),
              link(t, "agenda", "#agenda", "calendar", "3"),
              link(t, "files", "#archivos", "download"),
            ],
          },
        },
        {
          contract: "nav-list",
          signature: "NavListGroup",
          slots: {
            label: t("demo.drawer.account"),
            children: [
              link(t, "team", "#equipo", "user"),
              link(t, "settings", "#ajustes", "settings"),
            ],
          },
        },
      ],
    },
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm", inlineAlign: "center" },
      attrs: { class: "demo-drawer__footer" },
      children: [
        {
          contract: "avatar",
          signature: "Avatar.initials",
          options: { size: "sm", name: t("demo.drawer.userName") },
          children: "AK",
        },
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "none" },
          attrs: { class: "demo-drawer__user" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              attrs: { class: "demo-drawer__user-name" },
              children: t("demo.drawer.userName"),
            },
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              attrs: { class: "demo-drawer__user-meta" },
              children: "ada@estudio.cl",
            },
          ],
        },
      ],
    },
  ],
});

/** Opening is a call, never markup: the same escape hatch the dialog and the palette use. */
export { default as drawerScript } from "./scripts/drawer-open.ts?raw";
