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
   *  `code-preview.css`'s own `var(--shiki-light-bg, var(--color-bg-surface))` fallback never
   *  actually fires. Set explicitly here instead. */
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
 * THE BACKGROUND MIRRORS `_color.scss`'s `--color-bg-surface`: `white` in light mode and
 * `stone-900` in dark. Code is a working surface, distinct from the page canvas (`stone-100` /
 * `stone-950`) while keeping the same semantic surface treatment as the rest of the system.
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
 * here. Same lightness and hue as `blue-700`/`red-700`, with chroma pulled down to roughly
 * `sky-700`/`emerald-700`'s own band (~0.12–0.14).
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
    // Mirrors `--color-bg-surface` (`_color.scss`): white light, stone-900 dark.
    bg: mode === "light" ? "oklch(100% 0 0)" : palettes.stone[900],
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

/*
 * THE SAME EIGHT COLOURS, AS EIGHT CLASSES, because a theme this small does not need to repeat
 * itself a million times.
 *
 * Shiki writes each token's colour INLINE, as
 * `style="--shiki-light:oklch(…);--shiki-dark:oklch(…)"`. That is ~92 bytes on every token, and this
 * theme has exactly eight roles, so the built site shipped 1,135,042 spans carrying eight distinct
 * values between them: 99.7 MB, 47.7% of every byte of HTML on the site, measured across 278 pages.
 *
 * `codeTokenTransformer` below swaps that inline style for one class per role, and the rules in
 * `site.css` set the SAME two variables on the class. Nothing downstream changes, because
 * `code-preview.css` already reads `--shiki-light`/`--shiki-dark` off each span rather than off the
 * block: it cannot tell whether the variable arrived inline or from a class.
 *
 * `roleForColors` is keyed on the light value alone. The two are a pair by construction (one call to
 * `colorFor` each, same role), and one of them is enough to identify the role.
 */
export const SYNTAX_ROLES = Object.keys(ROLE_STOPS) as SyntaxRole[];

/** `keyword` -> `tk-keyword`. Exported so the stylesheet's own test can name the same classes. */
export const syntaxRoleClass = (role: SyntaxRole): string => `tk-${role}`;

/** Every role's pair, for the rules in `site.css` and the test that keeps the two in step. */
export const syntaxRoleColors: Record<SyntaxRole, { light: string; dark: string }> = Object.fromEntries(
  SYNTAX_ROLES.map((role) => [role, { light: colorFor(role, "light"), dark: colorFor(role, "dark") }]),
) as Record<SyntaxRole, { light: string; dark: string }>;

/*
 * FIRST ROLE DECLARED WINS, because two of them are the same colour: `keyword` and `definition` both
 * resolve to the blue `LIGHT_CHROMA` override, so a naive map would hand every keyword the
 * `tk-definition` class and `tk-keyword` would never appear. The rules in `site.css` still carry all
 * eight: the ROLES are the model here and their sharing a value today is incidental, so a future
 * change that pulls them apart edits one colour rather than re-deriving which class exists.
 */
const roleForLightColor = new Map<string, SyntaxRole>();
for (const role of SYNTAX_ROLES) {
  const light = colorFor(role, "light");
  if (!roleForLightColor.has(light)) roleForLightColor.set(light, role);
}

/*
 * A Shiki transformer, typed structurally for the same reason `ShikiTheme` above is: `shiki` is
 * Astro's dependency, not one this app installs.
 *
 * TOKENS THAT MATCH NO ROLE LOSE THE STYLE RATHER THAN KEEPING IT. Shiki paints an unscoped token
 * with its own built-in default (`#333333` / `#BBBBBB`), a pair that belongs to no palette in this
 * system and was never chosen. `code-preview.css` already falls back to `--color-text-primary` when
 * the variables are absent, which IS the colour those tokens were meant to be; dropping the style
 * lets that fallback fire instead of shipping Shiki's grey.
 */
type HastElement = { type: string; tagName?: string; properties?: Record<string, unknown> };

export const codeTokenTransformer = {
  name: "skryensya:token-classes",
  span(node: HastElement) {
    const style = node.properties?.style;
    if (typeof style !== "string") return;
    const light = /--shiki-light:\s*([^;]+)/.exec(style)?.[1]?.trim();
    if (!light) return;
    delete node.properties!.style;
    const role = roleForLightColor.get(light);
    if (!role) return;
    const existing = node.properties!.class;
    const className = syntaxRoleClass(role);
    node.properties!.class = typeof existing === "string" && existing ? `${existing} ${className}` : className;
  },
};
