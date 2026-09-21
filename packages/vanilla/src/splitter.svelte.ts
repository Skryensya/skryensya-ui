import { resolveWeightedColumnWidths } from "@skryensya/core/splitter";
import { flushSync, mount, unmount } from "svelte";
import ColumnResizer from "./components/ColumnResizer.svelte";

/*
 * SPLITTER, the imperative binding for a COLUMN-RESIZE handle. The pointer/keyboard wiring
 * `@skryensya/core/splitter`'s own banner leaves to each binding, now written ONCE instead of once
 * per consumer: Treegrid's column resizer and a plain Table's both attach one of these per column
 * boundary, and until this file existed the two copied each other's press-vs-drag arming, RTL sign
 * and keyboard handling byte for byte. What stays OUTSIDE this function, on purpose, is the value
 * model: the caller hands over `getWidths`/`setWidths` closures over ITS OWN width state (a
 * `<col>` array read via inline styles today, in principle anything), so this file never has to
 * know where the numbers live, only how a "Window Splitter" gesture turns into a call against them.
 *
 * The Zag machine itself, and everything that touches it (`useMachine`, keyboard, reset, ARIA), lives
 * in `ColumnResizer.svelte`, not here: `attachColumnResizer` mounts ONE instance of it per column
 * boundary. `useMachine` needs a REAL mounted Svelte component for its internal `onMount` - confirmed
 * empirically against this file's own test suite, which calls `attachColumnResizer` with no ambient
 * component at all. `$effect.root()` alone gets past `effect_orphan` but still throws
 * `lifecycle_outside_component` right behind it, so `attachColumnResizer` itself uses no runes of its
 * own; it only ever calls `mount`/`unmount`, the same primitive `svelte-hydrate.ts` uses for every
 * other enhancer.
 *
 * `createColumnWidths` below is the other reason this file needs `.svelte.ts`: `useMachine`'s own
 * `panels`/`size` props are read through a Svelte `$derived`, which CACHES - unlike `VanillaMachine`'s
 * `prop()`, which re-read the caller's `getWidths()` closure from scratch on every single poll, with
 * no caching at all. A width that changes through anything Svelte cannot see (Table's/Treegrid's own
 * `watchColumnLayout` re-seed, `<col>.style.width` written directly) left the cached derived stale
 * forever - measured directly: a treegrid re-seeded while hidden kept resizing against its ORIGINAL,
 * pre-seed widths. `createColumnWidths` makes the width array itself a Svelte `$state`, so every
 * writer (drag, keyboard, reset, a `watchColumnLayout` re-seed) goes through a tracked setter and the
 * cached derived invalidates correctly, restoring the always-fresh guarantee `VanillaMachine` gave for
 * free.
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
  /**
   * `createColumnWidths`'s own reactive tick, when the caller has one (`table.ts`/`treegrid.ts` both
   * do; this file's own test suite, calling `attachColumnResizer` directly with plain closures,
   * does not). Read by `ColumnResizer.svelte`'s `useMachine` props thunk purely so Svelte has a
   * genuine dependency to invalidate on: Zag's OWN `panels`/`size` come from that same call to
   * `getWidths()`, but a `$derived` never re-runs on its own just because a PLAIN function it calls
   * would now return something different. Omitted, those props are computed once, at mount, and
   * never again - correct only when nothing outside this function's own return ever changes the
   * widths, which is exactly this file's own test suite's case.
   */
  readonly tick?: () => number;
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

/**
 * A `<col>` group's own width bookkeeping, paired with a Svelte `$state` TICK that
 * `attachColumnResizer`'s own doc explains the need for. `col.style.width` stays the one real source
 * of truth for the WIDTHS themselves (`getWidths` still reads it fresh, exactly as before): trying to
 * mirror it into `$state` as a second source instead - the first shape this took - regresses the
 * moment anything writes `col.style.width` OUTSIDE `setWidths` (this file's own test suite widens
 * columns that way, standing in for a real browser's own layout, and a resizable table mounted while
 * hidden gets its very FIRST real measurement the same way), since that write would then reach the
 * DOM but never the mirror. `tick` fixes only the actual gap: it exists purely so
 * `ColumnResizer.svelte`'s `useMachine` props thunk has something genuinely Svelte-reactive to depend
 * on, bumped on every `setWidths` call, forcing Zag's own cached `panels`/`size` to re-derive.
 */
export function createColumnWidths(
  cols: readonly HTMLTableColElement[],
  seed: readonly number[],
): {
  readonly getWidths: () => readonly number[];
  readonly setWidths: (next: readonly number[]) => void;
  readonly tick: () => number;
} {
  let tick = $state(0);
  const getWidths = (): readonly number[] => cols.map((col) => Number.parseFloat(col.style.width) || 0);
  const setWidths = (next: readonly number[]): void => {
    cols.forEach((col, i) => {
      if (next[i] !== undefined) col.style.width = `${next[i]}px`;
    });
    tick += 1;
  };
  setWidths(seed);
  return {
    getWidths,
    setWidths,
    tick: () => tick,
  };
}

let splitterId = 0;

/**
 * Attaches one Zag-backed column-resize handle and returns its own cleanup.
 *
 * Mounts `ColumnResizer.svelte` onto a handle this function creates itself: `useMachine` needs a
 * REAL mounted Svelte component for its internal `onMount` (Svelte's own `lifecycle_outside_component`
 * otherwise - confirmed empirically, `$effect.root` alone gets past `effect_orphan` but not that),
 * and there is no authored `[data-sk-*]` root here for `createConnectMount` to scan: Table's and
 * Treegrid's own `connect(root)` call this once per column boundary, not once per component.
 */
export function attachColumnResizer(options: ColumnResizerOptions): () => void {
  const { root, th, index, getWidths, setWidths, tick, min, ariaLabel, className, resetWidth, direction } = options;
  const doc = th.ownerDocument;
  const rootId = root.id || `sk-zag-splitter-${++splitterId}`;
  if (!root.id) root.id = rootId;

  const handle = doc.createElement("div");
  handle.className = `${className} sk-splitter`;
  handle.setAttribute("aria-label", ariaLabel);
  handle.setAttribute("data-sk-column-resizer", "");
  th.appendChild(handle);

  const app = mount(ColumnResizer, {
    target: handle,
    props: { handle, rootId, index, getWidths, setWidths, tick, min, direction, resetWidth },
  });
  // Mounting leaves the handle's attributes patched SYNCHRONOUSLY, same as every other enhancer
  // (`svelte-hydrate.ts`'s own note): `flushSync` runs the initial `$effect` before returning.
  flushSync();

  return () => {
    void unmount(app);
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
