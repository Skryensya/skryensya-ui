/*
 * The parsed token corpus, for any page that needs it at build time.
 *
 * The css/ folder is located through the package's EXPORTS MAP, the same contract the site
 * documents (ADR-19), rather than through parse.ts's own file location. The parser defaults
 * to guessing its directory from import.meta.dirname, which is right when the validator runs it
 * from inside the package and wrong the moment a bundler inlines it into a chunk elsewhere.
 * Asking the resolver is true in both worlds, and it finds the Sass bundle by the exact route a
 * real consumer would.
 */
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { parseTokens, type Token } from "@skryensya/core/parse";

export type { Token };

const require = createRequire(import.meta.url);
export const CSS_DIR = dirname(require.resolve("@skryensya/core/tokens.scss"));

const corpus = parseTokens(CSS_DIR);

export const tokens: Token[] = corpus.tokens;
export const byName = new Map(tokens.map((t) => [t.name, t] as const));

/** Tier 3 is element-scoped, never on :root (ADR-19): its styling hooks need an element to exist in. */
export const PROBES: Record<string, string> = {
  "components/badge.css": "sk-badge",
  "components/button.css": "sk-button",
  "components/form-field.css": "sk-form-field",
  "components/input.css": "sk-input",
  "components/details.css": "sk-details",
  "components/navbar.css": "sk-navbar",
  "components/pagination.css": "sk-pagination",
  "patterns/nav-list.css": "sk-nav-list",
  "patterns/state-layer.css": "sk-interactive",
  "patterns/scrollbar.css": "sk-scrollbar",
  "components/sidebar.css": "sk-sidebar",
  "components/table.css": "sk-table",
};

/**
 * Follow an alias chain down to the first real literal.
 * A styling hook authored as `var(--color-action-neutral)` says nothing about its own type, the
 * type lives at the bottom of the chain. That indirection is what the tier system is made of, so
 * anything reasoning about a token's type has to walk it. A fallback is itself a valid literal
 * source when the referenced property is optional.
 */
export function literalOf(value: string, depth = 0): string {
  const trimmed = value.trim();
  const alias = trimmed.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (alias) {
    const next = byName.get(alias[1]);
    return next && depth < 10 ? literalOf(next.value, depth + 1) : trimmed;
  }

  const withFallback = trimmed.match(/^var\(\s*(--[\w-]+)\s*,([\s\S]+)\)$/);
  if (withFallback) {
    const next = byName.get(withFallback[1]);
    const chosen = next ? next.value : withFallback[2];
    return depth < 10 ? literalOf(chosen, depth + 1) : chosen.trim();
  }

  return trimmed;
}

/**
 * A DOM id for a piece of token text, so a CopyButton beside it can target it directly.
 * Content-derived rather than an incrementing counter: two cells that would otherwise collide
 * always carry different source text (a file path, a token name), and a build-time counter reset
 * on every component invocation cannot tell two `<StylingHooks>` calls on the same page apart.
 */
export function slugId(...parts: string[]): string {
  return parts.join("-").replace(/[^a-zA-Z0-9_-]+/g, "-");
}

