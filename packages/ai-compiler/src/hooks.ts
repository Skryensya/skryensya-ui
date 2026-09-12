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
    /*
     * EVERY sheet this contract publishes, not just `css`. A contract whose styling spans more than
     * one stylesheet says so with `hookSheets`, and the union is what `hooks` is reconciled against.
     */
    const rels = [contract.css, ...(contract.hookSheets ?? [])].map((c) =>
      c.replace(/^@skryensya\/core\//, ""),
    );
    const missingSheets = rels.filter((rel) => !byRel.get(rel));
    if (missingSheets.length > 0) {
      for (const rel of missingSheets) {
        problems.push({
          sheet: rel,
          rule: "hook-broken",
          message: `contract "${contract.id}" names this stylesheet and the corpus has no such file`,
        });
      }
      continue;
    }

    const rel = rels[0]!;
    const inSheet = new Set<string>();
    for (const each of rels) {
      const declarations = byRel.get(each)!.decls as readonly { name: string }[];
      for (const d of declarations) if (d.name.startsWith("--sk-")) inSheet.add(d.name);
    }
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
        message: `${name} is declared in one of this contract's stylesheets but missing from "${contract.id}".hooks, so nothing documents it`,
      });
    }
    for (const name of promised) {
      if (inSheet.has(name)) continue;
      problems.push({
        sheet: rel,
        rule: "hook-broken",
        message: `"${contract.id}".hooks promises ${name} and none of its stylesheets declares it: an override of it does nothing, silently`,
      });
    }
  }

  return problems;
}
