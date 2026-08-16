import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { deploymentRows, pageSizeItems } from "./data/table";

/*
 * The deepest composition the catalogue has: eight signatures, nested four levels, with two rules
 * HTML fixes and nothing else in the model does: the caption comes first and there is at most one,
 * the body is required.
 *
 * Every table here is wrapped in a `TableScroll`, and that is not decoration this file added for
 * tidiness. A flex or grid parent defaults to `min-size: auto`, so a table wider than its column
 * pushes the column open and blows the surface it sits in. The hand-written examples this replaced
 * all had the wrapper; the CATALOGUE did not publish it, so an agent composing a Table got a bare
 * `<table>` that overflows. Converting this page is what surfaced that.
 */

/** A header row from a list of keys. Every table here starts with one, and none of them differ. */
const headerRow = (t: Translate, keys: readonly string[]): UsageTree => ({
  contract: "table",
  signature: "TableRow",
  children: keys.map((key) => ({
    contract: "table",
    signature: "TableHeader",
    children: t(key as never),
  })),
});

/**
 * A body row whose FIRST cell is a header.
 *
 * `scope="row"` is what makes the row's own name available to a screen reader when it reads a cell
 * further along: without it, "Activo" is announced as a word in a grid rather than as the status of
 * the Starter plan. It is the reason `scope` is an option at all.
 */
const labelledRow = (label: string, cells: readonly string[]): UsageTree => ({
  contract: "table",
  signature: "TableRow",
  children: [
    { contract: "table", signature: "TableHeader", options: { scope: "row" }, children: label },
    ...cells.map((cell) => ({ contract: "table", signature: "TableCell", children: cell })),
  ],
});

/**
 * The whole anatomy: caption, head, body, foot, in the order HTML requires and the contract
 * enforces. A `<tfoot>` written before the body is markup the parser silently moves, and the page
 * still looks right while a screen reader reads it out of sequence.
 */
export const tableTree = (t: Translate): UsageTree => ({
  contract: "table",
  signature: "TableScroll",
  children: {
    contract: "table",
    signature: "Table",
    children: [
      { contract: "table", signature: "TableCaption", children: t("demo.table.plans") },
      {
        contract: "table",
        signature: "TableHead",
        children: headerRow(t, ["demo.table.plan", "demo.table.usage", "demo.table.status"]),
      },
      {
        contract: "table",
        signature: "TableBody",
        children: [
          labelledRow(t("demo.table.starter"), [t("demo.table.starterUsage"), t("demo.table.active")]),
          labelledRow(t("demo.table.team"), [t("demo.table.teamUsage"), t("demo.table.trial")]),
        ],
      },
      /*
       * The note belongs across all three columns, not stranded in the first one where it reads as a
       * value of that column. `colspan` is the one place a table's structure is a number, and it
       * did not exist until this demo needed it, which is the useful half of converting a page.
       */
      {
        contract: "table",
        signature: "TableFooter",
        children: {
          contract: "table",
          signature: "TableRow",
          children: {
            contract: "table",
            signature: "TableCell",
            options: { colspan: 3 },
            children: t("demo.table.taxNote"),
          },
        },
      },
    ],
  },
});

/**
 * The first column stays put while the rest scrolls sideways.
 *
 * The scrolling box is a named, focusable region here and not in the demo above, and the difference
 * is real: this table is wider than its space by design, so it WILL scroll, and a region that
 * scrolls has to be reachable by keyboard. The name points at the caption, so the region announces
 * what it holds rather than "region".
 */
export const tableStickyColumnTree = (t: Translate): UsageTree => ({
  contract: "table",
  signature: "TableScroll",
  options: { stickyColumn: true },
  attrs: { role: "region", tabindex: "0", "aria-labelledby": "sk-demo-table-regions" },
  children: {
    contract: "table",
    signature: "Table",
    children: [
      {
        contract: "table",
        signature: "TableCaption",
        attrs: { id: "sk-demo-table-regions" },
        children: t("demo.table.regions"),
      },
      {
        contract: "table",
        signature: "TableHead",
        children: headerRow(t, [
          "demo.table.service",
          "demo.table.latency",
          "demo.table.errors",
          "demo.table.uptime",
        ]),
      },
      {
        contract: "table",
        signature: "TableBody",
        children: [
          labelledRow("API", ["82 ms", "0,1 %", "99,98 %"]),
          labelledRow("Worker", ["140 ms", "0,4 %", "99,90 %"]),
          labelledRow("Gateway", ["61 ms", "0,0 %", "99,99 %"]),
        ],
      },
    ],
  },
});

/**
 * `resizableColumns`, opt-in: a real WAI-ARIA APG "Window Splitter" separator between every pair of
 * column headers — the same shared `@skryensya/core/splitter` primitive Sidebar's own resize handle
 * and Treegrid's own column resizer already use. Requires `resizeLabel`, an a11y gate: a
 * binding-inserted separator has no author-supplied `label` slot to draw its own accessible name
 * from, unlike `SidebarResizeHandle`.
 */
