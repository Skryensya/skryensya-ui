/*
 * Stylesheet-native token parser. Zero dependencies except Sass compilation for `.scss` source.
 * No side effects, no process.exit.
 *
 * The three tiers are authored as CSS plus Sass where CSS has no macro. Anything that wants to
 * know what the system contains reads those source stylesheets. Two things do: the validator
 * (scripts/lint.mjs) and the docs site's token reference. This module is the one parser they
 * share, if it drifts, both break, which is the point.
 *
 * It carries BOTH forms of every token, for the same reason ADR-7 needed both when Style
 * Dictionary was still here:
 *   - `value`    the authored form, `light-dark(var(--ramp-accent-600), …)`, what the docs
 *                must show, because the var() chain IS the tier architecture.
 *   - resolveColor()  the literal it collapses to in a given brand + mode, what the contrast
 *                maths needs, since luminance can't be computed from a var() name.
 *
 * The regex parser is deliberately minimal and honest about its scope: it handles OUR
 * controlled, known-shape CSS, not arbitrary stylesheets. Comments are stripped first, so
 * prose like `--sk-density: red` inside a comment can't be mistaken for a declaration.
 */

import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { compile } from "sass";

/** Package root, resolved from this file, so callers may run from any cwd. */
const PKG_ROOT = join(import.meta.dirname, "..");

export const CSS_DIR = join(PKG_ROOT, "css");
export const TIER_RANK = { primitive: 1, semantic: 2, component: 3 };

// ── primitives of the parser ────────────────────────────────────────────────

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

function sourceFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .filter((f) => (f.endsWith(".css") || f.endsWith(".scss")) && !f.split("/").at(-1).startsWith("_"))
    .map((f) => join(dir, f));
}

function readStylesheet(path) {
  return extname(path) === ".scss"
    ? compile(path, { loadPaths: [CSS_DIR], style: "expanded" }).css
    : readFileSync(path, "utf8");
}

/** Which tier a file's declarations belong to. `null` = barrel/unknown, contributes nothing. */
export function tierOfFile(path) {
  const p = path.replace(/\\/g, "/");
  if (p.includes("/components/") || p.includes("/patterns/")) return "component";
  if (p.includes("/modes/")) return "semantic"; // color override
  if (p.includes("/dimensions/")) return "semantic"; // non-color semantic override (radius, …)
  if (p.endsWith("primitives.scss")) return "primitive";
  if (p.endsWith("semantic.scss")) return "semantic";
  return null;
}

/** All `--name: value` declarations in a file (comments already stripped). */
export function declarationsOf(css) {
  const out = [];
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
    out.push({ name: m[1], value: m[2].trim() });
  }
  return out;
}

export const refsOf = (value) =>
  [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]);

/**
 * Every var() reference in a value, paired with whether that call carries a fallback. A
 * `var(--x, fallback)` remains valid when `--x` is undeclared, so the validator must not treat
 * the reference as dangling.
 */
