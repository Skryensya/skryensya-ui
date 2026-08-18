import {
  hasCrossedDragThreshold,
  resolveColumnResize,
  resolveSplitterKey,
  resolveWeightedColumnWidths,
  splitterDirectionSign,
  splitterValuePercent,
} from "@skryensya/core/splitter";

/*
 * SPLITTER, the imperative binding for a COLUMN-RESIZE handle — the pointer/keyboard wiring
 * `@skryensya/core/splitter`'s own banner leaves to each binding, now written ONCE instead of once
 * per consumer: Treegrid's column resizer and a plain Table's both attach one of these per column
 * boundary, and until this file existed the two copied each other's press-vs-drag arming, RTL sign
 * and keyboard handling byte for byte. What stays OUTSIDE this function, on purpose, is the value
 * model: the caller hands over `getWidths`/`setWidths` closures over ITS OWN width state (a
 * `<col>` array read via inline styles today, in principle anything), so this file never has to
 * know where the numbers live, only how a "Window Splitter" gesture turns into a call against them.
 */

export interface ColumnResizerOptions {
  /** The header cell this handle sits inside — appended as its last child. */
  readonly th: HTMLElement;
  /** This handle sits BETWEEN column `index` and `index + 1` — `resolveColumnResize`'s own indexing. */
  readonly index: number;
  readonly getWidths: () => readonly number[];
  readonly setWidths: (widths: readonly number[]) => void;
  readonly min: number;
  readonly ariaLabel: string;
  /** Reads current writing direction fresh per gesture — a document can flip direction under a
   * long-lived table, the same reasoning `sidebar.ts`'s own `towardWider` documents. */
  readonly direction: () => "ltr" | "rtl";
  /** The caller's OWN part class (`sk-table__column-resizer`, `sk-treegrid__column-resizer`, …),
   * composed with the shared `sk-splitter` pattern the same way every other part composes it — the
   * gesture is generic, the paint is still the consumer's, per-contract part class. */
  readonly className: string;
  /**
   * What Enter/double-click resizes column `index` TO, in px — omitted, the WAI convention default:
   * an even split with its neighbor (`core/splitter.ts`'s own banner: "Sidebar and Treegrid both
   * reset to an even/default split"). A plain Table instead supplies `measureColumnContentWidth`
   * here, so the SAME gesture fits the column to its own content instead — the spreadsheet
   * convention, and the more useful default for a column of actual data. This file only ever turns
   * the target into a `delta` against the pair's current width; it never measures anything itself.
   */
  readonly resetWidth?: () => number;
}

/**
 * Seeds column widths from `measured`'s real rendered width, watching for one if it reads 0 right
 * now — `measured` can be `display: none` at the moment a table mounts (a docs preview panel not
 * yet the selected binding tab, a closed accordion, an inactive tab panel: all read 0 the whole
 * time they stay hidden), and 0 ÷ colCount would seed every column at the min floor permanently,
 * since nothing would ever ask again. A synchronous read that already succeeds needs no observer at
 * all; only a genuinely-zero read starts one, and it disconnects itself the moment a real,
 * nonzero width finally arrives — this only ever seeds once, a mount concern, not a resize one.
 */
export function watchColumnLayout(options: {
  readonly measured: HTMLElement;
  readonly colCount: number;
  readonly min: number;
  /** One positive weight per column — `resolveWeightedColumnWidths`'s own doc
   * (`@skryensya/core/splitter`) explains why an equal split is not always the seed a consumer
   * wants. Omitted, every column starts equal, the prior behaviour. */
  readonly weights?: readonly number[];
  readonly apply: (widths: readonly number[]) => void;
}): () => void {
  const { measured, colCount, min, apply } = options;
  const weights = options.weights ?? Array.from({ length: colCount }, () => 1);
  // Guards against a callback already in flight the instant `disconnect()` is called — a real race,
  // not a hypothetical one, since `ResizeObserver` batches and delivers on the next frame.
  let seeded = false;
  const seedFrom = (total: number): boolean => {
    if (seeded || total <= 0) return false;
    seeded = true;
    apply(resolveWeightedColumnWidths({ total, weights, min }));
    return true;
  };
  if (seedFrom(measured.getBoundingClientRect().width)) return () => {};
  const observer = new ResizeObserver((entries) => {
    if (seedFrom(entries[0]?.contentRect.width ?? 0)) observer.disconnect();
  });
  observer.observe(measured);
  return () => observer.disconnect();
}

/** Attaches one column-resize handle and returns its own cleanup — same shape every enhancer here
 * returns, and the same one `bindHotkey` documents for a single reusable primitive. */
