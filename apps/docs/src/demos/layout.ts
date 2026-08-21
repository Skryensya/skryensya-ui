import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { tocItems } from "./data/toc";

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
            options: { variant: "primary" },
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
 * children throughout — Box and Text, the same contracts every other demo on the site composes
 * with — so what this teaches is exactly what a reader can compose themselves, unlike a page-local
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
         already keeps the LABEL readable — the two together read as a band with a stray extra
         margin on top of its normal one. Vertical breathing room instead comes from the scoped
         `padding-block` rule in the preview's own CSS (LayoutGridPage.astro), which only touches
         this one box rather than every Box on the page.
         `surface: "raised"` still marks it correctly (`data-surface="raised"`), but that token
         alone reads as flat white next to the page's own canvas in light mode — the same
         near-invisible pairing the stack demo hit earlier. The preview's CSS repaints it with an
         actually visible tint; the attribute stays honest about what the box IS regardless. */
      options: { surface: "raised" },
      /* A `full-width` child becomes its OWN nested `sk-layout-grid` (layout.css), so ITS children
         need the same default placement rule any other layout-grid content gets — which only ever
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
 * The rail composition with the ACTUAL rail — \`/componentes/toc\`'s own contract (\`sk-toc\`) — placed
 * with \`sk-layout-grid\`'s own PUBLISHED rail capability (\`data-width="rail"\`,
 * \`packages/core/css/patterns/layout.css\`), not page-local CSS: the same published mechanism the real
 * shell itself now uses (site.css's \`.docs-document-pair\`, see the "En esta página" rail beside THIS
 * page). \`tocItems\` is the same entry list \`/componentes/toc\`'s own demos already validate, reused
 * rather than invented here. Not Sidebar, which is site NAVIGATION (a different rail, for a different
 * job) and not what this section is about.
 *
 * No demo-local CSS at all: the pattern's own defaults (\`--sk-layout-rail-inline-size: 14rem\`,
 * \`--sk-layout-rail-row-span: 1\`, gated behind \`(min-width: 72rem)\`) are enough for a single-row
 * content box. At whatever real browser width shows the rail beside a real \`/componentes/*\` page's
 * content, the same width shows it here too — this preview sits inside the identical content-column
 * measure, so it is genuinely representative rather than staged to always look a certain way.
 *
 * \`data-sk-toc-rail\` stays alongside \`data-width="rail"\`: it's Toc's OWN opt-in into its sticky/width
 * CSS and its enhancer's auto-open behavior (toc.css, packages/vanilla), independent of where the grid
 * places it — the two attributes answer different questions and a real rail carries both.
 */
export const layoutGridTocTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "LayoutGrid",
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { padding: "md" },
      children: t("demo.layoutGridRail.content"),
    },
    {
      contract: "toc",
      signature: "Toc",
      attrs: { "data-sk-toc-rail": "", "data-width": "rail" },
      options: { title: t("demo.toc.title") },
      slots: { items: tocItems(t) },
    },
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

