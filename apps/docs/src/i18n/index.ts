/*
 * THE LOCALE HELPERS: which language is this page, what does a string say in it, and where does a
 * given page live in the other one.
 *
 * The site is static and multi-page, so a locale is a URL PREFIX and nothing else: no runtime
 * negotiation, no cookie, no client state. `/components/avatar` is Spanish, `/components/avatar`
 * is English, and both are real files on disk. That is deliberate: every dimension this site already
 * has (brand, mode, contrast, density) resolves in the browser from custom properties, but language
 * changes the HTML, so it has to resolve at build.
 */

import { defaultLocale, locales, ui, type Locale, type UIKey } from "./ui";

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

/*
 * THE VERSION AXIS, `/v1/...`.
 *
 * A frozen docs version is a whole built site mounted under `/vN/` (ADR-0022), so the version is a
 * prefix that sits OUTSIDE the locale: `/v1/es/componentes/button`, never `/es/v1/...`. An archive
 * is produced by one build with one base, and putting the locale first would mean two bases per
 * version or a rewrite rule in the CDN for something the build already knows.
 *
 * ONE SEGMENT, `v0.0.1-dev`, not two. The prefix is the NAME of an archive, not a collection with
 * members: `/v/0.0.1-dev/` would make `/v/` have to mean something, and it does not.
 *
 * DOTS SURVIVE IN A PATH, and that was measured here rather than assumed: a directory segment may
 * hold them freely, and only the LAST segment of a static URL is ever read as a filename, which is
 * `button` and not the version. So the archive is named exactly what the release is called, with no
 * second spelling to translate between. If a host ever refuses the dots, the fallback is `_` and it
 * changes this regex and the directory name, nothing else.
 *
 * Everything below reads the version off the front and then treats the rest exactly as it always
 * did, which is what keeps `canonicalPath` the document's identity: the same document in v1 and in
 * latest canonicalises to the SAME path, because a version is not part of what a page IS.
 */
const versionSegment = /^v(\d+(?:\.\d+){0,2}(?:-[0-9A-Za-z.-]+)?)$/;

/** A path split into its version prefix (if any) and the rest, which is a normal site path. */
export function splitVersion(pathname: string): { version: string | null; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  const match = segments[0] === undefined ? null : versionSegment.exec(segments[0]);
  if (match) return { version: match[1]!, path: `/${segments.slice(1).join("/")}` };
  return { version: null, path: pathname.startsWith("/") ? pathname : `/${pathname}` };
}

/** The docs version a URL belongs to, or `null` for latest (the unprefixed, editable site). */
export function versionOf(url: URL | string): string | null {
  return splitVersion(typeof url === "string" ? url : url.pathname).version;
}

/**
 * The locale of a URL, from its first segment.
 *
 * Astro exposes `Astro.currentLocale`, and it is derived from exactly this, but it is `undefined`
 * on the default locale's unprefixed routes, which is most of the site. Reading the path ourselves
 * gives one answer with one shape everywhere, so no caller has to remember the hole.
 */
export function getLocale(url: URL | string): Locale {
  const pathname = typeof url === "string" ? url : url.pathname;
  const first = splitVersion(pathname).path.split("/").filter(Boolean)[0];
  return isLocale(first) ? first : defaultLocale;
}

/**
 * Translator bound to a locale. Missing keys fall back to Spanish rather than rendering the key:
 * a half-translated page in the wrong language is readable, `search.placeholder` on screen is not.
 *
 * `vars` interpolates `{name}` placeholders: used by the strings that carry a value the caller owns
 * (the palette name, the package name in the footer).
 */
/**
 * The translator itself, as a type.
 *
 * Named because things other than a page now take one: a demo's usage tree is one composition read
 * in two languages, so it is authored as a function of `t` (see `src/demos/`) instead of being copied
 * per locale.
 */
export type Translate = (key: UIKey, vars?: Record<string, string>) => string;

export function useTranslations(locale: Locale): Translate {
  return function t(key: UIKey, vars?: Record<string, string>): string {
    const table = ui[locale] as Record<string, string>;
    const fallback = ui[defaultLocale] as Record<string, string>;
    const value = table[key] ?? fallback[key] ?? key;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (match, name: string) => vars[name] ?? match);
  };
}

/*
 * ROUTE SEGMENTS, English → Spanish.
 *
 * English owns the bare paths, so English is the canonical spelling of a route and this table says
 * how each segment is written in the other locale. Translating whole paths would mean a per-locale
 * href on all ~97 nav entries; the path vocabulary is about a dozen words, and every component slug
 * (`avatar`, `date-picker`, `split-button`) is identical in both and passes through untouched.
 *
 * Keys are English segments; a segment with no entry is emitted as-is.
 */
