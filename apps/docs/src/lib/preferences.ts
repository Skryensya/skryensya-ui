/*
 * Every preference this site stores, in one place.
 *
 * The mechanism is the design system's (`@skryensya/core/storage`); the LIST is the app's, and this
 * is the file the storage docs point at as the example. Two kinds live here:
 *
 *   - re-exports of preferences the system already declares, because their type lives with their
 *     component (color mode with ThemeToggle, binding and screen with ComponentPreview); and
 *   - the site's own, which core has no business naming — a docs palette is a tenant.
 *
 * Anything that persists in this app is declared here. That is the rule the fundamentals page states,
 * and this file is what makes it checkable: grep for `localStorage` outside of it and the only hit
 * should be the pre-paint script in Base.astro, which cannot import.
 */

import { definePreference, oneOf, stringValue } from "@skryensya/core/storage";

export { colorModePreference } from "@skryensya/core/theme-toggle";
export {
  componentPreviewBindingPreference,
  componentPreviewScreenPreference,
} from "@skryensya/core/component-preview";

/** High contrast, the third color mode. A dimension, so it is the site's to store, not a component's. */
export const contrastPreference = definePreference<"normal" | "high">({
  slot: "contrast",
  fallback: "normal",
  parse: oneOf(["normal", "high"]),
});

/** The /personalizar brand playground: the id of the chosen palette preset. */
export const palettePreference = definePreference<string>({
  slot: "palette",
  fallback: "",
  parse: stringValue(64),
});

/**
 * The /personalizar share code: a fixed-width base36 string that encodes a whole theme.
 *
 * Was `localStorage["sk-playground"]`, its own top-level key. Folded in here because a second key is
 * a second thing to find, to clear and to forget — the one-entry rule exists so "reset the site" stays
 * one call. The cap is generous but finite: it is the only free-form slot, so it is the only one where
 * a hand-edited value could grow without bound.
 */
export const playgroundPreference = definePreference<string>({
  slot: "playground",
  fallback: "",
  parse: stringValue(256),
});
