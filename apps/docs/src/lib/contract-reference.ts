import type { ComponentContract } from "@skryensya/core/contract";
import manifest from "@artifacts/ai-manifest.json";
import type { Locale } from "../i18n";

/*
 * THE CONTRACT, AS THE PAGE READS IT.
 *
 * The source is `artifacts/ai-manifest.json`: the same compiled file the MCP server answers
 * `get_contract` from, not a second reading of `packages/core`. That is the whole point of routing
 * the docs through it. A reference table hand-written next to the contract drifts the moment an
 * option is renamed, and the drift is invisible: the page still renders, it just describes a
 * component that no longer exists. Here the page cannot describe an option the agent does not also
 * see, because there is one artifact and both read it.
 *
 * Imported rather than read with `fs` so the bundler resolves it at build time, which also means a
 * rebuilt artifact hot-reloads the page in dev instead of needing the server restarted.
 */

/** The five kinds, ordered loudest first. Why these words rather than Keep a Changelog's is argued
 *  in `packages/core/src/changelog.ts`, next to the tone each one wears. */
export type ChangeKind = "breaking" | "feature" | "bugfix" | "rework" | "chore";

/** One entry in one language: the headline a reader scans for, and the reasoning under it. */
export type ChangeText = {
  readonly title: string;
  /** HTML the compiler validated, so it lands as real markup rather than escaped text. */
  readonly body: string;
};

export type ChangeEntry = {
  readonly date: string;
  readonly kind: ChangeKind;
  /** An option, part or signature name. The compiler already refused any other value. */
  readonly target?: string;
  readonly es: ChangeText;
  readonly en: ChangeText;
};

/** One version and everything that shipped in it. `date` is `null` on a version that has not. */
export type Release = {
  readonly version: string;
  readonly date: string | null;
  readonly entries: readonly ChangeEntry[];
};

export type SignatureSemantics = {
  readonly useWhen?: readonly string[];
  readonly avoidWhen?: readonly string[];
  readonly alternatives?: readonly string[];
};

export type ContractDoc = ComponentContract & {
  readonly semantics: Readonly<Record<string, SignatureSemantics>>;
};

type Manifest = {
  readonly schemaVersion: string;
  readonly sourceHash: string;
  readonly contracts: Readonly<Record<string, ContractDoc>>;
  /** Keyed like `contracts`, and separate from it: a component's history is not its shape. */
  readonly changelogs: Readonly<Record<string, readonly Release[]>>;
};

const compiled = manifest as unknown as Manifest;

/**
 * The contract a page documents.
 *
 * Throws rather than returning undefined: a page that names a contract the catalogue does not
 * publish is a build-time typo, and rendering an empty reference section instead would ship a
 * component page whose API tab is silently blank.
 */
export function contractDoc(id: string): ContractDoc {
  const entry = compiled.contracts[id];
  if (!entry) {
    throw new Error(
      `No contract "${id}" in artifacts/ai-manifest.json. Published: ${Object.keys(compiled.contracts).join(", ")}.`,
    );
  }
  return entry;
}

/**
 * A component's history, by version, which the manifest keeps beside the contract rather than
 * inside it.
 *
 * Always an array. A component with nothing to report and a component that does not exist are
 * different failures, and only the second one should be loud: `contractDoc` already throws for an
 * unknown id, so by the time a page asks for its changelog the id is known good and an empty list
 * means exactly "nothing recorded yet".
 */
export function changelogFor(id: string): readonly Release[] {
  return compiled.changelogs[id] ?? [];
}

/**
 * An entry's title and body in the page's language.
 *
 * Both languages and both halves are always present; the compiler refuses an entry missing any of
 * the four, so a page never has to decide what to show in place of a missing one.
 */
export function entryText(entry: ChangeEntry, locale: Locale): ChangeText {
  return locale === "en" ? entry.en : entry.es;
}



/**
 * The contract as JSON: the artifact itself, rather than a rendering of it.
 *
 * A contract is a VALUE (decision 28), so the honest reference for one is the value. This is the
 * same object the validator, both bindings and the MCP server consume, and the same shape
 * `get_contract` answers with, so a reader here and an agent there are looking at one thing. A
 * table would be a second description of it, and a second description is a thing that can be wrong.
 *
 * `semantics` is dropped, and it is the reason this is not just the manifest entry printed whole.
 * It is not part of the contract: it is a docs overlay the compiler merges in from
 * `contracts/semantic`, and it already has its own tab. Leaving it in would make "the contract" mean
 * something different here than it means in Core. The changelog needs no dropping; the manifest
 * keeps histories in their own map (`changelogFor`), never on the contract.
 *
 * ONLY THE KEY ORDER IS OURS. The manifest canonicalizes with its keys sorted, which opens the
 * object on `css` and buries `id` between `events` and `options`: alphabetical is a fine way to
 * store a thing and a poor way to read one. Order carries no meaning in a JSON object, so
 * re-ordering costs the reader nothing and buys a document that starts by saying what it is. `rest`
 * catches every key this list does not name, so a field added to the contract later still prints.
 */
export function contractJson(contract: ContractDoc): string {
  const { semantics: _semantics, id, css, parts, events, options, signatures, ...rest } = contract;
  return JSON.stringify(
    { id, css, parts, events, options, signatures, ...rest },
    /* Drop keys the contract does not carry (a component with no events) instead of printing `null`. */
    (_key, value) => (value === undefined ? undefined : value),
    2,
  );
}
