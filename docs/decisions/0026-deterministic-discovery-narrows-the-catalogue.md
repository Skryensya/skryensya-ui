---
num: 26
title: Deterministic discovery narrows the catalogue, and the catalogue stays the authority
short: "Explained discovery"
summary: >-
  ADR-0016 removed every intermediary between the agent and the complete index, and named the point
  at which to revisit: when the index starts to dominate a typical task's context budget. It has. This
  decision adds `discover_ui`, a deterministic, lexical narrowing step whose every candidate carries
  the field and term that matched it and whose order follows written rules, with no score. The model
  still chooses; `get_catalog` stays the exhaustive authority and fallback; `validate_ui` stays the only
  judge of a tree. It supersedes ADR-0016's "there is no ranker" and its rejection of a hybrid.
---

## The problem

ADR-0016 bet that the complete index fits in the context, and wrote down when to stop betting: "when
the complete index stops fitting comfortably (on the order of several hundred families, or when the
index starts to dominate a typical task's context budget) an intermediary is needed again."

The second condition arrived before the first. Measured on 2026-09-26:

- The index is **~190KB** for 96 families and 209 signatures, about twice the ~90KB ADR-0016 costed.
- It stopped arriving whole. Claude Code persists any tool result past a fixed size to a file and
  hands the model a truncated preview; a recorded eval run showed the model never seeing a real
  `useWhen`, then calling `get_contract` on family names that do not exist. `get_catalog` was paged
  to survive that, and the server's instructions then made **reading every page** mandatory: ten
  calls, and ~190KB of context, before the first composition decision of every task.
- The instructions grew to ~4,500 characters, much of it insisting on steps the model skipped
  because nothing in the answers made them worth taking.

ADR-0016 also said the first move, if size hurt, was a compact form of the index, not ranking. Paging
was that move, applied to transport. It kept the answer readable and made the workflow ten calls long.

## The decision

**There is a narrowing step, and it is deterministic and explained.** `discover_ui` takes free text
and structured facets (whole `intents` terms, `category`, host element, declared `parent`) and returns
a small candidate set. Each candidate carries:

- `matched`: every field, input term and field value that admitted it;
- what a choice needs without reading the catalogue: `useWhen`, `avoidWhen`, `alternatives`, host,
  parents, and the ids of established examples whose tree uses it.

**It is lexical, and says so.** Input words are compared with the words of compiled fields under one
written rule (equal, or a long shared prefix). There is no stemmer, no synonym list, no embedding, no
model, no external service. A no-argument call returns the intent vocabulary so an agent can narrow by
facets it did not have to guess.

**Order is by written rules, never by a score.** More distinct terms in a naming field (signature,
contract, intent, category); then more distinct naming fields; then more terms outside `avoidWhen`;
then more terms at all; then catalogue order. Every rule is a count a person can redo from `matched`.
A term matching only `avoidWhen` still admits a candidate, on purpose: "this is exactly what that is
not for" is how the agent reaches the alternative that is.

**Recall first, and honest about misses.** `coverage` reports `complete`, `partial` (a term matched
nothing, or `limit` cut candidates), or `none`, and the guidance for the last two is to page through
`get_catalog`.

**What does not change.** The model interprets intent and chooses. `get_catalog` is the exhaustive
list and the authority on what is published; discovery reads the same compiled index and cannot know
a signature the catalogue does not. `validate_ui` is the only judge of a tree, and neither a
candidate nor an example bypasses it. The usage tree is unchanged.

**Examples stop being mandatory.** The instruction to call `get_examples` before every composition
existed because examples were otherwise invisible. Discovery now lists the examples related to its
candidates, so reading one is a step taken when one fits.

## Why this is not the hybrid ADR-0016 rejected

ADR-0016 rejected "complete index primary, ranking as a convenience" because it leaves "ranking code
that almost never decides anything and two discovery paths that have to be evaluated separately." The
first objection no longer holds: discovery now decides the common path, because the complete index no
longer arrives whole. The second is accepted, and paid: the live-agent evals record, per run, whether
`discover_ui` was used, how many catalogue pages were read, and how many calls came before the first
`validate_ui`, and can run the catalogue-first workflow against a build of the previous server
(`--workflow catalog --server`) so the two paths are compared on the same cases.

What stays rejected from ADR-0016: BM25 or any weighted ranker, calibration corpora and Recall@k
thresholds, bilingual aliases, and embeddings. Discovery is a filter with receipts.

## What was rejected

**Semantic search (embeddings or a model in the server).** It would resolve paraphrase and language
gaps, and it would put a probabilistic system in the one place that is supposed to be reproducible
from the artifact hash. Interpreting intent is the calling agent's job.

**A compact index instead.** Worth doing on its own, and not a substitute: at 209 signatures even a
halved index is several calls of reading before any decision, and it would still grow with the
catalogue.

**Folding discovery into `get_catalog` as a filter argument.** Fewer tools, but one tool with two
answers of different kinds (exhaustive vs. narrowed-with-evidence) whose results mean different
things. `get_catalog` stays exhaustive so "absent from every page" keeps meaning "not published".

## Cost

A fifth tool, and discovery code that lives in the compiler (`@skryensya/ai-compiler/discover`) and
must stay deterministic: its tests pin byte-identical output and the ordering rules. Lexical matching
misses what is phrased differently from the overlay; that is visible in `unmatchedTerms` and
`coverage`, and the fallback is the catalogue, not a guess.
