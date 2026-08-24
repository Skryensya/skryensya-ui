import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { accordionContract } from "@skryensya/core/accordion";
import { readChangelogs } from "./changelog.js";
import { contractIds, getContract } from "./registry.js";
import { surfaceHash } from "./surface.js";

/*
 * The changelog is only worth reading if it cannot fall behind the contract. Everything here is
 * about that: the gate fires on a moved surface, and it does not fire on an edit a consumer cannot
 * observe.
 */

const REPO = join(import.meta.dirname, "..", "..", "..");
const CHANGELOGS = join(REPO, "contracts", "changelog");

/**
 * A changelog directory holding a file per contract, so only the case under test conflicts. The
 * ledger comes along because without it nothing can say which version an entry shipped in, and every
 * contract would conflict at once instead of the one under test.
 */
function changelogDir(overrides: Readonly<Record<string, string>> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "sk-changelog-"));
  writeFileSync(join(dir, "releases.yaml"), overrides["releases.yaml"] ?? 'working: "0.1.0"\nreleases: []\n');
  for (const id of contractIds()) {
    const body = overrides[`${id}.yaml`] ?? `surface: ${surfaceHash(getOrThrow(id))}\nentries: []\n`;
    writeFileSync(join(dir, `${id}.yaml`), body);
  }
  return dir;
}

/** The entries of one contract, flattened back out of their releases, newest first. */
function datesOf(dir: string, id: string): readonly string[] {
  return readChangelogs(dir).changelog[id]!.releases.flatMap((release) =>
    release.entries.map((entry) => entry.date),
  );
}

/**
 * The four text fields an entry owes, indented as YAML.
 *
 * A helper rather than repeated literals because every fixture below needs all four for the entry to
 * survive validation at all, and a fixture that fails for a reason other than the one under test
 * proves nothing.
 */
function text(word: string): string {
  return (
    `    es:\n      title: ${word}\n      body: ${word}\n` +
    `    en:\n      title: ${word}\n      body: ${word}\n`
  );
}

function getOrThrow(id: string) {
  const contract = getContract(id);
  if (!contract) throw new Error(`no contract ${id}`);
  return contract;
}

describe("the surface gate", () => {
  it("is clean for the changelogs this repo actually ships", () => {
    expect(readChangelogs(CHANGELOGS).conflicts).toEqual([]);
  });

  it("reports a contract whose surface moved without an edit here", () => {
    const stale = changelogDir({ "accordion.yaml": 'surface: "0000000000000000"\nentries: []\n' });

    const { conflicts } = readChangelogs(stale);

    expect(conflicts.some((c) => c.includes("accordion.yaml") && c.includes("0000000000000000"))).toBe(true);
  });

  it("names the hash to paste, so acknowledging a change is not arithmetic", () => {
    const stale = changelogDir({ "accordion.yaml": 'surface: "0000000000000000"\nentries: []\n' });

    const conflict = readChangelogs(stale).conflicts.find((c) => c.includes("accordion.yaml"))!;

    expect(conflict).toContain(surfaceHash(accordionContract));
  });

  /*
   * A hash is 16 hex characters, and about one in four thousand of those is all digits. Unquoted,
   * YAML reads that as a number, and the file could never agree with itself again no matter how
   * many times someone pasted the right value.
   */
  it("accepts a hash a hand-edited file left unquoted", () => {
    const unquoted = changelogDir({
      "accordion.yaml": `surface: ${surfaceHash(accordionContract)}\nentries: []\n`,
    });

    expect(readChangelogs(unquoted).conflicts).toEqual([]);
  });

  it("reports a contract with no changelog at all", () => {
    const dir = mkdtempSync(join(tmpdir(), "sk-changelog-"));

    const { conflicts } = readChangelogs(dir);

    expect(conflicts.some((c) => c.includes('contract "accordion" has no changelog'))).toBe(true);
  });

  /*
   * The exclusion that keeps the gate usable. `template` is how a binding REALIZES the contract, and
   * the emitter writes that markup, so a template edit reaches an author as a regenerated snippet
   * rather than as something to go fix. A gate that fired on it would fire on nearly every commit.
   */
  it("does not move when only the template does", () => {
    const before = surfaceHash(accordionContract);
    /* `as const`, because `host` is `true` and not `boolean` on a template: an object literal widens
       it, and the widened type is not a `ContractSignature`. */
    const retemplated = {
      ...accordionContract,
      signatures: {
        ...accordionContract.signatures,
        Accordion: {
          ...accordionContract.signatures.Accordion,
          template: { element: "section", part: "root", host: true, slot: "children" } as const,
        },
      },
    };

    expect(surfaceHash(retemplated)).toBe(before);
  });

  it("moves when a default flips", () => {
    const before = surfaceHash(accordionContract);
    const flipped = {
      ...accordionContract,
      options: {
        ...accordionContract.options,
        collapsible: { ...accordionContract.options.collapsible, default: false },
      },
    };

    expect(surfaceHash(flipped)).not.toBe(before);
  });
});

