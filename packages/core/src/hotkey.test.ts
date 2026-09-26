import { describe, expect, it } from "vitest";
import { formatHotkey, matchesHotkey, parseHotkey, type KeyChord } from "./hotkey.js";

/*
 * The matcher takes `isMac` as a parameter precisely so it can be tested on both
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
  it("resolves mod per platform and normalises the key", () => {
    expect(parseHotkey("mod+k", true)).toMatchObject({ meta: true, ctrl: false, keys: ["K"] });
    expect(parseHotkey("mod+k", false)).toMatchObject({ meta: false, ctrl: true, keys: ["K"] });
    // A spec is authored by hand, so case and whitespace do not matter.
    expect(parseHotkey(" MOD + k ", true)).toMatchObject(parseHotkey("mod+k", true));
  });

  it("reads modifiers first: a key written before them is not a chord", () => {
    // Zag's syntax, and a change from the kit's own parser, which took tokens in any order.
    expect(parseHotkey("k+mod", true).meta).toBe(false);
  });

  it("accepts the several names people give the same modifier", () => {
    expect(parseHotkey("cmd+k", false).meta).toBe(true);
    expect(parseHotkey("command+k", false).meta).toBe(true);
    expect(parseHotkey("control+k", true).ctrl).toBe(true);
    expect(parseHotkey("option+k", true).alt).toBe(true);
  });

  it("expands the key aliases a spec is likely to use", () => {
    expect(parseHotkey("esc", false).keys).toEqual(["Escape"]);
    expect(parseHotkey("return", false).keys).toEqual(["Enter"]);
    expect(parseHotkey("space", false).keys).toEqual([" "]);
  });

  it("reads `>` as a sequence of steps", () => {
    const parsed = parseHotkey("g > i", false);
    expect(parsed.isSequence).toBe(true);
    expect(parsed.keys).toEqual(["G", "I"]);
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

  it("uses Zag's glyphs for the named keys", () => {
    expect(formatHotkey("escape", false)).toBe("Esc");
    expect(formatHotkey("mod+enter", true)).toBe("⌘↵");
    expect(formatHotkey("space", false)).toBe("␣");
    expect(formatHotkey("mod+arrowup", true)).toBe("⌘↑");
  });

  it("upper-cases letters and function keys", () => {
    expect(formatHotkey("k", false)).toBe("K");
    expect(formatHotkey("f5", false)).toBe("F5");
  });
});
