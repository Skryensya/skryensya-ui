import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * QUOTE, somebody else's words, and who said them.
 *
 * THE ANATOMY IS THE PLATFORM'S, NOT A PREFERENCE. HTML is explicit that the attribution of a
 * quotation does not belong inside `<blockquote>`: the element holds the quoted material and
 * nothing else, and the figure/figcaption pair is the spelling the spec itself gives for putting a
 * name beside it. So the root is a `<figure>` even when there is no attribution yet - one shape for
 * the component, rather than a root that changes element depending on whether a slot was filled,
 * which is a second structure for a consumer's CSS to know about.
 *
 * TWO FIELDS, BECAUSE THEY ARE TWO DIFFERENT FACTS, and this is the one thing about quotation
 * markup that is got wrong everywhere: `<cite>` is the title of a WORK, not the name of a person.
 * `attribution` is who said it and is plain text in the caption; `source` is what it appeared in
 * and is the `<cite>`. Writing a person's name in a `<cite>` is the mistake the split exists to
 * make impossible to fall into by accident.
 *
 * `cite` (the attribute) is a third thing again: the URL the quotation came from, on the
 * `<blockquote>` itself. It is not rendered by any browser, and this component does not render it
 * either - it is machine-readable provenance, and the visible link, if there should be one, is
 * written by the author inside `source`.
 */
export const quoteParts = {
  root: "sk-quote",
  body: "sk-quote__body",
  attribution: "sk-quote__attribution",
  /** The `<cite>`: the title of the work, never the name of the person. */
  source: "sk-quote__source",
} as const;

export type QuotePart = keyof typeof quoteParts;
export type QuotePartClass = (typeof quoteParts)[QuotePart];

export const quoteContract = {
  id: "quote",
  category: "content",
  css: "@skryensya/core/components/quote.css",
  parts: quoteParts,
  hooks: [
    "--sk-quote-attribution-fg",
    "--sk-quote-attribution-gap",
    "--sk-quote-attribution-font-size",
    "--sk-quote-fg",
    "--sk-quote-font-size",
    "--sk-quote-font-style",
    "--sk-quote-gap",
    "--sk-quote-line-height",
    /* The measure a quotation is read at. Narrower than the page's, which is the point of it. */
    "--sk-quote-measure",
    "--sk-quote-padding-inline",
    "--sk-quote-rule-color",
    "--sk-quote-rule-width",
    "--sk-quote-source-fg",
  ],

  options: {
    /**
     * How loudly it sits in the page.
     *
     * `block` is the ordinary quotation inside a text: a rule down its inline-start edge, at the
     * size of the prose around it. `pull` is the one lifted OUT of the text to be read on its own,
     * which is a different job and so is a different size, not a bigger version of the same thing:
     * no rule, display type, and it keeps its own line.
     */
    variant: { type: "enum", values: ["block", "pull"], default: "block", attr: "data-variant" },
    /**
     * The URL the quotation came from, written to `<blockquote cite>`. Machine-readable only: no
     * browser renders it, and neither does this component. A link a reader can follow goes in
     * `source`, as markup, where a reader can actually reach it.
     */
    cite: { type: "string", attr: "cite" },
  },

  signatures: {
    Quote: {
      intent: ["quotation", "blockquote", "testimonial", "pull-quote", "somebody-elses-words"],
      host: { element: "figure" },
      options: ["variant", "cite"],
      slots: {
        children: { accepts: "node", required: true },
        /**
         * WHO said it: a person, an organisation. Plain text in the caption, never the `<cite>`.
         *
         * Write the punctuation that follows it (`"Camila Rojas,"`) and not the space after it:
         * the caption is a flex row and supplies the space itself, which is what keeps the two
         * bindings from differing by one collapsed whitespace (see quote.css).
         */
        attribution: { accepts: "text" },
        /** WHAT it appeared in: the book, the talk, the page. This is the `<cite>`. */
        source: { accepts: "node" },
      },
      template: {
        element: "figure",
        part: "root",
        host: true,
        options: ["variant"],
        children: [
          /* `cite` lands HERE, not on the figure: it is the blockquote's own attribute, and on a
             figure it would be markup no parser reads as provenance. */
          { element: "blockquote", part: "body", options: ["cite"], slot: "children" },
          {
            element: "figcaption",
            part: "attribution",
            whenGiven: ["attribution", "source"],
            children: [
              /* No element of its own: the name is the caption's own text, and a span around it
                 would be a box with nothing to say. */
              { slot: "attribution" },
              { element: "cite", part: "source", whenGiven: "source", slot: "source" },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/quote", name: "Quote" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated: a hand-written union here would be a second place the values live. */
export type QuoteVariant = OptionValue<typeof quoteContract.options.variant>;
