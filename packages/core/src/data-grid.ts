import type { ComponentContract } from "./contract.js";

/*
 * GRID. WAI-ARIA APG `grid`, which the spec itself says covers TWO use cases with the identical
 * roles and roving-tabindex mechanics: "presenting tabular information (data grids) and grouping
 * other widgets (layout grids)". Confirmed fetching the pattern's own overview page, not assumed
 * from the example names. That is why this is ONE contract, not two: `Table` already owns the case
 * of STATIC tabular data with no keyboard model of its own (a plain `<table>`); this contract is for
 * when a grid of cells needs 2D roving-tabindex navigation, whether the cells hold plain text (a
 * data grid) or their own interactive widgets (message pills, a card grid). The layout-grid case.
 *
 * No `@zag-js/*` machine covers this pattern (`core/machines.ts` does not list it), so. Same as
 * `Treegrid`: the keyboard model is hand-rolled, pure, and shared by both bindings.
 */
export const dataGridParts = {
  root: "sk-data-grid",
  row: "sk-data-grid__row",
  cell: "sk-data-grid__cell",
} as const;

export type DataGridPart = keyof typeof dataGridParts;
export type DataGridPartClass = (typeof dataGridParts)[DataGridPart];

export const dataGridContract = {
  id: "data-grid",
  css: "@skryensya/core/components/data-grid.css",
  parts: dataGridParts,

  options: {
    /** The grid's accessible name. `role="grid"` carries no implicit one. */
    label: { type: "string", attr: "aria-label" },
    /**
     * Whether Right/Left wraps into the next/previous row instead of stopping at the row's edge.
     * WAI's own layout-grid examples differ on this: a grid of interchangeable links wraps both
     * axes, a grid whose rows are a meaningful unit (a recipient's link + its own remove button)
     * does not. False by default, the safer choice when rows carry structure worth respecting.
     */
    wrapCols: { type: "boolean", default: false, attr: "data-wrap-cols", trueValue: "" },
    /** Same idea, for Up/Down wrapping past the first/last row. */
    wrapRows: { type: "boolean", default: false, attr: "data-wrap-rows", trueValue: "" },
  },

  signatures: {
    DataGrid: {
      intent: ["2d-keyboard-navigable-grid", "data-grid", "layout-grid", "widget-grouping"],
      host: { element: "div" },
      options: ["label", "wrapCols", "wrapRows"],
      requires: ["label"],
      slots: { children: { accepts: "signature", required: true, of: ["DataGridRow"] } },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "grid" },
        slot: "children",
      },
      mount: "data-sk-data-grid",
      react: { from: "@skryensya/react/data-grid", name: "DataGrid" },
    },

    /*
     * A "row" here is a LOGICAL grouping, not necessarily a visual one. WAI's own layout-grid
     * examples include a recipient pill list whose rows wrap across physical lines. `DataGridRow` is
     * the unit Home/End and vertical arrow navigation move by; how it's laid out visually is the
     * consumer's CSS, not this contract's concern.
     */
    DataGridRow: {
      intent: ["grid-row", "logical-row"],
      host: { element: "div" },
      options: [],
      parents: ["DataGrid"],
      slots: { children: { accepts: "signature", required: true, of: ["DataGridCell"] } },
      template: { element: "div", part: "row", host: true, attrs: { role: "row" }, slot: "children" },
      react: { from: "@skryensya/react/data-grid", name: "DataGridRow" },
    },

    /*
     * A cell PRESERVES the semantics of whatever it contains. A link stays a link, a button stays
     * a button. The pattern explicitly does not reinterpret descendant content the way a menu or
     * listbox would. Which is why the roving-tabindex UNIT is computed at runtime, never authored:
     * an empty or plain-text cell is its own stop, a cell holding one interactive element hands the
     * stop to that element instead. See `gridCellFocusTarget` below.
     */
    DataGridCell: {
      intent: ["grid-cell"],
      host: { element: "div" },
      options: [],
      parents: ["DataGridRow"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "div",
        part: "cell",
        also: ["sk-interactive"],
        host: true,
        attrs: { role: "gridcell" },
        slot: "children",
      },
      react: { from: "@skryensya/react/data-grid", name: "DataGridCell" },
    },
  },
} as const satisfies ComponentContract;

