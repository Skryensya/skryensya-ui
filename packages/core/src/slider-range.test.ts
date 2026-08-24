import { describe, expect, it } from "vitest";
import { clampSliderRange, sliderRangeBounds } from "./slider.js";

describe("sliderRangeBounds", () => {
  it("bounds the low thumb's max at the high thumb's current value, and vice versa", () => {
    expect(sliderRangeBounds(20, 80, 0, 100)).toEqual({ lowMin: 0, lowMax: 80, highMin: 20, highMax: 100 });
  });

  it("collapses to a single point when both thumbs share a value. Neither can cross it", () => {
    expect(sliderRangeBounds(50, 50, 0, 100)).toEqual({ lowMin: 0, lowMax: 50, highMin: 50, highMax: 100 });
  });

  it("never touches the overall min/max, only each thumb's OWN bound", () => {
    const bounds = sliderRangeBounds(10, 90, -50, 150);
    expect(bounds.lowMin).toBe(-50);
    expect(bounds.highMax).toBe(150);
  });
});

describe("clampSliderRange", () => {
  it("passes through an already-valid range unchanged", () => {
    expect(clampSliderRange(20, 80)).toEqual({ low: 20, high: 80 });
  });

  it("swaps an inverted range so low is never greater than high", () => {
    expect(clampSliderRange(80, 20)).toEqual({ low: 20, high: 80 });
  });

  it("leaves equal values as-is", () => {
    expect(clampSliderRange(50, 50)).toEqual({ low: 50, high: 50 });
  });
});
