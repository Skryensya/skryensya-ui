import type { UsageTree } from "@skryensya/core/usage-tree";
import type { CardCopy } from "../examples/card-data";

/*
 * THE CARD EXAMPLES THAT ARE PURE COMPOSITION, AS USAGE TREES.
 *
 * These used to be hand-written HTML strings in `examples/card-sources.ts`, one builder per example,
 * with a matching React island written separately in `components/react-demos/card.tsx`. That is the
 * arrangement the whole emitter exists to remove: two hand-kept spellings of one composition, in two
 * languages, which can drift from each other and from the live demo without anything noticing. A
 * tree is one authoring, and the compiler emits the markup, the React source and the live island
 * from it (`ComponentPreview`'s own `tree` prop).
 *
 * COMPOSITION ONLY, NO SKIN. Card has no contract and no stylesheet of its own, and these trees do
 * not smuggle one in: there is no `attrs.class` here and no `examples/card.css`. Every inset, well,
 * eyebrow, price and floor is a published option (Box padding and surface, Stack alignment, Text
 * size and weight, Inline `blockStart="auto"`). That is also what lets the playground run them:
 * it loads the kit's CSS and nothing else, so a docs-local class would render unstyled there.
 *
 * WHAT THAT COSTS, said plainly: `Box` hosts a `div`, so the three examples whose hand-written
 * markup opened with `<article>` now open with a `<div>`. The contract publishes no element
 * override, and inventing one to keep a wrapper element that carries no landmark here would be a
 * change to the SYSTEM made for one demo.
 *
 * The data still comes from `examples/card-data.ts`: three consumers already share it, and a tree
 * changes how a card is spelled, not where its words live.
 */

/**
 * Every example is the same three-up grid, named for assistive tech. `responsive` stacks it to one
 * lane on narrow viewports (two at 36rem, three at 52rem) instead of squeezing three columns.
 */
const grid = (label: string, children: UsageTree[], responsive = false): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: responsive ? { columns: "3", gap: "md", responsive: true } : { columns: "3", gap: "md" },
  attrs: { "aria-label": label },
  children,
});

/** The card surface the ladder settles on: a bordered, padded Box. */
const surface = (children: UsageTree): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "lg" },
  children: [children],
});

/** A small label over a photo's caption: caption size at label weight, no skin of its own. */
const eyebrow = (text: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { size: "caption", weight: "label" },
  children: text,
});

/** Title over body, the pair every example in this file ends with. */
const titleAndBody = (title: string, body: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "xs" },
  children: [
    {
      contract: "typography",
      signature: "Heading",
      options: { headingSize: "h4", flush: true },
      children: title,
    },
    { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: body },
  ],
});

/** 1. Plain content, no container at all: the floor of the ladder. */
export const cardPlainMediaTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.plainMedia,
    c.plainMedia.map((card) => ({
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      children: [
        {
          contract: "image-frame",
          signature: "ImageFrame",
          options: { src: card.src, alt: card.alt, aspect: "16/9", fit: "cover" },
        },
        titleAndBody(card.title, card.body),
      ],
    })),
  );

/** 2. The same content, now on a real surface. */
export const cardBasicTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.basic,
    c.basic.map((card) => surface(titleAndBody(card.title, card.body))),
  );

/** 3. Metadata above the title: a Badge and a date, on one line. */
export const cardMetaTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.meta,
    c.meta.map((card) =>
      surface({
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm" },
        children: [
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm" },
            children: [
              { contract: "badge", signature: "Badge", options: { tone: card.tone }, children: card.badge },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "caption", tone: "tertiary" },
                children: card.date,
              },
            ],
          },
          titleAndBody(card.title, card.body),
        ],
      }),
    ),
  );

/*
 * 4. One figure per card. `change` holds an arrow icon AND the figure it qualifies, which is the
 * slot shape that used to lose its text on the React side (fixed in `ai-compiler`'s emitter, with
 * the regression test that names this example).
 */
export const cardStatTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.stat,
    c.stat.map((card) =>
      surface({
        contract: "stat",
        signature: "Stat",
        options: { trend: card.trend },
        slots: {
          label: card.label,
          value: card.value,
          change: [
            { contract: "icon", signature: "Icon", options: { name: `arrow-${card.trend}`, size: "sm" } },
            card.change,
          ],
        },
      }),
    ),
  );