describe("an entry has to be renderable", () => {
  it("refuses one written in a single language", () => {
    const dir = changelogDir({
      "accordion.yaml":
        `surface: ${surfaceHash(accordionContract)}\n` +
        `entries:\n  - date: 2026-08-04\n    kind: rework\n` +
        `    es:\n      title: sólo español\n      body: sólo español\n`,
    });

    const conflict = readChangelogs(dir).conflicts.find((c) => c.includes("accordion.yaml"))!;

    expect(conflict).toContain("`en.title`");
    expect(conflict).toContain("`en.body`");
  });

  /*
   * The half that splitting the text in two introduced: a body with no title publishes a release
   * whose scan line is blank, which is the one thing the title exists to prevent.
   */
  it("refuses one with a body but no title", () => {
    const dir = changelogDir({
      "accordion.yaml":
        `surface: ${surfaceHash(accordionContract)}\n` +
        `entries:\n  - date: 2026-08-04\n    kind: rework\n` +
        `    es:\n      body: sin titular\n` +
        `    en:\n      body: no headline\n`,
    });

    const conflict = readChangelogs(dir).conflicts.find((c) => c.includes("accordion.yaml"))!;

    expect(conflict).toContain("`es.title`");
    expect(conflict).toContain("`en.title`");
  });

  it("refuses a target no option, part or signature declares", () => {
    const dir = changelogDir({
      "accordion.yaml":
        `surface: ${surfaceHash(accordionContract)}\n` +
        `entries:\n  - date: 2026-08-04\n    kind: rework\n    target: nonesuch\n${text("a")}`,
    });

    expect(readChangelogs(dir).conflicts.some((c) => c.includes('points at "nonesuch"'))).toBe(true);
  });

  it("refuses a kind nothing renders", () => {
    const dir = changelogDir({
      "accordion.yaml":
        `surface: ${surfaceHash(accordionContract)}\n` +
        `entries:\n  - date: 2026-08-04\n    kind: tweaked\n${text("a")}`,
    });

    expect(readChangelogs(dir).conflicts.some((c) => c.includes('kind "tweaked"'))).toBe(true);
  });

  it("keeps the title and the body apart, in both languages", () => {
    const dir = changelogDir({
      "accordion.yaml":
        `surface: ${surfaceHash(accordionContract)}\n` +
        `entries:\n  - date: 2026-08-04\n    kind: rework\n` +
        `    es:\n      title: Titular\n      body: La explicación.\n` +
        `    en:\n      title: Headline\n      body: The explanation.\n`,
    });

    const entry = readChangelogs(dir).changelog.accordion!.releases[0]!.entries[0]!;

    expect(entry.es).toEqual({ title: "Titular", body: "La explicación." });
    expect(entry.en).toEqual({ title: "Headline", body: "The explanation." });
  });

  it("orders entries newest first, whatever order the file is in", () => {
    const dir = changelogDir({
      "accordion.yaml":
        `surface: ${surfaceHash(accordionContract)}\n` +
        `entries:\n` +
        `  - date: 2026-01-01\n    kind: feature\n${text("vieja")}` +
        `  - date: 2026-08-04\n    kind: rework\n${text("nueva")}`,
    });

    expect(datesOf(dir, "accordion")).toEqual(["2026-08-04", "2026-01-01"]);
  });
});

