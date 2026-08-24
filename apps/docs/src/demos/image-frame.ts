import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/**
 * A dummyimage.com placeholder, 800×500. Same measure the old local asset had, so every demo
 * below that crops/positions it (`imageFrameAspectTree`, `imageFrameFitTree`,
 * `imageFramePositionTree`) keeps the exact same math, only the source pixels changed. It is no
 * longer an intentionally asymmetric photo (a disc top-left, a block bottom-right, drawn specifically
 * so `imageFramePositionTree`'s three crops read as visibly different corners of ONE picture): a flat
 * placeholder generator cannot draw that, so that one demo's three specimens now differ only in
 * label position, not in what part of a photo survived. A real loss, accepted deliberately.
 */
export const DEMO_IMAGE_FRAME_SRC = "https://dummyimage.com/800x500/9ca3af/374151.png";

/*
 * The whole page converts.
 *
 * The three comparison grids were authored because of docs-only `demo-grid` / `demo-shot` chrome:
 * a `<figure>` per specimen with a `<figcaption><code>` under it. None of that is ImageFrame: it is
 * the page saying "here are four of these, and this one is called `16/9`". Grid + Stack + Text says
 * the same thing out of published parts, the way `loader.ts` already writes its own specimens. The
 * old `.demo-shot figcaption` rule set `--font-size-caption` and `--color-text-tertiary`, which are
 * exactly Text's `caption` / `tertiary`: the chrome was reachable vocabulary spelled by hand.
 *
 * One thing does NOT survive: the `<code>` around each label. The catalogue publishes no inline-code
 * signature (Kbd is keystrokes, not literals), so `1/1` and `top-left` now read as prose. That is a
 * real hole and a cheap one: it costs a typeface, not the demo. Everything else is unchanged.
 *
 * The media is decorative in the grids, so `alt=""` on all ten frames: the label under each one is
 * what identifies the specimen, and ten copies of the same sentence is noise to read past.
 *
 * Option values (`1/1`, `cover`, `top-left`) stay written. They are the words the page is teaching
 * and they are the same in every language.
 */

/**
 * One specimen: the frame, and under it the option value it is set to.
 *
 * `xs` and centred is the old `.demo-shot` verbatim: a stack of two things, tight, the label
 * centred under the picture.
 */
function specimen(frame: UsageTree, value: string): UsageTree {
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "xs", align: "center" },
    children: [
      frame,
      {
        contract: "typography",
        signature: "Text",
        options: { size: "caption", tone: "tertiary" },
        children: value,
      },
    ],
  };
}

/** A decorative frame in a comparison grid: same asset every time, the options are the subject. */
function frame(options: Record<string, string>): UsageTree {
  return {
    contract: "image-frame",
    signature: "ImageFrame",
    options: { src: DEMO_IMAGE_FRAME_SRC, alt: "", ...options },
  };
}

/** One frame, cover crop, subtle border: the vocabulary the page opens with. */
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

/**
 * Four boxes, one photo. `data-aspect` is the frame, never the file: the asset is 800×500 in all
 * four and the crop is what changes.
 */
export const imageFrameAspectTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "4", gap: "md" },
  attrs: { role: "group", "aria-label": t("demo.imageFrame.aspectLabel") },
  children: [
    specimen(frame({ aspect: "1/1", fit: "cover" }), "1/1"),
    specimen(frame({ aspect: "4/3", fit: "cover" }), "4/3"),
    specimen(frame({ aspect: "16/9", fit: "cover" }), "16/9"),
    specimen(frame({ aspect: "9/16", fit: "cover" }), "9/16"),
  ],
});

/**
 * Same `1/1` box, three fits. The border is what makes `contain` legible: without it you cannot see
 * where the frame ends and the letterbox begins, because the letterbox IS the frame's background.
 */
export const imageFrameFitTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
  attrs: { role: "group", "aria-label": t("demo.imageFrame.fitLabel") },
  children: [
    specimen(frame({ aspect: "1/1", fit: "cover", border: "subtle" }), "cover"),
    specimen(frame({ aspect: "1/1", fit: "contain", border: "subtle" }), "contain"),
    specimen(frame({ aspect: "1/1", fit: "fill", border: "subtle" }), "fill"),
  ],
});

/**
 * Which part of the photo survives the crop. The asset carries a disc top-left and a block
 * bottom-right precisely so the anchor is visible: the three frames differ only in `position`.
 */
export const imageFramePositionTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
  attrs: { role: "group", "aria-label": t("demo.imageFrame.positionLabel") },
  children: [
    specimen(frame({ aspect: "1/1", fit: "cover", position: "top-left" }), "top-left"),
    specimen(frame({ aspect: "1/1", fit: "cover", position: "center" }), "center"),
    specimen(frame({ aspect: "1/1", fit: "cover", position: "bottom-right" }), "bottom-right"),
  ],
});
