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
 * One slot of the nav, keyed so a render can tell "the same control, moved" from "a different
 * control": `paginationRange`'s window slides by one on every prev/next click, so the button
 * IN the window a moment ago is usually still in it, and destroying it anyway is what this key
 * is for.
 */
type NavKey = "previous" | "next" | `page:${number}` | `ellipsis:${number}`;

/** Reused across renders: what this nav currently shows, by key. */
type NavNode = Map<NavKey, HTMLElement>;

/**
 * Patches `nav` toward `desired`, in order, reusing an existing element wherever its key already
 * has one instead of tearing it down and rebuilding it.
 *
 * `insertBefore`/`append` on a node already in the document MOVE it; per the DOM spec, moving an
 * element never blurs it. That is the whole fix: the button the reader just clicked, or tabbed
 * to, survives the render that follows its own click instead of being destroyed and replaced,
 * which used to drop focus to `<body>` on every single page change.
 */
function reconcileNav(
  nav: HTMLElement,
  nodes: NavNode,
  desired: readonly { key: NavKey; build: () => HTMLElement; update: (el: HTMLElement) => void }[],
): void {
  let previousEl: HTMLElement | null = null;

  for (const entry of desired) {
    const el = nodes.get(entry.key) ?? entry.build();
    entry.update(el);

    const wantsToFollow = previousEl ? previousEl.nextElementSibling !== el : nav.firstElementChild !== el;
    if (wantsToFollow) nav.insertBefore(el, previousEl ? previousEl.nextSibling : nav.firstChild);

    nodes.set(entry.key, el);
    previousEl = el;
  }

  const desiredKeys = new Set(desired.map((entry) => entry.key));
  for (const [key, el] of nodes) {
    if (desiredKeys.has(key)) continue;
    el.remove();
    nodes.delete(key);
  }
}

/**
 * Paginate authored table rows inside `[data-sk-table-pager]`.
 *
 * Owns showing/hiding `[data-sk-table-pager-row]`, reconciling the `[data-sk-table-pager-nav]`
 * toward `paginationRange` (see {@link reconcileNav}), and filling an optional status node.
 * Page size comes from `data-page-size` on the root, or from a nested Select via
 * `sk-value-change`. Does not invent the table or the picker.
 *
 * The nav's own button set is genuinely computed, not authored (the contract marks `page`,
 * `total` and `siblings` `computedInput`, exactly because there is nothing left to author once
 * they are known): React renders the same list from the same inputs on every render, this is
 * vanilla's equivalent, done incrementally instead of by full rebuild.
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
  const sizeMenu = root.querySelector<HTMLElement>("[data-sk-select]");
  const previousLabel = root.getAttribute("data-previous-label") || "Previous page";
  const nextLabel = root.getAttribute("data-next-label") || "Next page";
  const pageLabel = root.getAttribute("data-page-label") || "Page";
  const statusTemplate =
    root.getAttribute("data-status-template") || "{start}–{end} of {total}";
  const siblings = Math.max(0, Number(root.getAttribute("data-siblings") ?? "1") || 1);

  let page = Math.max(1, Number(root.getAttribute("data-page") ?? "1") || 1);
  let pageSize = readPageSize(root, sizeMenu);

  // What the nav currently shows, by key. Read and written only by `render`, across every call.
  const navNodes: NavNode = new Map();

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

    const desired: { key: NavKey; build: () => HTMLElement; update: (el: HTMLElement) => void }[] = [
      {
        key: "previous",
        build: () => {
          const previous = document.createElement("button");
          previous.type = "button";
          previous.className = `${paginationParts.previous} sk-interactive`;
          previous.innerHTML = previousIconHtml;
          previous.addEventListener("click", () => {
            page -= 1;
            render();
            emit();
          });
          return previous;
        },
        update: (el) => {
          el.setAttribute("aria-label", previousLabel);
          (el as HTMLButtonElement).disabled = page <= 1;
        },
      },
    ];

    for (const [index, slot] of slots.entries()) {
      if (slot === "ellipsis") {
        desired.push({
          key: `ellipsis:${index}`,
          build: () => {
            const ellipsis = document.createElement("span");
            ellipsis.className = paginationParts.ellipsis;
            ellipsis.setAttribute("aria-hidden", "true");
            ellipsis.textContent = "…";
            return ellipsis;
          },
          update: () => {},
        });
        continue;
      }

      desired.push({
        key: `page:${slot}`,
        build: () => {
          const item = document.createElement("button");
          item.type = "button";
          item.className = `${paginationParts.item} sk-interactive`;
          item.textContent = String(slot);
          item.addEventListener("click", () => {
            page = slot;
            render();
            emit();
          });
          return item;
        },
        update: (el) => {
          el.setAttribute("aria-label", `${pageLabel} ${slot}`);
          if (slot === page) el.setAttribute("aria-current", "page");
          else el.removeAttribute("aria-current");
        },
      });
    }

    desired.push({
      key: "next",
      build: () => {
        const next = document.createElement("button");
        next.type = "button";
        next.className = `${paginationParts.next} sk-interactive`;
        next.innerHTML = nextIconHtml;
        next.addEventListener("click", () => {
          page += 1;
          render();
          emit();
        });
        return next;
      },
      update: (el) => {
        el.setAttribute("aria-label", nextLabel);
        (el as HTMLButtonElement).disabled = page >= pageCount;
      },
    });

    reconcileNav(nav, navNodes, desired);
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
