import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { contractIds, getContract } from "./registry.js";

/*
 * The half of the truth a machine cannot infer: when to reach for a signature, when not to, and what to
 * reach for instead.
 *
 * It lives outside Core on purpose (decision 28's split): Core is structural, English, and names no
 * tenant. Intent, tradeoffs and Spanish aliases are product judgement, and putting them in Core
 * would put copy in the one package that deliberately ships none.
 */

export type SignatureSemantics = {
  readonly useWhen?: readonly string[];
  readonly avoidWhen?: readonly string[];
  readonly alternatives?: readonly string[];
};

export type ContractSemantics = Readonly<Record<string, SignatureSemantics>>;

export type OverlayReadResult = {
  readonly semantics: Readonly<Record<string, ContractSemantics>>;
  readonly conflicts: readonly string[];
};

/**
 * Reads every overlay and reconciles it against the contracts. A conflict is not repaired here and
 * not resolved by preferring one side: the compiler refuses to choose silently between two truths,
 * so it reports both origins and the build stops.
 */
export function readOverlays(dir: string): OverlayReadResult {
  const semantics: Record<string, ContractSemantics> = {};
  const conflicts: string[] = [];

  for (const file of listYaml(dir)) {
    const id = file.replace(/\.ya?ml$/, "");
    const contract = getContract(id);

    if (!contract) {
      conflicts.push(
        `${file}: overlay for "${id}", which no published contract declares. Either the contract is missing or the overlay outlived it.`,
      );
      continue;
    }

    const parsed = (parse(readFileSync(join(dir, file), "utf8")) ?? {}) as ContractSemantics;

    for (const signature of Object.keys(parsed)) {
      if (!contract.signatures[signature]) {
        conflicts.push(
          `${file}: describes signature "${signature}", which contract "${id}" does not declare. Contract has: ${Object.keys(contract.signatures).join(", ")}.`,
        );
      }
    }

    for (const signature of Object.keys(contract.signatures)) {
      if (!parsed[signature]) {
        conflicts.push(
          `${file}: signature "${signature}" has no semantics. A signature an agent cannot choose on purpose is not published.`,
        );
      }
    }

    semantics[id] = parsed;
  }

  // The other direction: a contract nobody wrote semantics for. It would reach the agent as a shape
  // with no reason to choose it, which is exactly the half-described family the policy refuses.
  for (const id of contractIds()) {
    if (!semantics[id]) {
      conflicts.push(`contract "${id}" has no overlay in ${dir}. Write one or do not publish it.`);
    }
  }

  return { semantics, conflicts };
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
