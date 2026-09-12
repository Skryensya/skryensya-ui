type Side = "block-start" | "block-end" | "inline-start" | "inline-end";

type PartExtras = {
  ringPlacement?: "inset" | "offset";
  ringDistance?: number;
  match?: "first" | "all";
};

export type AnnotationPartItem = {
  options: { for: string; side: Side } & PartExtras;
  slots: { children: string };
};

/*
 * One labelled part for an anatomy diagram. The label text IS the class name: that is what the
 * drawing teaches, and translating it would name nothing.
 */
export const namePart = (
  selector: string,
  side: Side,
  extras: PartExtras = {},
): AnnotationPartItem => ({
  options: { for: selector, side, ...extras },
  slots: { children: selector.replace(/^\./, "") },
});
