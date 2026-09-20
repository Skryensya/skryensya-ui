import { describe, expect, it } from "vitest";
import { resolveFeedKey } from "./feed.js";

/*
 * THE KEY MATH, WITH NO DOM UNDER IT.
 *
 * `resolveFeedKey` is the half of the feed's keyboard model both bindings share, so its edges are
 * tested once here rather than twice over in jsdom. The DOM half (`feed-dom.ts`: which elements
 * are this feed's articles, where Ctrl+Home lands) cannot be tested in this package at all, for
 * the reason this runner's own config states: core runs on Node with no DOM. It is covered in
 * `@skryensya/vanilla`'s enhancer tests, which run the very same functions under jsdom, and the
 * nesting and exit-target cases there are written against these helpers rather than the enhancer.
 *
 * The behaviour worth pinning is the one that is NOT a clamp: at either end a step resolves to
 * `none`, which is how the bindings know to leave `preventDefault` alone and let the browser
 * scroll. A clamp to the current index would look identical in a focus assertion and would have
 * silently swallowed the key.
 */
const at = (currentIndex: number, key: string, extra: { ctrlKey?: boolean; metaKey?: boolean } = {}) =>
  resolveFeedKey({ key, ctrlKey: false, currentIndex, itemCount: 3, ...extra });

describe("resolveFeedKey", () => {
  it("Page Down and Page Up step one article at a time", () => {
    expect(at(0, "PageDown")).toEqual({ kind: "move", index: 1 });
    expect(at(1, "PageDown")).toEqual({ kind: "move", index: 2 });
    expect(at(2, "PageUp")).toEqual({ kind: "move", index: 1 });
    expect(at(1, "PageUp")).toEqual({ kind: "move", index: 0 });
  });

  it("does not wrap, and yields the key back at either end instead of clamping", () => {
    // A stream is not a carousel: the pattern says nothing about wrapping, so it does not.
    expect(at(2, "PageDown")).toEqual({ kind: "none" });
    expect(at(0, "PageUp")).toEqual({ kind: "none" });
  });

  it("Page Down from between articles enters the stream at the first one", () => {
    // -1 is focus inside the feed but in no article: the root, or a control above the stream.
    expect(at(-1, "PageDown")).toEqual({ kind: "move", index: 0 });
    expect(at(-1, "PageUp")).toEqual({ kind: "none" });
  });

  it("Ctrl+Home and Ctrl+End leave the feed, which is what the pattern asks for", () => {
    // NOT first/last article. APG: "the first focusable element before / after the feed".
    expect(at(1, "Home", { ctrlKey: true })).toEqual({ kind: "exit", edge: "before" });
    expect(at(1, "End", { ctrlKey: true })).toEqual({ kind: "exit", edge: "after" });
  });

  it("accepts Cmd+Home/End too, because macOS has no Ctrl+Home convention", () => {
    expect(at(1, "Home", { metaKey: true })).toEqual({ kind: "exit", edge: "before" });
    expect(at(1, "End", { metaKey: true })).toEqual({ kind: "exit", edge: "after" });
  });

  it("leaves bare Home/End alone: they are the browser's, not the feed's", () => {
    expect(at(1, "Home")).toEqual({ kind: "none" });
    expect(at(1, "End")).toEqual({ kind: "none" });
  });

  it("leaves Ctrl+Page Down alone, because that is the browser's tab strip", () => {
    expect(at(0, "PageDown", { ctrlKey: true })).toEqual({ kind: "none" });
    expect(at(1, "PageUp", { ctrlKey: true })).toEqual({ kind: "none" });
  });

  it("an empty feed answers nothing, whatever the key", () => {
    for (const key of ["PageDown", "PageUp", "Home", "End"]) {
      expect(resolveFeedKey({ key, ctrlKey: true, currentIndex: -1, itemCount: 0 })).toEqual({
        kind: "none",
      });
    }
  });

  it("ignores keys that are not its own", () => {
    for (const key of ["ArrowDown", "ArrowUp", "Tab", "Enter", " "]) {
      expect(at(0, key)).toEqual({ kind: "none" });
    }
  });
});
