import { describe, expect, it } from "vitest";
import {
  computeTreegridVisibility,
  diffTreegridVisibility,
  resolveTreegridKey,
  type TreegridRowMeta,
} from "./treegrid.js";

/*
 * A fixture matching WAI's own `treegrid-1` shape: two top-level branches (each with children), one
 * top-level leaf.
 *
 *   0  Inbox      (level 1, branch, expanded)
 *   1    Alice     (level 2, leaf)
 *   2    Bob        (level 2, leaf)
 *   3  Drafts      (level 1, branch, collapsed)
 *   4    Untitled   (level 2, leaf — hidden while Drafts is collapsed)
 *   5  Sent        (level 1, leaf)
 */
const FIXTURE: readonly TreegridRowMeta[] = [
  { level: 1, isBranch: true, expanded: true },
  { level: 2, isBranch: false, expanded: false },
  { level: 2, isBranch: false, expanded: false },
  { level: 1, isBranch: true, expanded: false },
  { level: 2, isBranch: false, expanded: false },
  { level: 1, isBranch: false, expanded: false },
];

describe("computeTreegridVisibility", () => {
  it("shows every row when nothing is collapsed", () => {
    const allExpanded = FIXTURE.map((row) => (row.isBranch ? { ...row, expanded: true } : row));
    expect(computeTreegridVisibility(allExpanded)).toEqual([true, true, true, true, true, true]);
  });

  it("hides only the descendants of a collapsed branch, not its siblings", () => {
    expect(computeTreegridVisibility(FIXTURE)).toEqual([true, true, true, true, false, true]);
  });

  it("a nested collapsed branch stays hidden as a unit when its ancestor also collapses", () => {
    const nested: TreegridRowMeta[] = [
      { level: 1, isBranch: true, expanded: false }, // collapses everything below
      { level: 2, isBranch: true, expanded: true }, // would show its own children if visible at all
      { level: 3, isBranch: false, expanded: false },
      { level: 1, isBranch: false, expanded: false }, // back to top level: visible again
    ];
    expect(computeTreegridVisibility(nested)).toEqual([true, false, false, true]);
  });

  it("a leaf's own `expanded: false` (impossible via the option, but defensive) never hides anything — only isBranch gates it", () => {
    const leaves: TreegridRowMeta[] = [
      { level: 1, isBranch: false, expanded: false },
      { level: 1, isBranch: false, expanded: false },
    ];
    expect(computeTreegridVisibility(leaves)).toEqual([true, true]);
  });
});

