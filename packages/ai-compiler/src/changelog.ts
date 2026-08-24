import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { ComponentContract } from "@skryensya/core/contract";
import { contractIds, getContract } from "./registry.js";
import { surfaceHash, targetableNames } from "./surface.js";

/*
 * WHAT CHANGED, per component, in the words a consumer reads, grouped into the version it shipped in.
 *
 * Its own directory and its own reader, next to the semantic overlay rather than inside it. The two
 * are the same shape (one YAML per contract id, reconciled against the contract) and answer
 * different questions, and the difference is time: `contracts/semantic` describes the contract as it
 * IS, is rewritten in place whenever the judgement behind it changes, and has no history. A
 * changelog is append-only and every line of it is dated. Folding one into the other would make a
 * file where half the keys may be edited freely and the other half must never be, which is exactly
 * the distinction a reader cannot see.
 *
 * Not in Core either, for the reason `overlay.ts` gives: an entry is dated, bilingual copy, and Core
 * ships none. What keeps it honest instead of diff proximity is `surface`, below.
 *
 * ── VERSIONS ────────────────────────────────────────────────────────────────
 * A DATE IS WHEN SOMETHING WAS WRITTEN; A VERSION IS WHEN A CONSUMER COULD HAVE IT. Those are not
 * the same fact, and only the second one answers the question a reader of a changelog is actually
 * asking, which is "do I have this yet". So entries stay dated, and the dates are what SORT them
 * into releases, but what a reader sees is the version.
 *
 * The releases live in ONE file (`releases.yaml`, read by `readReleases`) rather than as a field on
 * each entry, and that is the whole design. An entry's version is derivable from its date the moment
 * the release dates are known, so writing it down per entry would be restating a derivation
 * thousands of times, and every restatement is a chance to be wrong in a way no gate can see: the
 * compiler cannot tell an unstamped entry from one that was meant to stay unstamped. With a ledger
 * there is nothing to forget, because there is nothing to repeat. Cutting a release is one line.
 */

/*
 * The vocabulary, restated from `@skryensya/core/changelog` rather than imported, for the reason the
 * file header gives: this is a build tool and Core must not depend on it, so the dependency cannot
 * run the other way either without making the two modules circular at the package level. They agree
 * because there is one vocabulary and this reader is what refuses anything outside it.
 *
 * Ordered loudest first, same as Core's. Why these five and not Keep a Changelog's is argued there.
 */
export const CHANGE_KINDS = ["breaking", "feature", "bugfix", "rework", "chore"] as const;

export type ChangeKind = (typeof CHANGE_KINDS)[number];

/**
 * One entry in one language: the change as a HEADLINE and the change EXPLAINED.
 *
 * They are two fields because they are read by two different people, or by the same person twice. A
 * reader scanning a release wants the list of what moved and nothing else; a reader who stopped on
 * one of them wants the reasoning. Written as a single blob, the first reader has to read the second
 * reader's paragraph to find out whether they care, which is what the entries used to be, four
 * sentences deep, and why a release read as a wall.
 *
 * `title` is plain text: it lands in a heading-shaped slot and there is nothing in a headline that
 * needs markup. `body` is HTML the compiler validated, because a description says
 * `<code>collapsible</code>` constantly.
 */
export type ChangeText = {
  readonly title: string;
  readonly body: string;
};

/** One dated, consumer-facing change to a contract. */
export type ChangeEntry = {
  /** `YYYY-MM-DD`. What the entry is written with; the ledger turns it into a version. */
  readonly date: string;
  readonly kind: ChangeKind;
  /** The option, part or signature this is about, so the reference table can badge that exact row. */
  readonly target?: string;
  readonly es: ChangeText;
  readonly en: ChangeText;
};

/** One published version, as a reader meets it: a number, the day it shipped, and what was in it. */
export type Release = {
  readonly version: string;
  /** The day it shipped, or `null` for the working version, which by definition has not. */
  readonly date: string | null;
  readonly entries: readonly ChangeEntry[];
};

