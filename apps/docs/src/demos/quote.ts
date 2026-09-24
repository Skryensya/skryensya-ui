import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/** The figure, the blockquote inside it, and the caption that is deliberately outside it. */
export const quoteAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("quotePage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "quote",
      signature: "Quote",
      options: { cite: "https://example.org/cuadernos/06" },
      slots: {
        children: t("demo.quote.main.body"),
        attribution: t("demo.quote.main.attribution"),
        source: t("demo.quote.main.source"),
      },
    },
    items: [
      namePart(".sk-quote", "block-start", { mark: "bracket" }),
      namePart(".sk-quote__body", "inline-start", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-quote__attribution", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-quote__source", "block-end", { ringPlacement: "offset", ringDistance: 4 }),
    ],
  },
});

/*
 * THE CASE THE COMPONENT WAS BUILT FOR: a quotation inside a text, with a person and a work beside
 * it. The two fields are filled from different data on purpose - the name is a person, the cite is
 * the essay it came from - because that is the distinction the markup is making.
 */
export const quoteTree = (t: Translate): UsageTree => ({
  contract: "quote",
  signature: "Quote",
  options: { cite: "https://example.org/cuadernos/06" },
  slots: {
    children: t("demo.quote.main.body"),
    attribution: t("demo.quote.main.attribution"),
    source: t("demo.quote.main.source"),
  },
});

/** The same passage with nobody to credit: the caption does not render at all. */
export const quoteBareTree = (t: Translate): UsageTree => ({
  contract: "quote",
  signature: "Quote",
  slots: { children: t("demo.quote.anonymous.body") },
});

/*
 * PULL. Lifted out of the text to be read on its own, which is why it loses the rule instead of
 * gaining a bigger one: it is not inside anything any more.
 */
export const quotePullTree = (t: Translate): UsageTree => ({
  contract: "quote",
  signature: "Quote",
  options: { variant: "pull" },
  slots: {
    children: t("demo.quote.pull.body"),
    attribution: t("demo.quote.pull.attribution"),
  },
});

/*
 * A testimonial: the quotation is the content, and everything around it is the page's own voice.
 * Composed inside a Tile so the two are told apart by surface, not by quotation marks.
 */
export const quoteTestimonialTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", padding: "lg", border: "subtle" },
  children: [
    {
      contract: "quote",
      signature: "Quote",
      slots: {
        children: t("demo.quote.testimonial.body"),
        attribution: t("demo.quote.testimonial.attribution"),
        source: t("demo.quote.testimonial.source"),
      },
    },
  ],
});
