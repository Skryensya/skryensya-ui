import { describe, expect, it } from "vitest";
import { formatHotkey, matchesHotkey, parseHotkey, type KeyChord } from "./hotkey.js";

/*
 * The matcher is pure and takes `isMac` as a parameter precisely so it can be tested on both
 * platforms in the same process: `mod` is ⌘ on a Mac and Ctrl everywhere else, which is the whole
 * reason this is a primitive instead of an inline `event.metaKey` check at every call site.
 */
const chord = (over: Partial<KeyChord> & { key: string }): KeyChord => ({
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  ...over,
});

describe("parseHotkey", () => {
  it("reads modifiers and the key regardless of order or spacing", () => {
    expect(parseHotkey("mod+k")).toEqual({
      alt: false,
      ctrl: false,
      key: "k",
      meta: false,
      mod: true,
      shift: false,
    });
    // A spec is authored by hand, so it must not be finicky about order or whitespace.
    expect(parseHotkey(" K + MOD ")).toEqual(parseHotkey("mod+k"));
  });

  it("accepts the several names people give the same modifier", () => {
    expect(parseHotkey("cmd+k").meta).toBe(true);
    expect(parseHotkey("command+k").meta).toBe(true);
    expect(parseHotkey("control+k").ctrl).toBe(true);
    expect(parseHotkey("option+k").alt).toBe(true);
    expect(parseHotkey("opt+k").alt).toBe(true);
  });

  it("expands the key aliases a spec is likely to use", () => {
    expect(parseHotkey("esc").key).toBe("escape");
    expect(parseHotkey("return").key).toBe("enter");
    expect(parseHotkey("space").key).toBe(" ");
  });

  it("leaves the key empty when the spec is only modifiers", () => {
    expect(parseHotkey("mod+shift").key).toBe("");
    expect(parseHotkey("").key).toBe("");
  });
});

describe("matchesHotkey", () => {
  it("resolves mod to the platform's own modifier", () => {
    expect(matchesHotkey(chord({ key: "k", metaKey: true }), "mod+k", true)).toBe(true);
    expect(matchesHotkey(chord({ key: "k", ctrlKey: true }), "mod+k", false)).toBe(true);
  });

  it("requires the OTHER modifier to be up, so Ctrl+K never fires a ⌘K binding", () => {
    expect(matchesHotkey(chord({ key: "k", ctrlKey: true }), "mod+k", true)).toBe(false);
    expect(matchesHotkey(chord({ key: "k", metaKey: true }), "mod+k", false)).toBe(false);
  });

  it("matches the chord exactly, so a superset does not fire it", () => {
    // "mod+k" must NOT fire on "mod+shift+k", or a shortcut swallows a chord meant for something else.
    expect(matchesHotkey(chord({ key: "k", metaKey: true, shiftKey: true }), "mod+k", true)).toBe(false);
    expect(matchesHotkey(chord({ key: "k", metaKey: true, shiftKey: true }), "mod+shift+k", true)).toBe(
      true,
    );
    expect(matchesHotkey(chord({ key: "k", altKey: true, metaKey: true }), "mod+k", true)).toBe(false);
  });

  it("is case-insensitive about the key the event reports", () => {
    // Shift+K reports "K"; the spec is lower-cased, and a bare letter chord must still land.
    expect(matchesHotkey(chord({ key: "K", metaKey: true }), "mod+k", true)).toBe(true);
  });

  it("takes a literal meta or ctrl for the rare shortcut that means one specifically", () => {
    expect(matchesHotkey(chord({ key: "k", metaKey: true }), "cmd+k", false)).toBe(true);
    expect(matchesHotkey(chord({ key: "k", ctrlKey: true }), "ctrl+k", true)).toBe(true);
  });

  it("matches a bare key with no modifiers at all", () => {
    expect(matchesHotkey(chord({ key: "Escape" }), "escape", false)).toBe(true);
    expect(matchesHotkey(chord({ key: "Escape", metaKey: true }), "escape", false)).toBe(false);
  });

  it("never matches a spec with no key in it", () => {
    // Otherwise "mod" alone would fire on every ⌘ press, which is not a shortcut.
    expect(matchesHotkey(chord({ key: "Meta", metaKey: true }), "mod", true)).toBe(false);
  });

  it("takes an already-parsed spec, so a binding can parse once and match many times", () => {
    const parsed = parseHotkey("mod+k");
    expect(matchesHotkey(chord({ key: "k", metaKey: true }), parsed, true)).toBe(true);
  });

  it("treats absent modifier flags as up", () => {
    expect(matchesHotkey({ key: "k", metaKey: true }, "mod+k", true)).toBe(true);
    expect(matchesHotkey({ key: "k" }, "mod+k", true)).toBe(false);
  });
});

describe("formatHotkey", () => {
  it("shows the shortcut the way each OS shows it", () => {
    // A badge is only discoverable if it reads like the platform's own menus.
    expect(formatHotkey("mod+k", true)).toBe("⌘K");
    expect(formatHotkey("mod+k", false)).toBe("Ctrl+K");
  });

  it("stacks glyphs in the platform's conventional order", () => {
    expect(formatHotkey("mod+shift+alt+ctrl+k", true)).toBe("⌃⌥⇧⌘K");
    expect(formatHotkey("shift+alt+k", false)).toBe("Alt+Shift+K");
  });

  it("names the keys that have no glyph", () => {
    expect(formatHotkey("escape", false)).toBe("Esc");
    expect(formatHotkey("mod+enter", true)).toBe("⌘Enter");
    expect(formatHotkey("space", false)).toBe("Space");
    expect(formatHotkey("mod+arrowup", true)).toBe("⌘↑");
  });

  it("upper-cases a single letter and leaves longer keys alone", () => {
    expect(formatHotkey("k", false)).toBe("K");
    expect(formatHotkey("f5", false)).toBe("f5");
  });
});
