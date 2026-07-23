export type Space = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type BoxSurface = "none" | "sunken" | "surface" | "raised";
export type BoxBorder = "none" | "subtle" | "default";
export type LayoutAlign = "start" | "center" | "end" | "stretch";
export type InlineAlign = "start" | "center" | "end" | "baseline";
export type GridColumns = 1 | 2 | 3 | 4;
/** Page-column max measure by use, see patterns/wrapper.css. */
export type WrapperSize = "prose" | "content" | "shell" | "full";

/*
 * Layout is a pattern: these exact primitives recur in page sections, controls and component
 * anatomy. The classes are the shared structure; consumers keep control of the element and its
 * semantics. React simply renders the same contract.
 */
export const layoutParts = {
  box: "ds-box",
  stack: "ds-stack",
  inline: "ds-inline",
  grid: "ds-grid",
  wrapper: "ds-wrapper",
} as const;

export type LayoutPart = keyof typeof layoutParts;
export type LayoutPartClass = (typeof layoutParts)[LayoutPart];
