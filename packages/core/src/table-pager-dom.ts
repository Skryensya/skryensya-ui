import { paginationParts, paginationRange, tablePagerAttrs, tablePagerEvents, tablePagerParts } from "./pagination.js";
import { selectEvents } from "./select.js";

/*
 * TABLE PAGER, the DOM half both bindings run.
 *
 * It lived in `@skryensya/vanilla` alone, and the React `TablePager` rendered the same shell with
 * nothing behind it: in a React app the rows never paged. The behaviour is DOM through and through
 * (rows it did not render, a nav it fills), so it moved here the way `toolbarStops` did, and each
 * binding supplies only what differs: how a chevron is drawn.
 *
 * The rows are every `<tr>` of the table's `<tbody>`. They used to have to carry
 * `data-sk-table-pager-row`, an attribute the contract never mentioned, so a table composed from a
 * tree paged nothing.
 */
type Cleanup = () => void;

export type TablePagerDomOptions = {
  /** Inner HTML for the previous (`left`) and next (`right`) buttons. Defaults to icon placeholders. */
  readonly chevron?: (direction: "left" | "right") => string;
  /** Runs after every render with the nav, e.g. to hydrate icon placeholders. */
  readonly afterRender?: (nav: HTMLElement) => void;
};

const rowSelector = "table > tbody > tr";
const navSelector = `[${tablePagerAttrs.nav}]`;
const statusSelector = `[${tablePagerAttrs.status}]`;

export type TablePagerChangeDetail = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  start: number;
  end: number;
};

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
 * Owns showing/hiding the rows of `table > tbody`, reconciling the `[data-sk-table-pager-nav]`
 * toward `paginationRange` (see {@link reconcileNav}), and filling an optional status node.
 * Page size comes from `data-page-size` on the root, or from a nested Select via
 * its `selectEvents.valueChange`. Does not invent the table or the picker.
 *
 * The nav's own button set is genuinely computed, not authored (the contract marks `page`,
 * `total` and `siblings` `computedInput`, exactly because there is nothing left to author once
 * they are known): React renders the same list from the same inputs on every render, this is
 * vanilla's equivalent, done incrementally instead of by full rebuild.
 *
 * Chevron placeholders are injected as `data-sk-icon` and hydrated via `remountIcons` when the
 * app already called `mountIcons` (ADR-19: set stays explicit on the app side).
 */
export function connectTablePager(root: HTMLElement, options: TablePagerDomOptions = {}): Cleanup {
  const chevron = options.chevron ?? ((direction) => `<span data-sk-icon="chevron-${direction}" data-sk-icon-size="sm"></span>`);
  const nav = root.querySelector<HTMLElement>(navSelector);
  if (!nav) {
    throw new Error(`[${tablePagerAttrs.root}] needs a [${tablePagerAttrs.nav}] (.sk-pagination).`);
  }

  const status = root.querySelector<HTMLElement>(statusSelector);
  const sizeControl = root.querySelector<HTMLElement>(`.${tablePagerParts.size}`);
  const previousLabel = root.getAttribute("data-previous-label") || "Previous page";
  const nextLabel = root.getAttribute("data-next-label") || "Next page";
  const pageLabel = root.getAttribute("data-page-label") || "Page";
  const statusTemplate =
    root.getAttribute("data-status-template") || "{start}–{end} of {total}";
  const siblings = Math.max(0, Number(root.getAttribute("data-siblings") ?? "1") || 1);

  let page = Math.max(1, Number(root.getAttribute("data-page") ?? "1") || 1);
  let pageSize = readPageSize(root, sizeControl);

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
          previous.innerHTML = chevron("left");
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
        next.innerHTML = chevron("right");
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
    options.afterRender?.(nav);
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
    root.dispatchEvent(new CustomEvent(tablePagerEvents.change, { bubbles: true, detail }));
  };

  /*
   * The size picker is whatever select sits in the size part. Both Select bindings keep a hidden
   * native `<select>` that Zag fires `change` on, and `Select.native` IS one, so a bubbling `change`
   * covers all three. The enhanced Select's own event is heard too, for markup authored without the
   * hidden element.
   */
  const applySize = (raw: unknown) => {
    const next = Number(raw);
    if (!Number.isFinite(next) || next <= 0 || next === pageSize) return;
    pageSize = next;
    page = 1;
    render();
    emit();
  };
  const onNativeChange = (event: Event) => {
    if (event.target instanceof HTMLSelectElement) applySize(event.target.value);
  };
  const onSelectChange = (event: Event) => applySize((event as CustomEvent<{ value?: string[] }>).detail?.value?.[0]);

  sizeControl?.addEventListener("change", onNativeChange);
  sizeControl?.addEventListener(selectEvents.valueChange, onSelectChange);
  const cleanups: Cleanup[] = [
    () => sizeControl?.removeEventListener("change", onNativeChange),
    () => sizeControl?.removeEventListener(selectEvents.valueChange, onSelectChange),
  ];

  render();

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

function readPageSize(root: HTMLElement, sizeControl: HTMLElement | null): number {
  const select = sizeControl?.querySelector<HTMLSelectElement>("select");
  const fromSelect = Number(select?.value || sizeControl?.querySelector<HTMLElement>("[data-sk-select]")?.dataset.value);
  if (Number.isFinite(fromSelect) && fromSelect > 0) return fromSelect;
  const fromRoot = Number(root.getAttribute("data-page-size") ?? "10");
  return Number.isFinite(fromRoot) && fromRoot > 0 ? fromRoot : 10;
}
