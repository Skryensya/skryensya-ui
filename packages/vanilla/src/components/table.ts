import { tableParts } from "@skryensya/core/table";
import {
  parseColumnWeights,
  resolveWeightedColumnWidths,
  SPLITTER_MIN_COLUMN_WIDTH as MIN_COLUMN_WIDTH,
} from "@skryensya/core/splitter";
import { createConnectMount } from "../runtime/svelte-hydrate.js";
import { attachColumnResizer, measureColumnContentWidth, watchColumnLayout, watchSplitterExtent } from "../splitter.js";

/*
 * TABLE, opt-in resizable columns only. A plain table needs no JavaScript at all otherwise
 * (`table.css`'s own header comment: "native table semantics stay native"), and this file exists
 * to keep that true. The root selector is scoped to `[data-resizable-columns]` itself, not a
 * separate `data-sk-table` mount marker every table would carry: the option's own attribute already
 * says whether to enhance, and a second marker restating that fact is the same "two ways to say one
 * thing" `treegrid.ts`'s own `SidebarResizeHandle` doc warns against. The rest. Seeding `<col>`
 * widths, wiring one resizer per column boundary. Is the identical mechanism Treegrid's own
 * `applyColumnGroup`/`connectColumnResize` use, minus the hierarchy: `readRows`/`ensureDisclosureButtons`
 * have no equivalent here, there is no tree to read.
 *
 * `:not([data-sk-treegrid])` matters: a resizable Treegrid is ALSO a `.sk-table` with
 * `data-resizable-columns` (Treegrid's own `also: ["sk-table"]`), and without this exclusion this
 * enhancer would try to mount a SECOND time onto the same `<table>` `mountTreegrid` already owns.
 */
const rootSelector = "table.sk-table[data-resizable-columns]:not([data-sk-treegrid])";

