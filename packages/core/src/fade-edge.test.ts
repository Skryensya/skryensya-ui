import { describe, expect, it } from "vitest";
import { fadeEdgeHasMore, type FadeEdgeScrollMetrics } from "./fade-edge.js";

/* A 100x100 viewport over 300x300 of content, scrolled to wherever the case says. */
const at = (partial: Partial<FadeEdgeScrollMetrics>): FadeEdgeScrollMetrics => ({
  scrollTop: 0,
  scrollLeft: 0,
  scrollWidth: 300,
  scrollHeight: 300,
  clientWidth: 100,
  clientHeight: 100,
  rtl: false,
  ...partial,
});

/*
 * Both bindings retire the fade on this answer, so a wrong one is a fade that lies: promising
 * content past an edge the reader has already reached, or vanishing while there is more to read.
 */
describe("fadeEdgeHasMore", () => {
  it("sees more below until the scroll reaches the bottom", () => {
    expect(fadeEdgeHasMore(at({ scrollTop: 0 }), "to-bottom")).toBe(true);
    expect(fadeEdgeHasMore(at({ scrollTop: 200 }), "to-bottom")).toBe(false);
  });

  it("forgives the fractional pixel a zoomed layout leaves at the end", () => {
    expect(fadeEdgeHasMore(at({ scrollTop: 199.4 }), "to-bottom")).toBe(false);
  });

  it("sees more above only once scrolled away from the top", () => {
    expect(fadeEdgeHasMore(at({ scrollTop: 0 }), "to-top")).toBe(false);
    expect(fadeEdgeHasMore(at({ scrollTop: 50 }), "to-top")).toBe(true);
  });

  it("reads the horizontal edges physically in left-to-right", () => {
    expect(fadeEdgeHasMore(at({ scrollLeft: 0 }), "to-right")).toBe(true);
    expect(fadeEdgeHasMore(at({ scrollLeft: 0 }), "to-left")).toBe(false);
    expect(fadeEdgeHasMore(at({ scrollLeft: 200 }), "to-right")).toBe(false);
  });

  it("reads them physically in right-to-left too, where scrollLeft runs negative from the right", () => {
    expect(fadeEdgeHasMore(at({ rtl: true, scrollLeft: 0 }), "to-right")).toBe(false);
    expect(fadeEdgeHasMore(at({ rtl: true, scrollLeft: 0 }), "to-left")).toBe(true);
    expect(fadeEdgeHasMore(at({ rtl: true, scrollLeft: -200 }), "to-left")).toBe(false);
  });

  it("sees nothing more anywhere when the content fits", () => {
    const fits = at({ scrollWidth: 100, scrollHeight: 100 });
    for (const direction of ["to-bottom", "to-top", "to-right", "to-left"] as const) {
      expect(fadeEdgeHasMore(fits, direction)).toBe(false);
    }
  });
});
