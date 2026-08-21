import { palettes, type PaletteFamily } from "./palettes";

/*
 * The slice of Shiki's `ThemeRegistrationRaw` this module actually produces, typed locally rather
 * than imported from `shiki` — that package is `astro`'s own dependency (used inside
 * `astro:components`'s `<Code>`), not one `apps/docs` lists itself, and pulling in its types here
 * would mean depending on a package this app never installs.
 */
type ShikiTheme = {
  name: string;
  type: "light" | "dark";
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
 * EVERY PAIRING BELOW MIRRORS `_color.scss` EXACTLY: `--color-text-accent` is
 * `light-dark(var(--palette-blue-700), var(--palette-blue-300))`, so `keyword`/`definition` here read
 * `blue` at 700 (light) and 300 (dark). `plain` is deliberately absent: `code-preview.css` already
 * falls back an untokenized span to `var(--color-text-primary)` when `--shiki-light`/`--shiki-dark`
 * are unset, so Shiki needs no default-foreground entry to land there.
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

function colorFor(syntaxRole: SyntaxRole, mode: "light" | "dark"): string {
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
