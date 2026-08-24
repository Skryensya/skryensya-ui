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

function accentBundle(hue: string): Record<string, string> {
  return {
    "--color-bg-accent-subtle": `light-dark(var(--palette-${hue}-50), var(--palette-${hue}-950))`,
    "--color-text-accent": `light-dark(var(--palette-${hue}-700), var(--palette-${hue}-300))`,
    "--color-text-link": "var(--color-text-accent)",
    "--color-border-accent": `light-dark(var(--palette-${hue}-600), var(--palette-${hue}-500))`,
    "--color-border-focus": `light-dark(var(--palette-${hue}-600), var(--palette-${hue}-400))`,
    "--color-action-accent": `light-dark(var(--palette-${hue}-600), var(--palette-${hue}-500))`,
    /* The component-page hero band (site.css's `--docs-hero-bg`, default blue) rides along with the
     * rest of the bundle: without this key it stayed blue no matter which preset was active, since
     * `--color-bg-accent-subtle`'s own `-50` leg reads as barely-there on a band this large (see that
     * variable's own comment in site.css). */
    "--docs-hero-bg": `light-dark(var(--palette-${hue}-200), var(--palette-${hue}-950))`,
  };
}

/*
 * TEN presets, and the ORDER is the cycle a reader actually sees on the header toggle: this is one
 * button pressed repeatedly, so what matters is that consecutive presets look nothing alike, not
 * that the list walks the color wheel in order. Hence green → indigo → red → cyan → fuchsia after
 * the original five, rather than dropping red next to orange and cyan next to teal. The showcase
 * gallery at /presets renders this same order top-to-bottom.
 *
 * The hue choice is bounded by one thing: `--color-action-accent` takes the `-600` step, and
 * `--color-text-on-accent` is white in light mode, so a hue whose `-600` is too light gives a
 * action button unreadable text. Yellow (68.1% L) and amber (66.6%) are out for that reason; every
 * hue here sits at or below orange's 64.6%, which is the lightest one this set ships.
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
];

export function palettePresets(locale: string): PalettePreset[] {
  return HUES.map(({ id, hue, es, en }) => ({
    id,
    name: locale === "en" ? en : es,
    accent: `var(--palette-${hue}-600)`,
    tokens: accentBundle(hue),
  }));
}
