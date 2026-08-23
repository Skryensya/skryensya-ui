import { describe, expect, it } from "vitest";
import { cardCopy } from "./card-data";
import { cardSources } from "./card-sources";

/*
 * Card is not a component, so it has no source of its own to unit test: what CAN be tested is the
 * builders in `card-sources.ts`, since a mistake there ships straight to the docs page's live
 * preview (`ComponentPreview`'s `html` prop is exactly this string, unmodified).
 */

describe("cardSources", () => {
  const copy = cardCopy.es;
  const src = cardSources(copy);

  it("keeps every example's data array at exactly three cards", () => {
    for (const [key, value] of Object.entries(copy)) {
      if (key === "labels" || key === "cta") continue;
      expect(Array.isArray(value), `${key} should be an array`).toBe(true);
      expect((value as unknown[]).length, `${key} should have 3 cards`).toBe(3);
    }
  });

  it("marks the select example's initial state on the label, not on the input", () => {
    /*
     * Regression: Zag's checkbox machine (`TileCheckbox.svelte`) reads `defaultChecked` from
     * `data-default-checked` on the ROOT label, never from a native `checked` attribute on the
     * input — that attribute is a live property Zag owns and overwrites on mount. The select
     * example used to author `checked` on the `<input>` instead, so every card rendered
     * unchecked regardless of its data, including the one meant to start checked.
     */
    expect(src.select.html).toContain('data-default-checked="true"');
    expect(src.select.html).toContain('data-default-checked="false"');
    expect(src.select.html).not.toMatch(/<input[^>]*\bchecked\b[^>]*>/);
  });
});
