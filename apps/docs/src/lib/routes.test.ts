import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * EVERY INTERNAL LINK POINTS AT A ROUTE THAT EXISTS.
 *
 * ADR-0021 moved English to the bare path and Spanish under `/es`. What it left behind was 220
 * hand-written `href="/en/…"` links to a route tree that never existed: `prefixDefaultLocale` is
 * false, so `src/pages/en/` is not a directory and every one of those was a 404 a reader could
 * click. 126 of them lived inside the `en:` half of i18n shards, which is why the locale-parity
 * test could not see them: both halves were present and both were wrong.
 *
 * Nothing in 198 test files read an href before this one. The route vocabulary already has an owner
 * (`i18n/locales.ts`), so the failure was not that the knowledge was missing, it was that 220
 * copies of it were written by hand and never compared against the pages on disk.
 */

const root = join(process.cwd(), "src");
const pagesDir = join(root, "pages");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Astro's file-based routing, as a set of paths a link may legitimately target. */
const routes = new Set<string>();
/** `[...path]` and `[slug]` segments match anything below them, so they are prefixes, not paths. */
const prefixes: string[] = [];
for (const file of walk(pagesDir)) {
  const rel = relative(pagesDir, file).replace(/\\/g, "/");
  if (!/\.(astro|md|mdx)$/.test(rel)) continue;
  const path = "/" + rel.replace(/\.(astro|md|mdx)$/, "").replace(/(^|\/)index$/, "");
  if (/\[/.test(path)) prefixes.push(path.replace(/\/\[.*$/, ""));
  else routes.add(path === "" ? "/" : path);
}

const resolves = (href: string) =>
  routes.has(href) ||
  routes.has(href.replace(/\/$/, "")) ||
  prefixes.some((p) => href === p || href.startsWith(p + "/"));

/** Every internal href written anywhere in the source, with its file. */
const links: { file: string; href: string }[] = [];
for (const file of walk(root)) {
  if (!/\.(astro|ts|tsx|svelte)$/.test(file) || /\.test\.ts$/.test(file)) continue;
  /*
   * Demo markup is sample content, not navigation: a Popover example links to `/people/ada` and a
   * state-layer example to `/docs` precisely because a link is what those components are showing.
   * Asserting those resolve would be asserting the demos are a real site.
   */
  if (/[/\\](react-demos|demos)[/\\]/.test(file)) continue;
  const source = readFileSync(file, "utf8");
  for (const m of source.matchAll(/href=["'](\/[^"'#?]*)["']/g)) {
    links.push({ file: relative(root, file), href: m[1]! });
  }
}

/*
 * A LITERAL INTERNAL HREF IN SHARED MARKUP IS A LOCALE LEAK.
 *
 * `src/components/**` and `src/layouts/**` render in EVERY locale: the same file produces the
 * English page and the Spanish one. So an `href="/components/box"` written there is not a link to
 * "Box", it is a link to the ENGLISH Box, and a Spanish reader who follows it leaves the language
 * they were reading in. Measured when this test was written: fourteen of them, thirteen in
 * `CardPage`/`TilePage` and one in the footer, where the surviving fossil was a ternary whose two
 * branches were the same English path.
 *
 * The rule is not "no absolute hrefs", it is "not in a file that renders twice": a page under
 * `src/pages/es/` may write `/es/...` freely, because it only ever renders in that locale.
 * `localizePath(path, locale)` is the seam, and the test below is what keeps the next one from
 * being written by hand.
 */
describe("locale-independent markup", () => {
  const shared = walk(root).filter(
    (file) => /\.astro$/.test(file) && /[/\\](components|layouts)[/\\]/.test(file),
  );

  it("has shared components to check", () => {
    expect(shared.length).toBeGreaterThan(20);
  });

  /*
   * THE SAME LEAK, IN THE PROSE. A message shard holds both locales side by side, so an `href` in
   * the `es` half is Spanish text pointing wherever it says. Measured when this was written: 109 of
   * them across 46 shards sent a Spanish reader to the English page, and the `en` half had zero of
   * the mirror mistake, which is what says this was drift in one direction rather than a convention.
   */
  it("keeps the Spanish half of every message shard inside Spanish routes", () => {
    const leaks: string[] = [];
    for (const file of walk(join(root, "i18n"))) {
      if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
      const source = readFileSync(file, "utf8");
      const esStart = source.indexOf("es: {");
      const enStart = source.indexOf("en: {");
      if (esStart < 0 || enStart < esStart) continue;
      for (const m of source.slice(esStart, enStart).matchAll(/href=\\?["'](\/[^"'#?\\]*)/g)) {
        const href = m[1]!;
        if (!href.startsWith("/es/") && resolves(href)) leaks.push(`${href}  (${relative(root, file)})`);
      }
    }
    expect([...new Set(leaks)].sort()).toEqual([]);
  });

  /*
   * THREE SHAPES, because a link is written three ways here and all three leaked at least once: as
   * an attribute in markup, as an `href` OPTION inside a usage tree (the landing page's card), and
   * as a named constant handed to a demo (Button's `LINK_HREF`, whose own comment said the path
   * differs per locale while the value never did).
   *
   * The filter is "does it resolve to a real route", not "is it absolute": a demo linking to
   * `/people/ada` is showing what a link looks like, and asserting that resolves would be asserting
   * the demos are a real site. A path that IS a page of this site is a navigation, and a navigation
   * has a locale.
   */
  const LINK_SHAPES = [
    /href=["'](\/[^"'#?{]*)["']/g,
    /href:\s*["'](\/[^"'#?]*)["']/g,
    /\b[A-Za-z_]*(?:HREF|Href)\s*=\s*["'](\/[^"'#?]*)["']/g,
  ];

  it("never hardcodes a link to a real route, in any locale", () => {
    const leaks: string[] = [];
    for (const file of shared) {
      const source = readFileSync(file, "utf8");
      for (const shape of LINK_SHAPES) {
        for (const m of source.matchAll(shape)) {
          const href = m[1]!;
          if (resolves(href)) leaks.push(`${href}  (${relative(root, file)})`);
        }
      }
    }
    expect([...new Set(leaks)].sort()).toEqual([]);
  });

  /*
   * AND THE SPANISH PAGES THEMSELVES. A file under `src/pages/es/` renders in one locale only, so it
   * may write `/es/...` freely, but a bare `/foundations` there is still a door out of the language.
   * Only the TEMPLATE is scanned, not the frontmatter: the code samples a page declares up there are
   * markup being TAUGHT, and `<a href="/">Ver docs</a>` inside one is a demonstration of a link, not
   * a link.
   */
  it("keeps every Spanish page inside Spanish routes", () => {
    const leaks: string[] = [];
    for (const file of walk(pagesDir)) {
      if (!/\.astro$/.test(file) || !/[/\\]es[/\\]/.test(file)) continue;
      const source = readFileSync(file, "utf8");
      /* Everything after the frontmatter fence is what the page RENDERS. */
      const template = source.startsWith("---") ? source.slice(source.indexOf("\n---", 3) + 4) : source;
      for (const m of template.matchAll(/href=["'](\/[^"'#?{]*)["']/g)) {
        const href = m[1]!;
        if (!href.startsWith("/es") && resolves(href)) leaks.push(`${href}  (${relative(root, file)})`);
      }
    }
    expect([...new Set(leaks)].sort()).toEqual([]);
  });
});

describe("internal links", () => {
  it("found enough routes and links to be worth checking", () => {
    /* Floors, not exact counts: a glob that silently matched nothing would make the assertion
     * below a green no-op, which is the failure `public-exports.test.ts` records. */
    expect(routes.size).toBeGreaterThan(100);
    expect(links.length).toBeGreaterThan(200);
  });

  it("every one points at a page that exists", () => {
    const dead = [...new Set(links.filter((l) => !resolves(l.href)).map((l) => `${l.href}  (${l.file})`))].sort();
    expect(dead).toEqual([]);
  });
});
