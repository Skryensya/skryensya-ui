import { describe, expect, it } from "vitest";
import {
  ratingContract,
  ratingDefaultMax,
  ratingFillPercent,
  ratingRoundToHalf,
} from "./rating.js";

describe("rating fill", () => {
  it("fills the exact fraction, because an average of 4.3 is not a 4", () => {
    /* Four whole symbols and three tenths of the fifth, out of five: 86% of the strip. The number
       the stylesheet's hard colour stop lands on. */
    expect(ratingFillPercent(4.3, 5)).toBeCloseTo(86, 10);
    expect(ratingFillPercent(2.5, 5)).toBe(50);
    expect(ratingFillPercent(5, 5)).toBe(100);
    expect(ratingFillPercent(0, 5)).toBe(0);
  });

  it("uses a scale of five when none is given, because anything else has to be explained", () => {
    expect(ratingDefaultMax).toBe(5);
    expect(ratingFillPercent(2)).toBe(40);
  });

  it("paints the end of the scale rather than overflowing it", () => {
    expect(ratingFillPercent(7, 5)).toBe(100);
    expect(ratingFillPercent(-2, 5)).toBe(0);
  });

  it("scales to whatever max it is handed", () => {
    expect(ratingFillPercent(5, 10)).toBe(50);
    expect(ratingFillPercent(2, 3)).toBeCloseTo(66.666, 2);
  });
});

describe("half snapping", () => {
  it("is available and never applied on the way in", () => {
    /* A product that would rather show 4.5 than 4.3 rounds BEFORE handing the value over. The
       contract paints what it is given, so the two decisions stay separable. */
    expect(ratingRoundToHalf(4.3)).toBe(4.5);
    expect(ratingRoundToHalf(4.24)).toBe(4);
    expect(ratingRoundToHalf(4.75)).toBe(5);
    expect(ratingFillPercent(ratingRoundToHalf(4.3), 5)).toBe(90);
  });
});

describe("the contract", () => {
  it("requires an accessible name on both signatures", () => {
    /* A row of symbols announces nothing on its own, and "4.3 out of 5" is a sentence only the
       consumer can write in the reader's language. */
    expect(ratingContract.signatures.Rating.requires).toContain("label");
    expect(ratingContract.signatures.RatingDisplay.requires).toContain("label");
  });

  it("gives the input radiogroup semantics and the display an image's", () => {
    /* On the CONTROL, not the root: `@zag-js/rating-group` puts the group there, so a name on the
       root would name a box that is not the group. That bug shipped once in this very component. */
    const control = ratingContract.signatures.Rating.template.children[0];
    expect(control.attrs).toMatchObject({ role: "radiogroup" });
    expect(control.options).toContain("label");
    expect(ratingContract.signatures.RatingDisplay.template.attrs).toMatchObject({ role: "img" });
  });

  it("takes whole steps in and fractions out, which is the asymmetry on purpose", () => {
    /* Landing a pointer on half of a 20px symbol is a 10px target; averaging what a hundred people
       chose is arithmetic. See the signature's own note. */
    expect(ratingContract.options.defaultValue.integer).toBe(true);
    expect(ratingContract.options.value).not.toHaveProperty("integer");
  });

  it("publishes the symbol as a hook, so a heart costs one declaration", () => {
    expect(ratingContract.hooks).toContain("--sk-rating-symbol");
  });
});
