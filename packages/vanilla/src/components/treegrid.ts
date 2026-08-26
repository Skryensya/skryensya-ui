import {
  computeTreegridVisibility,
  defaultTreegridColumnWeights,
  diffTreegridVisibility,
  resolveTreegridKey,
  treegridEvents,
  treegridParts,
  TREEGRID_EXIT_FALLBACK_MS,
  TREEGRID_MIN_COLUMN_WIDTH as MIN_COLUMN_WIDTH,
  type TreegridFocus,
  type TreegridRowMeta,
} from "@skryensya/core/treegrid";
import { parseColumnWeights, resolveWeightedColumnWidths } from "@skryensya/core/splitter";
import { createConnectMount } from "../runtime/svelte-hydrate.js";
import { attachColumnResizer, watchColumnLayout } from "../splitter.js";

const selector = {
  root: "[data-sk-treegrid]",
  row: "[data-sk-treegrid-row]",
} as const;

type RowEntry = {
  element: HTMLTableRowElement;
  cells: HTMLTableCellElement[];
  meta: TreegridRowMeta;
};

const emit = <T>(root: HTMLElement, name: string, detail: T) =>
  root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

function readRows(root: HTMLElement): RowEntry[] {
  return Array.from(root.querySelectorAll<HTMLTableRowElement>(selector.row)).map((element) => ({
    element,
    cells: Array.from(element.querySelectorAll<HTMLTableCellElement>(":scope > td")),
    meta: {
      level: Number(element.getAttribute("aria-level")) || 1,
      isBranch: element.hasAttribute("aria-expanded"),
      expanded: element.getAttribute("aria-expanded") === "true",
    },
  }));
}

/*
 * The expand/collapse control, inserted (never authored: `readRows` above already read the row's
 * cells off markup that never included one) as the first child of a branch row's first cell.
 * `treegrid.css` draws the chevron entirely off this element's class/position, so the only job here
 * is to create it, once per branch row, idempotent the same way `applyColumnGroup` below is.
 * `aria-hidden` + `tabindex="-1"`: the row's own `aria-expanded` is already what a screen reader
 * announces (see `treegrid.ts`'s `disclosure` part doc), so this button stays decorative to
 * assistive tech and out of the roving tab sequence. NOT `sk-interactive`: that class would give the
 * button its OWN hover/press state layer, a second highlight competing with the CELL's own for the
 * same click (`onClick` below toggles on `column === 0`, never on whether the click landed on this
 * button specifically): `treegrid.css` instead darkens the glyph off the ROW's hover/focus, one
 * layer, not two. The click still reaches `onClick` unchanged either way.
 */
function ensureDisclosureButtons(rows: readonly RowEntry[]): void {
  for (const entry of rows) {
    const firstCell = entry.cells[0];
    if (!firstCell || !entry.meta.isBranch) continue;
    if (firstCell.querySelector(":scope > [data-sk-treegrid-disclosure]")) continue;
    const button = firstCell.ownerDocument.createElement("button");
    button.type = "button";
    button.className = "sk-treegrid__disclosure";
    button.tabIndex = -1;
    button.setAttribute("aria-hidden", "true");
    button.setAttribute("data-sk-treegrid-disclosure", "");
    firstCell.insertBefore(button, firstCell.firstChild);
  }
}

/*
 * `table-layout: fixed` needs an authoritative column count to size against. Measured in Chromium
 * 1.42 that leaving it to infer from `<thead>`/`<tbody>` independently is unreliable: the header's
 * own two columns came back a different width than the first body row's, swapped, and neither summed
 * to the table's real rendered width. An explicit `<colgroup>` is the mechanism the spec actually
 * recommends for fixed layout, sidestepping whatever per-row-group heuristic the browser was using
 * instead. `Math.max` over every row, not just the first: a ragged grid still needs ONE column count
 * every row sizes against. Idempotent. Re-mounting replaces rather than duplicates.
 *
 * Returns the `<col>` elements so `connectColumnResize` below has something to drag: a resizable
 * grid seeds them in PX (`measured table width ÷ colCount`) rather than the usual percentage,
 * because resizing redistributes an ABSOLUTE amount between two neighbors (`resolveColumnResize`),
 * and a percentage pair does not sum to a fixed total the same way once OTHER columns exist at
 * their own, unrelated percentages.
 */
