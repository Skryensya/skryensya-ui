import {
  computeTreegridVisibility,
  defaultTreegridColumnWeights,
  diffTreegridVisibility,
  resolveColumnResize,
  resolveTreegridKey,
  treegridParts,
  TREEGRID_EXIT_FALLBACK_MS,
  TREEGRID_MIN_COLUMN_WIDTH as MIN_COLUMN_WIDTH,
  type TreegridFocus,
  type TreegridRowTransition,
} from "@skryensya/core/treegrid";
import {
  hasCrossedDragThreshold,
  resolveSplitterKey,
  resolveWeightedColumnWidths,
  splitterDirectionSign,
  splitterValuePercent,
} from "@skryensya/core/splitter";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type WithChildren<T> = T & { children: ReactNode };

/*
 * TREEGRID, the React binding — composable, one component per `treegrid.ts` signature, the same
 * shape `table.tsx` already uses for the parts that carry no behaviour (`TreegridHead`/
 * `TreegridHeadRow`/`TreegridColumnHeader` below are literally `table.tsx`'s header components,
 * renamed). Rows DO carry behaviour — expand/collapse, roving tabindex, arrow-key navigation — with
 * nowhere else to put it: unlike `TreeView`'s single data-driven `nodes` prop, an author here writes
 * flat `<TreegridRow>` JSX the same way they write a `<TableRow>`, so `Treegrid` (the root) reads
 * that authored tree ONCE, synchronously, off `children` — a plain top-down read of props, not a
 * registry any child populates as it renders — and hands the result down through context so
 * `TreegridRow`/`TreegridCell` only ever ask "am I hidden" / "am I the current stop", never recompute
 * either from scratch.
 */

type TreegridContextValue = {
  isRowStop: (id: string) => boolean;
  isCellStop: (id: string, col: number) => boolean;
  isHidden: (id: string) => boolean;
  isExpanded: (id: string) => boolean;
  /** `"entering"`/`"exiting"` for one animation's worth after a toggle, `undefined` at rest — see
   * `Treegrid`'s own effect for what drives it. */
  transitionOf: (id: string) => TreegridRowTransition;
  /** `column === 0` on a branch row toggles instead of just moving focus — same rule the vanilla
   * enhancer's own click handler applies. */
  onCellClick: (id: string, isBranch: boolean, col: number) => void;
  registerElement: (id: string, col: number | null, element: HTMLElement | null) => void;
  /** Opt-in column resizing — see `Treegrid`'s own `resizableColumns` prop doc. `columnWidths` is
   * the CURRENT px width of every column; `setColumnWidths` is the raw state setter, exposed
   * un-wrapped (not a `resizeColumn(index, delta)` helper) because `TreegridColumnResizer` needs
   * two different update shapes from the SAME state — an incremental one from the keyboard, and one
   * computed fresh against a drag's OWN start snapshot from the pointer — and hiding both behind one
   * method would just move the branch, not remove it. */
  resizableColumns: boolean;
  resizeLabel?: string;
  columnWidths: readonly number[];
  setColumnWidths: (widths: readonly number[]) => void;
};

const TreegridContext = createContext<TreegridContextValue | null>(null);

function useTreegridContext(component: string): TreegridContextValue {
  const context = useContext(TreegridContext);
  if (!context) throw new Error(`Treegrid.${component} must be rendered inside Treegrid.`);
  return context;
}

const focusKey = (id: string, col: number | null) => `${id}:${col ?? "row"}`;

type RowMeta = { id: string; level: number; isBranch: boolean; initiallyExpanded: boolean; colCount: number };

/**
 * `Treegrid`'s own children → its `TreegridBody` → that body's `TreegridRow` children's structural
 * props (`value`/`level`/`expanded`, and how many `TreegridCell`s each carries). Component-identity
 * checks (`.type === TreegridBody`), the standard compound-component constraint: a consumer composes
 * with these exports directly, the same assumption `Accordion.Item` already makes about `Accordion`.
 */
