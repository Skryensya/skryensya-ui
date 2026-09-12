import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart, type AnnotationPartItem } from "./annotation-parts";

/*
 * THE ANATOMY OF A LAYOUT PRIMITIVE IS THE SPACE IT MAKES, and that is why these six diagrams are
 * shaped differently from every other one on the site.
 *
 * Every component diagram so far names PARTS: a trigger, a panel, a row, each one an element the
 * contract renders and a consumer can select. A layout primitive renders exactly one element and
 * gives it exactly one class. Ring that and the drawing says "this box is called sk-stack", which
 * the page's first heading already said. There is nothing else to point at, because the second
 * thing in the box is not the contract's: it is whatever the author put there.
 *
 * So the drawing points at the space instead, and the way to draw a space is with the two edges
 * that make it. Ringing the container AND ringing each child leaves the gap between the rings, so
 * a reader sees the number `data-gap` is naming rather than reading its name: the band between the
 * outer ring and the first inner one is the padding, the band between two inner ones is the gap.
 * Nothing about that is a metaphor; those bands ARE the tokens, drawn at whatever value the
 * specimen asked for.
 *
 * `> *` IS THE HONEST NAME for the second label, and it is worth saying out loud rather than
 * inventing a class for the demo. A layout's children carry nothing: no part class, no data
 * attribute, no requirement beyond being an element. A label reading `sk-stack > *` says exactly
 * that, and a reader who takes the selector away with them has something true; a label reading
 * "item" or "sk-stack__item" would be teaching a part that does not exist.
 */

/* The children every one of these specimens is filled with: enough box to have an edge, and no
   meaning of its own, because the diagram is about the space around it and not about what is in
   it. `surface`/`border` rather than a bare div so each child HAS a visible edge for its ring to
   sit just inside of. */
const cell = (t: Translate, key: "cellA" | "cellB" | "cellC"): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "sm" },
  children: t(`demo.layoutAnatomy.${key}` as never),
});

const frame = (
  t: Translate,
  label: string,
  subject: UsageTree,
  items: readonly AnnotationPartItem[],
): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t(label as never), inert: true },
  slots: { subject, items: [...items] },
});

/*
 * BOX: the band between the two rings is `data-padding`, drawn once on all four sides, which is the
 * one thing this primitive does. The child is a single line of text so the band around it is even.
 */
export const boxAnatomyTree = (t: Translate): UsageTree =>
  frame(
    t,
    "box.anatomyLabel",
    {
      contract: "box",
      signature: "Box",
      options: { surface: "sunken", border: "subtle", padding: "lg" },
      children: cell(t, "cellA"),
    },
    [
      namePart(".sk-box", "inline-start"),
      /* The nested Box is itself a `.sk-box`, so the selector has to say CHILD or `match: "all"`
         would ring the container a second time from inside its own label. */
      namePart(".sk-box > *", "inline-end", { match: "all" }),
    ],
  );

/*
 * STACK: two bands of the same `data-gap`, between three children on one axis. Three and not two,
 * because two children make one gap and one gap reads as a coincidence of where the boxes happened
 * to land; the second one is what makes it a rhythm.
 */
export const stackAnatomyTree = (t: Translate): UsageTree =>
  frame(
    t,
    "stackPage.anatomyLabel",
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [cell(t, "cellA"), cell(t, "cellB"), cell(t, "cellC")],
    },
    [
      namePart(".sk-stack", "inline-start"),
      namePart(".sk-stack > *", "inline-end", { match: "all" }),
    ],
  );

/*
 * INLINE: the same drawing turned ninety degrees, which is the whole difference between the two
 * primitives. The labels move with it: naming a row of children from a side gutter would put one
 * leader across every box to reach the far one, so the children read from below and the container
 * from above.
 */
export const inlineAnatomyTree = (t: Translate): UsageTree =>
  frame(
    t,
    "inlinePage.anatomyLabel",
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "md" },
      children: [cell(t, "cellA"), cell(t, "cellB"), cell(t, "cellC")],
    },
    [
      namePart(".sk-inline", "block-start"),
      namePart(".sk-inline > *", "block-end", { match: "all" }),
    ],
  );

/*
 * GRID: `data-columns` is a count, so the drawing has to be countable. Three cells at
 * `columns: "3"` put one ring in each column, and the two vertical bands between them are the same
 * `data-gap` the Stack draws horizontally.
 */
