import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Layout demos shared by both locales, including the masonry-style multicolumn Grid. */

/** A surface with a heading, a line of prose and an action: the three things Box has to hold up. */
export const boxTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "lg" },
  children: [
    { contract: "typography", signature: "Heading", children: t("demo.box.title") },
    { contract: "typography", signature: "Text", children: t("demo.box.body") },
    { contract: "button", signature: "Button.action", children: t("demo.box.action") },
  ],
});

/** A short status summary with a locale-owned destination. */
export const stackTree = (t: Translate, href: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md", align: "start" },
  attrs: { "aria-labelledby": "stack-demo-title" },
  children: [
    {
      contract: "typography",
      signature: "Heading",
      options: { headingSize: "h2" },
      attrs: { id: "stack-demo-title" },
      children: t("demo.stack.title"),
    },
    { contract: "typography", signature: "Text", children: t("demo.stack.body") },
    {
      contract: "typography",
      signature: "Link",
      options: { href },
      children: t("demo.stack.action"),
    },
  ],
});

/** A project summary and its actions, composed from the three flow primitives. */
export const inlineTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "lg" },
  attrs: { "aria-labelledby": "project-title" },
  children: {
    contract: "layout",
    signature: "Inline",
    options: { gap: "md", inlineAlign: "center", justify: "between" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "none" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h4" },
            attrs: { id: "project-title" },
            children: t("demo.inline.title"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "sm", tone: "secondary" },
            children: t("demo.inline.status"),
          },
        ],
      },
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", wrap: false },
        children: [
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost" },
            children: t("demo.inline.preview"),
          },
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "accent" },
            children: t("demo.inline.publish"),
          },
        ],
      },
    ],
  },
});

/**
 * A raised summary beside a three-column grid: the layout + typography vocabulary on one stage.
 * Locale-owned destination comes from the page.
 */
export const primitivesTree = (t: Translate, href: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "lg" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "raised", border: "subtle", padding: "lg" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "sm" },
            children: t("demo.primitives.title"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { tone: "secondary" },
            children: t("demo.primitives.body"),
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "baseline" },
            children: [
              {
                contract: "typography",
                signature: "Link",
                options: { href },
                children: t("demo.primitives.action"),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "caption" },
                children: t("demo.primitives.updated"),
              },
            ],
          },
        ],
      },
    },
    {
      contract: "layout",
      signature: "Grid",
      options: { columns: "3", gap: "md" },
      children: [
        {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", border: "subtle", padding: "md" },
          children: t("demo.primitives.cell.first"),
        },
        {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", border: "subtle", padding: "md" },
          children: t("demo.primitives.cell.second"),
        },
        {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", border: "subtle", padding: "md" },
          children: t("demo.primitives.cell.third"),
        },
      ],
    },
  ],
});

/** Three equal columns of project cards. Product names stay written. */
export const gridTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
  attrs: { "aria-label": t("demo.grid.label") },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: "Atlas",
    },
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: "Brisa",
    },
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: "Cauce",
    },
  ],
});

/**
 * One card per named width, in the same order the page's own bullet list explains them: narrow,
 * content (the default, so its own child carries no `data-width`), breakout, full-width. Real
 * children throughout. Box and Text, the same contracts every other demo on the site composes
 * with, so what this teaches is exactly what a reader can compose themselves, unlike a page-local
 * mockup with no contract behind it. No heading: the preview's own label already names it, and the
 * page's prose right below carries the same words a heading here would only repeat.
 */
export const layoutGridTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "LayoutGrid",
  children: [
    {
      contract: "box",
      signature: "Box",
      attrs: { "data-width": "narrow" },
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: t("demo.layoutGrid.narrow"),
    },
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: t("demo.layoutGrid.content"),
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { "data-width": "breakout" },
      options: { surface: "raised", border: "subtle", padding: "lg" },
      children: t("demo.layoutGrid.breakout"),
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { "data-width": "full-width" },
      /* No `padding` (defaults to "none"): a full-bleed band's BACKGROUND has to reach the true
         edge, and the box's own inline padding was fighting the nested content-track inset that
         already keeps the LABEL readable. The two together read as a band with a stray extra
         margin on top of its normal one. Vertical breathing room instead comes from the scoped
         `padding-block` rule in the preview's own CSS (LayoutGridPage.astro), which only touches
         this one box rather than every Box on the page.
         `surface: "raised"` still marks it correctly (`data-surface="raised"`), but that token
         alone reads as flat white next to the page's own canvas in light mode. The same
         near-invisible pairing the stack demo hit earlier. The preview's CSS repaints it with an
         actually visible tint; the attribute stays honest about what the box IS regardless. */
      options: { surface: "raised" },
      /* A `full-width` child becomes its OWN nested `sk-layout-grid` (layout.css), so ITS children
         need the same default placement rule any other layout-grid content gets, which only ever
         matches real elements, not a bare text node. A plain string here left the label with no
         `content-start`/`content-end` assignment at all, so it fell back to grid auto-placement's
         narrowest available track instead of the width the box is meant to demonstrate. */
      children: {
        contract: "typography",
        signature: "Text",
        children: t("demo.layoutGrid.fullWidth"),
      },
    },
  ],
});

/**
 * Rail compositions, kept to the SAME vocabulary as the width-levels demo above: plain Box
 * children, one unlabeled (content measure) and one or two with \`data-width="rail"\` /
 * \`"rail-start"\`. \`sk-layout-grid\`'s own PUBLISHED rail capability
 * (\`packages/core/css/patterns/layout.css\`), not page-local CSS. No real \`/componentes/toc\`
 * composition here: this section teaches the GRID's rail mechanism, not Toc's own anatomy.
 *
 * Three trees, one per placement the pattern actually publishes: after the content (\`rail\`),
 * before it (\`rail-start\`), and both at once in the same grid.
 */
function layoutGridRailBox(
  t: Translate,
  role: "content" | "rail" | "rail-start",
): UsageTree {
  const copy = {
    content: t("demo.layoutGridRail.content"),
    rail: t("demo.layoutGridRail.rail"),
    "rail-start": t("demo.layoutGridRail.railStart"),
  } as const;
  return {
    contract: "box",
    signature: "Box",
    attrs: role === "content" ? { "data-role": "main" } : { "data-width": role, "data-role": role },
    options: { padding: "lg", surface: "surface", border: "subtle" },
    children: copy[role],
  };
}

export const layoutGridTocTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "LayoutGrid",
  children: [layoutGridRailBox(t, "content"), layoutGridRailBox(t, "rail")],
});

export const layoutGridRailStartTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "LayoutGrid",
  children: [layoutGridRailBox(t, "rail-start"), layoutGridRailBox(t, "content")],
});

export const layoutGridRailsBothTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "LayoutGrid",
  children: [
    layoutGridRailBox(t, "rail-start"),
    layoutGridRailBox(t, "content"),
    layoutGridRailBox(t, "rail"),
  ],
});

export const gridMulticolTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", multicol: true },
  attrs: { "aria-label": t("demo.grid.label") },
  children: ["Atlas", "Brisa", "Cauce", "Delta", "Estuario", "Faro", "Greda", "Hiedra"].map(
    (name, index) => ({
      contract: "box",
      signature: "Box",
      options: {
        surface: index % 2 === 0 ? "raised" : "surface",
        border: "subtle",
        padding: index % 3 === 0 ? "lg" : "md",
      },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "typography",
            signature: "Text",
            options: { weight: "label" },
            children: name,
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "sm", tone: "secondary" },
            children: `${index + 1}`,
          },
        ],
      },
    }),
  ),
});