function applyColumnGroup(root: HTMLElement, rows: readonly RowEntry[]): HTMLTableColElement[] {
  if (!(root instanceof HTMLTableElement)) return [];
  const colCount = rows.reduce((max, row) => Math.max(max, row.cells.length), 0);
  root.querySelector(":scope > colgroup[data-sk-treegrid-colgroup]")?.remove();
  if (colCount < 1) return [];
  const colgroup = root.ownerDocument.createElement("colgroup");
  colgroup.setAttribute("data-sk-treegrid-colgroup", "");
  const resizable = root.hasAttribute("data-resizable-columns");
  /*
   * Measure the SCROLL WRAPPER (`.sk-table-scroll`, `TreegridScroll`'s own host), not the table
   * itself: at this exact moment the colgroup does not exist yet, so `table-layout: fixed` has no
   * column widths to size against and the table reports its own unconstrained CONTENT width
   * instead. Measured with a genuinely wide fixture, four `white-space: nowrap` columns summed to
   * ~1400px against a ~670px container, and every column seeded proportionally oversized, pushing
   * the resizer for column 1 entirely outside the scrollable viewport. The wrapper has no such
   * problem: it is a plain block box, already laid out to the AVAILABLE space regardless of what
   * its (currently oversized) child reports. A table authored without `TreegridScroll` (rare, and
   * against this component's own convention) falls back to measuring itself, the prior behaviour.
   * Either way, a degenerate (unmeasured, e.g. detached) read falls back to the min floor rather
   * than 0. The same "do not invent a position against no layout" caution `sidebar.ts`'s own
   * `describe()` documents, applied here to the SEED instead of a report.
   */
  const measured = root.parentElement instanceof HTMLElement ? root.parentElement : root;
  /*
   * `columnWeights` (`data-column-weights`) lets a consumer give a content-heavy column a bigger
   * INITIAL share than a flat one; see `columnWeights`'s own doc (`core/treegrid.ts`). Missing or
   * malformed, this falls back to `defaultTreegridColumnWeights`: the hierarchy column (index 0)
   * carries per-level indentation, a disclosure button, and the row's own label, so it earns a
   * bigger default share than a flat metadata column beside it; see that function's own doc.
   */
  const widths = resizable
    ? resolveWeightedColumnWidths({
        total: measured.getBoundingClientRect().width,
        weights: readColumnWeights(root, colCount),
        min: MIN_COLUMN_WIDTH,
      })
    : null;
  const cols: HTMLTableColElement[] = [];
  for (let i = 0; i < colCount; i++) {
    const col = root.ownerDocument.createElement("col");
    col.style.width = widths !== null ? `${widths[i]}px` : `${100 / colCount}%`;
    colgroup.append(col);
    cols.push(col);
  }
  // A `<colgroup>` must precede `<thead>`/`<tbody>`: `<table>`'s first child either way.
  root.insertBefore(colgroup, root.firstChild);
  /*
   * An explicit pixel WIDTH on the table itself, not left at the stylesheet's `inline-size: auto`
   *; see `treegrid.css`'s own note on why `auto` is not safe here: a `table-layout: fixed` table
   * sized `auto` still compares its columns' sum against its containing block and takes the
   * greater, and once the table ends up wider than that sum, Chromium's real redistribution
   * algorithm hands the surplus to whichever columns have the most unbreakable `nowrap` content
   * rather than leaving every column at its authored width. Resizing never has to touch this again:
   * `resolveColumnResize` conserves the touched pair's own total, so the table's OWN total is an
   * invariant of every resize, set correctly exactly once, here.
   */
  if (widths !== null) root.style.width = `${widths.reduce((sum, width) => sum + width, 0)}px`;
  return cols;
}

