import { parseTokens, CSS_DIR } from "@skryensya/core/parse";
import { contractIds, getContract } from "@skryensya/core/registry";

/*
 * THE STYLING HOOKS, RECONCILED AGAINST THE STYLESHEETS.
 *
 * CONTEXT.md calls a styling hook "the public override surface of a component" and a Contract
 * "everything Core declares about one component". Until `ComponentContract.hooks` existed, those
 * two sentences disagreed: 983 hooks lived in the CSS, the contracts named 47 of them in prose,
 * and no file in the repository read both sides, so neither direction was checked.
 *
 * IT LIVES HERE, not in Core's own validator, for a boring reason with no better workaround:
 * `packages/core/scripts/lint.ts` runs under plain `node`, and `src/registry.ts` uses `.js`
 * specifiers that node will not remap onto `.ts`. The compiler already imports every contract and
 * can import Core's parser, so it is the one place both halves are reachable. Landing it here also
 * makes it block EMISSION rather than only linting, which is the stronger gate: a manifest whose
 * hooks do not exist would advertise an override surface that is not there.
 */

export type HookProblem = {
  readonly sheet: string;
  readonly rule: "hook-undeclared" | "hook-broken";
  readonly message: string;
};

export function checkStylingHooks(): HookProblem[] {
  const problems: HookProblem[] = [];
  const corpus = parseTokens(CSS_DIR);
  const byRel = new Map(corpus.files.map((f) => [f.rel, f] as const));

  /*
   * Through `getContract`, not `Object.values(contracts)`: the catalogue is `as const`, so its
   * values narrow to each contract's literal type and an optional field nobody declares yet is not
   * on them. The accessor returns the widened `ComponentContract`, which is the shape this reads.
   */
  for (const id of contractIds()) {
    const contract = getContract(id);
    if (!contract?.hooks?.length) continue; // inert until a contract declares its hooks
    const rel = contract.css.replace(/^@skryensya\/core\//, "");
    const sheet = byRel.get(rel);
    if (!sheet) {
      problems.push({
        sheet: rel,
        rule: "hook-broken",
        message: `contract "${contract.id}" names this stylesheet and the corpus has no such file`,
      });
      continue;
    }

    const declarations = sheet.decls as readonly { name: string }[];
    const inSheet = new Set(
      declarations.filter((d) => d.name.startsWith("--sk-")).map((d) => d.name),
    );
    const promised = new Set(contract.hooks);

    /*
     * The two directions are not symmetric. An undeclared hook works but is undiscoverable. A
     * promised hook the sheet never declares is worse by a distance: the consumer re-declares it,
     * nothing reads it, and they get SILENCE rather than an error.
     */
    for (const name of inSheet) {
      if (promised.has(name)) continue;
      problems.push({
        sheet: rel,
        rule: "hook-undeclared",
        message: `${name} is declared in the stylesheet but missing from "${contract.id}".hooks, so nothing documents it`,
      });
    }
    for (const name of promised) {
      if (inSheet.has(name)) continue;
      problems.push({
        sheet: rel,
        rule: "hook-broken",
        message: `"${contract.id}".hooks promises ${name} and this stylesheet never declares it: an override of it does nothing, silently`,
      });
    }
  }

  return problems;
}