function readRows(children: ReactNode): RowMeta[] {
  const body = Children.toArray(children).find(
    (child): child is ReactElement<{ children?: ReactNode }> => isValidElement(child) && child.type === TreegridBody,
  );
  if (!body) return [];
  return Children.toArray(body.props.children)
    .filter(
      (child): child is ReactElement<TreegridRowProps> => isValidElement(child) && child.type === TreegridRow,
    )
    .map((row) => ({
      id: row.props.value,
      level: row.props.level,
      isBranch: row.props.expanded !== undefined,
      initiallyExpanded: row.props.expanded === true,
      colCount: Children.count(row.props.children),
    }));
}

export type TreegridScrollProps = WithChildren<HTMLAttributes<HTMLDivElement>>;
export function TreegridScroll({ children, className, ...props }: TreegridScrollProps) {
  return (
    <div {...props} className={cx(`${treegridParts.scroll} sk-table-scroll`, className)}>
      {children}
    </div>
  );
}

export type TreegridProps = Omit<HTMLAttributes<HTMLTableElement>, "onChange"> & {
  label: string;
  children: ReactNode;
  onExpandedChange?: (details: { value: string; expanded: boolean }) => void;
  onActivate?: (details: { value: string }) => void;
  /**
   * Opt-in: a `.sk-splitter` drag handle between each pair of column headers, WAI-ARIA APG's
   * "Window Splitter" pattern — see `treegrid.ts`'s own option doc for why this defaults to off.
   */
  resizableColumns?: boolean;
  /** Required whenever `resizableColumns` is on — see `treegrid.ts`'s `resizeLabel` option doc. */
  resizeLabel?: string;
  /**
   * The INITIAL share of the table's width each column claims before any drag, one positive number
   * per column — see `treegrid.ts`'s identical `columnWeights` option and
   * `resolveWeightedColumnWidths` (`@skryensya/core/splitter`). Omitted, falls back to
   * {@link defaultTreegridColumnWeights} rather than an equal split.
   */
  columnWeights?: readonly number[];
};

