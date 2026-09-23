import { describe, expect, it } from "vitest";
import {
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  CANVAS_PAN_STEP,
  CANVAS_ZOOM_STEP,
  canvasClampView,
  canvasFitScale,
  canvasFitView,
  canvasKeyAction,
  canvasPinchView,
  canvasTransform,
  canvasWheelFactor,
  canvasZoomAround,
  clampZoom,
} from "./canvas.js";

/*
 * The canvas is these functions plus one controller that wires events to them. Everything that can
 * be wrong about how zooming FEELS is here: what stays under the pointer, what a fitted view looks
 * like, how far the content may be dragged, and how a pinch turns two fingers into one transform.
 */

describe("canvasFitScale", () => {
  it("scales a wide drawing down to the viewport's width", () => {
    expect(canvasFitScale({ width: 800, height: 400 }, 400)).toBe(0.5);
  });

  it("never scales a small drawing UP", () => {
    expect(canvasFitScale({ width: 200, height: 100 }, 400)).toBe(1);
  });

  it("also fits the height when the viewport is capped", () => {
    // 800 wide into 400 is 0.5, but 1000 tall into a 250 cap is 0.25: the tighter one wins.
    expect(canvasFitScale({ width: 800, height: 1000 }, 400, 250)).toBe(0.25);
  });

  it("answers 1 when there is nothing measured yet", () => {
    expect(canvasFitScale({ width: 0, height: 0 }, 400)).toBe(1);
    expect(canvasFitScale({ width: 800, height: 400 }, 0)).toBe(1);
  });
});

describe("canvasFitView", () => {
  it("centres the scaled content on both axes", () => {
    expect(canvasFitView({ width: 800, height: 400 }, { width: 500, height: 300 }, 0.5)).toEqual({
      x: 50,
      y: 50,
      scale: 0.5,
    });
  });
});

describe("canvasZoomAround", () => {
  it("keeps the content point under the anchor exactly where it was on screen", () => {
    const view = { x: 10, y: 20, scale: 1 };
    const anchor = { x: 110, y: 70 };
    const next = canvasZoomAround(view, 2, anchor);
    // The content point under the anchor before: (100, 50). After, drawn at view + p * scale.
    expect(next.x + 100 * next.scale).toBe(anchor.x);
    expect(next.y + 50 * next.scale).toBe(anchor.y);
  });

  it("round-trips: zooming in and back out around the same point lands where it started", () => {
    const view = { x: 13, y: -7, scale: 0.8 };
    const anchor = { x: 200, y: 90 };
    const back = canvasZoomAround(canvasZoomAround(view, 1.6, anchor), 0.8, anchor);
    expect(back).toEqual(view);
  });
});

describe("canvasClampView", () => {
  const content = { width: 800, height: 400 };
  const viewport = { width: 400, height: 200 };

  it("lets a fitted drawing be dragged, so the first thing a reader tries does something", () => {
    // Drawn 200x100 in a 400x200 window: the old rule centred it and refused to move.
    const moved = { x: 150, y: 20, scale: 0.25 };
    expect(canvasClampView(moved, content, viewport)).toEqual(moved);
  });

  it("never lets less than half of the drawing (or of the window) stay in view", () => {
    // Drawn 200x100: at least 100 wide and 50 tall must remain inside the 400x200 window.
    expect(canvasClampView({ x: 999, y: -999, scale: 0.25 }, content, viewport)).toEqual({
      x: 300,
      y: -50,
      scale: 0.25,
    });
    // Drawn 800x400, larger than the window: half the WINDOW's size must stay covered.
    expect(canvasClampView({ x: 999, y: -999, scale: 1 }, content, viewport)).toEqual({
      x: 200,
      y: -300,
      scale: 1,
    });
  });
});

