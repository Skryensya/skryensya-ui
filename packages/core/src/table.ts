import type { ComponentContract } from "./contract.js";

export const tableParts = {
  scroll: "sk-table-scroll",
  root: "sk-table",
  caption: "sk-table__caption",
  head: "sk-table__head",
  foot: "sk-table__foot",
  body: "sk-table__body",
  row: "sk-table__row",
  header: "sk-table__header",
  cell: "sk-table__cell",
} as const;

export type TablePart = keyof typeof tableParts;
export type TablePartClass = (typeof tableParts)[TablePart];

/*
 * The composition where ORDER and CARDINALITY finally matter.
 *
 * HTML fixes both, and neither is a presence check: a `<caption>` must be the table's first child and
 * there may be at most one, a `<tbody>` is required, and a `<tfoot>` written before the body is markup
 * the parser silently relocates. Get it wrong and the page looks fine while a screen reader announces
 * the table's name after its contents.
 *
 * The scroll wrapper is separate on purpose: a table that overflows needs a scrolling ancestor, and
 * that ancestor needs `tabindex` to be reachable by keyboard — which is a property of the wrapper,
 * not of the table, so it is its own signature rather than an option.
 */
export const tableContract = {
  id: "table",
  css: "@skryensya/core/components/table.css",
  parts: tableParts,

  options: {
    /** Header cells scope their column by default; a row header says so explicitly. */
    scope: { type: "enum", values: ["col", "row"], default: "col", attr: "scope" },
    /**
     * The first column stays put while the rest scrolls sideways. For a table whose rows are
     * identified by that column — a service name, a plan — where losing it mid-scroll leaves a row
     * of numbers about nothing.
     */
    stickyColumn: { type: "boolean", default: false, attr: "data-sticky-column", trueValue: "" },
    /** The header row stays put while the body scrolls down. For a table longer than the viewport. */
    stickyHeader: { type: "boolean", default: false, attr: "data-sticky-header", trueValue: "" },
    /*
     * How many columns a cell spans. The one place a table's structure is a NUMBER, and it is real
     * structure: a footnote under a three-column table belongs across all three, and a note stranded
     * in the first column reads as a value of that column.
     *
     * The DOM spells it `colspan` and React spells it `colSpan`, which is exactly what `prop` is for.
     */
    colspan: { type: "number", attr: "colspan", prop: "colSpan" },
  },

  signatures: {
    /*
     * The box a table scrolls inside, and it is not optional decoration.
     *
     * A flex or grid parent defaults to `min-size: auto`, so a table wider than its column pushes
     * that column open and blows the surface it sits in. This is the element that shrinks instead
     * and owns the sideways scroll — which is why every table on the docs site already had one, in
     * hand-written markup, while the catalogue published a bare `<table>` that would overflow.
     *
     * The overflow lives here and NOT on `.sk-table`: browsers clip `<caption>` under
     * `overflow: hidden`, even though the caption box sits outside the table box in the CSS table
     * model. The border and the radius stay on the table for the same reason.
     *
     * A region that scrolls has to be reachable by keyboard, so a scrolling table wants
     * `tabindex="0"` and a name — but WHETHER it scrolls depends on the data and the viewport, and
     * the name has to point at the caption's generated id. Both are the author's, through `attrs`.
     */
    TableScroll: {
      intent: ["scrollable-table", "wide-table", "table-that-does-not-blow-the-layout"],
      host: { element: "div" },
      options: ["stickyColumn", "stickyHeader"],
      slots: { children: { accepts: "signature", of: ["Table"], required: true } },
      template: { element: "div", part: "scroll", host: true, slot: "children" },
      react: { from: "@skryensya/react/table", name: "TableScroll" },
    },

    Table: {
      intent: ["tabular-data", "rows-and-columns", "data-table", "comparison"],
      host: { element: "table" },
      options: [],
      slots: {
        children: {
          accepts: "signature",
          required: true,
          of: ["TableCaption", "TableHead", "TableBody", "TableFooter"],
          ordered: true,
          cardinality: {
            TableCaption: "optional",
            TableHead: "optional",
            TableBody: "one",
            TableFooter: "optional",
          },
        },
      },
      template: { element: "table", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/table", name: "Table" },
    },

    TableCaption: {
      intent: ["table-name", "what-this-table-shows"],
      host: { element: "caption" },
      options: [],
      parents: ["Table"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "caption", part: "caption", host: true, slot: "children" },
      react: { from: "@skryensya/react/table", name: "TableCaption" },
    },

    TableHead: {
      intent: ["column-headers"],
      host: { element: "thead" },
      options: [],
      parents: ["Table"],
      slots: { children: { accepts: "signature", required: true, of: ["TableRow"] } },
      template: { element: "thead", part: "head", host: true, slot: "children" },
      react: { from: "@skryensya/react/table", name: "TableHead" },
    },

    TableBody: {
      intent: ["table-rows", "the-data-itself"],
      host: { element: "tbody" },
      options: [],
      parents: ["Table"],
      slots: { children: { accepts: "signature", required: true, of: ["TableRow"] } },
      template: { element: "tbody", part: "body", host: true, slot: "children" },
      react: { from: "@skryensya/react/table", name: "TableBody" },
    },

    TableFooter: {
      intent: ["totals", "summary-row"],
      host: { element: "tfoot" },
      options: [],
      parents: ["Table"],
      slots: { children: { accepts: "signature", required: true, of: ["TableRow"] } },
      template: { element: "tfoot", part: "foot", host: true, slot: "children" },
      react: { from: "@skryensya/react/table", name: "TableFooter" },
    },

    TableRow: {
      intent: ["one-record", "one-row"],
      host: { element: "tr" },
      options: [],
      parents: ["TableHead", "TableBody", "TableFooter"],
      slots: { children: { accepts: "signature", required: true, of: ["TableHeader", "TableCell"] } },
      template: { element: "tr", part: "row", host: true, slot: "children" },
      react: { from: "@skryensya/react/table", name: "TableRow" },
    },

    TableHeader: {
      intent: ["column-header", "row-header"],
      host: { element: "th" },
      options: ["scope"],
      parents: ["TableRow"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "th", part: "header", host: true, slot: "children" },
      react: { from: "@skryensya/react/table", name: "TableHeader" },
    },

    TableCell: {
      intent: ["one-value", "table-cell"],
      host: { element: "td" },
      options: ["colspan"],
      parents: ["TableRow"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "td", part: "cell", host: true, slot: "children" },
      react: { from: "@skryensya/react/table", name: "TableCell" },
    },
  },
} as const satisfies ComponentContract;
