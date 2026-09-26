import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * AN EVAL CASE: one product intent, in both languages the catalogue is written for, paired with a
 * tree an agent given only that intent and the MCP tools would be expected to arrive at.
 *
 * This is not a Snippet (contracts/snippets/snippet.ts). A snippet is published for an agent to
 * copy. A case points the other way: it exists to be RE-VALIDATED, not copied, so `run.ts` can catch
 * a contract change that quietly breaks a composition this corpus already proved correct once.
 */
export type EvalCase = {
  /** Stable id. What a failing run names. */
  readonly id: string;
  /** The intent as a person would actually type it, not a description of the tree below. */
  readonly prompt: { readonly es: string; readonly en: string };
  /**
   * What this case guards and why, in the same voice as a snippet's notes. A case with no story is
   * indistinguishable from a case nobody would miss.
   */
  readonly notes: readonly string[];
  /** Hand-composed and confirmed valid via `validate_ui` before landing here. */
  readonly tree: UsageTree;
  /**
   * What the product requirement demands of ANY correct answer, where structural validity alone
   * cannot tell a right choice from a wrong one: a Checkbox and a Switch both validate for "dark
   * mode, applied at once", and only one of them is right. Checked against the signatures the
   * agent's final tree uses, never against equality with `tree`, which is one correct answer.
   * `run.ts` also checks `tree` itself satisfies them, so an invariant cannot silently be unsatisfiable.
   */
  readonly invariants?: readonly Invariant[];
};

/*
 * Declarative on purpose, so a report can say which requirement failed in words. `uses`: at least
 * one of these signatures appears somewhere in the tree. `avoids`: none of them does.
 */
export type Invariant =
  | { readonly uses: readonly string[]; readonly because: string }
  | { readonly avoids: readonly string[]; readonly because: string };
