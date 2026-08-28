/*
 * Key echo, light up a drawn `<kbd>` while its real key is held.
 *
 * Two kinds of target, so the hotkey page can show both halves of what the primitive does:
 *   [data-key="…"], one physical key, matched by KeyboardEvent.key (lowercased). Lights on its own.
 *   [data-hotkey="…"], a full chord, matched by the core `matchesHotkey`. Lights only when the whole
 *                        combination is down, the exact same matcher the shortcut binding uses.
 *
 * It sets `[data-pressed]`, which the kbd component already styles. It writes an attribute and reads
 * the keyboard; it owns no look, like every doc script here.
 */
import { detectMac, matchesHotkey } from "@skryensya/core/hotkey";

let keyEchoController: AbortController | null = null;

export function initKeyEcho(): void {
  keyEchoController?.abort();
  keyEchoController = new AbortController();
  const byKey = [...document.querySelectorAll<HTMLElement>("[data-key]")];
  const byChord = [...document.querySelectorAll<HTMLElement>("[data-hotkey]")];
  if (byKey.length === 0 && byChord.length === 0) return;

  const isMac = detectMac();
  const down = new Set<string>();

  const paintKeys = () => {
    for (const el of byKey) {
      el.toggleAttribute("data-pressed", down.has((el.dataset.key ?? "").toLowerCase()));
    }
  };

  const paintChords = (event: KeyboardEvent) => {
    for (const el of byChord) {
      const spec = el.dataset.hotkey;
      // A chord lights on the keydown that completes it and clears on any keyup, a released key can
      // no longer be part of a held combination.
      if (spec && event.type === "keydown" && matchesHotkey(event, spec, isMac)) {
        el.setAttribute("data-pressed", "");
      } else if (event.type === "keyup") {
        el.removeAttribute("data-pressed");
      }
    }
  };

  window.addEventListener("keydown", (event) => {
    down.add(event.key.toLowerCase());
    paintKeys();
    paintChords(event);
  }, { signal: keyEchoController.signal });

  window.addEventListener("keyup", (event) => {
    down.delete(event.key.toLowerCase());
    paintKeys();
    paintChords(event);
  }, { signal: keyEchoController.signal });

  /* A keyup can be missed, a Mac drops keyups for other keys while ⌘ is held, and a lost focus eats
   * the release entirely, which would strand a key lit. Clearing on blur is the honest reset. */
  window.addEventListener("blur", () => {
    down.clear();
    paintKeys();
    for (const el of byChord) el.removeAttribute("data-pressed");
  }, { signal: keyEchoController.signal });
}
