---
num: 28
title: Evals judge a choice with invariants, and record how the agent got there
short: "Invariant evals"
summary: >-
  A structurally valid tree can still be the wrong answer: a Checkbox for a setting that applies at
  once validates exactly as well as a Switch. Eval cases now declare invariants, signatures any correct
  answer must use or must avoid, instead of demanding equality with one reference tree. The validator
  still owns structural validity. Every live run also records the workflow it took, so two server
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

**A case may declare invariants.** `uses`: at least one of these signatures appears in the final
tree. `avoids`: none of these does. Each carries a `because` that the report prints. A live run
passes when the last `validate_ui` was valid AND every invariant holds. The static gate checks that
each reference tree satisfies its own invariants, so an invariant no answer could meet fails `check`
instead of every live run.

**Validity stays the validator's.** Invariants add the product requirement on top of `validate_ui`'s
verdict; they never pass a tree it rejected.

**Every run records its workflow.** Tool calls, catalogue pages, whether discovery was used, discovery
calls before the first `validate_ui`, repair loops, examples read and used, and the selected
signature, per case and averaged per run. `--workflow` and `--server` run the same cases against
another build and framing, so a workflow change is measured rather than asserted.

## What was rejected

**Exact equality with the reference tree.** It fails correct answers and was already demoted to a
diagnostic.

**A model as judge.** It would grade semantic fit fluently and irreproducibly, in the one place whose
job is to be a fixed point.

**Failing a run on workflow metrics.** Fewer calls is a goal, not a correctness criterion; a slower
correct answer is still correct.

## Cost

Invariants only express choices of signature. A requirement about options, content or layout is
still unexpressed, and a case that needs one is scored on validity alone until the vocabulary grows.
