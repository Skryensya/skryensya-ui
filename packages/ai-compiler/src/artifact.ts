import type { ComponentContract } from "@skryensya/core/contract";
import type { ContractSemantics } from "./overlay.js";
import type { Release, ReleaseLedger } from "./changelog.js";

/*
 * THE COMPILED ARTIFACT: what the pair of JSON files claims, and the one act that crosses the seam.
 *
 * `buildManifest` used to type its output `unknown`, so the shape of `artifacts/ai-index.json` and
 * `artifacts/ai-manifest.json` was written down nowhere and guessed everywhere. Measured before this
 * file existed: three casts in the compiler's own writer, four more in the MCP server re-deriving
 * structure out of `unknown`, eleven re-declared types across two consumers - and the MCP server's own
 * `Manifest` type was missing two of the artifact's five top-level keys, inertly, because nothing read
 * them.
 *
 * That is ADR-0013's defect ("three transcriptions of the same fact and no point at which to compare
 * them") reappearing one level up: the contract stopped being transcribed, and its SERIALISED FORM
 * started being.
 *
 * WHY HERE AND NOT IN CORE. The artifact is a contract plus two things Core deliberately does not own:
 * `semantics` (`overlay.ts`: "Core is structural, English, and names no tenant. Intent, tradeoffs and
 * Spanish aliases are product judgement") and the changelog (`changelog.ts`: "an entry is dated,
 * bilingual copy, and Core ships none"). A type naming all three together cannot live in Core without
 * contradicting both.
 *
 * WHAT THIS FILE MAY IMPORT: types, and nothing else. `apps/docs` bundles it through the exports map,
 * so a stray `node:fs` or `yaml` import here breaks the Astro build and the failure looks like a docs
 * problem rather than a compiler one.
 */

/*
 * The pieces the artifact is made of, re-exported so a consumer needs ONE specifier rather than four.
 * `ContractSemantics` and the changelog types live in the modules that read their YAML; nothing else
 * in those modules is a consumer's business, so `./artifact` is the door and they come through it.
 */
import type { vocabulary } from "./vocabulary.js";
import type { HookDetail, SignatureBindings } from "./contract-details.js";
import type { ContractCategory } from "@skryensya/core/contract";
export type { ContractSemantics } from "./overlay.js";
export type { ChangeEntry, ChangeText, Release, ReleaseLedger } from "./changelog.js";
export type { ChangeKind } from "@skryensya/core/changelog";

/** Bumped when the artifact's shape changes in a way a reader must notice. */
export const SCHEMA_VERSION = "2.3";

/**
 * One family as the manifest publishes it.
 *
 * AN INTERSECTION, NEVER A RESTATEMENT. The contract's own fields are `ComponentContract`'s, so a
 * contract that grows a field grows here with it. The moment this type spells out `options` or
 * `signatures` by hand it becomes the fourth transcription this file exists to end.
 */
export type CompiledContract = ComponentContract & {
  readonly semantics: ContractSemantics;
  /** Derived (2.1): per signature, which bindings realize it and how. */
  readonly bindings: Readonly<Record<string, SignatureBindings>>;
  /** Derived (2.1): each hook's default, declaring sheet and part, and whether a binding writes it. */
  readonly hookDetails: Readonly<Record<string, HookDetail>>;
};

/** One signature, as the index publishes it: enough to choose with, never enough to build with. */
export type CompiledIndexSignature = {
  readonly id: string;
  readonly intent: readonly string[];
  readonly host: string;
  readonly parents: readonly string[];
  /** The replacement id. ABSENT, not null, on a live signature: `canonical()` drops undefined. */
  readonly deprecated?: string;
  readonly useWhen: readonly string[];
  readonly avoidWhen: readonly string[];
  readonly alternatives: readonly string[];
};

export type CompiledIndexEntry = {
  readonly id: string;
  readonly category?: ContractCategory;
  readonly css: string;
  readonly signatures: readonly CompiledIndexSignature[];
};

/** `artifacts/ai-index.json`: the whole catalogue, compact. Discovery reads this and nothing else. */
export type CompiledIndex = {
  readonly schemaVersion: string;
  readonly sourceHash: string;
  readonly contracts: readonly CompiledIndexEntry[];
};

