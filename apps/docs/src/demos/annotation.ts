import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * FOUR DEMOS, because the component makes four separate claims and no single frame makes all of
 * them at once. Every one is the same form, the only one there is: numbers in the gutters, names in
 * the legend, the whole drawing on a canvas.
 *
 *   annotationAnatomyTree   the one the component exists for: a whole live Accordion with every
 *                           part it renders, areas bracketed and things ringed. The Accordion page
 *                           shows this same figure.
 *   annotationSidesTree     the four gutters on one small specimen, so "inline-start" and friends
 *                           stop being words and become positions.
 *   annotationPluralTree    one name, several parts: `match: "all"`.
 *   annotationElbowTree     the leader itself: targets deliberately bunched so their numbers cannot
 *                           all sit level with them, which is the only way to SEE the 45-degree
 *                           knee the contract promises.
 *
 * The part names are the content. They are not translated and never will be: `sk-tile__trigger` is
 * a class name, and a translated one would name nothing.
 */

/*
 * The demos' own type, passed to BOTH bindings through `ComponentPreview`'s `css` prop.
 *
 * The component deliberately inherits its family (a name is not always a class name: it is whatever
 * the diagram is naming), and every name in these legends IS one, so the page asks for the code
 * family the same way it would in prose. This is the hook doing its job, not a gap in the default.
 */
export const annotationDemoCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}`;

/*
 * The plural demo forces a narrow trail. That leaves the first crumb, the collapse trigger and the
 * current page visible, so the drawing can name both the repeated visible items and the one singular
 * control that represents the collapsed ancestors.
 */
export const annotationPluralCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
  --sk-annotated-gap: var(--space-stack-xl);
}

.sk-annotated .sk-breadcrumb {
  inline-size: 16rem;
}`;

const accordionSection = (
  value: string,
  title: string,
  description: string,
  answer: string,
  open = false,
): UsageTree => ({
  contract: "accordion",
  signature: "Accordion.Item",
  options: open ? { value, defaultOpen: true } : { value },
  children: [
    {
      contract: "accordion",
      signature: "Accordion.Trigger",
      children: [
        { contract: "tile", signature: "TileContent", slots: { title, description } },
        { contract: "tile", signature: "TileChevron" },
      ],
    },
    { contract: "accordion", signature: "Accordion.Content", children: answer },
  ],
});

/*
 * The first section opens by default and the second stays closed so every rendered Accordion part
 * exists in the drawing. This is a frozen reference: it names those states without changing under
 * the reader. Interaction belongs in the Accordion's usage demos, not in its anatomy.
 *
 * `sk-accordion__trigger-heading` IS NOT LABELLED HERE, and its absence is the honest answer rather
 * than an oversight. That part is `display: contents` (accordion.css: carrying `role="heading"` must
 * not insert a box between a section and its button), so it has no box for a leader to reach. The
 * contract handles it, `isPointable` drops the leader and keeps the number, but a number pointing at
 * nothing in the one demo that teaches the component would read as a bug rather than as a rule. The
 * page says so in prose instead.
 *
 * THE MARKS ARE PLANNED FOR NUMBERS:
 *
 *   AREAS GET BRACKETS. The accordion, the open item, its trigger and its panel are regions that
 *   hold other parts, so a leader into any of them lands on some child. Their numbers sit on
 *   dimension lines along the inline-end side instead, nested outward: the trigger and the panel
 *   share the inner track (they do not overlap), then the item, then the accordion.
 *   THINGS GET RINGS, from the NEAREST gutter. The title and the description start at the card's
 *   inline-start edge, so their numbers do too; the chevron takes block-start, the one side where
 *   its leader does not cross the brackets.
 */
