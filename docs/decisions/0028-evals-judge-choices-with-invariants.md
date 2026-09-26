---
num: 28
title: Evals judge a choice with invariants, and record how the agent got there
short: "Invariant evals"
summary: >-
  A structurally valid tree can still be the wrong answer: a Checkbox for a setting that applies at
  once validates exactly as well as a Switch. Eval cases now declare invariants, structural
  predicates any correct answer satisfies (signatures used or avoided, counts, nesting, option
  values), and counterexamples those must reject, instead of demanding equality with one reference
  tree. The validator still owns structural validity. Every live run also records the workflow it took, so two server
  workflows can be compared on the same cases.
---

## The problem

ADR-0016 moved the evals from "where did the result rank" to "is the final composition correct", and
"correct" came to mean "`validate_ui` said valid". For most cases that is enough. For the cases this
catalogue exists to get right, it is not: action versus navigation, Switch versus Checkbox,
Accordion versus native details when JavaScript is off, a component versus the alternative its own
`avoidWhen` names. In each pair both answers validate. Only the product requirement separates them.

Comparing with the reference tree separates them too, and also fails every correct answer that
differs from it in a label or an option, which is why the harness already refused to fail on it.

The evals also measured only the outcome. Changing the workflow (ADR-0026) needs the path measured
too: how many calls, how many catalogue pages, how many repairs.

## The decision

**A case may declare invariants.** Each is one question about the final tree, carries a `because`
that the report prints, and never compares with the reference tree:

- `uses`: at least one of these signatures appears; `avoids`: none of them does.
- `count`: how many nodes of these signatures appear, as `min`, `max` or `exactly`.
- `contains`: some node of `ancestor` holds a node of `descendant` at any depth.
- `option`: some node of `signature` (below a `within` node, when given) has option `name` that
  `equals` a value or `startsWith` a prefix; an omitted option reads as its default.
- `before`: the first node of one set comes before the first node of another, in document order.
- `anchors`: some link (below an ancestor, when given) points at `#x`, a node with `id="x"` exists,
  and it holds a node of each listed group. Section membership, stated through the page's own
  in-page links rather than through a heading's text: "the hero's CTA leads to the section holding
  the featured card and the project rows".
- `anyOf`: at least one of these predicates holds, for a requirement two valid trees meet two ways
  (a `Main`, or a `Stack` rendered as `<main>`).

Nothing reads copy. A requirement only text could decide ("the avatar is in the About section") is
left unstated rather than approximated by matching an id or a heading. A live run passes when the
last `validate_ui` was valid AND every invariant holds. The static gate checks that each reference
tree satisfies its own invariants, so an invariant no answer could meet fails `check` instead of
every live run, and that every invariant is well formed (a count with a bound, an option with a
test).

**A case may declare counterexamples.** Trees that validate and are still wrong for the intent,
usually the reference tree with one decision made wrong (the hero's CTA as `Button.action`, the
portrait as a square frame). The static gate checks each one validates AND breaks at least one
invariant. The first half keeps it honest; the second is the proof an invariant set would fail the
wrong answer, which a reference tree passing its invariants cannot give.

**And alternatives.** The other direction: correct answers that differ from the reference, which
must validate and satisfy every invariant, so an invariant only the reference tree meets fails
`check` instead of a correct live answer. The landing page's first alternative is a live agent's
own page, and it caught this ADR's first draft of that case requiring every project row to be a
link, which the prompt never asked for.

**Validity stays the validator's.** Invariants add the product requirement on top of `validate_ui`'s
verdict; they never pass a tree it rejected.

**Every run records its workflow.** Tool calls, catalogue pages, whether discovery was used, discovery
calls before the first `validate_ui`, repair loops, examples read and used, and the selected
signature, per case and averaged per run. `--workflow` and `--server` run the same cases against
another build and framing, so a workflow change is measured rather than asserted.

**Page-scale cases are judged by shape.** `personal-landing-page` no longer passes on validity: it
needs a navbar, a main landmark, a hero holding a real heading and an in-page `Button.navigation`,
no `Button.action`, a card holding an image and a title, several compact rows, a round portrait, an
email link and enough links overall, each stated so that another valid page (links in a `Stack`
instead of a `List`, a `TileLink` card, a `<main>` Stack) still passes.

**Eval invariants are not contract constraints.** A contract constraint answers "is this
composition legal in Skryensya?" for every tree (ADR-0029: a Hero holds a Heading). An invariant
answers "did this agent solve this product requirement?" for one case (this page has at least eight
links). The second never moves into Core; the first may be restated as an invariant when a case's
requirement depends on it, and both are then checked.

## What was rejected

**Exact equality with the reference tree.** It fails correct answers and was already demoted to a
diagnostic.

**A model as judge.** It would grade semantic fit fluently and irreproducibly, in the one place whose
job is to be a fixed point.

**Failing a run on workflow metrics.** Fewer calls is a goal, not a correctness criterion; a slower
correct answer is still correct.

**A general tree query language** (paths, selectors, arbitrary boolean logic). Every predicate above
exists because a case needed it; `anyOf` is the only combinator, and there is no `not` or `allOf`
because a list of invariants is already a conjunction and `avoids` already negates.

## Cost

Invariants express signatures, nesting, counts, option values, document order, and section
membership where the page links to its own sections. They never read copy, and a section nothing
links to cannot be named. A requirement that needs one of those is still unexpressed, and a case that
needs it is scored without it until the vocabulary grows. Counts are coarse where the tree is: "the
compact project list has three rows" cannot be told from "the contact list has three rows" without a
section marker, so such a count is written as a floor both would meet, and the case says so.
