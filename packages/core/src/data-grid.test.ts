import { describe, expect, it } from "vitest";
import { resolveDataGridKey } from "./data-grid.js";

/** A plain 3x3 grid, every row the same length. */
const square = (key: string, focus: { row: number; col: number }, opts: { wrapRows?: boolean; wrapCols?: boolean; ctrl?: boolean } = {}) =>
  resolveDataGridKey({
    key,
    ctrl: opts.ctrl ?? false,
    focus,
    rowCount: 3,
    colCountOf: () => 3,
    wrapCols: opts.wrapCols ?? false,
    wrapRows: opts.wrapRows ?? false,
  });

describe("resolveDataGridKey. Square grid, no wrap", () => {
  it("moves one cell per arrow key", () => {
    expect(square("ArrowRight", { row: 0, col: 0 })).toEqual({ kind: "move", focus: { row: 0, col: 1 } });
    expect(square("ArrowLeft", { row: 0, col: 1 })).toEqual({ kind: "move", focus: { row: 0, col: 0 } });
    expect(square("ArrowDown", { row: 0, col: 0 })).toEqual({ kind: "move", focus: { row: 1, col: 0 } });
    expect(square("ArrowUp", { row: 1, col: 0 })).toEqual({ kind: "move", focus: { row: 0, col: 0 } });
  });

  it("stops at every edge without wrap", () => {
    expect(square("ArrowRight", { row: 0, col: 2 })).toEqual({ kind: "none" });
    expect(square("ArrowLeft", { row: 0, col: 0 })).toEqual({ kind: "none" });
    expect(square("ArrowDown", { row: 2, col: 0 })).toEqual({ kind: "none" });
    expect(square("ArrowUp", { row: 0, col: 0 })).toEqual({ kind: "none" });
  });

  it("Home/End move within the current row; no-op already there", () => {
    expect(square("Home", { row: 1, col: 2 })).toEqual({ kind: "move", focus: { row: 1, col: 0 } });
    expect(square("End", { row: 1, col: 0 })).toEqual({ kind: "move", focus: { row: 1, col: 2 } });
    expect(square("Home", { row: 1, col: 0 })).toEqual({ kind: "none" });
    expect(square("End", { row: 1, col: 2 })).toEqual({ kind: "none" });
  });

  it("Ctrl+Home/End jump to the first/last cell of the whole grid", () => {
    expect(square("Home", { row: 2, col: 1 }, { ctrl: true })).toEqual({ kind: "move", focus: { row: 0, col: 0 } });
    expect(square("End", { row: 0, col: 1 }, { ctrl: true })).toEqual({ kind: "move", focus: { row: 2, col: 2 } });
  });

  it("an unhandled key resolves to none", () => {
    expect(square("Tab", { row: 0, col: 0 })).toEqual({ kind: "none" });
  });
});

describe("resolveDataGridKey. Wrapping", () => {
  it("ArrowRight past the last column wraps into the next row's first cell when wrapCols is on", () => {
    expect(square("ArrowRight", { row: 0, col: 2 }, { wrapCols: true })).toEqual({
      kind: "move",
      focus: { row: 1, col: 0 },
    });
    // Wraps past the LAST row back to the first.
    expect(square("ArrowRight", { row: 2, col: 2 }, { wrapCols: true })).toEqual({
      kind: "move",
      focus: { row: 0, col: 0 },
    });
  });

  it("ArrowLeft past the first column wraps into the previous row's last cell", () => {
    expect(square("ArrowLeft", { row: 1, col: 0 }, { wrapCols: true })).toEqual({
      kind: "move",
      focus: { row: 0, col: 2 },
    });
    expect(square("ArrowLeft", { row: 0, col: 0 }, { wrapCols: true })).toEqual({
      kind: "move",
      focus: { row: 2, col: 2 },
    });
  });

  it("ArrowDown/Up wrap the ROW axis independently when wrapRows is on", () => {
    expect(square("ArrowDown", { row: 2, col: 1 }, { wrapRows: true })).toEqual({
      kind: "move",
      focus: { row: 0, col: 1 },
    });
    expect(square("ArrowUp", { row: 0, col: 1 }, { wrapRows: true })).toEqual({
      kind: "move",
      focus: { row: 2, col: 1 },
    });
  });

  it("wrapCols and wrapRows are independent. One on, the other off", () => {
    expect(square("ArrowRight", { row: 0, col: 2 }, { wrapCols: false, wrapRows: true })).toEqual({ kind: "none" });
    expect(square("ArrowDown", { row: 2, col: 0 }, { wrapCols: true, wrapRows: false })).toEqual({ kind: "none" });
  });
});

describe("resolveDataGridKey. Ragged rows (different cell counts per row)", () => {
  const ragged = (key: string, focus: { row: number; col: number }, ctrl = false) =>
    resolveDataGridKey({
      key,
      ctrl,
      focus,
      rowCount: 3,
      // row 0 has 4 cells, row 1 has 2, row 2 has 5.
      colCountOf: (row) => [4, 2, 5][row]!,
      wrapCols: false,
      wrapRows: false,
    });

  it("moving vertically clamps the column into the shorter destination row", () => {
    expect(ragged("ArrowDown", { row: 0, col: 3 })).toEqual({ kind: "move", focus: { row: 1, col: 1 } });
  });

  it("End lands on the true last cell of whichever row it's asked for", () => {
    expect(ragged("End", { row: 1, col: 0 })).toEqual({ kind: "move", focus: { row: 1, col: 1 } });
    expect(ragged("End", { row: 0, col: 0 }, true)).toEqual({ kind: "move", focus: { row: 2, col: 4 } });
  });

  it("moving back up from a clamped position returns to the original column when the row is long enough again", () => {
    // row 0 col 3 -> down clamps to row1 col1 -> back up returns to row0 col1 (not the original 3,
    // which is correct: nothing remembers the pre-clamp column, matching every other grid/spreadsheet).
    expect(ragged("ArrowUp", { row: 1, col: 1 })).toEqual({ kind: "move", focus: { row: 0, col: 1 } });
  });
});