export const annotationAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("annotation.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "accordion",
      signature: "Accordion",
      children: [
        accordionSection(
          "envio",
          t("annotation.demoQuestion1"),
          t("annotation.demoDescription1"),
          t("annotation.demoAnswer1"),
          true,
        ),
        accordionSection(
          "devoluciones",
          t("annotation.demoQuestion2"),
          t("annotation.demoDescription2"),
          t("annotation.demoAnswer2"),
        ),
      ],
    },
    items: [
      {
        options: { for: ".sk-accordion", side: "inline-end", mark: "bracket" },
        slots: { children: "sk-accordion" },
      },
      { options: { for: ".sk-tile", side: "inline-end", mark: "bracket" }, slots: { children: "sk-tile" } },
      {
        options: { for: ".sk-tile__trigger", side: "inline-end", mark: "bracket" },
        slots: { children: "sk-tile__trigger" },
      },
      /*
       * THE TWO PARTS HERE THAT ARE NOT BOXES, and they are the pair of text runs: the title and the
       * description. Every other name on this diagram points at something with its own surface and
       * its own padding (a card, a button, a panel), where a ring drawn just inside the edge sits in
       * that padding and touches nothing. A line of text has no padding at all, its box IS the
       * glyphs, so the same inset ring lands on them and reads as a rule struck through the words.
       * Both go outside; nothing else on this diagram does.
       */
      {
        options: {
          for: ".sk-tile__title",
          side: "inline-start",
          ringPlacement: "offset",
          ringDistance: 4,
        },
        slots: { children: "sk-tile__title" },
      },
      {
        options: {
          for: ".sk-tile__description",
          side: "inline-start",
          ringPlacement: "offset",
          ringDistance: 4,
        },
        slots: { children: "sk-tile__description" },
      },
      {
        options: { for: ".sk-tile__chevron", side: "block-start" },
        slots: { children: "sk-tile__chevron" },
      },
      {
        options: { for: ".sk-tile__expandable-content", side: "inline-end", mark: "bracket" },
        slots: { children: "sk-tile__expandable-content" },
      },
    ],
  },
});

/*
 * The four gutters, on a specimen small enough that all four fit on screen at once.
 *
 * `ringPlacement: "offset"`, and this demo is the reason the option exists. Every part of a `Stat`
 * is one line of text in a small box, so a ring drawn just INSIDE those boxes lands on the glyphs
 * and reads as a box ruled over the word rather than a mark around it. There is air between these
 * parts, so the ring can go outside, where it belongs. A dense composition (the Accordion above)
 * wants the opposite, which is why this is a decision and not a constant.
 */
export const annotationSidesTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: {
    ...anatomyCanvas(t),
    label: t("annotation.sidesLabel"),
    inert: true,
    ringPlacement: "offset",
    ringDistance: 4,
  },
  slots: {
    ...anatomyHints(t),
    /* The four sides demo is also where the key is shown, because it is the diagram on this page
       with a number on every side: the corner it uses is visibly the one nothing else reaches. */
    key: "sk-stat = " + t("annotation.keyMeaning"),
    subject: {
      contract: "stat",
      signature: "Stat",
      slots: {
        label: t("annotation.statLabel"),
        value: "38.2K",
        change: t("annotation.statChange"),
      },
      options: { trend: "up" },
    },
    items: [
      { options: { for: ".sk-stat", side: "block-start" }, slots: { children: "sk-stat" } },
      { options: { for: ".sk-stat__label", side: "inline-start" }, slots: { children: "sk-stat__label" } },
      { options: { for: ".sk-stat__value", side: "inline-end" }, slots: { children: "sk-stat__value" } },
      { options: { for: ".sk-stat__change", side: "block-end" }, slots: { children: "sk-stat__change" } },
    ],
  },
});

