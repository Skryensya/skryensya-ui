import type { ComponentContract } from "./contract.js";

export const treegridParts = {
  scroll: "sk-treegrid-scroll",
  root: "sk-treegrid",
  head: "sk-treegrid__head",
  headRow: "sk-treegrid__head-row",
  columnHeader: "sk-treegrid__column-header",
  body: "sk-treegrid__body",
  row: "sk-treegrid__row",
  cell: "sk-treegrid__cell",
  /** The expand/collapse control a binding inserts into a branch row's first cell — see the
   * bindings' own `ensureDisclosureButtons`/`TreegridCell`, never authored by a consumer. */
  disclosure: "sk-treegrid__disclosure",
  /** The drag handle a binding inserts between each pair of column headers when `resizableColumns`
   * is on — see `resolveColumnResize` below and each binding's own insertion point. */
  columnResizer: "sk-treegrid__column-resizer",
} as const;

export type TreegridPart = keyof typeof treegridParts;

/*
 * TREEGRID — WAI-ARIA APG `treegrid-1`, added directly (no `@zag-js/*` machine covers this pattern;
 * `machines.ts` lists every one that does, and treegrid is not among them).
 *
 * WAI's own reference markup is a FLAT `<tr>` sequence, never nested rows — a table cannot nest a
 * `<tr>` inside a `<tr>`, so a descendant's hierarchy is expressed entirely through `aria-level` /
 * `aria-posinset` / `aria-setsize` on siblings, with a collapsed branch's descendants hidden via the
 * `hidden` attribute rather than removed from the DOM. That is why `TreegridRow` is authored FLAT,
 * the same way `TableRow` already is (`table.ts`) — not as a recursive `items` collection the way
 * `TreeView` is: `aria-level`/`aria-posinset`/`aria-setsize` do not change when a sibling collapses
 * or expands (only VISIBILITY does), so they are exactly the kind of fact an author states once, not
 * a derived value a machine has to keep recomputing.
 *
 * Scope, decided with the user before building: text-only cells, no row selection, no interactive
 * control inside a cell — this is `treegrid-1` (the exact example audited), not the general pattern.
 * That is also why the keyboard model below never has to intercept Tab/Shift+Tab: WAI's own spec
 * ties that key to moving between interactive widgets INSIDE a row, and this scope has none, so the
 * browser's native Tab already does the right thing (leaves the grid) with nothing to override.
 */
