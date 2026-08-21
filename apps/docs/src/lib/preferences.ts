/*
 * Every preference this site stores, in one place.
 *
 * The mechanism is the design system's (`@skryensya/core/storage`); the LIST is the app's, and this
 * is the file the storage docs point at as the example. Two kinds live here:
 *
 *   - re-exports of preferences the system already declares, because their type lives with their
 *     component (color mode with ThemeToggle, binding and screen with ComponentPreview); and
 *   - the site's own, which core has no business naming: a docs palette is a tenant.
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


/** The /presets gallery and the header's palette toggle: the id of the chosen preset. */
export const palettePreference = definePreference<string>({
  slot: "palette",
  fallback: "",
  parse: stringValue(64),
});
