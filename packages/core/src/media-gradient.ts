import type { ComponentContract } from "./contract.js";

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

/** How opaque / tinted the wash is behind the type, not how much of the image it covers. */
export type MediaGradientStrength = "sm" | "md" | "lg";

/*
 * A wash so type stays readable over a photo. Always `aria-hidden`: it is paint, and the caption it
 * sits behind is the content. Named for what it is and never for where it is used (`hero`, `card`):
 * a name that says who uses it becomes a lie the moment a second thing needs it.
 */
export const mediaGradientContract = {
  id: "media-gradient",
  css: "@skryensya/core/patterns/media-gradient.css",
  parts: mediaGradientParts,

  options: {
    /** Which edge of the media the caption sits on. The wash fades toward the photo from there. */
    edge: { type: "enum", values: ["top", "bottom", "start", "end"], default: "bottom", attr: "data-edge" },
    strength: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-strength" },
  },

  signatures: {
    /*
     * The caption is the MEASURE. The wash sizes to it, not to a percentage of the media, which is
     * the whole idea of the pattern, and it is why publishing the gradient without this was
     * publishing something that paints nothing: absolutely positioned with no box to fill.
     */
    MediaCaption: {
      intent: ["caption-over-a-photo", "text-on-media", "overlay-title"],
      host: { element: "div" },
      options: ["edge"],
      parents: ["ImageFrame"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "caption", host: true, slot: "children" },
      react: { from: "@skryensya/react/media-gradient", name: "MediaCaption" },
    },

    MediaGradient: {
      intent: ["readable-text-over-a-photo", "scrim-behind-a-caption"],
      host: { element: "div" },
      options: ["strength"],
      parents: ["MediaCaption"],
      slots: {},
      template: { element: "div", part: "root", host: true, attrs: { "aria-hidden": "true" } },
      react: { from: "@skryensya/react/media-gradient", name: "MediaGradient" },
    },
  },
} as const satisfies ComponentContract;
