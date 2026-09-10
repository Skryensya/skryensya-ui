import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const forbidden = "\u2014";
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
/* Skipped BY NAME, so a build output directory that is not literally called `dist` has to be named
   here too: `build-preview-heights.mjs` writes a full production build of this very site, and a
   bundle carries the em dashes of whatever prose went into it. Scanning it turns a guard about what
   we WRITE into a guard about what Vite emitted. */
const skippedDirectories = {
  ".astro": true,
  ".git": true,
  ".preview-heights-dist": true,
  ".turbo": true,
  coverage: true,
  dist: true,
  node_modules: true,
} satisfies Record<string, true>;
const checkedExtensions = {
  ".astro": true,
  ".cjs": true,
  ".cts": true,
  ".css": true,
  ".js": true,
  ".json": true,
  ".jsx": true,
  ".md": true,
  ".mdx": true,
  ".mjs": true,
  ".mts": true,
  ".scss": true,
  ".svelte": true,
  ".ts": true,
  ".tsx": true,
  ".yaml": true,
  ".yml": true,
} satisfies Record<string, true>;

const collectCheckedFiles = (dir: string): string[] => {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    if (entry in skippedDirectories) continue;

    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...collectCheckedFiles(path));
      continue;
    }

    if (stat.isFile() && extname(entry) in checkedExtensions) {
      files.push(path);
    }
  }

  return files;
};

describe("em dash guard", () => {
  it("rejects em dashes in docs and source files", () => {
    const offenders = collectCheckedFiles(repoRoot).flatMap((file) => {
      const text = readFileSync(file, "utf8");
      const lines = text.split("\n");

      return lines.flatMap((line, index) =>
        line.includes(forbidden) ? [`${relative(repoRoot, file)}:${index + 1}`] : [],
      );
    });

    expect(offenders).toEqual([]);
  });
});