export const treegridContract = {
  id: "treegrid",
  css: "@skryensya/core/components/treegrid.css",
  parts: treegridParts,

  options: {
    /** The grid's accessible name. `role="treegrid"` carries no implicit one. */
    label: { type: "string", attr: "aria-label" },
    /** 1-based depth in the hierarchy. Static per row — collapsing a sibling never changes it. */
    level: { type: "number", attr: "aria-level" },
    /** How many siblings (including this row) sit at this row's level, under the same parent. */
    setSize: { type: "number", attr: "aria-setsize" },
    /** This row's 1-based position among those siblings. */
    posInset: { type: "number", attr: "aria-posinset" },
    /**
     * Omitted entirely on a leaf row — that absence, not a boolean option, is what marks a row a
     * leaf. A branch row always states it explicitly, `true` or `false`; `falseValue` exists so the
     * collapsed case still writes the attribute instead of reading as "not a branch either".
     */
    expanded: { type: "boolean", attr: "aria-expanded", trueValue: "true", falseValue: "false" },
    /** The row's identity, for the `sk-treegrid-expanded-change` / `sk-treegrid-activate` events. */
    value: { type: "string", attr: "data-value" },
    /**
     * Opt-in: a binding-inserted drag handle between each pair of column headers, WAI-ARIA APG's
     * "Window Splitter" pattern (`role="separator"`, `aria-orientation="vertical"`,
     * Left/Right/Home/End resize). Off by default — `treegrid-1`'s own audited scope is text-only
     * cells with no extra chrome, so the minimal composition stays exactly that; a consumer with
     * wide, uneven columns (a file explorer, a wide dataset) opts in explicitly.
     */
    resizableColumns: { type: "boolean", default: false, attr: "data-resizable-columns", trueValue: "" },
    /**
     * The shared PREFIX every column resizer's accessible name is built from — a binding inserts
     * one separator per column boundary, never authored, so there is no per-instance `label` slot
     * the way `SidebarResizeHandle` has one; each resizer's real name is this string plus the
     * column header it sits next to, read at mount (`"Resize column: Subject"`, `"Redimensionar
     * columna: Asunto"`). Required whenever `resizableColumns` is on — see the `a11y` entry below.
     */
    resizeLabel: { type: "string", attr: "data-resize-label" },
    /**
     * The INITIAL share of the table's width each column claims before any drag, one positive number
     * per column, comma-separated (`"2,1,1,1"`) — see `table.ts`'s identical option and
     * `resolveWeightedColumnWidths` (`@skryensya/core/splitter`). Omitted, a resizable Treegrid falls
     * back to {@link defaultTreegridColumnWeights} rather than an equal split: the hierarchy column
     * carries per-level indentation, a disclosure button, and the row's own label, so it earns a
     * bigger default share than a flat metadata column next to it.
     */
    columnWeights: { type: "string", attr: "data-column-weights" },
  },

  a11y: [
    {
      when: { resizableColumns: true },
      requiresOneOf: ["resizeLabel"],
      because:
        "Each column resizer is a real, focusable role=\"separator\" a binding inserts — never authored — so nothing else names it for a screen reader; the column header it sits beside says WHICH column, not that the control resizes it.",
    },
  ],

  signatures: {
    TreegridScroll: {
      intent: ["scrollable-treegrid", "wide-treegrid"],
      host: { element: "div" },
      options: [],
      slots: { children: { accepts: "signature", of: ["Treegrid"], required: true } },
      template: { element: "div", part: "scroll", also: ["sk-table-scroll"], host: true, slot: "children" },
      react: { from: "@skryensya/react/treegrid", name: "TreegridScroll" },
    },

    Treegrid: {
      intent: ["hierarchical-data-grid", "file-explorer-table", "expandable-rows-table"],
      host: { element: "table" },
      options: ["label", "resizableColumns", "resizeLabel", "columnWeights"],
      requires: ["label"],
      slots: {
        children: {
          accepts: "signature",
          required: true,
          of: ["TreegridHead", "TreegridBody"],
          ordered: true,
          cardinality: { TreegridHead: "optional", TreegridBody: "one" },
        },
      },
      template: {
        element: "table",
        part: "root",
        also: ["sk-table"],
        host: true,
        attrs: { role: "treegrid" },
        slot: "children",
      },
      mount: "data-sk-treegrid",
      react: { from: "@skryensya/react/treegrid", name: "Treegrid" },
    },

    TreegridHead: {
      intent: ["column-headers"],
      host: { element: "thead" },
      options: [],
      parents: ["Treegrid"],
      slots: { children: { accepts: "signature", required: true, of: ["TreegridHeadRow"] } },
      template: { element: "thead", part: "head", also: ["sk-table__head"], host: true, slot: "children" },
      react: { from: "@skryensya/react/treegrid", name: "TreegridHead" },
    },

    TreegridHeadRow: {
      intent: ["column-header-row"],
      host: { element: "tr" },
      options: [],
      parents: ["TreegridHead"],
      slots: { children: { accepts: "signature", required: true, of: ["TreegridColumnHeader"] } },
      template: { element: "tr", part: "headRow", also: ["sk-table__row"], host: true, slot: "children" },
      react: { from: "@skryensya/react/treegrid", name: "TreegridHeadRow" },
    },

    TreegridColumnHeader: {
      intent: ["column-header"],
      host: { element: "th" },
      options: [],
      parents: ["TreegridHeadRow"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "th",
        part: "columnHeader",
        also: ["sk-table__header"],
        host: true,
        attrs: { scope: "col" },
        slot: "children",
      },
      react: { from: "@skryensya/react/treegrid", name: "TreegridColumnHeader" },
    },

    TreegridBody: {
      intent: ["treegrid-rows"],
      host: { element: "tbody" },
      options: [],
      parents: ["Treegrid"],
      slots: { children: { accepts: "signature", required: true, of: ["TreegridRow"] } },
      template: { element: "tbody", part: "body", also: ["sk-table__body"], host: true, slot: "children" },
      react: { from: "@skryensya/react/treegrid", name: "TreegridBody" },
    },

    /*
     * One `<tr>` per row, siblings in document order — never nested, see the file banner. `level` /
     * `setSize` / `posInset` are required because there is no structure here (unlike `TreeView`'s
     * nesting) that could derive them; the author states the position they already know from writing
     * the row in order. The enhancer/binding computes ancestry and visibility from `level` alone (a
     * row's nearest PRECEDING sibling with a smaller `level` is its parent), never from a second,
     * separately-authored parent reference that `level` could then contradict.
     */
    TreegridRow: {
      intent: ["treegrid-row", "hierarchical-row"],
      host: { element: "tr" },
      options: ["level", "setSize", "posInset", "expanded", "value"],
      requires: ["level", "setSize", "posInset"],
      parents: ["TreegridBody"],
      slots: { children: { accepts: "signature", required: true, of: ["TreegridCell"] } },
      template: {
        element: "tr",
        part: "row",
        // NOT `sk-interactive`: that class's state layer paints a `::before` directly on this
        // `<tr>`, and a `<tr>`'s children are the table layout algorithm's own column-fixup
        // input — a generated box among them (even one that is `position: absolute`) gets wrapped
        // into an anonymous table-cell, pushing every real `<td>` one column right (measured:
        // Chromium 140, the row's own cells rendered at the NEXT column's x, and the last cell
        // fell off the table at width 0). `sk-interactive` on `TreegridCell` already gives each
        // cell its own hover/press feedback; the row itself only needs the click target, which
        // `data-sk-treegrid-row`'s own handler supplies without any class.
        also: ["sk-table__row"],
        host: true,
        attrs: { role: "row", tabindex: "-1" },
        slot: "children",
      },
      mount: "data-sk-treegrid-row",
      react: { from: "@skryensya/react/treegrid", name: "TreegridRow" },
    },

    TreegridCell: {
      intent: ["treegrid-cell"],
      host: { element: "td" },
      options: [],
      parents: ["TreegridRow"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "td",
        part: "cell",
        also: ["sk-table__cell", "sk-interactive"],
        host: true,
        attrs: { role: "gridcell", tabindex: "-1" },
        slot: "children",
      },
      react: { from: "@skryensya/react/treegrid", name: "TreegridCell" },
    },
  },
} as const satisfies ComponentContract;

