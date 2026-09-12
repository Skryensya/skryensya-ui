import { createHash } from "node:crypto";
import type { ComponentContract } from "@skryensya/core/contract";
import { contracts } from "@skryensya/core/registry";
import { readOverlays, type ContractSemantics } from "./overlay.js";
import { readChangelogs, type ContractChangelog, type ReleaseLedger } from "./changelog.js";

/*
 * The compiled artifact. Two files, because they answer two questions and an agent should not pay
 * for the second to ask the first:
 *
 *   ai-index.json     the whole catalogue, compact: every family, every signature, what it is for
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

/**
 * `changelogDir` is separate because the two sources are separate (see `changelog.ts`). It is
 * optional so the reconciliation tests can exercise the overlay half against a synthetic directory
 * without also having to fabricate a changelog for all 63 contracts; the CLI always passes it, and
 * `changelog.test.ts` covers this half on its own.
 */
export function buildManifest(overlayDir: string, changelogDir?: string): ManifestBuild {
  const { semantics, conflicts } = readOverlays(overlayDir);
  const changes = changelogDir
    ? readChangelogs(changelogDir)
    : {
        changelog: {} as Record<string, ContractChangelog>,
        ledger: { working: "0.0.0", releases: [] } as ReleaseLedger,
        conflicts: [],
      };

  const index = {
    schemaVersion: SCHEMA_VERSION,
    contracts: Object.entries(contracts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, contract]) => indexEntry(id, contract, semantics[id] ?? {})),
  };

  /*
   * TWO MAPS, NOT ONE. A contract is what a component IS; a changelog is what happened to it. They
   * were one object here, so `get_contract` handed an agent a component's history along with its
   * shape, the reference page's JSON view opened on twenty-two lines of changelog before saying
   * which component it described, and a contract's serialised form changed every time someone wrote
   * a note about it while the component itself had not moved.
   *
   * Keyed the same way, so the pairing is still one lookup, and every id appears in both maps even
   * with nothing to report: a caller reads `changelogs[id]` and gets an array, never `undefined`,
   * which is the difference between "nothing changed" and "this component is unknown".
   *
   * A changelog is a list of RELEASES, each holding its entries, because the question an agent asks
   * of a history is which version it can depend on something from. `releases` beside them is the
   * timeline those versions come from, written once rather than restated in sixty-four histories.
   */
  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    releases: changes.ledger,
    contracts: Object.fromEntries(
      Object.entries(contracts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, contract]) => [id, manifestEntry(contract, semantics[id] ?? {})]),
    ),
    changelogs: Object.fromEntries(
      Object.entries(contracts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id]) => [id, changes.changelog[id]?.releases ?? []]),
    ),
  };

  return {
    index,
    manifest,
    conflicts: [...conflicts, ...changes.conflicts],
    sourceHash: hash([index, manifest]),
  };
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

/*
 * `semantics` stays folded in and `changelog` no longer is, and the line between them is what each
 * one describes. Semantics say when to reach for a signature and what to reach for instead: they
 * describe the contract as it stands, so they belong to it. A changelog describes the contract's
 * past, which is a different subject that happens to share a key.
 */
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
