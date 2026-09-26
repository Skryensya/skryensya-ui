import { describe, expect, it } from "vitest";
import {
  TOUR_ARROW_INSET,
  TOUR_GAP,
  TOUR_VIEWPORT_MARGIN,
  formatTourProgress,
  normalizeTourPlacement,
  parseTourMemory,
  placeTourPopover,
  tourContract,
  tourFirstStep,
  tourMemorySlot,
  tourPlacementOrder,
  tourProgress,
  tourRectInView,
  tourRectVisible,
  tourRingRadius,
  tourStep,
} from "./tour.js";

/*
 * The pure half of Tour: which step comes next when targets are missing, how progress counts, where
 * the box lands, and how the ring's corners follow the target's. The DOM half (focus, Escape, the
 * observers) is the controller's and is proved in the Vanilla suite, over real markup.
 */

describe("tour navigation", () => {
  const all = [true, true, true, true];

  it("steps forward and back one at a time", () => {
    expect(tourStep(0, 1, all)).toBe(1);
    expect(tourStep(2, -1, all)).toBe(1);
  });

  it("has nowhere to go past either end", () => {
    expect(tourStep(3, 1, all)).toBeNull();
    expect(tourStep(0, -1, all)).toBeNull();
  });

  it("skips a step whose target is missing, in both directions", () => {
    const missingSecond = [true, false, true, true];
    expect(tourStep(0, 1, missingSecond)).toBe(2);
    expect(tourStep(2, -1, missingSecond)).toBe(0);
  });

  it("starts on the first step that has a target, and on none when no step does", () => {
    expect(tourFirstStep([false, false, true])).toBe(2);
    expect(tourFirstStep([false, false])).toBeNull();
    expect(tourFirstStep([])).toBeNull();
  });

  it("never returns the step it started from, so a missing current step can ask what is next", () => {
    expect(tourStep(1, 1, [true, true, false])).toBeNull();
    expect(tourStep(1, -1, [true, true, false])).toBe(0);
  });
});

describe("tour progress", () => {
  it("counts only the steps that can be shown", () => {
    const available = [true, false, true, true];
    expect(tourProgress(0, available)).toEqual({ position: 1, count: 3 });
    expect(tourProgress(2, available)).toEqual({ position: 2, count: 3 });
    expect(tourProgress(3, available)).toEqual({ position: 3, count: 3 });
  });

  it("fills the label in both languages", () => {
    expect(formatTourProgress("Step {index} of {count}", 2, 4)).toBe("Step 2 of 4");
    expect(formatTourProgress("Paso {index} de {count}", 1, 4)).toBe("Paso 1 de 4");
  });
});

