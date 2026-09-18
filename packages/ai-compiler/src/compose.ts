import { parseTokens, CSS_DIR } from "@skryensya/core/parse";
import { contractIds, getContract } from "@skryensya/core/registry";

/*
 * COMPOSE / systemOwned, reconciled against the catalogue and the CSS corpus.
 *
 * `compose.of` must name a published contract; `compose.sheets` must exist as files under
 * packages/core (same corpus `checkStylingHooks` uses). `systemOwned` entries must be keys of
 * that contract's `parts`. Without this, an agent could trust a typo forever.
 */

export type ComposeProblem = {
  readonly contract: string;
  readonly rule: "unknown-compose-target" | "compose-sheet-missing" | "unknown-system-owned";
  readonly message: string;
};

export function checkCompose(): ComposeProblem[] {
  const problems: ComposeProblem[] = [];
  const corpus = parseTokens(CSS_DIR);
  const byRel = new Map(corpus.files.map((f) => [f.rel, f] as const));
  const ids = new Set(contractIds());

  for (const id of contractIds()) {
    const contract = getContract(id);
    if (!contract) continue;

    for (const name of contract.systemOwned ?? []) {
      if (!(name in contract.parts)) {
        problems.push({
          contract: id,
          rule: "unknown-system-owned",
          message: `systemOwned "${name}" is not a key of parts on "${id}"`,
        });
      }
    }

    for (const [sigName, signature] of Object.entries(contract.signatures)) {
      for (const entry of signature.compose ?? []) {
        if (!ids.has(entry.of)) {
          problems.push({
            contract: id,
            rule: "unknown-compose-target",
            message: `${sigName}.compose.of "${entry.of}" is not a published contract`,
          });
        }
        for (const sheet of entry.sheets ?? []) {
          const rel = sheet.replace(/^@skryensya\/core\//, "");
          if (!byRel.has(rel)) {
            problems.push({
              contract: id,
              rule: "compose-sheet-missing",
              message: `${sigName}.compose sheets "${sheet}" is not in the CSS corpus`,
            });
          }
        }
      }
    }
  }

  return problems;
}
