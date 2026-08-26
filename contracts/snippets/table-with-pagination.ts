import type { Snippet } from "./snippet.js";

export const tableWithPaginationSnippet: Snippet = {
  id: "table-with-pagination",
  level: "molecule",
  intent: "A table too long to show all at once, with its pager underneath — two components, one job.",
  notes: [
    "The `Table` and the `Pagination` are NOT wired to each other by anything in the tree — nothing " +
      "in either contract makes a table \"paginated\" as a single unit. This molecule is the " +
      "PLACEMENT convention (a `Stack` holding the table then its pager, same gap rhythm as any " +
      "other stacked pair) plus a real, working `Pagination` under it; which rows the table actually " +
      "shows for the current page is application data, decided by whatever renders this tree, same " +
      "as any other table content.",
    "Every data row's FIRST cell is a `TableHeader` with `scope: \"row\"`, not a `TableCell` — that's " +
      "what gives each row an accessible name (\"row #1042\"), the same reason `TableCaption` names " +
      "the whole table. A table where every cell is a plain `TableCell` reads as an undifferentiated " +
      "grid of text to anyone navigating it by header.",
    "`Table`'s own `children` slot is ORDERED and typed by cardinality (`get_contract`: `TableCaption` " +
      "optional, `TableHead` optional, `TableBody` exactly one) — caption, then head, then body is " +
      "not a style choice this snippet made, it's the only order the contract accepts.",
  ],
  tree: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    children: [
      {
        contract: "table",
        signature: "Table",
        children: [
          { contract: "table", signature: "TableCaption", children: "Recent orders" },
          {
            contract: "table",
            signature: "TableHead",
            children: [
              {
                contract: "table",
                signature: "TableRow",
                children: [
                  { contract: "table", signature: "TableHeader", children: "Order" },
                  { contract: "table", signature: "TableHeader", children: "Status" },
                ],
              },
            ],
          },
          {
            contract: "table",
            signature: "TableBody",
            children: [
              {
                contract: "table",
                signature: "TableRow",
                children: [
                  {
                    contract: "table",
                    signature: "TableHeader",
                    options: { scope: "row" },
                    children: "#1042",
                  },
                  { contract: "table", signature: "TableCell", children: "Shipped" },
                ],
              },
              {
                contract: "table",
                signature: "TableRow",
                children: [
                  {
                    contract: "table",
                    signature: "TableHeader",
                    options: { scope: "row" },
                    children: "#1041",
                  },
                  { contract: "table", signature: "TableCell", children: "Processing" },
                ],
              },
            ],
          },
        ],
      },
      { contract: "pagination", signature: "Pagination", options: { page: 1, total: 5 } },
    ],
  },
};
