import { createHash } from "node:crypto";
import type { ComponentContract } from "@skryensya/core/contract";
import { contracts } from "./registry.js";
import { readOverlays, type ContractSemantics } from "./overlay.js";

/*
 * The compiled artifact. Two files, because they answer two questions and an agent should not pay
 * for the second to ask the first:
 *
 *   ai-index.json     the whole catalogue, compact — every family, every signature, what it is for
 *                     and when not to use it. There is no ranker (decision 31); this IS discovery.
 *   ai-manifest.json  the full contracts, for the signatures an agent actually picked.
 *
 * Deterministic by construction: keys sorted, no timestamps. A build that stamped the clock could
 * never satisfy "same input, same bytes", and without that the hash means nothing.
 */

export const SCHEMA_VERSION = "2.0";

export type ManifestBuild = {
  readonly index: unknown;
  readonly manifest: unknown;
  readonly conflicts: readonly string[];
  readonly sourceHash: string;
};

export function buildManifest(overlayDir: string): ManifestBuild {
  const { semantics, conflicts } = readOverlays(overlayDir);

  const index = {
    schemaVersion: SCHEMA_VERSION,
    contracts: Object.entries(contracts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, contract]) => indexEntry(id, contract, semantics[id] ?? {})),
  };

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    contracts: Object.fromEntries(
      Object.entries(contracts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, contract]) => [id, manifestEntry(contract, semantics[id] ?? {})]),
    ),
  };

  return { index, manifest, conflicts, sourceHash: hash([index, manifest]) };
}

function indexEntry(id: string, contract: ComponentContract, semantics: ContractSemantics) {
  return {
    id,
    css: contract.css,
    signatures: Object.entries(contract.signatures).map(([name, signature]) => ({
      id: name,
      intent: signature.intent,
      host: signature.host.element,
      parents: signature.parents ?? [],
      deprecated: signature.deprecated?.replacement,
      useWhen: semantics[name]?.useWhen ?? [],
      avoidWhen: semantics[name]?.avoidWhen ?? [],
      alternatives: semantics[name]?.alternatives ?? [],
    })),
  };
}

function manifestEntry(contract: ComponentContract, semantics: ContractSemantics) {
  return { ...contract, semantics };
}

/** Content hash over the canonical form, so the same sources always produce the same id. */
function hash(value: unknown): string {
  return createHash("sha256").update(canonical(value)).digest("hex").slice(0, 16);
}

export function canonical(value: unknown): string {
  return JSON.stringify(sortDeep(value), undefined, 2) + "\n";
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value === null || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => [key, sortDeep(entry)]),
  );
}
