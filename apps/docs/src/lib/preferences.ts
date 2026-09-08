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
/* `../i18n/locales`, and neither `../i18n` nor `../i18n/ui`. This file has consumers (the pre-paint
 * script's `PREPAINT`) that must stay cheap, and each of the other two costs something: the barrel
 * drags in the `import.meta.glob` over every page source, and `ui` is now built by spreading ~110
 * route shards, which a bundler cannot prove pure, so importing it retains the whole dictionary
 * (measured: an 814 kB `preferences` chunk). `locales` imports nothing and is five lines. */
import { defaultLocale, locales, type Locale } from "../i18n/locales";

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

/*
 * The reader's chosen documentation language.
 *
 * Language is normally the URL and nothing else (`i18n/index.ts`): every page is a real file under
 * `/` or `/en/`, and a shared link opens in the language it names. This preference is the ONE piece
 * of client state layered on top, and it exists for one reason: a reader who picked a language once
 * must not be overridden by the browser-language redirect on every later visit to an unprefixed
 * page. `LanguageMenu.astro` writes it on click; the pre-paint redirect in `Base.astro` reads it
 * before anything else paints.
 *
 * NO stored fallback path: an absent slot means "no choice yet, follow the browser". `defaultLocale`
 * is only the declaration's type anchor; the absence branch in the redirect never writes it.
 */
export const languagePreference = definePreference<Locale>({
  slot: "lang",
  fallback: defaultLocale,
  parse: oneOf(locales),
});