export const treegridEvents = {
  expandedChange: "sk-treegrid-expanded-change",
  activate: "sk-treegrid-activate",
} as const;

/* ------------------------------------------------------------------------------------------------ *
 * Shared behaviour — the pure matcher here, the imperative binding in `@skryensya/vanilla`, the
 * declarative one in `@skryensya/react` (the same three-way split `hotkey.ts` documents). No DOM, no
 * framework: both bindings hand this the same facts and apply the same result.
 * ------------------------------------------------------------------------------------------------ */

/**
 * One row, FLAT and in document order, as the React binding takes it and the vanilla enhancer reads
 * it back off authored markup. `expanded` absent marks a leaf, the same rule the contract's own
 * `expanded` option states — one fact, so the two bindings can never disagree about what a leaf is.
 */
export interface TreegridRowInput {
  readonly id: string;
  readonly level: number;
  readonly setSize: number;
  readonly posInset: number;
  readonly expanded?: boolean;
  readonly cells: readonly string[];
}

/** One row's structural facts, in VISIBLE order — the index space every focus/action below moves in. */
export interface TreegridRowMeta {
  readonly level: number;
  /** A row is a branch iff it authored `expanded` at all (see the option's own doc comment). */
  readonly isBranch: boolean;
  readonly expanded: boolean;
}

/** `col: null` means the ROW itself is the focus target — the state before Right Arrow enters a cell. */
export interface TreegridFocus {
  readonly row: number;
  readonly col: number | null;
}

export type TreegridAction =
  | { readonly kind: "move"; readonly focus: TreegridFocus }
  | { readonly kind: "toggle"; readonly row: number; readonly expanded: boolean }
  | { readonly kind: "activate"; readonly row: number }
  | { readonly kind: "none" };

/**
 * Which rows are visible given each row's own `expanded` state, in FULL (not just visible) order.
 *
 * `aria-level`/`aria-posinset`/`aria-setsize` never change, only this does. A single "hidden below
 * this level" threshold is enough to gate every descendant, however deep, because levels strictly
 * increase while descending: a nested branch's own collapsed state cannot matter while an ANCESTOR
 * already hides it, and the moment a row's level drops back to the threshold (or below), that
 * subtree is behind us, whatever state its own branches were left in.
 */
export function computeTreegridVisibility(
  rows: readonly Pick<TreegridRowMeta, "level" | "expanded" | "isBranch">[],
): boolean[] {
  const visible: boolean[] = [];
  let hiddenBelowLevel: number | null = null;
  for (const row of rows) {
    if (hiddenBelowLevel !== null) {
      if (row.level > hiddenBelowLevel) {
        visible.push(false);
        continue;
      }
      hiddenBelowLevel = null;
    }
    visible.push(true);
    if (row.isBranch && !row.expanded) hiddenBelowLevel = row.level;
  }
  return visible;
}

