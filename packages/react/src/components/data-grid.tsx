import { dataGridFocusableSelector, dataGridParts, resolveDataGridKey, type DataGridFocus } from "@skryensya/core/data-grid";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * DATA GRID, the React binding — composable, one component per `data-grid.ts` signature, the same
 * shape `treegrid.tsx` already uses for the same reason: rows are authored flat JSX (`DataGridRow`/
 * `DataGridCell`, the way a `TableRow`/`TableCell` is), so `DataGrid` (the root) reads that authored
 * tree once, synchronously, off `children`, to know the row/column SHAPE `resolveDataGridKey` needs
 * — never a registry any child populates as it renders. What differs from `Treegrid`: there is no
 * expand state, and the roving-tabindex UNIT for a cell is either the cell itself or the ONE
 * interactive element it contains, resolved from the real DOM after mount (the pattern's own rule: a
 * cell "preserves the semantics of its descendant elements" rather than reinterpreting them).
 */

type DataGridContextValue = {
  isStop: (row: number, col: number) => boolean;
  onCellClick: (row: number, col: number) => void;
  registerCell: (row: number, col: number, element: HTMLElement | null) => void;
};

const DataGridContext = createContext<DataGridContextValue | null>(null);

function useDataGridContext(component: string): DataGridContextValue {
  const context = useContext(DataGridContext);
  if (!context) throw new Error(`DataGrid.${component} must be rendered inside DataGrid.`);
  return context;
}

type DataGridRowShape = { colCount: number };

/** `Grid`'s own children → each `GridRow`'s `GridCell` count — a plain, synchronous read of props,
 *  never how many are actually focusable (that's a DOM fact, resolved after mount instead). */
function readRows(children: ReactNode): DataGridRowShape[] {
  return Children.toArray(children)
    .filter((child): child is ReactElement<{ children?: ReactNode }> => isValidElement(child) && child.type === DataGridRow)
    .map((row) => ({ colCount: Children.count(row.props.children) }));
}

export type DataGridProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: string;
  children: ReactNode;
  /** Right/Left wraps into the next/previous row instead of stopping at the row's edge. */
  wrapCols?: boolean;
  /** Up/Down wraps past the first/last row. */
  wrapRows?: boolean;
};

export function DataGrid({ children, className, label, wrapCols = false, wrapRows = false, ...props }: DataGridProps) {
  const [focus, setFocus] = useState<DataGridFocus>({ row: 0, col: 0 });
  const elements = useRef(new Map<string, HTMLElement>());
  const key = (row: number, col: number) => `${row}:${col}`;

  const rows = useMemo(() => readRows(children), [children]);
  const rowCount = rows.length;
  const colCountOf = (row: number) => rows[row]?.colCount ?? 0;

  /** Reads real DOM focus instead of trusting `focus` state alone — the same reasoning
   *  `treegrid.tsx` documents: something other than this component's own handlers (an app's own
   *  focus management, a test) can move real focus without going through `moveFocus`. */
  const currentFocus = (): DataGridFocus => {
    const active = document.activeElement;
    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCountOf(row); col++) {
        if (elements.current.get(key(row, col)) === active) return { row, col };
      }
    }
    return focus;
  };

  const moveFocus = (next: DataGridFocus) => {
    setFocus(next);
    elements.current.get(key(next.row, next.col))?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || !rowCount) return;
    const action = resolveDataGridKey({
      key: event.key,
      ctrl: event.ctrlKey || event.metaKey,
      focus: currentFocus(),
      rowCount,
      colCountOf,
      wrapRows,
      wrapCols,
    });
    if (action.kind === "none") return;
    event.preventDefault();
    moveFocus(action.focus);
  };

  const context: DataGridContextValue = {
    isStop: (row, col) => focus.row === row && focus.col === col,
    onCellClick: (row, col) => setFocus({ row, col }),
    registerCell: (row, col, element) => {
      const mapKey = key(row, col);
      if (element) elements.current.set(mapKey, element);
      else elements.current.delete(mapKey);
    },
  };

  // Each row's own index, so `DataGridRow` can hand it down to a cell that did not author its own
  // `row` — the structural default `readRows` above already derives the same way.
  const injectedChildren = Children.map(children, (child, index) =>
    isValidElement(child) && child.type === DataGridRow
      ? cloneElement(child as ReactElement<Record<string, unknown>>, { rowIndex: index })
      : child,
  );

  return (
    <DataGridContext.Provider value={context}>
      <div
        {...props}
        aria-label={label}
        className={cx(dataGridParts.root, className)}
        onKeyDown={onKeyDown}
        role="grid"
      >
        {injectedChildren}
      </div>
    </DataGridContext.Provider>
  );
}

