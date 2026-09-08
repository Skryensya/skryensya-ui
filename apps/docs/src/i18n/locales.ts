/*
 * WHICH LANGUAGES EXIST. Deliberately a module of its own, importing nothing.
 *
 * The dictionary (`./ui`) is built by spreading ~110 per-route shards, and a spread is not
 * provably side-effect free, so anything that reaches `ui.ts` retains every string in the bundle.
 * The two CLIENT modules that need to know which locales exist (`lib/preferences.ts`,
 * `scripts/language-menu.ts`) import THIS file instead, and ship a five-line array rather than
 * 880 kB of copy. Keep it free of imports and the guarantee holds by construction.
 */

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = "es" satisfies Locale;

/** What the language switcher shows. Endonyms: a reader looking for English scans for "English". */
export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
};
