import { splitter } from "@skryensya/core/machines";
import {
  resolveColumnResize,
  resolveSplitterKey,
  resolveWeightedColumnWidths,
  splitterDirectionSign,
} from "@skryensya/core/splitter";
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla";
import { applyZagProps, bindZagEvents, type DomProps } from "./runtime/apply.js";

/*
 * SPLITTER, the imperative binding for a COLUMN-RESIZE handle. The pointer/keyboard wiring
 * `@skryensya/core/splitter`'s own banner leaves to each binding, now written ONCE instead of once
 * per consumer: Treegrid's column resizer and a plain Table's both attach one of these per column
 * boundary, and until this file existed the two copied each other's press-vs-drag arming, RTL sign
 * and keyboard handling byte for byte. What stays OUTSIDE this function, on purpose, is the value
 * model: the caller hands over `getWidths`/`setWidths` closures over ITS OWN width state (a
 * `<col>` array read via inline styles today, in principle anything), so this file never has to
 * know where the numbers live, only how a "Window Splitter" gesture turns into a call against them.
 */

export interface ColumnResizerOptions {
  /** The header cell this handle sits inside. Appended as its last child. */
  readonly th: HTMLElement;
  /** The element whose inline size is the whole splitter group Zag measures. */
  readonly root: HTMLElement;
  /** This handle sits BETWEEN column `index` and `index + 1`: `resolveColumnResize`'s own indexing. */
  readonly index: number;
  readonly getWidths: () => readonly number[];
  readonly setWidths: (widths: readonly number[]) => void;
  readonly min: number;
  readonly ariaLabel: string;
  /** Reads current writing direction fresh per gesture. A document can flip direction under a
   * long-lived table, the same reasoning `sidebar.ts`'s own `towardWider` documents. */
  readonly direction: () => "ltr" | "rtl";
  /** The caller's OWN part class (`sk-table__column-resizer`, `sk-treegrid__column-resizer`, …),
   * composed with the shared `sk-splitter` pattern the same way every other part composes it. The
   * gesture is generic, the paint is still the consumer's, per-contract part class. */
  readonly className: string;
  /**
   * What Enter/double-click resizes column `index` TO, in px. Omitted, the WAI convention default:
   * an even split with its neighbor (`core/splitter.ts`'s own banner: "Sidebar and Treegrid both
   * reset to an even/default split"). A plain Table instead supplies `measureColumnContentWidth`
   * here, so the SAME gesture fits the column to its own content instead. The spreadsheet
   * convention, and the more useful default for a column of actual data. This file only ever turns
   * the target into a `delta` against the pair's current width; it never measures anything itself.
   */
  readonly resetWidth?: () => number;
}

/**
 * Seeds column widths from `measured`'s real rendered width, watching for one if it reads 0 right
 * now: `measured` can be `display: none` at the moment a table mounts (a docs preview panel not
 * yet the selected binding tab, a closed accordion, an inactive tab panel: all read 0 the whole
 * time they stay hidden), and 0 ÷ colCount would seed every column at the min floor permanently,
 * since nothing would ever ask again. A synchronous read that already succeeds needs no observer at
 * all; only a genuinely-zero read starts one, and it disconnects itself the moment a real,
 * nonzero width finally arrives. This only ever seeds once, a mount concern, not a resize one.
 */