export const tableResizableColumnsTree = (t: Translate): UsageTree => ({
  contract: "table",
  signature: "TableScroll",
  children: {
    contract: "table",
    signature: "Table",
    options: { resizableColumns: true, resizeLabel: t("demo.table.resizeLabel") },
    children: [
      { contract: "table", signature: "TableCaption", children: t("demo.table.regions") },
      {
        contract: "table",
        signature: "TableHead",
        children: headerRow(t, [
          "demo.table.service",
          "demo.table.latency",
          "demo.table.errors",
          "demo.table.uptime",
        ]),
      },
      {
        contract: "table",
        signature: "TableBody",
        children: [
          labelledRow("API", ["82 ms", "0,1 %", "99,98 %"]),
          labelledRow("Worker", ["140 ms", "0,4 %", "99,90 %"]),
          labelledRow("Gateway", ["61 ms", "0,0 %", "99,99 %"]),
        ],
      },
    ],
  },
});

/**
 * The header row stays put while the body scrolls down, the other axis, and the other reason to
 * lose your place: a long table whose column names have scrolled away is a grid of numbers.
 */
export const tableStickyHeaderTree = (t: Translate): UsageTree => ({
  contract: "table",
  signature: "TableScroll",
  options: { stickyHeader: true },
  attrs: { role: "region", tabindex: "0", "aria-labelledby": "sk-demo-table-deployments" },
  children: {
    contract: "table",
    signature: "Table",
    children: [
      {
        contract: "table",
        signature: "TableCaption",
        attrs: { id: "sk-demo-table-deployments" },
        children: t("demo.table.deployments"),
      },
      {
        contract: "table",
        signature: "TableHead",
        children: headerRow(t, ["demo.table.when", "demo.table.who", "demo.table.result"]),
      },
      {
        contract: "table",
        signature: "TableBody",
        children: [
          labelledRow("14:02", ["John Doe", t("demo.table.succeeded")]),
          labelledRow("13:47", ["Mateo Rivas", t("demo.table.succeeded")]),
          labelledRow("13:20", ["Elena Soto", t("demo.table.running")]),
          labelledRow("12:58", ["Nadia Kim", t("demo.table.succeeded")]),
        ],
      },
    ],
  },
});

/**
 * A table inside a Box, which is the composition every real page actually writes.
 *
 * It is here to prove the wrapper does its job: the Box is a grid parent, and this is precisely the
 * case where a table without a `TableScroll` pushes the surface open instead of scrolling inside it.
 */
export const tableInBoxTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "md" },
  children: tableTree(t),
});

function deploymentsTable(t: Translate, markPagerRows = false): UsageTree {
  return {
    contract: "table",
    signature: "TableScroll",
    children: {
      contract: "table",
      signature: "Table",
      children: [
        { contract: "table", signature: "TableCaption", children: t("demo.table.activity") },
        {
          contract: "table",
          signature: "TableHead",
          children: headerRow(t, [
            "demo.table.result",
            "demo.table.service",
            "demo.table.environment",
            "demo.table.status",
            "demo.table.when",
          ]),
        },
        {
          contract: "table",
          signature: "TableBody",
          children: deploymentRows.map(([id, service, environment, status, unit, amount]) => ({
            contract: "table",
            signature: "TableRow",
            attrs: markPagerRows ? { "data-sk-table-pager-row": "" } : {},
            children: [
              {
                contract: "table",
                signature: "TableHeader",
                options: { scope: "row" },
                children: id,
              },
              { contract: "table", signature: "TableCell", children: service },
              { contract: "table", signature: "TableCell", children: environment },
              {
                contract: "table",
                signature: "TableCell",
                children: t(`demo.table.${status}` as never),
              },
              {
                contract: "table",
                signature: "TableCell",
                children: t(
                  unit === "minutes" ? "demo.table.minutesAgo" : "demo.table.hoursAgo",
                  { n: amount },
                ),
              },
            ],
          })),
        },
      ],
    },
  };
}

export const tablePagerTree = (t: Translate): UsageTree => ({
  contract: "table-pager",
  signature: "TablePager",
  options: {
    pageSize: 5,
    statusTemplate: t("demo.table.range"),
    previousLabel: t("demo.table.previousPage"),
    nextLabel: t("demo.table.nextPage"),
    pageLabel: t("demo.table.page"),
  },
  children: [
    deploymentsTable(t, true),
    {
      contract: "table-pager",
      signature: "TablePagerBar",
      children: [
        {
          contract: "table-pager",
          signature: "TablePagerSize",
          children: {
            contract: "flyout",
            signature: "Flyout",
            options: { defaultValue: "5" },
            slots: { label: t("demo.table.rowsPerPage"), items: pageSizeItems },
          },
        },
        {
          contract: "table-pager",
          signature: "TablePagerEnd",
          children: [
            {
              contract: "table-pager",
              signature: "TablePagerStatus",
              children: t("demo.table.range", { start: "1", end: "5", total: "8" }),
            },
            {
              contract: "table-pager",
              signature: "TablePagerNav",
              options: { navLabel: t("demo.table.pagination") },
            },
          ],
        },
      ],
    },
  ],
});

export const tableDensityTree = (t: Translate, densityFactor: number): UsageTree => {
  const tree = deploymentsTable(t);
  return {
    ...tree,
    options: { density: 1, densityFactor },
  };
};