describe("canvasWheelFactor", () => {
  it("zooms IN for a wheel pulled toward the reader (negative delta) and out for the opposite", () => {
    expect(canvasWheelFactor(-10)).toBeGreaterThan(1);
    expect(canvasWheelFactor(10)).toBeLessThan(1);
  });

  it("is symmetric, so the same distance in and back out cancels", () => {
    expect(canvasWheelFactor(-20) * canvasWheelFactor(20)).toBeCloseTo(1, 10);
  });

  it("caps one mouse notch, however large its delta, to one comfortable step", () => {
    expect(canvasWheelFactor(-100)).toBe(canvasWheelFactor(-50));
    // LINE mode counts 16px a line: 4 lines is 64px, capped the same way.
    expect(canvasWheelFactor(-4, 1)).toBe(canvasWheelFactor(-50));
  });
});

describe("canvasPinchView", () => {
  const start = { x: 0, y: 0, scale: 1 };

  it("scales by how far apart the fingers are compared with when they landed", () => {
    const next = canvasPinchView(
      start,
      [{ x: 100, y: 100 }, { x: 200, y: 100 }],
      [{ x: 50, y: 100 }, { x: 250, y: 100 }],
    );
    expect(next.scale).toBe(2);
  });

  it("keeps the content point between the fingers between them as they spread", () => {
    const next = canvasPinchView(
      start,
      [{ x: 100, y: 100 }, { x: 200, y: 100 }],
      [{ x: 50, y: 100 }, { x: 250, y: 100 }],
    );
    // The midpoint (150, 100) was content point (150, 100); it must still be drawn at (150, 100).
    expect(next.x + 150 * next.scale).toBe(150);
    expect(next.y + 100 * next.scale).toBe(100);
  });

  it("pans without zooming when both fingers move together", () => {
    const next = canvasPinchView(
      start,
      [{ x: 100, y: 100 }, { x: 200, y: 100 }],
      [{ x: 130, y: 60 }, { x: 230, y: 60 }],
    );
    expect(next).toEqual({ x: 30, y: -40, scale: 1 });
  });

  it("stops at the zoom limits", () => {
    const far = canvasPinchView(
      start,
      [{ x: 100, y: 100 }, { x: 101, y: 100 }],
      [{ x: 0, y: 100 }, { x: 1000, y: 100 }],
    );
    expect(far.scale).toBe(CANVAS_MAX_ZOOM);
  });
});

describe("canvasKeyAction", () => {
  it("zooms with + and -, fits with 0 and shows 100% with 1", () => {
    expect(canvasKeyAction("+")).toEqual({ kind: "zoom", by: CANVAS_ZOOM_STEP });
    expect(canvasKeyAction("=")).toEqual({ kind: "zoom", by: CANVAS_ZOOM_STEP });
    expect(canvasKeyAction("-")).toEqual({ kind: "zoom", by: 1 / CANVAS_ZOOM_STEP });
    expect(canvasKeyAction("0")).toEqual({ kind: "fit" });
    expect(canvasKeyAction("1")).toEqual({ kind: "actual" });
  });

  it("moves the view the way an arrow points, which moves the content the other way", () => {
    expect(canvasKeyAction("ArrowRight")).toEqual({ kind: "pan", dx: -CANVAS_PAN_STEP, dy: 0 });
    expect(canvasKeyAction("ArrowUp")).toEqual({ kind: "pan", dx: 0, dy: CANVAS_PAN_STEP });
  });

  it("leaves every other key to the page", () => {
    expect(canvasKeyAction("a")).toBeNull();
    expect(canvasKeyAction("Tab")).toBeNull();
  });
});

describe("the small ones", () => {
  it("clamps a scale into range and treats nonsense as 100%", () => {
    expect(clampZoom(10)).toBe(CANVAS_MAX_ZOOM);
    expect(clampZoom(0.01)).toBe(CANVAS_MIN_ZOOM);
    expect(clampZoom(Number.NaN)).toBe(1);
  });

  it("writes the transform the way both bindings will", () => {
    expect(canvasTransform({ x: 12.5, y: -3, scale: 0.5 })).toBe("translate(12.5px, -3px) scale(0.5)");
  });
});