describe("tour placement", () => {
  const viewport = { width: 1000, height: 800 };
  const popover = { width: 300, height: 150 };

  it("puts the box on the side asked for, centred on the target", () => {
    const target = { top: 100, left: 400, width: 200, height: 40 };
    const at = placeTourPopover({ target, popover, viewport, preferred: "block-end" });
    expect(at).toEqual({ side: "block-end", top: 140 + TOUR_GAP, left: 350, arrow: { edge: "top", offset: 150 } });
  });

  it("points the arrow at the target's middle, even when the box is pushed along by an edge", () => {
    const nearLeft = { top: 100, left: 20, width: 40, height: 40 };
    const at = placeTourPopover({ target: nearLeft, popover, viewport, preferred: "block-end" });
    expect(at.left).toBe(TOUR_VIEWPORT_MARGIN);
    expect(at.arrow).toEqual({ edge: "top", offset: 40 - TOUR_VIEWPORT_MARGIN });
  });

  it("keeps the arrow clear of the box's corners", () => {
    const corner = { top: 100, left: 0, width: 4, height: 40 };
    const at = placeTourPopover({ target: corner, popover, viewport, preferred: "block-end" });
    expect(at.arrow?.offset).toBe(TOUR_ARROW_INSET);
  });

  it("puts the arrow on the edge facing the target, on every side", () => {
    const target = { top: 300, left: 400, width: 100, height: 40 };
    expect(placeTourPopover({ target, popover, viewport, preferred: "block-start" }).arrow?.edge).toBe("bottom");
    expect(placeTourPopover({ target, popover, viewport, preferred: "inline-end" }).arrow).toEqual({ edge: "left", offset: 75 });
    expect(placeTourPopover({ target, popover, viewport, preferred: "inline-end", rtl: true }).arrow?.edge).toBe("right");
  });

  it("flips to the opposite side of the same axis first", () => {
    const target = { top: 700, left: 400, width: 200, height: 40 };
    expect(placeTourPopover({ target, popover, viewport, preferred: "block-end" }).side).toBe("block-start");
    const nearRight = { top: 300, left: 850, width: 100, height: 40 };
    expect(placeTourPopover({ target: nearRight, popover, viewport, preferred: "inline-end" }).side).toBe("inline-start");
  });

  it("maps inline sides to physical ones by direction", () => {
    const target = { top: 300, left: 400, width: 100, height: 40 };
    const ltr = placeTourPopover({ target, popover, viewport, preferred: "inline-end" });
    const rtl = placeTourPopover({ target, popover, viewport, preferred: "inline-end", rtl: true });
    expect(ltr.left).toBe(500 + TOUR_GAP);
    expect(rtl.left).toBe(400 - TOUR_GAP - popover.width);
  });

  it("keeps the box inside the viewport when the target hugs an edge", () => {
    const target = { top: 100, left: 0, width: 40, height: 40 };
    const at = placeTourPopover({ target, popover, viewport, preferred: "block-end" });
    expect(at.left).toBe(TOUR_VIEWPORT_MARGIN);
  });

  it("never covers the target when some side fits", () => {
    const target = { top: 50, left: 50, width: 600, height: 600 };
    const at = placeTourPopover({ target, popover, viewport, preferred: "block-end" });
    expect(at.side).toBe("inline-end");
    expect(at.left).toBeGreaterThanOrEqual(650);
  });

  it("docks to the half of the screen the target is not in when no side fits", () => {
    const small = { width: 320, height: 568 };
    const box = { width: 304, height: 300 };
    const high = placeTourPopover({ target: { top: 0, left: 0, width: 320, height: 300 }, popover: box, viewport: small });
    expect(high.side).toBe("docked");
    expect(high.top).toBe(small.height - box.height - TOUR_VIEWPORT_MARGIN);
    const low = placeTourPopover({ target: { top: 268, left: 0, width: 320, height: 300 }, popover: box, viewport: small });
    expect(low).toMatchObject({ side: "docked", top: TOUR_VIEWPORT_MARGIN, arrow: null });
  });

  it("tries the same axis, then the other, block-end first", () => {
    expect(tourPlacementOrder("block-start")).toEqual(["block-start", "block-end", "inline-end", "inline-start"]);
    expect(tourPlacementOrder("inline-start")).toEqual(["inline-start", "inline-end", "block-end", "block-start"]);
  });

  it("reads an unknown placement as the default", () => {
    expect(normalizeTourPlacement("left")).toBe("block-end");
    expect(normalizeTourPlacement(null)).toBe("block-end");
    expect(normalizeTourPlacement("inline-start")).toBe("inline-start");
  });
});

describe("tour viewport tests", () => {
  const viewport = { width: 1000, height: 800 };

  it("knows a target that is partly on screen from one that is gone", () => {
    expect(tourRectVisible({ top: -30, left: 0, width: 100, height: 40 }, viewport)).toBe(true);
    expect(tourRectVisible({ top: -60, left: 0, width: 100, height: 40 }, viewport)).toBe(false);
  });

  it("scrolls only for a target not already in full view", () => {
    expect(tourRectInView({ top: 100, left: 100, width: 100, height: 40 }, viewport)).toBe(true);
    expect(tourRectInView({ top: 780, left: 100, width: 100, height: 40 }, viewport)).toBe(false);
  });
});

describe("tour ring", () => {
  it("grows the target's radius by the offset, so the ring stays parallel to its edge", () => {
    expect(tourRingRadius("8px", 6)).toBe("14px");
    expect(tourRingRadius("0px", 6)).toBe("6px");
    expect(tourRingRadius("", 6)).toBe("6px");
  });

  it("keeps a percentage as one, so a circle stays a circle", () => {
    expect(tourRingRadius("50%", 6)).toBe("50%");
  });

  it("reads an elliptical corner by its first radius", () => {
    expect(tourRingRadius("10px 20px", 4)).toBe("14px");
  });
});

describe("tour memory", () => {
  it("keeps one slot per tour id", () => {
    expect(tourMemorySlot("onboarding")).toBe("tour:onboarding");
  });

  it("accepts only an ending, and never a running tour", () => {
    expect(parseTourMemory("completed")).toBe("completed");
    expect(parseTourMemory("skipped")).toBe("skipped");
    expect(parseTourMemory("running")).toBeUndefined();
    expect(parseTourMemory(3)).toBeUndefined();
  });
});

describe("tour contract", () => {
  it("is a non-modal dialog, never a tooltip, and hides the ring from assistive tech", () => {
    const serialized = JSON.stringify(tourContract.signatures.Tour.template);
    expect(serialized).toContain('"role":"dialog"');
    expect(serialized).not.toContain("tooltip");
    expect(serialized).not.toContain("aria-modal");
    expect(serialized).toContain('"part":"ring","attrs":{"aria-hidden":"true"');
  });

  it("uses manual popovers, so nothing outside the box dismisses it", () => {
    const serialized = JSON.stringify(tourContract.signatures.Tour.template);
    expect(serialized.match(/"popover":"manual"/g)).toHaveLength(2);
    expect(serialized).not.toContain('"popover":"auto"');
  });
});
