import { describe, expect, it } from "vitest";
import { computeFlyoutFixedCoords } from "./flyout.js";

/*
 * Flyout is the one floating family that is NOT anchored: its panel is a plain child of the root and
 * its placement is fixed coordinates computed from the trigger's rect. That computation is here, in
 * core, so both bindings flip and clamp identically instead of each rounding the same edge case its
 * own way.
 */
const rect = (over: Partial<DOMRect> = {}) =>
  ({
    bottom: 140,
    height: 40,
    left: 100,
    right: 200,
    top: 100,
    width: 100,
    ...over,
  }) as DOMRect;

const place = (input: Partial<Parameters<typeof computeFlyoutFixedCoords>[0]> = {}) =>
  computeFlyoutFixedCoords({
    panelHeight: 200,
    panelWidth: 160,
    trigger: rect(),
    viewportHeight: 800,
    viewportWidth: 1000,
    ...input,
  });

describe("computeFlyoutFixedCoords", () => {
  it("prefers the inline-end of the trigger, one gap away", () => {
    const coords = place();
    expect(coords.side).toBe("inline-end");
    expect(coords.left).toBe(204); // trigger.right + the default 4px gap
    expect(coords.top).toBe(100); // aligned to the trigger's own top
  });

  it("flips to the other side when the preferred one does not fit", () => {
    // 1000 - 990 - 8 of padding leaves 2px on the right, and 932 on the left.
    const coords = place({ trigger: rect({ left: 940, right: 990 }) });
    expect(coords.side).toBe("inline-start");
    expect(coords.left).toBe(776); // trigger.left - gap - panelWidth
  });

  it("picks the roomier side when neither one fits", () => {
    const cramped = place({ panelWidth: 400, trigger: rect({ left: 300, right: 380 }), viewportWidth: 600 });
    // Right of the trigger: 600-380-8 = 212; left: 300-8 = 292. Neither fits 400, so the wider wins.
    expect(cramped.side).toBe("inline-start");
  });

  it("keeps the panel inside the viewport once the side is chosen", () => {
    // A wide trigger with no room on either side: the flip picks a side and the clamp is what
    // actually keeps the panel on screen, at the padding rather than off the near edge.
    const near = place({ trigger: rect({ left: 20, right: 990 }) });
    expect(near.left).toBe(8);

    // And the same on the far edge: inline-end wins on space, then gets pulled back inside.
    const far = place({ panelWidth: 300, trigger: rect({ left: 100, right: 800 }) });
    expect(far.side).toBe("inline-end");
    expect(far.left).toBe(1000 - 8 - 300);
  });

  it("clamps vertically too, and never below the padding", () => {
    expect(place({ trigger: rect({ top: 700 }) }).top).toBe(800 - 8 - 200);
    expect(place({ trigger: rect({ top: -50 }) }).top).toBe(8);
  });

  it("prefers the padding when the viewport is smaller than the panel", () => {
    // Degenerate, but it must not produce a negative coordinate: the panel starts at the padding
    // and whatever overflows, overflows off the far edge instead of off the near one.
    const coords = place({ panelHeight: 900, panelWidth: 1200, viewportHeight: 400, viewportWidth: 300 });
    expect(coords.left).toBe(8);
    expect(coords.top).toBe(8);
  });

  it("mirrors the whole decision in RTL", () => {
    // inline-end still means "after the trigger in reading order", which in RTL is to its LEFT.
    const coords = place({ rtl: true, trigger: rect({ left: 600, right: 700 }) });
    expect(coords.side).toBe("inline-end");
    expect(coords.left).toBe(436); // trigger.left - gap - panelWidth

    // Same trigger position that stayed inline-end in LTR flips here, because the space that
    // matters is the one on the other side.
    const flipped = place({ rtl: true });
    expect(flipped.side).toBe("inline-start");
    expect(flipped.left).toBe(204); // trigger.right + gap
  });

  it("takes a caller's own gap and padding", () => {
    const coords = place({ gap: 20, padding: 40 });
    expect(coords.left).toBe(220);
    expect(place({ padding: 40, trigger: rect({ top: -100 }) }).top).toBe(40);
  });

  it("returns whole pixels, so the two bindings cannot round differently", () => {
    const coords = place({ trigger: rect({ right: 200.4, top: 100.6 }) });
    expect(Number.isInteger(coords.left)).toBe(true);
    expect(Number.isInteger(coords.top)).toBe(true);
    expect(coords.top).toBe(101);
  });
});