/** `columnWeights` off the table's own `data-column-weights`, falling back to
 * `defaultTreegridColumnWeights`: the one place both `applyColumnGroup` and `watchTreegridLayout`
 * read it from, so neither can drift from the other's idea of a table's weights mid-mount. */
function readColumnWeights(root: HTMLElement, colCount: number): readonly number[] {
  return parseColumnWeights(root.getAttribute("data-column-weights"), colCount) ?? defaultTreegridColumnWeights(colCount);
}

/*
 * COLUMN RESIZE, opt-in (`resizableColumns`). Inserts one `.sk-treegrid__column-resizer.sk-splitter`
 *. The shared "Window Splitter" primitive (`core/splitter.ts`), the same one `sidebar.ts` drives -
 * into every column header but the last, via `attachColumnResizer` (`../splitter.ts`): the pointer/
 * keyboard wiring itself is shared with a plain resizable `Table`, so this function only ever
 * supplies what makes THIS a treegrid, where the `<col>` widths live, and how each resizer names
 * itself off `resizeLabel` plus its own column header's text.
 */
function connectColumnResize(root: HTMLElement, cols: readonly HTMLTableColElement[]): () => void {
  if (!root.hasAttribute("data-resizable-columns") || cols.length < 2) return () => {};
  const headerCells = Array.from(root.querySelectorAll<HTMLTableCellElement>(":scope > thead > tr > th"));
  const resizeLabel = root.getAttribute("data-resize-label") ?? "";
  const widths = () => cols.map((col) => Number.parseFloat(col.style.width) || 0);
  const setWidths = (next: readonly number[]) => next.forEach((w, i) => (cols[i]!.style.width = `${w}px`));

  const cleanups: (() => void)[] = [];

  headerCells.forEach((th, index) => {
    // The LAST column has no next neighbor to redistribute width with: `resolveColumnResize`
    // itself is a no-op past the last pair, so a handle there would drag nothing.
    if (index >= headerCells.length - 1) return;
    if (th.querySelector(":scope > [data-sk-column-resizer]")) return;

    const headerText = th.textContent?.trim() ?? "";
    cleanups.push(
      attachColumnResizer({
        th,
        root,
        index,
        getWidths: widths,
        setWidths,
        min: MIN_COLUMN_WIDTH,
        ariaLabel: resizeLabel ? `${resizeLabel}: ${headerText}` : headerText,
        direction: () => (getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr"),
        className: treegridParts.columnResizer,
      }),
    );
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

/*
 * A mounted-while-hidden table (a docs preview panel not yet the selected binding tab, a closed
 * accordion, an inactive tab panel) measures 0 the whole time it stays that way: `applyColumnGroup`
 * already clamps that to the min floor rather than a literal 0px, but the floor stays wrong forever
 * unless something re-measures once the table is actually visible. `watchColumnLayout`
 * (`../splitter.ts`, shared with `table.ts`) is that one re-measurement: a no-op if the FIRST read
 * already succeeded, otherwise it waits for the first real, nonzero width and reseeds every `<col>`
 * plus the table's own width from it, exactly once.
 */
function watchTreegridLayout(root: HTMLElement, cols: readonly HTMLTableColElement[]): () => void {
  if (!root.hasAttribute("data-resizable-columns") || cols.length < 1) return () => {};
  const measured = root.parentElement instanceof HTMLElement ? root.parentElement : root;
  return watchColumnLayout({
    measured,
    colCount: cols.length,
    min: MIN_COLUMN_WIDTH,
    weights: readColumnWeights(root, cols.length),
    apply: (widths) => {
      cols.forEach((col, i) => (col.style.width = `${widths[i]}px`));
      root.style.width = `${widths.reduce((sum, width) => sum + width, 0)}px`;
    },
  });
}

function connect(root: HTMLElement): () => void {
  const rows = readRows(root);
  ensureDisclosureButtons(rows);
  const cols = applyColumnGroup(root, rows);
  const cleanupLayoutWatch = watchTreegridLayout(root, cols);
  const cleanupColumnResize = connectColumnResize(root, cols);
  /** Only visible rows are addressable. The same index space `resolveTreegridKey` expects. */
  let visible: RowEntry[] = [];

  /*
   * ANIMATING A TOGGLE. Mirrors `treegrid.tsx`'s own effect (React binding), same three-way split
   * `diffTreegridVisibility` documents, applied imperatively instead of via React state:
   *   - `previousFlags`: the visibility array from BEFORE this call, `null` on first mount (nothing
   *     changed yet. A branch authored collapsed must not play an exit animation for content that
   *     was never shown).
   *   - `exitingEntries`: rows kept un-hidden past their own `visibleFlags === false` moment so they
   *     keep painting through `sk-treegrid-row-out` (`treegrid.css`) instead of vanishing the same
   *     frame the branch collapses. Guards the "no transition this call, but still mid-exit from
   *     the LAST one" case below. A second, unrelated toggle mid-animation must not clip it early.
   *   - `settleTimers`: one `animationend`-or-`TREEGRID_EXIT_FALLBACK_MS`-timeout race per row
   *     currently transitioning, so a repeat toggle before the first settle cancels the stale one
   *     instead of it firing late against whatever state the row is in by then.
   * `visible` itself stays computed straight off `flags` (the pure, INSTANT truth) either way. An
   * exiting-but-still-painting row is correctly unreachable by arrow keys immediately, unaffected by
   * this whole deferred-hide window.
   */
  let previousFlags: readonly boolean[] | null = null;
  const exitingEntries = new Set<RowEntry>();
  const settleTimers = new Map<RowEntry, ReturnType<typeof setTimeout>>();

  const scheduleSettle = (entry: RowEntry, transition: "entering" | "exiting") => {
    const existingTimer = settleTimers.get(entry);
    if (existingTimer) clearTimeout(existingTimer);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      settleTimers.delete(entry);
      entry.element.removeEventListener("animationend", onAnimationEnd);
      entry.element.removeAttribute("data-state");
      if (transition === "exiting") {
        entry.element.hidden = true;
        exitingEntries.delete(entry);
      }
    };
    const onAnimationEnd = () => finish();
    entry.element.addEventListener("animationend", onAnimationEnd, { once: true });
    settleTimers.set(entry, setTimeout(finish, TREEGRID_EXIT_FALLBACK_MS));
  };

  const applyVisibility = () => {
    const flags = computeTreegridVisibility(rows.map((r) => r.meta));
    const transitions = previousFlags === null ? null : diffTreegridVisibility(previousFlags, flags);
    previousFlags = flags;

    rows.forEach((entry, index) => {
      const transition = transitions?.[index];
      if (transition === "entering") {
        entry.element.hidden = false;
        entry.element.setAttribute("data-state", "entering");
        scheduleSettle(entry, "entering");
      } else if (transition === "exiting") {
        exitingEntries.add(entry);
        entry.element.setAttribute("data-state", "exiting");
        scheduleSettle(entry, "exiting");
      } else if (!exitingEntries.has(entry)) {
        entry.element.hidden = !flags[index];
      }
    });

    visible = rows.filter((_, index) => flags[index]);
  };

  /*
   * Read where focus ACTUALLY is, off the DOM, rather than tracking a separate `focus` variable that
   * something outside this module's own click/keydown handling (a test, an app's own focus
   * management, restoring focus after a re-render) could silently desync from. `tabIndex="0"` marks
   * the roving stop for Tab-in-from-outside; this is the SAME idea applied to "where is it right
   * now" instead of "where should Tab land".
   */
  const currentFocus = (): TreegridFocus => {
    const active = root.ownerDocument?.activeElement;
    for (let rowIndex = 0; rowIndex < visible.length; rowIndex++) {
      const entry = visible[rowIndex]!;
      if (entry.element === active) return { row: rowIndex, col: null };
      const colIndex = entry.cells.indexOf(active as HTMLTableCellElement);
      if (colIndex !== -1) return { row: rowIndex, col: colIndex };
    }
    // Nothing of ours is focused (e.g. keyboard action fired programmatically). The roving stop,
    // the SAME row/cell Tab would land on, is the sane fallback.
    for (let rowIndex = 0; rowIndex < visible.length; rowIndex++) {
      const entry = visible[rowIndex]!;
      if (entry.element.tabIndex === 0) return { row: rowIndex, col: null };
      const colIndex = entry.cells.findIndex((cell) => cell.tabIndex === 0);
      if (colIndex !== -1) return { row: rowIndex, col: colIndex };
    }
    return { row: 0, col: null };
  };

  const target = (focus: TreegridFocus): { element: HTMLTableRowElement | HTMLTableCellElement } | undefined => {
    const entry = visible[focus.row];
    if (!entry) return undefined;
    return { element: focus.col === null ? entry.element : (entry.cells[focus.col] ?? entry.element) };
  };

  const applyTabindex = (focus: TreegridFocus) => {
    for (const entry of visible) {
      entry.element.tabIndex = -1;
      for (const cell of entry.cells) cell.tabIndex = -1;
    }
    const next = target(focus);
    if (next) next.element.tabIndex = 0;
  };

  const moveFocus = (next: TreegridFocus) => {
    applyTabindex(next);
    target(next)?.element.focus();
  };

  const toggle = (rowIndex: number, expanded: boolean) => {
    const entry = visible[rowIndex];
    if (!entry) return;
    entry.element.setAttribute("aria-expanded", String(expanded));
    entry.meta = { ...entry.meta, expanded };
    applyVisibility();
    // Toggling a row never changes ITS OWN position among visible rows (only its descendants,
    // which sit after it), so the same index still names it post-recompute.
    applyTabindex({ row: rowIndex, col: null });
    entry.element.focus();
    emit(root, treegridEvents.expandedChange, {
      value: entry.element.getAttribute("data-value"),
      expanded,
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || !visible.length) return;
    const focus = currentFocus();
    const action = resolveTreegridKey({
      key: event.key,
      ctrl: event.ctrlKey || event.metaKey,
      focus,
      rows: visible.map((entry) => entry.meta),
      colCount: visible[focus.row]?.cells.length ?? 0,
    });
    if (action.kind === "none") return;
    event.preventDefault();
    if (action.kind === "move") moveFocus(action.focus);
    else if (action.kind === "toggle") toggle(action.row, action.expanded);
    else if (action.kind === "activate") {
      const entry = visible[action.row];
      if (entry) emit(root, treegridEvents.activate, { value: entry.element.getAttribute("data-value") });
    }
  };

  const onClick = (event: MouseEvent) => {
    const rowElement = (event.target as HTMLElement).closest<HTMLTableRowElement>(selector.row);
    if (!rowElement || !root.contains(rowElement)) return;
    const rowIndex = visible.findIndex((entry) => entry.element === rowElement);
    if (rowIndex === -1) return;
    const entry = visible[rowIndex]!;
    const cellElement = (event.target as HTMLElement).closest<HTMLTableCellElement>("td");
    const colIndex = cellElement ? entry.cells.indexOf(cellElement) : -1;
    if (colIndex === 0 && entry.meta.isBranch) {
      moveFocus({ row: rowIndex, col: null });
      toggle(rowIndex, !entry.meta.expanded);
      return;
    }
    moveFocus({ row: rowIndex, col: colIndex === -1 ? null : colIndex });
  };

  applyVisibility();
  applyTabindex({ row: 0, col: null });
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("click", onClick);
  return () => {
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("click", onClick);
    cleanupLayoutWatch();
    cleanupColumnResize();
    for (const timer of settleTimers.values()) clearTimeout(timer);
    settleTimers.clear();
  };
}

export const mountTreegrid = createConnectMount({
  key: "treegrid",
  rootSelector: selector.root,
  connect,
});
