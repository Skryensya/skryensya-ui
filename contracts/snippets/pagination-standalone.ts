import type { Snippet } from "./snippet.js";

export const paginationStandaloneSnippet: Snippet = {
  id: "pagination-standalone",
  level: "component",
  intent: "A page of results with correctly-typed page numbers, not strings that happen to look numeric.",
  notes: [
    "`page`, `total` and `siblings` are NUMBERS in the tree (`options: { page: 3, total: 9 }`), not " +
      "quoted strings — the contract's own type is `number`, and the composition side of this MCP " +
      "server used to reject every numeric option server-wide (a real bug, fixed): a snippet that " +
      "quoted these would still validate against the OLD broken schema and teach the wrong habit " +
      "going forward.",
    "No children, no slots: `Pagination`'s own template computes its page-number buttons FROM " +
      "`page`/`total`/`siblings` (`repeatComputed` in get_contract) — there is nothing here for a " +
      "consumer to author by hand, unlike a collection like Tabs' `items`.",
  ],
  tree: {
    contract: "pagination",
    signature: "Pagination",
    options: { page: 3, total: 9, siblings: 1 },
  },
};
