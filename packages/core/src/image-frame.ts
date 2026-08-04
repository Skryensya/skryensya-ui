import type { ComponentContract, OptionsOf, OptionValue } from "./contract.js";

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

/*
 * The contract, and the case that forces `exactlyOneOf` to exist.
 *
 * A frame holds media the consumer authors; as a `src`, or as an authored `<picture>`/`<video>`.
 * One or the other, never neither: with neither, every presence check passes and the page renders an
 * empty box. `requires` would demand both and `forbids` would refuse both, so neither can say it.
 * That is a real bug this repo shipped, and it is now a structured constraint rather than a warning
 * nobody could enforce.
 *
 * A caption over the photo is not a second media source. It is its own slot so `src` (or authored
 * children) can coexist with a MediaCaption; the wash needs the media beside it, and that composition
 * is the whole reason the gradient pattern exists.
 */
export const imageFrameContract = {
  id: "image-frame",
  css: "@skryensya/core/patterns/image-frame.css",
  parts: imageFrameParts,

  options: {
    /** The frame box. `auto` keeps the media's intrinsic measure. */
    aspect: {
      type: "enum",
      values: ["auto", "1/1", "4/3", "3/2", "16/9", "3/4", "2/3", "9/16"],
      default: "auto",
      attr: "data-aspect",
    },
    /** How the media fills the frame, CSS `object-fit`. */
    fit: {
      type: "enum",
      values: ["cover", "contain", "fill", "none", "scale-down"],
      default: "cover",
      attr: "data-fit",
    },
    /** Focal point when the media is cropped, CSS `object-position`. */
    position: {
      type: "enum",
      values: [
        "center",
        "top",
        "bottom",
        "left",
        "right",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ],
      default: "center",
      attr: "data-position",
    },
    /**
     * Corner treatment. `top` rounds only the block-start edge; flush media on a rounded card; so
     * the join with the body stays square.
     */
    radius: {
      type: "enum",
      values: ["none", "top", "control", "surface", "pill"],
      default: "surface",
      attr: "data-radius",
    },
    /** Optional border, same vocabulary as Box. */
    border: {
      type: "enum",
      values: ["none", "subtle", "default"],
      default: "none",
      attr: "data-border",
    },
    /** The convenience source. Renders the `<img>` part; authored children are the other way in. */
    src: { type: "string", attr: "src" },
    alt: { type: "string", attr: "alt" },
  },

  signatures: {
    ImageFrame: {
      intent: ["media", "clipped-media", "aspect-ratio-box", "thumbnail", "cover-image"],
      host: { element: "div" },
      options: ["aspect", "fit", "position", "radius", "border", "src", "alt"],
      exactlyOneOf: [["src", "children"]],
      slots: {
        /** Authored media: `picture`, `video`, anything the `src` convenience cannot express. */
        children: { accepts: "node" },
        /**
         * Type on the photo. Not a media source; `exactlyOneOf` does not count it; so a `src`
         * frame can still carry a wash and a title.
         */
        caption: { accepts: "signature", of: ["MediaCaption"] },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          // `src` and `alt` belong to the image, never to the box around it.
          { element: "img", part: "media", options: ["src", "alt"], whenGiven: "src" },
          { slot: "children" },
          { slot: "caption" },
        ],
      },
      react: { from: "@skryensya/react/image-frame", name: "ImageFrame" },
    },
  },

  a11y: [
    {
      when: { src: "present" },
      requiresOneOf: ["alt"],
      because: "An authored image needs an alt, empty when decorative. The frame never invents one.",
    },
  ],
} as const satisfies ComponentContract;

/*
 * Derived, never restated. These used to be hand-written unions sitting beside a hand-written
 * contract; two lists that had to agree, which is exactly the drift decision 28 exists to end. G1
 * could not have caught it: the duplication was inside Core, not in a binding.
 */
export type ImageFrameAspect = OptionValue<typeof imageFrameContract.options.aspect>;
export type ImageFrameFit = OptionValue<typeof imageFrameContract.options.fit>;
export type ImageFramePosition = OptionValue<typeof imageFrameContract.options.position>;
export type ImageFrameRadius = OptionValue<typeof imageFrameContract.options.radius>;
export type ImageFrameBorder = OptionValue<typeof imageFrameContract.options.border>;
export type ImageFrameOptions = OptionsOf<typeof imageFrameContract>;
