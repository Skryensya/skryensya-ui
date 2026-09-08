import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Button's seven demos, in the order the page teaches them: the variants, the three sizes, an icon
 * beside a label, icon-only at md and at sm, the same component as a link, and TileButton.
 *
 * Every one of these is `Button.action` except the link, which is `Button.navigation`, and that IS
 * the lesson the page is teaching: an `href` is what changes the host element from `button` to `a`,
 * so the tree names the other signature rather than adding an option to this one.
 */

/**
 * THE WHOLE MATRIX, labelled, because a grid of unlabelled buttons shows that twelve exist without
 * saying which is which. Row headers are the emphasis, column headers the tone, and every cell is
 * the same word so the only thing varying between them is the thing being taught.
 *
 * `Grid` with four columns: one for the row label, three for the tones. The header row leads with an
 * empty cell to sit the tone labels over their own columns.
 *
 * THE CONTENT IS DELIBERATELY MEANINGLESS. Every cell says "Acción" and the icon matrix says `more`,
 * because the tone is the thing under test and the word must not argue with it: "Borrar" on the
 * neutral and accent cells claimed the opposite of what those cells show, and a `delete` glyph did
 * it more loudly still. The destructive pair below is where a real destructive label belongs.
 */
const EMPHASES = ["solid", "soft", "ghost", "translucent"] as const;
const TONES = ["neutral", "accent", "danger"] as const;

/** A column or row header. Caption-sized and secondary: the labels are scaffolding, not content. */
const axisLabel = (text: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { size: "caption", tone: "secondary", weight: "label" },
  children: text,
});

export const buttonMatrixTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "4", gap: "md" },
  attrs: { style: "align-items: center; justify-items: start;" },
  children: [
    // The corner: nothing to label, and an empty cell is what puts the tones over their columns.
    { contract: "typography", signature: "Text", options: { size: "caption" }, children: "" },
    ...TONES.map((tone) => axisLabel(tone)),
    ...EMPHASES.flatMap((variant) => [
      axisLabel(variant),
      ...TONES.map((tone) => ({
        contract: "button",
        signature: "Button.action",
        /*
         * The defaults are omitted rather than restated, so the snippet under this preview reads
         * like something an author would actually write: the solid/neutral cell is a bare
         * `<Button>`, which is the honest way to show that it IS the default.
         */
        options: {
          ...(variant === "solid" ? {} : { variant }),
          ...(tone === "neutral" ? {} : { tone }),
        },
        children: t("demo.button.action"),
      })),
    ]),
  ],
});

/**
 * The same twelve at `sm` and icon-only, which is where a quiet tone is actually used: an action row
 * has no room for a full-size button, and it is the size at which a ghost's ink is the only thing
 * carrying the meaning.
 */
export const buttonMatrixIconTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "4", gap: "md" },
  attrs: { style: "align-items: center; justify-items: start;" },
  children: [
    { contract: "typography", signature: "Text", options: { size: "caption" }, children: "" },
    ...TONES.map((tone) => axisLabel(tone)),
    ...EMPHASES.flatMap((variant) => [
      axisLabel(variant),
      ...TONES.map((tone) => ({
        contract: "button",
        signature: "Button.action",
        options: {
          size: "sm",
          iconOnly: true,
          ...(variant === "solid" ? {} : { variant }),
          ...(tone === "neutral" ? {} : { tone }),
        },
        attrs: { "aria-label": t("demo.button.moreActions") },
        children: { contract: "icon", signature: "Icon", options: { name: "more" } },
      })),
    ]),
  ],
});

/**
 * A TOGGLE, off and on, in the emphases toggles actually use. `pressed` is the option; the paint is
 * Button's. Deliberately shown as a pair per emphasis, because "on" only means anything next to the
 * "off" it is not.
 */
export const buttonPressedTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: (["ghost", "soft", "solid"] as const).map((variant) => ({
    contract: "layout",
    signature: "Inline",
    options: { gap: "sm", inlineAlign: "center", wrap: false },
    children: [false, true].map((on) => ({
      contract: "button",
      signature: "Button.action",
      options: {
        ...(variant === "solid" ? {} : { variant }),
        tone: "accent",
        size: "sm",
        pressed: on,
      },
      children: t("demo.button.bold"),
    })),
  })),
});

