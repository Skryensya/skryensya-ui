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
 * NOTE ON THE PROTOTYPE. A real cut produces the whole site under `/v<version>/`. What exists today is one
 * page, hand-placed, so the switcher must cope with a version that holds a single document: that is
 * what `versionsOf` is for, and why the control never offers a version this document is not in.
 */
import { canonicalPath, getLocale, locales, splitVersion, type Locale } from "../i18n";

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
 */
function compareVersions(a: string, b: string): number {
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
