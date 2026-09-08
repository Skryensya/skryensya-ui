---
num: 21
title: English is the repository language, and Spanish is a product locale
short: "English repo, Spanish locale"
summary: >-
  `CONTEXT.md` split language three ways: Spanish for documentation and decision records, English for
  code, and either one for comments "when locally consistent". The third clause never constrained
  anything, and the first two assumed every artifact is either documentation or code. Neither holds:
  `contracts/semantic` is data a machine reads and prose a reader sees. This decision replaces the
  three-way split with one question, whether an artifact is addressed to a reader of the product or to
  a contributor, and one test that answers it: does a counterpart exist in the other language?
---

## The problem

The rule read, in full:

> User-facing documentation and decision records are written in Spanish. Code, identifiers, and
> repository metadata are written in English. Comments may use either language when locally consistent.

Three clauses, and by the time this was written all three were false in the tree. The decision records
are being translated to English. The routes moved so that English holds the base paths and Spanish
moved to `/es/` (ADR-0021 does not decide that; `de43b6b` already did). And the comment clause had
produced **1,687 lines of Spanish comments across 246 files**, including the header essays of
`patterns/anchored.css`, `core/src/icon.ts` and `vanilla/runtime/apply.ts`, which are where this system
explains itself.

The comment clause is the one worth naming, because it failed as *written*, not through neglect.
"Locally consistent" is satisfied by any file that is internally uniform, so every file passes on its
own and the repository has no rule at all. A constraint that every instance satisfies individually does
not constrain the aggregate.

The deeper failure is the partition. Spanish-for-docs and English-for-code assumes an artifact is one or
the other. Three are neither:

- `contracts/semantic/*.yaml` is a data file the compiler reads (`ai-compiler/src/overlay.ts`) and
  simultaneously the judgment prose rendered on a component page and served to an agent through
  `get_catalog`.
- `contracts/recipes/*.ts` is TypeScript whose `intent` and `notes` fields are prose.
- `package.json` carried a ten-line Spanish rationale as a JSON array under `pnpm.comment-overrides`,
  which is repository metadata, code, and a comment at once.

Under the old rule each of those had a defensible claim to either language, which is how they ended up
in the one nobody chose deliberately.

## The decision

**One question decides the language of any artifact: is it addressed to a reader of the product, or to
a contributor?** Product-facing text is a locale and is translated. Everything else is English, in one
copy.

**And one mechanical test answers it: does the artifact have a counterpart in the other language?**
This is checkable, unlike "user-facing", which is an argument.

| | Test | Language |
|---|---|---|
| Docs site pages | `/components/x` and `/es/componentes/x` both exist | Both, real files |
| `contracts/changelog/*.yaml` | every entry carries `es:` and `en:` keys | Both, in one file |
| `contracts/semantic/*.yaml` | **no** language keys, single copy | English |
| `contracts/recipes/*.ts` | single copy | English |
| Code, comments, identifiers | single copy | English |
| `docs/**`, `docs/decisions/**` | single copy | English |
| Repository metadata | single copy | English |

The test is not a formality. `contracts/changelog/button.yaml` has 14 language keys; every file in
`contracts/semantic/` has zero. Two directories that sit beside each other and look alike are on
opposite sides of the line, and the test tells them apart without anyone relitigating what "user-facing"
means for a YAML file an agent reads.

**A single Spanish copy is not "the Spanish version". It is untranslated repository content.** That
sentence is the whole decision. A reader who picks English and reaches Spanish prose has not found a
locale, they have found a gap, and the gap is invisible precisely because Spanish looks intentional
here.

## What was rejected

**Keeping the comment clause and enforcing it per-directory.** It preserves the freedom to write a
comment in whichever language the idea arrives in, which is a real benefit when the person writing is
thinking in Spanish. It was rejected because the artifact it protects is the one with the widest and
least chosen audience: a comment is read by every contributor and every agent that opens the file,
including the ones who never load the docs site. The header of `anchored.css` is the system's
explanation of its own hardest mechanism; making that reachable only in Spanish costs more than the
convenience returns.

**Translating the docs site to English as well.** Symmetrical, and it would delete the Spanish product:
`apps/docs/src/pages/es/**` and `apps/docs/src/i18n/messages/**` are roughly 9,400 lines that exist so
the site can be read in Spanish. The site being bilingual is the reason the repository can afford to be
monolingual.

**Machine translation for the backlog.** It closes the gap in an afternoon. It was rejected for the
prose that carries judgment, `contracts/semantic`'s `useWhen`/`avoidWhen` above all, because those
sentences are the reason a signature is chosen over its neighbour, and a translation that is merely
adequate turns a decision into a description. The measured cost of doing it by hand is in the next
section; it is not large enough to justify losing that.

## Cost

**Stated, and it is ongoing.** Every new piece of product prose is authored twice, and a contributor
whose first language is Spanish now writes comments, decision records and contract judgment in their
second. That cost is real and falls on the people doing the most work in this repo.

What it buys is that the second language is never *required to read the system*. Spanish is offered to
whoever wants the product in Spanish, and is never the only place an explanation exists.

**The remaining migration is tracked in `docs/pending-tasks.md`, not here**, so this record does not
have to be edited every time a file moves. As of 2026-09-08 the code comments and the templated headers
of all 79 changelog and 78 semantic files are done; `contracts/semantic` and `contracts/recipes`
(~2,105 lines) are the largest gap, and they are the ones the test above marks as a gap rather than a
locale.
