import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/** Offline asymmetric asset so crop and object-position read clearly. */
export const DEMO_IMAGE_FRAME_SRC = "/demos/image-frame.svg";

/*
 * The basic frame converts. Aspect / fit / position stay authored: they wrap frames in docs-only
 * `demo-grid` / `demo-shot` chrome that no signature emits.
 */

/** One frame, cover crop, subtle border — the vocabulary the page opens with. */
export const imageFrameTree = (t: Translate): UsageTree => ({
  contract: "image-frame",
  signature: "ImageFrame",
  options: {
    aspect: "16/9",
    fit: "cover",
    position: "center",
    radius: "surface",
    border: "subtle",
    src: DEMO_IMAGE_FRAME_SRC,
    alt: t("demo.imageFrame.alt"),
  },
});
