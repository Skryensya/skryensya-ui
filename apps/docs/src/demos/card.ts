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
 * EVERY CARD EXAMPLE IS HERE NOW, including the six that reach for classes `examples/card.css`
 * owns and no contract publishes (`sk-card-body`, `sk-card-price`, `sk-card-eyebrow` and friends).
 * Those looked like a blocker  -  a usage tree chooses SIGNATURES, and a docs-local skin is not one  -
 * but `attrs.class` is emitted by both bindings like any other attribute (`class` in the markup,
 * `className` in the JSX), so the skin rides along on the signature it decorates. The composition
 * is authored once; only the page's own paint stays the page's.
 *
 * WHAT THAT COSTS, said plainly: `Box` hosts a `div`, so the three examples whose hand-written
 * markup opened with `<article>` now open with a `<div>`. The contract publishes no element
 * override, and inventing one to keep a wrapper element that carries no landmark here would be a
 * change to the SYSTEM made for one demo.
 *
 * The data still comes from `examples/card-data.ts`: three consumers already share it, and a tree
 * changes how a card is spelled, not where its words live.
 */

/** Every example is the same three-up grid, named for assistive tech. */
const grid = (label: string, children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
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
  );

/*
 * The icon well that opens the two interactive cards below. `Box` and not a bare element because a
 * tree names signatures, and Box IS the system's neutral surface: transparent, unpadded, no border
 * until asked. Everything visible about the well  -  its size, its radius, its sunken fill  -  is
 * `.sk-card-link-icon` in `examples/card.css`, which is where a consumer's own anatomy belongs.
 */
const iconWell = (name: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  attrs: { class: "sk-card-link-icon", "aria-hidden": "true" },
  children: [{ contract: "icon", signature: "Icon", options: { name } }],
});

/*
 * The head row both interactive cards share: the well, and (for the link) the chevron that says
 * where the surface goes. An `Inline` with `justify="between"`, so the row's LAYOUT comes from the
 * contract and `.sk-card-link-head` is left holding only what it is still needed for: the hook
 * `.sk-tile:has(…)` keys off to pin the card's rows to the top.
 */
const linkHead = (name: string, chevron: boolean): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", inlineAlign: "center", justify: "between" },
  attrs: { class: "sk-card-link-head" },
  children: chevron
    ? [
        iconWell(name),
        {
          contract: "icon",
          signature: "Icon",
          options: { name: "chevron-right", size: "sm" },
          attrs: { class: "sk-card-link-chevron", "aria-hidden": "true" },
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
  );

/*
 * 8. Media flush to the card's edge.
 *
 * The outer Box carries NO padding on purpose: it already clips (`overflow: hidden`), so an
 * `ImageFrame` at `radius="none"` fills the top edge and inherits the corner. The inset the text
 * needs comes back from `.sk-card-body`, one level in; padding on the root would inset the photo
 * too, which is the exact mistake the two-box pattern exists to prevent.
 */
export const cardMediaTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.media,
    c.media.map((card) => ({
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle" },
      attrs: { class: "sk-card-media" },
      children: [
        {
          contract: "image-frame",
          signature: "ImageFrame",
          options: { src: card.src, alt: card.alt, aspect: "16/9", radius: "none", fit: "cover" },
        },
        {
          contract: "box",
          signature: "Box",
          attrs: { class: "sk-card-body" },
          children: [
            { contract: "badge", signature: "Badge", options: { tone: "accent" }, children: card.badge },
            {
              contract: "typography",
              signature: "Heading",
              options: { headingSize: "h4", flush: true },
              children: card.title,
            },
            { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: card.body },
          ],
        },
      ],
    })),
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
      attrs: { class: "sk-card-gradient" },
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
                {
                  contract: "typography",
                  signature: "Text",
                  options: { size: "caption" },
                  attrs: { class: "sk-card-eyebrow" },
                  children: card.eyebrow,
                },
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
  );

/*
 * 10. Interactive AND media AND wash, all three at once.
 *
 * `padding="none"` so the photo reaches the edge; the copy and the footer each take their inset
 * back from `examples/card.css`. There is exactly one destination and therefore exactly one focus
 * stop: the title names the link from inside `TileContent`, and the "read" row is chrome, not a
 * second anchor.
 *
 * `TileContent` sits DIRECTLY under the tile, not wrapped in a padded Box, because the contract
 * says so and the validator says so out loud: the hand-written version of this example spelled
 * `sk-tile__title` by hand inside a `<span class="sk-card-body">`, which is the same shape with the
 * rule quietly stepped around. The inset moved onto the parts instead.
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
                {
                  contract: "typography",
                  signature: "Text",
                  options: { size: "caption" },
                  attrs: { class: "sk-card-eyebrow" },
                  children: card.eyebrow,
                },
              ],
            },
          },
        },
        {
          contract: "tile",
          signature: "TileContent",
          attrs: { class: "sk-card-body" },
          slots: { title: card.title, description: card.body },
        },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "xs", inlineAlign: "center" },
          attrs: { class: "sk-card-cta" },
          children: [
            c.cta.read,
            { contract: "icon", signature: "Icon", options: { name: "arrow-right", size: "sm" } },
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
 * the two. The price row is an `Inline` on the baseline; `.sk-card-plan` is what pushes it down so
 * three plans of different body lengths still line their footers up.
 */
export const cardProductTree = (c: CardCopy): UsageTree =>
  grid(
    c.labels.product,
    c.product.map((card) => ({
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "lg" },
      attrs: { class: "sk-card-plan" },
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "md" },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "xs" },
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
              attrs: { class: "sk-card-price" },
              children: [
                {
                  contract: "typography",
                  signature: "Text",
                  attrs: { class: "sk-card-price__value" },
                  children: card.price,
                },
                {
                  contract: "typography",
                  signature: "Text",
                  options: { tone: "tertiary", size: "caption" },
                  attrs: { class: "sk-card-price__period" },
                  children: card.period,
                },
              ],
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm", justify: "between", inlineAlign: "center" },
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
  );