/**
 * One keystroke, resolved against the CURRENTLY VISIBLE rows only — the caller has already filtered
 * with `computeTreegridVisibility`, so index 0 here is whatever visible row is first, not row 0 of
 * the authored tree. That is what lets this function stay ignorant of collapsed subtrees entirely.
 */
export function resolveTreegridKey(params: {
  readonly key: string;
  readonly ctrl: boolean;
  readonly focus: TreegridFocus;
  readonly rows: readonly TreegridRowMeta[];
  readonly colCount: number;
}): TreegridAction {
  const { key, ctrl, focus, rows, colCount } = params;
  const row = rows[focus.row];
  if (!row || colCount < 1) return { kind: "none" };

  const lastRow = rows.length - 1;
  const lastCol = colCount - 1;

  /** Nearest preceding row at a smaller level — this row's parent, or itself if already top-level. */
  const parentOf = (index: number): number => {
    const level = rows[index]?.level ?? 1;
    for (let i = index - 1; i >= 0; i--) if (rows[i]!.level < level) return i;
    return index;
  };

  switch (key) {
    case "ArrowRight": {
      if (focus.col === null) {
        if (row.isBranch && !row.expanded) return { kind: "toggle", row: focus.row, expanded: true };
        return { kind: "move", focus: { row: focus.row, col: 0 } };
      }
      if (focus.col >= lastCol) return { kind: "none" };
      return { kind: "move", focus: { row: focus.row, col: focus.col + 1 } };
    }
    case "ArrowLeft": {
      if (focus.col === null) {
        if (row.isBranch && row.expanded) return { kind: "toggle", row: focus.row, expanded: false };
        const parent = parentOf(focus.row);
        if (parent === focus.row) return { kind: "none" };
        return { kind: "move", focus: { row: parent, col: null } };
      }
      if (focus.col === 0) return { kind: "move", focus: { row: focus.row, col: null } };
      return { kind: "move", focus: { row: focus.row, col: focus.col - 1 } };
    }
    case "ArrowDown": {
      if (focus.row >= lastRow) return { kind: "none" };
      return { kind: "move", focus: { row: focus.row + 1, col: focus.col } };
    }
    case "ArrowUp": {
      if (focus.row <= 0) return { kind: "none" };
      return { kind: "move", focus: { row: focus.row - 1, col: focus.col } };
    }
    case "Home": {
      if (ctrl) return { kind: "move", focus: { row: 0, col: focus.col } };
      if (focus.col === null) return { kind: "move", focus: { row: 0, col: null } };
      return { kind: "move", focus: { row: focus.row, col: 0 } };
    }
    case "End": {
      if (ctrl) return { kind: "move", focus: { row: lastRow, col: focus.col } };
      if (focus.col === null) return { kind: "move", focus: { row: lastRow, col: null } };
      return { kind: "move", focus: { row: focus.row, col: lastCol } };
    }
    case "Enter":
    case " ": {
      if (focus.col === null && row.isBranch) return { kind: "toggle", row: focus.row, expanded: !row.expanded };
      return { kind: "activate", row: focus.row };
    }
    default:
      return { kind: "none" };
  }
}

/*
 * COLUMN RESIZE — `resizableColumns` is built on `resolveColumnResize` and `SPLITTER_MIN_COLUMN_WIDTH`,
 * both in `core/splitter.ts` now: Table's own `resizableColumns` needs the IDENTICAL adjacent-pair
 * value model this file originally grew it for, so the math moved to where a second consumer could
 * reach it without duplicating it. Re-exported here so existing imports from `@skryensya/core/treegrid`
 * keep working.
 */
export { resolveColumnResize, SPLITTER_MIN_COLUMN_WIDTH as TREEGRID_MIN_COLUMN_WIDTH } from "./splitter.js";

/**
 * The `columnWeights` a resizable Treegrid seeds from when the option itself is not authored — the
 * hierarchy column (index 0: every row's disclosure button and label, indented one step per level)
 * earns a bigger starting share than a flat metadata column beside it, the same reasoning
 * `columnWeights`'s own doc gives. An authored `columnWeights` (`data-column-weights` / the React
 * `columnWeights` prop) always overrides this; this is only ever the fallback.
 */
export function defaultTreegridColumnWeights(colCount: number): readonly number[] {
  if (colCount < 1) return [];
  return Array.from({ length: colCount }, (_, index) => (index === 0 ? 2 : 1));
}
