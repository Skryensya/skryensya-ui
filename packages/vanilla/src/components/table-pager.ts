import { paginationParts, paginationRange, tablePagerAttrs } from "@skryensya/core/pagination";
import { remountIcons } from "../icon.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

type Cleanup = () => void;

const rootSelector = `[${tablePagerAttrs.root}]`;
const rowSelector = `[${tablePagerAttrs.row}]`;
const navSelector = `[${tablePagerAttrs.nav}]`;
const statusSelector = `[${tablePagerAttrs.status}]`;

const previousIconHtml =
  '<span data-sk-icon="chevron-left" data-sk-icon-size="sm"></span>';
const nextIconHtml =
  '<span data-sk-icon="chevron-right" data-sk-icon-size="sm"></span>';

export type TablePagerChangeDetail = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  start: number;
  end: number;
};

export const mountTablePager = createConnectMount({
  key: "table-pager",
  rootSelector,
  connect: connectTablePager,
});

/**
 * Paginate authored table rows inside `[data-sk-table-pager]`.
 *
 * Owns showing/hiding `[data-sk-table-pager-row]`, rebuilding the empty
 * `[data-sk-table-pager-nav]` from `paginationRange`, and filling an optional status node.
 * Page size comes from `data-page-size` on the root, or from a nested Flyout/Select via
 * `sk-value-change`. Does not invent the table or the picker.
 *
 * Chevron placeholders are injected as `data-sk-icon` and hydrated via `remountIcons` when the
 * app already called `mountIcons` (ADR-15: set stays explicit on the app side).
 */
export function connectTablePager(root: HTMLElement): Cleanup {
  const nav = root.querySelector<HTMLElement>(navSelector);
  if (!nav) {
    throw new Error(`[${tablePagerAttrs.root}] needs a [${tablePagerAttrs.nav}] (.sk-pagination).`);
  }

  const status = root.querySelector<HTMLElement>(statusSelector);
  const sizeMenu = root.querySelector<HTMLElement>("[data-sk-select], [data-sk-flyout]");
  const previousLabel = root.getAttribute("data-previous-label") || "Previous page";
  const nextLabel = root.getAttribute("data-next-label") || "Next page";
  const pageLabel = root.getAttribute("data-page-label") || "Page";
  const statusTemplate =
    root.getAttribute("data-status-template") || "{start}–{end} of {total}";
  const siblings = Math.max(0, Number(root.getAttribute("data-siblings") ?? "1") || 1);

  let page = Math.max(1, Number(root.getAttribute("data-page") ?? "1") || 1);
  let pageSize = readPageSize(root, sizeMenu);

  const render = () => {
    const rows = [...root.querySelectorAll<HTMLTableRowElement>(rowSelector)];
    const total = rows.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
    page = Math.min(Math.max(page, 1), pageCount);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);

    rows.forEach((row, index) => {
      row.hidden = index < startIndex || index >= endIndex;
    });

    root.setAttribute("data-page", String(page));
    root.setAttribute("data-page-size", String(pageSize));

    if (status) {
      status.textContent = statusTemplate
        .replaceAll("{start}", String(total === 0 ? 0 : startIndex + 1))
        .replaceAll("{end}", String(endIndex))
        .replaceAll("{total}", String(total));
    }

    const slots = paginationRange(page, pageCount, siblings);
    nav.replaceChildren();

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = `${paginationParts.previous} sk-interactive`;
    previous.setAttribute("aria-label", previousLabel);
    previous.disabled = page <= 1;
    previous.innerHTML = previousIconHtml;
    previous.addEventListener("click", () => {
      page -= 1;
      render();
      emit();
    });
    nav.append(previous);

    for (const [index, slot] of slots.entries()) {
      if (slot === "ellipsis") {
        const ellipsis = document.createElement("span");
        ellipsis.className = paginationParts.ellipsis;
        ellipsis.setAttribute("aria-hidden", "true");
        ellipsis.textContent = "…";
        ellipsis.dataset.gap = String(index);
        nav.append(ellipsis);
        continue;
      }

      const item = document.createElement("button");
      item.type = "button";
      item.className = `${paginationParts.item} sk-interactive`;
      item.setAttribute("aria-label", `${pageLabel} ${slot}`);
      if (slot === page) item.setAttribute("aria-current", "page");
      item.textContent = String(slot);
      item.addEventListener("click", () => {
        page = slot;
        render();
        emit();
      });
      nav.append(item);
    }

    const next = document.createElement("button");
    next.type = "button";
    next.className = `${paginationParts.next} sk-interactive`;
    next.setAttribute("aria-label", nextLabel);
    next.disabled = page >= pageCount;
    next.innerHTML = nextIconHtml;
    next.addEventListener("click", () => {
      page += 1;
      render();
      emit();
    });
    nav.append(next);

    remountIcons(nav);
  };

  const emit = () => {
    const rows = root.querySelectorAll(rowSelector).length;
    const pageCount = Math.max(1, Math.ceil(rows / pageSize) || 1);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, rows);
    const detail: TablePagerChangeDetail = {
      page,
      pageSize,
      pageCount,
      total: rows,
      start: rows === 0 ? 0 : startIndex + 1,
      end: endIndex,
    };
    root.dispatchEvent(new CustomEvent("sk-table-pager-change", { bubbles: true, detail }));
  };

  const onSizeChange = ((event: CustomEvent<{ value: string[] }>) => {
    const next = Number(event.detail.value[0]);
    if (!Number.isFinite(next) || next <= 0) return;
    pageSize = next;
    page = 1;
    render();
    emit();
  }) as EventListener;

  sizeMenu?.addEventListener("sk-value-change", onSizeChange);
  const cleanups: Cleanup[] = [() => sizeMenu?.removeEventListener("sk-value-change", onSizeChange)];

  render();

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

function readPageSize(root: HTMLElement, sizeMenu: HTMLElement | null): number {
  const fromSelect = Number(sizeMenu?.dataset.value);
  if (Number.isFinite(fromSelect) && fromSelect > 0) return fromSelect;
  const fromRoot = Number(root.getAttribute("data-page-size") ?? "10");
  return Number.isFinite(fromRoot) && fromRoot > 0 ? fromRoot : 10;
}
