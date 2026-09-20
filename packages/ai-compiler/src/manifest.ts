import { createHash } from "node:crypto";
import type { ComponentContract } from "@skryensya/core/contract";
import { contracts } from "@skryensya/core/registry";
import { isPausedFamily } from "@skryensya/core/paused";
import { SCHEMA_VERSION, type CompiledIndex, type CompiledManifest } from "./artifact.js";
import { readOverlays, type ContractSemantics } from "./overlay.js";
import { readChangelogs, type ContractChangelog, type ReleaseLedger } from "./changelog.js";
import { bindingsOf, hookDetailsOf } from "./contract-details.js";
import { vocabulary } from "./vocabulary.js";

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

export { SCHEMA_VERSION } from "./artifact.js";

export type ManifestBuild = {
  readonly index: CompiledIndex;
  readonly manifest: CompiledManifest;
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

  /*
   * A PAUSED FAMILY LEAVES THE CATALOGUE, NOT THE MANIFEST, and the direction of that asymmetry is
   * the whole point.
   *
   * `ai-index.json` is DISCOVERY: it is the kit recommending families to an agent that is choosing
   * what to build with, and a family the kit has set aside should not be recommended while it is.
   * `ai-manifest.json` is REFERENCE: what this family is, for someone who already has its id.
   * Dropping it from both broke the one thing pausing promised to keep, because the component's own
   * docs page reads its contract from the manifest by id: `/components/data-grid` stopped rendering
   * at build time, on a page that was supposed to stay exactly where it was. Found by the first
   * `astro build` after the pause, not by `astro check`, which does not render pages.
   *
   * INDEX WITHOUT MANIFEST WOULD BE THE BROKEN ORDER: the catalogue would offer an id that
   * `get_contract` then refuses. Manifest without index is a family nothing advertises and anyone
   * holding its name can still read, which is what "set aside" means.
   */
  const published = Object.entries(contracts)
    .filter(([id]) => !isPausedFamily(id))
    .sort(([a], [b]) => a.localeCompare(b));
  const described = Object.entries(contracts).sort(([a], [b]) => a.localeCompare(b));

  const index = {
    schemaVersion: SCHEMA_VERSION,
    contracts: published.map(([id, contract]) => indexEntry(id, contract, semantics[id] ?? {})),
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
    vocabulary,
    contracts: Object.fromEntries(
      described.map(([id, contract]) => [id, manifestEntry(contract, semantics[id] ?? {})]),
    ),
    changelogs: Object.fromEntries(described.map(([id]) => [id, changes.changelog[id]?.releases ?? []])),
  };

  /*
   * THE HASH IS TAKEN OVER THE BARE VALUES, then spliced into both halves.
   *
   * That order is the whole reason this used to leak. The builder returned `index` and `manifest`
   * WITHOUT `sourceHash`, so what it handed back was not the artifact - it was the artifact minus one
   * field - and `cli.ts` completed it on the way to disk. `unknown` was an accurate description of
   * that, not laziness: there was no type that was true of the returned value.
   *
   * Completing it here makes the returned value the artifact, which is what lets it be typed at all.
   * The bytes do not move: the hash is still computed before the splice, and `canonical()` sorts keys.
   */
  const sourceHash = hash([index, manifest]);

  return {
    index: { ...index, sourceHash },
    manifest: { ...manifest, sourceHash },
    conflicts: [...conflicts, ...changes.conflicts],
    sourceHash,
  };
}

function indexEntry(id: string, contract: ComponentContract, semantics: ContractSemantics) {
  return {
    id,
    category: contract.category,
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
  return { ...contract, semantics, bindings: bindingsOf(contract), hookDetails: hookDetailsOf(contract) };
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
