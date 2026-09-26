import { bindHotkey } from "@skryensya/core/hotkey";
import { useEffect, useRef } from "react";

/*
 * HOTKEY, the React binding.
 *
 * `useHotkey("mod+k", open)` is the core's `bindHotkey` (on `@zag-js/hotkeys`' store, decision 25)
 * held for the life of the component: the effect binds, its cleanup unbinds. The handler goes through
 * a ref so a new closure every render does not re-bind. It never imports the vanilla package; the two
 * bindings are siblings over core (decision 14), and here they share the implementation outright.
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
    return bindHotkey(spec, (event) => handlerRef.current(event), {
      target: target ?? undefined,
      preventDefault,
      enableWhileTyping,
      mac,
    });
  }, [spec, target, preventDefault, enableWhileTyping, enabled, mac]);
}
