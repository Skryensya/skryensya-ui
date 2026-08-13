import { createRamp, defaultRampColors, type RampRole } from "./ramps";

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
 * THE SAME PALETTE THE PLAYGROUND ALREADY USES, computed the same way `ramps.ts` computes every
 * other derived color on this site: `createRamp` re-runs the exact `color-mix(in oklab, …)` recipe
 * `_ramps.scss` compiles, in Node, from the same `defaultRampColors` seeds — not a second, hand-typed
 * palette that can drift from the tokens.
 *
 * WHY THIS EXISTS. `CodeBlock.astro` highlights with Shiki, `Playground.tsx` highlights with
 * Sandpack's CodeMirror — two different engines, and until now two different PALETTES: Shiki ran the
 * stock `github-light`/`github-dark` themes, Sandpack's `readSandpackTheme` resolves the kit's own
 * `--color-text-*` tokens live in the browser. A reader moving from a docs code block to the same
 * example in the Playground saw the SAME code recolored. Shiki runs at BUILD TIME with no browser to
 * resolve `light-dark()`/`color-mix()` against, so it cannot do what `readSandpackTheme` does; this
 * module is the build-time equivalent — the same role → ramp-stop pairing `_color.scss` compiles,
 * walked here instead of in a browser.
 *
 * EVERY PAIRING BELOW MIRRORS `_color.scss` EXACTLY: `--color-text-accent` is
 * `light-dark(var(--ramp-accent-700), var(--ramp-accent-300))`, so `keyword`/`definition` here read
 * `accent` at 700 (light) and 300 (dark), and so on for every role. `plain` is deliberately absent:
 * `code-preview.css` already falls back an untokenized span to `var(--color-text-primary)` when
 * `--shiki-light`/`--shiki-dark` are unset, so Shiki needs no default-foreground entry to land there.
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

const ROLE_STOPS: Record<SyntaxRole, { role: RampRole; light: number; dark: number }> = {
  comment: { role: "neutral", light: 600, dark: 400 },
  keyword: { role: "accent", light: 700, dark: 300 },
  tag: { role: "danger", light: 700, dark: 300 },
  punctuation: { role: "neutral", light: 700, dark: 300 },
  definition: { role: "accent", light: 700, dark: 300 },
  property: { role: "info", light: 700, dark: 300 },
  static: { role: "warning", light: 800, dark: 300 },
  string: { role: "success", light: 700, dark: 300 },
};

const rampRoles = [...new Set(Object.values(ROLE_STOPS).map((entry) => entry.role))];
const ramps = Object.fromEntries(
  rampRoles.map((role) => [role, createRamp(role, defaultRampColors[role])]),
) as Record<RampRole, Record<string, string>>;

function colorFor(syntaxRole: SyntaxRole, mode: "light" | "dark"): string {
  const { role, light, dark } = ROLE_STOPS[syntaxRole];
  return ramps[role][`--ramp-${role}-${mode === "light" ? light : dark}`];
}

/*
 * SCOPE GROUPS, not a scope-for-scope port of `github-light`/`github-dark`. Sandpack's own theme
 * only ever distinguishes these eight roles (`SYNTAX_COLOR_TOKENS` in `Playground.tsx`); a Shiki
 * theme with fifty finely-graded scopes would look MORE varied than the Playground, not the same.
 * Matching the Playground's own granularity here is what makes the two read as one palette.
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
