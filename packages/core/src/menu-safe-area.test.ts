import { describe, expect, it } from "vitest";
import { safeAreaShape, type SafeAreaRect } from "./menu-safe-area.js";

/*
 * The geometry half of the safe area, which is the half that decides anything: which side the
 * corridor is on, and whether there is a corridor at all. The element it drives is exercised where
 * it runs (a real pointer over a real submenu), but these choices are pure, and getting the SIDE
 * wrong is the failure that would silently do nothing at all in RTL.
 */

const rect = (left: number, top: number, right: number, bottom: number): SafeAreaRect => ({
  left,
  top,
  right,
  bottom,
});

/** The three `x y` pairs out of a `polygon(...)`, as fractions of the box, in order. */
const points = (clipPath: string) =>
  clipPath
    .slice("polygon(".length, -1)
    .split(",")
    .map((pair) => pair.trim().split(/\s+/).map((n) => Number.parseFloat(n)));

describe("safeAreaShape", () => {
  const trigger = rect(0, 100, 200, 144);

  it("spans the corridor from the pointer to a submenu on the inline-end side", () => {
    const submenu = rect(210, 100, 400, 260);
    const shape = safeAreaShape({ x: 150, y: 140 }, trigger, submenu)!;

    // The box stops exactly ON the submenu's near edge: any further and it would cover the very
    // panel it protects the path to.
    expect(shape.left + shape.width).toBe(submenu.left);
    // It reaches the submenu's full height, because the reader may aim at any row in it.
    expect(shape.top).toBe(submenu.top);
    expect(shape.top + shape.height).toBe(submenu.bottom);
    // Apex bled back INTO the trigger, away from the base — that is what widens the shape at the
    // boundary the pointer actually crosses.
    expect(shape.left).toBe(146);
  });

  it("puts the base on the other edge when the submenu flipped to the inline-start side", () => {
    // RTL, or a `flip-inline` near the viewport edge. Reading a placement string would need this
    // spelled out twice; comparing the rects is one code path.
    const submenu = rect(-210, 100, -10, 260);
    const shape = safeAreaShape({ x: 60, y: 140 }, trigger, submenu)!;

    expect(shape.left).toBe(submenu.right);
    // Bled the other way too: away from the submenu, which is now the inline-start side.
    expect(shape.left + shape.width).toBe(64);
  });

  it("aims the apex at the pointer and the base at the near edge, both corners", () => {
    const submenu = rect(210, 100, 400, 260);
    const shape = safeAreaShape({ x: 150, y: 140 }, trigger, submenu)!;
    const [apex, baseTop, baseBottom] = points(shape.clipPath);

    // Apex on the near side, at the pointer's own height.
    expect(apex[0]).toBeCloseTo(0, 3);
    expect(apex[1]).toBeCloseTo(((140 - shape.top) / shape.height) * 100, 3);
    // Base is the far edge, top corner to bottom corner: a triangle, never a blanket.
    expect(baseTop).toEqual([100, 0]);
    expect(baseBottom).toEqual([100, 100]);
  });

  it("declines when the submenu is not beside its trigger at all", () => {
    // A block-start/block-end flip: there is no inline corridor to bridge, and inventing one would
    // put a hit-testing element over rows for no reason.
    expect(safeAreaShape({ x: 150, y: 140 }, trigger, rect(0, 150, 200, 300))).toBeNull();
  });

  it("declines once the pointer has reached the near edge", () => {
    // Nothing left to bridge — and the side must still come from the RECTS here, or the bleed
    // reverses and the shape gets built on the submenu's side of its own edge.
    const submenu = rect(210, 100, 400, 260);
    expect(safeAreaShape({ x: 210, y: 140 }, trigger, submenu)).toBeNull();
    expect(safeAreaShape({ x: 214, y: 140 }, trigger, submenu)).toBeNull();
    // Same on the flipped side.
    const flipped = rect(-210, 100, -10, 260);
    expect(safeAreaShape({ x: -10, y: 140 }, trigger, flipped)).toBeNull();
    expect(safeAreaShape({ x: -14, y: 140 }, trigger, flipped)).toBeNull();
  });
});
