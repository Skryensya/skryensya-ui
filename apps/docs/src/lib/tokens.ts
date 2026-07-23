/*
 * The parsed token corpus, for any page that needs it at build time.
 *
 * The css/ folder is located through the package's EXPORTS MAP, the same contract the site
 * documents (ADR-19), rather than through parse.mjs's own file location. The parser defaults
 * to guessing its directory from import.meta.dirname, which is right when the validator runs it
 * from inside the package and wrong the moment a bundler inlines it into a chunk elsewhere.
 * Asking the resolver is true in both worlds, and it finds the Sass bundle by the exact route a
 * real consumer would.
 */
import { createRequire } from "node:module";
import { dirname } from "node:path";
// @ts-expect-error, parse.mjs is plain JS with no types; the shapes are documented below.
import { parseTokens } from "@skryensya/core/parse";

export interface Token {
  name: string;
  tier: "primitive" | "semantic" | "component";
  /** The authored form, var() chain intact, this IS the tier architecture. */
  value: string;
  refs: string[];
  file: string;
  modeAware: boolean;
}

const require = createRequire(import.meta.url);
export const CSS_DIR = dirname(require.resolve("@skryensya/core/tokens.scss"));

const corpus = parseTokens(CSS_DIR);

export const tokens: Token[] = corpus.tokens;
export const byName = new Map(tokens.map((t) => [t.name, t] as const));

/** Tier 3 is element-scoped, never on :root (ADR-1): its styling hooks need an element to exist in. */
export const PROBES: Record<string, string> = {
  "components/badge.css": "ds-badge",
  "components/button.css": "ds-button",
  "components/field.css": "ds-field",
  "components/input.css": "ds-input",
  "components/details.css": "ds-details",
  "components/navbar.css": "ds-navbar",
  "components/pagination.css": "ds-pagination",
  "patterns/nav-list.css": "ds-nav-list",
  "patterns/state-layer.css": "ds-interactive",
  "patterns/scrollbar.css": "ds-scrollbar",
  "components/sidebar.css": "ds-sidebar",
  "components/table.css": "ds-table",
};

/**
 * Follow an alias chain down to the first real literal.
 * A styling hook authored as `var(--color-action-neutral)` says nothing about its own type, the
 * type lives at the bottom of the chain. That indirection is what the tier system is made of, so
 * anything reasoning about a token's type has to walk it.
 */
export function literalOf(value: string, depth = 0): string {
  const m = value.trim().match(/^var\(\s*(--[\w-]+)\s*\)$/);
  const next = m && byName.get(m[1]);
  return next && depth < 10 ? literalOf(next.value, depth + 1) : value;
}

/** Which real CSS property will evaluate this token, judged from the literal it bottoms out at. */
export function probeProp(value: string): string {
  const v = literalOf(value).trim();
  if (/^(oklch|rgb|hsl|#|color-mix|light-dark|currentColor|transparent)/i.test(v)) return "color";
  if (/cubic-bezier|^linear$|^ease/i.test(v)) return "transition-timing-function";
  if (/^-?[\d.]+m?s$/i.test(v)) return "transition-duration";
  if (/(px|rem|em|ch|vh|vw|%)|^(calc|round|max|min|clamp)\(/i.test(v)) return "width";
  return ""; // plain numbers, font stacks, keywords, the specified value IS the value
}

export interface ChainNode {
  token: Token;
  /** Set when this rung is one slot of a parent's light-dark(). */
  slot?: "claro" | "oscuro";
  children: ChainNode[];
}

/**
 * The alias chain for a token, as a TREE rather than a line.
 *
 * A line would be a lie. `light-dark(var(--ramp-accent-600), var(--ramp-accent-500))` has two
 * parents, and following only the first draws the light-mode path while the reader may be in
 * dark mode, so the rungs' live values wouldn't match and the chain would look broken while
 * being merely wrong. Both slots are shown, labelled, and the reader can see which one their
 * current mode is using.
 */
export function chainOf(name: string, depth = 0, seen = new Set<string>()): ChainNode | null {
  const token = byName.get(name);
  if (!token || seen.has(name) || depth > 4) return null;
  seen.add(name);

  // A mode-aware token's two refs are its light and dark slots, in that order (ADR-4: light-dark()
  // takes exactly two, which the validator enforces).
  const slots: (("claro" | "oscuro") | undefined)[] =
    token.modeAware && token.refs.length === 2 ? ["claro", "oscuro"] : [];

  const children = token.refs
    .map((ref, i) => {
      const child = chainOf(ref, depth + 1, new Set(seen));
      return child && { ...child, slot: slots[i] };
    })
    .filter((c): c is ChainNode => Boolean(c));

  return { token, children };
}
