/*
 * Single source of truth for the header's accent-palette toggle (Base.astro's PALETTE_PRESETS) AND
 * the /presets showcase gallery. Both need the exact same {id, name, accent, tokens} shape. Base
 * to apply it onto :root, presets.astro to render it read-only inside a demo card, so it lives here
 * once and gets imported by both rather than hand-kept in sync in two places.
 *
 * Each preset carries the complete semantic accent bundle as explicit CSS values. Core publishes the
 * palettes; the docs choose which semantic tokens point at which hue.
 */
export interface PalettePreset {
  id: string;
  name: string;
  accent: string;
  tokens: Record<string, string>;
}

/*
 * The two WASH tokens (`--color-bg-accent-subtle`, `--docs-hero-bg`) sit at the palette's palest
 * and darkest steps for every chromatic hue: `blue-50`/`blue-950` land at nearly the SAME
 * lightness as the site's own achromatic surface tokens (`--color-bg-canvas`'s stone-950 is
 * 14.7% L; `blue-950` is 28.2% L — a mere ~13pt gap, closer still to `--color-bg-surface-raised`'s
 * stone-800 at 26.8% L) and it still reads as a distinct tinted panel, because HUE does the
 * separating, not lightness. `--palette-neutral-*` has zero chroma by design (see the HUES comment
 * below), so for THIS one entry lightness is the only channel left, and reusing blue's steps
 * verbatim made the wash all but disappear: `neutral-50`/`neutral-950` sit within a point of the
 * site's own stone-based canvas/surface at both ends (confirmed live — the subtle badge wash and
 * the hero band were indistinguishable from the page behind them in both color schemes). Bumped
 * two steps in from each end instead, far enough from every rung of the surface ladder (canvas →
 * surface → surface-raised) that the wash stays visible as its own gray, in either mode.
 */
function accentBundle(hue: string): Record<string, string> {
  const subtle = hue === "neutral" ? ["300", "700"] : ["50", "950"];
  const hero = hue === "neutral" ? ["400", "600"] : ["200", "950"];
  return {
    "--color-bg-accent-subtle": `light-dark(var(--palette-${hue}-${subtle[0]}), var(--palette-${hue}-${subtle[1]}))`,
    "--color-text-accent": `light-dark(var(--palette-${hue}-700), var(--palette-${hue}-300))`,
    "--color-text-link": "var(--color-text-accent)",
    "--color-border-accent": `light-dark(var(--palette-${hue}-600), var(--palette-${hue}-500))`,
    "--color-border-focus": `light-dark(var(--palette-${hue}-600), var(--palette-${hue}-400))`,
    "--color-action-accent": `light-dark(var(--palette-${hue}-600), var(--palette-${hue}-500))`,
    /* The component-page hero band (site.css's `--docs-hero-bg`, default blue) rides along with the
     * rest of the bundle: without this key it stayed blue no matter which preset was active, since
     * `--color-bg-accent-subtle`'s own `-50` leg reads as barely-there on a band this large (see that
     * variable's own comment in site.css). */
    "--docs-hero-bg": `light-dark(var(--palette-${hue}-${hero[0]}), var(--palette-${hue}-${hero[1]}))`,
  };
}

/*
 * ELEVEN presets, and the ORDER is the cycle a reader actually sees on the header toggle: this is
 * one button pressed repeatedly, so what matters is that consecutive presets look nothing alike,
 * not that the list walks the color wheel in order. Hence green → indigo → red → cyan → fuchsia
 * after the original five, rather than dropping red next to orange and cyan next to teal. The
 * showcase gallery at /presets renders this same order top-to-bottom.
 *
 * The hue choice is bounded by one thing: `--color-action-accent` takes the `-600` step, and
 * `--color-text-on-accent` is white in light mode, so a hue whose `-600` is too light gives a
 * action button unreadable text. Yellow (68.1% L) and amber (66.6%) are out for that reason; every
 * hue here sits at or below orange's 64.6%, which is the lightest one this set ships.
 *
 * `neutral` closes the cycle on purpose, not woven in among the saturated ones: every other entry
 * IS a color choice, so a reader cycling through reads them as "which hue." This one is the answer
 * to "no hue at all" — `--palette-neutral-*` is OKLCH chroma 0 (`oklch(43.9% 0 none)` at 600, the
 * same darkness class as violet/indigo, not a lighter aside), the one palette in this set that
 * carries contrast without carrying color, for a look that wants emphasis without branding it.
 * Already published for base surfaces/text (see this file's other presets); never asked to be an
 * accent before.
 */
const HUES: { id: string; hue: string; es: string; en: string }[] = [
  { id: "azul", hue: "blue", es: "Azul", en: "Blue" },
  { id: "violeta", hue: "violet", es: "Violeta", en: "Violet" },
  { id: "teal", hue: "teal", es: "Turquesa", en: "Teal" },
  { id: "rosa", hue: "pink", es: "Rosa", en: "Pink" },
  { id: "naranja", hue: "orange", es: "Naranja", en: "Orange" },
  { id: "verde", hue: "green", es: "Verde", en: "Green" },
  { id: "indigo", hue: "indigo", es: "Índigo", en: "Indigo" },
  { id: "rojo", hue: "red", es: "Rojo", en: "Red" },
  { id: "cian", hue: "cyan", es: "Cian", en: "Cyan" },
  { id: "fucsia", hue: "fuchsia", es: "Fucsia", en: "Fuchsia" },
  { id: "gris", hue: "neutral", es: "Gris", en: "Gray" },
];

export function palettePresets(locale: string): PalettePreset[] {
  return HUES.map(({ id, hue, es, en }) => ({
    id,
    name: locale === "en" ? en : es,
    accent: `var(--palette-${hue}-600)`,
    tokens: accentBundle(hue),
  }));
}
