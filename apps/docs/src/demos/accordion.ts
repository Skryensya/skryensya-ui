import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
  options: { label: t("accordion.nativeAnatomyLabel"), inert: true },
  slots: {
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
        options: { for: ".sk-details-group", side: "block-start" },
        slots: { children: "sk-details-group" },
      },
      { options: { for: ".sk-details", side: "inline-start" }, slots: { children: "sk-details" } },
      {
        options: { for: ".sk-details__summary", side: "inline-start" },
        slots: { children: "sk-details__summary" },
      },
      {
        options: { for: ".sk-details__indicator", side: "inline-end" },
        slots: { children: "sk-details__indicator" },
      },
      {
        options: { for: ".sk-details__content", side: "block-end" },
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
