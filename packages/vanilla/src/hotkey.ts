/*
 * HOTKEY, the imperative binding.
 *
 * `bindHotkey("mod+k", open)` returns its own cleanup, the same shape every enhancer here returns.
 * It is the core's, re-exported: since decision 25 the binding runs on `@zag-js/hotkeys`' store, and
 * React's `useHotkey` wraps the very same function, so there is one listener implementation, not a
 * copy per binding. This path stays because `@skryensya/vanilla/hotkey` is where consumers import it.
 */
export { bindHotkey, type BindHotkeyOptions } from "@skryensya/core/hotkey";
