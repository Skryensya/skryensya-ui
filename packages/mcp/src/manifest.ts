import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { asCompiledPair, type CompiledIndex, type CompiledManifest } from "@skryensya/ai-compiler/artifact";

/*
 * The runtime reads ONE compiled artifact and never walks a directory of hand-written files. That is
 * the whole difference from the server this replaces: there is nothing here to keep in sync, because
 * nothing here is authored.
 *
 * Loaded once, at startup, and immutable after. Every response carries the hash it was built from,
 * so a report can be reproduced against the same artifact instead of against "whatever was on disk".
 *
 * THE SHAPE IS IMPORTED, NOT RE-DECLARED. This file used to carry its own `IndexSignature`,
 * `IndexEntry`, `CatalogueIndex` and `Manifest` - four types describing bytes written by a compiler
 * that knew them exactly. They had already drifted, inertly: the local `Manifest` named three
 * top-level keys where the artifact has five, missing `changelogs` and `releases` entirely, and
 * nothing noticed because nothing here reads them. The pair check below moved into `asCompiledPair`
 * for the same reason: it was the only check of its kind anywhere, and the docs site - reading the
 * same artifact through a bundler alias - never had it.
 */

/** Re-exported under their old names so nothing downstream has to move at once. */
export type CatalogueIndex = CompiledIndex;
export type Manifest = CompiledManifest;

const here = dirname(fileURLToPath(import.meta.url));

function artifactsDir(): string {
  return process.env.SK_ARTIFACTS ?? resolve(here, "..", "..", "..", "artifacts");
}

function read(name: string): unknown {
  const path = join(artifactsDir(), name);
  try {
    return JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch (error) {
    throw new Error(
      `Could not read ${path}. Run \`pnpm --filter @skryensya/ai-compiler build\` first; the server ` +
        `serves a compiled manifest and never falls back to reading source. (${String(error)})`,
    );
  }
}

/*
 * Version, key set and pair agreement, all checked in one place. A failure here is a startup failure
 * on purpose: a server that answers `get_contract` from a half-read artifact is worse than one that
 * does not start, because the answer looks exactly like a good one.
 */
const pair = asCompiledPair(read("ai-index.json"), read("ai-manifest.json"));

export const catalogueIndex: CompiledIndex = pair.index;
export const manifest: CompiledManifest = pair.manifest;

/** Stamped on every response, so any answer can be traced back to the artifact that produced it. */
export const provenance = {
  schemaVersion: catalogueIndex.schemaVersion,
  sourceHash: catalogueIndex.sourceHash,
} as const;
