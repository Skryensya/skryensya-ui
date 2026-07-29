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
  },

  signatures: {
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
      options: [],
      parents: ["TableRow"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "td", part: "cell", host: true, slot: "children" },
      react: { from: "@skryensya/react/table", name: "TableCell" },
    },
  },
} as const satisfies ComponentContract;
