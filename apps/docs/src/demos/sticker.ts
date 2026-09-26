import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * THE STICKER EXAMPLES, AS USAGE TREES.
 *
 * The artwork is inlined as data URIs, for the reason the gates give: a demo whose picture depends on
 * an asset being served is a demo of a broken image. Two kinds, because the silhouette is the whole
 * point of the component: vector artwork loaded as an image, and a glyph authored as children (an
 * emoji is the one authored artwork a usage tree can carry as text, and its silhouette is anything
 * but a box).
 *
 * Moving between states is page-level script (see `StickerPage.astro`). It writes `data-state`
 * through the DOM, which is the whole authored-markup API, so one script drives both stages.
 */

const svg = (body: string, viewBox = "0 0 100 100", size = 96) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}">${body}</svg>`,
  );

/** A speech bubble, concave where the tail meets the body: the shape a box-shaped edge gets most wrong. */
export const STICKER_BUBBLE = svg(
  '<path d="M50 8C75 8 92 30 80 52L92 90L58 72C30 80 8 62 12 40C16 20 30 8 50 8Z" fill="#805ad5"/>' +
    '<circle cx="40" cy="42" r="6" fill="#fff"/><circle cx="62" cy="42" r="6" fill="#fff"/>',
);

/** A five-point star with a hole through it: outside points and an inside edge, both followed. */
export const STICKER_STAR = svg(
  '<path fill-rule="evenodd" fill="#e8b422" d="M50 4L61 37L96 37L68 58L78 92L50 72L22 92L32 58L4 37L39 37ZM50 44A8 8 0 1 0 50.01 44Z"/>',
);

/** A crescent: one long concave curve, where a uniform edge is easiest to judge by eye. */
export const STICKER_MOON = svg('<path d="M70 8A45 45 0 1 0 94 72A36 36 0 1 1 70 8Z" fill="#dd6b20"/>');

const sticker = (options: Record<string, string>, extra: Partial<UsageTree> = {}): UsageTree => ({
  contract: "sticker",
  signature: "Sticker",
  options,
  ...extra,
});

/** One specimen and the value it is set to, the way ImageFrame's comparison grids label theirs. */
function specimen(tree: UsageTree, value: string): UsageTree {
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm", align: "center" },
    children: [tree, { contract: "typography", signature: "Text", options: { size: "caption", tone: "tertiary" }, children: value }],
  };
}

/** The opening demo: three silhouettes, three states, no two of them a rectangle. */
export const stickerTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "xl", inlineAlign: "center" },
  attrs: { role: "group", "aria-label": t("demo.sticker.groupLabel") },
  children: [
    sticker({ src: STICKER_STAR, alt: t("demo.sticker.starAlt") }),
    sticker({ src: STICKER_BUBBLE, alt: t("demo.sticker.bubbleAlt"), state: "peeled", peelOrigin: "block-start-inline-end" }),
    sticker({ state: "applied" }, { children: "🍕", attrs: { style: "font-size: 4.5rem; line-height: 1;" } }),
  ],
});

/** The same artwork in each of the three states, side by side. Decorative, so `alt=""` on each. */
export const stickerStatesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "lg" },
  attrs: { role: "group", "aria-label": t("demo.sticker.statesLabel") },
  children: (["idle", "peeled", "applied"] as const).map((state) =>
    specimen(sticker({ src: STICKER_MOON, alt: "", state }), state),
  ),
});

/** Four corners, logical names. The bubble has material in every corner of its box but one. */
export const stickerOriginsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "4", gap: "lg" },
  attrs: { role: "group", "aria-label": t("demo.sticker.originsLabel") },
  children: (
    ["block-start-inline-start", "block-start-inline-end", "block-end-inline-start", "block-end-inline-end"] as const
  ).map((peelOrigin) => specimen(sticker({ src: STICKER_STAR, alt: "", state: "peeled", peelOrigin }), peelOrigin)),
});

/*
 * The consumer decides. Two buttons write the state the product has; the sticker only shows it. The
 * buttons are the product's controls, not the sticker's: nothing on the sticker itself is clickable.
 */
export const stickerPlacementTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "lg", align: "center" },
  children: [
    sticker(
      { src: STICKER_STAR, alt: t("demo.sticker.starAlt"), state: "idle" },
      { attrs: { id: "sticker-placement", style: "inline-size: 8rem;" } },
    ),
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm", inlineAlign: "center" },
      children: [
        {
          contract: "button",
          signature: "Button.action",
          attrs: { "data-sticker-to": "peeled" },
          children: t("demo.sticker.peel"),
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { tone: "accent" },
          attrs: { "data-sticker-to": "applied" },
          children: t("demo.sticker.apply"),
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost" },
          attrs: { "data-sticker-to": "idle" },
          children: t("demo.sticker.reset"),
        },
      ],
    },
  ],
});

/*
 * The styling hooks, on each instance. `attrs.style` on purpose: they are the consumer's override,
 * not options the contract offers.
 */
export const stickerHooksTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "lg" },
  attrs: { role: "group", "aria-label": t("demo.sticker.hooksLabel") },
  children: [
    specimen(sticker({ src: STICKER_BUBBLE, alt: "" }), t("demo.sticker.hooksDefault")),
    specimen(
      sticker(
        { src: STICKER_BUBBLE, alt: "" },
        { attrs: { style: "--sk-sticker-edge-width: 0.75rem; --sk-sticker-edge-color: var(--color-bg-accent-subtle); --sk-sticker-rotate: 4deg;" } },
      ),
      t("demo.sticker.hooksThick"),
    ),
    specimen(
      sticker(
        { src: STICKER_BUBBLE, alt: "", state: "peeled", peelOrigin: "block-start-inline-end" },
        { attrs: { style: "--sk-sticker-peel-size: 0.8; --sk-sticker-rotate: 0deg;" } },
      ),
      t("demo.sticker.hooksDeep"),
    ),
  ],
});

/*
 * The three parts, drawn peeled so the flap has something in it. `__art` appears twice in the markup
 * and the diagram names the flat one; the copy inside the flap is the same part.
 */
export const stickerAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("sticker.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: sticker(
      { src: STICKER_STAR, alt: t("demo.sticker.starAlt"), state: "peeled", peelOrigin: "block-start-inline-end" },
      { attrs: { style: "inline-size: 11rem;" } },
    ),
    items: [
      namePart(".sk-sticker", "block-start", { mark: "bracket" }),
      namePart(".sk-sticker__art", "inline-start"),
      namePart(".sk-sticker__flap", "inline-end"),
    ],
  },
});