describe("diffTreegridVisibility", () => {
  it("marks every row undefined when nothing changed", () => {
    const before = computeTreegridVisibility(FIXTURE);
    const after = computeTreegridVisibility(FIXTURE);
    expect(diffTreegridVisibility(before, after)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it("marks a newly-shown row entering and a newly-hidden row exiting, nothing else", () => {
    // Drafts (index 3) expands: its child (index 4) goes hidden→visible, everything else unchanged.
    const before = computeTreegridVisibility(FIXTURE);
    const expanded = FIXTURE.map((row, index) => (index === 3 ? { ...row, expanded: true } : row));
    const after = computeTreegridVisibility(expanded);
    expect(diffTreegridVisibility(before, after)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      "entering",
      undefined,
    ]);
  });

  it("marks every descendant of a newly-collapsed ancestor exiting, however deep", () => {
    // Same nested fixture computeTreegridVisibility's own test above uses, but starting fully
    // expanded and then collapsing the top-level branch — both its child AND grandchild exit.
    const expanded: TreegridRowMeta[] = [
      { level: 1, isBranch: true, expanded: true },
      { level: 2, isBranch: true, expanded: true },
      { level: 3, isBranch: false, expanded: false },
      { level: 1, isBranch: false, expanded: false },
    ];
    const collapsed = expanded.map((row, index) => (index === 0 ? { ...row, expanded: false } : row));
    const before = computeTreegridVisibility(expanded);
    const after = computeTreegridVisibility(collapsed);
    expect(diffTreegridVisibility(before, after)).toEqual([undefined, "exiting", "exiting", undefined]);
  });
});

/** The fixture's rows AS THEY APPEAR when visible — index 4 (Drafts' child) is absent. */
const VISIBLE: readonly TreegridRowMeta[] = [FIXTURE[0]!, FIXTURE[1]!, FIXTURE[2]!, FIXTURE[3]!, FIXTURE[5]!];

const resolve = (key: string, focus: { row: number; col: number | null }, colCount = 3, ctrl = false) =>
  resolveTreegridKey({ key, ctrl, focus, rows: VISIBLE, colCount });

describe("resolveTreegridKey", () => {
  describe("ArrowRight", () => {
    it("expands a collapsed branch instead of moving, when the row itself is focused", () => {
      expect(resolve("ArrowRight", { row: 3, col: null })).toEqual({ kind: "toggle", row: 3, expanded: true });
    });

    it("enters the first cell when the row is already expanded (or is a leaf)", () => {
      expect(resolve("ArrowRight", { row: 0, col: null })).toEqual({ kind: "move", focus: { row: 0, col: 0 } });
      expect(resolve("ArrowRight", { row: 4, col: null })).toEqual({ kind: "move", focus: { row: 4, col: 0 } });
    });

    it("moves right one cell at a time and stops at the last column", () => {
      expect(resolve("ArrowRight", { row: 0, col: 0 })).toEqual({ kind: "move", focus: { row: 0, col: 1 } });
      expect(resolve("ArrowRight", { row: 0, col: 2 })).toEqual({ kind: "none" });
    });
  });

  describe("ArrowLeft", () => {
    it("collapses an expanded branch instead of moving, when the row itself is focused", () => {
      expect(resolve("ArrowLeft", { row: 0, col: null })).toEqual({ kind: "toggle", row: 0, expanded: false });
    });

    it("moves to the parent row when a NESTED row is already collapsed (or is a leaf)", () => {
      // Alice (row 1, a leaf) is nested one level under Inbox (row 0) — Left goes to that parent.
      expect(resolve("ArrowLeft", { row: 1, col: null })).toEqual({ kind: "move", focus: { row: 0, col: null } });
    });

    it("does nothing at a TOP-LEVEL row with nowhere left to go, collapsed or not", () => {
      // Drafts (row 3) is already collapsed but is itself top-level — no ancestor to move to.
      expect(resolve("ArrowLeft", { row: 3, col: null })).toEqual({ kind: "none" });
      // Sent (row 4) is a top-level leaf — same absence of a parent.
      expect(resolve("ArrowLeft", { row: 4, col: null })).toEqual({ kind: "none" });
    });

    it("column 0 returns to row focus; any other column just moves left", () => {
      expect(resolve("ArrowLeft", { row: 0, col: 0 })).toEqual({ kind: "move", focus: { row: 0, col: null } });
      expect(resolve("ArrowLeft", { row: 0, col: 2 })).toEqual({ kind: "move", focus: { row: 0, col: 1 } });
    });
  });

  describe("ArrowDown / ArrowUp", () => {
    it("moves one VISIBLE row at a time, preserving row-vs-cell focus", () => {
      expect(resolve("ArrowDown", { row: 0, col: null })).toEqual({ kind: "move", focus: { row: 1, col: null } });
      expect(resolve("ArrowDown", { row: 0, col: 1 })).toEqual({ kind: "move", focus: { row: 1, col: 1 } });
      expect(resolve("ArrowUp", { row: 1, col: 1 })).toEqual({ kind: "move", focus: { row: 0, col: 1 } });
    });

    it("does not wrap past either end", () => {
      expect(resolve("ArrowUp", { row: 0, col: null })).toEqual({ kind: "none" });
      expect(resolve("ArrowDown", { row: 4, col: null })).toEqual({ kind: "none" });
    });
  });

  describe("Home / End", () => {
    it("row focus: jumps to the first/last visible row", () => {
      expect(resolve("Home", { row: 2, col: null })).toEqual({ kind: "move", focus: { row: 0, col: null } });
      expect(resolve("End", { row: 2, col: null })).toEqual({ kind: "move", focus: { row: 4, col: null } });
    });

    it("cell focus: jumps to the first/last cell of the SAME row", () => {
      expect(resolve("Home", { row: 2, col: 2 })).toEqual({ kind: "move", focus: { row: 2, col: 0 } });
      expect(resolve("End", { row: 2, col: 0 })).toEqual({ kind: "move", focus: { row: 2, col: 2 } });
    });
  });

  describe("Ctrl+Home / Ctrl+End", () => {
    it("jumps to the first/last row, preserving whichever column (or row focus) was active", () => {
      expect(resolveTreegridKey({ key: "Home", ctrl: true, focus: { row: 2, col: 1 }, rows: VISIBLE, colCount: 3 })).toEqual({
        kind: "move",
        focus: { row: 0, col: 1 },
      });
      expect(resolveTreegridKey({ key: "End", ctrl: true, focus: { row: 0, col: null }, rows: VISIBLE, colCount: 3 })).toEqual({
        kind: "move",
        focus: { row: 4, col: null },
      });
    });
  });

  describe("Enter / Space", () => {
    it("toggles a branch when the row itself is focused", () => {
      expect(resolve("Enter", { row: 0, col: null })).toEqual({ kind: "toggle", row: 0, expanded: false });
      expect(resolve(" ", { row: 3, col: null })).toEqual({ kind: "toggle", row: 3, expanded: true });
    });

    it("activates (never toggles) a leaf row, or any cell regardless of branch-ness", () => {
      expect(resolve("Enter", { row: 4, col: null })).toEqual({ kind: "activate", row: 4 });
      expect(resolve("Enter", { row: 0, col: 0 })).toEqual({ kind: "activate", row: 0 });
    });
  });

  it("an unhandled key (Tab included — nothing to intercept in this scope) resolves to none", () => {
    expect(resolve("Tab", { row: 0, col: null })).toEqual({ kind: "none" });
    expect(resolve("a", { row: 0, col: null })).toEqual({ kind: "none" });
  });
});
