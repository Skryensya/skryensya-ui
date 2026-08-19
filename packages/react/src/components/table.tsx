import { tableParts } from "@skryensya/core/table";
import {
  hasCrossedDragThreshold,
  resolveColumnResize,
  resolveSplitterKey,
  resolveWeightedColumnWidths,
  splitterDirectionSign,
  splitterValuePercent,
  SPLITTER_MIN_COLUMN_WIDTH as MIN_COLUMN_WIDTH,
} from "@skryensya/core/splitter";
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";

type WithChildren<T> = T & { children: ReactNode };

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * `resizableColumns`'s own state, `Table`-scoped context — everything below this point is new; the
 * REST of this file (TableScroll, TableCaption, TableFoot, TableBody, TableCell) is untouched,
 * because a plain table (the overwhelming default) still renders exactly what it always did. Same
 * shape Treegrid's own context takes: the width array plus a raw setter, never a `resizeColumn(i,
 * delta)` helper, because `TableColumnResizer` needs two different update shapes from the SAME
 * state — incremental from the keyboard, computed fresh against a drag's OWN start snapshot from
 * the pointer.
 */
type TableContextValue = {
  resizableColumns: boolean;
  resizeLabel?: string;
  columnWidths: readonly number[];
  setColumnWidths: (widths: readonly number[]) => void;
  /** `TableColumnResizer`'s own access to the whole table, not just its column pair — measuring
   * "what does THIS column's content need" (`measureColumnContentWidth`, below) reads every row,
   * something the width-pair state alone can never answer. */
  tableRef: RefObject<HTMLTableElement | null>;
};

const TableContext = createContext<TableContextValue | null>(null);

function useTableContext(component: string): TableContextValue {
  const context = useContext(TableContext);
  if (!context) throw new Error(`Table.${component} must be rendered inside Table.`);
  return context;
}

export type TableScrollProps = WithChildren<HTMLAttributes<HTMLDivElement>> & {
  stickyColumn?: boolean;
  stickyHeader?: boolean;
};
export type TableProps = Omit<TableHTMLAttributes<HTMLTableElement>, "children"> & {
  children: ReactNode;
  /**
   * Opt-in: a `.sk-splitter` drag handle between each pair of column headers, WAI-ARIA APG's
   * "Window Splitter" pattern — see `table.ts`'s own option doc for why this defaults to off.
   */
  resizableColumns?: boolean;
  /** Required whenever `resizableColumns` is on — see `table.ts`'s `resizeLabel` option doc. */
  resizeLabel?: string;
  /**
   * The INITIAL share of the table's width each column claims before any drag, one positive number
   * per column — see `table.ts`'s identical `columnWeights` option and
   * `resolveWeightedColumnWidths` (`@skryensya/core/splitter`). Omitted, every column starts equal,
   * the behaviour before this prop existed.
   */
  columnWeights?: readonly number[];
};
export type TableCaptionProps = WithChildren<HTMLAttributes<HTMLTableCaptionElement>>;
export type TableHeadProps = WithChildren<HTMLAttributes<HTMLTableSectionElement>>;
export type TableFooterProps = WithChildren<HTMLAttributes<HTMLTableSectionElement>>;
export type TableBodyProps = WithChildren<HTMLAttributes<HTMLTableSectionElement>>;
export type TableRowProps = WithChildren<HTMLAttributes<HTMLTableRowElement>>;
export type TableHeaderProps = WithChildren<ThHTMLAttributes<HTMLTableCellElement>>;
export type TableCellProps = WithChildren<TdHTMLAttributes<HTMLTableCellElement>>;

export const TableScroll = forwardRef<
  HTMLDivElement,
  TableScrollProps
>(function TableScroll(
  {
    children,
    className,
    stickyColumn = false,
    stickyHeader = false,
    ...props
  },
  ref,
) {
  return (
    <div
      data-sticky-column={stickyColumn ? "" : undefined}
      data-sticky-header={stickyHeader ? "" : undefined}
      {...props}
      ref={ref}
      className={cx(tableParts.scroll, className)}
    >
      {children}
    </div>
  );
});

/**
 * `Table`'s own head-row column count — walked ONCE, synchronously, off `children`, the same "read
 * the authored tree top-down" shape `Treegrid`'s own `readRows` uses. Only ever matters when
 * `resizableColumns` is on; a plain table never has to pay for this at all (the effect below
 * short-circuits before it runs).
 */
function readHeadColumnCount(children: ReactNode): number {
  const head = Children.toArray(children).find(
    (child): child is ReactElement<{ children?: ReactNode }> => isValidElement(child) && child.type === TableHead,
  );
  if (!head) return 0;
  const firstRow = Children.toArray(head.props.children).find(
    (child): child is ReactElement<{ children?: ReactNode }> => isValidElement(child) && child.type === TableRow,
  );
  return firstRow ? Children.count(firstRow.props.children) : 0;
}

/**
 * The natural, single-line width column `columnIndex` needs to show EVERY currently-rendered cell
 * in it without wrapping or truncating — the spreadsheet double-click-the-border convention.
 * Verbatim port of `@skryensya/vanilla/splitter`'s `measureColumnContentWidth` — same technique,
 * same reasoning, ported line for line rather than shared, because React and vanilla never share
 * DOM-touching code (only `core/splitter.ts` is common ground between them, see that file's own
 * banner). Two things confirmed against a real table before landing on this approach, not assumed:
 *   - The real cell's own `scrollWidth`, even under `white-space: nowrap`, never moves — a
 *     `table-layout: fixed` cell is held at its `<col>`'s width regardless of its content, so
 *     reading it can only ever answer "what is this column right now", never "what does the
 *     content need" (the very thing this gesture is about to overwrite).
 *   - `overflow: hidden` does not rescue that read: `scrollWidth` is SPECIFIED as
 *     `max(clientWidth, content width)`, so it can reveal content WIDER than the box but can never
 *     report NARROWER — a column already too generous for its content has nothing to "scroll", so
 *     `scrollWidth` just echoes `clientWidth` back. Auto-fit needs the shrinking direction too.
 * A clone in a throwaway `table-layout: auto` table (off-screen, `visibility: hidden`, batched —
 * every clone built and attached in ONE pass, only THEN read, one forced layout for the whole
 * column instead of one per cell) sidesteps both: nothing there is held to any `<col>`, so its
 * rendered width is simply what the content needs, either direction. `className` carries over so
 * ancestor selectors like `.sk-table :is(th, td)` still match, and the resizer handle itself is
 * stripped first — `cloneNode(true)` would otherwise duplicate that `position: absolute` child too.
 */
function measureColumnContentWidth(table: HTMLTableElement, columnIndex: number, min: number): number {
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

export function Table({
  children,
  className,
  resizableColumns = false,
  resizeLabel,
  columnWeights,
  ...props
}: TableProps) {
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [columnWidths, setColumnWidths] = useState<readonly number[]>([]);

  useEffect(() => {
    if (!resizableColumns) return;
    const table = tableRef.current;
    if (!table) return;
    const colCount = readHeadColumnCount(children);
    if (colCount < 2) return; // nothing to resize with fewer than two columns
    /*
     * Measure the SCROLL WRAPPER, not the table itself — see `treegrid.tsx`'s identical effect for
     * the full reasoning: at this exact moment no colgroup exists yet, so `table-layout: fixed` has
     * no column widths to size against and the table reports its own unconstrained CONTENT width.
     *
     * NOT a one-shot read, though: a table can mount while its own ancestor is `display: none`
     * (measured live — a docs preview panel not yet the selected binding tab reads 0 the whole time
     * it stays hidden, exactly like a closed accordion or an inactive tab panel would), and 0 ÷
     * colCount seeds every column at the min floor, permanently. `ResizeObserver` keeps watching
     * until the FIRST real, nonzero width arrives, seeds from it, and disconnects.
     */
    const measured = table.parentElement instanceof HTMLElement ? table.parentElement : table;
    // `columnWeights`, falling back to an equal split — `resolveWeightedColumnWidths`'s own doc
    // (`@skryensya/core/splitter`) explains why an equal split is not always the right seed.
    const weights = columnWeights ?? Array.from({ length: colCount }, () => 1);
    /*
     * CSS's separated-border table model (`border-collapse: separate`, what `.sk-table` uses)
     * paints a table's own border OUTSIDE the width its `width` property/`<col>` sum describes,
     * regardless of `box-sizing` — confirmed against a real render, not assumed: seeding straight
     * off the wrapper's width rendered the table 2px wider than the wrapper itself (one border
     * width per side), a permanent horizontal scrollbar a resizable table should never carry.
     * Verbatim port of the vanilla enhancer's identical `borderWidth` read (`components/table.ts`).
     */
    const borderWidth = (() => {
      const style = getComputedStyle(table);
      // `|| 0`, not a bare `parseFloat`: an environment with no real stylesheet cascade (this
      // component's own test suite) reports `borderLeftWidth` as `""`, and `parseFloat("")` is
      // `NaN` — left unguarded, that `NaN` propagates through every width this effect computes.
      return (Number.parseFloat(style.borderLeftWidth) || 0) + (Number.parseFloat(style.borderRightWidth) || 0);
    })();

    // Guards against a callback already in flight the instant `disconnect()` is called — a real
    // race, not a hypothetical one, since `ResizeObserver` batches and delivers on the next frame.
    let seeded = false;
    const seedFrom = (rawWidth: number): boolean => {
      const width = Math.max(0, rawWidth - borderWidth);
      if (seeded || width <= 0) return false;
      seeded = true;
      const seeds = resolveWeightedColumnWidths({ total: width, weights, min: MIN_COLUMN_WIDTH });
      setColumnWidths(seeds);
      /*
       * An explicit pixel WIDTH on the table itself — see `treegrid.tsx`'s identical write for why
       * `table-layout: fixed` sized `auto`/`100%` is not safe: Chromium's real redistribution
       * algorithm hands any surplus to whichever columns have the most unbreakable `nowrap` content
       * rather than leaving every column at its authored width.
       */
      table.style.width = `${seeds.reduce((sum, w) => sum + w, 0)}px`;
      return true;
    };

    if (seedFrom(measured.getBoundingClientRect().width)) return;
    const observer = new ResizeObserver((entries) => {
      if (seedFrom(entries[0]?.contentRect.width ?? 0)) observer.disconnect();
    });
    observer.observe(measured);
    return () => observer.disconnect();
    // A mount concern, like the vanilla enhancer's own one-time measurement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizableColumns]);

  /*
   * `--sk-splitter-block-size` (the splitter pattern's own opt-in hook, `patterns/splitter.css`),
   * kept matched to the table's own rendered height for as long as `resizableColumns` stays on —
   * verbatim port of `@skryensya/vanilla/splitter`'s `watchSplitterExtent`. Unlike the width effect
   * above, this never disconnects on its own: resizing a column can change how many lines a cell
   * WRAPS to, which changes the table's own height mid-gesture, so the column line every
   * `.sk-splitter` draws has to keep tracking a moving target for the whole lifetime, not just once.
   */
  useEffect(() => {
    if (!resizableColumns) return;
    const table = tableRef.current;
    if (!table) return;
    const apply = () => {
      /*
       * A `<caption>` renders OUTSIDE the table's own grid (`table.css`'s own note) but still
       * inside the `<table>` element's own rendered box, so the table's own full height over-counts
       * by the caption's — the resizer itself starts at the header row (it lives inside a `<th>`),
       * not the caption above it. Measured from the first row down instead, matching the vanilla
       * enhancer's identical `watchSplitterExtent` call verbatim (`@skryensya/vanilla/splitter`).
       */
      const firstRow = table.querySelector(":scope > * > tr");
      const height =
        firstRow instanceof HTMLElement
          ? table.getBoundingClientRect().bottom - firstRow.getBoundingClientRect().top
          : table.getBoundingClientRect().height;
      table.style.setProperty("--sk-splitter-block-size", `${height}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(table);
    return () => observer.disconnect();
  }, [resizableColumns]);

  const context: TableContextValue = { resizableColumns, resizeLabel, columnWidths, setColumnWidths, tableRef };

  return (
    <TableContext.Provider value={context}>
      <table
        {...props}
        className={cx(tableParts.root, className)}
        data-resizable-columns={resizableColumns ? "" : undefined}
        ref={tableRef}
      >
        {resizableColumns && columnWidths.length > 0 ? (
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={index} style={{ width: `${width}px` }} />
            ))}
          </colgroup>
        ) : null}
        {children}
      </table>
    </TableContext.Provider>
  );
}

