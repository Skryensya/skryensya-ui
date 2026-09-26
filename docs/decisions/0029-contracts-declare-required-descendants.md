---
num: 29
title: A contract may require descendants, counted at any depth
short: "Required descendants"
summary: >-
  Some signatures compose freely and still owe their content a rule: a Hero's children take any node,
  and a Hero with no real heading inside is not a hero. Slot rules cannot say that, because the
  heading may sit three layout primitives down. A signature may now declare `descendants`: groups of
  signatures that must appear at least `min` times anywhere below it. The validator counts them in
  the tree, the surface hash includes them, and Hero is the first and only consumer.
---

## The problem

`Hero` documented three content rules: a real `Heading` inside, at most one primary action, and an
image that never stands in for the headline. All three lived in a comment, in `useWhen`, and in
thirteen snippets that happened to follow them. None of it could fail a tree. A hero of large `Text`
validated exactly as well as one with a `Heading`, and the only place that difference showed was a
screen reader's outline.

The existing vocabulary could not reach it. A slot's `of` and `cardinality` speak about DIRECT
children, and a hero's heading is almost never one: it sits inside a `Stack`, a column of an
`Inline`, or a tab's panel. `requires` and `atLeastOneOf` speak about options and slots of the node
itself. `notInside` is the one rule that looks at depth, and it looks up, not down.

## The decision

**`descendants` on a signature.** Each entry names a group of signature ids, counted together, a
`min`, and a `because`:

```ts
descendants: [{ of: ["Heading"], min: 1, because: "A hero states what the page or section is…" }]
```

The validator counts every node below the signature, through every slot and through the slots of
collection entries, never the node itself, and reports `missing-descendant` at the signature's path
with the count it found and the `because`. It is the downward counterpart of `notInside`, and is
checked the same way: over the tree, never over prose.

**It is part of the surface.** Tightening a count rejects a tree that validated yesterday, so the
group and its `min` enter the surface hash (`because` does not, like every other `because`). Adding it
to `Hero` moved Hero's hash, and the changelog records it as `breaking`: a hero of pure `Text` now
fails, and the fix is to make its headline a `Heading`. Every published snippet and eval tree already
did.

**Only what a count can prove.** Hero requires at least one `Heading`, and nothing else:

- Not "at most one": a count cannot tell the hero's own headline from a card title composed inside
  it, so `max: 1` would reject legitimate compositions to enforce a rule it cannot actually see.
- Not the level: whether the heading should be the page's `<h1>` depends on whether this hero opens
  the page or a section, which the tree does not say.
- Not "at most one primary action": "primary" is an option value (`tone: accent`, `variant: solid`),
  and this rule counts signatures. Stating it would need option predicates in Core, which is a query
  language by another name.

**Only a minimum.** No contract can use an upper bound yet, so there is none. `max`, and `max: 0` to
forbid, are the obvious extension, added when a contract states a bound a count really proves.

## Not the same thing as an eval invariant

A contract constraint answers "is this composition legal?" for every tree anyone writes. An eval
invariant (ADR-0028) answers "did this agent solve this product's requirement?" for one case. A
Hero holding a Heading is the first kind. A personal landing page holding at least eight links is the
second, and never moves into Core.

## What was rejected

**A tree query language in the contract** (selectors, predicates over option values, boolean
logic). It would state the primary-action rule, and it would make every contract a program the
validator interprets. One count over signature ids covers the rule a contract needs today.

**Named slots on Hero** (`headline`, `actions`). They would make the heading structural, and would
reject the heroes whose anatomy differs: the reason Hero has none is still true.

**Enforcing it only in snippets and evals.** That is what the documented rule was, and a tree an
agent wrote from scratch was never held to it.

## Cost

One more signature field, one more validator rule, and one more thing the surface hash watches. The
rule is only as strong as a count: a Hero whose only Heading belongs to a card inside it passes, and
that is accepted rather than guessed at.
