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
written rule (equal, a plural, or a shared stem whose tails stay short; see the amendment below).
There is no stemmer, no synonym list, no embedding, no model, no external service. A no-argument call
returns the intent vocabulary so an agent can narrow by facets it did not have to guess.

**Order is by written rules, never by a score.** Naming evidence first (more distinct terms in a
naming field; then more terms in one naming value; then more terms equal to a whole naming value or its plural;
then more distinct naming fields), then positive evidence (more terms outside `avoidWhen`), then
FEWER terms in `avoidWhen`, then catalogue order. Every rule is a count a person can redo from
`matched`. A term matching only `avoidWhen` still admits a candidate, on purpose: "this is exactly
what that is not for" is how the agent reaches the alternative that is. It never makes a candidate
look better than one without it.

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

## Amendment, 2026-09-26: a stricter match rule, simple negation, and `avoidWhen` as a conflict

Measured by running every eval prompt, in both languages, against the real index. Three problems,
each with a deterministic fix that keeps every property above.

**The match rule took four shared letters for a stem.** "Equal, or a shared prefix of max(4, shorter
- 2)" let `active` meet `action`, `three` meet `thread`, `page` meet `pager`, `headline` meet
`header`, `prominent` meet `prompt`, `accent` meet `accept`, `time` meet `timeline`, `work` meet
`workflow`, `oversized` meet `over` and `overlapping` meet `overlays`. A prompt about a pricing
button listed the whole `TablePager` family above `Button.navigation`; one about an FAQ listed
`CommentThread`. The rule is now: equal; or a plural `s`/`es`; or a shared prefix of 7; or of 5-6
with both tails at most 3 (or one word the other plus at most 4: `navega`/`navegacion`); or of
exactly 4 where the INPUT word is the field word plus at most 3 (`lista`/`list`, `opening`/`open`),
or both go on by one letter (`tabla`/`table`). The accidental pairs share a prefix and then diverge;
the inflections extend. A catalogue word extending a short input word is usually another word
(`page`/`pager`, `view`/`viewer`), which is why the four-letter case is directional. Every refused
and every kept pair is pinned in `discover.test.ts`. A query word is also no longer split at
camelCase, so "JavaScript" is `javascript` the way every intent spells it, while a field id is read
both split and whole (`NavListLink` offers nav, list, link and navlistlink).

Known residue, left rather than fixed with a word list: `editorial` still meets `editor`, and
`breakout` meets `break`. Lexically they are `select`/`selection`, which must stay.

**Negation inverted intent.** Function words were dropped and the words after them kept, so "a
switch, with no save button" searched for `save` and `button`, and `SplitButton` (intent
`save-and-save-as`) ranked first. A negator (`no`, `not`, `without`, `never`; `sin`, `no`, `ni`,
`nunca`; `n't`) now negates the next three content words of its clause; punctuation, or a word that
opens a new clause (`and`, `but`, `with`; `y`, `pero`, `sino`, `con`), ends it early. Negated terms
are returned in `input.negated`, never admit a candidate, and never improve its order. Where one
matches a candidate admitted otherwise it is still reported, as `negation: "query"`, because it is
evidence about `avoidWhen` and alternatives. When the matched value negates the term too
(`faq-without-javascript` for "an FAQ without JavaScript") the two agree, it is `negation: "both"`,
and it counts. This is not a parser: a postposed negation ("JavaScript disabled") is not recognised,
and a positive term that meets a negated field word still counts, since the input may have negated
it in a form this does not read.

**`avoidWhen` could only help.** The fourth rule counted terms matched anywhere, so a candidate whose
`avoidWhen` named the case outranked an otherwise equal one whose did not. It now ranks below it.
Two naming rules were added above it, both counts over reported values: more terms in ONE naming
value (`view switcher` meeting `view-switcher` beats "view" in one id and "list" in another intent),
and more terms equal to a whole naming value or its plural ("button" IS the `button` family and only
part of `state-button`). To keep those recomputable, when a term matches several values of one field the one
reported is the value most terms match, then the one equal to the term, then the first.

**Vocabulary, not code.** `MediaCaption` and `MediaGradient` gain `text-over-an-image` intents and
`Heading` gains `headline`: the catalogue's own noun for media is "image" (`ImageFrame`, `Lightbox`,
`Avatar.image`), and those two only said "photo". No query is special-cased anywhere in
`discover.ts`; `discover.test.ts` states discovery quality on five real prompts as properties
(Button.navigation above the pagers, Switch first with no SplitButton, DetailsGroup above Accordion,
Segmented above generic lists, the expressive primitives in the default candidate set), not as a
pinned list.

## Amendment, 2026-09-26 (second pass): endings, one postposed negation, whole-phrase agreement

**Stem plus endings replaces the tail limits.** The first amendment still let `editorial` meet
`editor`, `breakout` meet `break` and `linkedin` meet `linked`: a shared prefix and a short tail is
exactly what a compound looks like. The rule is now that two words match when they are equal or a
plural, share 7 letters, or are ONE STEM PLUS ENDINGS: some shared prefix of at least 4 letters after
which each word has nothing left or an ending from a closed, written list of English and Spanish
inflections (`-e`, `-s`, `-ed`, `-er`, `-ing`, `-ion`, `-ly`, `-able`, `-n`; `-a`, `-o`, `-ar`,
`-ado`, `-acion`, `-mente`, …), optionally after a doubled consonant (`label` + `led`). That keeps
`close`/`closing`, `cambia`/`cambiar`, `navegar`/`navegacion` and `select`/`selection`, and refuses
`-ial`, `-out`, `-in`, `-r`. It is the smallest step toward a stemmer that closes the gap, and it
stops there: a list of endings, never a dictionary of words.

**One postposed negation.** "Works with JavaScript disabled" meant "without JavaScript" and was read
as asking for JavaScript. The absolute construction `with X disabled|off` (`con X
desactivado|deshabilitado|apagado`), with exactly one word for X, now negates X. Exactly one, because
"a form with the submit button disabled" describes a button that is there.

**Agreement needs the whole negated phrase.** Once the overlay was English, "a switch with no save
button" agreed with Hero's "never a row of buttons", since both negate `button`. A negated term now
counts only where the value negates EVERY word of the input's negated phrase: Switch's "there is no
save button involved" agrees with "no save button"; Hero's line does not.

**The overlay is English (ADR-0021).** 838 of its 879 lines were Spanish, so an English query met
almost none of the catalogue's judgment. Translated by hand. Measured over the eval prompts, the share
of each reference tree's signatures in the default candidate set went from 43/51 to 46/51 in English
and from 37/51 to 30/51 in Spanish, whose words now meet the catalogue only through cognates. The
agent writes the query, not the end user, so `discover_ui` and its guidance now say the catalogue is
English and to query in English. Two overlay lines were reworded because they described the thing in
words nobody searches with: Button.navigation "takes the visitor to another page or URL", and
MediaCaption's text "overlaps the photo or image".

