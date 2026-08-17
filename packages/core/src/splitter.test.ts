import { describe, expect, it } from "vitest";
import {
  hasCrossedDragThreshold,
  parseColumnWeights,
  resolveColumnResize,
  resolveSplitterKey,
  resolveWeightedColumnWidths,
  splitterDirectionSign,
  splitterValuePercent,
} from "./splitter.js";

describe("resolveSplitterKey", () => {
  it("Left/Right resolve to a negative/positive delta of one step", () => {
    expect(resolveSplitterKey({ key: "ArrowLeft" })).toEqual({ kind: "delta", delta: -16 });
    expect(resolveSplitterKey({ key: "ArrowRight" })).toEqual({ kind: "delta", delta: 16 });
  });

  it("Shift+Left/Right use the coarse step instead", () => {
    expect(resolveSplitterKey({ key: "ArrowLeft", shiftKey: true })).toEqual({ kind: "delta", delta: -64 });
    expect(resolveSplitterKey({ key: "ArrowRight", shiftKey: true })).toEqual({ kind: "delta", delta: 64 });
  });

  it("honors caller-supplied step/coarseStep over the shared defaults", () => {
    expect(resolveSplitterKey({ key: "ArrowRight" }, { step: 5 })).toEqual({ kind: "delta", delta: 5 });
    expect(resolveSplitterKey({ key: "ArrowRight", shiftKey: true }, { coarseStep: 100 })).toEqual({
      kind: "delta",
      delta: 100,
    });
  });

  it("Home/End resolve to their own intents, not a delta", () => {
    expect(resolveSplitterKey({ key: "Home" })).toEqual({ kind: "home" });
    expect(resolveSplitterKey({ key: "End" })).toEqual({ kind: "end" });
  });

  it("Enter resolves to reset", () => {
    expect(resolveSplitterKey({ key: "Enter" })).toEqual({ kind: "reset" });
  });

  it("an unhandled key resolves to none", () => {
    expect(resolveSplitterKey({ key: "Tab" })).toEqual({ kind: "none" });
    expect(resolveSplitterKey({ key: "a" })).toEqual({ kind: "none" });
  });
});

describe("hasCrossedDragThreshold", () => {
  it("is false under the threshold, true at and past it", () => {
    expect(hasCrossedDragThreshold(100, 102)).toBe(false);
    expect(hasCrossedDragThreshold(100, 104)).toBe(true);
    expect(hasCrossedDragThreshold(100, 108)).toBe(true);
  });

  it("is direction-agnostic — travel either way counts", () => {
    expect(hasCrossedDragThreshold(100, 96)).toBe(true);
  });

  it("honors a caller-supplied threshold", () => {
    expect(hasCrossedDragThreshold(100, 105, 10)).toBe(false);
    expect(hasCrossedDragThreshold(100, 111, 10)).toBe(true);
  });
});

describe("splitterValuePercent", () => {
  it("reports 0/50/100 at the ends and midpoint of the range", () => {
    expect(splitterValuePercent(300, 200, 400)).toBe(50);
    expect(splitterValuePercent(200, 200, 400)).toBe(0);
    expect(splitterValuePercent(400, 200, 400)).toBe(100);
  });

  it("clamps a value outside the range before computing", () => {
    expect(splitterValuePercent(50, 200, 400)).toBe(0);
    expect(splitterValuePercent(900, 200, 400)).toBe(100);
  });

  it("returns 100 for a degenerate range instead of dividing by zero", () => {
    expect(splitterValuePercent(200, 200, 200)).toBe(100);
    expect(splitterValuePercent(200, 400, 200)).toBe(100);
  });
});

describe("splitterDirectionSign", () => {
  it("is 1 for ltr, -1 for rtl", () => {
    expect(splitterDirectionSign("ltr")).toBe(1);
    expect(splitterDirectionSign("rtl")).toBe(-1);
  });
});

