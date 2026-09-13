/*
 * WHICH DOCS VERSIONS EXIST, read off the page directory at build time.
 *
 * A frozen version is a built archive mounted under `/vN/` (ADR-0022), and the whole point of that
 * decision is that nothing has to be declared twice: the archive IS the record of what it contains.
 * So this asks the routes rather than a ledger. Drop a page at
 * `pages/v0.0.1-dev/components/button.astro` and that version appears in the switcher, on that
 * page, in that locale, with no second edit and nothing to keep in sync.
 *
 * `?raw` and `eager` for the reason `i18n/index.ts` records at length on the same glob: asking Vite
 * for the page MODULES would give this file an import edge to every page, and `Base.astro` imports
 * it, so every route would end up carrying every other route's stylesheet. Only the KEYS are read
 * here; the values are never touched.
 *
 * NOTE ON THE PROTOTYPE. A real cut produces the whole site under `/v<version>/`. Until then the
 * archive is filled with fallback stubs that re-export the living page for every route the live
 * tree has, plus a few hand-frozen pages (Button, Foundations, Density) that carry a captured copy.
 * The switcher can therefore offer the base version on every document, not only on the few pages
 * someone froze by hand.
 */
import { canonicalPath, getLocale, locales, localizePath, splitVersion, type Locale } from "../i18n";

/*
 * The WHOLE page tree, filtered below by `splitVersion`, rather than a narrower glob like
 * `../pages/v[0-9]*`: the version prefix is a naming convention (`v1`, `v2`), and one regex already
 * owns what that convention is. A second pattern here, written in a different syntax, would be a
 * second definition of the same rule and would disagree with the first one eventually.
 */
const versionedPages = import.meta.glob("../pages/**/*.astro", {
  eager: true,
  query: "?raw",
  import: "default",
});

/** `../pages/v0.0.1-dev/es/componentes/button.astro` -> `/v0.0.1-dev/es/componentes/button`. */
function routeFromModulePath(modulePath: string): string {
  return modulePath
    .replace(/^\.\.\/pages/, "")
    .replace(/\.astro$/, "")
    .replace(/\/index$/, "");
}

/** version -> canonical document path -> the locales that version published it in. */
const index = new Map<string, Map<string, Set<Locale>>>();

for (const modulePath of Object.keys(versionedPages)) {
  const route = routeFromModulePath(modulePath);
  const { version } = splitVersion(route);
  if (version === null) continue;
  const canonical = canonicalPath(route);
  const byDocument = index.get(version) ?? new Map<string, Set<Locale>>();
  const localesFor = byDocument.get(canonical) ?? new Set<Locale>();
  localesFor.add(getLocale(route));
  byDocument.set(canonical, localesFor);
  index.set(version, byDocument);
}

/*
 * NEWEST FIRST, and that is an ORDER, not an alphabet.
 *
 * A version is written the way the release ledger writes it (`0.0.1-dev`, later `0.2.0`, `1.0.0`),
 * so sorting the strings would put `0.10.0` before `0.9.0` and a prerelease after the release it
 * precedes. Both are wrong on the day they happen and silent until then. This compares the numeric
 * parts as numbers, and then puts a finished release ABOVE its own prerelease: `0.0.1` is newer
 * than `0.0.1-dev`, because the prerelease is what came first.
 *
 * Exported for its test. Ordering is exactly the kind of rule that stays silent until the day it is
 * wrong, and that day is whichever release ships tenth.
 */
export function compareVersions(a: string, b: string): number {
  const parse = (version: string) => {
    const [core = "", prerelease = ""] = version.split("-", 2);
    const parts = core.split(".").map(Number);
    return { parts: [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0], prerelease };
  };
  const left = parse(a);
  const right = parse(b);
  for (let i = 0; i < 3; i += 1) {
    if (left.parts[i] !== right.parts[i]) return right.parts[i]! - left.parts[i]!;
  }
  if (left.prerelease === right.prerelease) return 0;
  if (left.prerelease === "") return -1;
  if (right.prerelease === "") return 1;
  return right.prerelease.localeCompare(left.prerelease);
}

/** Every frozen version, newest first. */
export const frozenVersions: readonly string[] = [...index.keys()].sort(compareVersions);

/** The frozen versions that published this document, newest first. */
export function versionsOf(canonical: string): readonly string[] {
  const id = canonicalPath(canonical);
  return frozenVersions.filter((version) => index.get(version)?.has(id));
}

/** The locales a frozen version published this document in, in declaration order. */
export function frozenLocales(version: string, canonical: string): readonly Locale[] {
  const published = index.get(version)?.get(canonicalPath(canonical));
  return published ? locales.filter((locale) => published.has(locale)) : [];
}

/** Does `version` hold this document in this locale? */
export function frozenHasTranslation(version: string, canonical: string, locale: Locale): boolean {
  return frozenLocales(version, canonical).includes(locale);
}

/*
 * A LINK INSIDE AN ARCHIVE STAYS INSIDE THE ARCHIVE, wherever the archive can honour it.
 *
 * This is what makes a frozen version feel like a site rather than a single stranded page: reading
 * `/v0.0.1-dev/foundations` and clicking through to Density should land on that version's Density,
 * not on today's. A real cut holds the whole site, so every link resolves in-version and the reader
 * never leaves by accident.
 *
 * WHAT HAPPENS TO A LINK THE ARCHIVE DOES NOT HAVE: it is left exactly as it was, pointing at the
 * living site. That is the honest answer for a PARTIAL archive (the prototype's case, and a real
 * one's too whenever a document was added after the cut): the alternative is a link into a page
 * that does not exist, which is a 404 dressed up as history.
 */
export function archiveHref(href: string, locale: Locale, version: string | null): string {
  if (version === null) return href;
  /* Fragments, query strings and anything that leaves the site are not document paths. */
  if (!href.startsWith("/")) return href;
  const [path = "", suffix = ""] = splitAtFirst(href, /[#?]/);
  const canonical = canonicalPath(path);
  if (!frozenHasTranslation(version, canonical, locale)) return href;
  return `${localizePath(canonical, locale, version)}${suffix}`;
}

/** `"/a/b#c"` -> `["/a/b", "#c"]`. Keeps the separator with the tail, where it belongs. */
function splitAtFirst(value: string, separator: RegExp): [string, string] {
  const index = value.search(separator);
  return index === -1 ? [value, ""] : [value.slice(0, index), value.slice(index)];
}
