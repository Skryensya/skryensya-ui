/*
 * Persist the two shared ComponentPreview preferences: binding (Vanilla | React) and screen preset.
 *
 * Both live on <html> while the page is open (that is what the enhancer and the CSS read), and this
 * script is the bridge between those attributes and storage. It hand-rolls neither the key, the JSON,
 * the try/catch nor the guard: `setPreference` is the one way anything in this repo writes
 * localStorage, and the two declarations come from `lib/preferences`.
 */

import {
  componentPreviewAttrs,
  componentPreviewBindingChangeEvent,
  componentPreviewScreenChangeEvent,
} from "@skryensya/core/component-preview";
import { setPreference } from "@skryensya/vanilla/storage";
import {
  componentPreviewBindingPreference,
  componentPreviewScreenPreference,
} from "../lib/preferences";

/** The parse in the declaration is the guard, so an unexpected value is dropped rather than stored. */
function persist<Value>(
  preference: Parameters<typeof setPreference<Value>>[0],
  raw: unknown,
): void {
  const parsed = preference.parse(raw);
  if (parsed !== undefined) setPreference(preference, parsed);
}

export function initDocsBinding(): void {
  document.addEventListener(componentPreviewBindingChangeEvent, (event) => {
    persist(componentPreviewBindingPreference, (event as CustomEvent<{ value: string }>).detail?.value);
  });

  document.addEventListener(componentPreviewScreenChangeEvent, (event) => {
    persist(componentPreviewScreenPreference, (event as CustomEvent<{ value: string }>).detail?.value);
  });

  /*
   * Fullscreen reconstructs one card in a srcdoc whose `<html>` has no screen pref (XL is
   * docs-column-only and was stripped). Writing that absence back to storage would clobber the
   * catalogue tab's own preset. Listeners above still persist a choice made IN this frame.
   */
  if (document.documentElement.hasAttribute("data-sk-fullscreen-preview")) return;

  // If the pre-paint script already wrote the attributes, keep storage aligned (first paint, or a
  // value another tab wrote while this one was closed).
  const root = document.documentElement;
  persist(componentPreviewBindingPreference, root.getAttribute(componentPreviewAttrs.documentBinding));
  // `free` is the ABSENCE of the screen attribute, so an absent one is a real value, not a gap.
  persist(
    componentPreviewScreenPreference,
    root.getAttribute(componentPreviewAttrs.documentScreen) ?? "free",
  );
}
