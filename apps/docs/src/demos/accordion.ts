import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints } from "./annotation-parts";

/*
 * The three accordions on the page, from one composition written once.
 *
 * Each trigger is `TileContent` (title over description) plus `TileChevron` (the disclosure mark).
 * Both were blocked until recently: the chevron was a declared part no template painted, so every
 * demo hand-wrote the same nine lines twice, as an HTML string and as JSX, and they had already
 * drifted: the authored HTML carried `data-part="chevron"` and the React half did not.
 *
 * The runtime section's second paragraph names a path, and it is `Code`, a signature that did not
 * exist when this file was first written. Converting the page had to drop the monospace because
 * `typography` had no inline-code part at all; publishing one is what let the sentence come back
 * whole. `Strong` was the nearest thing available and it is the wrong claim: a path is not emphasis.
 */

/** One section: the trigger's copy and mark, then the body. */
const item = (t: Translate, value: string): UsageTree => ({
  contract: "accordion",
  signature: "Accordion.Item",
  options: { value },
  children: [
    {
      contract: "accordion",
      signature: "Accordion.Trigger",
      children: [
        {
          contract: "tile",
          signature: "TileContent",
          slots: {
            title: t(`demo.accordion.${value}.title` as never),
            description: t(`demo.accordion.${value}.description` as never),
          },
        },
        { contract: "tile", signature: "TileChevron" },
      ],
    },
    {
      contract: "accordion",
      signature: "Accordion.Content",
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t(`demo.accordion.${value}.p1` as never),
            },
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children:
                value === "runtime"
                  ? [
                      t("demo.accordion.runtime.p2a"),
                      {
                        contract: "typography",
                        signature: "Code",
                        children: t("demo.accordion.runtime.p2code"),
                      },
                      t("demo.accordion.runtime.p2b"),
                    ]
                  : t(`demo.accordion.${value}.p2` as never),
            },
          ],
        },
      ],
    },
  ],
});

const deployment = ["runtime", "rollout", "rollback"];

/** One section on its own: the smallest thing an accordion can be. */
export const accordionSingleTree = (t: Translate): UsageTree => ({
  contract: "accordion",
  signature: "Accordion",
  options: { type: "single", collapsible: true },
  children: [item(t, "environment")],
});

/** Three sections, one open at a time: what `type: "single"` buys. */
export const accordionExclusiveTree = (t: Translate): UsageTree => ({
  contract: "accordion",
  signature: "Accordion",
  options: { type: "single", collapsible: true },
  children: deployment.map((value) => item(t, value)),
});

/** The same three, any number open at once. */
export const accordionMultipleTree = (t: Translate): UsageTree => ({
  contract: "accordion",
  signature: "Accordion",
  options: { type: "multiple" },
  children: deployment.map((value) => item(t, value)),
});

/*
 * THE NATIVE HALF'S OWN ANATOMY, because the diagram above it draws the other one.
 *
 * `annotationAnatomyTree` (demos/annotation.ts) is an Accordion: it names `sk-accordion`, `sk-tile`
 * and the five Tile parts inside a section. Every one of those belongs to the machine-driven
 * signatures. Since Details moved into this contract, the Reference tab lists eight signatures over
 * a drawing that covers four, and the `sk-details*` classes  -  a genuinely different anatomy, not a
 * skin of the same one  -  had no picture at all.
 *
 * TWO SECTIONS, NOT ONE, and the first is open: `sk-details-group` only means something across
 * siblings (it is the box a shared `name` coordinates), and `::details-content` has no box at all
 * while the disclosure is closed, so a ring drawn around `sk-details__content` on a shut `<details>`
 * would have nothing to enclose. The open one carries the content label; the closed one is what
 * makes the group's own label true.
 *
 * `ringPlacement: "offset"` on the summary's text for the reason the Accordion diagram states at
 * length: a line of text has no padding, so an inset ring lands on the glyphs and reads as a strike
 * through them. Everything else here is a real box with padding of its own.
 */
