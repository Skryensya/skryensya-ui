import {
  createHotkeyStore,
  formatHotkey as formatZagHotkey,
  isHotKey,
  parseHotkey as parseZagHotkey,
  type HotkeyTarget,
  type ParsedHotkey,
} from "@zag-js/hotkeys";

/*
 * HOTKEY, the one place the kit reads, matches, shows and binds a keyboard shortcut.
 *
 * A keyboard shortcut is behaviour with no platform equivalent, `accesskey` exists but browsers
 * bury it behind their own modifier chords and never surface a "⌘K"-style palette trigger. So the
 * system ships it, and since decision 25 the parsing, matching, formatting and listening are
 * `@zag-js/hotkeys`'s, the same family every other machine here comes from. This file is the kit's
 * surface over it: the names both bindings and the docs already call, the `mac` override tests and
 * the docs need, and the one rule Zag does not have (a chord with a modifier fires from inside a
 * text field). `bindHotkey` lives here rather than in a binding so Vanilla and React run the same
 * code, not two copies of it (decision 14).
 *
 * `mod` is the whole reason this is worth a primitive rather than an inline `event.metaKey` check: it
 * is ⌘ on a Mac and Ctrl everywhere else, so one spec, "mod+k", is the right chord on both without
 * the caller ever branching on the platform.
 *
 * SPEC SYNTAX is Zag's: modifiers first, then the key ("mod+shift+k", not "k+mod+shift"), and
 * `>` between the steps of a sequence ("g > i"), which `bindHotkey` supports and `matchesHotkey`,
 * being about one event, does not.
 */

export type { ParsedHotkey };

/**
 * The shape a keyboard event has to have to be matched, a structural subset of the DOM's
 * `KeyboardEvent`, so a plain object works in a test.
 */
export interface KeyChord {
  key: string;
  code?: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

const platformOf = (isMac: boolean) => (isMac ? "mac" : "windows");

/** Read a spec into Zag's parsed form, `mod` resolved for the given platform. */
export function parseHotkey(spec: string, isMac: boolean = detectMac()): ParsedHotkey {
  return parseZagHotkey(spec, platformOf(isMac));
}

/**
 * Does this event satisfy this spec? Exact match on every modifier, a spec is a precise chord, so
 * "mod+k" must NOT fire on "mod+shift+k", and a Ctrl+K on a Mac never triggers a ⌘K binding. Where
 * focus is plays no part here: that is a binding's question, not a chord's.
 */
export function matchesHotkey(event: KeyChord, spec: string, isMac: boolean): boolean {
  /* Zag compares every modifier with `!==`, so an absent one has to read as `false`, not `undefined`. */
  const chord = {
    key: event.key,
    code: event.code ?? "",
    metaKey: event.metaKey ?? false,
    ctrlKey: event.ctrlKey ?? false,
    shiftKey: event.shiftKey ?? false,
    altKey: event.altKey ?? false,
    target: (event as { target?: EventTarget | null }).target ?? null,
  };
  return isHotKey(
    spec,
    chord as unknown as KeyboardEvent,
    { enableOnFormTags: true, enableOnContentEditable: true },
    platformOf(isMac),
  );
}

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

/**
 * A spec as a person should read it: "⌘K" on a Mac, "Ctrl+K" elsewhere. For the badge next to a
 * search box or in a menu, the shortcut is only discoverable if it is shown the way the OS shows it.
 * Zag's glyphs throughout (↵, ␣, ↑); the separators are the kit's, stacked on a Mac as the OS does.
 */
export function formatHotkey(spec: string, isMac: boolean): string {
  return formatZagHotkey(spec, { platform: platformOf(isMac), style: "symbols", separator: isMac ? "" : "+" });
}

export interface BindHotkeyOptions {
  /** Where to listen. Defaults to `window`, so a shortcut is global unless scoped to an element. */
  target?: Window | HTMLElement | Document;
  /** Call `preventDefault()` on a match. Default true, a shortcut that also does the browser's thing
   *  (⌘S saving the page) is a bug, so the binding stops the platform by default. */
  preventDefault?: boolean;
  /**
   * Fire even while the user is typing in an input/textarea/contenteditable. Default false, but it
   * only ever suppresses BARE keys: a chord with a modifier (⌘K, Ctrl+/) always fires, because that is
   * the whole point of a command shortcut, it has to reach you from inside the search box it opens.
   */
  enableWhileTyping?: boolean;
  /** Override platform detection, mostly for tests. */
  mac?: boolean;
}

/**
 * Bind a keyboard shortcut. Returns a cleanup that removes the listener, call it on unmount, exactly
 * like an enhancer's teardown.
 *
 *   const off = bindHotkey("mod+k", () => palette.showModal());
 *   const offGo = bindHotkey("g > i", () => go("/inbox"));   // a sequence
 *   // …later
 *   off();
 *
 * One Zag store per binding. `mod` is resolved here, before Zag sees it, because the store reads the
 * platform itself and has no override; that is what keeps the `mac` option honest. Bubble phase,
 * as before Zag: a widget with focus hears its own keys before a page-wide shortcut does.
 */
export function bindHotkey(
  spec: string,
  handler: (event: KeyboardEvent) => void,
  options: BindHotkeyOptions = {},
): () => void {
  const target = options.target ?? (typeof window !== "undefined" ? window : undefined);
  if (!target) return () => {};

  const hotkey = spec.replace(/\bmod\b/gi, (options.mac ?? detectMac()) ? "meta" : "ctrl");
  const parsed = parseZagHotkey(hotkey, "windows");
  const hasModifier = !parsed.isSequence && Boolean(parsed.meta || parsed.ctrl || parsed.alt);
  const whileTyping = (options.enableWhileTyping ?? false) || hasModifier;

  const store = createHotkeyStore({
    /* A `Window` is not in Zag's type, but the store only calls `addEventListener` on its target and
       `getWindow` answers `window` for it, so the kit's long-standing default keeps working. */
    target: target as HotkeyTarget,
    conflictBehavior: "allow",
  });
  store.register({
    id: "hotkey",
    hotkey,
    action: handler,
    options: {
      capture: false,
      preventDefault: options.preventDefault ?? true,
      enableOnFormTags: whileTyping,
      enableOnContentEditable: whileTyping,
    },
  });
  return () => store.destroy();
}
