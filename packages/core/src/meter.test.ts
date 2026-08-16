import { describe, expect, it } from "vitest";
import { meterFraction } from "./meter.js";

describe("meterFraction", () => {
  it("computes the fraction within [min, max], honoring a non-zero min unlike progressFraction", () => {
    expect(meterFraction(50, 0, 100)).toBe(0.5);
    // A temperature-style scale: -10..40, value 15 is exactly halfway.
    expect(meterFraction(15, -10, 40)).toBe(0.5);
    // At the true minimum, the fraction is 0 even though the minimum itself is non-zero.
    expect(meterFraction(-10, -10, 40)).toBe(0);
  });

  it("clamps a value outside [min, max] instead of reporting past 0/1", () => {
    expect(meterFraction(-5, 0, 100)).toBe(0);
    expect(meterFraction(150, 0, 100)).toBe(1);
  });

  it("guards NaN and an inverted or empty range", () => {
    expect(meterFraction(Number.NaN, 0, 100)).toBe(0);
    expect(meterFraction(50, 0, 0)).toBe(0);
    expect(meterFraction(50, 100, 0)).toBe(0);
  });
});
