/*
 * HOTKEY, the contract, and the only part with no framework in it.
 *
 * A keyboard shortcut is behaviour with no platform equivalent, `accesskey` exists but browsers
 * bury it behind their own modifier chords and never surface a "⌘K"-style palette trigger. So the
 * system ships it, split the same way every behaviour is (decision 14): the pure matcher here, the
 * imperative binding in @skryensya/vanilla, the declarative hook in @skryensya/react. This file knows
 * how to READ a spec and TEST an event against it, and nothing about how the event got here.
 *
 * `mod` is the whole reason this is worth a primitive rather than an inline `event.metaKey` check: it
 * is ⌘ on a Mac and Ctrl everywhere else, so one spec, "mod+k", is the right chord on both without
 * the caller ever branching on the platform. That resolution is the one fact this file needs from the
 * outside, and it takes it as a boolean rather than sniffing navigator, so it stays testable and pure.
 */

/**
 * The shape a keyboard event has to have to be matched, a structural subset of the DOM's
 * `KeyboardEvent`, so this file never imports the DOM and a plain object works in a test.
 */
export interface KeyChord {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

/** A parsed spec: the modifiers it requires, and the single non-modifier key it ends on. */
export interface ParsedHotkey {
  /** ⌘ on Mac / Ctrl elsewhere. */
  mod: boolean;
  /** The literal Meta key, regardless of platform, for the rare shortcut that means ⌘ specifically. */
  meta: boolean;
  /** The literal Control key, regardless of platform. */
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  /** The non-modifier key, lower-cased. `KeyboardEvent.key`'s value, e.g. "k", "enter", "escape". */
  key: string;
}

/** Modifier tokens and the parsed field each one sets. Everything else in a spec is the key. */
const MODIFIER_TOKENS: Record<string, keyof Omit<ParsedHotkey, "key">> = {
  mod: "mod",
  meta: "meta",
  cmd: "meta",
  command: "meta",
  ctrl: "ctrl",
  control: "ctrl",
  shift: "shift",
  alt: "alt",
  option: "alt",
  opt: "alt",
};

/** A few key aliases so a spec can read the way people say it. */
const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  space: " ",
  spacebar: " ",
  return: "enter",
};

/**
 * Read a spec like "mod+k", "shift+/", or "escape" into its parts. Tokens are split on "+", trimmed
 * and lower-cased; the last non-modifier token is the key. Order does not matter, and whitespace is
 * forgiven, because a spec is authored by hand and should not be finicky.
 */
export function parseHotkey(spec: string): ParsedHotkey {
  const parsed: ParsedHotkey = { mod: false, meta: false, ctrl: false, shift: false, alt: false, key: "" };
  for (const raw of spec.split("+")) {
    const token = raw.trim().toLowerCase();
    if (token === "") continue;
    const modifier = MODIFIER_TOKENS[token];
    if (modifier) {
      parsed[modifier] = true;
    } else {
      // the last plain token wins, so "k" in "mod+k" is the key even though "mod" came first
      parsed.key = KEY_ALIASES[token] ?? token;
    }
  }
  return parsed;
}

/**
 * Does this event satisfy this spec? Exact match on every modifier, a spec is a precise chord, so
 * "mod+k" must NOT fire on "mod+shift+k", or a shortcut silently swallows a superset the app meant for
 * something else. `mod` resolves against `isMac`: ⌘ there, Ctrl elsewhere, and the OTHER of the two is
 * required to be UP, so a Ctrl+K on a Mac never triggers a ⌘K binding.
 */
export function matchesHotkey(event: KeyChord, spec: string | ParsedHotkey, isMac: boolean): boolean {
  const want = typeof spec === "string" ? parseHotkey(spec) : spec;
  if (want.key === "") return false;

  const meta = event.metaKey ?? false;
  const ctrl = event.ctrlKey ?? false;

  // What "mod" demands, plus any literal meta/ctrl the spec also named.
  const wantMeta = want.meta || (want.mod && isMac);
  const wantCtrl = want.ctrl || (want.mod && !isMac);
  if (meta !== wantMeta) return false;
  if (ctrl !== wantCtrl) return false;
  if ((event.shiftKey ?? false) !== want.shift) return false;
  if ((event.altKey ?? false) !== want.alt) return false;

  return event.key.toLowerCase() === want.key;
}

/*
 * The two platform reads every binding needs, shared here beside the matcher.
 *
 * They are not "how the event got here", they are facts about the environment the chord resolves in,
 * and both bindings (vanilla `bindHotkey`, React `useHotkey`) plus the docs' own palette need the
 * identical logic. Copy-pasting them into each was the duplication; they belong next to `matchesHotkey`,
 * which already takes `isMac` as a parameter precisely so it stays pure while these do the sniffing.
 * Both are environment-guarded so importing this module in Node never touches a DOM global.
 */

/** ⌘ vs Ctrl comes down to this. Read once at call time; a session never changes OS mid-keystroke. */
export function detectMac(): boolean {
  if (typeof navigator === "undefined") return false;
  // userAgentData is the modern read; navigator.platform is the fallback that still works everywhere.
  const platform =
    (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** Is focus in a place where a bare letter is TEXT, not a command? */
export function isTypingContext(target: EventTarget | null): boolean {
  if (typeof HTMLElement === "undefined") return false;
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** How each key renders for a person to read. Symbols on Mac, words elsewhere. */
const KEY_LABELS: Record<string, string> = {
  escape: "Esc",
  enter: "Enter",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  " ": "Space",
};

/**
 * A spec as a person should read it: "⌘K" on a Mac, "Ctrl+K" elsewhere. For the badge next to a
 * search box or in a menu, the shortcut is only discoverable if it is shown the way the OS shows it.
 */
export function formatHotkey(spec: string | ParsedHotkey, isMac: boolean): string {
  const parsed = typeof spec === "string" ? parseHotkey(spec) : spec;
  const parts: string[] = [];

  // Order matches the platform's own convention: Ctrl/Alt/Shift/Cmd on Mac reads ⌃⌥⇧⌘.
  if (parsed.ctrl || (parsed.mod && !isMac)) parts.push(isMac ? "⌃" : "Ctrl");
  if (parsed.alt) parts.push(isMac ? "⌥" : "Alt");
  if (parsed.shift) parts.push(isMac ? "⇧" : "Shift");
  if (parsed.meta || (parsed.mod && isMac)) parts.push(isMac ? "⌘" : "Win");

  const key = KEY_LABELS[parsed.key] ?? (parsed.key.length === 1 ? parsed.key.toUpperCase() : parsed.key);
  parts.push(key);

  // Mac stacks the glyphs with no separator (⌘K); word-labels read better joined by "+".
  return isMac ? parts.join("") : parts.join("+");
}
