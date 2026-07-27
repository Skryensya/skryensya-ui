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
