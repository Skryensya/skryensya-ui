import type { ComponentContract } from "./contract.js";

export type Space = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type BoxSurface = "none" | "sunken" | "surface" | "raised";
export type BoxBorder = "none" | "subtle" | "default";
export type LayoutAlign = "start" | "center" | "end" | "stretch";
export type InlineAlign = "start" | "center" | "end" | "baseline" | "stretch";
export type InlineJustify = "start" | "center" | "end" | "between";
/**
 * Space above an Inline, or `auto` to absorb leftover height in a flex/grid column (a card's
 * action row sitting on the floor while siblings in the same grid grow taller).
 */
export type InlineBlockStart = Space | "auto";
export type GridColumns = 1 | 2 | 3 | 4 | 5;
/**
 * Named spans a direct LayoutGrid child may request with `data-width`.
 *
 * Omitting the attribute keeps the child in the content span. `"rail"` and `"rail-start"` are
 * not content spans. They are supporting columns (a TOC, contextual navigation) beside the
 * grid rather than a section within its flow, but they earn a value in this same attribute
 * rather than a second one. `"rail"` sits after the content; `"rail-start"` sits before it; a
 * grid may carry both at once.
 */
export type LayoutGridWidth = "narrow" | "content" | "breakout" | "full-width" | "rail" | "rail-start";
/** Page-column max measure on a size scale, see patterns/wrapper.css. */
export type WrapperSize = "sm" | "md" | "lg" | "full";

/*
 * Layout is a pattern: these exact primitives recur in page sections, controls and component
 * anatomy. The classes are the shared structure; consumers keep control of the element and its
 * semantics. React simply renders the same contract.
 */
export const layoutParts = {
  box: "sk-box",
  stack: "sk-stack",
  inline: "sk-inline",
  grid: "sk-grid",
  wrapper: "sk-wrapper",
} as const;

/*
 * LayoutGrid belongs only to the flow-layout family. Keeping it out of the shared parts object
 * prevents Box and Wrapper from publishing a part their own contracts do not realize.
 */
export const layoutGridParts = {
  ...layoutParts,
  layoutGrid: "sk-layout-grid",
} as const;

export type LayoutPart = keyof typeof layoutParts;
export type LayoutPartClass = (typeof layoutParts)[LayoutPart];

/*
 * The flow-layout signatures share a family because choosing one answers the same question: how does
 * this group occupy space? Stack, Inline, Grid and LayoutGrid differ in flow. Each is `as`-polymorphic
 * in React, so the author keeps the element semantics: a Stack that is really a `<ul>` is still a
 * Stack.
 */
/*
 * Three stylesheets, so three families. Box and Wrapper keep only their own public parts; the flow
 * family extends those shared constants with LayoutGrid. Code stays co-located because a core module
 * is a source file, while `css` stays per family.
 */
export const boxContract = {
  id: "box",
  css: "@skryensya/core/patterns/box.css",
  parts: layoutParts,

  options: {
    padding: { type: "enum", values: ["none", "xs", "sm", "md", "lg", "xl"], default: "none", attr: "data-padding" },
    surface: { type: "enum", values: ["none", "sunken", "surface", "raised"], default: "none", attr: "data-surface" },
    border: { type: "enum", values: ["none", "subtle", "default"], default: "none", attr: "data-border" },
  },

  signatures: {
    Box: {
      intent: ["padded-region", "card-like-surface", "bordered-region"],
      host: { element: "div" },
      options: ["padding", "surface", "border"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "box", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Box" },
    },
  },
} as const satisfies ComponentContract;

/** The flow layouts. The choice between them is which axis the things sit along. */
export const layoutContract = {
  id: "layout",
  css: "@skryensya/core/patterns/layout.css",
  parts: layoutGridParts,

  options: {
    gap: { type: "enum", values: ["none", "xs", "sm", "md", "lg", "xl"], default: "md", attr: "data-gap" },
    align: { type: "enum", values: ["start", "center", "end", "stretch"], attr: "data-align" },
    inlineAlign: { type: "enum", values: ["start", "center", "end", "baseline", "stretch"], default: "end", attr: "data-align", prop: "align" },
    justify: { type: "enum", values: ["start", "center", "end", "between"], default: "start", attr: "data-justify" },
    equal: { type: "boolean", default: false, attr: "data-equal", trueValue: "" },
    /*
     * Whether items fall to a second line. Written as "true"/"false" and not by presence, because
     * the stylesheet has a rule for `data-wrap="false"` and an absent attribute would be a third
     * state nobody meant.
     */
    wrap: { type: "boolean", default: true, attr: "data-wrap", trueValue: "true", falseValue: "false" },
    /*
     * Space above the row. Named in CSS (`block-start`), never `marginTop`. `auto` is the card-floor
     * case: leftover height in the parent column goes above the row so a set of cards line their
     * actions up. Default `none` so an Inline used as a label-and-value pair does not grow a gap
     * it never asked for.
     */
    blockStart: {
      type: "enum",
      values: ["none", "xs", "sm", "md", "lg", "xl", "auto"],
      default: "none",
      attr: "data-block-start",
    },
    columns: { type: "enum", values: ["1", "2", "3", "4", "5"], default: "1", attr: "data-columns" },
    multicol: { type: "boolean", default: false, attr: "data-multicol", trueValue: "" },
    responsive: { type: "boolean", default: false, attr: "data-responsive", trueValue: "" },
  },

  signatures: {
    Stack: {
      intent: ["vertical-rhythm", "things-one-above-another", "form-fields"],
      host: { element: "div" },
      options: ["gap", "align"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "stack", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Stack" },
    },

    Inline: {
      intent: ["things-side-by-side", "button-row", "label-and-value"],
      host: { element: "div" },
      options: ["gap", "inlineAlign", "justify", "wrap", "equal", "blockStart"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "inline", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Inline" },
    },

    Grid: {
      intent: ["columns", "card-grid", "equal-width-cells"],
      host: { element: "div" },
      options: ["gap", "columns", "multicol", "responsive"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "grid", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Grid" },
    },

    /*
     * A page flow with four named measures. Width is intentionally an attribute of a direct child:
     * a heading, figure or section owns its own semantics and can opt into the span it needs.
     */
    LayoutGrid: {
      intent: ["page-flow", "named-content-measures", "breakout-content", "full-bleed-section", "supporting-rail"],
      host: { element: "div" },
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "layoutGrid", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "LayoutGrid" },
    },

    /*
     * The main landmark is a shell region, not a content component. Its children stay optional so a
     * template can show chrome and an intentionally empty work area before an application decides
     * what belongs there.
     */
    Main: {
      intent: ["main-content", "application-work-area", "app-shell-main"],
      host: { element: "main" },
      options: [],
      slots: { children: { accepts: "node" } },
      template: { element: "main", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Main" },
    },
  },
} as const satisfies ComponentContract;

/*
 * The page column. Its measure comes from a SIZE scale and never from a use-name (`prose`, `shell`),
 * so a header and a body can share one number without either naming the other.
 */
export const wrapperContract = {
  id: "wrapper",
  css: "@skryensya/core/patterns/wrapper.css",
  parts: layoutParts,

  options: {
    wrapperSize: { type: "enum", values: ["sm", "md", "lg", "full"], default: "md", attr: "data-size", prop: "size" },
  },

  signatures: {
    Wrapper: {
      intent: ["page-column", "centred-measure", "content-width"],
      host: { element: "div" },
      options: ["wrapperSize"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "wrapper", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Wrapper" },
    },
  },
} as const satisfies ComponentContract;
