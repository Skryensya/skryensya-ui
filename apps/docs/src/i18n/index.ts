/*
 * THE LOCALE HELPERS: which language is this page, what does a string say in it, and where does a
 * given page live in the other one.
 *
 * The site is static and multi-page, so a locale is a URL PREFIX and nothing else — no runtime
 * negotiation, no cookie, no client state. `/componentes/avatar` is Spanish, `/en/components/avatar`
 * is English, and both are real files on disk. That is deliberate: every dimension this site already
 * has (brand, mode, contrast, density) resolves in the browser from custom properties, but language
 * changes the HTML, so it has to resolve at build.
 */

import {
  defaultLocale,
  locales,
  navLabel,
  ui,
  type Locale,
  type UIKey,
} from "./ui";

export {
  defaultLocale,
  localeNames,
  locales,
  navLabel,
  ui,
  type Locale,
  type UIKey,
} from "./ui";

const localeSet = new Set<string>(locales);

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && localeSet.has(value);
}

/**
 * The locale of a URL, from its first segment.
 *
 * Astro exposes `Astro.currentLocale`, and it is derived from exactly this — but it is `undefined`
 * on the default locale's unprefixed routes, which is most of the site. Reading the path ourselves
 * gives one answer with one shape everywhere, so no caller has to remember the hole.
 */
export function getLocale(url: URL | string): Locale {
  const pathname = typeof url === "string" ? url : url.pathname;
  const first = pathname.split("/").filter(Boolean)[0];
  return isLocale(first) ? first : defaultLocale;
}

/**
 * Translator bound to a locale. Missing keys fall back to Spanish rather than rendering the key:
 * a half-translated page in the wrong language is readable, `search.placeholder` on screen is not.
 *
 * `vars` interpolates `{name}` placeholders — used by the strings that carry a value the caller owns
 * (the palette name, the package name in the footer).
 */
export function useTranslations(locale: Locale) {
  return function t(key: UIKey, vars?: Record<string, string>): string {
    const table = ui[locale] as Record<string, string>;
    const fallback = ui[defaultLocale] as Record<string, string>;
    const value = table[key] ?? fallback[key] ?? key;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (match, name: string) => vars[name] ?? match);
  };
}

/*
 * ROUTE SEGMENTS, Spanish → English.
 *
 * An English site whose URLs read `/en/componentes/avatar` is not an English site. But translating
 * whole paths would mean a per-locale href on all ~97 nav entries, so this translates SEGMENTS
 * instead: the Spanish path vocabulary is about a dozen words, and every component slug
 * (`avatar`, `date-picker`, `split-button`) is already English and passes through untouched.
 *
 * Keys are Spanish segments; a segment with no entry is emitted as-is.
 */
const routeSegments: Record<string, Partial<Record<Locale, string>>> = {
  componentes: { en: "components" },
  referencia: { en: "reference" },
  primitivas: { en: "primitives" },
  almacenamiento: { en: "storage" },
  anclaje: { en: "anchoring" },
  densidad: { en: "density" },
  dimensiones: { en: "dimensions" },
  gradientes: { en: "gradients" },
  iconos: { en: "icons" },
  personalizar: { en: "customize" },
  prerrequisitos: { en: "prerequisites" },
  "primer-componente": { en: "first-component" },
  transparencias: { en: "transparency" },
};

/** The reverse table, built once, so an English path can be read back to its Spanish identity. */
const reverseSegments = new Map<string, string>(
  Object.entries(routeSegments).flatMap(([es, translations]) =>
    Object.values(translations).map((translated) => [translated!, es] as const),
  ),
);

const stripLocale = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
};

/**
 * A path in its Spanish (canonical) form, whatever locale it arrived in.
 *
 * This is the KEY every locale-independent lookup uses — `vanillaMounts`, `navLabel`, the
 * "am I the current page" check in the nav — so those tables stay keyed one way instead of gaining a
 * column each time a language is added.
 */
export function canonicalPath(pathname: string): string {
  const bare = stripLocale(pathname);
  if (bare === "/") return "/";
  const segments = bare
    .split("/")
    .filter(Boolean)
    .map((segment) => reverseSegments.get(segment) ?? segment);
  return `/${segments.join("/")}`;
}

/**
 * Where a page lives in `locale`. Takes a path in any locale, so it works both for authoring
 * (`localizePath("/componentes/avatar", "en")`) and for the language switcher, which hands it
 * whatever the reader is currently looking at.
 */
export function localizePath(pathname: string, locale: Locale): string {
  const canonical = canonicalPath(pathname);
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  if (canonical === "/") return prefix || "/";
  const segments = canonical
    .split("/")
    .filter(Boolean)
    .map((segment) => routeSegments[segment]?.[locale] ?? segment);
  return `${prefix}/${segments.join("/")}`;
}

/*
 * WHICH PAGES ACTUALLY EXIST IN WHICH LANGUAGE, read off the filesystem at build time.
 *
 * The site is translated one page at a time, so for most of it the other language is simply not
 * there. A language switcher that links to it anyway is worse than no switcher: it turns every page
 * into a trapdoor onto a 404. This asks the page directory instead of trusting a hand-kept list,
 * which means the answer cannot go stale — drop in `pages/en/components/button.astro` and the
 * control lights up on the Spanish Button page with no second edit.
 *
 * `import.meta.glob` is resolved statically by Vite: no page module is executed or bundled by this,
 * only their paths are collected.
 */
const pageModules = import.meta.glob("../pages/**/*.astro");

/** `../pages/en/components/avatar.astro` → `/en/components/avatar` (and `index` → its directory). */
function routeFromModulePath(modulePath: string): string {
  const route = modulePath
    .replace(/^\.\.\/pages/, "")
    .replace(/\.astro$/, "")
    .replace(/\/index$/, "");
  return route === "" ? "/" : route;
}

/** Canonical path → the set of locales that have a real file for it. */
const pagesByCanonical = new Map<string, Set<Locale>>();
for (const modulePath of Object.keys(pageModules)) {
  const route = routeFromModulePath(modulePath);
  const canonical = canonicalPath(route);
  const locale = getLocale(route);
  const existing = pagesByCanonical.get(canonical) ?? new Set<Locale>();
  existing.add(locale);
  pagesByCanonical.set(canonical, existing);
}

/** Does `canonical` exist in `locale`? */
export function hasTranslation(canonical: string, locale: Locale): boolean {
  return pagesByCanonical.get(canonicalPath(canonical))?.has(locale) ?? false;
}

/** Every locale this page is actually published in, in declaration order. */
export function availableLocales(canonical: string): readonly Locale[] {
  return locales.filter((locale) => hasTranslation(canonical, locale));
}