export function TableCaption({ children, className, ...props }: TableCaptionProps) {
  return (
    <caption {...props} className={cx(tableParts.caption, className)}>
      {children}
    </caption>
  );
}

export function TableHead({ children, className, ...props }: TableHeadProps) {
  /*
   * `TableRow` is shared by `TableHead`/`TableBody`/`TableFooter` (a row-header pattern authors
   * `TableHeader` inside a BODY row too), so a resizer can only ever belong to a row that is
   * actually in the head — marked here, the one place that already knows which rows those are,
   * the same reasoning `TreegridRow`'s own column injection documents.
   */
  const headRows = Children.map(children, (child) =>
    isValidElement(child) && child.type === TableRow
      ? cloneElement(child as ReactElement<Record<string, unknown>>, { __isHeadRow: true })
      : child,
  );
  return (
    <thead {...props} className={cx(tableParts.head, className)}>
      {headRows}
    </thead>
  );
}

export function TableFooter({ children, className, ...props }: TableFooterProps) {
  return (
    <tfoot {...props} className={cx(tableParts.foot, className)}>
      {children}
    </tfoot>
  );
}

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody {...props} className={cx(tableParts.body, className)}>
      {children}
    </tbody>
  );
}

/** `__isHeadRow` is injected by the parent `TableHead`, see the comment there — never author-set. */
type InjectedTableRowProps = TableRowProps & { __isHeadRow?: boolean };

