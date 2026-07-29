import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * The runtime reads ONE compiled artifact and never walks a directory of hand-written files. That is
 * the whole difference from the server this replaces: there is nothing here to keep in sync, because
 * nothing here is authored.
 *
 * Loaded once, at startup, and immutable after. Every response carries the hash it was built from,
 * so a report can be reproduced against the same artifact instead of against "whatever was on disk".
 */

export type IndexSignature = {
  readonly id: string;
  readonly intent: readonly string[];
  readonly host: string;
  readonly parents: readonly string[];
  readonly deprecated?: string;
  readonly useWhen: readonly string[];
  readonly avoidWhen: readonly string[];
  readonly alternatives: readonly string[];
};

export type IndexEntry = {
  readonly id: string;
  readonly css: string;
  readonly signatures: readonly IndexSignature[];
};

export type CatalogueIndex = {
  readonly schemaVersion: string;
  readonly sourceHash: string;
  readonly contracts: readonly IndexEntry[];
};

export type Manifest = {
  readonly schemaVersion: string;
  readonly sourceHash: string;
  readonly contracts: Readonly<Record<string, Record<string, unknown>>>;
};

const here = dirname(fileURLToPath(import.meta.url));

function artifactsDir(): string {
  return process.env.SK_ARTIFACTS ?? resolve(here, "..", "..", "..", "artifacts");
}

function read<T>(name: string): T {
  const path = join(artifactsDir(), name);
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (error) {
    throw new Error(
      `Could not read ${path}. Run \`pnpm --filter @skryensya/ai-compiler build\` first; the server ` +
        `serves a compiled manifest and never falls back to reading source. (${String(error)})`,
    );
  }
}

export const catalogueIndex: CatalogueIndex = read("ai-index.json");
export const manifest: Manifest = read("ai-manifest.json");

if (catalogueIndex.sourceHash !== manifest.sourceHash) {
  throw new Error(
    `ai-index.json (${catalogueIndex.sourceHash}) and ai-manifest.json (${manifest.sourceHash}) come ` +
      `from different builds. Rebuild both; serving a mismatched pair would answer two questions ` +
      `about two different catalogues.`,
  );
}

/** Stamped on every response, so any answer can be traced back to the artifact that produced it. */
export const provenance = {
  schemaVersion: catalogueIndex.schemaVersion,
  sourceHash: catalogueIndex.sourceHash,
} as const;
