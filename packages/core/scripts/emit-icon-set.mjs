/*
 * The shared shell every icon-set generator was copy-pasting.
 *
 * ADR-15 keeps one codegen per set, SVG/library format → IconData, because that conversion passes
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

/**
 * The generator CLI, shared by all three sets. Writes `../src/generated/set.ts` relative to the caller's
 * `dir`, or, with `--check` on argv, fails the build if the committed file is stale (so CI notices a
 * rename upstream instead of a user shipping a set with a hole).
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
  const out = buildSetSource({ map, attrs, header, resolve });
  const count = Object.keys(map).length;
  const target = join(dir, "..", "src", "generated", "set.ts");

  if (argv.includes("--check")) {
    const current = existsSync(target) ? readFileSync(target, "utf8") : "";
    if (current !== out) {
      console.error(`✗ src/generated/set.ts está desactualizado, ejecuta \`pnpm generate\``);
      process.exit(1);
    }
    console.log(`✓ ${label}: ${count} roles, generado al día`);
  } else {
    writeFileSync(target, out);
    console.log(`✓ ${label}: ${count} roles generados`);
  }
}