export type ContractChangelog = {
  /** `surfaceHash` of the contract as of the last entry. The gate compares it against the live one. */
  readonly surface: string;
  /** Newest first, working version at the top when it holds anything. Empty releases are dropped. */
  readonly releases: readonly Release[];
};

/** The one release ledger, shared by every contract. See `contracts/changelog/releases.yaml`. */
export type ReleaseLedger = {
  /**
   * The version being written now, unpublished. Unreleased entries are stamped `<working>-dev`:
   * the number it will carry, marked as not carrying it yet. That suffix is the entire answer to
   * "what do we show before there is any versioning", and it is a real answer rather than a
   * placeholder, because it says both things a reader needs, which version this is heading for,
   * and that it has not got there.
   */
  readonly working: string;
  /** Published versions, newest first. Empty until the first one is cut. */
  readonly releases: readonly { readonly version: string; readonly date: string }[];
};

export type ChangelogReadResult = {
  readonly changelog: Readonly<Record<string, ContractChangelog>>;
  readonly ledger: ReleaseLedger;
  readonly conflicts: readonly string[];
};

/** The ledger's own filename, which is therefore not a contract id. */
const LEDGER = "releases.yaml";

/** Every field an entry owes, as the path an author would fix. Named so the message can list them. */
const MISSING_TEXT = ["es.title", "es.body", "en.title", "en.body"] as const;

/**
 * One of those four, or `undefined`.
 *
 * Reached this way rather than by four hand-written conditions so the check and the error message
 * are the same list: a fifth field would otherwise be validated in one place and reported in another.
 * Deliberately untyped in the middle. This reads a parsed YAML blob, which is `unknown` until these
 * very checks have passed.
 */
function textAt(entry: ChangeEntry, path: (typeof MISSING_TEXT)[number]): string | undefined {
  const [lang, field] = path.split(".") as ["es" | "en", "title" | "body"];
  const value = (entry?.[lang] as Partial<ChangeText> | undefined)?.[field];
  return typeof value === "string" ? value : undefined;
}

const SEMVER = /^\d+\.\d+\.\d+$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Reads every changelog and holds each contract to it.
 *
 * The check that matters is the surface one: a contract whose shape moved without this file being
 * touched. Everything else here only makes sure the entries are renderable and land in a version.
 * Same policy as the overlay reader: a conflict stops the build rather than being repaired silently.
 */
export function readChangelogs(dir: string): ChangelogReadResult {
  const changelog: Record<string, ContractChangelog> = {};
  const conflicts: string[] = [];
  const ledger = readLedger(dir, conflicts);

  for (const file of listYaml(dir)) {
    const id = file.replace(/\.ya?ml$/, "");
    const contract = getContract(id);

    if (!contract) {
      conflicts.push(
        `${file}: changelog for "${id}", which no published contract declares. Either the contract is missing or the changelog outlived it.`,
      );
      continue;
    }

    const parsed = (parse(readFileSync(join(dir, file), "utf8")) ?? {}) as { entries?: ChangeEntry[]; surface?: unknown };
    changelog[id] = readOne(file, contract, parsed, ledger, conflicts);
  }

  for (const id of contractIds()) {
    if (changelog[id]) continue;
    conflicts.push(
      `contract "${id}" has no changelog in ${dir}, so nothing records what its shape was. ` +
        `Run \`pnpm --filter @skryensya/ai-compiler seed\`.`,
    );
  }

  return { changelog, ledger, conflicts };
}

/**
 * The release ledger, and the rules that keep an entry's version answerable.
 *
 * Dates have to be unique because they are the boundaries: two releases on one day leave entries
 * from that day with two right answers, and the reader would see the same change filed under two
 * versions. The working version has to be unpublished for the same class of reason. A `0.1.0-dev`
 * sitting above a shipped `0.1.0` claims that what is in it is not in the version it names.
 */
