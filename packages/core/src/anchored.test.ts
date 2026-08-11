import { describe, expect, it } from "vitest";
import {
  anchorBoxNameFor,
  anchorNameFor,
  anchorPlacementToZag,
  anchorPlacements,
  isAnchorPlacement,
  stripPositioningStyle,
  supportsAnchorPositioning,
} from "./anchored.js";
import { tooltipDefaultPlacement, tooltipPlacements, tooltipPlacementToZag } from "./tooltip.js";

/*
 * The Anclaje pattern owns no geometry: what it owns is the naming and the ONE decision that keeps
 * two positioning engines from both running. These are the pieces of that both bindings call, which
 * is why they are here rather than duplicated in each.
 */
describe("placements", () => {
  it("names the four sides logically, so they swap themselves in RTL", () => {
    expect([...anchorPlacements]).toEqual(["block-start", "block-end", "inline-start", "inline-end"]);
  });

  it("recognises only those four", () => {
    for (const placement of anchorPlacements) expect(isAnchorPlacement(placement)).toBe(true);
    // "top" is Zag's word, not the pattern's, and a physical side authored here must be ignored.
    expect(isAnchorPlacement("top")).toBe(false);
    expect(isAnchorPlacement("diagonal")).toBe(false);
    expect(isAnchorPlacement(undefined)).toBe(false);
    expect(isAnchorPlacement(null)).toBe(false);
  });

  it("translates to Zag's physical sides for the fallback only", () => {
    // On the browser path `position-area` is already logical, so nobody translates anything.
    expect(anchorPlacementToZag).toEqual({
      "block-end": "bottom",
      "block-start": "top",
      "inline-end": "right",
      "inline-start": "left",
    });
    // Every placement has a translation: a missing one would silently unplace a popup.
    for (const placement of anchorPlacements) expect(anchorPlacementToZag[placement]).toBeTruthy();
  });

  it("keeps tooltip's aliases pointing at the same table", () => {
    expect(tooltipPlacements).toBe(anchorPlacements);
    expect(tooltipPlacementToZag).toBe(anchorPlacementToZag);
    // A tooltip is the one anchored box that goes UP: below it is what the pointer just touched.
    expect(tooltipDefaultPlacement).toBe("block-start");
  });
});

describe("anchorNameFor / anchorBoxNameFor", () => {
  it("produces a dashed-ident from an id the component already has", () => {
    expect(anchorNameFor("copy-1")).toBe("--sk-anchor-copy-1");
    expect(anchorBoxNameFor("copy-1")).toBe("--sk-anchor-copy-1-box");
  });

  it("folds everything a dashed-ident cannot hold", () => {
    // Zag's generated ids carry ":" and consumers author anything at all.
    expect(anchorNameFor("tooltip:r1:")).toBe("--sk-anchor-tooltip-r1-");
    expect(anchorNameFor("a b.c")).toBe("--sk-anchor-a-b-c");
    expect(anchorNameFor("café")).toBe("--sk-anchor-caf-");
  });

  it("gives the box a name of its own rather than sharing the anchor's", () => {
    // Two positioners open at once (a menu and its submenu) would both answer to a shared name,
    // and each arrow has to measure ITS box.
    expect(anchorBoxNameFor("menu")).not.toBe(anchorNameFor("menu"));
    expect(anchorNameFor("a")).not.toBe(anchorNameFor("b"));
  });
});

describe("stripPositioningStyle", () => {
  it("drops only the style, keeping what the machine still owns", () => {
    // The machine still runs the popup, it just does not place it: id, dir and hidden stay.
    const props = { dir: "ltr", hidden: false, id: "tip", style: { left: "10px", position: "absolute" } };
    const stripped = stripPositioningStyle(props);
    expect(stripped).toEqual({ dir: "ltr", hidden: false, id: "tip" });
    expect("style" in stripped).toBe(false);
  });

  it("does not mutate the props it was given", () => {
    const props = { id: "tip", style: { top: "1px" } };
    stripPositioningStyle(props);
    expect(props.style).toEqual({ top: "1px" });
  });

  it("is a no-op on props that never had a style", () => {
    expect(stripPositioningStyle({ id: "tip" })).toEqual({ id: "tip" });
  });
});

describe("supportsAnchorPositioning", () => {
  it("answers no where there is no CSS to ask", () => {
    // Node has no `CSS`, which is also what the SERVER sees: the bindings route this through a
    // snapshot so hydration cannot mismatch on it.
    expect(supportsAnchorPositioning()).toBe(false);
  });
});