export type DataGridRowProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & { children: ReactNode };

/** Injected by `DataGrid`, see the comment there — never author-set. */
type InjectedDataGridRowProps = DataGridRowProps & { rowIndex: number };

export function DataGridRow(publicProps: DataGridRowProps) {
  const { children, className, rowIndex, ...props } = publicProps as InjectedDataGridRowProps;
  useDataGridContext("Row");
  /*
   * Injects each cell's own column index, and — unless the cell already authored its OWN `row` —
   * this row's index too, the same reasoning `treegrid.tsx`'s own `TreegridRow` documents for
   * `TreegridCell`. A cell only needs to author `row` itself for the case this structural default
   * cannot cover: WAI's own layout-grid example wraps ONE logical row across several PHYSICAL
   * lines, so a "row" is not always the direct parent a plain nested composition would assume.
   */
  const cells = Children.map(children, (child, index) =>
    isValidElement(child) && child.type === DataGridCell
      ? cloneElement(child as ReactElement<Record<string, unknown>>, {
          column: index,
          row: (child.props as { row?: number }).row ?? rowIndex,
        })
      : child,
  );
  return (
    <div {...props} className={cx(dataGridParts.row, className)} role="row">
      {cells}
    </div>
  );
}

export type DataGridCellProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  /**
   * Which row this cell belongs to. Computed automatically from nesting (the containing
   * `DataGridRow`'s own position) for the common case; author it directly only for the case that
   * structural default cannot cover — WAI's own layout-grid example wraps one logical row across
   * several physical lines, so a cell's row membership is not always its direct parent.
   */
  row?: number;
};

/** `column`/`row` are injected by the parent `GridRow`, see the comment there — never author-set
 *  for the common case; `row` only when a cell needs to override the structural default. */
type InjectedDataGridCellProps = DataGridCellProps & { column: number; row: number };

export function DataGridCell(publicProps: DataGridCellProps) {
  const { children, className, column, row, ...props } = publicProps as InjectedDataGridCellProps;
  const context = useDataGridContext("Cell");
  const stop = context.isStop(row, column);
  return (
    <div
      {...props}
      className={cx(`${dataGridParts.cell} sk-interactive`, className)}
      onClick={(event) => {
        props.onClick?.(event);
        context.onCellClick(row, column);
      }}
      ref={(element) => {
        // The roving-tabindex UNIT: the cell's own interactive descendant if it has one, the cell
        // itself otherwise — resolved from the real DOM, never guessed from what was authored.
        // `tabIndex` is set imperatively, HERE, on whichever one actually is the unit, rather than
        // also as a JSX prop below — the two must never both claim tabIndex="0" at once, or a
        // single roving stop becomes two.
        const target = element ? (element.querySelector<HTMLElement>(dataGridFocusableSelector) ?? element) : null;
        context.registerCell(row, column, target);
        if (target) target.tabIndex = stop ? 0 : -1;
        if (element && target !== element) element.removeAttribute("tabindex");
      }}
      role="gridcell"
    >
      {children}
    </div>
  );
}