export function watchColumnLayout(options: {
  readonly measured: HTMLElement;
  readonly colCount: number;
  readonly min: number;
  /** One positive weight per column: `resolveWeightedColumnWidths`'s own doc
   * (`@skryensya/core/splitter`) explains why an equal split is not always the seed a consumer
   * wants. Omitted, every column starts equal, the prior behaviour. */
  readonly weights?: readonly number[];
  /**
   * Corrects the raw measured width before it is split across columns. Table's own call
   * subtracts its `<table>`'s own border width: CSS's separated-border table model
   * (`border-collapse: separate`, what `.sk-table` uses) paints a table's border OUTSIDE the
   * width its `width` property/`<col>` sum describes, regardless of `box-sizing`. Confirmed
   * against a real render, not assumed: a table seeded to exactly its wrapper's own width still
   * rendered 2px wider (one border width per side), a permanent horizontal scrollbar on a table
   * that should never need one. Omitted, the raw measured width is used as-is (Treegrid's own
   * call never needed this, `treegrid.css`'s own width note covers its actual failure mode).
   */
  readonly adjustTotal?: (total: number) => number;
  readonly apply: (widths: readonly number[]) => void;
}): () => void {
  const { measured, colCount, min, apply } = options;
  const weights = options.weights ?? Array.from({ length: colCount }, () => 1);
  const adjustTotal = options.adjustTotal ?? ((total: number) => total);
  // Guards against a callback already in flight the instant `disconnect()` is called. A real race,
  // not a hypothetical one, since `ResizeObserver` batches and delivers on the next frame.
  let seeded = false;
  const seedFrom = (rawTotal: number): boolean => {
    const total = adjustTotal(rawTotal);
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

let splitterId = 0;

/** Attaches one Zag-backed column-resize handle and returns its own cleanup. */
export function attachColumnResizer(options: ColumnResizerOptions): () => void {
  const { root, th, index, getWidths, setWidths, min, ariaLabel, className, resetWidth } = options;
  const doc = th.ownerDocument;
  const rootId = root.id || `sk-zag-splitter-${++splitterId}`;
  if (!root.id) root.id = rootId;

  const handle = doc.createElement("div");
  handle.className = `${className} sk-splitter`;
  handle.setAttribute("aria-label", ariaLabel);
  handle.setAttribute("data-sk-column-resizer", "");
  th.appendChild(handle);

  const ids = {
    root: rootId,
    resizeTrigger: (id: string) => `${rootId}:resize:${id}`,
    panel: (id: string | number) => `${rootId}:panel:${id}`,
  };

  const totalWidth = () => getWidths().reduce((sum, width) => sum + width, 0);
  const toPercent = (width: number, total: number) => (total > 0 ? (width / total) * 100 : 0);
  const toWidths = (sizes: readonly number[]) => {
    const total = totalWidth();
    return sizes.map((size) => (size / 100) * total);
  };
  /*
   * `minSize` as a PERCENT of the CURRENT total, computed here, rather than a `px` string handed to
   * Zag's own rootEl-relative conversion. Two reasons:
   *  - Zag only re-normalizes `panels` (and re-measures the group) when its own dependency watcher
   *    sees the SERIALIZED `panels` prop change. A fixed `"60px"` string never changes text even
   *    when the real ratio it represents does (a proportional resize keeps every width's SHARE the
   *    same, so `size()`'s own percentages don't change either) - Zag would never notice the total
   *    moved at all, and `resizeByDelta` would keep dragging against a floor computed from whatever
   *    total happened to be current the ONE time it last measured. A percent string changes text
   *    exactly when the real floor-to-total ratio changes, so the same watcher catches it.
   *  - It sidesteps needing `rootEl` measurable at all for this to be correct, consistent with how
   *    `size()` already avoids it below.
   */
  const panels = () =>
    getWidths().map((_, panelIndex) => ({
      id: `c${panelIndex}`,
      minSize: `${toPercent(min, totalWidth())}%`,
    }));
  const size = () => {
    const total = totalWidth();
    return getWidths().map((width) => `${toPercent(width, total)}%`);
  };

  const machine = new VanillaMachine(splitter.machine, () => ({
    id: `${rootId}-${index}`,
    ids,
    dir: options.direction(),
    orientation: "horizontal" as const,
    panels: panels(),
    size: size(),
    onResize(details) {
      setWidths(toWidths(details.size));
    },
  }));

  const api = () => splitter.connect(machine.service, normalizeProps);
  /*
   * Zag's own pointer-drag arithmetic has no `dir` awareness at all (unlike its keyboard handler,
   * which flips ArrowLeft/Right via `getEventKey`): a rightward physical drag always GROWS the
   * trigger id's first (before) panel, whatever `dir` says. Swapping which panel id comes first in
   * RTL is the only lever this binding has to make a rightward drag SHRINK column `index` there too
   * (`splitterDirectionSign`'s own reasoning, just applied to Zag's pivot order instead of a raw
   * delta sign). `resolveResizeTriggerId` accepts either order verbatim once both ids are present.
   */
  const triggerId = (): `${string}:${string}` =>
    options.direction() === "rtl" ? `c${index + 1}:c${index}` : `c${index}:c${index + 1}`;
  const triggerProps = (): DomProps => api().getResizeTriggerProps({ id: triggerId() }) as unknown as DomProps;
  /*
   * Zag's own `onKeyDown` moves in fixed PERCENTAGE points (a hardcoded 10 on Shift, regardless of
   * `keyboardResizeBy`) and only resets a `collapsible` panel on Enter - neither matches the
   * WAI-ARIA Window Splitter contract this binding already promises and the ARIA APG audit records
   * (`resolveSplitterKey`'s own step/coarseStep in PX, Enter resets to `resetWidth`). Keyboard stays
   * hand-wired below; Zag still owns the pointer drag and the focus/hover state attributes.
   */
  const bindableProps = (): DomProps => {
    const { onKeyDown: _zagKeyDown, ...rest } = triggerProps();
    return rest;
  };
  const sync = () => {
    applyZagProps(handle, bindableProps());
    // Zag mirrors its own panel-flow `orientation` straight onto the attribute; APG wants the
    // SEPARATOR's own axis, the opposite one for a row of side-by-side columns.
    handle.setAttribute("aria-orientation", "vertical");
    /*
     * The ARIA value triple, computed against THIS pair's own total rather than read back off
     * Zag's internal context. Two reasons neither is cosmetic:
     *  - Zag's `panels` for this machine is the WHOLE column set (needed for its own pointer-drag
     *    math), so its own `getAriaValue` reports bounds that account for every OTHER column's
     *    floor too - richer than what this binding actually allows. `resolveColumnResize` only
     *    ever conserves the touched PAIR's own total, so a third column's floor is never actually
     *    in play here; reporting it anyway would tell a screen reader a bound this drag can't honor.
     *  - Zag's internal context only re-measures on its own `syncSize` (gated on a real
     *    `ResizeObserver` firing), so a width change made outside this binding's own drag/keyboard
     *    paths - a container that legitimately resizes - would leave it stale until that observer
     *    catches up. Reading `getWidths()` fresh here can't go stale, by construction.
     */
    const widths = getWidths();
    const before = widths[index] ?? 0;
    const after = widths[index + 1] ?? 0;
    const pairTotal = before + after;
    handle.setAttribute("aria-valuemin", String(pairTotal > 0 ? Math.round((min / pairTotal) * 100) : 0));
    handle.setAttribute("aria-valuemax", String(pairTotal > 0 ? Math.round(((pairTotal - min) / pairTotal) * 100) : 100));
    handle.setAttribute("aria-valuenow", String(pairTotal > 0 ? Math.round((before / pairTotal) * 100) : 0));
    handle.className = `${className} sk-splitter`;
    handle.setAttribute("aria-label", ariaLabel);
    handle.setAttribute("data-sk-column-resizer", "");
  };
  const unsubscribe = machine.subscribe(sync);
  machine.start();
  const unbind = bindZagEvents(handle, bindableProps);
  sync();

  /*
   * `reset`/`onKeyDown` below write `getWidths()`/`setWidths()` directly and never touch Zag's own
   * `send`: `size` is a CONTROLLED prop here (always non-null), so `api().setSizes()` would only
   * re-invoke `onResize` with the value we just gave it - `setSize`'s own controlled branch never
   * calls `context.set("size", …)` itself in that mode. Zag's internal baseline for a drag's OWN
   * `initialSize` (`setDraggingState`) catches up the NEXT time its watch tracker notices `size()`'s
   * serialized value changed - any subsequent FOCUS/POINTER_DOWN on this same handle - so a drag
   * started immediately after a keyboard move, with no intervening blur, can begin from a
   * one-interaction-stale baseline. Self-corrects on the following interaction; not worth an
   * uncontrolled-mode rewrite (which would trade this for losing `onResize` entirely) for a gap this
   * narrow.
   */
  const reset = () => {
    const widths = getWidths();
    const before = widths[index] ?? 0;
    const after = widths[index + 1] ?? 0;
    const target = resetWidth ? resetWidth() : (before + after) / 2;
    const next = [...widths];
    const bounded = Math.min(Math.max(target, min), before + after - min);
    next[index] = bounded;
    next[index + 1] = before + after - bounded;
    setWidths(next);
    sync();
  };
  handle.addEventListener("dblclick", reset);

  const onKeyDown = (event: KeyboardEvent) => {
    const action = resolveSplitterKey(event);
    if (action.kind === "none") return;
    event.preventDefault();
    if (action.kind === "reset") {
      reset();
      return;
    }
    const delta =
      action.kind === "home"
        ? -Infinity
        : action.kind === "end"
          ? Infinity
          : action.delta * splitterDirectionSign(options.direction());
    const next = resolveColumnResize({ widths: getWidths(), index, delta, min });
    setWidths(next);
    sync();
  };
  handle.addEventListener("keydown", onKeyDown);

  return () => {
    handle.removeEventListener("keydown", onKeyDown);
    handle.removeEventListener("dblclick", reset);
    unbind();
    unsubscribe();
    machine.stop();
    handle.remove();
  };
}

/**
 * The natural, single-line width column `columnIndex` needs to show EVERY currently-rendered cell
 * in it without wrapping or truncating. What a spreadsheet's own double-click-the-border
 * convention measures, and `Table`'s own `resetWidth` (`components/table.ts`).
 *
 * Clones each cell into a throwaway, `table-layout: auto` table (off-screen, `visibility: hidden`,
 * never painted) and reads the CLONE's own rendered width, rather than reading anything off the
 * real cell. Confirmed against a real table, not assumed, that NEITHER of the two techniques that
 * look like they should work actually does:
 *   - The real cell's own `scrollWidth`, even under a temporary `white-space: nowrap`, never moves:
 *     a `table-layout: fixed` cell's box is held at its `<col>`'s width no matter how much (or how
 *     little) text it holds. Measuring it can only ever answer "what is this column right now",
 *     the very thing this gesture is about to overwrite, never "what does the content need".
 *   - `overflow: hidden` does not rescue that read either, and for a reason worth stating plainly:
 *     `scrollWidth` is SPECIFIED as `max(clientWidth, content width)`, which means it can reveal
 *     content WIDER than the box (a real overflow) but can never report NARROWER. A column that is
 *     already too generous for its content has nothing to "scroll", so `scrollWidth` just echoes
 *     `clientWidth` back, and a spreadsheet's auto-fit needs exactly that direction too (SHRINKING
 *     an over-wide column is the common case, not just growing a truncated one).
 * A detached, unconstrained clone sidesteps both problems at once: nothing there is held to any
 * `<col>`, so its rendered width is simply what the content needs, in either direction. The clone
 * keeps the ORIGINAL cell's classes (via the ruler table's own `className`, so ancestor selectors
 * like `.sk-table :is(th, td)` still match) and any inline styles, so the measured width reflects
 * the real padding/font/box-sizing, not a guess reconstructed property by property. The resizer
 * handle itself is stripped from the clone first: `cloneNode(true)` would otherwise duplicate that
 * `position: absolute` child too, which contributes nothing to the width but does not belong in a
 * detached copy either.
 *
 * All clones are built and attached in ONE batch, and only THEN read. One forced layout for the
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
 *. Every `.sk-splitter` fills `100%` of its containing block by default, this is how a caller asks
 * for something taller) matched to `container`'s own rendered extent for as long as the returned
 * cleanup is never called. Unlike `watchColumnLayout`'s one-shot seed, this never disconnects on
 * its own: resizing a column can change how many lines a cell WRAPS to, which changes the table's
 * own height mid-gesture, so the column line every `.sk-splitter` inside it draws has to keep
 * tracking a moving target for the resizable table's whole lifetime, not just once at mount.
 *
 * `measure` defaults to `container`'s own full rendered height. Right for a plain box, WRONG for
 * `Table`'s own call (`components/table.ts`): a `<caption>` renders outside the table's own grid
 * (`table.css`'s own note) but still inside the `<table>` ELEMENT's rendered box, so its own
 * `getBoundingClientRect().height` over-counts by the caption's height, while the resizer itself
 * starts at the header row (it lives inside a `<th>`), not the caption above it. Left at the
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
