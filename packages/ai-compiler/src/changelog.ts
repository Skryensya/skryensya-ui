import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { ComponentContract } from "@skryensya/core/contract";
import { contractIds, getContract } from "./registry.js";
import { surfaceHash, targetableNames } from "./surface.js";

/*
 * WHAT CHANGED, per component, in the words a consumer reads.
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
 */

export const CHANGE_KINDS = ["added", "changed", "fixed", "removed", "breaking"] as const;

export type ChangeKind = (typeof CHANGE_KINDS)[number];

/** One dated, consumer-facing change to a contract. */
export type ChangeEntry = {
  /** `YYYY-MM-DD`. Dates, not versions: every package is still 0.1.0, so a version distinguishes nothing yet. */
  readonly date: string;
  readonly kind: ChangeKind;
  /** The option, part or signature this is about, so the reference table can badge that exact row. */
  readonly target?: string;
  readonly es: string;
  readonly en: string;
};

export type ContractChangelog = {
  /** `surfaceHash` of the contract as of the last entry. The gate compares it against the live one. */
  readonly surface: string;
  readonly entries: readonly ChangeEntry[];
};

export type ChangelogReadResult = {
  readonly changelog: Readonly<Record<string, ContractChangelog>>;
  readonly conflicts: readonly string[];
};

/**
 * Reads every changelog and holds each contract to it.
 *
 * The check that matters is the surface one: a contract whose shape moved without this file being
 * touched. Everything else here only makes sure the entries are renderable. Same policy as the
 * overlay reader: a conflict stops the build rather than being repaired silently.
 */
export function readChangelogs(dir: string): ChangelogReadResult {
  const changelog: Record<string, ContractChangelog> = {};
  const conflicts: string[] = [];

  for (const file of listYaml(dir)) {
    const id = file.replace(/\.ya?ml$/, "");
    const contract = getContract(id);

    if (!contract) {
      conflicts.push(
        `${file}: changelog for "${id}", which no published contract declares. Either the contract is missing or the changelog outlived it.`,
      );
      continue;
    }

    const parsed = (parse(readFileSync(join(dir, file), "utf8")) ?? {}) as Partial<ContractChangelog>;
    changelog[id] = readOne(file, contract, parsed, conflicts);
  }

  for (const id of contractIds()) {
    if (changelog[id]) continue;
    conflicts.push(
      `contract "${id}" has no changelog in ${dir}, so nothing records what its shape was. ` +
        `Run \`pnpm --filter @skryensya/ai-compiler seed\`.`,
    );
  }

  return { changelog, conflicts };
}

function readOne(
  file: string,
  contract: ComponentContract,
  parsed: Partial<ContractChangelog>,
  conflicts: string[],
): ContractChangelog {
  const expected = surfaceHash(contract);
  const entries: ChangeEntry[] = [];
  const targets = targetableNames(contract);

  for (const [index, entry] of (parsed.entries ?? []).entries()) {
    const where = `${file}: entries[${index}]`;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry?.date ?? "")) {
      conflicts.push(`${where} has no \`date\`, or one that is not YYYY-MM-DD.`);
      continue;
    }
    if (!CHANGE_KINDS.includes(entry.kind)) {
      conflicts.push(`${where} has kind "${entry.kind}". One of: ${CHANGE_KINDS.join(", ")}.`);
      continue;
    }
    if (!entry.es?.trim() || !entry.en?.trim()) {
      conflicts.push(
        `${where} is missing \`es\` or \`en\`. The site renders both locales from one source, so a ` +
          `one-language entry publishes a page that silently falls back to the other.`,
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

    entries.push({ date: entry.date, kind: entry.kind, target: entry.target, es: entry.es, en: entry.en });
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

  /* Newest first, decided here so the docs and the agent cannot disagree about the order. */
  return { surface: expected, entries: entries.sort((a, b) => b.date.localeCompare(a.date)) };
}

function listYaml(dir: string): readonly string[] {
  try {
    return readdirSync(dir)
      .filter((file) => /\.ya?ml$/.test(file))
      .sort();
  } catch {
    return [];
  }
}
