import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * THE ENTRIES OF EVERY TOC DEMO. A table of contents IS its list — the composition around it is
 * three lines — so the two are kept apart: `toc.ts` says which Toc is being shown, this says what is
 * in it.
 */

/** A flat list, one entry marked as the section the reader is in. */
export const tocItems = (t: Translate): readonly ItemInput[] => [
  { options: { href: "#summary", current: true }, slots: { children: t("demo.toc.summary") } },
  { options: { href: "#installation" }, slots: { children: t("demo.toc.installation") } },
  { options: { href: "#reference" }, slots: { children: t("demo.toc.reference") } },
];

/** Depth as an option on the entry (`level: "h3"`), not as nesting: the list stays flat. */
export const tocNestedItems = (t: Translate): readonly ItemInput[] => [
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
];

/** The same list with an `icon` slot per entry, which is a composition standing inside data. */
export const tocIconItems = (t: Translate): readonly ItemInput[] => [
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
];