/** `artifacts/ai-manifest.json`: the full contracts, plus the history that is not part of them. */
export type CompiledManifest = {
  readonly schemaVersion: string;
  readonly sourceHash: string;
  readonly contracts: Readonly<Record<string, CompiledContract>>;
  /**
   * Keyed like `contracts`, always present, possibly empty. Never `undefined` for a known id - that
   * is what makes "nothing changed" distinguishable from "this component is unknown".
   */
  readonly changelogs: Readonly<Record<string, readonly Release[]>>;
  readonly releases: ReleaseLedger;
  /** What the rule operators in the contracts mean (2.1). */
  readonly vocabulary: typeof vocabulary;
};

/** The two files. They are one artifact and are never valid apart. */
export type CompiledPair = {
  readonly index: CompiledIndex;
  readonly manifest: CompiledManifest;
};

export class ArtifactError extends Error {}

const INDEX_KEYS = ["schemaVersion", "sourceHash", "contracts"] as const;
const MANIFEST_KEYS = ["schemaVersion", "sourceHash", "contracts", "changelogs", "releases", "vocabulary"] as const;

function missingKeys(value: unknown, keys: readonly string[]): readonly string[] {
  if (typeof value !== "object" || value === null) return [...keys];
  return keys.filter((key) => !(key in value));
}

function readVersion(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const version = (value as { schemaVersion?: unknown }).schemaVersion;
  return typeof version === "string" ? version : undefined;
}

/**
 * THE one assertion, guarded. Every consumer goes through here instead of casting on its own.
 *
 * It checks the three things a type cannot: that the schema version is the one this build understands,
 * that every top-level key is present, and that the two halves were built together. The last of those
 * was checked by the MCP server and by nothing else, so the docs site has been reading an unverified
 * pair since it started importing the manifest.
 *
 * ORDERING: the version is read first. A 1.0 artifact read as 2.0 produces a worse diagnostic ("key
 * missing") than the real one ("wrong schema"), and the real one names the fix.
 *
 * This is a behaviour change on a checkout that predates the check: an artifact from before
 * `SCHEMA_VERSION` was ever read now fails loudly instead of being silently mis-read. That is the
 * intent - the constant was written in 2.0 and read by nobody.
 */
export function asCompiledPair(index: unknown, manifest: unknown): CompiledPair {
  for (const [name, value] of [
    ["ai-index.json", index],
    ["ai-manifest.json", manifest],
  ] as const) {
    const version = readVersion(value);
    if (version !== SCHEMA_VERSION) {
      throw new ArtifactError(
        `${name} declares schemaVersion ${version ?? "nothing"}; this build reads ${SCHEMA_VERSION}. ` +
          "Run `pnpm --filter @skryensya/ai-compiler build`.",
      );
    }
  }

  const gaps = [
    ...missingKeys(index, INDEX_KEYS).map((key) => `ai-index.json is missing "${key}"`),
    ...missingKeys(manifest, MANIFEST_KEYS).map((key) => `ai-manifest.json is missing "${key}"`),
  ];
  if (gaps.length > 0) throw new ArtifactError(gaps.join("; "));

  const pair = { index, manifest } as CompiledPair;

  if (pair.index.sourceHash !== pair.manifest.sourceHash) {
    throw new ArtifactError(
      `ai-index.json (${pair.index.sourceHash}) and ai-manifest.json (${pair.manifest.sourceHash}) ` +
        `come from different builds. Rebuild both; serving a mismatched pair would answer two ` +
        `questions about two different catalogues.`,
    );
  }

  return pair;
}

/**
 * For a consumer that holds only the manifest.
 *
 * `apps/docs` imports the JSON through the bundler alias rather than reading it off disk (deliberately:
 * a rebuilt artifact then hot-reloads the page), so it never has the index to compare against. It gets
 * the version and key checks, and not the pair check - which is a real gap, and is why this is a
 * separate function rather than a default.
 */
export function asCompiledManifest(json: unknown): CompiledManifest {
  const version = readVersion(json);
  if (version !== SCHEMA_VERSION) {
    throw new ArtifactError(
      `ai-manifest.json declares schemaVersion ${version ?? "nothing"}; this build reads ` +
        `${SCHEMA_VERSION}. Run \`pnpm --filter @skryensya/ai-compiler build\`.`,
    );
  }

  const gaps = missingKeys(json, MANIFEST_KEYS);
  if (gaps.length > 0) {
    throw new ArtifactError(`ai-manifest.json is missing ${gaps.map((key) => `"${key}"`).join(", ")}.`);
  }

  return json as CompiledManifest;
}