function connect(root: HTMLElement): () => void {
  if (!(root instanceof HTMLTableElement)) return () => {};
  const headerCells = Array.from(root.querySelectorAll<HTMLTableCellElement>(":scope > thead > tr > th"));
  const colCount = headerCells.length;
  // Nothing to resize with fewer than two columns: `resolveColumnResize` needs a pair.
  if (colCount < 2) return () => {};

  root.querySelector(":scope > colgroup[data-sk-table-colgroup]")?.remove();
  const colgroup = root.ownerDocument.createElement("colgroup");
  colgroup.setAttribute("data-sk-table-colgroup", "");
  /*
   * Measure the SCROLL WRAPPER, not the table itself. Same reasoning, same fix, as Treegrid's own
   * `applyColumnGroup`: at this exact moment no colgroup exists yet, so `table-layout: fixed` has
   * no column widths to size against and the table reports its own unconstrained CONTENT width
   * instead. A table authored without `TableScroll` (against this component's own convention) falls
   * back to measuring itself.
   */
  const measured = root.parentElement instanceof HTMLElement ? root.parentElement : root;
  /*
   * `columnWeights` (`data-column-weights`) lets a consumer give a content-heavy column a bigger
   * INITIAL share than a flat one: `resolveWeightedColumnWidths`'s own doc
   * (`@skryensya/core/splitter`) has the arithmetic. Missing or malformed, every column starts
   * equal, the behaviour before this option existed.
   */
  const weights = parseColumnWeights(root.getAttribute("data-column-weights"), colCount) ??
    Array.from({ length: colCount }, () => 1);
  /*
   * CSS's separated-border table model (`border-collapse: separate`, what `.sk-table` uses) paints
   * a table's own border OUTSIDE the width its `width` property/`<col>` sum describes, regardless
   * of `box-sizing`. Confirmed against a real render, not assumed: seeding straight off the
   * wrapper's width rendered the table 2px wider than the wrapper itself (one border width per
   * side), a permanent horizontal scrollbar a resizable table should never carry. Read once, off
   * the table's own computed style rather than the design token directly, so a themed override
   * (a consumer's own thicker border) is still accounted for correctly.
   */
  const borderWidth = (() => {
    const style = getComputedStyle(root);
    // `|| 0`, not a bare `parseFloat`: an environment with no real stylesheet cascade (this
    // enhancer's own test suite) reports `borderLeftWidth` as `""`, and `parseFloat("")` is `NaN`
    //. Left unguarded, that `NaN` propagates through every width this function computes.
    return (Number.parseFloat(style.borderLeftWidth) || 0) + (Number.parseFloat(style.borderRightWidth) || 0);
  })();
  const availableWidth = (total: number) => Math.max(0, total - borderWidth);
  const seedWidths = resolveWeightedColumnWidths({
    total: availableWidth(measured.getBoundingClientRect().width),
    weights,
    min: MIN_COLUMN_WIDTH,
  });
  const cols: HTMLTableColElement[] = [];
  for (let i = 0; i < colCount; i++) {
    const col = root.ownerDocument.createElement("col");
    col.style.width = `${seedWidths[i]}px`;
    colgroup.append(col);
    cols.push(col);
  }
  root.insertBefore(colgroup, root.firstChild);
  /*
   * An explicit pixel WIDTH on the table itself, not left at `table.css`'s implicit `width: 100%`
   *; see `treegrid.css`'s own note on why `auto`/`100%` is not safe for a `table-layout: fixed`
   * table sized against its containing block: Chromium's real redistribution algorithm hands any
   * surplus to whichever columns have the most unbreakable `nowrap` content instead of leaving
   * every column at its authored width. Resizing never has to touch this again: `resolveColumnResize`
   * conserves the touched pair's own total, so the table's OWN total is an invariant of every
   * resize, set correctly exactly once, here.
   */
  root.style.width = `${seedWidths.reduce((sum, width) => sum + width, 0)}px`;
  /*
   * That measurement can still be wrong, though: a table mounted while its own ancestor is
   * `display: none` (a docs preview panel not yet the selected binding tab, a closed accordion, an
   * inactive tab panel) measures 0 the whole time it stays hidden, and the floor above stands in
   * forever unless something re-measures once real layout exists: `watchColumnLayout`
   * (`../splitter.ts`, shared with `treegrid.ts`) is that one re-measurement, a no-op if this read
   * already succeeded.
   */
  const cleanupLayoutWatch = watchColumnLayout({
    measured,
    colCount,
    min: MIN_COLUMN_WIDTH,
    weights,
    adjustTotal: availableWidth,
    apply: (nextWidths) => {
      cols.forEach((col, i) => (col.style.width = `${nextWidths[i]}px`));
      root.style.width = `${nextWidths.reduce((sum, width) => sum + width, 0)}px`;
    },
  });

  const resizeLabel = root.getAttribute("data-resize-label") ?? "";
  const widths = () => cols.map((col) => Number.parseFloat(col.style.width) || 0);
  const setWidths = (next: readonly number[]) => next.forEach((w, i) => (cols[i]!.style.width = `${w}px`));

  const cleanups: (() => void)[] = [
    cleanupLayoutWatch,
    /*
     * A `<caption>` renders OUTSIDE the table's own grid (`table.css`'s own note) but still inside
     * the `<table>` element's own rendered box, so measuring the table's own full height would
     * over-count by the caption's. The resizer itself starts at the header row (it lives inside a
     * `<th>`), not the caption above it. Measured from the first row down instead, so the line
     * matches exactly what the resizer can actually reach.
     */
    watchSplitterExtent(root, (table) => {
      const firstRow = table.querySelector(":scope > * > tr");
      if (!(firstRow instanceof HTMLElement)) return table.getBoundingClientRect().height;
      return table.getBoundingClientRect().bottom - firstRow.getBoundingClientRect().top;
    }),
  ];
  headerCells.forEach((th, index) => {
    // The LAST column has no next neighbor to redistribute width with.
    if (index >= headerCells.length - 1) return;
    if (th.querySelector(":scope > [data-sk-column-resizer]")) return;

    const headerText = th.textContent?.trim() ?? "";
    cleanups.push(
      attachColumnResizer({
        th,
        index,
        getWidths: widths,
        setWidths,
        min: MIN_COLUMN_WIDTH,
        ariaLabel: resizeLabel ? `${resizeLabel}: ${headerText}` : headerText,
        direction: () => (getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr"),
        className: tableParts.columnResizer,
        // Double-click/Enter fits the column to its own content. A plain table's data-driven
        // default, distinct from Treegrid's own even-split reset (`splitter.ts`'s own doc).
        resetWidth: () => measureColumnContentWidth({ table: root, columnIndex: index, min: MIN_COLUMN_WIDTH }),
      }),
    );
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

export const mountTable = createConnectMount({
  key: "table",
  rootSelector,
  connect,
});
