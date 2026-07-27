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
