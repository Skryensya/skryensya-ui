/*
 * MEDIA GRADIENT, wash sized to the caption it protects.
 *
 * Parts are the authored anatomy the CSS contracts against. The wash is decorative
 * (`aria-hidden`) and lives *inside* the caption so its box is the type's box.
 */
export const mediaGradientParts = {
  root: "sk-media-gradient",
  caption: "sk-media-caption",
} as const;

export type MediaGradientPart = keyof typeof mediaGradientParts;
export type MediaGradientPartClass = (typeof mediaGradientParts)[MediaGradientPart];

/** Which edge of the media the caption (and its wash) sits on. */
export type MediaGradientEdge = "top" | "bottom" | "start" | "end";

/** How opaque / tinted the wash is behind the type — not how much of the image it covers. */
export type MediaGradientStrength = "sm" | "md" | "lg";