/*
 * Every other demo on this page names singular parts: one root, one trigger, one panel. A breadcrumb
 * has none of those. `sk-breadcrumb__item` is not the first crumb, it is ALL of the visible ones.
 * Ringing the leftmost and leaving the rest bare would be saying something false about the part,
 * which is why `match: "all"` exists: one entry, and a bubble of its own for each thing the name
 * covers, every one of them wearing the entry's number.
 *
 * The narrow specimen also collapses its middle ancestors. That state has one singular part:
 * `sk-breadcrumb__collapse-trigger`. It sits beside the repeated visible items, which makes the
 * contrast between a plural part and its one disclosure control explicit in the same drawing.
 *
 * `sk-breadcrumb__current` stays singular on purpose, and the contrast is the point of putting it
 * in the same drawing: a trail has exactly one current page, so that name IS singular and its
 * single bubble says so. Two kinds of name, told apart by how many times a number appears.
 */
export const annotationPluralTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: {
    ...anatomyCanvas(t),
    label: t("annotation.pluralLabel"),
    inert: true,
    ringPlacement: "offset",
    ringDistance: 3,
  },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "breadcrumb",
      signature: "Breadcrumb",
      options: {
        label: t("annotation.crumbNav"),
        collapsedLabel: t("annotation.crumbCollapsed"),
      },
      slots: {
        items: [
          { options: { href: "/" }, slots: { label: t("annotation.crumb1") } },
          { options: { href: "/c" }, slots: { label: t("annotation.crumb2") } },
          { options: { href: "/c/p" }, slots: { label: t("annotation.crumb3") } },
          { options: { href: "/c/p/l" }, slots: { label: t("annotation.crumb4") } },
          { options: { current: true }, slots: { label: t("annotation.crumb5") } },
        ],
      },
    },
    items: [
      {
        options: { for: ".sk-breadcrumb__item", side: "block-start", match: "all" },
        slots: { children: "sk-breadcrumb__item" },
      },
      {
        options: { for: ".sk-breadcrumb__collapse-trigger", side: "inline-start" },
        slots: { children: "sk-breadcrumb__collapse-trigger" },
      },
      {
        options: { for: ".sk-breadcrumb__separator", side: "block-end", match: "all" },
        slots: { children: "sk-breadcrumb__separator" },
      },
      {
        options: { for: ".sk-breadcrumb__current", side: "inline-end" },
        slots: { children: "sk-breadcrumb__current" },
      },
    ],
  },
});

/*
 * THE KNEE, and the first version of this demo did not produce one.
 *
 * Four List rows 48px apart, numbered from the side, is not a hard case: an 18px bubble plus a 6px
 * gap needs 24, so every number sat level with its own row and every leader came out as one straight
 * segment. The demo claimed a knee and drew four ruler lines.
 *
 * Side BY SIDE is what forces it. Four chips in a row share one y, so all four numbers want the same
 * millimetre of one gutter, the distribution has to fan them out, and then every leader but the one
 * that happened to land level has to turn to get back. Which is the whole claim: it turns ONCE, at
 * 45 degrees, and never twice.
 */
export const annotationElbowTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("annotation.elbowLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "layout",
      signature: "Inline",
      /*
       * `lg`, not `sm`, and it is the ring that decides it. Each ring is drawn just outside its
       * chip's own box, so chips packed `sm` apart leave the two outlines touching and the reader
       * cannot tell where one mark ends and the next begins. A diagram wants at least twice the ring
       * offset between siblings.
       */
      options: { gap: "lg" },
      children: [
        { contract: "badge", signature: "Badge", options: { tone: "accent" }, children: t("annotation.chip1") },
        { contract: "badge", signature: "Badge", options: { tone: "success" }, children: t("annotation.chip2") },
        { contract: "badge", signature: "Badge", options: { tone: "warning" }, children: t("annotation.chip3") },
        { contract: "badge", signature: "Badge", options: { tone: "danger" }, children: t("annotation.chip4") },
      ],
    },
    items: [
      {
        options: { for: ".sk-badge:nth-child(1)", side: "inline-start" },
        slots: { children: ":nth-child(1)" },
      },
      {
        options: { for: ".sk-badge:nth-child(2)", side: "inline-start" },
        slots: { children: ":nth-child(2)" },
      },
      /*
       * FOUR BEFORE THREE, and the inversion is the point rather than a slip.
       *
       * Four numbers that want the same millimetre are fanned out in AUTHORING order (the
       * distribution sorts by desired position and ties break on index, `distributeLanes`), so the
       * order they are written in is the order they end up down the gutter. In the `inline-end`
       * gutter the nearest target is the LAST chip, so listing the third first put the far number
       * nearest the frame and crossed the two leaders over each other. Nearest target, nearest
       * number: nothing crosses.
       */
      {
        options: { for: ".sk-badge:nth-child(4)", side: "inline-end" },
        slots: { children: ":nth-child(4)" },
      },
      {
        options: { for: ".sk-badge:nth-child(3)", side: "inline-end" },
        slots: { children: ":nth-child(3)" },
      },
    ],
  },
});