export const detailsAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("accordion.nativeAnatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "accordion",
      signature: "DetailsGroup",
      children: ["runtime", "rollout"].map((value, i) => ({
        contract: "accordion",
        signature: "Details",
        options: { name: "anatomy", ...(i === 0 ? { open: true } : {}) },
        children: [
          {
            contract: "accordion",
            signature: "Details.Summary",
            /*
             * TITLE AND DESCRIPTION, the same pair the live demo below this diagram composes, and
             * the reason it is spelled out rather than shortened to a heading: drawn with only a
             * title, beside an Accordion diagram that labels `sk-tile__title` AND
             * `sk-tile__description`, this reads as "the native one cannot carry a description".
             * It can. `.sk-details__summary` is a two-column grid (content, indicator), so the
             * content column takes whatever you put there.
             *
             * NEITHER LINE GETS A LABEL, and that is the honest difference between the two halves.
             * Tile NAMES its title and description, so the Accordion diagram can point at them.
             * `detailsParts` names five parts and none of them is inside the summary: what goes
             * there is your own composition, not a part of this anatomy. An unlabelled pair says
             * that better than a missing one.
             */
            /*
             * NO WRAPPER, and that is the contract talking: `<summary>` holds phrasing content and
             * headings only, so the `Stack` that used to group these two was a `<div>` in a place
             * HTML does not allow one  -  which is now a `content-model` error rather than something
             * that quietly shipped. The heading is legal here (HTML lets a summary intermix heading
             * content); the description is a `Text` rendered as a `<span>`. `details.css` sends both
             * to the summary's first column, so they stack without a box to hold them.
             */
            children: [
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h3", flush: true },
                children: t(`demo.accordion.${value}.title` as never),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary", textElement: "span" },
                children: t(`demo.accordion.${value}.description` as never),
              },
            ],
          },
          {
            contract: "accordion",
            signature: "Details.Content",
            children: {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t(`demo.accordion.${value}.p1` as never),
            },
          },
        ],
      })),
    },
    items: [
      {
        options: { for: ".sk-details-group", mark: "bracket", side: "inline-end" },
        slots: { children: "sk-details-group" },
      },
      {
        options: { for: ".sk-details", mark: "bracket", side: "inline-end" },
        slots: { children: "sk-details" },
      },
      {
        options: { for: ".sk-details__summary", mark: "bracket", side: "inline-end" },
        slots: { children: "sk-details__summary" },
      },
      {
        options: { for: ".sk-details__indicator", side: "block-start" },
        slots: { children: "sk-details__indicator" },
      },
      {
        options: { for: ".sk-details__content", mark: "bracket", side: "inline-end" },
        slots: { children: "sk-details__content" },
      },
    ],
  },
});

/*
 * THE PLATFORM'S OWN VERSION, for the same three sections.
 *
 * Siblings sharing a `name` make the BROWSER keep one open, which is what the coordinator above
 * does with a machine. Putting them side by side is the page's whole argument: the choice is not
 * about capability, it is about who owns the behaviour. Both halves now ANIMATE  -  `details.css`
 * transitions `::details-content` behind `@supports (interpolate-size: allow-keywords)`  -  so what
 * is actually left to choose is CONTROL: an open set driven from outside, a `valueChange` to listen
 * to, a section you can disable. Neither is the lesser one, which is why they are one contract.
 *
 * `Details` composes `Details.Summary` and `Details.Content` as children, the same shape
 * `ExpandableTile` already uses, with no `summary` prop hiding that structure. The summary's own
 * content is a bare `Heading` + `Text`, not `TileContent`: that molecule is Tile's, and Details
 * has never had a Tile inside it, only Tile's PAINT (shared tokens, same look). The disclosure mark
 * is baked into `Details.Summary` itself now, not composed. See the contract.
 */
