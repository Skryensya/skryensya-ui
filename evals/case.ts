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
   * mode, applied at once", and only one of them is right. Checked against the agent's final tree,
   * never against equality with `tree`, which is one correct answer. `run.ts` also checks `tree`
   * itself satisfies them, so an invariant cannot silently be unsatisfiable.
   */
  readonly invariants?: readonly Invariant[];
  /**
   * Trees that VALIDATE and are still wrong for this intent, each of which must break at least one
   * invariant. `run.ts` checks both halves, so an invariant set that would pass the wrong answer
   * fails the static gate instead of passing a live run that should have failed.
   */
  readonly counterexamples?: readonly { readonly tree: UsageTree; readonly because: string }[];
  /**
   * The other direction: trees that answer the intent CORRECTLY and differ from `tree`, each of which
   * must validate and satisfy every invariant. Without them, an invariant that only the reference
   * tree meets looks like a requirement, and fails a correct live answer.
   */
  readonly alternatives?: readonly { readonly tree: UsageTree; readonly because: string }[];
};

/** One signature id, or several counted as one kind: `["Link", "ListItemLink"]`. */
export type Signatures = string | readonly string[];

/*
 * THE INVARIANT VOCABULARY. Declarative and serializable, so a report can say which requirement
 * failed in words, and small, because each predicate is one question about the final tree and
 * never a comparison with the reference tree:
 *
 *   uses      at least one of these signatures appears anywhere.
 *   avoids    none of these signatures appears anywhere.
 *   count     how many nodes of these signatures appear anywhere: `min`, `max`, or `exactly`.
 *   contains  some node of `ancestor` holds a node of `descendant` at any depth below it.
 *   option    some node of `signature` (below a `within` node, when given) has option `name`
 *             `equals` a value, or `startsWith` a prefix. An omitted option reads as its default.
 *   before    the first node of `first` comes before the first node of `then`, in document order.
 *   anchors   some `from` node (below a `within` node, when given) links to `#x`, a node with
 *             `id="x"` exists, and it holds, at any depth, a node of EACH group in `to`. Section
 *             membership, stated through the page's own in-page links rather than through copy.
 *   anyOf     at least one of these predicates holds: the same requirement met two valid ways.
 *
 * Nothing here reads copy. A requirement that can only be stated by matching text is not one this
 * vocabulary expresses, on purpose: the reference tree's wording is not the product requirement.
 */
export type Predicate =
  | { readonly uses: readonly string[] }
  | { readonly avoids: readonly string[] }
  | {
      readonly count: { readonly signature: Signatures; readonly min?: number; readonly max?: number; readonly exactly?: number };
    }
  | { readonly contains: { readonly ancestor: Signatures; readonly descendant: Signatures } }
  | {
      readonly option: {
        readonly signature: Signatures;
        readonly name: string;
        readonly equals?: string | number | boolean;
        readonly startsWith?: string;
        readonly within?: Signatures;
      };
    }
  | { readonly before: { readonly first: Signatures; readonly then: Signatures } }
  | {
      readonly anchors: { readonly from: Signatures; readonly within?: Signatures; readonly to: readonly Signatures[] };
    }
  | { readonly anyOf: readonly Predicate[] };

export type Invariant = Predicate & { readonly because: string };
