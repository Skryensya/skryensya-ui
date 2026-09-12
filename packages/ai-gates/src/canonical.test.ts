import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { contracts } from "@skryensya/core/registry";
import {
  collectionItems,
  isUsageTree,
  slotItems,
  slotsOf,
  type SlotContent,
} from "@skryensya/core/usage-tree";
import { expect, test } from "vitest";
import { canonicalTrees } from "./trees.js";

/*
 * THE TWO GATES OVER THE CANONICAL CORPUS THAT NEED NO BROWSER.
 *
 * Both of these used to live in `rendered.spec.ts` beside the paint and screenshot checks, and
 * neither ever took a Playwright fixture: they are pure functions over `trees.ts` and the registry.
 * Living there cost them everything, because `@skryensya/ai-gates` is excluded from `pnpm check`,
 * from `pre-push` and from CI (the browser suite takes ~19 minutes and is load-sensitive, which
 * CONTRIBUTING explains). So the cheapest gates in the repository, measured at 4ms over all 131
 * canonical entries, ran on no pull request, while the corpus they guard is the one CONTRIBUTING
 * step 7 makes mandatory for every new component.
 *
 * They are `.test.ts` and not `.spec.ts` on purpose: `playwright.config.ts` now matches only
 * `*.spec.ts`, and this package's `vitest.config.ts` matches only `*.test.ts`, so the two runners
 * cannot collect each other's files.
 */

test("every canonical tree is valid against its contract", () => {
  /* A fixture the contract rejects proves nothing about the contract. This exists because a tree
   * that violated its own contract passed symmetry, accessibility and paint for days: the gates
   * were measuring three things about markup nobody had asked the contract about. */
  const problems = canonicalTrees.flatMap(({ name, tree }) =>
    validateUsageTree(tree)
      .problems.filter((problem) => problem.severity === "error")
      .map((problem) => `${name} · ${problem.path}: ${problem.message}`),
  );

  expect(problems).toEqual([]);
});

/**
 * Every `contract.signature` a tree touches, root or nested. A `Menu` whose "Exportar" item opens
 * a submenu references `menu.Menu` twice, once for itself and once for the nested one, and both
 * count. Walks the same `slotItems`/`collectionItems` shape every emitter already walks, so a
 * signature only reachable through a collection entry (a select item, a tree-view node) is not
 * missed just because it never gets its own top-level `Canonical`.
 */
function walkSignatures(content: SlotContent | undefined, into: Set<string>): void {
  for (const item of slotItems(content)) {
    if (!isUsageTree(item)) continue;
    into.add(`${item.contract}.${item.signature}`);
    for (const nested of Object.values(slotsOf(item))) walkSignatures(nested, into);
  }
  for (const entry of collectionItems(content)) {
    for (const nested of Object.values(entry.slots)) walkSignatures(nested, into);
  }
}

test("every published signature is reachable from a canonical tree", () => {
  /* That the canonical list and the published catalogue grow together was a comment, never a
   * check: select, menu, table-pager and tooltip were each published and went uncompared for a
   * while, and nothing failed until someone opened the page and looked. */
  const touched = new Set<string>();
  for (const { tree } of canonicalTrees) walkSignatures(tree, touched);

  const missing = Object.entries(contracts).flatMap(([contractId, contract]) =>
    Object.keys(contract.signatures)
      .map((signatureId) => `${contractId}.${signatureId}`)
      .filter((key) => !touched.has(key)),
  );

  expect(missing).toEqual([]);
});

test("the corpus is big enough that these two gates mean something", () => {
  /* A floor, not an exact count: without it, a glob or an import that silently resolved to nothing
   * would turn both checks above into green no-ops. `public-exports.test.ts` records what that
   * failure looks like when nobody guards against it. */
  expect(canonicalTrees.length).toBeGreaterThan(100);
});
