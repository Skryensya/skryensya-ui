import { describe, expect, it } from "vitest";
import { clampPosition, exceedsDragThreshold, fpsFromFrameCount, panelEdge } from "./geometry";

describe("clampPosition", () => {
  it("leaves a position that already fits untouched", () => {
    expect(clampPosition({ left: 50, top: 50 }, { width: 200, height: 100 }, { width: 800, height: 600 })).toEqual({
      left: 50,
      top: 50,
    });
  });

  it("pulls a position back onto the viewport past the right/bottom edge", () => {
    expect(clampPosition({ left: 900, top: 900 }, { width: 200, height: 100 }, { width: 800, height: 600 })).toEqual(
      { left: 600, top: 500 },
    );
  });

  it("pulls a position back onto the viewport before the left/top edge", () => {
    expect(clampPosition({ left: -40, top: -40 }, { width: 200, height: 100 }, { width: 800, height: 600 })).toEqual(
      { left: 0, top: 0 },
    );
  });

  it("never asks for a negative max when the box is wider than the viewport", () => {
    // A viewport shrunk (or a panel briefly measuring 0×0 pre-layout) past the box's own size:
    // the max must floor at 0, never go negative and push the box further off than clamping alone would.
    expect(clampPosition({ left: 500, top: 500 }, { width: 900, height: 700 }, { width: 800, height: 600 })).toEqual(
      { left: 0, top: 0 },
    );
  });
});

describe("exceedsDragThreshold", () => {
  it("is false for a pointer that has not moved", () => {
    expect(exceedsDragThreshold(0, 0, 4)).toBe(false);
  });

  it("is false below the threshold, even diagonally", () => {
    // 3-4-5 triangle: hypot(3, 0) = 3, under a threshold of 4.
    expect(exceedsDragThreshold(3, 0, 4)).toBe(false);
  });

  it("is true once the straight-line distance reaches the threshold", () => {
    expect(exceedsDragThreshold(4, 0, 4)).toBe(true);
    expect(exceedsDragThreshold(3, 4, 5)).toBe(true); // hypot(3, 4) === 5
  });

  it("measures straight-line distance, not axis-aligned distance", () => {
    // Either axis alone is under 4, but the diagonal (hypot(3, 3) ≈ 4.24) clears it.
    expect(exceedsDragThreshold(3, 3, 4)).toBe(true);
  });
});

describe("panelEdge", () => {
  it("opens upward when there is room above the toggle", () => {
    expect(panelEdge(400, 220)).toBe("top");
  });

  it("flips downward when there is not enough room above", () => {
    expect(panelEdge(100, 220)).toBe("bottom");
  });

  it("treats exactly minSpace as enough room, only strictly less flips it", () => {
    expect(panelEdge(220, 220)).toBe("top");
    expect(panelEdge(219, 220)).toBe("bottom");
  });
});

describe("fpsFromFrameCount", () => {
  it("computes frames per second from a count over a window", () => {
    expect(fpsFromFrameCount(15, 250)).toBe(60); // 15 frames / 250ms === 60fps
  });

  it("rounds to the nearest whole frame", () => {
    expect(fpsFromFrameCount(16, 267)).toBe(60); // 59.9...fps rounds up
  });

  it("never divides by zero: a window with no elapsed time reads as 0fps, not Infinity/NaN", () => {
    expect(fpsFromFrameCount(0, 0)).toBe(0);
    expect(fpsFromFrameCount(5, 0)).toBe(0);
  });
});
