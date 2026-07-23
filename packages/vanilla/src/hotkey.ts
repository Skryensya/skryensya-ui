import { detectMac, isTypingContext, matchesHotkey, parseHotkey, type ParsedHotkey } from "@skryensya/core/hotkey";

/*
 * HOTKEY, the imperative binding.
 *
 * `bindHotkey("mod+k", open)` attaches one keydown listener and returns its own cleanup, the same
 * shape every enhancer here returns. It owns none of the matching, that is the core's, and adds only
 * the wiring: knowing not to fire a bare-letter shortcut while someone is typing, and calling `off()`
 * to clean up. Platform detection (`detectMac`) and the typing check (`isTypingContext`) are the
 * core's too, the same reads React's `useHotkey` and the docs' palette share, beside the matcher.
 */

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
 *   // …later
 *   off();
 */
export function bindHotkey(
  spec: string,
  handler: (event: KeyboardEvent) => void,
  options: BindHotkeyOptions = {},
): () => void {
  const target = options.target ?? (typeof window !== "undefined" ? window : undefined);
  if (!target) return () => {};

  const mac = options.mac ?? detectMac();
  const preventDefault = options.preventDefault ?? true;
  const enableWhileTyping = options.enableWhileTyping ?? false;
  const parsed: ParsedHotkey = parseHotkey(spec);
  const hasModifier = parsed.mod || parsed.meta || parsed.ctrl || parsed.alt;

  const onKeydown = (event: Event) => {
    if (!(event instanceof KeyboardEvent)) return;
    // A bare letter inside a text field is text, not a command, unless the caller opted in, or the
    // chord carries a modifier (⌘K must still work from within an input).
    if (!enableWhileTyping && !hasModifier && isTypingContext(event.target)) return;
    if (!matchesHotkey(event, parsed, mac)) return;
    if (preventDefault) event.preventDefault();
    handler(event);
  };

  target.addEventListener("keydown", onKeydown);
  return () => target.removeEventListener("keydown", onKeydown);
}