/*
 * AN ANATOMY OF AN ANATOMY: a small Annotated (a button with one named part) is the subject, and
 * the outer drawing names what the inner one is made of: the figure, its canvas, the subject, the
 * numbered bubble an item becomes, and the legend. The rings and leaders themselves are drawn into
 * an SVG overlay the size of the frame, so ringing them would ring the whole drawing; the page
 * names them in words.
 */
export const annotationSelfAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("annotation.selfAnatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "annotation",
      signature: "Annotated",
      options: { ...anatomyCanvas(t), label: t("annotation.selfAnatomyInnerLabel"), inert: true, fitOnly: true },
      attrs: { style: "inline-size: 20rem;" },
      slots: {
        ...anatomyHints(t),
        subject: { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("annotation.selfAnatomyButton") },
        items: [namePart(".sk-button", "block-start", { mark: "bracket" })],
      },
    },
    items: [
      namePart(".sk-annotated-figure", "inline-start", { mark: "bracket" }),
      namePart(".sk-canvas", "inline-start", { mark: "bracket" }),
      namePart(".sk-annotated__subject", "inline-end", { ringPlacement: "offset", ringDistance: 6, ringRadius: 12 }),
      /* The whole annotation, not only its bubble: an item is the bubble AND the bracket the enhancer
         draws for it (a `path.sk-annotated__leader` in the inner overlay). The ring is drawn around
         that path and pushed out far enough to take in the bubble sitting on it, so it circles the
         two together; the legend still calls it what it is authored as. */
      {
        options: {
          for: ".sk-annotated__subject .sk-annotated__leader",
          side: "block-start",
          match: "first",
          ringPlacement: "offset",
          ringDistance: 18,
          ringRadius: 6,
        },
        slots: { children: "sk-annotation" },
      },
      namePart(".sk-annotated__legend", "inline-start", { mark: "bracket" }),
      namePart(".sk-annotated__legend-item", "block-end", { match: "first", ringPlacement: "offset", ringDistance: 6 }),
    ],
  },
});

/* The inner legend's items fill their grid cells, so a label pointing at one would land in the
   middle of an empty row. Shrunk to their content, which is what they look like, the leader meets
   the entry itself.

   The inner frame's gutters are sized to what each side holds, and its one label leaves a gutter on
   the start side only, which pushed the button off centre. Two equal outer tracks centre it; this
   specimen only, since a real diagram's gutters should stay as wide as their labels. */
export const annotationSelfAnatomyCss = `${annotationDemoCss}

.sk-annotated__subject .sk-annotated__legend-item {
  inline-size: fit-content;
}

.sk-annotated__subject .sk-annotated {
  grid-template-columns: minmax(0, 1fr) minmax(0, auto) minmax(0, 1fr);
}

/* The inner figure counts in Roman numerals, so its "I" can never be mistaken for the outer drawing's 1. */
.sk-annotated__subject .sk-annotated > .sk-annotation::before {
  content: counter(sk-annotation, upper-roman);
}

.sk-annotated__subject .sk-annotated__legend-item::before {
  content: counter(sk-annotation-legend, upper-roman);
}`;
