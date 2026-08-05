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

/** A changelog directory holding a file per contract, so only the case under test conflicts. */
function changelogDir(overrides: Readonly<Record<string, string>> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "sk-changelog-"));
  for (const id of contractIds()) {
    const body = overrides[`${id}.yaml`] ?? `surface: ${surfaceHash(getOrThrow(id))}\nentries: []\n`;
    writeFileSync(join(dir, `${id}.yaml`), body);
  }
  return dir;
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
    const retemplated = {
      ...accordionContract,
      signatures: {
        ...accordionContract.signatures,
        Accordion: {
          ...accordionContract.signatures.Accordion,
          template: { element: "section", part: "root", host: true, slot: "children" },
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
        `entries:\n  - date: 2026-08-04\n    kind: changed\n    es: sólo español\n`,
    });

    expect(readChangelogs(dir).conflicts.some((c) => c.includes("missing `es` or `en`"))).toBe(true);
  });

  it("refuses a target no option, part or signature declares", () => {
    const dir = changelogDir({
      "accordion.yaml":
        `surface: ${surfaceHash(accordionContract)}\n` +
        `entries:\n  - date: 2026-08-04\n    kind: changed\n    target: nonesuch\n    es: a\n    en: b\n`,
    });

    expect(readChangelogs(dir).conflicts.some((c) => c.includes('points at "nonesuch"'))).toBe(true);
  });

  it("refuses a kind nothing renders", () => {
    const dir = changelogDir({
      "accordion.yaml":
        `surface: ${surfaceHash(accordionContract)}\n` +
        `entries:\n  - date: 2026-08-04\n    kind: tweaked\n    es: a\n    en: b\n`,
    });

    expect(readChangelogs(dir).conflicts.some((c) => c.includes('kind "tweaked"'))).toBe(true);
  });

  it("orders entries newest first, whatever order the file is in", () => {
    const dir = changelogDir({
      "accordion.yaml":
        `surface: ${surfaceHash(accordionContract)}\n` +
        `entries:\n` +
        `  - date: 2026-01-01\n    kind: added\n    es: vieja\n    en: old\n` +
        `  - date: 2026-08-04\n    kind: changed\n    es: nueva\n    en: new\n`,
    });

    expect(readChangelogs(dir).changelog.accordion.entries.map((e) => e.date)).toEqual([
      "2026-08-04",
      "2026-01-01",
    ]);
  });
});