function readLedger(dir: string, conflicts: string[]): ReleaseLedger {
  let parsed: Partial<ReleaseLedger> = {};

  try {
    parsed = (parse(readFileSync(join(dir, LEDGER), "utf8")) ?? {}) as Partial<ReleaseLedger>;
  } catch {
    conflicts.push(
      `${LEDGER} is missing from ${dir}, so nothing says which version any entry shipped in. ` +
        `It holds \`working\` and a \`releases\` list; an empty list is valid and means nothing is published yet.`,
    );
    return { working: "0.0.0", releases: [] };
  }

  /*
   * `String()` on every version, for the reason the surface hash needs it one function down: YAML
   * reads an unquoted `1.0` as the NUMBER 1, and a version that loses its patch digit on the way in
   * would never match the one written in the file it came from.
   */
  const working = String(parsed.working ?? "");
  if (!SEMVER.test(working)) {
    conflicts.push(
      `${LEDGER}: \`working\` is ${parsed.working ?? "missing"}, which is not an x.y.z version. ` +
        `It is the version being written now; unreleased entries are shown as \`<working>-dev\`.`,
    );
  }

  const releases: { version: string; date: string }[] = [];
  const seenVersion = new Set<string>();
  const seenDate = new Set<string>();

  for (const [index, release] of (parsed.releases ?? []).entries()) {
    const where = `${LEDGER}: releases[${index}]`;
    const version = String(release?.version ?? "");
    const date = String(release?.date ?? "");

    if (!SEMVER.test(version)) {
      conflicts.push(`${where} has version "${version}", which is not an x.y.z version.`);
      continue;
    }
    if (!DAY.test(date)) {
      conflicts.push(`${where} (${version}) has no \`date\`, or one that is not YYYY-MM-DD.`);
      continue;
    }
    if (seenVersion.has(version)) {
      conflicts.push(`${where}: version ${version} is listed twice.`);
      continue;
    }
    if (seenDate.has(date)) {
      conflicts.push(
        `${where}: ${version} shipped on ${date} and so did another release. Two releases on one ` +
          `day leave every entry from that day with two versions, and the reader sees the same ` +
          `change filed under both.`,
      );
      continue;
    }
    if (version === working) {
      conflicts.push(
        `${where}: ${version} is published AND is the working version, so unpublished entries ` +
          `would be shown as ${version}-dev above the shipped ${version}. Bump \`working\`.`,
      );
      continue;
    }

    seenVersion.add(version);
    seenDate.add(date);
    releases.push({ version, date });
  }

  /* Newest first, decided here so the docs and the agent cannot disagree about the order. */
  return { working, releases: releases.sort((a, b) => b.date.localeCompare(a.date)) };
}

