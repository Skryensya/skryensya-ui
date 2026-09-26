import { signaturesIn } from "@skryensya/ai-compiler/usage-walk";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Invariant } from "./case.js";

/** Every invariant a tree breaks, as a sentence a report can print. Empty when all hold. */
export function brokenInvariants(tree: UsageTree, invariants: readonly Invariant[] = []): string[] {
  const used = new Set(signaturesIn(tree));
  return invariants.flatMap((invariant) => {
    if ("uses" in invariant) {
      return invariant.uses.some((id) => used.has(id))
        ? []
        : [`uses none of ${invariant.uses.join(" / ")}: ${invariant.because}`];
    }
    const present = invariant.avoids.filter((id) => used.has(id));
    return present.length === 0 ? [] : [`uses ${present.join(", ")}: ${invariant.because}`];
  });
}
