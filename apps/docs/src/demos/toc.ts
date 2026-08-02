import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Plain, nested (h2/h3) and icon-bearing Toc compositions shared by both locales. */

export const tocPlainTree = (t: Translate): UsageTree => ({
  contract: "toc",
  signature: "Toc",
  options: { title: t("demo.toc.title") },
  slots: {
    items: [
      { options: { href: "#summary", current: true }, slots: { children: t("demo.toc.summary") } },
      { options: { href: "#installation" }, slots: { children: t("demo.toc.installation") } },
      { options: { href: "#reference" }, slots: { children: t("demo.toc.reference") } },
    ],
  },
});

export const tocNestedTree = (t: Translate): UsageTree => ({
  contract: "toc",
  signature: "Toc",
  options: { title: t("demo.toc.title") },
  slots: {
    items: [
      { options: { href: "#installation" }, slots: { children: t("demo.toc.installation") } },
      {
        options: { href: "#configuration-env", level: "h3", current: true },
        slots: { children: t("demo.toc.configuration.env") },
      },
      {
        options: { href: "#configuration-flags", level: "h3" },
        slots: { children: t("demo.toc.configuration.flags") },
      },
      { options: { href: "#reference" }, slots: { children: t("demo.toc.reference") } },
    ],
  },
});

export const tocIconsTree = (t: Translate): UsageTree => ({
  contract: "toc",
  signature: "Toc",
  options: { title: t("demo.toc.title") },
  slots: {
    items: [
      {
        options: { href: "#summary", current: true },
        slots: {
          children: t("demo.toc.summary"),
          icon: { contract: "icon", signature: "Icon", options: { name: "menu", size: "sm" } },
        },
      },
      {
        options: { href: "#installation" },
        slots: {
          children: t("demo.toc.installation"),
          icon: { contract: "icon", signature: "Icon", options: { name: "settings", size: "sm" } },
        },
      },
      {
        options: { href: "#configuration-env", level: "h3" },
        slots: {
          children: t("demo.toc.configuration.env"),
          icon: { contract: "icon", signature: "Icon", options: { name: "check", size: "sm" } },
        },
      },
      {
        options: { href: "#reference" },
        slots: {
          children: t("demo.toc.reference"),
          icon: { contract: "icon", signature: "Icon", options: { name: "info", size: "sm" } },
        },
      },
    ],
  },
});
