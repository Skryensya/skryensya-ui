import { describe, expect, it } from "vitest";
import { axisOf, decideDismiss, resist, VELOCITY_WINDOW, type Sample } from "./vaul-gesture.js";

/*
 * The one behaviour with no platform equivalent, finally testable without a DOM. These are the
 * questions the 305-line closure used to answer inline: does a fast short flick dismiss? does a
 * back-flick veto a far drag? does resistance cap?, asked directly of the pure module.
 */

// px/ms → a two-sample window whose speed is exactly `speed`, spanning the velocity window.
const window = (speed: number, at_offset = speed * VELOCITY_WINDOW): Sample[] => [
  { at: 0, at_offset: at_offset - speed * VELOCITY_WINDOW },
  { at: VELOCITY_WINDOW, at_offset },
];

const params = { travelled: 0, size: 400, threshold: 0.4, velocity: 0.5 };

describe("decideDismiss", () => {
  it("dismisses a far-enough slow drag (distance alone)", () => {
    // dragged 60% of the panel, barely moving at release
    expect(decideDismiss(window(0), { ...params, travelled: 240 })).toBe(true);
  });

  it("keeps a too-short slow drag (springs back)", () => {
    // only 20% dragged, no flick
    expect(decideDismiss(window(0), { ...params, travelled: 80 })).toBe(false);
  });

  it("dismisses a fast short flick even when the distance is small", () => {
    // barely moved, but thrown well past the velocity threshold
    expect(decideDismiss(window(1.2), { ...params, travelled: 40 })).toBe(true);
  });

  it("a flick BACK home overrules a far drag, direction beats distance", () => {
    // dragged 70% out, but the last instant was a fast throw back toward the edge
    expect(decideDismiss(window(-1.2), { ...params, travelled: 280 })).toBe(false);
  });

  it("a gentle release below the velocity threshold does not count as a flick", () => {
    expect(decideDismiss(window(0.3), { ...params, travelled: 40 })).toBe(false);
  });

  it("a single sample (no movement) never dismisses", () => {
    expect(decideDismiss([{ at: 0, at_offset: 0 }], { ...params, travelled: 40 })).toBe(false);
  });

  it("an empty sample list is a no-op, not a crash", () => {
    expect(decideDismiss([], { ...params, travelled: 999 })).toBe(false);
  });

  it("a zero-size panel can't be dismissed by distance (no division by zero)", () => {
    expect(decideDismiss(window(0), { ...params, size: 0, travelled: 999 })).toBe(false);
  });
});

describe("resist", () => {
  it("leaves the fingertip at 1∶1 for the first pixel (no dead zone)", () => {
    // f'(0) = 1, so a tiny pull is nearly honest
    expect(resist(0.001, 12)).toBeCloseTo(0.001, 4);
  });

  it("never exceeds the cap, however hard you pull", () => {
    // the cap is the asymptote: approached from below, reached (never passed) in floating point
    expect(resist(10_000, 12)).toBeLessThanOrEqual(12);
    expect(resist(10_000, 12)).toBeGreaterThan(11.9);
  });

  it("is monotonic, pulling further always gives a little more", () => {
    expect(resist(20, 12)).toBeGreaterThan(resist(10, 12));
  });
});

describe("axisOf", () => {
  it("block-end drags along y, positive", () => {
    expect(axisOf("block-end", false)).toEqual({ axis: "y", sign: 1 });
  });

  it("inline-start closes leftward (negative x) in LTR", () => {
    expect(axisOf("inline-start", false)).toEqual({ axis: "x", sign: -1 });
  });

  it("RTL mirrors only the inline edges", () => {
    expect(axisOf("inline-start", true)).toEqual({ axis: "x", sign: 1 });
    // block-end is unaffected by direction
    expect(axisOf("block-end", true)).toEqual({ axis: "y", sign: 1 });
  });
});
