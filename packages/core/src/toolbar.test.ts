import { describe, expect, it } from "vitest";
import { resolveToolbarKey } from "./toolbar.js";

describe("resolveToolbarKey. Horizontal", () => {
  it("ArrowRight moves to the next item, ArrowLeft to the previous", () => {
    expect(resolveToolbarKey({ key: "ArrowRight", currentIndex: 1, itemCount: 4, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "move", index: 2 });
    expect(resolveToolbarKey({ key: "ArrowLeft", currentIndex: 1, itemCount: 4, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "move", index: 0 });
  });

  it("ArrowUp/ArrowDown do nothing in horizontal orientation", () => {
    expect(resolveToolbarKey({ key: "ArrowUp", currentIndex: 1, itemCount: 4, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "none" });
    expect(resolveToolbarKey({ key: "ArrowDown", currentIndex: 1, itemCount: 4, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "none" });
  });
});

describe("resolveToolbarKey. Vertical", () => {
  it("ArrowDown moves to the next item, ArrowUp to the previous", () => {
    expect(resolveToolbarKey({ key: "ArrowDown", currentIndex: 1, itemCount: 4, orientation: "vertical", loopFocus: true })).toEqual({ kind: "move", index: 2 });
    expect(resolveToolbarKey({ key: "ArrowUp", currentIndex: 1, itemCount: 4, orientation: "vertical", loopFocus: true })).toEqual({ kind: "move", index: 0 });
  });

  it("ArrowLeft/ArrowRight do nothing in vertical orientation", () => {
    expect(resolveToolbarKey({ key: "ArrowLeft", currentIndex: 1, itemCount: 4, orientation: "vertical", loopFocus: true })).toEqual({ kind: "none" });
    expect(resolveToolbarKey({ key: "ArrowRight", currentIndex: 1, itemCount: 4, orientation: "vertical", loopFocus: true })).toEqual({ kind: "none" });
  });
});

describe("resolveToolbarKey. Looping vs clamping at the ends", () => {
  it("wraps at both ends when loopFocus is true", () => {
    expect(resolveToolbarKey({ key: "ArrowRight", currentIndex: 3, itemCount: 4, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "move", index: 0 });
    expect(resolveToolbarKey({ key: "ArrowLeft", currentIndex: 0, itemCount: 4, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "move", index: 3 });
  });

  it("clamps at both ends when loopFocus is false", () => {
    expect(resolveToolbarKey({ key: "ArrowRight", currentIndex: 3, itemCount: 4, orientation: "horizontal", loopFocus: false })).toEqual({ kind: "move", index: 3 });
    expect(resolveToolbarKey({ key: "ArrowLeft", currentIndex: 0, itemCount: 4, orientation: "horizontal", loopFocus: false })).toEqual({ kind: "move", index: 0 });
  });
});

describe("resolveToolbarKey. Home/End", () => {
  it("Home jumps to the first item, End to the last", () => {
    expect(resolveToolbarKey({ key: "Home", currentIndex: 2, itemCount: 4, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "move", index: 0 });
    expect(resolveToolbarKey({ key: "End", currentIndex: 2, itemCount: 4, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "move", index: 3 });
  });
});

describe("resolveToolbarKey. Edge cases", () => {
  it("no active stop found (currentIndex -1): the next key still resolves to the first item", () => {
    expect(resolveToolbarKey({ key: "ArrowRight", currentIndex: -1, itemCount: 4, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "move", index: 0 });
  });

  it("an empty bar resolves to none", () => {
    expect(resolveToolbarKey({ key: "ArrowRight", currentIndex: -1, itemCount: 0, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "none" });
  });

  it("an unhandled key resolves to none", () => {
    expect(resolveToolbarKey({ key: "Escape", currentIndex: 1, itemCount: 4, orientation: "horizontal", loopFocus: true })).toEqual({ kind: "none" });
  });
});