export function TableRow(publicProps: TableRowProps) {
  const { children, className, __isHeadRow, ...props } = publicProps as InjectedTableRowProps;
  const columnCount = Children.count(children);
  /*
   * Only a HEAD row's `TableHeader` children get a column index — a row-header inside `TableBody`
   * (`<TableHeader scope="row">`) stays exactly as authored, so it never grows a resizer of its own.
   */
  const cells = __isHeadRow
    ? Children.map(children, (child, index) =>
        isValidElement(child) && child.type === TableHeader
          ? cloneElement(child as ReactElement<Record<string, unknown>>, { columnIndex: index, columnCount })
          : child,
      )
    : children;
  return (
    <tr {...props} className={cx(tableParts.row, className)}>
      {cells}
    </tr>
  );
}

/** `columnIndex`/`columnCount` are injected by the parent `TableRow` ONLY for a head row, see the
 * comment there — never author-set. */
type InjectedTableHeaderProps = TableHeaderProps & { columnIndex?: number; columnCount?: number };

export function TableHeader(publicProps: TableHeaderProps) {
  const { children, className, scope = "col", columnIndex, columnCount, ...props } =
    publicProps as InjectedTableHeaderProps;
  const context = useContext(TableContext);
  const headerRef = useRef<HTMLTableCellElement>(null);
  // Never the LAST column — see `resolveColumnResize`'s own doc: a handle there would have no next
  // neighbor to redistribute width with.
  const resizable =
    Boolean(context?.resizableColumns) && columnIndex !== undefined && columnCount !== undefined && columnIndex < columnCount - 1;
  return (
    <th {...props} className={cx(tableParts.header, className)} ref={headerRef} scope={scope}>
      {children}
      {resizable ? <TableColumnResizer columnIndex={columnIndex!} headerRef={headerRef} /> : null}
    </th>
  );
}

