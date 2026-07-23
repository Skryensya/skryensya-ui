import { formatHotkey, matchesHotkey, parseHotkey } from "@skryensya/core/hotkey";
import { afterEach, describe, expect, it, vi } from "vitest";
import { bindHotkey } from "./hotkey.js";

const press = (init: KeyboardEventInit, target: EventTarget = window) => {
  target.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
};

describe("core matcher", () => {
  it("parses modifiers in any order and keeps the last plain token as the key", () => {
    expect(parseHotkey("mod+k")).toMatchObject({ mod: true, key: "k" });
    expect(parseHotkey("k+mod")).toMatchObject({ mod: true, key: "k" });
    expect(parseHotkey(" Shift + / ")).toMatchObject({ shift: true, key: "/" });
    expect(parseHotkey("esc").key).toBe("escape");
  });

  it("resolves mod to ⌘ on mac and Ctrl elsewhere", () => {
    expect(matchesHotkey({ key: "k", metaKey: true }, "mod+k", true)).toBe(true);
    expect(matchesHotkey({ key: "k", ctrlKey: true }, "mod+k", true)).toBe(false); // Ctrl on mac ≠ mod
    expect(matchesHotkey({ key: "k", ctrlKey: true }, "mod+k", false)).toBe(true);
    expect(matchesHotkey({ key: "k", metaKey: true }, "mod+k", false)).toBe(false);
  });

  it("demands an exact chord, a superset does not match", () => {
    expect(matchesHotkey({ key: "k", metaKey: true, shiftKey: true }, "mod+k", true)).toBe(false);
    expect(matchesHotkey({ key: "k", metaKey: true, shiftKey: true }, "mod+shift+k", true)).toBe(true);
  });

  it("formats for display per platform", () => {
    expect(formatHotkey("mod+k", true)).toBe("⌘K");
    expect(formatHotkey("mod+k", false)).toBe("Ctrl+K");
    expect(formatHotkey("escape", true)).toBe("Esc");
  });
});

describe("bindHotkey", () => {
  const cleanups: Array<() => void> = [];
  afterEach(() => {
    cleanups.splice(0).forEach((off) => off());
    document.body.innerHTML = "";
  });
  const bind = (...args: Parameters<typeof bindHotkey>) => {
    const off = bindHotkey(...args);
    cleanups.push(off);
    return off;
  };

  it("fires on a match and prevents the default", () => {
    const handler = vi.fn();
    bind("mod+k", handler, { mac: true });

    const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, cancelable: true });
    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it("removes its listener on cleanup", () => {
    const handler = vi.fn();
    const off = bindHotkey("mod+k", handler, { mac: true });
    off();
    press({ key: "k", metaKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it("suppresses a bare-key shortcut while typing, but not a modifier chord", () => {
    const bare = vi.fn();
    const chord = vi.fn();
    bind("/", bare, { mac: true });
    bind("mod+k", chord, { mac: true });

    const input = document.createElement("input");
    document.body.append(input);
    input.focus();

    press({ key: "/" }, input);
    press({ key: "k", metaKey: true }, input);

    expect(bare).not.toHaveBeenCalled(); // "/" is text inside an input
    expect(chord).toHaveBeenCalledOnce(); // ⌘K still reaches the app
  });

  it("fires a bare key while typing when explicitly enabled", () => {
    const handler = vi.fn();
    bind("/", handler, { mac: true, enableWhileTyping: true });
    const input = document.createElement("input");
    document.body.append(input);
    input.focus();
    press({ key: "/" }, input);
    expect(handler).toHaveBeenCalledOnce();
  });
});
