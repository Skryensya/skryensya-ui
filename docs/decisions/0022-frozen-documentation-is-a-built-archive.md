---
num: 22
title: Frozen documentation is a built archive
short: "Freeze the build, not the content"
summary: >-
  Versioned docs are usually built as a content store: a page is stored per version, an entry is
  written only when it changes, and a resolver walks backwards until it finds one. That model assumes
  a page is prose. Here a page is code that composes live demos, a compiled manifest and a test
  report, and only two of a component page's seven surfaces are written by hand. This decision makes
  a frozen version the BUILT OUTPUT of the tree at the moment of the cut, archived and served under
  `/v<version>/`, so inheritance is git and the archive is the record. No resolver, no per version content
  store, and no new file that has to be kept in sync with reality.
---

## The problem

Nothing is published yet (`contracts/changelog/releases.yaml` holds `releases: []`), so the shape of
versioned documentation is still a free choice. The obvious shape, and the one every documentation
tool ships, is a content store keyed by document and version: store an entry only when a document
changes, and resolve a request for version `V` by walking `V`, `V-1`, `V-2` until an entry turns up.

That shape is correct when a page is prose. Measured against this site, it is not:

- A component page has **seven surfaces** (`usage`, `install`, `contract`, `style`, `a11y`, `tests`,
  `changes`) and exactly **two** are written by hand. `contract`, `style` and `a11y` are projected
  from `artifacts/ai-manifest.json`, `tests` from `artifacts/test-results.json` keyed by the verbatim
  title of each `it()`, and `changes` from the contract changelogs. Freezing "the prose" freezes two
  of seven and leaves five describing today's code under yesterday's URL.
- The authored half is not extractable either. `ButtonPage.astro` interleaves about twenty `t(...)`
  calls with eleven `<ComponentPreview>` trees and three code samples, and what changes across a
  major is usually the STRUCTURE (which section exists, which demo sits under it), not a string.
- Internal links cannot be parameterised at the source. A scan of `apps/docs/src` finds **950
  root-relative links that resolve to real routes, across 186 files**, and a large share of them sit
  inside translated message strings as literal `<a href="/foundations">` HTML. There is no seam that
  makes those base-aware without templating every message.
- Preview stages are iframes whose frame document copies the `<head>` of the page that owns them. In
  a content store, serving a v1 page from a v3 build means deciding, per frame, which era's CSS gets
  copied. There is no honest answer to that question.

So the store buys deduplication and pays with a resolver, tombstone semantics, a `since` field, a
version by locale matrix, and five surfaces that would have to be pinned one by one to stop lying.

## The decision

**A frozen docs version is the output of `astro build` at the moment of the cut, archived and served
under `/v<version>/`. `current` stays exactly as it is today, in the bare URLs. Inheritance between
versions is provided by git, not by a resolver.**

Three consequences follow, and they are the point:

1. **The archive is the record.** Which documents existed in v1 is answered by v1. No table asserts
   it separately, which means no table can be wrong about it. The same holds for which manifest
   described that version: its `sourceHash` is baked into the pages it produced.
2. **Every surface is frozen together, so they stay true to each other.** The demos in `/v0.0.1-dev/` run
   the CSS and JS of their own era, the Reference shows the contract of that era, and the test panel
   shows the run of that day. That is the same rule the rest of this repository follows: evidence is
   rendered, not asserted (ADR-0015).
3. **Nothing new is written by hand.** The list of versions is `git tag --list 'docs-v*'`, the cut
   date is the tag's, and what is served is what the deploy has mounted. There is no release
   MAPPING at all, because an archive is named after the release it was cut from and carries that
   name into the URL (`/v0.0.1-dev/components/button`): the shared ledger (`releases.yaml`) stays
   the only thing that numbers anything. Exactly one fact is not derivable, because it is editorial rather than
   factual: whether a version is deprecated. It lives as one constant where the banner is drawn.

The cut rewrites root-relative URLs in the built output rather than in the source, which is what
makes the 950 links above a non-issue: one pass over the archive covers attribute URLs and the
escaped URLs inside island props at once, and the preview frames inherit it because they assemble
themselves from the parent document at runtime.

## What was rejected

**A content store with backward inheritance.** Rejected for the reasons above. It is the right model
for a site whose pages are documents; it is the wrong model for a site whose pages are programs. It
stays available as a later phase if editing historical prose ever becomes routine, which is the one
thing the archive genuinely does badly.

**Pinning the packages per version and rebuilding old docs on demand.** Correct in the abstract and
expensive in practice: an npm graph, a CSS bundle and a demo set per cut, plus the standing risk
that a two year old toolchain no longer builds. Building once, at the cut, and keeping the output
removes the risk instead of scheduling it.

**Live demos under frozen URLs.** This is the one option that is not merely expensive but wrong: a
`/v0.0.1-dev/` page running today's workspace claims a correspondence between text and behaviour that does
not exist, which is the failure mode this system is built to avoid.

**A `docs-versions.yaml` ledger.** Rejected late, and worth recording. It began as a projection of
`releases.yaml` holding only documentation fields, which is better than a second numerator, but it
is still a hand written file that is born empty and has to be kept in step with the deploy. Every
field it would have held is derivable from a tag, the archive or the deploy itself.

## Cost

Around **110 MB per frozen version**. The current `dist` is 140 MB, of which 111 MB is HTML across
149 pages (median 466 kB, largest 5.7 MB for `comment-thread`) and only 4.5 MB is shared `_astro`
output, so deduplicating assets between versions would save almost nothing. The archive is a release
artifact, never committed, and the retention rule is that the two most recent frozen versions are
served while older ones redirect to latest.

The other cost is stale chrome: a frozen page keeps the sidebar, the search index and the switcher
of its era. This is accepted and signposted with a banner that is baked in at the cut and links
forward to the same document in latest. The alternative, re-rendering old content inside today's
chrome, is the content store, and it is what this decision declines.

None of the machinery is built yet. `releases: []` means there is no frozen version to serve, and
the plan that carries this decision gates the cut script, the routes and the switcher behind a
first real release, a second major in flight, and an identifiable consumer pinned to the old one.
