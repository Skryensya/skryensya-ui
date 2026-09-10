---
num: 6
title: The monorepo, and the site that consumes the package by the path it teaches
short: "Monorepo and site"
summary: >-
  The repo separates the publishable artifact (packages/core, with no runtime dependencies) from its
  consumer (apps/docs), in a Turborepo with pnpm. The site consumes through the exports map, the Sass path
  it documents as canonical, so if the exports map or the Sass compilation breaks, the site stops
  building: the documentation is verified by construction.
---

Two things live in this repo and they are not the same: `@skryensya/core` is a publishable artifact with
**zero runtime dependencies**, and the documentation site is a **consumer** of that artifact. A flat repo
mixes them, and lets the consumer reach the CSS through a relative `../css/...` path, the shortcut a real
consumer cannot take, so it proves nothing.

## The structure

Turborepo with pnpm workspaces:

- **`packages/core`**, tokens, styling hooks and the shared component contract. Zero runtime
  dependencies, publishable; the `css/` folder is the
  [artifact](./0019-public-palettes-and-constant-semantics.md), `src/` publishes shared parts/types and
  `scripts/lint.ts` is the [validator](./0019-public-palettes-and-constant-semantics.md). The monorepo's
  tooling (turbo, pnpm) lives at the root and in devDependencies; it never enters the package's runtime.
- **`apps/docs`**, the site, an Astro app. It declares `"@skryensya/core": "workspace:*"`; pnpm symlinks
  it into `node_modules`, and the site imports it as a real package.
- **`turbo.json`**, a `lint`/`check`/`dev` pipeline. `lint` caches on the token source, so unchanged runs
  replay in milliseconds.

pnpm is Turborepo's default and gives direct workspace symlinks. npm/yarn workspaces would work too;
pnpm was chosen as an idiom, not out of necessity.

## The site takes the path it teaches

A token package is consumed through a **bare specifier** resolved by the `exports` map
(`@skryensya/core/tokens.scss`), which requires a bundler with Sass. The old raw path through
`node_modules/@skryensya/core/css/...` bypassed the `exports` map; it is no longer the canonical path
because the public entrypoint is Sass and must go through the consumer's pipeline.

The site cannot dodge the choice, because it has to *tell consumers which path to take*. Documenting one
path while practicing the other is the same failure that killed the flat repo: a consumer that reaches
the CSS by a route real consumers cannot take proves nothing.

**`apps/docs` consumes through the `exports` map, documents that path as canonical, and therefore takes
the path it teaches.** If the `exports` map breaks, the site stops building; the documentation is
verified by construction, not by review.

This found a bug as soon as it was set up: making the `exports` map the contract exposed that
`patterns/*` had never been exported. The CSS shipped and [the state layer](./0003-the-state-layer.md)
treats it as public API, but no consumer with a bundler could import it. A demo using the raw path would
never have uncovered it, because the raw path does not consult `exports`. The first honest consumer found
it in minutes.

## The contract requires Sass

There used to be an `apps/demo` that consumed through the raw path. It was deleted; its content moved
into the site. The cost changed with ADR-19: **the public contract now requires a bundler with Sass**.
That is deliberate, the package publishes the source that avoids duplicating generated CSS, and the site
proves it through the same path it teaches: bare specifiers via `exports`.

## The site is the source of new components

The site is the first consumer at any scale: it needs navigation, code blocks, tables and callouts where
`button` was the entire catalogue. That makes it the **source of new components**, which inverts
[the first decision's](./0019-public-palettes-and-constant-semantics.md) advice to design only with
evidence of reuse: with a single consumer there is no such evidence, and waiting for a second one in a
POC means never growing.

Syntax highlighting is its delicate point. It would be the largest color family in the system, and every
token has to clear the [validator's](./0019-public-palettes-and-constant-semantics.md) contrast gate over
two brands and four modes, the first change large enough for the
[known gap](./0019-public-palettes-and-constant-semantics.md) to bite.

## What was rejected

- *Staying flat.* It cannot demonstrate real consumption of the package, and it mixes the publishable
  artifact with its consumers.
- *An off-the-shelf SSG (Starlight, Docusaurus).* Navigation and code blocks arrive solved, but the site
  arrives **wearing the SSG's face**. For a design system, the site looking like the design system is not
  decoration: it is the argument. Astro without Starlight ships no CSS of its own, so every pixel comes
  from the tokens.
- *Keeping `apps/demo` as a witness for the build-free path.* A second consumer maintained only to prove
  a sentence degrades; the cost of not having it is stated above rather than hidden.