const routeSegments: Record<string, Partial<Record<Locale, string>>> = {
  accent: { es: "acento" },
  components: { es: "componentes" },
  architecture: { es: "arquitectura" },
  reference: { es: "referencia" },
  primitives: { es: "primitivas" },
  storage: { es: "almacenamiento" },
  anchoring: { es: "anclaje" },
  density: { es: "densidad" },
  dimensions: { es: "dimensiones" },
  effects: { es: "efectos" },
  elevation: { es: "elevacion" },
  gradients: { es: "gradientes" },
  icons: { es: "iconos" },
  foundations: { es: "fundamentos" },
  installation: { es: "instalacion" },
  prerequisites: { es: "prerrequisitos" },
  keyboard: { es: "teclado" },
  "first-component": { es: "primer-componente" },
  "automatic-mounting": { es: "montaje-automatico" },
  transparency: { es: "transparencias" },
  recipes: { es: "recetas" },
};

/** The reverse table, built once, so a Spanish path can be read back to its English identity. */
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
 * A path in its English (canonical) form, whatever locale it arrived in.
 *
 * This is the KEY every locale-independent lookup uses (`vanillaMounts`, `navLabel`, the
 * "am I the current page" check in the nav), so those tables stay keyed one way instead of gaining a
 * column each time a language is added. It was Spanish until English took the bare paths; the
 * direction of `routeSegments` is the only thing that decides it.
 */
export function canonicalPath(pathname: string): string {
  const bare = stripLocale(splitVersion(pathname).path);
  if (bare === "/") return "/";
  const segments = bare
    .split("/")
    .filter(Boolean)
    .map((segment) => reverseSegments.get(segment) ?? segment);
  return `/${segments.join("/")}`;
}

/**
 * Where a page lives in `locale`. Takes a path in any locale, so it works both for authoring
 * (`localizePath("/components/avatar", "en")`) and for the language switcher, which hands it
 * whatever the reader is currently looking at.
 */
export function localizePath(pathname: string, locale: Locale, version?: string | null): string {
  const canonical = canonicalPath(pathname);
  /*
   * The version STAYS unless the caller names another one. A reader inside `/v1/` who switches
   * language is still reading version 1, so the language control must not quietly move them to
   * latest; the version control is the one that changes this axis, and it passes `version`
   * explicitly. `undefined` means "keep what the path had", `null` means "latest".
   */
  const target = version === undefined ? splitVersion(pathname).version : version;
  const versionPrefix = target === null ? "" : `/v${target}`;
  const prefix = `${versionPrefix}${locale === defaultLocale ? "" : `/${locale}`}`;
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
 * which means the answer cannot go stale: drop in `pages/en/components/button.astro` and the
 * control lights up on the Spanish Button page with no second edit.
 *
 * ONLY THE KEYS ARE USED. `Object.keys` below is the whole point; the values are never read.
 *
 * `?raw` IS LOAD-BEARING, and it is the difference between this file costing nothing and costing
 * every page 147 kB of someone else's CSS. Ask Vite for the page MODULES and you hand it an import
 * edge from this module, which `Base.astro` pulls in, so, every page. To all ~200 pages. Astro
 * then resolves each route's styles through that graph and concludes that every page's stylesheet
 * belongs on every page. Measured before this query was added: `/components/accordion` shipped 15
 * stylesheets totalling 298 kB, among them `customize.css` and `personalizar.css`, two OTHER routes'
 * page styles, 39 kB each; 180 of 198 built pages carried that same freight. With `?raw` the same
 * page ships 4 stylesheets and 154 kB, and the leak is down to the 2 pages that own those styles.
 *
 * The multiplier is what makes it matter: every ComponentPreview stage clones the parent's whole
 * `<head>` into its frame (`scripts/component-preview-frame.ts`), so on a page with 8 previews that
 * 147 kB is parsed into a CSSOM nine times over.
 *
 * `eager` because the values are strings, not modules: nothing is fetched at runtime, and the page
 * sources it inlines land in the SERVER bundle, which never reaches a reader. If you find yourself
 * dropping the query to "clean this up", read the paragraph above first.
 */
const pageModules = import.meta.glob("../pages/**/*.astro", {
  eager: true,
  query: "?raw",
  import: "default",
});

/** `../pages/en/components/avatar.astro` → `/components/avatar` (and `index` → its directory). */
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
  /* Versioned archive routes are not part of this source tree (VERSIONED_DOCS_PLAN §3.3). If a
   * version-prefixed page ever lands here by mistake, skip it so `hasTranslation` does not light up
   * the language switcher for a translation that only exists under an archive prefix. */
  if (splitVersion(route).version !== null) continue;
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