/*
 * 5. A selectable card: TileCheckbox, whose own template brings the input and both indicator glyphs.
 * `defaultChecked` lands on the ROOT as `data-default-checked`, which is where the Zag machine reads
 * it: authoring `checked` on the input instead is the regression `card-sources.test.ts` was written
 * for, and a tree cannot make that mistake because the option is the contract's.
 */
export const cardSelectTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.select,
    c.select.map((card, index) => ({
      contract: "tile",
      signature: "TileCheckbox",
      options: {
        name: "prefs",
        value: `pref-${index + 1}`,
        defaultChecked: card.checked,
        padding: "lg",
      },
      children: {
        contract: "tile",
        signature: "TileContent",
        slots: { title: card.title, description: card.body },
      },
    })),
    true,
  );

/*
 * The icon well that opens the two interactive cards below: a sunken, lightly padded Box. It sits in
 * an Inline, so it shrinks to the glyph instead of stretching across the card.
 */
const iconWell = (name: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "sunken", padding: "sm" },
  attrs: { "aria-hidden": "true" },
  children: [{ contract: "icon", signature: "Icon", options: { name } }],
});

/*
 * The head row both interactive cards share: the well, and (for the link) the chevron that says
 * where the surface goes. An `Inline` with `justify="between"` puts them at either end.
 */
const linkHead = (name: string, chevron: boolean): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", inlineAlign: "center", justify: "between" },
  children: chevron
    ? [
        iconWell(name),
        {
          contract: "icon",
          signature: "Icon",
          options: { name: "chevron-right", size: "sm" },
          attrs: { "aria-hidden": "true" },
        },
      ]
    : [iconWell(name)],
});

/*
 * 6. The first interactive rung: the whole surface goes to ONE destination, so the root IS the
 * anchor. No stretched-link CSS, no click handler on a div, and no second focus stop inside it,
 * which is why the title is `TileContent`'s slot rather than a nested `Link`.
 */
export const cardLinkTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.link,
    c.link.map((card) => ({
      contract: "tile",
      signature: "TileLink",
      options: { href: "#", padding: "lg" },
      children: [
        linkHead(card.icon, true),
        {
          contract: "tile",
          signature: "TileContent",
          slots: { title: card.title, description: card.body },
        },
      ],
    })),
    true,
  );

/** 7. The same geometry on a different platform element: this one DOES something, so it is a button. */
export const cardActionTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.action,
    c.action.map((card) => ({
      contract: "tile",
      signature: "TileButton",
      options: { padding: "lg" },
      children: [
        linkHead(card.icon, false),
        {
          contract: "tile",
          signature: "TileContent",
          slots: { title: card.title, description: card.body },
        },
      ],
    })),
    true,
  );

/*
 * 8. Media flush to the card's edge.
 *
 * The outer Box carries NO padding on purpose: it already clips (`overflow: hidden`), so an
 * `ImageFrame` at `radius="none"` fills the top edge and inherits the corner. The inset the text
 * needs comes back from a second, padded Box one level in; padding on the root would inset the photo
 * too, which is the exact mistake the two-box pattern exists to prevent. The text Stack aligns to
 * `start` so the Badge keeps its own width instead of stretching across the card.
 */
export const cardMediaTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.media,
    c.media.map((card) => ({
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle" },
      children: [
        {
          contract: "image-frame",
          signature: "ImageFrame",
          options: { src: card.src, alt: card.alt, aspect: "16/9", radius: "none", fit: "cover" },
        },
        {
          contract: "box",
          signature: "Box",
          options: { padding: "lg" },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "sm", align: "start" },
              children: [
                { contract: "badge", signature: "Badge", options: { tone: "accent" }, children: card.badge },
                titleAndBody(card.title, card.body),
              ],
            },
          ],
        },
      ],
    })),
    true,
  );

/*
 * 9. Type ON the photo, over a wash.
 *
 * The wash sizes itself to the CAPTION, never to a percentage of the image: the caption is the box
 * and `MediaGradient` absolutely fills it, fading away from its edge. `strength` is opacity and
 * tint, and it varies across the three so the row shows what the option actually does.
 */
