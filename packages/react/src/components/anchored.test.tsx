import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useAnchored } from "./anchored.js";

/*
 * The whole point of `useAnchored` is that the two positioning engines never both run: where the
 * browser has anchor positioning it lays the box out and the machine's inline style is dropped;
 * where it does not, the machine's style is left exactly as it was. jsdom answers no by default,
 * so each test states which browser it is standing in.
 */
const originalSupports = globalThis.CSS?.supports;

function setSupport(supported: boolean) {
  globalThis.CSS.supports = (() => supported) as typeof CSS.supports;
}

afterEach(() => {
  globalThis.CSS.supports = originalSupports as typeof CSS.supports;
});

describe("useAnchored", () => {
  it("adds the pattern's classes whether or not the browser has the API", () => {
    for (const supported of [false, true]) {
      setSupport(supported);
      const { result } = renderHook(() => useAnchored("copy-1"));

      // `patterns/anchored.css` is written so these are correct on both paths; only the wiring
      // is conditional, because only the wiring would be wrong on the fallback.
      expect(result.current.anchor("sk-copy-button").className).toBe("sk-copy-button sk-anchor");
      expect(result.current.positioner({}, "sk-copy-button__feedback").className).toBe(
        "sk-copy-button__feedback sk-anchored",
      );
    }
  });

  it("names one anchor per instance on BOTH elements where the browser positions", () => {
    setSupport(true);
    const { result } = renderHook(() => useAnchored("copy-1"));

    expect(result.current.on).toBe(true);
    expect(result.current.anchor("sk-copy-button").style).toEqual({
      "--sk-anchored-name": "--sk-anchor-copy-1",
    });
    // The box gets a second name of its own, which is what its arrow measures.
    expect(result.current.positioner({}, "sk-anchored").style).toEqual({
      "--sk-anchored-name": "--sk-anchor-copy-1",
      "--sk-anchored-box-name": "--sk-anchor-copy-1-box",
    });
  });

  it("folds an id the way a dashed-ident allows", () => {
    setSupport(true);
    const { result } = renderHook(() => useAnchored("tooltip:r1:"));

    // Zag's ids carry `:` and consumers author anything, so everything else folds to `-`.
    expect(result.current.anchor("x").style).toEqual({
      "--sk-anchored-name": "--sk-anchor-tooltip-r1-",
    });
  });

  it("drops the machine's placement once the browser owns it", () => {
    setSupport(true);
    const { result } = renderHook(() => useAnchored("tip"));

    const positioner = result.current.positioner(
      { id: "tip-positioner", hidden: false, style: { position: "absolute", top: "10px" } },
      "sk-tooltip__positioner",
    );

    // Attributes the machine also owns stay: it still runs the popup, it just does not place it.
    expect(positioner.id).toBe("tip-positioner");
    expect(positioner.hidden).toBe(false);
    expect(positioner.style).not.toHaveProperty("top");
  });

  it("leaves the machine alone where the browser cannot position", () => {
    setSupport(false);
    const { result } = renderHook(() => useAnchored("tip"));

    expect(result.current.on).toBe(false);
    // No names to write, and above all the machine's inline placement survives: dropping it with
    // no engine to take over would leave the popup unplaced.
    expect(result.current.anchor("x", { zIndex: 2 }).style).toEqual({ zIndex: 2 });
    expect(
      result.current.positioner({ style: { position: "absolute", top: "10px" } }, "x").style,
    ).toEqual({ position: "absolute", top: "10px" });
  });
});