export const gridAnatomyTree = (t: Translate): UsageTree =>
  frame(
    t,
    "grid.anatomyLabel",
    {
      contract: "layout",
      signature: "Grid",
      options: { gap: "md", columns: "3" },
      children: [cell(t, "cellA"), cell(t, "cellB"), cell(t, "cellC")],
    },
    [
      namePart(".sk-grid", "block-start"),
      namePart(".sk-grid > *", "block-end", { match: "all" }),
    ],
  );

/*
 * LAYOUT GRID: the one primitive here whose children ARE marked, and that is its anatomy. A direct
 * child opts into a measure with `data-width`, so this diagram names the attribute rather than the
 * element: one ring per marked child, and the unmarked one in between showing the default track a
 * child gets by saying nothing at all.
 */
export const layoutGridAnatomyTree = (t: Translate): UsageTree =>
  frame(
    t,
    "layoutGridPage.anatomyLabel",
    {
      contract: "layout",
      signature: "LayoutGrid",
      children: [
        {
          contract: "box",
          signature: "Box",
          attrs: { "data-width": "narrow" },
          options: { surface: "surface", border: "subtle", padding: "sm" },
          children: t("demo.layoutAnatomy.narrow"),
        },
        cell(t, "cellB"),
        {
          contract: "box",
          signature: "Box",
          attrs: { "data-width": "breakout" },
          options: { surface: "surface", border: "subtle", padding: "sm" },
          children: t("demo.layoutAnatomy.breakout"),
        },
      ],
    },
    [
      /*
       * BOTH LABELS IN THE BLOCK GUTTERS, which is not a preference here but the only arrangement
       * that works. This specimen has to FILL the frame (`layoutAnatomyFillCss`) or every track
       * resolves against the width of its own contents and `narrow`, the default and `breakout` all
       * come out the same size, which is the one distinction the drawing exists to make. An inline
       * label takes its own `auto` track out of that width, and measured, that is enough: at 604px
       * of subject the three measures collapse back to one number again.
       *
       * The cost is the one leader that passes through the middle row on its way to the top one.
       * Worth it: a reader who follows it finds a ring at the end, while three identical rows would
       * have made the label itself a lie.
       */
      namePart(".sk-layout-grid", "block-start"),
      namePart(".sk-layout-grid > [data-width]", "block-end", { match: "all" }),
    ],
  );

/*
 * WRAPPER: the only specimen here that has to FILL the stage, and `layoutAnatomyFillCss` is why it
 * gets its own sheet. Every other frame on the site sizes its middle track to the specimen, which
 * is what keeps a label beside the thing it names; a Wrapper sized to its contents is a Wrapper
 * with its one job hidden, since the measure only shows as the difference between the column and
 * the room it was offered. Filling the subject is safe here and nowhere else: both labels read from
 * the block gutters, so no inline gutter gets squeezed by it.
 *
 * What the drawing then says, outside in: the air on either side of the outer ring is what
 * `data-size` gave back, the outer ring is the column at its measure, and the band inside it is the
 * wrapper's own `padding-inline`, which is the part people forget it has.
 */
export const layoutAnatomyFillCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

/* See the note on \`wrapperAnatomyTree\`: the subject takes the frame's full width so the column's
   measure has something to be narrower THAN.

   BOTH declarations, because either alone does nothing. The frame's middle track is \`auto\`, so a
   subject asking for 100% of an auto track is still asking for 100% of its own content; the track
   has to be told to take the leftover room first. Safe here only because both labels read from the
   block gutters, so the two inline tracks it steals from are empty. */
.sk-annotated {
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.sk-annotated__subject {
  inline-size: 100%;
}`;

export const wrapperAnatomyTree = (t: Translate): UsageTree =>
  frame(
    t,
    "wrapperPage.anatomyLabel",
    {
      contract: "wrapper",
      signature: "Wrapper",
      /* NO inline width: an authored `inline-size: 100%` here would beat the stylesheet's own
         `min(100%, var(--sk-wrapper-max))` and the column would take the whole frame, which is the
         one thing this drawing exists to show it does not do. */
      options: { wrapperSize: "sm" },
      children: cell(t, "cellA"),
    },
    [
      namePart(".sk-wrapper", "block-start"),
      namePart(".sk-wrapper > *", "block-end", { match: "all" }),
    ],
  );