export const cardGradientTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.gradient,
    c.gradient.map((card) => ({
      contract: "box",
      signature: "Box",
      options: { surface: "surface" },
      children: [
        {
          contract: "image-frame",
          signature: "ImageFrame",
          options: { src: card.src, alt: card.alt, aspect: "3/4", radius: "none", fit: "cover" },
          slots: {
            caption: {
              contract: "media-gradient",
              signature: "MediaCaption",
              options: { edge: "bottom" },
              children: [
                { contract: "media-gradient", signature: "MediaGradient", options: { strength: card.strength } },
                eyebrow(card.eyebrow),
                {
                  contract: "typography",
                  signature: "Heading",
                  options: { headingSize: "h4", flush: true },
                  children: card.title,
                },
                { contract: "typography", signature: "Text", options: { size: "sm" }, children: card.body },
              ],
            },
          },
        },
      ],
    })),
    true,
  );

/*
 * 10. Interactive AND media AND wash, all three at once.
 *
 * `padding="none"` so the photo reaches the edge; the copy and the "read" row take their inset back
 * from one padded Box below it, the same two-box shape as the media card. There is exactly one
 * destination and therefore exactly one focus stop: the "read" row is chrome, not a second anchor.
 *
 * NOT `TileContent`: the contract places it directly under the tile, where nothing can pad it, and
 * the old version only got its inset from a docs-local class. Heading and Text inside the padded Box
 * say the same thing with published options.
 *
 * ONE child under the tile, a plain Box around the photo and the copy. The tile is a grid, and a card
 * made taller by its neighbours splits the extra height across every row it has: with the photo and
 * the copy as two rows, that opened a band of empty space under the photo. One row has nothing to
 * split, the same block flow the media card above already uses.
 */
export const cardMediaLinkTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.mediaLink,
    c.mediaLink.map((card) => ({
      contract: "tile",
      signature: "TileLink",
      options: { href: "#", padding: "none" },
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "none" },
          children: [
            {
              contract: "image-frame",
              signature: "ImageFrame",
              options: { src: card.src, alt: card.alt, aspect: "16/9", radius: "none", fit: "cover" },
              slots: {
                caption: {
                  contract: "media-gradient",
                  signature: "MediaCaption",
                  options: { edge: "bottom" },
                  children: [
                    { contract: "media-gradient", signature: "MediaGradient", options: { strength: "lg" } },
                    eyebrow(card.eyebrow),
                  ],
                },
              },
            },
            {
              contract: "box",
              signature: "Box",
              options: { padding: "lg" },
              children: [
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "md" },
                  children: [
                    titleAndBody(card.title, card.body),
                    {
                      contract: "layout",
                      signature: "Inline",
                      options: { gap: "xs", inlineAlign: "center" },
                      children: [
                        c.cta.read,
                        { contract: "icon", signature: "Icon", options: { name: "arrow-right", size: "sm" } },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })),
  );

/*
 * 11. Two independent decisions on one surface, which is the case `Box` exists for.
 *
 * "See details" and "Add" go to different places, so the root cannot be a Tile: a link and a button
 * nested inside an anchor is invalid HTML, and a whole-surface click could only ever mean one of
 * the two. The price row is an `Inline` on the baseline, right under the copy. The actions row is
 * the Stack's last child at `blockStart="auto"`, the kit's card floor (layout.css): the Box becomes a
 * column that fills its grid cell, so three plans of different body lengths still line their footers
 * up.
 */
export const cardProductTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.product,
    c.product.map((card) => ({
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "lg" },
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "md" },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "xs", align: "start" },
              children: [
                { contract: "badge", signature: "Badge", options: { tone: card.tone }, children: card.badge },
                {
                  contract: "typography",
                  signature: "Heading",
                  options: { headingSize: "h4", flush: true },
                  children: card.title,
                },
                { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: card.body },
              ],
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "xs", inlineAlign: "baseline" },
              children: [
                {
                  contract: "typography",
                  signature: "Text",
                  options: { size: "lg", weight: "label" },
                  children: card.price,
                },
                {
                  contract: "typography",
                  signature: "Text",
                  options: { tone: "tertiary", size: "caption" },
                  children: card.period,
                },
              ],
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm", justify: "between", inlineAlign: "center", blockStart: "auto" },
              children: [
                { contract: "typography", signature: "Link", options: { href: "#" }, children: c.cta.details },
                {
                  contract: "button",
                  signature: "Button.action",
                  options: { tone: "accent" },
                  children: c.cta.add,
                },
              ],
            },
          ],
        },
      ],
    })),
    true,
  );
