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