/*
 * THE TWO ANATOMIES ON THIS PAGE, ONE WIDTH. Both specimens are sections of a group with a question,
 * a description and an answer, and drawn side by side in the same tab they should read as the same
 * object twice. Left to their content they did not: the Accordion's tiles took their titles' width
 * (358px) while an open Details stretched its paragraph across the frame (531px), and the native half
 * looked like a bigger component. One explicit measure for both subjects, on this page only.
 */
export const accordionAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > :is(.sk-accordion, .sk-details-group) {
  inline-size: 24rem;
}`;

export const detailsGroupTree = (t: Translate): UsageTree => ({
  contract: "accordion",
  signature: "DetailsGroup",
  attrs: { "aria-label": t("demo.accordion.detailsLabel") },
  children: deployment.map((value, i) => ({
    contract: "accordion",
    signature: "Details",
    options: { name: "deployment", ...(i === 0 ? { open: true } : {}) },
    children: [
      {
        contract: "accordion",
        signature: "Details.Summary",
        /* No wrapper: see the anatomy tree above. A `<summary>` holds phrasing content and headings
           only, so these two are direct children and `details.css` stacks them in its first column. */
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h3", flush: true },
            children: t(`demo.accordion.${value}.title` as never),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { tone: "secondary", textElement: "span" },
            children: t(`demo.accordion.${value}.description` as never),
          },
        ],
      },
      {
        contract: "accordion",
        signature: "Details.Content",
        children: {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: t(`demo.accordion.${value}.p1` as never),
        },
      },
    ],
  })),
});

/*
 * WHICH HALF TO USE, AS A DECISION TREE.
 *
 * The six rows this replaced were a lookup table: six criteria, two answers, and no order between
 * them, which leaves the reader to do the reduction. There is an order, it is two questions deep,
 * and this is the smallest drawing that carries it.
 *
 * THE LIST LIVES IN THE PARAGRAPH ABOVE AND THE DRAWING ASKS ABOUT IT. Four shapes were tried with
 * the four capabilities inside the drawing - four condition boxes, a record with four rows, a five
 * rung ladder, and a bus with four taps - and each of them cost more than it bought: the wires had
 * to pass boxes they did not belong to, or the box read as a data model, or the drawing grew to
 * nine hundred pixels to say two things. A rhombus is only as wide as the diamond is at that line,
 * so a question in one has to be short; a list belongs in prose, where a list already is.
 *
 * THE JAVASCRIPT QUESTION COMES FIRST, and asking it second was a real mistake rather than a
 * layout preference. Asked second, its `yes` arm says: you need something only the machine does,
 * and you cannot run the machine, so use the one that does not do it. That is not an answer, it is
 * a contradiction dressed as one. Asked FIRST it is simply true - before the script runs the
 * platform is the only thing that exists - and the reader who also needed something from the list
 * learns it there, in the paragraph under the drawing, instead of being walked into a wall.
 *
 * THE LAYOUT SURVIVED THE SWAP unchanged, which is worth noting because it did not have to: the
 * question that spans both columns is whichever one is asked first, the other takes one column, and
 * the wire that skips it runs down the other. Both paths that end at the platform still land on the
 * same pill, and no wire passes a box it does not belong to.
 *
 * ONE `Accordion` AND ONE `DetailsGroup`: both paths that end at the platform land on the same
 * pill. Neither name is translated - they are the names of two signatures, written the way a reader
 * will type them.
 */
export const accordionChoiceCss = `.sk-diagram {
  /*
   * THE CAP IS OFF THE SPANNING QUESTION. 16rem is the page default and it was capping the first
   * rhombus at 256px inside a rank 340px wide, so the question was squeezed into two lines that
   * reached its own slopes while eighty pixels of the rank stood empty. A diamond gets wider before
   * it gets taller.
   */
  --sk-diagram-node-max-inline-size: 22rem;
  /*
   * Every edge is labelled, and a chip is 28px tall: at the stylesheet's own rank gap that leaves
   * about twelve pixels for the arrowhead and its standoff, and each label welds itself to the box
   * below it. Same number and same reason as the branch demos on the Diagram page.
   */
  --sk-diagram-row-gap: 3rem;
  /*
   * HOW A QUESTION FITS ITS RHOMBUS, measured rather than guessed. The text is a rectangle and the
   * shape is a diamond, so the rectangle fits when "w / W + h / H <= 1" - the inscribed-rectangle
   * rule - and it fits COMFORTABLY at about 0.8, which is where the corners of the words stop
   * running along the slopes. Both of these sat at 0.97, which is the arithmetic for "just barely",
   * and is exactly what it looked like.
   *
   * The lever is the diamond's height, because its width is its column: a flatter ratio is a
   * tighter fit and a rounder one is a looser one. These two numbers are the ones that put both
   * questions near 0.8 with the words they actually carry.
   */
  --sk-diagram-decision-aspect: 1.9;
}

