/*
 * Token pruner, drops custom-property definitions no shipped rule can reach.
 *
 * CSS custom properties have no dead-code elimination: a `:root` that declares 130 semantic
 * tokens ships all 130 even if the app touches 40. This walks the real dependency graph and
 * reports (or emits) the reachable subset, per-app.
 *
 * THE UNIT OF PRUNING IS A NAME, NOT A DECLARATION. A token can be declared in the base layer and
 * in a mode override. Keeping its name keeps every declaration, because the browser decides which
 * value wins at runtime. Pruning one copy would silently break a mode for that token alone.
 *
 * Reachability is transitive over token VALUES: a component reads `--color-bg-surface`, whose value
 * is `light-dark(var(--palette-white), var(--palette-slate-900))`, so both palettes are reachable too,
 * and neither may be dropped even though no component names a palette directly (lint.ts forbids that).
 *
 * The static scan cannot see tokens a component reads through JS (inline style, getComputedStyle,
 * a class toggled at runtime). Those are the caller's responsibility: pass them via --safelist, or
 * they will be pruned. This is why the tool defaults to REPORT, never to a destructive rewrite.
 *
 * Usage:
 *   node scripts/prune-tokens.ts                       report against ALL component+pattern CSS
 *   node scripts/prune-tokens.ts --used button,tile    report against a specific component set
 *   node scripts/prune-tokens.ts --used button,tile --emit out.css
 *   node scripts/prune-tokens.ts ... --safelist --color-accent-500,--color-text-tertiary
 */

import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";
import { compile } from "sass";
import { parseTokens, refsOf, CSS_DIR, type CorpusFile } from "./parse.ts";

// ── args ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name: string): string | null => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
};
const list = (name: string) => {
  const value = flag(name);
  return value ? value.split(",").map((s) => s.trim()).filter(Boolean) : null;
};

const usedComponents = list("used"); // null = every component+pattern
const safelist = new Set(list("safelist") ?? []);
const emitPath = flag("emit");

// ── supply: every token-tier declaration, name → its declarations across base and modes ─────────
// parseTokens already compiles the Sass tiers in memory and tags each file's tier.
const { files } = parseTokens(CSS_DIR);
const isTokenTier = (f: CorpusFile) => f.tier === "primitive" || f.tier === "semantic";
const isComponentTier = (f: CorpusFile) => f.tier === "component";

// name → set of every var() it references, unioned over every declaration.
// Keeping a name keeps the whole union reachable, or a mode override dangles.
const refsByName = new Map<string, Set<string>>();
const supplyNames = new Set<string>();
for (const f of files) {
  if (!isTokenTier(f)) continue;
  for (const d of f.decls) {
    supplyNames.add(d.name);
    const refs = refsByName.get(d.name) ?? new Set<string>();
    for (const r of refsOf(d.value)) refs.add(r);
    refsByName.set(d.name, refs);
  }
}

// ── demand: every var() reference in the component/pattern CSS the app actually ships ─────────
// We read the raw component text (not just its declarations), a rule body `background: var(--x)`
// is demand just as much as a `--sk-hook: var(--x)` declaration is.
const wantComponent = (f: CorpusFile) => {
  if (!usedComponents) return true;
  const base = f.rel.split("/").at(-1)?.replace(/\.css$/, "") ?? "";
  return usedComponents.includes(base);
};
const demandRoots = new Set(safelist);
let demandFiles = 0;
for (const f of files) {
  if (!isComponentTier(f) || !wantComponent(f)) continue;
  demandFiles++;
  for (const r of refsOf(readFileSync(f.path, "utf8"))) demandRoots.add(r);
}

// ── transitive closure over token values ──────────────────────────────────────
const reachable = new Set<string>();
const queue = [...demandRoots];
while (queue.length) {
  const name = queue.pop();
  if (name == null || reachable.has(name) || !supplyNames.has(name)) continue; // ignore --sk-* hooks (not token-tier)
  reachable.add(name);
  for (const r of refsByName.get(name) ?? []) if (!reachable.has(r)) queue.push(r);
}

const kept = [...supplyNames].filter((n) => reachable.has(n)).sort();
const pruned = [...supplyNames].filter((n) => !reachable.has(n)).sort();

// ── byte measurement: compile the one token bundle, full vs pruned, min + gzip ───────────────────
function buildTokenBundle() {
  // Mirror what an app links: primitives (including palettes) + semantic + optional hc + radius.
  // The entry lives inside CSS_DIR so its relative imports resolve; removed after.
  const imports = [
    `@use "./primitives";`,
    `@use "./semantic";`,
    `@import "./modes/hc.scss";`,
    `@import "./dimensions/radius.scss";`,
  ].join("\n");
  const entry = join(CSS_DIR, "__prune_entry__.scss");
  writeFileSync(entry, imports);
  try {
    return compile(entry, { loadPaths: [CSS_DIR], style: "compressed", silenceDeprecations: ["import"] }).css;
  } finally {
    rmSync(entry, { force: true });
  }
}

// A pruned declaration is `--name:value;` for a name we dropped. Names are unique tokens, so a
// per-name delete on the compiled bundle is safe and leaves every selector/@layer intact.
function pruneCss(css: string, dropNames: string[]) {
  let out = css;
  for (const n of dropNames) {
    out = out.replaceAll(new RegExp(`${n.replace(/[-]/g, "\\-")}\\s*:[^;}]*;`, "g"), "");
  }
  return out;
}

const fullCss = buildTokenBundle();
const prunedCss = pruneCss(fullCss, pruned);
const size = (s: string) => ({ raw: Buffer.byteLength(s), gz: gzipSync(s).length });
const fBytes = size(fullCss);
const pBytes = size(prunedCss);

// ── report ─────────────────────────────────────────────────────────────────────
const pct = (a: number, b: number) => (b === 0 ? "0" : (((b - a) / b) * 100).toFixed(1));
console.log(`\nToken prune, demand: ${usedComponents ? usedComponents.join(", ") : `ALL (${demandFiles} component/pattern files)`}`);
console.log("palettes: Tailwind-like public set" + (safelist.size ? `  ·  safelist: ${safelist.size}` : ""));
console.log(`\n  supply tokens : ${supplyNames.size}`);
console.log(`  reachable     : ${kept.length}`);
console.log(`  prunable      : ${pruned.length}  (${((pruned.length / supplyNames.size) * 100).toFixed(0)}% of names)`);
console.log(`\n  token CSS raw : ${fBytes.raw}  →  ${pBytes.raw}   (-${pct(pBytes.raw, fBytes.raw)}%)`);
console.log(`  token CSS gz  : ${fBytes.gz}  →  ${pBytes.gz}   (-${pct(pBytes.gz, fBytes.gz)}%)`);

if (argv.includes("--verbose")) {
  console.log(`\n  pruned names:\n${pruned.map((n) => `    ${n}`).join("\n")}`);
}

if (emitPath) {
  writeFileSync(emitPath, prunedCss);
  console.log(`\n  emitted pruned token CSS → ${relative(process.cwd(), emitPath)}`);
}
console.log();
