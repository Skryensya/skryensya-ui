/*
 * CSS-native token validator. Zero dependencies.
 *
 * The design system is now hand-authored CSS (no JSON, no Style Dictionary), so the
 * enforcement layer reads the .css files directly. It keeps the discipline that made this a
 * system instead of three folders — references resolve, tiers point the right way, modes are
 * complete, contrast holds — with a deliberately minimal regex parser. That parser is honest
 * about its scope: it only handles OUR controlled, known-shape CSS, not arbitrary stylesheets.
 * (Comments are stripped first, so prose like `--ds-density: red` inside a comment can't be
 * mistaken for a declaration.)
 *
 * Checks:
 *   1. refs-resolve     every var(--x) points at a declared custom property
 *   2. tier-direction   references point down or sideways; component never skips to a ramp
 *   3. mode-complete     base light-dark() token set == hc override set; every light-dark()
 *                        has exactly two colours; the two hc blocks don't drift
 *   4. contrast          every contrast-pairs.json pair clears its WCAG ratio, per brand
 *   5. name-shape        declared names are lowercase kebab
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CSS_DIR = "css";
const BRANDS = ["default", "dusk"];
const TIER_RANK = { primitive: 1, semantic: 2, component: 3 };

const problems = [];
const fail = (rule, where, msg) => problems.push({ rule, where, msg });

// ── parsing ─────────────────────────────────────────────────────────────────
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

function cssFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith(".css"))
    .map((f) => join(dir, f));
}

function tierOfFile(path) {
  const p = path.replace(/\\/g, "/");
  if (p.includes("/components/") || p.includes("/patterns/")) return "component";
  if (p.includes("/brands/")) return "primitive"; // ramp override
  if (p.includes("/modes/")) return "semantic"; // colour override
  if (p.endsWith("primitives.css")) return "primitive";
  if (p.endsWith("semantic.css")) return "semantic";
  return null; // barrel / unknown — contributes no declarations of interest
}

/** All `--name: value` declarations in a file (comments already stripped). */
function declarationsOf(css) {
  const out = [];
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
    out.push({ name: m[1], value: m[2].trim() });
  }
  return out;
}

const refsOf = (value) => [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]);