/**
 * The drag edge for one column boundary — never authored, `TableHeader` renders one when
 * `resizableColumns` is on, this header is inside the head row, and it is not the last column.
 * Identical shape to Treegrid's own `TreegridColumnResizer`: same shared primitive
 * (`@skryensya/core/splitter`), same press-vs-drag threshold, RTL sign, keyboard mapping — the two
 * differ only in WHERE the width pair lives (this reads/writes `Table`'s own context instead of
 * Treegrid's).
 */
function TableColumnResizer({
  columnIndex,
  headerRef,
}: {
  columnIndex: number;
  headerRef: RefObject<HTMLTableCellElement | null>;
}) {
  const context = useTableContext("ColumnResizer");
  const dragRef = useRef<{ pointerId: number; startX: number; startWidths: readonly number[]; dragging: boolean } | null>(
    null,
  );

  const before = context.columnWidths[columnIndex] ?? 0;
  const after = context.columnWidths[columnIndex + 1] ?? 0;
  const total = before + after;
  const max = Math.max(MIN_COLUMN_WIDTH, total - MIN_COLUMN_WIDTH);
  const percent = splitterValuePercent(before, MIN_COLUMN_WIDTH, max);

  const direction = () =>
    splitterDirectionSign(headerRef.current && getComputedStyle(headerRef.current).direction === "rtl" ? "rtl" : "ltr");

  const resize = (delta: number) => {
    context.setColumnWidths(resolveColumnResize({ widths: context.columnWidths, index: columnIndex, delta, min: MIN_COLUMN_WIDTH }));
  };

  // Fits the column to its own content — the spreadsheet double-click convention, distinct from
  // Treegrid's own even-split reset (see `measureColumnContentWidth`'s own doc, above).
  const reset = () => {
    const table = context.tableRef.current;
    const target = table ? measureColumnContentWidth(table, columnIndex, MIN_COLUMN_WIDTH) : total / 2;
    resize(target - before);
  };

  return (
    <div
      aria-label={context.resizeLabel ? `${context.resizeLabel}: ${headerRef.current?.textContent?.trim() ?? ""}` : ""}
      aria-orientation="vertical"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={percent}
      className={cx(tableParts.columnResizer, "sk-splitter")}
      data-sk-column-resizer
      onDoubleClick={reset}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        const action = resolveSplitterKey(event);
        switch (action.kind) {
          case "delta":
            resize(action.delta * direction());
            break;
          case "home":
            resize(-Infinity);
            break;
          case "end":
            resize(Infinity);
            break;
          case "reset":
            event.preventDefault();
            reset();
            return;
          case "none":
            return;
        }
        event.preventDefault();
      }}
      onLostPointerCapture={(event: ReactPointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        dragRef.current = null;
        event.currentTarget.removeAttribute("data-dragging");
      }}
      onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startWidths: context.columnWidths, dragging: false };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        if (!drag.dragging) {
          if (!hasCrossedDragThreshold(drag.startX, event.clientX)) return;
          drag.dragging = true;
          drag.startX = event.clientX;
          drag.startWidths = context.columnWidths;
          event.currentTarget.setAttribute("data-dragging", "");
        }
        context.setColumnWidths(
          resolveColumnResize({
            widths: drag.startWidths,
            index: columnIndex,
            delta: (event.clientX - drag.startX) * direction(),
            min: MIN_COLUMN_WIDTH,
          }),
        );
      }}
      onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      role="separator"
      tabIndex={0}
    />
  );
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td {...props} className={cx(tableParts.cell, className)}>
      {children}
    </td>
  );
}