export function attachColumnResizer(options: ColumnResizerOptions): () => void {
  const { th, index, getWidths, setWidths, min, ariaLabel, direction, className, resetWidth } = options;
  const doc = th.ownerDocument;

  const handle = doc.createElement("div");
  handle.className = `${className} sk-splitter`;
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "vertical");
  handle.setAttribute("aria-valuemin", "0");
  handle.setAttribute("aria-valuemax", "100");
  handle.setAttribute("aria-label", ariaLabel);
  handle.setAttribute("data-sk-column-resizer", "");
  handle.tabIndex = 0;

  const sign = () => splitterDirectionSign(direction());

  const describe = () => {
    const widths = getWidths();
    const before = widths[index] ?? 0;
    const after = widths[index + 1] ?? 0;
    const total = before + after;
    const max = Math.max(min, total - min);
    handle.setAttribute("aria-valuenow", String(splitterValuePercent(before, min, max)));
  };

  const resize = (delta: number) => {
    setWidths(resolveColumnResize({ widths: getWidths(), index, delta, min }));
    describe();
  };

  /** `resetWidth`'s own target when the caller supplies one, an even split with the neighbor
   * otherwise — see `ColumnResizerOptions.resetWidth`'s own doc for which consumers pass which. */
  const reset = () => {
    const widths = getWidths();
    const before = widths[index] ?? 0;
    const after = widths[index + 1] ?? 0;
    const target = resetWidth ? resetWidth() : (before + after) / 2;
    resize(target - before);
  };

  let pointerId: number | null = null;
  let startX = 0;
  let startWidths: readonly number[] = [];
  let dragging = false;

  const onPointerDown = (event: Event) => {
    const pointer = event as PointerEvent;
    if (pointer.button !== 0) return;
    pointer.preventDefault();
    pointerId = pointer.pointerId;
    startX = pointer.clientX;
    dragging = false;
    handle.setPointerCapture(pointer.pointerId);
  };

  const onPointerMove = (event: Event) => {
    const pointer = event as PointerEvent;
    if (pointerId === null || pointer.pointerId !== pointerId) return;
    if (!dragging) {
      if (!hasCrossedDragThreshold(startX, pointer.clientX)) return;
      // The gesture is a drag. Measure from HERE, so the width does not jump by the slop.
      dragging = true;
      startX = pointer.clientX;
      startWidths = getWidths();
      handle.setAttribute("data-dragging", "");
    }
    setWidths(
      resolveColumnResize({ widths: startWidths, index, delta: (pointer.clientX - startX) * sign(), min }),
    );
    describe();
  };

  const onPointerUp = (event: Event) => {
    const pointer = event as PointerEvent;
    if (pointerId === null || pointer.pointerId !== pointerId) return;
    if (handle.hasPointerCapture(pointer.pointerId)) handle.releasePointerCapture(pointer.pointerId);
    pointerId = null;
    // A press that never became a drag ends here: nothing moved.
    if (!dragging) return;
    dragging = false;
    handle.removeAttribute("data-dragging");
  };

  const onKeyDown = (event: Event) => {
    const key = event as KeyboardEvent;
    const action = resolveSplitterKey(key);
    switch (action.kind) {
      case "delta":
        resize(action.delta * sign());
        break;
      case "home":
        resize(-Infinity);
        break;
      case "end":
        resize(Infinity);
        break;
      case "reset":
        key.preventDefault();
        reset();
        return;
      case "none":
        return;
    }
    key.preventDefault();
  };

  handle.addEventListener("pointerdown", onPointerDown);
  handle.addEventListener("pointermove", onPointerMove);
  handle.addEventListener("pointerup", onPointerUp);
  handle.addEventListener("pointercancel", onPointerUp);
  handle.addEventListener("keydown", onKeyDown);
  handle.addEventListener("dblclick", reset);

  th.appendChild(handle);
  describe();

  return () => {
    handle.removeEventListener("pointerdown", onPointerDown);
    handle.removeEventListener("pointermove", onPointerMove);
    handle.removeEventListener("pointerup", onPointerUp);
    handle.removeEventListener("pointercancel", onPointerUp);
    handle.removeEventListener("keydown", onKeyDown);
    handle.removeEventListener("dblclick", reset);
    handle.remove();
  };
}

