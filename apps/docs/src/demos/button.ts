import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Button's seven demos, in the order the page teaches them: the variants, the three sizes, an icon
 * beside a label, icon-only at md and at sm, the same component as a link, and TileButton.
 *
 * Every one of these is `Button.action` except the link, which is `Button.navigation` — and that IS
 * the lesson the page is teaching: an `href` is what changes the host element from `button` to `a`,
 * so the tree names the other signature rather than adding an option to this one.
 */

/** The three variants side by side. `neutral` is the default, so the middle one declares nothing. */
export const buttonVariantsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "primary" },
      children: t("demo.button.save"),
    },
    { contract: "button", signature: "Button.action", children: t("demo.button.cancel") },
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "danger" },
      children: t("demo.button.delete"),
    },
  ],
});

/** sm · md · lg, on a labelled button and on an icon-only one. */
export const buttonSizesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "sm", variant: "primary" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "primary" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "lg", variant: "primary" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "sm", iconOnly: true, variant: "ghost" },
      attrs: { "aria-label": t("demo.button.moreActions") },
      children: { contract: "icon", signature: "Icon", options: { name: "more" } },
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { iconOnly: true, variant: "ghost" },
      attrs: { "aria-label": t("demo.button.moreActions") },
      children: { contract: "icon", signature: "Icon", options: { name: "more" } },
    },
  ],
});

/* No hook for icon + text: the button is already an inline-flex row with a gap. The icon is
 * DECORATIVE — the label names the action — so it carries no `label` option. */
export const buttonIconTree = (t: Translate): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { variant: "primary" },
  children: [
    { contract: "icon", signature: "Icon", options: { name: "download" } },
    t("demo.button.download"),
  ],
});

/*
 * Icon-only: with no text to carry it, the accessible name MUST be authored. It goes in `attrs`,
 * not `options` — `aria-label` is passed to the host untouched and no contract maps it.
 */
export const buttonIconOnlyTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { iconOnly: true },
      attrs: { "aria-label": t("demo.button.settings") },
      children: { contract: "icon", signature: "Icon", options: { name: "settings" } },
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { iconOnly: true, variant: "ghost" },
      attrs: { "aria-label": t("demo.button.edit") },
      children: { contract: "icon", signature: "Icon", options: { name: "edit" } },
    },
  ],
});

/** The same shape at sm: the face paints at control-sm, the ::after keeps the 44px hit. */
export const buttonIconOnlySmTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "sm", iconOnly: true },
      attrs: { "aria-label": t("demo.button.settings") },
      children: { contract: "icon", signature: "Icon", options: { name: "settings" } },
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "sm", iconOnly: true, variant: "ghost" },
      attrs: { "aria-label": t("demo.button.edit") },
      children: { contract: "icon", signature: "Icon", options: { name: "edit" } },
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "sm", iconOnly: true, variant: "primary" },
      attrs: { "aria-label": t("demo.button.add") },
      children: { contract: "icon", signature: "Icon", options: { name: "add" } },
    },
  ],
});

/*
 * The link form. `Button.navigation` rather than an option on `Button.action`: the host element
 * differs (`a`, not `button`), and the contract expresses that as `host.when.href = present`. Every
 * other shape follows it — size, icon, iconOnly.
 */
export const buttonAsLinkTree = (t: Translate, href: string): UsageTree => ({
  // `href` comes from the page: the target is a docs route, and a docs route is locale-dependent
  // (`/primer-componente` vs `/en/first-component`). Only the page knows which locale it is.
  contract: "layout",
  signature: "Inline",
  children: [
    {
      contract: "button",
      signature: "Button.navigation",
      options: { variant: "primary", href },
      children: t("demo.button.goFirstComponent"),
    },
    {
      contract: "button",
      signature: "Button.navigation",
      options: { size: "sm", href },
      children: t("demo.button.small"),
    },
    {
      contract: "button",
      signature: "Button.navigation",
      options: { size: "lg", href },
      children: t("demo.button.large"),
    },
    {
      contract: "button",
      signature: "Button.navigation",
      options: { href },
      children: [
        { contract: "icon", signature: "Icon", options: { name: "download" } },
        t("demo.button.withIcon"),
      ],
    },
    {
      contract: "button",
      signature: "Button.navigation",
      options: { iconOnly: true, variant: "ghost", href },
      attrs: { "aria-label": t("demo.button.goFirstComponent") },
      children: { contract: "icon", signature: "Icon", options: { name: "arrow-right" } },
    },
  ],
});

/*
 * TileButton is NOT here, and the reason is a contract gap rather than an oversight.
 *
 * The demo is a card whose face is a title over a description, which is `sk-tile__content`,
 * `sk-tile__title` and `sk-tile__description`. The tile contract DECLARES all three as parts — and no
 * signature emits them: `TileButton`'s template is a host with a `children` slot, and there is no
 * `TileContent` / `TileTitle` / `TileDescription` to nest inside it. So the composition is
 * inexpressible, and the page keeps its authored markup until the contract grows those signatures.
 *
 * Worth stating because it is the trap in judging what converts: a class being a declared PART is
 * not the same as being reachable. Twenty-nine parts across the catalogue are in this position.
 */
