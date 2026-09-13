/*
 * WHICH STYLESHEETS A USAGE TREE NEEDS, read off the contracts the tree touches.
 *
 * The question every stage asks (docs frame, gates harness, eval-viewer, playground) and that each
 * used to answer by a different guess. The classes the emitter writes come from `parts` and from
 * template `also` lists (including nested nodes: Toast's dismiss borrows `sk-button`). A sheet is
 * "placed" when it is the contract's own `css`, a `hookSheets` entry, or the unique owner of an
 * `also` class. Classes with no unique owner (`sk-interactive`, loaded by every consumer's
 * `tokens.scss`) are shared, not unplaced.
 *
 * `unplaced` is the gate: a class the tree emits that needs a sheet and has none in `sheets`.
 * The architecture review's completeness claim is exactly `unplaced.length === 0` over the
 * canonical corpus.
 */
import { contractIds, getContract } from "@skryensya/core/registry";
import type { ContractTemplate } from "@skryensya/core/contract";
import {
  collectionItems,
  isUsageTree,
  slotItems,
  slotsOf,
  type SlotContent,
  type UsageTree,
} from "@skryensya/core/usage-tree";

export type SheetsForTree = {
  /** Stylesheets the composition must load, bare specifier form (`@skryensya/core/…`). */
  readonly sheets: readonly string[];
  /** `sk-*` classes the tree's templates name (parts + also). */
  readonly classes: readonly string[];
  /** Classes that need a sheet and do not have one in `sheets`. Empty when the closure is complete. */
  readonly unplaced: readonly string[];
};

/** Part class → the one stylesheet that owns it, only when a single contract claims it. */
const classToCss: ReadonlyMap<string, string> = (() => {
  const claimants = new Map<string, Set<string>>();
  /*
   * Through `getContract`, not `Object.values(contracts)`: the catalogue is `as const`, so optional
   * fields like `hookSheets` are missing from the narrowed literals. The accessor widens to
   * `ComponentContract` (same reason `hooks.ts` uses it).
   */
  for (const id of contractIds()) {
    const contract = getContract(id);
    if (!contract) continue;
    const css = contract.css;
    if (typeof css !== "string" || !contract.parts) continue;
    for (const className of Object.values(contract.parts)) {
      if (typeof className !== "string") continue;
      const owners = claimants.get(className) ?? new Set<string>();
      owners.add(css);
      claimants.set(className, owners);
    }
  }
  const index = new Map<string, string>();
  for (const [className, owners] of claimants) {
    if (owners.size === 1) index.set(className, [...owners][0]!);
  }
  return index;
})();

function walkTemplate(node: ContractTemplate | undefined, visit: (n: ContractTemplate) => void): void {
  if (!node) return;
  visit(node);
  for (const child of node.children ?? []) walkTemplate(child, visit);
}

function walkUsage(content: SlotContent | undefined, visit: (tree: UsageTree) => void): void {
  for (const item of slotItems(content)) {
    if (!isUsageTree(item)) continue;
    visit(item);
    for (const nested of Object.values(slotsOf(item))) walkUsage(nested, visit);
  }
  for (const entry of collectionItems(content)) {
    for (const nested of Object.values(entry.slots)) walkUsage(nested, visit);
  }
}

/**
 * Every stylesheet the tree needs, and every class that still has nowhere to live.
 *
 * Walks nested usage trees and nested template nodes: a Toast's dismiss `also: ["sk-button"]` is
 * how `button.css` enters the set. A root-only `also` walk misses it.
 */
export function sheetsForTree(tree: UsageTree): SheetsForTree {
  const sheets = new Set<string>();
  const classes = new Set<string>();

  const visit = (node: UsageTree): void => {
    const contract = getContract(node.contract);
    if (!contract) return;
    if (typeof contract.css === "string") sheets.add(contract.css);
    for (const hook of contract.hookSheets ?? []) sheets.add(hook);

    const signature = contract.signatures[node.signature];
    walkTemplate(signature?.template, (part) => {
      if (part.part) {
        const className = contract.parts[part.part];
        if (typeof className === "string") classes.add(className);
      }
      for (const also of part.also ?? []) {
        classes.add(also);
        const owner = classToCss.get(also);
        if (owner) sheets.add(owner);
      }
    });
  };

  visit(tree);
  walkUsage(tree.children, visit);
  for (const nested of Object.values(tree.slots ?? {})) walkUsage(nested, visit);

  const unplaced = [...classes]
    .filter((className) => {
      const owner = classToCss.get(className);
      /* Shared / multi-claimed (e.g. `sk-interactive`): loaded with tokens, not a missing sheet. */
      if (!owner) return false;
      return !sheets.has(owner);
    })
    .sort();

  return {
    sheets: [...sheets].sort(),
    classes: [...classes].sort(),
    unplaced,
  };
}
