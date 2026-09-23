import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";
import { genericIcon } from "../anatomy-subject";

/*
 * THE ENTRIES OF EVERY TOC DEMO. A table of contents IS its list. The composition around it is
 * three lines, so the two are kept apart: `toc.ts` says which Toc is being shown, this says what is
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

/*
 * THE ANATOMY DIAGRAM'S OWN ROWS, and they are separate from `tocIconItems` on purpose.
 *
 * The live demo above wants four DIFFERENT glyphs, because what it is showing is that an entry can
 * carry an icon of its own choosing. The diagram wants four identical ones, because what it is
 * showing is `sk-toc__icon`: a row of distinct icons invites the reader to compare them, and the
 * one thing this drawing is not about is which icon each row picked.
 *
 * Three rows, not four: the labels for `__list`, `__item`, `__link`, `__icon` and `__label` all
 * arrive in the same two gutters, and a fourth row buys the diagram nothing it does not already say.
 */
export const tocAnatomyItems = (t: Translate): readonly ItemInput[] => [
  {
    options: { href: "#summary", current: true },
    slots: { children: t("anatomy.item1"), icon: genericIcon("sm") },
  },
  {
    options: { href: "#installation" },
    slots: { children: t("anatomy.item2"), icon: genericIcon("sm") },
  },
  {
    options: { href: "#reference" },
    slots: { children: t("anatomy.item3"), icon: genericIcon("sm") },
  },
];
