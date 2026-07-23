import { detectMac, isTypingContext, matchesHotkey, parseHotkey } from "@skryensya/core/hotkey";
import { useEffect, useRef } from "react";

/*
 * HOTKEY, the React binding.
 *
 * `useHotkey("mod+k", open)` is the vanilla `bindHotkey` as a hook: it consumes the same core matcher
 * (never the vanilla package, the two bindings are siblings over core, decision 14) and adds only what
 * React needs. The handler goes through a ref so a new closure every render does not re-bind the
 * listener, and the effect's cleanup removes it, the component lifecycle is the subscription. Platform
 * detection and the typing check are the core's, shared with the vanilla binding beside the matcher.
 */

export interface UseHotkeyOptions {
  /** Where to listen. Defaults to `window`. Pass an element to scope the shortcut to it. */
  target?: Window | HTMLElement | Document | null;
  /** `preventDefault()` on a match. Default true. */
  preventDefault?: boolean;
  /** Fire while typing in a field. Default false; a chord with a modifier always fires regardless. */
  enableWhileTyping?: boolean;
  /** Turn the binding off without unmounting, the handler stays registered but never runs. */
  enabled?: boolean;
  /** Override platform detection, mostly for tests. */
  mac?: boolean;
}

/**
 * Subscribe to a keyboard shortcut for the life of the component.
 *
 *   useHotkey("mod+k", () => setOpen(true));
 */
export function useHotkey(
  spec: string,
  handler: (event: KeyboardEvent) => void,
  options: UseHotkeyOptions = {},
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const { target, preventDefault = true, enableWhileTyping = false, enabled = true, mac } = options;

  useEffect(() => {
    if (!enabled) return;
    const node = target ?? (typeof window !== "undefined" ? window : null);
    if (!node) return;

    const isMac = mac ?? detectMac();
    const parsed = parseHotkey(spec);
    const hasModifier = parsed.mod || parsed.meta || parsed.ctrl || parsed.alt;

    const onKeydown = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) return;
      if (!enableWhileTyping && !hasModifier && isTypingContext(event.target)) return;
      if (!matchesHotkey(event, parsed, isMac)) return;
      if (preventDefault) event.preventDefault();
      handlerRef.current(event);
    };

    node.addEventListener("keydown", onKeydown);
    return () => node.removeEventListener("keydown", onKeydown);
  }, [spec, target, preventDefault, enableWhileTyping, enabled, mac]);
}
