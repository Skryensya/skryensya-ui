---
num: 16
title: The catalogue fits in the context
short: "No ranker"
summary: >-
  The rebuild plan called for a weighted lexical ranker, a versioned corpus and Recall@1, Recall@3 and MRR
  thresholds for a catalogue of 52 families. This decision removes the ranking: the complete index (id,
  signatures, intent, avoidWhen, deprecations) fits whole in the model's context, and the model chooses
  better than lexical overlap does. The evals stop measuring where a result ranked and measure the only
  thing that decides anything: whether the final composition was correct.
---

## The problem

`packages/mcp/src/search.ts` ranks by literal word overlap over `{id, surface, use}`. It does not work
well, and the server's own instructions admit it in writing:

> A miss does not mean the component doesn't exist. If your first query returns nothing relevant [...]
> call find_component again with NO intent to read the full catalog directly rather than guessing.
>
> The ranker can rank a related-but-wrong surface above the one you want [...] skim past the #1 result.

A ranker whose documentation teaches the client to ignore it and list everything is a ranker that has
already lost. The plan's answer was to build a better one: field-weighted BM25, bounded fuzzy matching,
a deprecation penalty, a versioned bilingual corpus and agreed thresholds.

For 52 entries.

## The decision

**There is no ranker.** One tool returns the complete, compact index, by family: id, signatures with
their intent and host, `useWhen`, `avoidWhen`, alternatives and deprecations, and the model chooses. The
problem BM25 solves does not exist at this scale, and a model resolves "I need the user to pick a date"
without anyone tokenizing anything for it.

**And there are no bilingual aliases**, which the original plan asked for. They existed to feed the
lexical ranker: a model reads Spanish and English without anyone enumerating synonyms for it. Removing
them took 33% out of the index (5166 -> 3474 bytes for the first two families) and removed an authoring
obligation per signature.

> **Measured cost, not estimated**
>
> The index weighs about 700 bytes per signature as emitted. The catalogue's 52 families, with roughly
> 130 signatures, come to the order of 90 KB, close to 23k tokens: far less than building and calibrating
> a ranker, and considerably more than the "few thousand tokens" this document claimed before the emitter
> existed. If that figure starts to hurt before the catalogue grows, the first move is to emit the index
> in a compact form, not to reintroduce ranking.

**The evals measure the final choice, not the position.** An eval case is not *"this query must return
`date-picker` in the top 3"*: it is *"this product intent must end in a composition that passes the
gates"*. Recall@k measured the quality of an intermediary that no longer exists. What is measured is the
outcome, with the repo's historical regressions as permanent cases: the Button/ButtonLink contradiction,
the nav link outside its group, the ImageFrame with no content.

**The threshold for revisiting this is declared, not intuition:** when the complete index stops fitting
comfortably (on the order of several hundred families, or when the index starts to dominate a typical
task's context budget) an intermediary is needed again, and then it is built against the evals that will
exist by that point.

## What was rejected

**Bilingual BM25 with a corpus and thresholds**, exactly as the architecture document specifies. It
scales if the catalogue grows a lot and makes every result explainable, at the price of building,
calibrating and maintaining a ranker for a catalogue that fits entirely in a prompt.

**A hybrid: complete index primary, ranking as a convenience.** It covers both scales without
committing, and for that very reason it leaves ranking code that almost never decides anything and two
discovery paths that have to be evaluated separately.

**Semantic embeddings.** They would resolve bilingual queries and non-technical product language at a
stroke, but the document itself conditions them on beating a baseline, and they add a model and an index
to a server that currently has neither.

## Cost

The complete index travels in every session that uses the kit, and it grows with the catalogue. In
exchange, the ranker disappears, along with its generated index, its query corpus, its thresholds and the
periodic calibration of all of it.
