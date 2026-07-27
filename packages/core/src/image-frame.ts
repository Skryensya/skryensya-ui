/*
 * IMAGE FRAME, clip + aspect + object-fit for authored media.
 *
 * Parts are the authored anatomy the CSS contracts against. Behaviour is the platform's
 * (`object-fit`, `object-position`, `aspect-ratio`); this file only names the public surface.
 */
export const imageFrameParts = {
  root: "sk-image-frame",
  media: "sk-image-frame__media",
} as const;

export type ImageFramePart = keyof typeof imageFrameParts;
export type ImageFramePartClass = (typeof imageFrameParts)[ImageFramePart];

/** Fixed ratios for the frame box. `auto` keeps the media's intrinsic measure. */
export type ImageFrameAspect =
  | "auto"
  | "1/1"
  | "4/3"
  | "3/2"
  | "16/9"
  | "3/4"
  | "2/3"
  | "9/16";

/** How the media fills the frame, CSS `object-fit`. */
export type ImageFrameFit = "cover" | "contain" | "fill" | "none" | "scale-down";

/** Focal point when the media is cropped, CSS `object-position`. */
export type ImageFramePosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/**
 * Corner treatment. `top` rounds only the block-start edge — flush media on a rounded card —
 * so the join with the body stays square.
 */
export type ImageFrameRadius = "none" | "top" | "control" | "surface" | "pill";

/** Optional border, same vocabulary as Box. */
export type ImageFrameBorder = "none" | "subtle" | "default";