/*
 * The ledger is what turns a date into an answer to "do I have this yet". Everything here is about
 * that translation being unambiguous, because the entries themselves never say a version.
 */
describe("filing entries under a version", () => {
  const three = (surface: string) =>
    `surface: ${surface}\n` +
    `entries:\n` +
    `  - date: 2026-01-15\n    kind: feature\n${text("a")}` +
    `  - date: 2026-03-10\n    kind: rework\n${text("b")}` +
    `  - date: 2026-08-04\n    kind: bugfix\n${text("c")}`;

  const ledger =
    'working: "0.3.0"\n' +
    "releases:\n" +
    '  - version: "0.2.0"\n    date: 2026-03-31\n' +
    '  - version: "0.1.0"\n    date: 2026-02-01\n';

  it("puts an entry in the oldest release whose date reaches it", () => {
    const dir = changelogDir({
      "releases.yaml": ledger,
      "accordion.yaml": three(surfaceHash(accordionContract)),
    });

    const releases = readChangelogs(dir).changelog.accordion!.releases;

    expect(releases.map((r) => [r.version, r.entries.map((e) => e.date)])).toEqual([
      ["0.3.0-dev", ["2026-08-04"]],
      ["0.2.0", ["2026-03-10"]],
      ["0.1.0", ["2026-01-15"]],
    ]);
  });

  /*
   * The answer to "what do we show before anything is published". Not a placeholder: `-dev` says
   * both which version this is heading for and that it has not got there.
   */
  it("stamps everything as the working version while the ledger is empty", () => {
    const dir = changelogDir({ "accordion.yaml": three(surfaceHash(accordionContract)) });

    const releases = readChangelogs(dir).changelog.accordion!.releases;

    expect(releases).toHaveLength(1);
    expect(releases[0]!.version).toBe("0.1.0-dev");
    expect(releases[0]!.date).toBeNull();
  });

  /* One contract's history, not the kit's. Most releases will not have touched most contracts. */
  it("drops a release this contract had nothing in", () => {
    const dir = changelogDir({
      "releases.yaml": ledger,
      "accordion.yaml":
        `surface: ${surfaceHash(accordionContract)}\n` +
        `entries:\n  - date: 2026-01-15\n    kind: feature\n${text("a")}`,
    });

    expect(readChangelogs(dir).changelog.accordion!.releases.map((r) => r.version)).toEqual(["0.1.0"]);
  });

  it("refuses two releases on one day, which would give an entry two versions", () => {
    const dir = changelogDir({
      "releases.yaml":
        'working: "0.3.0"\nreleases:\n' +
        '  - version: "0.2.0"\n    date: 2026-03-31\n' +
        '  - version: "0.1.0"\n    date: 2026-03-31\n',
    });

    expect(readChangelogs(dir).conflicts.some((c) => c.includes("and so did another release"))).toBe(true);
  });

  it("refuses a working version that is already published", () => {
    const dir = changelogDir({
      "releases.yaml": 'working: "0.1.0"\nreleases:\n  - version: "0.1.0"\n    date: 2026-02-01\n',
    });

    expect(readChangelogs(dir).conflicts.some((c) => c.includes("Bump `working`"))).toBe(true);
  });

  it("reports a directory with no ledger at all", () => {
    const dir = mkdtempSync(join(tmpdir(), "sk-changelog-"));

    expect(readChangelogs(dir).conflicts.some((c) => c.includes("releases.yaml is missing"))).toBe(true);
  });
});
