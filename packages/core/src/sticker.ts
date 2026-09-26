import type { ComponentContract, OptionsOf, OptionValue } from "./contract.js";

/*
 * STICKER, authored artwork turned into a die-cut sticker that can peel and be applied.
 *
 * The artwork's own silhouette IS the sticker: transparent pixels are outside it, visible pixels or
 * vector geometry are inside. The stylesheet grows that silhouette into a material edge and lays the
 * artwork over it. It never draws around the element's box, which is the whole difference from
 * ImageFrame: a frame imposes a rectangle on media, a sticker keeps the shape the media already has.
 *
 * NO MACHINE AND NO ENHANCER. What a sticker is at a given moment (resting, peeled, applied) is the
 * consumer's decision, written as `data-state`, and changing that attribute is what plays the
 * transition. Everything else is paint: the edge is a filter that follows alpha, the peel is a
 * transform, the timing is motion intent tokens. A click on the sticker changes nothing unless the
 * consumer's own code says so. A drag-to-peel gesture would be the first behavior worth a runtime,
 * because it tracks a pointer the platform cannot follow for us; it is not part of this contract.
 */
export const stickerParts = {
  root: "sk-sticker",
  art: "sk-sticker__art",
  flap: "sk-sticker__flap",
} as const;

export type StickerPart = keyof typeof stickerParts;
export type StickerPartClass = (typeof stickerParts)[StickerPart];

/*
 * The contract.
 *
 * WHY THERE ARE TWO `art` NODES. A peel is one region of the sticker lifting while the rest stays
 * down, and one element can only have one transform: CSS has no way to bend a single box in two
 * places. So the artwork is laid down twice, the same part both times, and each copy is clipped to
 * its side of the fold line. The copy inside `flap` is the corner that lifts; it is `aria-hidden`,
 * because it is the same picture a second time and a reader should meet it once. Marquee repeats
 * its content for the same reason: a visual effect that needs a copy, and a single copy in the
 * accessibility tree.
 *
 * `flap` is its own part rather than a class on the copy because it is the size container the fold
 * geometry measures (`container-type: size`): the fold line runs corner to corner in PERCENTAGES of
 * the artwork, and turning it into a rotation axis needs the artwork's real aspect ratio, which only
 * container units expose. It paints nothing itself.
 *
 * `src` and the children slot are the two ways in, exactly one of them, for the reason ImageFrame
 * forced `exactlyOneOf` into existence: with neither, every presence check passes and the page gets
 * an empty sticker; with both, two pictures stack in one silhouette.
 */
export const stickerContract = {
  id: "sticker",
  category: "content",
  css: "@skryensya/core/components/sticker.css",
  parts: stickerParts,
  hooks: [
    "--sk-sticker-edge-color",
    "--sk-sticker-edge-width",
    "--sk-sticker-peel-size",
    "--sk-sticker-rotate",
  ],

  options: {
    /*
     * Where the sticker is. `idle` is unapplied: a loose object resting slightly above the page.
     * `peeled` has one corner lifted off whatever it sits on. `applied` is pressed flat and stuck.
     *
     * The consumer owns this, never the sticker: whether a badge has been earned or an item placed
     * is the product's fact, and the component only shows it. The value is written, not toggled,
     * so the same markup can start in any of the three and stays there until someone writes another.
     */
    state: {
      type: "enum",
      values: ["idle", "peeled", "applied"],
      default: "idle",
      attr: "data-state",
    },
    /*
     * Which corner lifts when the sticker peels, in logical terms so it follows the writing
     * direction: `block-end-inline-end` is the bottom right in a left-to-right page and the bottom
     * left in a right-to-left one.
     *
     * A real choice rather than an exposed transform origin, and the artwork is why. The fold starts
     * at a corner of the artwork's BOX, and an irregular silhouette often leaves a corner empty: a
     * peel there lifts nothing but transparency until the fold line reaches material. The consumer
     * is the one who can see which corner of their picture has something to hold on to, and where
     * the sticker sits on the page (a sticker in a card's top corner peels from the corner facing
     * inward, not the one against the card's edge).
     */
    peelOrigin: {
      type: "enum",
      values: [
        "block-start-inline-start",
        "block-start-inline-end",
        "block-end-inline-start",
        "block-end-inline-end",
      ],
      default: "block-end-inline-end",
      attr: "data-peel-origin",
    },
    /** The convenience source. Renders the image inside `art`; authored children are the other way in. */
    src: { type: "string", attr: "src" },
    alt: { type: "string", attr: "alt" },
  },

  signatures: {
    Sticker: {
      intent: ["sticker", "die-cut-sticker", "peelable-sticker", "silhouette-outline", "badge-sticker"],
      /*
       * A span, so a sticker can sit in a line of text or a heading as well as in a layout. The
       * artwork inside is phrasing content either way: an `img`, an `svg`, a glyph.
       */
      host: { element: "span" },
      options: ["state", "peelOrigin", "src", "alt"],
      exactlyOneOf: [["src", "children"]],
      slots: {
        /*
         * Authored artwork: an inline `svg`, a `picture`, an emoji, anything `src` cannot express.
         * Whatever semantics it carries (an svg's `role="img"` and `<title>`, a picture's `alt`) are
         * the author's and stay theirs; the sticker adds none.
         */
        children: { accepts: "node" },
      },
      template: {
        element: "span",
        part: "root",
        host: true,
        children: [
          {
            element: "span",
            part: "art",
            children: [
              // `src` and `alt` belong to the image, never to the sticker around it.
              { element: "img", options: ["src", "alt"], whenGiven: "src" },
              { slot: "children" },
            ],
          },
          {
            element: "span",
            part: "flap",
            attrs: { "aria-hidden": "true" },
            children: [
              {
                element: "span",
                part: "art",
                children: [
                  /* The lifted corner's copy. Its own alt is empty on purpose: the flap is hidden
                     from assistive tech already, and an image with no alt at all is still reported
                     by checkers even inside a hidden subtree. */
                  { element: "img", attrs: { alt: "" }, options: ["src"], whenGiven: "src" },
                  { slot: "children" },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/sticker", name: "Sticker" },
    },
  },

  a11y: [
    {
      when: { src: "present" },
      requiresOneOf: ["alt"],
      because:
        "An authored image needs an alt, empty when the sticker is decoration. The sticker never invents one, and its state is not announced.",
    },
  ],
} as const satisfies ComponentContract;

/* Derived, never restated. */
export type StickerState = OptionValue<typeof stickerContract.options.state>;
export type StickerPeelOrigin = OptionValue<typeof stickerContract.options.peelOrigin>;
export type StickerOptions = OptionsOf<typeof stickerContract>;
