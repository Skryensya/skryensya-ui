/*
 * Static paths for `/f/{docs page}/{n}`: one HTML file per ComponentPreview on each docs page.
 *
 * The shell itself still reconstructs the card in the browser (this site is `output: "static"`),
 * but a catch-all with no `getStaticPaths` would 404 after `astro build`. Counting `<ComponentPreview`
 * in each page (and the Astro files it imports) is how we know which `/f/…/1`, `/f/…/2`, … files
 * to emit, without prerendering the demo itself.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const SRC_ROOT = fileURLToPath(new URL("..", import.meta.url));
const PAGES_ROOT = join(SRC_ROOT, "pages");

const SKIP_PAGE = /^(?:f\/|(?:en\/)?404\.astro$)/;

export function fullscreenPreviewStaticPaths(): { params: { path: string } }[] {
  const paths: { params: { path: string } }[] = [];
  for (const file of walkAstro(PAGES_ROOT)) {
    const route = routeFromPageFile(file);
    if (route === null) continue;
    const count = countComponentPreviews(file, new Set());
    for (let n = 1; n <= count; n += 1) {
      paths.push({ params: { path: route ? `${route}/${n}` : String(n) } });
    }
  }
  return paths;
}

function walkAstro(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkAstro(full));
    else if (entry.name.endsWith(".astro")) out.push(full);
  }
  return out;
}

/** `src/pages/componentes/layout-grid.astro` → `componentes/layout-grid`; home → `""`. */
function routeFromPageFile(file: string): string | null {
  const rel = file.slice(PAGES_ROOT.length + 1).replaceAll("\\", "/");
  if (SKIP_PAGE.test(rel)) return null;
  let route = rel.replace(/\.astro$/, "");
  if (route.endsWith("/index")) route = route.slice(0, -"/index".length);
  return route === "index" ? "" : route;
}

function countComponentPreviews(file: string, seen: Set<string>): number {
  const resolved = resolveExisting(file);
  if (!resolved || seen.has(resolved)) return 0;
  seen.add(resolved);
  if (resolved.replaceAll("\\", "/").endsWith("/ComponentPreview.astro")) return 0;

  let source: string;
  try {
    source = readFileSync(resolved, "utf8");
  } catch {
    return 0;
  }

  const aliases = new Set<string>();
  let total = 0;
  const importRe = /import\s+(\w+)\s+from\s+["']([^"']+)["']/g;
  for (const match of source.matchAll(importRe)) {
    const name = match[1]!;
    const spec = match[2]!;
    const imported = resolveImport(resolved, spec);
    if (!imported) continue;
    if (imported.replaceAll("\\", "/").endsWith("/ComponentPreview.astro")) {
      aliases.add(name);
      continue;
    }
    if (imported.endsWith(".astro")) total += countComponentPreviews(imported, seen);
  }

  for (const name of aliases) {
    const tag = new RegExp(`<${name}(?:\\s|>)`, "g");
    total += source.match(tag)?.length ?? 0;
  }
  return total;
}

function resolveImport(fromFile: string, spec: string): string | null {
  if (spec.startsWith("@/")) return resolveExisting(join(SRC_ROOT, spec.slice(2)));
  if (spec.startsWith(".")) return resolveExisting(resolvePath(dirname(fromFile), spec));
  return null;
}

function resolveExisting(path: string): string | null {
  const candidates = [path, `${path}.astro`, `${path}.ts`, `${path}.tsx`, join(path, "index.astro")];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}
