import { describe, expect, it } from "vitest";
import { resolveMegamenuEvent, type MegamenuState } from "./megamenu.js";

const closed: MegamenuState = { openIndex: null };

describe("resolveMegamenuEvent — activate (click / Enter / Space)", () => {
  it("opens a closed trigger", () => {
    expect(resolveMegamenuEvent(closed, { kind: "activate", index: 0 })).toEqual({ openIndex: 0 });
  });

  it("closes the SAME trigger when it is already open — a toggle", () => {
    expect(resolveMegamenuEvent({ openIndex: 0 }, { kind: "activate", index: 0 })).toEqual({ openIndex: null });
  });

  it("switches to a DIFFERENT trigger, closing whichever was open — exclusivity", () => {
    expect(resolveMegamenuEvent({ openIndex: 0 }, { kind: "activate", index: 2 })).toEqual({ openIndex: 2 });
  });
});

describe("resolveMegamenuEvent — hover intent", () => {
  it("opens a trigger once the open-intent delay elapses", () => {
    expect(resolveMegamenuEvent(closed, { kind: "hoverIntentOpen", index: 1 })).toEqual({ openIndex: 1 });
  });

  it("hover-intent open also closes whichever other trigger was open", () => {
    expect(resolveMegamenuEvent({ openIndex: 0 }, { kind: "hoverIntentOpen", index: 1 })).toEqual({ openIndex: 1 });
  });

  it("closes the open trigger once its close-intent delay elapses", () => {
    expect(resolveMegamenuEvent({ openIndex: 1 }, { kind: "hoverIntentClose", index: 1 })).toEqual({
      openIndex: null,
    });
  });

  it("a STALE close-intent timer (for a trigger the user already left) is a no-op", () => {
    // The user hovered 0, then 1, before 0's own close timer fired. 0's timer must not close 1.
    expect(resolveMegamenuEvent({ openIndex: 1 }, { kind: "hoverIntentClose", index: 0 })).toEqual({ openIndex: 1 });
  });

  it("a close-intent timer with nothing open is a no-op", () => {
    expect(resolveMegamenuEvent(closed, { kind: "hoverIntentClose", index: 0 })).toEqual(closed);
  });
});

describe("resolveMegamenuEvent — escape / blur", () => {
  it("Escape closes whichever panel is open", () => {
    expect(resolveMegamenuEvent({ openIndex: 2 }, { kind: "escape" })).toEqual({ openIndex: null });
  });

  it("Escape with nothing open is a no-op (returns the same state)", () => {
    expect(resolveMegamenuEvent(closed, { kind: "escape" })).toBe(closed);
  });

  it("blur (focus leaves the bar+panel subtree) closes whichever panel is open", () => {
    expect(resolveMegamenuEvent({ openIndex: 1 }, { kind: "blur" })).toEqual({ openIndex: null });
  });

  it("blur with nothing open is a no-op (returns the same state)", () => {
    expect(resolveMegamenuEvent(closed, { kind: "blur" })).toBe(closed);
  });
});
