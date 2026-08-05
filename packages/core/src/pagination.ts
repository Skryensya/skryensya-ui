import type { ComponentContract } from "./contract.js";

/*
 * PAGINATION, move through a paged result set one page at a time.
 *
 * The visible page window is the interesting part, so it lives here as a pure function: first and
 * last are always shown, the current page keeps a sibling on each side, and gaps collapse to an
 * ellipsis. Rendering and the click handlers are the binding's job.
 *
 * Table pager attrs name the vanilla composition that wires rows + this range into a `.sk-pagination`
 * nav; paint stays on table and pagination CSS.
 */
export const paginationParts = {
  root: "sk-pagination",
  item: "sk-pagination__item",
  previous: "sk-pagination__previous",
  next: "sk-pagination__next",
  ellipsis: "sk-pagination__ellipsis",
} as const;

export type PaginationPart = keyof typeof paginationParts;
export type PaginationPartClass = (typeof paginationParts)[PaginationPart];

/** Data attributes the vanilla table-pager enhancer binds to. */
export const tablePagerAttrs = {
  root: "data-sk-table-pager",
  row: "data-sk-table-pager-row",
  nav: "data-sk-table-pager-nav",
  status: "data-sk-table-pager-status",
} as const;

export type TablePagerAttr = keyof typeof tablePagerAttrs;
export type TablePagerAttrName = (typeof tablePagerAttrs)[TablePagerAttr];

/** Layout parts for the table + pager composition (see patterns/table-pager.css). */
export const tablePagerParts = {
  root: "sk-table-pager",
  bar: "sk-table-pager__bar",
  size: "sk-table-pager__size",
  end: "sk-table-pager__end",
  status: "sk-table-pager__status",
  nav: paginationParts.root,
} as const;
export type TablePagerPart = keyof typeof tablePagerParts;
export type TablePagerPartClass = (typeof tablePagerParts)[TablePagerPart];

/** A slot in the rendered pager: a real page number, or a collapsed run of pages. */
export type PaginationSlot = number | "ellipsis";

/**
 * Build the page window for `page` within `[1, total]`. `siblings` is how many pages sit on each
 * side of the current one. First and last page are always present; runs longer than one hidden page
 * collapse to "ellipsis". Returns [] when there is nothing (or one page) to paginate.
 */
export function paginationRange(page: number, total: number, siblings = 1): PaginationSlot[] {
  if (!Number.isFinite(total) || total <= 1) return [];
  const current = Math.min(Math.max(Math.trunc(page), 1), total);
  const start = Math.max(current - siblings, 1);
  const end = Math.min(current + siblings, total);

  const pages: number[] = [1];
  for (let p = start; p <= end; p++) if (p !== 1 && p !== total) pages.push(p);
  if (total > 1) pages.push(total);

  const slots: PaginationSlot[] = [];
  let previous = 0;
  for (const p of pages) {
    if (p - previous > 1) slots.push("ellipsis");
    slots.push(p);
    previous = p;
  }
  return slots;
}

/**
 * Moving through a paged result set.
 *
 * Which page numbers are visible is COMPUTED, not authored: it follows from the current page, the
 * total and how many siblings stay on each side. An author who typed the window could type one that
 * skips a page, and holding that invariant is exactly what a contract is for, so the template names
 * `paginationRange` above and the entries come out of it.
 *
 * A gap is an entry with no page. That is what tells the two shapes apart in the template, the same
 * way a breadcrumb tells a link from the page you are already on.
 */
export const paginationContract = {
  id: "pagination",
  css: "@skryensya/core/components/pagination.css",
  parts: paginationParts,

  options: {
    /** The page being shown. One-based, because that is what the numbers on screen say. */
    page: { type: "number", default: 1, attr: "data-page", computedInput: true },
    total: { type: "number", default: 1, attr: "data-total", computedInput: true },
    /** How many pages stay visible on each side of the current one. */
    siblings: { type: "number", default: 1, attr: "data-siblings", computedInput: true },
    /** The landmark's accessible name. A page can hold more than one nav, so it needs one. */
    label: { type: "string", default: "Pagination", attr: "aria-label" },
    /* The two arrows are icon-only, so these ARE their accessible names: each lands on its own
       node, which is why one attribute can serve both. */
    previousLabel: { type: "string", default: "Previous page", attr: "aria-label" },
    nextLabel: { type: "string", default: "Next page", attr: "aria-label" },
  },

  signatures: {
    Pagination: {
      intent: ["pagination", "pager", "page-numbers", "next-previous"],
      host: { element: "nav" },
      options: ["page", "total", "siblings", "label", "previousLabel", "nextLabel"],
      slots: {},
      template: {
        element: "nav",
        part: "root",
        host: true,
        children: [
          {
            element: "button",
            part: "previous",
            also: ["sk-interactive"],
            options: ["previousLabel"],
            attrs: { type: "button" },
            // There is no page before the first one. React already refuses the click; without this
            // the authored markup offered a control that cannot do anything, and said so to a
            // screen reader.
            attrsWhen: [{ option: "page", equals: "1", attrs: { disabled: "" } }],
            children: [{ element: "span", attrs: { "data-sk-icon": "chevron-left", "data-sk-icon-size": "sm" } }],
          },
          /*
           * One entry, two shapes, and they have to interleave: 1 … 3 4 5 … 12 is the window, not
           * every gap followed by every page. So the window is walked ONCE by a node that adds no
           * box, and the two shapes sit inside it: a gap carries no page, so exactly one of them
           * renders per entry.
           */
          {
            repeatComputed: { window: "pagination-range", from: ["page", "total", "siblings"], key: "page" },
            children: [
              {
                element: "span",
                part: "ellipsis",
                whenItemMissing: "page",
                attrs: { "aria-hidden": "true" },
                text: "…",
              },
              {
                element: "button",
                part: "item",
                also: ["sk-interactive"],
                whenItemGiven: "page",
                attrs: { type: "button" },
                // Which page you are on is a fact of the nav, marked on the one entry that matches.
                selectedBy: { option: "page", attr: "aria-current", value: "page" },
                itemSlot: "label",
              },
            ],
          },
          {
            element: "button",
            part: "next",
            also: ["sk-interactive"],
            options: ["nextLabel"],
            attrs: { type: "button" },
            // And none after the last, which is `page === total`: a comparison between two options.
            attrsWhen: [{ option: "page", equalsOption: "total", attrs: { disabled: "" } }],
            children: [{ element: "span", attrs: { "data-sk-icon": "chevron-right", "data-sk-icon-size": "sm" } }],
          },
        ],
      },
      react: { from: "@skryensya/react/pagination", name: "Pagination" },
    },
  },
} as const satisfies ComponentContract;

