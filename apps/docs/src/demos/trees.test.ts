import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { describe, expect, it } from "vitest";
import { useTranslations, type Translate } from "../i18n";

/*
 * EVERY USAGE TREE IN `src/demos`, AGAINST ITS CONTRACTS.
 *
 * `templates.test.ts` already does this for the five templates, and its own docstring records why:
 * `docs-site` shipped invalid because the emitter will happily emit a tree the contracts reject.
 * The same argument covers the rest of the corpus, which is far larger: this directory is the
 * biggest body of usage trees in the repository and, until this file, the only one no gate read.
 * `check-trees.mts` could validate ONE module when someone remembered to point it at one; nothing
 * referenced it, so nothing ran it.
 *
 * It runs as a vitest file rather than a CLI on purpose. Vite resolves the `?raw` imports and the
 * workspace aliases these modules use, which a bare `node`/`tsx` run of the same code cannot: under
 * plain tsx, 25 of the modules here fail to import at all and would have to be skipped.
 *
 * ADVISORIES ARE NOT FAILURES, for the reason `templates.test.ts` gives: an advisory is the
 * validator saying a rule cannot be settled from the tree alone, and failing on those makes the
 * gate noise.
 */
const t: Translate = useTranslations("es");

/* Browser demo scripts, not trees: they touch `document` at module scope and there is nothing here
 * to validate in them. */
const modules = import.meta.glob(["./**/*.ts", "!./scripts/**", "!./**/*.test.ts"], {
  eager: true,
}) as Record<string, Record<string, unknown>>;

/*
 * A tree factory takes `t` and, when it needs one, a locale-owned href. The second argument's shape
 * differs per demo (some take a bare string, some an object of them, one a number), so each shape is
 * tried and the first that yields a validatable tree wins. A factory that yields none is not a tree
 * factory and is skipped rather than failed.
 */
const argShapes: readonly unknown[] = ["/demo", new Proxy({}, { get: () => "/demo" }), 1.2];

const isTree = (v: unknown): v is UsageTree =>
  typeof v === "object" && v !== null && "contract" in v && "signature" in v;

const errorsIn = (tree: UsageTree): string[] =>
  validateUsageTree(tree)
    .problems.filter((p) => p.severity === "error")
    .map((p) => `${p.path}: ${p.rule} - ${p.message}`);

/*
 * The BEST shape wins, not the first one that happens to produce an object. A bare string is a
 * valid-looking second argument for every factory (it just makes every `href` undefined), so
 * "first tree-shaped result" silently picks the wrong one and manufactures failures the corpus
 * does not have. Whichever shape validates clean is the one the factory actually wanted.
 */
const resolveTree = (value: unknown): UsageTree | undefined => {
  if (isTree(value)) return value;
  if (typeof value !== "function") return undefined;
  let best: UsageTree | undefined;
  let bestErrors = Number.POSITIVE_INFINITY;
  for (const arg of argShapes) {
    try {
      const candidate = (value as (a: unknown, b: unknown) => unknown)(t, arg);
      if (!isTree(candidate)) continue;
      const count = errorsIn(candidate).length;
      if (count < bestErrors) [best, bestErrors] = [candidate, count];
      if (count === 0) break;
    } catch {
      /* wrong argument shape for this factory; try the next */
    }
  }
  return best;
};

const cases: { module: string; name: string; tree: UsageTree }[] = [];
for (const [file, mod] of Object.entries(modules)) {
  for (const [name, value] of Object.entries(mod)) {
    const tree = resolveTree(value);
    if (tree) cases.push({ module: file.replace("./", ""), name, tree });
  }
}

describe("every demo usage tree composes", () => {
  it("found the corpus", () => {
    /* A floor, not an exact count: the guard is against the glob silently matching nothing, which
     * would turn this whole file into a green no-op. */
    expect(cases.length).toBeGreaterThan(250);
  });

  for (const { module, name, tree } of cases) {
    it(`${module} :: ${name}`, () => {
      expect(errorsIn(tree)).toEqual([]);
    });
  }
});