export function varRefs(value) {
  const out = [];
  const re = /var\(\s*(--[\w-]+)/g;
  let m;
  while ((m = re.exec(value))) {
    let depth = 1,
      hasFallback = false;
    for (let i = m.index + m[0].length; i < value.length && depth > 0; i++) {
      const ch = value[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      else if (ch === "," && depth === 1) hasFallback = true;
    }
    out.push({ ref: m[1], hasFallback });
  }
  return out;
}

/** Split on top-level commas, respecting parens (so light-dark(var(a), var(b)) → 2 parts). */
export function splitTopLevel(str) {
  const parts = [];
  let depth = 0,
    cur = "";
  for (const ch of str) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// ── the corpus ──────────────────────────────────────────────────────────────

/**
 * Read every stylesheet under `cssDir` and return the parsed corpus.
 * Sass entries are compiled in memory; no generated CSS artifacts are written or required.
 * Pure from the caller's perspective: touches the filesystem, mutates nothing, throws only fs/Sass errors.
 */
export function parseTokens(cssDir = CSS_DIR) {
  const files = sourceFiles(cssDir).map((path) => {
    const css = stripComments(readStylesheet(path));
    // `css` is carried, not just `decls`: the component-ships-structure rule has to see the
    // declarations that are NOT custom properties, which is exactly what declarationsOf() drops.
    return { path, rel: relative(cssDir, path).replace(/\\/g, "/"), tier: tierOfFile(path), css, decls: declarationsOf(css) };
  });

  // name → tier of the file that declares it. Ramps and scales are primitive; colors and modes are semantic.
  const declaredTier = new Map();
  for (const f of files) {
    if (!f.tier) continue;
    for (const d of f.decls) if (!declaredTier.has(d.name)) declaredTier.set(d.name, f.tier);
  }

  const declsIn = (suffix) => files.find((f) => f.path.endsWith(suffix))?.decls ?? [];

  const baseSemantic = new Map(declsIn("semantic.scss").map((d) => [d.name, d.value]));

  // hc declares each token twice (attribute block + prefers-contrast block); collect the set
  // of distinct values per name so the validator can prove the two copies haven't drifted.
  const hcByName = new Map();
  for (const d of declsIn(join("modes", "hc.scss"))) {
    if (!hcByName.has(d.name)) hcByName.set(d.name, new Set());
    hcByName.get(d.name).add(d.value);
  }
  /** Tier-1 ramp values compiled into the primitive entrypoint. */
  function rampMap() {
    return new Map(declsIn("primitives.scss").filter((d) => d.name.startsWith("--ramp-")).map((d) => [d.name, d.value]));
  }

  /**
   * Resolve a semantic color token to a concrete oklch(), in a color mode. `ramps` carries the
   * root tier-1 declarations, so evalColor can chase `var(--ramp-…)` and `color-mix()` to a real
   * color.
   */
  function resolveColor(name, mode, ramps) {
    const isHc = mode.startsWith("hc-");
    const raw = isHc ? [...(hcByName.get(name) ?? [])][0] : baseSemantic.get(name);
    if (!raw) return null;
    const ld = raw.match(/light-dark\((.*)\)/);
    const pick = ld ? splitTopLevel(ld[1])[mode.endsWith("light") ? 0 : 1] : raw;
    return evalColor(pick, ramps);
  }

  // Flat, deduped token list, one entry per declared name, carrying the authored form.
  // This is what the docs reference renders; the resolved value is a runtime concern
  // (the density tokens are calc()/round()/max() expressions, ADR-6, so only the browser
  // knows the number).
  const tokens = [];
  const seen = new Set();
  for (const f of files) {
    if (!f.tier) continue;
    for (const d of f.decls) {
      if (seen.has(d.name)) continue;
      seen.add(d.name);
      tokens.push({
        name: d.name,
        tier: f.tier,
        value: d.value,
        refs: refsOf(d.value),
        file: f.rel,
        modeAware: d.value.includes("light-dark("),
      });
    }
  }

  return { files, tokens, declaredTier, baseSemantic, hcByName, declsIn, rampMap, resolveColor };
}

// ── OKLCH → WCAG relative luminance ─────────────────────────────────────────
// No getComputedStyle in Node, so the contrast maths is ours. Implemented once, here,
// and consumed by the validator (ADR-9/ADR-11).

export function contrastRatio(a, b) {
  const la = relLuminance(a),
    lb = relLuminance(b);
  if (la == null || lb == null) return 21; // non-color → pass
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function relLuminance(color) {
  const c = parseOklch(color);
  if (!c) return null;
  const { r, g, b } = oklchToSrgb(c);
  const lin = (x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function parseOklch(str) {
  if (str && typeof str === "object" && "L" in str) return str; // already an evaluated color
  const m = String(str).match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return null;
  let L = parseFloat(m[1]);
  if (String(str).includes("%")) L /= 100;
  return oklchLit(L, parseFloat(m[2]), parseFloat(m[3]));
}

// ── color EXPRESSION evaluator ──────────────────────────────────────────────
// The contrast maths needs a concrete color, but a token's authored form can be a var() chain,
// a named color, or a color-mix() (how a DERIVED brand, ADR-22, writes every ramp). This
// collapses all of those to an oklch() the same way the browser would, so a recipe brand is
// measured for real contrast, not waved through at 21:1 the way a var() hue would be (ADR-13).

/** An oklch value that also prints as `oklch(…)` for validator messages. */
function oklchLit(L, C, H) {
  return { L, C, H, toString: () => `oklch(${(L * 100).toFixed(2)}% ${C.toFixed(4)} ${H.toFixed(2)})` };
}

export function oklchToOklab({ L, C, H }) {
  const h = (H * Math.PI) / 180;
  return { L, a: C * Math.cos(h), b: C * Math.sin(h) };
}

function oklabToOklch({ L, a, b }) {
  const C = Math.hypot(a, b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return oklchLit(L, C, H);
}

const NAMED_COLORS = { white: [1, 0, 0], black: [0, 0, 0] };

const balancedParens = (s) => {
  let depth = 0;
  for (const ch of s) {
    if (ch === "(") depth++;
    else if (ch === ")" && --depth < 0) return false;
  }
  return depth === 0;
};

/**
 * Split one color-mix argument `COLOR [P%]` into its color and optional percentage. The percent
 * is a trailing token OUTSIDE any parens, so the `%` inside `oklch(50% …)` is never mistaken for a
 * mix weight (the exact ambiguity that makes a naive last-`%` scan wrong).
 */
function splitColorPct(arg) {
  const m = arg.match(/\s([\d.]+)%\s*$/);
  if (m) {
    const color = arg.slice(0, arg.length - m[0].length).trim();
    if (balancedParens(color)) return { color, pct: parseFloat(m[1]) };
  }
  return { color: arg.trim(), pct: null };
}

/**
 * Evaluate a color expression to a concrete oklch(), or null if it can't be resolved:
 *   - literal `oklch(…)`
 *   - `white` / `black`
 *   - `var(--x)` and `var(--x, fallback)`  (looked up in `env`, else the fallback)
 *   - `color-mix(in oklab|oklch, A [p%], B [q%])`, nested to any depth
 */
export function evalColor(expr, env, depth = 0) {
  if (expr == null || depth > 24) return null;
  expr = String(expr).trim();

  const varM = expr.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/);
  if (varM) {
    const [, ref, fallback] = varM;
    const bound = env && env.get(ref);
    return evalColor(bound ?? fallback ?? null, env, depth + 1);
  }

  if (expr.startsWith("color-mix(")) return evalMix(expr, env, depth);

  const named = NAMED_COLORS[expr.toLowerCase()];
  if (named) return oklchLit(...named);

  return parseOklch(expr);
}

function evalMix(expr, env, depth) {
  const inner = expr.slice(expr.indexOf("(") + 1, expr.lastIndexOf(")"));
  const parts = splitTopLevel(inner);
  const space = /^in\s+(oklab|oklch)\b/.exec(parts[0] ?? "");
  if (parts.length !== 3 || !space) return null;
  const a = splitColorPct(parts[1]);
  const b = splitColorPct(parts[2]);
  const ca = evalColor(a.color, env, depth + 1);
  const cb = evalColor(b.color, env, depth + 1);
  if (!ca || !cb) return null;

  // Percent normalisation, per CSS: an omitted weight is 100 − the other; both omitted → 50/50;
  // weights that don't sum to 100 are scaled (we ignore the transparency case, ramps sum to 100).
  let wa = a.pct,
    wb = b.pct;
  if (wa == null && wb == null) wa = wb = 50;
  else if (wa == null) wa = 100 - wb;
  else if (wb == null) wb = 100 - wa;
  const sum = wa + wb;
  if (sum <= 0) return null;
  const t = wb / sum; // fraction toward B

  if (space[1] === "oklch") {
    // polar interpolation: L and C linear, H by shortest arc
    let dh = cb.H - ca.H;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
    return oklchLit(ca.L + (cb.L - ca.L) * t, ca.C + (cb.C - ca.C) * t, ca.H + dh * t);
  }
  const la = oklchToOklab(ca),
    lb = oklchToOklab(cb);
  return oklabToOklch({ L: la.L + (lb.L - la.L) * t, a: la.a + (lb.a - la.a) * t, b: la.b + (lb.b - la.b) * t });
}

export function oklchToSrgb({ L, C, H }) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr),
    b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3;
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const gamma = (x) => {
    const cl = Math.max(0, Math.min(1, x));
    return cl <= 0.0031308 ? 12.92 * cl : 1.055 * cl ** (1 / 2.4) - 0.055;
  };
  return { r: gamma(lr), g: gamma(lg), b: gamma(lb) };
}
