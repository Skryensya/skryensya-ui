import {
  asCompiledManifest,
  type ChangeEntry,
  type ChangeKind,
  type ChangeText,
  type CompiledContract,
  type ContractSemantics,
  type Release,
} from "@skryensya/ai-compiler/artifact";
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

/*
 * THE SHAPES COME FROM THE COMPILER, and they did not use to.
 *
 * This file carried its own `ChangeKind`, `ChangeText`, `ChangeEntry`, `Release`,
 * `SignatureSemantics`, `ContractDoc` and `Manifest` - seven types describing bytes written by a
 * compiler that knew them exactly, and reached through one `as unknown as`. `ChangeKind` alone was
 * declared in four places across three packages.
 *
 * `ContractDoc` keeps its name: it is what a PAGE calls the thing, and it reads better at the two
 * call sites than `CompiledContract` would.
 */
export type ContractDoc = CompiledContract;
export type { ChangeEntry, ChangeKind, ChangeText, Release };
export type SignatureSemantics = ContractSemantics;

/*
 * Checked, not asserted. `asCompiledManifest` verifies the schema version and the top-level key set,
 * so a rebuilt-but-stale artifact fails the docs BUILD with a message naming the rebuild command,
 * rather than rendering a reference table for a shape that is no longer there.
 *
 * It cannot check the pair - this side only ever holds the manifest, because it comes through the
 * bundler alias rather than off disk (deliberately: a rebuilt artifact then hot-reloads the page).
 * That gap is real and is why `asCompiledManifest` is a separate function rather than a default.
 */
const compiled = asCompiledManifest(manifest);

/** The shared release ledger, as compiled into the manifest. */
export function releaseLedger() {
  return compiled.releases;
}

/**
 * The version a reader can currently count on, from the shared ledger, NOT from any package's
 * `version` field: a contract is realized by Core, React and Vanilla together, so
 * `@skryensya/core`'s number is not the answer to "since when can I rely on this" (see
 * `contracts/changelog/releases.yaml`'s own header). While nothing is published this is
 * `<working>-dev`; once a release is cut it is that release's version.
 */
export function currentVersion(): string {
  const { working, releases } = releaseLedger();
  return releases.length > 0 ? releases[0].version : `${working}-dev`;
}

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

/** One contract's slice of a kit release, for the site-wide release notes page. */
export type KitReleaseSurface = {
  readonly id: string;
  readonly entries: readonly ChangeEntry[];
};

/** One kit version with every contract that moved in it, newest versions first. */
export type KitRelease = {
  readonly version: string;
  readonly date: string | null;
  readonly surfaces: readonly KitReleaseSurface[];
};

/**
 * Every contract changelog, folded into the shared release ledger.
 *
 * The footer version badge and `/release-notes` read this: a reader asking "what shipped in the
 * version I am on" wants the kit answer, not one component's history and not the Changelog
 * component's own doc page. Empty surfaces are dropped; versions with nothing recorded disappear.
 */
export function kitReleaseNotes(): readonly KitRelease[] {
  const byVersion = new Map<string, { date: string | null; surfaces: Map<string, ChangeEntry[]> }>();

  for (const [id, releases] of Object.entries(compiled.changelogs)) {
    for (const release of releases) {
      let bucket = byVersion.get(release.version);
      if (!bucket) {
        bucket = { date: release.date, surfaces: new Map() };
        byVersion.set(release.version, bucket);
      } else if (bucket.date === null && release.date !== null) {
        bucket.date = release.date;
      }
      const entries = bucket.surfaces.get(id) ?? [];
      entries.push(...release.entries);
      bucket.surfaces.set(id, entries);
    }
  }

  const { working, releases } = releaseLedger();
  const preferredOrder = [`${working}-dev`, ...releases.map((r) => r.version)];
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const version of preferredOrder) {
    if (byVersion.has(version) && !seen.has(version)) {
      ordered.push(version);
      seen.add(version);
    }
  }
  for (const version of byVersion.keys()) {
    if (!seen.has(version)) ordered.push(version);
  }

  return ordered.map((version) => {
    const bucket = byVersion.get(version)!;
    const surfaces = [...bucket.surfaces.entries()]
      .filter(([, entries]) => entries.length > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, entries]) => ({ id, entries }));
    return { version, date: bucket.date, surfaces };
  });
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