/*
 * A RANK HERE IS A QUESTION AND AN ANSWER, not two boxes of the same kind, so the answer keeps its
 * own height instead of stretching to the rhombus beside it. Stretching is right for a rank of
 * siblings - the stylesheet says why - and wrong for a pill standing next to a diamond: measured at
 * a 180px rank, "DetailsGroup" came out a 180px circle.
 */
.sk-diagram__node[data-shape="terminal"] {
  align-self: center;
}

/*
 * THE PLATFORM'S ANSWER SITS BESIDE THE SECOND QUESTION, not under it, and that placement is what
 * keeps all four wires short: both paths that end there arrive from a different direction, so being
 * level with the second question turns one of them into a sideways step across one rank instead of
 * a run down the length of the drawing.
 */
.sk-diagram__node[data-node="nojs"] {
  grid-area: 1 / 1 / 2 / 3;
  /*
   * FLATTER THAN THE OTHER ONE, because it is twice as wide. A rhombus takes its height from its
   * width, so the question that lies across both columns came out the tallest thing on the drawing
   * while holding a single line of text.
   */
  --sk-diagram-decision-aspect: 2.3;
}
.sk-diagram__node[data-node="needs"] {
  grid-area: 2 / 1;
  /*
   * ONE COLUMN WIDE, so its words are what had to give. Flattening or rounding it does not help on
   * its own: the shape's inline padding is derived from the ratio, so a rounder diamond is also a
   * wider text box and the fit stays where it was. A shorter question is the only lever that moves
   * both terms of the sum at once, and the list it points at is three lines above it.
   */
  --sk-diagram-decision-aspect: 1.6;
}
.sk-diagram__node[data-node="native"] { grid-area: 2 / 2; }
.sk-diagram__node[data-node="machine"] { grid-area: 3 / 1; }`;

export const accordionChoiceTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("accordion.choiceDiagramLabel"), columns: 2 },
  slots: {
    nodes: [
      {
        options: { node: "needs", shape: "decision" },
        slots: { children: t("accordion.choiceAskNeeds") },
      },
      {
        options: { node: "nojs", shape: "decision" },
        slots: { children: t("accordion.choiceAskNoJs") },
      },
      { options: { node: "machine", shape: "terminal" }, slots: { children: "Accordion" } },
      { options: { node: "native", shape: "terminal" }, slots: { children: "DetailsGroup" } },
    ],
    edges: [
      /* The veto, and it ends the walk: before the script runs there is nothing else to choose. */
      { options: { from: "nojs", to: "native" }, slots: { children: t("accordion.choiceYes") } },
      { options: { from: "nojs", to: "needs" }, slots: { children: t("accordion.choiceNo") } },
      { options: { from: "needs", to: "machine" }, slots: { children: t("accordion.choiceYes") } },
      { options: { from: "needs", to: "native" }, slots: { children: t("accordion.choiceNo") } },
    ],
  },
});
