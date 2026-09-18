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

/*
 * WHICH SHEET PUBLISHES WHICH HOOK, as opposed to merely declaring it.
 *
 * These are not the same thing, and conflating them is what made the first pass of this data 23%
 * wrong: `combobox.css` sets `--sk-button-bg` inside `.sk-combobox__clear.sk-button`, which is
 * Button's hook being tuned in a Combobox, not Combobox publishing it. Seventeen contracts ended up
 * claiming `--sk-icon-size` that way.
 *
 * THE RULE: a sheet publishes a hook when it declares it in a rule that mentions no component
 * family other than the hook's own. Two naming facts keep "own" from meaning strict equality:
 * a variant re-declares its component's hook rather than adding one (`.sk-slider-range` setting
 * `--sk-slider-track`, which CONTEXT.md describes), and a hook may drop a segment its class keeps
 * (`.sk-tree-view` publishing `--sk-tree-indent`). Both are "related family", handled below.
 */
function familyNames(): ReadonlySet<string> {
  const families = new Set<string>();
  for (const id of contractIds()) {
    const contract = getContract(id);
    if (!contract) continue;
    for (const part of Object.values(contract.parts)) families.add(part.split("__")[0]!.split("--")[0]!);
    for (const m of JSON.stringify(contract).matchAll(/"also":\[([^\]]*)\]/g))
      for (const q of m[1]!.matchAll(/"(sk-[a-z0-9-]+)"/g)) families.add(q[1]!.split("__")[0]!.split("--")[0]!);
  }
  return families;
}

export function publishedBySheet(
  files: readonly { rel?: string; css?: string }[],
): ReadonlyMap<string, ReadonlySet<string>> {
  const families = familyNames();
  const longest = (cands: string[]) => cands.sort((a, b) => b.length - a.length)[0];
  const famOfHook = (h: string) => longest([...families].filter((f) => h.startsWith(`--${f}-`)));
  const famOfClass = (c: string) =>
    longest([...families].filter((f) => c === f || c.startsWith(`${f}__`) || c.startsWith(`${f}--`)));

  const out = new Map<string, ReadonlySet<string>>();
  for (const file of files) {
    if (!file.rel || !file.css) continue;
    const published = new Set<string>();
    for (const rule of file.css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const mentioned = [
        ...new Set(
          [...rule[1]!.matchAll(/\.(sk-[a-z0-9-]+)/g)]
            .map((c) => famOfClass(c[1]!))
            .filter((f): f is string => Boolean(f)),
        ),
      ];
      for (const hook of rule[2]!.matchAll(/(--sk-[a-z0-9-]+)\s*:/g)) {
        const name = hook[1]!;
        const fam = famOfHook(name);
        const related = (f: string) => f === fam || (fam !== undefined && (f.startsWith(fam) || fam.startsWith(f)));
        if (fam ? mentioned.every(related) : mentioned.length === 1) published.add(name);
      }
    }
    if (published.size) out.set(file.rel, published);
  }
  return out;
}

export function checkStylingHooks(): HookProblem[] {
  const problems: HookProblem[] = [];
  const corpus = parseTokens(CSS_DIR);
  const byRel = new Map(corpus.files.map((f) => [f.rel, f] as const));
  const published = publishedBySheet(corpus.files as readonly { rel?: string; css?: string }[]);

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
    /* PUBLISHED, not merely declared: a sheet tuning another component's hook inside its own
     * scope is a consumer of that hook, and saying otherwise is what made 17 contracts claim
     * `--sk-icon-size`. `hook-broken` below still looks at every declaration, because a promise
     * the stylesheet keeps anywhere is kept. */
    const inSheet = new Set<string>();
    for (const each of rels) for (const name of published.get(each) ?? []) inSheet.add(name);
    const declaredAnywhere = new Set<string>();
    for (const each of rels) {
      const declarations = byRel.get(each)!.decls as readonly { name: string }[];
      for (const d of declarations) if (d.name.startsWith("--sk-")) declaredAnywhere.add(d.name);
    }
    const promised = new Set(contract.hooks);
    for (const name of contract.outputHooks ?? []) {
      if (promised.has(name)) continue;
      problems.push({
        sheet: rel,
        rule: "hook-broken",
        message: `"${contract.id}".outputHooks names ${name}, which is not one of its hooks`,
      });
    }

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
      if (declaredAnywhere.has(name)) continue;
      problems.push({
        sheet: rel,
        rule: "hook-broken",
        message: `"${contract.id}".hooks promises ${name} and none of its stylesheets declares it: an override of it does nothing, silently`,
      });
    }
  }

  return problems;
}
