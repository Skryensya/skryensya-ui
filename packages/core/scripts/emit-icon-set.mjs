/*
 * The shared shell every icon-set generator was copy-pasting.
 *
 * ADR-19 keeps one codegen per set, SVG/library format → IconData, because that conversion passes
 * the deletion test the rejected manifest generator failed. What it does NOT ask for is three copies of
 * the SAME shell around it: the `--check`/write branch, the emitted `out` template, and (for the two
 * SVG-file sets) the `<svg>` body extraction were byte-identical across icons-phosphor and
 * icons-material, and nearly so in icons-lucide. That shell is the duplication, not the conversion.
 *
 * So the shell lives here and each set supplies only what genuinely varies: its role→vendor `map`, its
 * presentation `attrs`, its licence `header`, and a `resolve(vendorName, role) → { viewBox, body }`
 * adapter. Two SVG-file adapters (Phosphor, Material) already justify that seam; Lucide is the third,
 * data-shaped adapter proving it. `resolve` runs in the CALLER's module on purpose, `import.meta.resolve`
 * must see the set's own devDependency, which core cannot.
 *
 * The emitted output is byte-for-byte what the three hand-written generators produced, so the committed
 * `src/generated/set.ts` files and their `--check` gate keep passing unchanged.
 */

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Pull the viewBox and inner children out of one `<svg>…</svg>` asset. The binding writes the root
 * `<svg>`; the set contributes only what goes inside. Shared by every set whose library ships `.svg`
 * files rather than data (Phosphor, Material), it was identical in both.
 *
 * @param {string} svg  the raw `.svg` file contents
 * @param {string} name the vendor name, for the error messages
 * @returns {{ viewBox: string, body: string }}
 */
export function extractSvgBody(svg, name) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error(`${name}: el asset no declara viewBox`);
  const body = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();
  if (!body) throw new Error(`${name}: el asset quedó sin cuerpo`);
  return { viewBox, body };
}

/**
 * Build the `set.ts` source for one set. Pure: no fs, no process, just the string.
 *
 * @param {{
 *   map: Record<string, string>,
 *   attrs: Record<string, string>,
 *   header: string,
 *   resolve: (vendorName: string, role: string) => { viewBox: string, body: string },
 * }} config
 * @returns {string}
 */
export function buildSetSource({ map, attrs, header, resolve }) {
  const entries = Object.entries(map).map(([role, name]) => {
    const { viewBox, body } = resolve(name, role);
    return `  ${JSON.stringify(role)}: { viewBox: ${JSON.stringify(viewBox)}, attrs: ATTRS, body: ${JSON.stringify(body)} },`;
  });

  return `${header}
import type { IconData } from "@skryensya/core/icon";

const ATTRS = ${JSON.stringify(attrs)} as const;

export const generated = {
${entries.join("\n")}
} satisfies Record<string, IconData>;
`;
}

const toSvgImage = ({ viewBox, body }, attrs, color) => {
  const presentation = Object.entries(attrs)
    .map(([name, value]) => `${name}="${value === "currentColor" ? color : value}"`)
    .join(" ");
  const paintedBody = body.replaceAll("currentColor", color);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" ` +
    `viewBox="${viewBox}" style="color-scheme:light dark" ${presentation}>${paintedBody}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

/**
 * Bind the chosen set's chevrons to Carousel's native `::scroll-button()` controls. Those
 * pseudo-elements cannot contain DOM icon placeholders, so the set supplies SVG images through the
 * component's styling hooks. System colors keep the isolated SVG images legible in every mode and
 * forced colors without moving vendor geometry into Core.
 *
 * @param {{
 *   label: string,
 *   map: Record<string, string>,
 *   attrs: Record<string, string>,
 *   resolve: (vendorName: string, role: string) => { viewBox: string, body: string },
 * }} config
 * @returns {string}
 */
export function buildCarouselIconCss({ label, map, attrs, resolve }) {
  const resolveRole = (role) => {
    const vendorName = map[role];
    if (!vendorName) throw new Error(`${label}: falta el rol obligatorio "${role}"`);
    return resolve(vendorName, role);
  };
  const previous = resolveRole("chevron-left");
  const next = resolveRole("chevron-right");

  return `/*
 * GENERADO por scripts/generate.mjs, no editar a mano.
 *
 * ${label} enlaza sus chevrones con los scroll buttons nativos de Carousel.
 */
@layer overrides {
  .sk-carousel {
    --sk-carousel-native-previous-icon: ${toSvgImage(previous, attrs, "CanvasText")};
    --sk-carousel-native-next-icon: ${toSvgImage(next, attrs, "CanvasText")};
    --sk-carousel-native-previous-disabled-icon: ${toSvgImage(previous, attrs, "GrayText")};
    --sk-carousel-native-next-disabled-icon: ${toSvgImage(next, attrs, "GrayText")};
  }
}
`;
}

/**
 * The generator CLI shared by all three sets. Writes the stable role data plus the native Carousel
 * CSS adapter relative to the caller's `dir`. With `--check`, it fails if either committed artifact
 * is stale, so CI catches an upstream rename before a user ships a set with a hole.
 *
 * @param {{
 *   dir: string,          // import.meta.dirname of the calling generate.mjs
 *   label: string,        // "lucide" | "phosphor" | "material", for the log line
 *   map: Record<string, string>,
 *   attrs: Record<string, string>,
 *   header: string,
 *   resolve: (vendorName: string, role: string) => { viewBox: string, body: string },
 *   argv?: string[],
 * }} config
 */
export function generateIconSet({ dir, label, map, attrs, header, resolve, argv = process.argv }) {
  const setOut = buildSetSource({ map, attrs, header, resolve });
  const carouselOut = buildCarouselIconCss({ label, map, attrs, resolve });
  const count = Object.keys(map).length;
  const setTarget = join(dir, "..", "src", "generated", "set.ts");
  const carouselTarget = join(dir, "..", "src", "carousel.css");

  if (argv.includes("--check")) {
    const stale = [
      [setTarget, setOut],
      [carouselTarget, carouselOut],
    ].filter(([target, out]) => !existsSync(target) || readFileSync(target, "utf8") !== out);

    if (stale.length > 0) {
      const files = stale.map(([target]) =>
        target.endsWith("set.ts") ? "src/generated/set.ts" : "src/carousel.css",
      );
      console.error(`✗ ${files.join(", ")} desactualizados, ejecuta \`pnpm generate\``);
      process.exit(1);
    }
    console.log(`✓ ${label}: ${count} roles y adapter de Carousel al día`);
  } else {
    writeFileSync(setTarget, setOut);
    writeFileSync(carouselTarget, carouselOut);
    console.log(`✓ ${label}: ${count} roles y adapter de Carousel generados`);
  }
}