/** Split on top-level commas, respecting parens (so light-dark(var(a), var(b)) → 2 parts). */
function splitTopLevel(str) {
  const parts = [];
  let depth = 0, cur = "";
  for (const ch of str) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// ── load the corpus ───────────────────────────────────────────────────────
const files = cssFiles(CSS_DIR).map((path) => {
  const css = stripComments(readFileSync(path, "utf8"));
  return { path, tier: tierOfFile(path), decls: declarationsOf(css) };
});

// name → tier of the file that declares it (agreement across files is assumed; ramps in
// primitives + brands are both primitive, colours in semantic + modes both semantic).
const declaredTier = new Map();
for (const f of files) {
  if (!f.tier) continue;
  for (const d of f.decls) if (!declaredTier.has(d.name)) declaredTier.set(d.name, f.tier);
}

const fileTierOf = (path) => files.find((f) => f.path === path).tier;
const declsIn = (suffix) => files.find((f) => f.path.endsWith(suffix))?.decls ?? [];

// ── 1 + 2: refs-resolve and tier-direction ─────────────────────────────────
for (const f of files) {
  if (!f.tier) continue;
  for (const d of f.decls) {
    for (const ref of refsOf(d.value)) {
      const toTier = declaredTier.get(ref);
      if (!toTier) {
        fail("refs-resolve", d.name, `references undeclared ${ref}`);
        continue;
      }
      if (TIER_RANK[toTier] > TIER_RANK[f.tier]) {
        fail("tier-direction", d.name,
          `${f.tier} token references higher-tier ${toTier} ${ref} — references may only point down or sideways`);
      }
      if (f.tier === "component" && toTier === "primitive") {
        fail("tier-skip", d.name,
          `component hook reaches past the semantic layer into primitive ${ref} — bypasses mode switching, breaks dark mode for this component alone`);
      }
    }
  }
}

// ── 3: mode completeness ────────────────────────────────────────────────────
const baseSemantic = new Map(declsIn("semantic.css").map((d) => [d.name, d.value]));
const hcDecls = declsIn("modes/hc.css");

// every light-dark() must have exactly two colour args
for (const [name, value] of baseSemantic) {
  const ld = value.match(/light-dark\((.*)\)/);
  if (ld && splitTopLevel(ld[1]).length !== 2) {
    fail("mode-complete", name, `light-dark() must take exactly two colours, got: ${value}`);
  }
}

// the two hc blocks (attribute + prefers-contrast) must be byte-identical per token
const hcByName = new Map();
for (const d of hcDecls) {
  if (!hcByName.has(d.name)) hcByName.set(d.name, new Set());
  hcByName.get(d.name).add(d.value);
}
for (const [name, values] of hcByName) {
  if (values.size > 1) {
    fail("mode-complete", name, `high-contrast blocks disagree for ${name} — the two copies have drifted`);
  }
}

// base mode-aware (light-dark) set must equal the hc COLOUR override set
const baseModeAware = new Set([...baseSemantic].filter(([, v]) => v.includes("light-dark(")).map(([n]) => n));
const hcColorSet = new Set([...hcByName].filter(([, vs]) => [...vs][0].includes("light-dark(")).map(([n]) => n));
for (const name of baseModeAware) {
  if (!hcColorSet.has(name)) fail("mode-complete", name, `mode-aware token has no high-contrast override in modes/hc.css`);
}
for (const name of hcColorSet) {
  if (!baseModeAware.has(name)) fail("mode-complete", name, `high-contrast overrides ${name}, which is not a mode-aware base token`);
}
// non-colour hc overrides (e.g. interaction opacity/ring bumps) are allowed, but must
// target a token that actually exists in the base — you can't bump what isn't declared.
for (const name of hcByName.keys()) {
  if (!hcColorSet.has(name) && !baseSemantic.has(name)) {
    fail("mode-complete", name, `high-contrast bumps ${name}, which is not declared in semantic.css`);
  }
}

// ── 4: contrast, per brand ──────────────────────────────────────────────────
function rampMap(brand) {
  const map = new Map(declsIn("primitives.css").map((d) => [d.name, d.value]));
  if (brand !== "default") {
    for (const d of declsIn(`brands/${brand}.css`)) map.set(d.name, d.value);
  }
  return map;
}

/** Resolve a semantic colour token to a concrete oklch() literal, in a mode + brand. */
function resolveColor(name, mode, ramps) {
  const source = mode.startsWith("hc-") ? hcByName : baseSemantic;
  const raw = mode.startsWith("hc-") ? [...(source.get(name) ?? [])][0] : source.get(name);
  if (!raw) return null;
  const ld = raw.match(/light-dark\((.*)\)/);
  const pick = ld ? splitTopLevel(ld[1])[mode.endsWith("light") ? 0 : 1] : raw;
  const refMatch = pick.match(/var\(\s*(--[\w-]+)\s*\)/);
  return refMatch ? ramps.get(refMatch[1]) ?? null : pick; // ref → ramp literal, else literal
}

function checkContrast() {
  let pairs;
  try {
    pairs = JSON.parse(readFileSync("contrast-pairs.json", "utf8")).pairs;
  } catch {
    return;
  }
  for (const brand of BRANDS) {
    const ramps = rampMap(brand);
    for (const pair of pairs) {
      for (const mode of pair.modes) {
        const fg = resolveColor(pair.fg, mode, ramps);
        const bg = resolveColor(pair.bg, mode, ramps);
        if (!fg || !bg) {
          fail("contrast", `${pair.fg} on ${pair.bg}`, `[${brand}/${mode}] could not resolve to a colour`);
          continue;
        }
        const ratio = contrastRatio(fg, bg);
        if (ratio < pair.min) {
          fail("contrast", `${pair.fg} on ${pair.bg}`,
            `[${brand}/${mode}] ${ratio.toFixed(2)}:1 < required ${pair.min}:1  (${fg} on ${bg})`);
        }
      }
    }
  }
}

// ── 5: name shape ───────────────────────────────────────────────────────────
for (const [name] of declaredTier) {
  const bare = name.slice(2);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(bare)) {
    fail("name-shape", name, `must be lowercase kebab (got "${bare}")`);
  }
}

// ── OKLCH → WCAG relative luminance ─────────────────────────────────────────
function contrastRatio(a, b) {
  const la = relLuminance(a), lb = relLuminance(b);
  if (la == null || lb == null) return 21; // non-colour → pass
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
function relLuminance(color) {
  const c = parseOklch(color);
  if (!c) return null;
  const { r, g, b } = oklchToSrgb(c);
  const lin = (x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function parseOklch(str) {
  const m = String(str).match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return null;
  let L = parseFloat(m[1]);
  if (String(str).includes("%")) L /= 100;
  return { L, C: parseFloat(m[2]), H: parseFloat(m[3]) };
}
function oklchToSrgb({ L, C, H }) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr), b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const gamma = (x) => {
    const cl = Math.max(0, Math.min(1, x));
    return cl <= 0.0031308 ? 12.92 * cl : 1.055 * cl ** (1 / 2.4) - 0.055;
  };
  return { r: gamma(lr), g: gamma(lg), b: gamma(lb) };
}

// ── run ─────────────────────────────────────────────────────────────────────
checkContrast();

if (problems.length === 0) {
  console.log(`✓ lint passed — refs, tiers, modes, contrast, names clean across brands: ${BRANDS.join(", ")}`);
  process.exit(0);
}
const byRule = {};
for (const p of problems) (byRule[p.rule] ??= []).push(p);
console.error(`✗ ${problems.length} problem(s):\n`);
for (const [rule, items] of Object.entries(byRule)) {
  console.error(`  [${rule}]`);
  for (const p of items) console.error(`    ${p.where}: ${p.msg}`);
  console.error("");
}
process.exit(1);