/** Which real CSS property will evaluate this token, judged from the literal it bottoms out at. */
export function probeProp(value: string): string {
  const v = literalOf(value).trim();
  if (/^(oklch|oklab|lab|lch|rgb|hsl|#|color-mix|light-dark|currentColor|transparent)/i.test(v))
    return "color";
  if (/cubic-bezier|^linear$|^ease/i.test(v)) return "transition-timing-function";
  if (/^-?[\d.]+m?s$/i.test(v)) return "transition-duration";
  // `box-shadow` composites (`--elevation-*`) open with 2-4 offset/blur/spread lengths before their
  // color, the one authored shape a plain length/size token never takes (that's a single number, at
  // most inside one `calc()`), so this has to be checked before the generic length probe below would
  // otherwise catch the first `1px` in the list and read the token back as a nonsense `width`.
  if (/^\s*(inset\s+)?(-?[\d.]+(?:px|rem|em)?\s+){2,4}(var\(|#|rgb|hsl|oklch|oklab|currentColor|transparent)/i.test(v))
    return "box-shadow";
  if (/(px|rem|em|ch|vh|vw|%)|^(calc|round|max|min|clamp)\(/i.test(v)) return "width";
  return ""; // plain numbers, font stacks, keywords, the specified value IS the value
}

/**
 * The family a token belongs to, so the reference reads as a system instead of 947 rows.
 *
 * Tier answers "which layer owns this", which is the architecture but not the shelf: every spacing
 * step, every ramp and every duration lands in the same `primitive` bucket. The family is the
 * shelf. Tiers 1 and 2 take it from the name: the prefix IS the family, and the validator keeps
 * those prefixes honest. Tier 3 takes it from the FILE, which is stronger than a prefix: a token is
 * a Button token because it is authored in button.css, and that is also what scopes it.
 */
export interface TokenGroup {
  id: string;
  label: string;
  tier: Token["tier"];
  /** Where the family is authored: shown under the heading, and the source of truth for tier 3. */
  source: string;
}

/** `date-picker` → `DatePicker`, the same name the component pages use. */
const pascal = (stem: string) =>
  stem
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

/* Ordered, most general first: the first match wins, so `--color-bg-*` is tested before `--color-*`
 * would be, and `--scale-line-height-*` joins typography rather than starting its own shelf. */
const NAME_GROUPS: { test: RegExp; id: string; label: string }[] = [
  // Tier 1
  { test: /^--palette-(slate|gray|zinc|neutral|stone)-/, id: "palette-neutral", label: "Paletas · neutrales" },
  { test: /^--palette-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-/, id: "palette-color", label: "Paletas · color" },
  { test: /^--palette-(white|black)$/, id: "palette-absolute", label: "Paletas · absolutos" },
  { test: /^--scale-space-/, id: "scale-space", label: "Escala · espaciado" },
  { test: /^--scale-(font|line-height)-/, id: "scale-type", label: "Escala · tipografía" },
  { test: /^--scale-radius-/, id: "scale-radius", label: "Escala · radios" },
  { test: /^--scale-(size|fixed)-/, id: "scale-size", label: "Escala · tamaños" },
  { test: /^--scale-(duration|easing)-/, id: "scale-motion", label: "Escala · motion" },
  { test: /^--scale-z-/, id: "scale-z", label: "Escala · z-index" },

  // Tier 2
  { test: /^--color-bg-/, id: "color-bg", label: "Color · fondo" },
  { test: /^--color-text-/, id: "color-text", label: "Color · texto" },
  { test: /^--color-border-/, id: "color-border", label: "Color · borde" },
  { test: /^--color-action-/, id: "color-action", label: "Color · acción" },
  { test: /^--(shadow|elevation)-/, id: "elevation", label: "Elevación" },
  { test: /^--space-/, id: "space", label: "Espaciado" },
  { test: /^--size-/, id: "size", label: "Tamaños" },
  { test: /^--radius-/, id: "radius", label: "Radios" },
  { test: /^--font-/, id: "font", label: "Tipografía" },
  { test: /^--motion-/, id: "motion", label: "Motion" },
  { test: /^--state-layer-/, id: "state-layer", label: "State layer" },
  { test: /^--focus-/, id: "focus", label: "Foco" },
  { test: /^--z-/, id: "z", label: "Z-index" },
  { test: /^--breakpoint-/, id: "breakpoint", label: "Breakpoints" },
  { test: /^--sk-density/, id: "density", label: "Densidad" },
];

export function groupOf(token: Token): TokenGroup {
  if (token.tier === "component") {
    const stem = (token.file.split("/").pop() ?? "").replace(/\.(css|scss)$/, "");
    return {
      id: `file:${token.file}`,
      label: pascal(stem),
      tier: token.tier,
      source: token.file,
    };
  }

  const match = NAME_GROUPS.find((g) => g.test.test(token.name));
  return {
    id: match?.id ?? `${token.tier}:otros`,
    // A token that matches nothing is a finding, not a bucket to hide it in: it gets its tier's
    // "Otros" shelf, where a new family with no home is visible instead of silently sorted.
    label: match?.label ?? "Otros",
    tier: token.tier,
    source: token.file,
  };
}

export interface GroupedTokens {
  group: TokenGroup;
  tokens: Token[];
}

const TIER_ORDER: Token["tier"][] = ["primitive", "semantic", "component"];

/**
 * Every token, shelved. Tier order first, then the authored order of the families within a tier,
 * then components alphabetically. Inside a group the corpus order is kept: it is the order the
 * scale was written in (`50 → 950`, `xs → xl`), which is the order a reader wants to compare.
 */
export const groupedTokens: GroupedTokens[] = (() => {
  const byId = new Map<string, GroupedTokens>();

  for (const token of tokens) {
    const group = groupOf(token);
    const entry = byId.get(group.id);
    if (entry) entry.tokens.push(token);
    else byId.set(group.id, { group, tokens: [token] });
  }

  /* A family with no rule ("Otros") sorts to the END of its tier rather than to the front, where a
     -1 from findIndex would put it: it is a leftover, not the headline of the tier. */
  const rank = (g: TokenGroup) => {
    const index = NAME_GROUPS.findIndex((n) => n.id === g.id);
    return index === -1 ? NAME_GROUPS.length : index;
  };

  return [...byId.values()].sort((a, b) => {
    const tier = TIER_ORDER.indexOf(a.group.tier) - TIER_ORDER.indexOf(b.group.tier);
    if (tier !== 0) return tier;
    if (a.group.tier === "component") return a.group.label.localeCompare(b.group.label);
    return rank(a.group) - rank(b.group);
  });
})();

export interface ChainNode {
  token: Token;
  /** Set when this rung is one slot of a parent's light-dark(). */
  slot?: "claro" | "oscuro";
  children: ChainNode[];
}

/**
 * The alias chain for a token, as a TREE rather than a line.
 *
 * A line would be a lie. `light-dark(var(--palette-blue-600), var(--palette-blue-300))` has two
 * parents, and following only the first draws the light-mode path while the reader may be in
 * dark mode, so the rungs' live values wouldn't match and the chain would look broken while
 * being merely wrong. Both slots are shown, labelled, and the reader can see which one their
 * current mode is using.
 */
export function chainOf(name: string, depth = 0, seen = new Set<string>()): ChainNode | null {
  const token = byName.get(name);
  if (!token || seen.has(name) || depth > 4) return null;
  seen.add(name);

  // A mode-aware token's two refs are its light and dark slots, in that order (ADR-1: light-dark()
  // takes exactly two, which the validator enforces).
  const slots: (("claro" | "oscuro") | undefined)[] =
    token.modeAware && token.refs.length === 2 ? ["claro", "oscuro"] : [];

  const children = token.refs
    .map((ref, i) => {
      const child = chainOf(ref, depth + 1, new Set(seen));
      return child && { ...child, slot: slots[i] };
    })
    .filter((c) => c !== null);

  return { token, children };
}