/**
 * The pair the split exists for, side by side: the quiet destructive trigger in an action row, and
 * the loud destructive confirm it opens. Same tone, different emphasis, and that difference is the
 * whole message: one of them is safe to sit next to Reply, the other is not.
 */
export const buttonDestructivePairTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "lg", inlineAlign: "center" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "ghost", tone: "danger", size: "sm" },
      children: t("demo.button.delete"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "danger" },
      children: t("demo.button.confirmDelete"),
    },
  ],
});

/**
 * xs · sm · md · lg, on a labelled button and on an icon-only one.
 *
 * `xs` leads because it is the floor of the scale: it paints at 24px, WCAG 2.2 SC 2.5.8's target
 * minimum, and the hit area underneath is still 44px like every other size.
 */
export const buttonSizesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "xs", tone: "accent" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "sm", tone: "accent" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "lg", tone: "accent" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "xs", iconOnly: true, variant: "ghost" },
      attrs: { "aria-label": t("demo.button.moreActions") },
      children: { contract: "icon", signature: "Icon", options: { name: "more" } },
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

/*
 * No hook for icon + text: the button is already an inline-flex row with a gap. The icon is
 * DECORATIVE (the label names the action), so it carries no `label` option.
 *
 * Two buttons, not one, because "icon beside a label" has two valid orders and they are not the
 * same lesson: leading reads as "here is the kind of action" (download, before you know what gets
 * downloaded), trailing reads as "here is where this goes" (continue, into whatever is next). Both
 * are just `children` order: the tree's array order IS the DOM order IS the visual order in an
 * inline-flex row, so there is no second option to teach, only the one array flipped.
 */
export const buttonIconTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      children: [
        { contract: "icon", signature: "Icon", options: { name: "download" } },
        t("demo.button.download"),
      ],
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      children: [
        t("demo.button.continue"),
        { contract: "icon", signature: "Icon", options: { name: "arrow-right" } },
      ],
    },
  ],
});

/*
 * Icon-only: with no text to carry it, the accessible name MUST be authored. It goes in `attrs`,
 * not `options`: `aria-label` is passed to the host untouched and no contract maps it.
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
    /* `subtle`'s real use: CopyButton (components/copy-button.css) composes exactly this shape
       a fill so the button reads over a busy background, without the base variant's harder
       border pulling focus from the icon it is protecting. */
    {
      contract: "button",
      signature: "Button.action",
      options: { iconOnly: true, variant: "soft" },
      attrs: { "aria-label": t("demo.button.copy") },
      children: { contract: "icon", signature: "Icon", options: { name: "copy" } },
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
      options: { size: "sm", iconOnly: true, tone: "accent" },
      attrs: { "aria-label": t("demo.button.add") },
      children: { contract: "icon", signature: "Icon", options: { name: "add" } },
    },
  ],
});

/*
 * The link form. `Button.navigation` rather than an option on `Button.action`: the host element
 * differs (`a`, not `button`), and the contract expresses that as `host.when.href = present`. Every
 * other shape follows it: size, icon, iconOnly.
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
      options: { tone: "accent", href },
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

/**
 * The four buttons on the "first component" walkthrough: default, primary, danger, and sm.
 * Same signatures as the Button page; shared so the teaching page cannot drift from the reference.
 */
export const firstComponentButtonsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    { contract: "button", signature: "Button.action", children: t("demo.button.save") },
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      children: t("demo.button.save"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "danger" },
      children: t("demo.button.delete"),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { size: "sm" },
      children: t("demo.button.small"),
    },
  ],
});

export const tileButtonTree = (_t: Translate): UsageTree => ({
  contract: "tile",
  signature: "TileButton",
  children: {
    contract: "tile",
    signature: "TileContent",
    slots: {
      title: "Run deployment",
      description: "Start the production deployment now.",
    },
  },
});