describe("resolveColumnResize", () => {
  it("grows column `index` and shrinks `index + 1` by the same delta, total unchanged", () => {
    expect(resolveColumnResize({ widths: [100, 100], index: 0, delta: 20, min: 20 })).toEqual([120, 80]);
    expect(resolveColumnResize({ widths: [100, 100], index: 0, delta: -20, min: 20 })).toEqual([80, 120]);
  });

  it("never disturbs a column outside the resized pair", () => {
    expect(resolveColumnResize({ widths: [100, 100, 100, 100], index: 1, delta: 30, min: 20 })).toEqual([
      100, 130, 70, 100,
    ]);
  });

  it("clamps at `min` on either side instead of overshooting into the neighbor", () => {
    // column 1 has 100 to give; asking for 150 more can only take it to (100+100)-min=180
    expect(resolveColumnResize({ widths: [100, 100], index: 0, delta: 150, min: 20 })).toEqual([180, 20]);
    expect(resolveColumnResize({ widths: [100, 100], index: 0, delta: -150, min: 20 })).toEqual([20, 180]);
  });

  it("+Infinity/-Infinity (a splitter's Home/End) saturate to the pair's max/min extent in one step", () => {
    expect(resolveColumnResize({ widths: [100, 100], index: 0, delta: Infinity, min: 20 })).toEqual([180, 20]);
    expect(resolveColumnResize({ widths: [100, 100], index: 0, delta: -Infinity, min: 20 })).toEqual([20, 180]);
  });

  it("is a no-op (returns the input) for an index with no pair to resize against", () => {
    const widths = [100, 100];
    expect(resolveColumnResize({ widths, index: 1, delta: 20, min: 20 })).toBe(widths);
    expect(resolveColumnResize({ widths, index: -1, delta: 20, min: 20 })).toBe(widths);
  });
});

describe("resolveWeightedColumnWidths", () => {
  it("reduces to an even split when every weight is equal", () => {
    expect(resolveWeightedColumnWidths({ total: 400, weights: [1, 1, 1, 1], min: 20 })).toEqual([
      100, 100, 100, 100,
    ]);
  });

  it("gives a heavier-weighted column a bigger share of the total, total conserved", () => {
    const widths = resolveWeightedColumnWidths({ total: 400, weights: [2, 1, 1], min: 20 });
    expect(widths[0]).toBeGreaterThan(widths[1]!);
    expect(widths[1]).toBe(widths[2]);
    expect(widths.reduce((sum, w) => sum + w, 0)).toBe(400);
  });

  it("floors every column at `min` before handing out the rest by weight", () => {
    // floor alone (20*4=80) already exceeds the total (60): every column gets exactly `min`.
    expect(resolveWeightedColumnWidths({ total: 60, weights: [10, 1, 1, 1], min: 20 })).toEqual([
      20, 20, 20, 20,
    ]);
  });

  it("returns an empty array for zero columns", () => {
    expect(resolveWeightedColumnWidths({ total: 400, weights: [], min: 20 })).toEqual([]);
  });
});

describe("parseColumnWeights", () => {
  it("parses a comma-separated list of positive numbers", () => {
    expect(parseColumnWeights("2,1,1,1", 4)).toEqual([2, 1, 1, 1]);
    expect(parseColumnWeights("2, 1, 1, 1", 4)).toEqual([2, 1, 1, 1]);
  });

  it("returns null when the count does not match", () => {
    expect(parseColumnWeights("2,1,1", 4)).toBeNull();
  });

  it("returns null for a missing or empty value", () => {
    expect(parseColumnWeights(null, 4)).toBeNull();
    expect(parseColumnWeights("", 4)).toBeNull();
  });

  it("returns null when any weight is not a positive number", () => {
    expect(parseColumnWeights("2,0,1,1", 4)).toBeNull();
    expect(parseColumnWeights("2,-1,1,1", 4)).toBeNull();
    expect(parseColumnWeights("2,abc,1,1", 4)).toBeNull();
  });
});