/* ------------------------------------------------------------------------------------------------ *
 * Shared behaviour. The pure matcher here, the imperative binding in `@skryensya/vanilla`, the
 * declarative one in `@skryensya/react` (the three-way split `hotkey.ts` documents, reused by
 * `treegrid.ts` for the same reason: the keyboard matrix is where the real complexity lives, and
 * it's the cheapest place to test it exhaustively, with no DOM involved).
 * ------------------------------------------------------------------------------------------------ */

export interface DataGridFocus {
  readonly row: number;
  readonly col: number;
}

export type DataGridAction = { readonly kind: "move"; readonly focus: DataGridFocus } | { readonly kind: "none" };

/**
 * One keystroke, resolved against a grid whose rows may have DIFFERENT cell counts (a "ragged"
 * grid. WAI's own recipient-pill example wraps a logical row across physical lines with no fixed
 * column count). `colCountOf` is asked per row rather than taking one constant for exactly that
 * reason.
 */
export function resolveDataGridKey(params: {
  readonly key: string;
  readonly ctrl: boolean;
  readonly focus: DataGridFocus;
  readonly rowCount: number;
  readonly colCountOf: (row: number) => number;
  readonly wrapRows: boolean;
  readonly wrapCols: boolean;
}): DataGridAction {
  const { key, ctrl, focus, rowCount, colCountOf, wrapRows, wrapCols } = params;
  if (rowCount < 1) return { kind: "none" };
  const colCount = colCountOf(focus.row);
  if (colCount < 1) return { kind: "none" };
  const lastRow = rowCount - 1;
  const lastCol = colCount - 1;

  /** Column clamped into whatever row we're landing on. A shorter row still gets a valid cell. */
  const clampCol = (row: number, col: number) => Math.max(0, Math.min(col, colCountOf(row) - 1));

  switch (key) {
    case "ArrowRight": {
      if (focus.col < lastCol) return { kind: "move", focus: { row: focus.row, col: focus.col + 1 } };
      if (!wrapCols) return { kind: "none" };
      const row = focus.row < lastRow ? focus.row + 1 : 0;
      return { kind: "move", focus: { row, col: 0 } };
    }
    case "ArrowLeft": {
      if (focus.col > 0) return { kind: "move", focus: { row: focus.row, col: focus.col - 1 } };
      if (!wrapCols) return { kind: "none" };
      const row = focus.row > 0 ? focus.row - 1 : lastRow;
      return { kind: "move", focus: { row, col: colCountOf(row) - 1 } };
    }
    case "ArrowDown": {
      if (focus.row < lastRow) {
        return { kind: "move", focus: { row: focus.row + 1, col: clampCol(focus.row + 1, focus.col) } };
      }
      if (!wrapRows) return { kind: "none" };
      return { kind: "move", focus: { row: 0, col: clampCol(0, focus.col) } };
    }
    case "ArrowUp": {
      if (focus.row > 0) {
        return { kind: "move", focus: { row: focus.row - 1, col: clampCol(focus.row - 1, focus.col) } };
      }
      if (!wrapRows) return { kind: "none" };
      return { kind: "move", focus: { row: lastRow, col: clampCol(lastRow, focus.col) } };
    }
    case "Home": {
      if (ctrl) return { kind: "move", focus: { row: 0, col: 0 } };
      if (focus.col === 0) return { kind: "none" };
      return { kind: "move", focus: { row: focus.row, col: 0 } };
    }
    case "End": {
      if (ctrl) return { kind: "move", focus: { row: lastRow, col: colCountOf(lastRow) - 1 } };
      if (focus.col === lastCol) return { kind: "none" };
      return { kind: "move", focus: { row: focus.row, col: lastCol } };
    }
    default:
      return { kind: "none" };
  }
}

/** The selector `Toolbar`'s own roving tabindex already uses for "counts as a stop". Reused
 *  verbatim so the same judgment of what is focusable never disagrees between the two contracts. */
export const dataGridFocusableSelector =
  "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])";