function readOne(
  file: string,
  contract: ComponentContract,
  parsed: { entries?: ChangeEntry[]; surface?: unknown },
  ledger: ReleaseLedger,
  conflicts: string[],
): ContractChangelog {
  const expected = surfaceHash(contract);
  const entries: ChangeEntry[] = [];
  const targets = targetableNames(contract);

  for (const [index, entry] of (parsed.entries ?? []).entries()) {
    const where = `${file}: entries[${index}]`;

    if (!DAY.test(entry?.date ?? "")) {
      conflicts.push(`${where} has no \`date\`, or one that is not YYYY-MM-DD.`);
      continue;
    }
    if (!CHANGE_KINDS.includes(entry.kind)) {
      conflicts.push(`${where} has kind "${entry.kind}". One of: ${CHANGE_KINDS.join(", ")}.`);
      continue;
    }
    /*
     * Both languages, and both HALVES of both languages. The site renders every locale from this one
     * source, so a one-language entry publishes a page that silently falls back to the other; and an
     * entry with a body but no title publishes a release whose scan line is blank, which is the one
     * thing splitting the text in two was meant to prevent.
     */
    const missing = MISSING_TEXT.filter((path) => !textAt(entry, path)?.trim());
    if (missing.length > 0) {
      conflicts.push(
        `${where} is missing ${missing.map((m) => `\`${m}\``).join(", ")}. An entry is a title and a ` +
          `body in each language: the title is what a reader scans a release for, the body is why ` +
          `they stopped on it.`,
      );
      continue;
    }
    if (entry.target !== undefined && !targets.has(entry.target)) {
      conflicts.push(
        `${where} points at "${entry.target}", which contract "${contract.id}" declares as no ` +
          `option, part or signature. The reference table would badge a row that does not exist.`,
      );
      continue;
    }

    entries.push({
      date: entry.date,
      kind: entry.kind,
      target: entry.target,
      es: { title: entry.es.title, body: entry.es.body },
      en: { title: entry.en.title, body: entry.en.body },
    });
  }

  /*
   * The gate. A surface that no longer matches means someone renamed an option, moved a default or
   * changed what a slot accepts, and the only thing between that and a consumer finding out by
   * breakage is this file. The message carries the new hash because the fix is to write the entry
   * and paste it; making the author compute it themselves is how a gate turns into a chore.
   */
  /*
   * `String()`, because a hash is 16 hex characters and roughly one in four thousand of those is
   * all digits: unquoted, YAML hands that back as a NUMBER, and `1234567890123456` would never
   * equal its own string no matter how many times someone pasted it. Quoted is what the seeder
   * writes and what the message asks for; this is what makes a hand-edited file agree anyway.
   */
  if (String(parsed.surface ?? "") !== expected) {
    conflicts.push(
      `${file}: the contract's surface is ${expected} and \`surface\` says ${parsed.surface ?? "nothing"}. ` +
        `Something a consumer can depend on changed. Add an entry and set \`surface: "${expected}"\`.`,
    );
  }

  return { surface: expected, releases: intoReleases(entries, ledger) };
}

/**
 * Files each entry under the version that carried it.
 *
 * ONE RULE: an entry belongs to the OLDEST release whose date reaches it. Reading the ledger from
 * the oldest end, the first release that shipped on or after the entry's day is the first one a
 * consumer could have got that change from, which is exactly what "shipped in" means. Anything past
 * the newest release date has not shipped at all and goes to the working version.
 *
 * Releases with nothing in them are dropped rather than rendered empty: this is ONE contract's
 * history, and most releases will not touch most contracts. A page listing every version the kit
 * ever cut, mostly blank, would bury the four that said something.
 */
function intoReleases(entries: readonly ChangeEntry[], ledger: ReleaseLedger): readonly Release[] {
  const oldestFirst = [...ledger.releases].reverse();
  const buckets = new Map<string, ChangeEntry[]>();

  for (const entry of entries) {
    const release = oldestFirst.find((candidate) => candidate.date >= entry.date);
    push(buckets, release?.version ?? unreleasedOf(ledger), entry);
  }

  const released = ledger.releases
    .filter((release) => buckets.has(release.version))
    .map<Release>((release) => ({
      version: release.version,
      date: release.date,
      /* Newest first inside a release too, so the order is the same fact at both scales. */
      entries: sorted(buckets.get(release.version)!),
    }));

  const unreleased = buckets.get(unreleasedOf(ledger));

  return unreleased
    ? [{ version: unreleasedOf(ledger), date: null, entries: sorted(unreleased) }, ...released]
    : released;
}

/** What the not-yet-shipped group is called. See `ReleaseLedger.working`. */
export function unreleasedOf(ledger: ReleaseLedger): string {
  return `${ledger.working}-dev`;
}

function sorted(entries: ChangeEntry[]): readonly ChangeEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}

function push(buckets: Map<string, ChangeEntry[]>, key: string, entry: ChangeEntry): void {
  const bucket = buckets.get(key);
  if (bucket) bucket.push(entry);
  else buckets.set(key, [entry]);
}

function listYaml(dir: string): readonly string[] {
  try {
    return readdirSync(dir)
      .filter((file) => /\.ya?ml$/.test(file) && file !== LEDGER)
      .sort();
  } catch {
    return [];
  }
}
