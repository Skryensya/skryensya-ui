import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/** Offline media used by both demos on the gradients page. */
export const DEMO_MEDIA_GRADIENT_SRC = "/demos/media-gradient.svg";

/*
 * Both demos convert once ImageFrame grew a `caption` slot: the wash is not a second media source,
 * so `src` and MediaCaption can sit together without breaking `exactlyOneOf`.
 *
 * Edge labels (`bottom`, `top`, …) stay written: they are the option values the page is teaching.
 */

/** Box + ImageFrame + caption wash: a card with type on the photo and body below. */
export const mediaGradientCardTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "none" },
  children: [
    {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "16/9", radius: "top", src: DEMO_MEDIA_GRADIENT_SRC, alt: "" },
      slots: {
        caption: {
          contract: "media-gradient",
          signature: "MediaCaption",
          options: { edge: "bottom" },
          children: [
            {
              contract: "media-gradient",
              signature: "MediaGradient",
              options: { strength: "lg" },
            },
            {
              contract: "typography",
              signature: "Heading",
              options: { headingSize: "h4", flush: true },
              children: t("demo.mediaGradient.title"),
            },
            {
              contract: "typography",
              signature: "Text",
              children: t("demo.mediaGradient.caption"),
            },
          ],
        },
      },
    },
    {
      contract: "box",
      signature: "Box",
      options: { padding: "md" },
      children: {
        contract: "typography",
        signature: "Text",
        options: { size: "sm", tone: "secondary" },
        children: t("demo.mediaGradient.body"),
      },
    },
  ],
});

function edgeFrame(edge: "top" | "bottom" | "start" | "end"): UsageTree {
  return {
    contract: "image-frame",
    signature: "ImageFrame",
    options: { aspect: "4/3", src: DEMO_MEDIA_GRADIENT_SRC, alt: "" },
    slots: {
      caption: {
        contract: "media-gradient",
        signature: "MediaCaption",
        options: { edge },
        children: [
          {
            contract: "media-gradient",
            signature: "MediaGradient",
            options: { strength: "md" },
          },
          edge,
        ],
      },
    },
  };
}

/** Same wash, four edges: the band follows the caption box, not a percentage of the photo. */
export const mediaGradientEdgesTree = (): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "2", gap: "md" },
  children: [edgeFrame("bottom"), edgeFrame("top"), edgeFrame("start"), edgeFrame("end")],
});
