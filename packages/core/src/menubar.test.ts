import { describe, expect, it } from "vitest";
import { resolveMenubarKey } from "./menubar.js";

/*
 * A 3-item bar: "File" (3 commands), "Edit" (2 commands), "Help" (no dropdown, a direct command) -
 * matching WAI's own `menubar-editor` shape closely enough to exercise every branch.
 */
const resolve = (key: string, focus: { topIndex: number; subIndex: number | null }) =>
  resolveMenubarKey({
    key,
    focus,
    topCount: 3,
    hasMenuAt: (topIndex) => topIndex !== 2,
    subCountOf: (topIndex) => (topIndex === 0 ? 3 : topIndex === 1 ? 2 : 0),
  });

describe("resolveMenubarKey. Left/Right between top-level items", () => {
  it("moves one item at a time and wraps at both ends", () => {
    expect(resolve("ArrowRight", { topIndex: 0, subIndex: null })).toEqual({
      kind: "moveTop",
      topIndex: 1,
      keepOpen: false,
    });
    expect(resolve("ArrowRight", { topIndex: 2, subIndex: null })).toEqual({
      kind: "moveTop",
      topIndex: 0,
      keepOpen: false,
    });
    expect(resolve("ArrowLeft", { topIndex: 0, subIndex: null })).toEqual({
      kind: "moveTop",
      topIndex: 2,
      keepOpen: false,
    });
  });

  it("keeps the NEXT item's dropdown open when the current one was open. The detail a plain roving tabindex misses", () => {
    expect(resolve("ArrowRight", { topIndex: 0, subIndex: 1 })).toEqual({
      kind: "moveTop",
      topIndex: 1,
      keepOpen: true,
    });
  });
});

describe("resolveMenubarKey. Opening and moving within a dropdown", () => {
  it("Down Arrow on a closed dropdown trigger opens it, focusing the FIRST item", () => {
    expect(resolve("ArrowDown", { topIndex: 0, subIndex: null })).toEqual({
      kind: "open",
      topIndex: 0,
      focusLast: false,
    });
  });

  it("Up Arrow on a closed dropdown trigger opens it, focusing the LAST item", () => {
    expect(resolve("ArrowUp", { topIndex: 0, subIndex: null })).toEqual({
      kind: "open",
      topIndex: 0,
      focusLast: true,
    });
  });

  it("Down/Up on a LEAF item (no dropdown) do nothing", () => {
    expect(resolve("ArrowDown", { topIndex: 2, subIndex: null })).toEqual({ kind: "none" });
    expect(resolve("ArrowUp", { topIndex: 2, subIndex: null })).toEqual({ kind: "none" });
  });

  it("Down/Up move within an OPEN dropdown, wrapping at both ends", () => {
    expect(resolve("ArrowDown", { topIndex: 0, subIndex: 0 })).toEqual({
      kind: "move",
      focus: { topIndex: 0, subIndex: 1 },
    });
    expect(resolve("ArrowDown", { topIndex: 0, subIndex: 2 })).toEqual({
      kind: "move",
      focus: { topIndex: 0, subIndex: 0 },
    });
    expect(resolve("ArrowUp", { topIndex: 0, subIndex: 0 })).toEqual({
      kind: "move",
      focus: { topIndex: 0, subIndex: 2 },
    });
  });
});

describe("resolveMenubarKey. Enter/Space", () => {
  it("opens a closed dropdown trigger, focusing the first item", () => {
    expect(resolve("Enter", { topIndex: 1, subIndex: null })).toEqual({
      kind: "open",
      topIndex: 1,
      focusLast: false,
    });
    expect(resolve(" ", { topIndex: 1, subIndex: null })).toEqual({
      kind: "open",
      topIndex: 1,
      focusLast: false,
    });
  });

  it("does nothing on a leaf item or an already-open dropdown item. Native click/Enter handles activation", () => {
    expect(resolve("Enter", { topIndex: 2, subIndex: null })).toEqual({ kind: "none" });
    expect(resolve("Enter", { topIndex: 0, subIndex: 1 })).toEqual({ kind: "none" });
  });
});

describe("resolveMenubarKey. Escape", () => {
  it("closes an open dropdown; does nothing when already closed", () => {
    expect(resolve("Escape", { topIndex: 0, subIndex: 1 })).toEqual({ kind: "close" });
    expect(resolve("Escape", { topIndex: 0, subIndex: null })).toEqual({ kind: "none" });
  });
});

describe("resolveMenubarKey. Home/End", () => {
  it("jump to the first/last TOP-LEVEL item when no dropdown is open", () => {
    expect(resolve("Home", { topIndex: 1, subIndex: null })).toEqual({
      kind: "moveTop",
      topIndex: 0,
      keepOpen: false,
    });
    expect(resolve("End", { topIndex: 0, subIndex: null })).toEqual({
      kind: "moveTop",
      topIndex: 2,
      keepOpen: false,
    });
  });

  it("jump to the first/last item WITHIN an open dropdown instead", () => {
    expect(resolve("Home", { topIndex: 0, subIndex: 2 })).toEqual({
      kind: "move",
      focus: { topIndex: 0, subIndex: 0 },
    });
    expect(resolve("End", { topIndex: 0, subIndex: 0 })).toEqual({
      kind: "move",
      focus: { topIndex: 0, subIndex: 2 },
    });
  });
});

it("an unhandled key resolves to none", () => {
  expect(resolve("Tab", { topIndex: 0, subIndex: null })).toEqual({ kind: "none" });
});