/**
 * The natural, single-line width column `columnIndex` needs to show EVERY currently-rendered cell
 * in it without wrapping or truncating — what a spreadsheet's own double-click-the-border
 * convention measures, and `Table`'s own `resetWidth` (`components/table.ts`).
 *
 * Clones each cell into a throwaway, `table-layout: auto` table (off-screen, `visibility: hidden`,
 * never painted) and reads the CLONE's own rendered width, rather than reading anything off the
 * real cell — confirmed against a real table, not assumed, that NEITHER of the two techniques that
 * look like they should work actually does:
 *   - The real cell's own `scrollWidth`, even under a temporary `white-space: nowrap`, never moves:
 *     a `table-layout: fixed` cell's box is held at its `<col>`'s width no matter how much (or how
 *     little) text it holds — measuring it can only ever answer "what is this column right now",
 *     the very thing this gesture is about to overwrite, never "what does the content need".
 *   - `overflow: hidden` does not rescue that read either, and for a reason worth stating plainly:
 *     `scrollWidth` is SPECIFIED as `max(clientWidth, content width)`, which means it can reveal
 *     content WIDER than the box (a real overflow) but can never report NARROWER — a column that is
 *     already too generous for its content has nothing to "scroll", so `scrollWidth` just echoes
 *     `clientWidth` back, and a spreadsheet's auto-fit needs exactly that direction too (SHRINKING
 *     an over-wide column is the common case, not just growing a truncated one).
 * A detached, unconstrained clone sidesteps both problems at once: nothing there is held to any
 * `<col>`, so its rendered width is simply what the content needs, in either direction. The clone
 * keeps the ORIGINAL cell's classes (via the ruler table's own `className`, so ancestor selectors
 * like `.sk-table :is(th, td)` still match) and any inline styles, so the measured width reflects
 * the real padding/font/box-sizing, not a guess reconstructed property by property. The resizer
 * handle itself is stripped from the clone first — `cloneNode(true)` would otherwise duplicate that
 * `position: absolute` child too, which contributes nothing to the width but does not belong in a
 * detached copy either.
 *
 * All clones are built and attached in ONE batch, and only THEN read — one forced layout for the
 * whole column, not one per cell (the standard read/write-batching fix for layout thrashing).
 */
export function measureColumnContentWidth(params: {
  readonly table: HTMLTableElement;
  readonly columnIndex: number;
  readonly min: number;
}): number {
  const { table, columnIndex, min } = params;
  const cells = Array.from(table.querySelectorAll<HTMLTableRowElement>(":scope > * > tr"))
    .map((row) => row.children[columnIndex])
    .filter((cell): cell is HTMLTableCellElement => cell instanceof HTMLTableCellElement);
  if (cells.length === 0) return min;

  const doc = table.ownerDocument;
  const ruler = doc.createElement("table");
  ruler.className = table.className;
  ruler.style.cssText = "position:absolute;visibility:hidden;inset-inline-start:-9999px;top:-9999px;table-layout:auto;width:auto;";
  const clones = cells.map((cell) => {
    const clone = cell.cloneNode(true) as HTMLTableCellElement;
    clone.querySelectorAll("[data-sk-column-resizer]").forEach((handle) => handle.remove());
    clone.removeAttribute("id");
    clone.style.whiteSpace = "nowrap";
    const row = doc.createElement("tr");
    row.appendChild(clone);
    ruler.appendChild(row);
    return clone;
  });

  doc.body.appendChild(ruler);
  const natural = clones.reduce((max, clone) => Math.max(max, clone.getBoundingClientRect().width), min);
  doc.body.removeChild(ruler);
  return natural;
}

/**
 * Keeps `--sk-splitter-block-size` (the splitter pattern's own opt-in hook, `patterns/splitter.css`
 * — every `.sk-splitter` fills `100%` of its containing block by default, this is how a caller asks
 * for something taller) matched to `container`'s own rendered extent for as long as the returned
 * cleanup is never called — unlike `watchColumnLayout`'s one-shot seed, this never disconnects on
 * its own: resizing a column can change how many lines a cell WRAPS to, which changes the table's
 * own height mid-gesture, so the column line every `.sk-splitter` inside it draws has to keep
 * tracking a moving target for the resizable table's whole lifetime, not just once at mount.
 *
 * `measure` defaults to `container`'s own full rendered height — right for a plain box, WRONG for
 * `Table`'s own call (`components/table.ts`): a `<caption>` renders outside the table's own grid
 * (`table.css`'s own note) but still inside the `<table>` ELEMENT's rendered box, so its own
 * `getBoundingClientRect().height` over-counts by the caption's height, while the resizer itself
 * starts at the header row (it lives inside a `<th>`), not the caption above it — left at the
 * default, a captioned table's line would run past the table's real bottom edge by exactly that
 * much. `Table` supplies its own `measure` that reads from the first row down instead.
 */
export function watchSplitterExtent(
  container: HTMLElement,
  measure: (container: HTMLElement) => number = (el) => el.getBoundingClientRect().height,
): () => void {
  const apply = () => {
    container.style.setProperty("--sk-splitter-block-size", `${measure(container)}px`);
  };
  apply();
  const observer = new ResizeObserver(apply);
  observer.observe(container);
  return () => observer.disconnect();
}
