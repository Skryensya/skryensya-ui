import { palettes, type PaletteFamily } from "./palettes";

/*
 * The slice of Shiki's `ThemeRegistrationRaw` this module actually produces, typed locally rather
 * than imported from `shiki`. That package is `astro`'s own dependency (used inside
 * `astro:components`'s `<Code>`), not one `apps/docs` lists itself, and pulling in its types here
 * would mean depending on a package this app never installs.
 */
type ShikiTheme = {
  name: string;
  type: "light" | "dark";
  /** The editor background. Shiki emits this as `--shiki-{light,dark}-bg`; without it, Shiki falls
   *  back to its OWN default (near-white/near-black) instead of leaving the variable unset, so
   *  `code-preview.css`'s own `var(--shiki-light-bg, var(--color-bg-surface-sunken))` fallback never
   *  actually fires  -  the block quietly painted Shiki's plain default instead of the system's sunken
   *  tone, indistinguishable from the page around it. Set explicitly here instead. */
  bg: string;
  settings: Array<{
    scope: string[];
    settings: { foreground: string };
  }>;
};

/*
 * THE DOCS CODE PALETTE mirrors the published semantic color bundle at build time. Shiki has no
 * browser to resolve `light-dark()` or CSS variables, so this file names the same palette families and
 * stops `_color.scss` uses for semantic text tokens.
 *
 * THE BACKGROUND MIRRORS `_color.scss` EXACTLY: `--color-bg-surface-sunken` is
 * `light-dark(var(--palette-stone-100), var(--palette-stone-950))`, so `bg` below reads the same
 * `stone` stops (darker `stone-200`/`-300` options were tried live and reverted  -  stays at the
 * token's own value). A code block is a well you read INTO, the same reasoning Input's own sunken
 * surface uses, not a card floating at the page's own canvas tone.
 *
 * FOREGROUND MOSTLY MIRRORS IT TOO, with one deliberate exception: `keyword`/`definition` and `tag`
 * read `_color.scss`'s own `--color-text-accent`/`--color-text-danger` FAMILY and HUE (blue, red) but
 * NOT its exact chroma. Those tokens are tuned for a single accent word or icon standing alone; a
 * whole snippet's worth of keywords painted at that same saturation (blue-700's own C0.243 against
 * sky-700's C0.134 or emerald-700's C0.118, the other roles here) reads as louder than every other
 * role by a wide margin, not merely accented  -  confirmed against a live block, not assumed. `LIGHT_
 * CHROMA` below turns down JUST those two hues, in light mode only, to the same rough chroma band the
 * rest of the roles already sit in, keeping their lightness (so the contrast against the new sunken
 * background is unchanged) and their hue (so `keyword` is still recognizably blue, `tag` still red).
 * `plain` is deliberately absent: `code-preview.css` already falls back an untokenized span to
 * `var(--color-text-primary)` when `--shiki-light`/`--shiki-dark` are unset, so Shiki needs no
 * default-foreground entry to land there.
 */
type SyntaxRole =
  | "comment"
  | "keyword"
  | "tag"
  | "punctuation"
  | "definition"
  | "property"
  | "static"
  | "string";

const ROLE_STOPS: Record<SyntaxRole, { family: PaletteFamily; light: number; dark: number }> = {
  comment: { family: "stone", light: 600, dark: 400 },
  keyword: { family: "blue", light: 700, dark: 300 },
  tag: { family: "red", light: 700, dark: 300 },
  punctuation: { family: "stone", light: 700, dark: 300 },
  definition: { family: "blue", light: 700, dark: 300 },
  property: { family: "sky", light: 700, dark: 300 },
  static: { family: "amber", light: 800, dark: 300 },
  string: { family: "emerald", light: 700, dark: 300 },
};

/**
 * Light-mode-only chroma override for the two roles that otherwise ran hotter than every other hue
 * here. Same lightness and hue as `blue-700`/`red-700` (so contrast against `--palette-stone-100`
 * and each role's own colour identity both hold), chroma pulled down to roughly `sky-700`/`emerald-
 * 700`'s own band (~0.12-0.14) instead of their own ~0.21-0.24.
 */
const LIGHT_CHROMA: Partial<Record<SyntaxRole, string>> = {
  keyword: "oklch(48.8% 0.13 264.376)",
  definition: "oklch(48.8% 0.13 264.376)",
  tag: "oklch(50.5% 0.13 27.518)",
};

function colorFor(syntaxRole: SyntaxRole, mode: "light" | "dark"): string {
  if (mode === "light" && LIGHT_CHROMA[syntaxRole]) return LIGHT_CHROMA[syntaxRole];
  const { family, light, dark } = ROLE_STOPS[syntaxRole];
  return palettes[family][mode === "light" ? light : dark];
}

/*
 * SCOPE GROUPS, not a scope-for-scope port of `github-light`/`github-dark`. The site only needs these
 * eight semantic roles; a Shiki theme with fifty finely-graded scopes would look more varied than
 * the system it belongs to, not more correct.
 */
const SCOPES: Record<SyntaxRole, string[]> = {
  comment: ["comment", "punctuation.definition.comment"],
  keyword: [
    "keyword",
    "keyword.control",
    "keyword.operator",
    "keyword.other",
    "storage",
    "storage.type",
    "storage.modifier",
    "variable.language",
  ],
  tag: ["entity.name.tag", "punctuation.definition.tag", "meta.tag"],
  punctuation: [
    "punctuation",
    "meta.brace",
    "punctuation.separator",
    "punctuation.terminator",
    "punctuation.accessor",
  ],
  definition: [
    "entity.name.function",
    "entity.name.class",
    "entity.name.type",
    "entity.other.inherited-class",
    "support.class",
    "support.function",
  ],
  property: [
    "variable.other.property",
    "variable.parameter",
    "meta.object-literal.key",
    "support.type.property-name",
    "entity.other.attribute-name",
  ],
  static: [
    "constant.numeric",
    "constant.language",
    "support.constant",
    "constant.character",
    "constant.other.color",
  ],
  string: ["string", "string.quoted", "string.template"],
};

function buildTheme(name: string, mode: "light" | "dark"): ShikiTheme {
  return {
    name,
    type: mode,
    // Mirrors `--color-bg-surface-sunken` (`_color.scss`): `stone-100` light, `stone-950` dark.
    bg: mode === "light" ? palettes.stone[100] : palettes.stone[950],
    settings: (Object.keys(SCOPES) as SyntaxRole[]).map((role) => ({
      scope: SCOPES[role],
      settings: { foreground: colorFor(role, mode) },
    })),
  };
}

/** Handed to `<Code themes={syntaxThemes}>` in place of the stock `github-light`/`github-dark`. */
export const syntaxThemes = {
  light: buildTheme("skryensya-light", "light"),
  dark: buildTheme("skryensya-dark", "dark"),
};
