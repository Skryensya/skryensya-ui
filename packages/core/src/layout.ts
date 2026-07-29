import type { ComponentContract } from "./contract.js";

export type Space = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type BoxSurface = "none" | "sunken" | "surface" | "raised";
export type BoxBorder = "none" | "subtle" | "default";
export type LayoutAlign = "start" | "center" | "end" | "stretch";
export type InlineAlign = "start" | "center" | "end" | "baseline";
export type InlineJustify = "start" | "center" | "end" | "between";
export type GridColumns = 1 | 2 | 3 | 4;
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

export type LayoutPart = keyof typeof layoutParts;
export type LayoutPartClass = (typeof layoutParts)[LayoutPart];

/*
 * The five ways of arranging things, as five signatures of one family.
 *
 * They are a family and not five because the choice between them is one decision — how does this
 * group of things sit together — and an agent picking a layout should see all five side by side.
 * Every one of them is `as`-polymorphic in React; the contract fixes a sensible host and leaves the
 * element to the author, because a Stack that is really a `<ul>` is still a Stack.
 */
/*
 * Three stylesheets, so three families — the same lesson checkbox and switch taught: a core module is
 * a source file, and `css` is per family. Box, the flow layouts and Wrapper share a parts object and
 * nothing else.
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
  parts: layoutParts,

  options: {
    gap: { type: "enum", values: ["none", "xs", "sm", "md", "lg", "xl"], default: "md", attr: "data-gap" },
    align: { type: "enum", values: ["start", "center", "end", "stretch"], attr: "data-align" },
    inlineAlign: { type: "enum", values: ["start", "center", "end", "baseline"], default: "center", attr: "data-align", prop: "align" },
    justify: { type: "enum", values: ["start", "center", "end", "between"], default: "start", attr: "data-justify" },
    /*
     * Whether items fall to a second line. Written as "true"/"false" and not by presence, because
     * the stylesheet has a rule for `data-wrap="false"` and an absent attribute would be a third
     * state nobody meant.
     */
    wrap: { type: "boolean", default: true, attr: "data-wrap", trueValue: "true", falseValue: "false" },
    columns: { type: "enum", values: ["1", "2", "3", "4"], default: "1", attr: "data-columns" },
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
      options: ["gap", "inlineAlign", "justify", "wrap"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "inline", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Inline" },
    },

    Grid: {
      intent: ["columns", "card-grid", "equal-width-cells"],
      host: { element: "div" },
      options: ["gap", "columns"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "grid", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Grid" },
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
