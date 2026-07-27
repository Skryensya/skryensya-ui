/*
 * LOADER, indeterminate work with no measurable completion value.
 *
 * The visual is CSS-only and has no Vanilla enhancer. Accessibility belongs to the authored root:
 * a labelled Loader is a polite status; an unlabelled one is decorative beside another status label.
 *
 * Size, variant, and speed are orthogonal axes: any motion design can be small and slow.
 */
export type LoaderSize = "sm" | "md" | "lg";
export type LoaderVariant = "ring" | "sweep" | "bars" | "dots";
export type LoaderSpeed = "fast" | "normal" | "slow";

export const loaderParts = {
  root: "sk-loader",
} as const;

export type LoaderPart = keyof typeof loaderParts;
export type LoaderPartClass = (typeof loaderParts)[LoaderPart];