export function Treegrid({
  children,
  className,
  label,
  onActivate,
  onExpandedChange,
  resizableColumns = false,
  resizeLabel,
  columnWeights,
  ...props
}: TreegridProps) {
  // Lazy initializer: seeded from each row's OWN authored `expanded`, read once — a branch that
  // opens by default (`expanded` true) must not silently start collapsed just because state starts
  // empty. Later toggles only ever touch this map, never `readRows` again.
  const [expandedById, setExpandedById] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(readRows(children).map((row) => [row.id, row.initiallyExpanded])),
  );
  const [focus, setFocus] = useState<TreegridFocus>({ row: 0, col: null });
  const elements = useRef(new Map<string, HTMLElement>());
  /** The reverse of `elements` — which (row id, column) an element IS, for `currentFocus` below. */
  const elementKeys = useRef(new Map<HTMLElement, { id: string; col: number | null }>());

  const rows = useMemo(() => readRows(children), [children]);
  /*
   * `table-layout: fixed` needs an authoritative column count to size against — measured in
   * Chromium 1.42 that leaving it to infer from `<thead>`/`<tbody>` independently is unreliable: the
   * header's own two columns came back a different width than the first body row's, swapped, and
   * neither summed to the table's real rendered width. An explicit `<colgroup>` is the mechanism the
   * spec actually recommends for fixed layout, sidestepping whatever per-row-group heuristic the
   * browser was using instead. `Math.max`, not the first row's count: a ragged grid (rows with
   * different cell counts) still needs ONE column count for every row to size against.
   */
  const colCount = useMemo(() => Math.max(0, ...rows.map((row) => row.colCount)), [rows]);

  /*
   * `resizableColumns`'s own state: PX widths, one per column, seeded from the table's SCROLL
   * WRAPPER width (`measured width ÷ colCount`) — same reasoning, and same fix, as the vanilla
   * enhancer's `applyColumnGroup`: on the FIRST render `columnWidths` is still `[]`, so the colgroup
   * below renders no `<col>`s at all, and `table-layout: fixed` has nothing to size against — the
   * table reports its own unconstrained CONTENT width instead of the space it actually has (measured
   * with a wide fixture: four `white-space: nowrap` columns summed to far more than the container,
   * every seeded column oversized, pushing later columns' resizers entirely outside the scrollable
   * viewport). The wrapper (`TreegridScroll`'s own host, this table's parent) has no such problem: a
   * plain block box already laid out to the AVAILABLE space regardless of what its child reports. A
   * table authored without `TreegridScroll` (rare, and against this component's own convention)
   * falls back to measuring itself.
   *
   * NOT a one-shot `getBoundingClientRect()` at mount, though: a table can mount while its own
   * ancestor is `display: none` (measured live — a docs preview panel not yet the selected binding
   * tab reads 0 the whole time it stays hidden, exactly like a closed accordion or an inactive tab
   * panel would), and 0 ÷ colCount seeds every column at the min floor, permanently, since nothing
   * ever asks again. `ResizeObserver` keeps watching until the FIRST real, nonzero width arrives,
   * seeds from it, and disconnects — after that this is a mount concern again, exactly once, same
   * as before: re-seeding on every resize would fight a reader's own drag.
   */
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [columnWidths, setColumnWidths] = useState<readonly number[]>([]);
  useEffect(() => {
    if (!resizableColumns || colCount < 1) return;
    const table = tableRef.current;
    if (!table) return;
    const measured = table.parentElement instanceof HTMLElement ? table.parentElement : table;
    /*
     * `columnWeights`, falling back to `defaultTreegridColumnWeights` — the hierarchy column (index
     * 0) carries per-level indentation, a disclosure button, and the row's own label, so it earns a
     * bigger default share than a flat metadata column beside it. `resolveWeightedColumnWidths`
     * (`@skryensya/core/splitter`) has the arithmetic; an equal `columnWeights` reduces to the exact
     * `width / colCount` split this used before weights existed.
     */
    const weights = columnWeights ?? defaultTreegridColumnWeights(colCount);

    // Guards against a callback already in flight the instant `disconnect()` is called — a real
    // race, not a hypothetical one, since `ResizeObserver` batches and delivers on the next frame.
    let seeded = false;
    const seedFrom = (width: number): boolean => {
      if (seeded || width <= 0) return false;
      seeded = true;
      const seeds = resolveWeightedColumnWidths({ total: width, weights, min: MIN_COLUMN_WIDTH });
      setColumnWidths(seeds);
      /*
       * An explicit pixel WIDTH on the table itself, not left at the stylesheet's `inline-size:
       * auto` — see `treegrid.css`'s own note on why `auto` is not safe here: a `table-layout:
       * fixed` table sized `auto` still compares its columns' sum against its containing block and
       * takes the greater, and once the table ends up wider than that sum, Chromium's real
       * redistribution algorithm hands the surplus to whichever columns have the most unbreakable
       * `nowrap` content rather than leaving every column at its authored width. Resizing never has
       * to touch this again: `resolveColumnResize` conserves the touched pair's own total, so the
       * table's OWN total is an invariant of every resize, set correctly exactly once, here — an
       * imperative write, not a `style` prop, since nothing else on this element owns `style` for
       * React to fight over.
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
    // A mount concern, like the vanilla enhancer's own one-time measurement — re-running on every
    // `colCount`/`columnWeights` change would blow away a reader's own drag the moment authored
    // content changed for an unrelated reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizableColumns]);

  const meta = useMemo(
    () => rows.map((row) => ({ level: row.level, isBranch: row.isBranch, expanded: expandedById[row.id] ?? false })),
    [rows, expandedById],
  );
  const visibleFlags = useMemo(() => computeTreegridVisibility(meta), [meta]);
  const visibleRows = useMemo(() => rows.filter((_, index) => visibleFlags[index]), [rows, visibleFlags]);
  const visibleMeta = useMemo(() => meta.filter((_, index) => visibleFlags[index]), [meta, visibleFlags]);

  /*
   * ANIMATING A TOGGLE. `visibleFlags` above stays the pure, INSTANT truth `resolveTreegridKey`'s
   * own keyboard-navigable index space is built from (an "exiting" row is not addressable by arrow
   * keys the instant its branch collapses, whether or not it is still painting) — nothing here
   * touches that. What these two states add is a WINDOW between a row's logical visibility
   * flipping and its DOM `hidden` attribute catching up:
   *   - `exitingIds`: rows CURRENTLY `visibleFlags === false` that are kept un-hidden anyway, so
   *     they keep painting through their own exit animation instead of vanishing in the same frame
   *     the branch collapses. `hiddenById` below is the only thing that reads this.
   *   - `transitionById`: `"entering"`/`"exiting"` for exactly the same window, one animation's
   *     worth — what `TreegridRow` puts on `data-state` for `treegrid.css`'s own keyframes to key
   *     off. An entering row needs no `exitingIds` counterpart: it is already unhidden the instant
   *     `visibleFlags` says so (table layout grows right away), this is purely the cosmetic fade+
   *     rise layered on top.
   *
   * Both are set from INSIDE `toggle()` itself, synchronously with `setExpandedById` — not reactively
   * off a `visibleFlags`-watching `useEffect`. A passive effect fires AFTER the browser has already
   * committed and painted the "unhidden, no `data-state` yet" frame from the `setExpandedById` commit,
   * so `data-state="entering"` lands one commit too late for the browser to ever start
   * `sk-treegrid-row-in` against it (confirmed live: `getAnimations()` came back empty every time).
   * Diffing here instead — against `visibleFlags` from THIS render's closure, the state as it stood
   * before this toggle — means `hidden` and `data-state` both change in the SAME commit, same as the
   * vanilla binding's own two synchronous attribute writes.
   */
  const [exitingIds, setExitingIds] = useState<ReadonlySet<string>>(() => new Set());
  const [transitionById, setTransitionById] = useState<Record<string, TreegridRowTransition>>({});
  // One settle-timer per row currently mid-transition, so a SECOND toggle before the first one
  // finishes cancels the stale timer instead of letting it fire late against whatever state the
  // row is in by then (`animationend` is cleaned up the same way, `{ once: true }` below).
  const settleTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(
    () => () => {
      for (const timer of settleTimersRef.current.values()) clearTimeout(timer);
      settleTimersRef.current.clear();
    },
    [],
  );

  const settleTransition = (id: string, transition: "entering" | "exiting") => {
    const timer = settleTimersRef.current.get(id);
    if (timer) clearTimeout(timer);
    settleTimersRef.current.delete(id);
    setTransitionById((prevState) => {
      // Only clear if STILL the transition that scheduled this settle — a rapid re-toggle may
      // already have moved this row into the OPPOSITE transition by the time this fires.
      if (prevState[id] !== transition) return prevState;
      const next = { ...prevState };
      delete next[id];
      return next;
    });
    if (transition === "exiting") {
      setExitingIds((prevSet) => {
        if (!prevSet.has(id)) return prevSet;
        const next = new Set(prevSet);
        next.delete(id);
        return next;
      });
    }
  };

  const hiddenById = useMemo(
    () => Object.fromEntries(rows.map((row, index) => [row.id, !visibleFlags[index] && !exitingIds.has(row.id)])),
    [rows, visibleFlags, exitingIds],
  );

  const toggle = (id: string, expanded: boolean) => {
    const nextExpandedById = { ...expandedById, [id]: expanded };
    const nextMeta = rows.map((row) => ({
      level: row.level,
      isBranch: row.isBranch,
      expanded: nextExpandedById[row.id] ?? false,
    }));
    const nextVisibleFlags = computeTreegridVisibility(nextMeta);
    const transitions = diffTreegridVisibility(visibleFlags, nextVisibleFlags);
    const changed = rows
      .map((row, index) => ({ id: row.id, transition: transitions[index] }))
      .filter((entry): entry is { id: string; transition: "entering" | "exiting" } => entry.transition !== undefined);

    setExpandedById(nextExpandedById);
    onExpandedChange?.({ value: id, expanded });

    if (changed.length === 0) return;

    setTransitionById((prevState) => {
      const next = { ...prevState };
      for (const { id: rowId, transition } of changed) next[rowId] = transition;
      return next;
    });
    setExitingIds((prevSet) => {
      const next = new Set(prevSet);
      for (const { id: rowId, transition } of changed) {
        if (transition === "exiting") next.add(rowId);
      }
      return next;
    });

    for (const { id: rowId, transition } of changed) {
      const element = elements.current.get(focusKey(rowId, null));
      const existingTimer = settleTimersRef.current.get(rowId);
      if (existingTimer) clearTimeout(existingTimer);
      settleTimersRef.current.set(
        rowId,
        setTimeout(() => settleTransition(rowId, transition), TREEGRID_EXIT_FALLBACK_MS),
      );
      element?.addEventListener("animationend", () => settleTransition(rowId, transition), { once: true });
    }
  };

  const visibleIndexById = useMemo(
    () => Object.fromEntries(visibleRows.map((row, index) => [row.id, index])),
    [visibleRows],
  );

  const moveFocus = (next: TreegridFocus) => {
    setFocus(next);
    const row = visibleRows[next.row];
    if (row) elements.current.get(focusKey(row.id, next.col))?.focus();
  };

  /*
   * Where focus ACTUALLY is, read off the DOM rather than trusting `focus` state alone — the same
   * reasoning `treegrid.ts` (vanilla) documents: React re-renders on state changes it caused, but
   * something else (an app's own focus management, a test) can move real DOM focus without going
   * through `moveFocus`, and using the stale index would resolve the next keystroke against the
   * wrong row. `focus` state remains what DRIVES each render's `tabIndex` (React can't read the DOM
   * mid-render); this is only consulted at interaction time.
   */
  const currentFocus = (): TreegridFocus => {
    const active = document.activeElement;
    const entry = active ? elementKeys.current.get(active as HTMLElement) : undefined;
    if (!entry) return focus;
    const rowIndex = visibleIndexById[entry.id];
    return rowIndex === undefined ? focus : { row: rowIndex, col: entry.col };
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    if (event.defaultPrevented || !visibleRows.length) return;
    const focusNow = currentFocus();
    const colCount = rows.find((row) => row.id === visibleRows[focusNow.row]?.id)?.colCount ?? 0;
    const action = resolveTreegridKey({
      key: event.key,
      ctrl: event.ctrlKey || event.metaKey,
      focus: focusNow,
      rows: visibleMeta,
      colCount,
    });
    if (action.kind === "none") return;
    event.preventDefault();
    if (action.kind === "move") moveFocus(action.focus);
    else if (action.kind === "toggle") {
      const row = visibleRows[action.row];
      if (row) toggle(row.id, action.expanded);
    } else if (action.kind === "activate") {
      const row = visibleRows[action.row];
      if (row) onActivate?.({ value: row.id });
    }
  };

  const context: TreegridContextValue = {
    isRowStop: (id) => focus.col === null && visibleIndexById[id] === focus.row,
    isCellStop: (id, col) => focus.col === col && visibleIndexById[id] === focus.row,
    isHidden: (id) => hiddenById[id] ?? false,
    isExpanded: (id) => expandedById[id] ?? false,
    transitionOf: (id) => transitionById[id],
    // Cells cover the row's entire clickable area in a real `<table>`, so click handling lives here
    // ONLY (never duplicated on `<tr>` too) — a `<td>`'s own click already bubbles to its row, and a
    // second handler up there would fire a second, conflicting focus/toggle for the same click.
    onCellClick: (id, isBranch, col) => {
      const rowIndex = visibleIndexById[id];
      if (rowIndex === undefined) return;
      if (col === 0 && isBranch) {
        moveFocus({ row: rowIndex, col: null });
        toggle(id, !(expandedById[id] ?? false));
        return;
      }
      moveFocus({ row: rowIndex, col });
    },
    registerElement: (id, col, element) => {
      const key = focusKey(id, col);
      const previous = elements.current.get(key);
      if (previous) elementKeys.current.delete(previous);
      if (element) {
        elements.current.set(key, element);
        elementKeys.current.set(element, { id, col });
      } else {
        elements.current.delete(key);
      }
    },
    resizableColumns,
    resizeLabel,
    columnWidths,
    setColumnWidths,
  };

  return (
    <TreegridContext.Provider value={context}>
      <table
        {...props}
        aria-label={label}
        className={cx(`${treegridParts.root} sk-table`, className)}
        data-resizable-columns={resizableColumns ? "" : undefined}
        onKeyDown={onKeyDown}
        ref={tableRef}
        role="treegrid"
      >
        {colCount > 0 ? (
          <colgroup>
            {resizableColumns
              ? columnWidths.map((width, index) => <col key={index} style={{ width: `${width}px` }} />)
              : Array.from({ length: colCount }, (_, index) => <col key={index} style={{ width: `${100 / colCount}%` }} />)}
          </colgroup>
        ) : null}
        {children}
      </table>
    </TreegridContext.Provider>
  );
}

export type TreegridHeadProps = WithChildren<HTMLAttributes<HTMLTableSectionElement>>;
export function TreegridHead({ children, className, ...props }: TreegridHeadProps) {
  return (
    <thead {...props} className={cx(`${treegridParts.head} sk-table__head`, className)}>
      {children}
    </thead>
  );
}

export type TreegridHeadRowProps = WithChildren<HTMLAttributes<HTMLTableRowElement>>;
export function TreegridHeadRow({ children, className, ...props }: TreegridHeadRowProps) {
  const columnCount = Children.count(children);
  /*
   * Same injection shape as `TreegridRow` → `TreegridCell`: which column index a header is, and how
   * many there are, are facts of WHERE it was written, not something an author restates. Only
   * `resizableColumns` (read by `TreegridColumnHeader` itself, off context) ever uses either.
   */
  const headers = Children.map(children, (child, index) =>
    isValidElement(child) && child.type === TreegridColumnHeader
      ? cloneElement(child as ReactElement<Record<string, unknown>>, { columnIndex: index, columnCount })
      : child,
  );
  return (
    <tr {...props} className={cx(`${treegridParts.headRow} sk-table__row`, className)}>
      {headers}
    </tr>
  );
}

export type TreegridColumnHeaderProps = WithChildren<ThHTMLAttributes<HTMLTableCellElement>>;

/** `columnIndex`/`columnCount` are injected by the parent `TreegridHeadRow`, see the comment there —
 * never author-set. */
type InjectedTreegridColumnHeaderProps = TreegridColumnHeaderProps & { columnIndex: number; columnCount: number };

export function TreegridColumnHeader(publicProps: TreegridColumnHeaderProps) {
  const { children, className, scope = "col", columnIndex, columnCount, ...props } =
    publicProps as InjectedTreegridColumnHeaderProps;
  const context = useContext(TreegridContext);
  const headerRef = useRef<HTMLTableCellElement>(null);
  // Never the LAST column — see `resolveColumnResize`'s own doc: a handle there would have no next
  // neighbor to redistribute width with.
  const resizable = Boolean(context?.resizableColumns) && columnIndex < columnCount - 1;
  return (
    <th {...props} className={cx(`${treegridParts.columnHeader} sk-table__header`, className)} ref={headerRef} scope={scope}>
      {children}
      {resizable ? <TreegridColumnResizer columnIndex={columnIndex} headerRef={headerRef} /> : null}
    </th>
  );
}

/**
 * The drag edge for one column boundary — never authored, `TreegridColumnHeader` renders one when
 * `resizableColumns` is on and this is not the last column. Same shape as `SidebarResizeHandle`
 * (press-vs-drag threshold, RTL sign, `resolveSplitterKey` for the keyboard), reading/writing the
 * PAIR of widths on either side of it through context instead of a single CSS-clamped property —
 * `resolveColumnResize`'s own doc explains why a column resize cannot be one clamped value.
 */
function TreegridColumnResizer({ columnIndex, headerRef }: { columnIndex: number; headerRef: RefObject<HTMLTableCellElement | null> }) {
  const context = useTreegridContext("ColumnResizer");
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

  /** From the CURRENT widths — right for a discrete keyboard press, wrong for a continuous drag
   * (see `onPointerMove` below, which resolves against the drag's OWN start snapshot instead). */
  const resize = (delta: number) => {
    context.setColumnWidths(resolveColumnResize({ widths: context.columnWidths, index: columnIndex, delta, min: MIN_COLUMN_WIDTH }));
  };

  /** Back to an even split between this pair — the keyboard's answer to double-click, same as
   * Sidebar's own Enter/dblclick reset. */
  const reset = () => resize(total / 2 - before);

  return (
    <div
      aria-label={context.resizeLabel ? `${context.resizeLabel}: ${headerRef.current?.textContent?.trim() ?? ""}` : ""}
      aria-orientation="vertical"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={percent}
      className={cx(treegridParts.columnResizer, "sk-splitter")}
      data-sk-treegrid-column-resizer
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

export type TreegridBodyProps = WithChildren<HTMLAttributes<HTMLTableSectionElement>>;
export function TreegridBody({ children, className, ...props }: TreegridBodyProps) {
  useTreegridContext("Body");
  return (
    <tbody {...props} className={cx(`${treegridParts.body} sk-table__body`, className)}>
      {children}
    </tbody>
  );
}

export type TreegridRowProps = Omit<HTMLAttributes<HTMLTableRowElement>, "children"> & {
  children: ReactNode;
  /** The row's identity — what `onExpandedChange`/`onActivate` report, and what context lookups key on. */
  value: string;
  level: number;
  setSize: number;
  posInset: number;
  /** Omit for a leaf. `true`/`false` marks a branch, open or collapsed — see `treegrid.ts`'s option. */
  expanded?: boolean;
};

export function TreegridRow({
  children,
  className,
  expanded,
  level,
  posInset,
  setSize,
  value,
  ...props
}: TreegridRowProps) {
  const context = useTreegridContext("Row");
  const isBranch = expanded !== undefined;
  const hidden = context.isHidden(value);
  const currentlyExpanded = context.isExpanded(value);
  /*
   * A cell states its own text, nothing else — which column it is and which row it belongs to are
   * facts of WHERE it was written, not something an author should restate by hand (a `TableCell`
   * doesn't take a column index either). So the row injects both here, the one place that already
   * knows a cell's position among its siblings.
   */
  const cells = Children.map(children, (child, index) =>
    isValidElement(child) && child.type === TreegridCell
      ? cloneElement(child as ReactElement<Record<string, unknown>>, { row: value, column: index, isBranch })
      : child,
  );
  return (
    <tr
      {...props}
      aria-expanded={isBranch ? currentlyExpanded : undefined}
      aria-level={level}
      aria-posinset={posInset}
      aria-setsize={setSize}
      // NOT `sk-interactive` here: its state layer paints a `::before` directly on this `<tr>`,
      // and a `<tr>`'s children are the table layout algorithm's own column-fixup input — a
      // generated box among them gets wrapped into an anonymous table-cell, pushing every real
      // `<td>` one column right (measured: Chromium 140). `TreegridCell` below still carries
      // `sk-interactive` for its own hover/press feedback.
      className={cx(`${treegridParts.row} sk-table__row`, className)}
      data-state={context.transitionOf(value)}
      data-value={value}
      hidden={hidden}
      ref={(element) => context.registerElement(value, null, element)}
      role="row"
      tabIndex={context.isRowStop(value) ? 0 : -1}
    >
      {cells}
    </tr>
  );
}

export type TreegridCellProps = WithChildren<TdHTMLAttributes<HTMLTableCellElement>>;

/** `row`/`column`/`isBranch` are injected by the parent `TreegridRow`, see the comment there — never
 * author-set. */
type InjectedTreegridCellProps = TreegridCellProps & { row: string; column: number; isBranch: boolean };

export function TreegridCell(publicProps: TreegridCellProps) {
  const { children, className, column, isBranch, row, ...props } = publicProps as InjectedTreegridCellProps;
  const context = useTreegridContext("Cell");
  return (
    <td
      {...props}
      className={cx(`${treegridParts.cell} sk-table__cell sk-interactive`, className)}
      onClick={(event) => {
        props.onClick?.(event);
        context.onCellClick(row, isBranch, column);
      }}
      ref={(element) => context.registerElement(row, column, element)}
      role="gridcell"
      tabIndex={context.isCellStop(row, column) ? 0 : -1}
    >
      {/*
       * The expand/collapse control, rendered only in a branch row's first cell — never authored,
       * `TreegridRow` injects `isBranch`/`column` above for exactly this check. `aria-hidden` +
       * `tabIndex={-1}`: the row's own `aria-expanded` already announces this state to a screen
       * reader (`treegrid.ts`'s `disclosure` part doc), so the button stays decorative to
       * assistive tech and out of the roving tab sequence. NOT `sk-interactive`: that class would
       * give the button its OWN hover/press state layer, a second highlight competing with this
       * `<td>`'s own for the same click (`onCellClick` toggles on `column === 0`, never on whether
       * the click landed on this button specifically) — `treegrid.css` instead darkens the glyph
       * off the ROW's hover/focus, one layer, not two. The click still bubbles to this `<td>`'s own
       * `onClick` above unchanged.
       */}
      {isBranch && column === 0 ? (
        <button aria-hidden="true" className="sk-treegrid__disclosure" tabIndex={-1} type="button" />
      ) : null}
      {children}
    </td>
  );
}