/**
 * The authored table + page-size control + generated pagination bar. The table remains the Table
 * contract; this family owns only the composition and the enhancer attachment points.
 */
export const tablePagerContract = {
  id: "table-pager",
  css: "@skryensya/core/patterns/table-pager.css",
  parts: tablePagerParts,

  options: {
    pageSize: { type: "number", default: 10, attr: "data-page-size", machineInput: true },
    page: { type: "number", default: 1, attr: "data-page", machineInput: true },
    siblings: { type: "number", default: 1, attr: "data-siblings", machineInput: true },
    statusTemplate: {
      type: "string",
      default: "{start}–{end} of {total}",
      attr: "data-status-template",
      machineInput: true,
    },
    previousLabel: {
      type: "string",
      default: "Previous page",
      attr: "data-previous-label",
      machineInput: true,
    },
    nextLabel: {
      type: "string",
      default: "Next page",
      attr: "data-next-label",
      machineInput: true,
    },
    pageLabel: {
      type: "string",
      default: "Page",
      attr: "data-page-label",
      machineInput: true,
    },
    navLabel: { type: "string", default: "Pagination", attr: "aria-label" },
  },

  signatures: {
    TablePager: {
      intent: ["paged-table", "table-with-page-size", "client-side-table-pagination"],
      host: { element: "div" },
      options: [
        "pageSize",
        "page",
        "siblings",
        "statusTemplate",
        "previousLabel",
        "nextLabel",
        "pageLabel",
      ],
      slots: {
        children: {
          accepts: "signature",
          of: ["TableScroll", "TablePagerBar"],
          required: true,
        },
      },
      mount: tablePagerAttrs.root,
      template: {
        element: "div",
        part: "root",
        host: true,
        slot: "children",
      },
      react: { from: "@skryensya/react/pagination", name: "TablePager" },
    },

    TablePagerBar: {
      intent: ["table-pagination-controls", "table-pager-bar"],
      host: { element: "div" },
      parents: ["TablePager"],
      options: [],
      slots: {
        children: {
          accepts: "signature",
          of: ["TablePagerSize", "TablePagerEnd"],
          required: true,
        },
      },
      template: { element: "div", part: "bar", host: true, slot: "children" },
      react: { from: "@skryensya/react/pagination", name: "TablePagerBar" },
    },

    TablePagerSize: {
      intent: ["page-size-control", "rows-per-page-control"],
      host: { element: "div" },
      parents: ["TablePagerBar"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "size", host: true, slot: "children" },
      react: { from: "@skryensya/react/pagination", name: "TablePagerSize" },
    },

    TablePagerEnd: {
      intent: ["table-pager-status-and-navigation", "pager-end-controls"],
      host: { element: "div" },
      parents: ["TablePagerBar"],
      options: [],
      slots: {
        children: {
          accepts: "signature",
          of: ["TablePagerStatus", "TablePagerNav"],
          required: true,
        },
      },
      template: { element: "div", part: "end", host: true, slot: "children" },
      react: { from: "@skryensya/react/pagination", name: "TablePagerEnd" },
    },

    TablePagerStatus: {
      intent: ["visible-row-range", "table-page-status"],
      host: { element: "div" },
      parents: ["TablePagerEnd"],
      options: [],
      slots: { children: { accepts: "text", required: true } },
      template: {
        element: "div",
        part: "status",
        host: true,
        mount: tablePagerAttrs.status,
        slot: "children",
      },
      react: { from: "@skryensya/react/pagination", name: "TablePagerStatus" },
    },

    TablePagerNav: {
      intent: ["generated-table-pagination", "table-page-navigation"],
      host: { element: "nav" },
      parents: ["TablePagerEnd"],
      options: ["navLabel"],
      slots: {},
      template: {
        element: "nav",
        part: "nav",
        host: true,
        mount: tablePagerAttrs.nav,
      },
      react: { from: "@skryensya/react/pagination", name: "TablePagerNav" },
    },
  },
} as const satisfies ComponentContract;
