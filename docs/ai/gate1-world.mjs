/*
 * GATE 1's WORLD, the impure shell gate1.mjs never touches itself.
 *
 * Reads every `@skryensya/{react,vanilla,core}` package.json exports map and the source file each
 * entry points at, into the plain-data World shape gate1.mjs's pure functions expect. All the fs
 * work lives here so `checkArtifacts` stays corpus-in / Problem[]-out and testable with a fake
 * World instead of the real disk.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");
const PACKAGES = {
  "@skryensya/react": "packages/react",
  "@skryensya/vanilla": "packages/vanilla",
  "@skryensya/core": "packages/core",
};

function fileFromExportEntry(entry) {
  if (typeof entry === "string") return entry;
  return entry.default ?? entry.types;
}

/**
 * Builds the World every schema in one gate1 run shares: every exports map plus every file those
 * maps point at, read once up front. Throws loudly on a missing file — a package.json export
 * pointing nowhere is a repo bug this gate should never silently swallow into "not loaded".
 *
 * @returns {import("./gate1.mjs").World}
 */
export function buildWorld() {
  const exportsByPackage = {};
  const sourceByFile = {};

  for (const [pkgName, relDir] of Object.entries(PACKAGES)) {
    const pkgJson = JSON.parse(readFileSync(join(ROOT, relDir, "package.json"), "utf8"));
    const exportsMap = pkgJson.exports ?? {};
    exportsByPackage[pkgName] = exportsMap;

    for (const [subpath, entry] of Object.entries(exportsMap)) {
      const file = fileFromExportEntry(entry);
      // Glob subpaths (e.g. "./components/*" -> "./css/components/*") name a whole directory of
      // CSS, not one importable module — nothing for a react.from/composes.from/init.from spec to
      // resolve to, since no schema names a wildcard specifier. A non-JS file (.scss, .css) is the
      // same story: it has no `export function`/`export const` for exportedNames to find, so
      // there's nothing this gate would ever check against it either.
      if (!file || subpath.includes("*") || file.includes("*")) continue;
      if (!/\.(ts|tsx|js|mjs)$/.test(file)) continue;
      const key = `${pkgName}::${file}`;
      if (key in sourceByFile) continue; // several subpaths often point at the same file
      const abs = join(ROOT, relDir, file.replace(/^\.\//, ""));
      sourceByFile[key] = readFileSync(abs, "utf8");
    }
  }

  return { exportsByPackage, sourceByFile };
}
