import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * DESCRIPTION LIST, pairs of a name and its value.
 *
 * WHAT MAKES IT DIFFERENT FROM A TABLE, and the only question worth asking before reaching for it:
 * a table is a grid, where a cell means something because of the row AND the column it is in. Here
 * there is one axis. A summary of one order, the metadata of one document, the specs of one
 * product: each row is a complete statement on its own, and nothing is being compared across rows.
 * Two orders side by side is a Table; one order's details is this.
 *
 * THE GROUP ELEMENT IS NOT DECORATION. HTML allows (and, for anything but the simplest list,
 * expects) a `<div>` around each `<dt>`/`<dd>` pair inside a `<dl>`, and that element is what makes
 * a row addressable: it is what a divider hangs off, what a two-column layout is drawn on, and what
 * keeps a name beside its own value when the list wraps. Without it the pair exists only in
 * document order, and every layout has to be drawn on a shared grid that both halves opt into
 * separately.
 *
 * THE COLUMN LAYOUT IS DRAWN PER ROW, NOT ON ONE SHARED GRID, which is why the term column is a
 * LENGTH (`--sk-description-list-term-size`) rather than `max-content`. A shared grid would let the
 * widest term size the column for everybody, but it needs each group to be `display: contents`,
 * which takes the pairing element back out of the box tree - the same element this contract just
 * said is the thing that makes a row addressable, and whose removal has a long history of dropping
 * `dl` semantics in shipping browsers. A hook a consumer can turn is the cheaper half of that trade.
 */
export const descriptionListParts = {
  root: "sk-description-list",
  /** One pair. The `<div>` HTML allows inside `<dl>`, and what a row is drawn on. */
  group: "sk-description-list__group",
  term: "sk-description-list__term",
  details: "sk-description-list__details",
} as const;

export type DescriptionListPart = keyof typeof descriptionListParts;
export type DescriptionListPartClass = (typeof descriptionListParts)[DescriptionListPart];

export const descriptionListContract = {
  id: "description-list",
  category: "data",
  css: "@skryensya/core/components/description-list.css",
  parts: descriptionListParts,
  hooks: [
    "--sk-description-list-details-fg",
    "--sk-description-list-divider-color",
    "--sk-description-list-pair-gap",
    "--sk-description-list-row-gap",
    "--sk-description-list-row-padding-y",
    "--sk-description-list-term-fg",
    "--sk-description-list-term-font-size",
    "--sk-description-list-term-font-weight",
    /** The width of the name column in the `columns` layout. A length, deliberately: see the file header. */
    "--sk-description-list-term-size",
  ],

  options: {
    /**
     * `stacked` puts the value under its name, which is the shape that survives any width and any
     * length of name. `columns` puts them side by side, which is faster to scan and only works
     * while the names are short enough to share one column; below the breakpoint it falls back to
     * stacked on its own, because a two-character column is not a layout.
     */
    layout: { type: "enum", values: ["stacked", "columns"], default: "stacked", attr: "data-layout" },
    /** Rules between rows. Off by default: a list of four facts does not need ruling. */
    dividers: { type: "boolean", default: false, attr: "data-dividers", trueValue: "" },
    /** Tighter rows, for a list that is reference material rather than reading. */
    density: { type: "enum", values: ["compact"], attr: "data-density" },
  },

  signatures: {
    DescriptionList: {
      intent: ["name-value-pairs", "metadata", "summary-of-one-record", "specs", "key-facts"],
      host: { element: "dl" },
      options: ["layout", "dividers", "density"],
      slots: { children: { accepts: "signature", required: true, of: ["DescriptionItem"] } },
      template: { element: "dl", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/description-list", name: "DescriptionList" },
    },

    DescriptionItem: {
      intent: ["one-name-and-its-value", "one-row-of-metadata"],
      host: { element: "div" },
      parents: ["DescriptionList"],
      options: [],
      slots: {
        /** The name. Text, because a name that needed markup is a heading and this is not a section. */
        term: { accepts: "text", required: true },
        /** The value. A node: a date, a Tag, a link, a short list of them. */
        children: { accepts: "node", required: true },
      },
      template: {
        element: "div",
        part: "group",
        host: true,
        children: [
          { element: "dt", part: "term", slot: "term" },
          { element: "dd", part: "details", slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/description-list", name: "DescriptionItem" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated: a hand-written union here would be a second place the values live. */
export type DescriptionListLayout = OptionValue<typeof descriptionListContract.options.layout>;
export type DescriptionListDensity = OptionValue<typeof descriptionListContract.options.density>;
