---
num: 19
title: Public palettes and constant semantics
short: "Public palettes"
summary: >-
  Core stops publishing tier 1 role ramps. It publishes Tailwind-like palettes with no meaning as raw
  material, and expresses brand, feedback, surfaces, text and borders as explicit semantic bundles that
  do not derive color combinations at runtime.
---

The color model changes from `ramp -> semantic` to `palette -> semantic`. A **Palette** is tier 1, is
named by hue (`--palette-slate-500`, `--palette-blue-600`) and uses the Tailwind `50`-`950` scale, plus
`--palette-white` and `--palette-black`. The values are the OKLCH ones Tailwind publishes; Core may pick
different semantic rungs if a contrast pair demands it, but it does not alter the base palette.

The semantics (`--color-*`) remain the layer that names meaning: surfaces, text, borders, actions,
accent and feedback. They may reference palettes and `light-dark()`, but they do not generate colors
with `color-mix()` or Sass recipes. A tier 3 component or styling hook never references `--palette-*`;
it only consumes semantics. That is the new rule replacing "tier 3 never reaches a ramp".

## Brand, accent and feedback

`accent` stops being a ramp. It is a complete semantic bundle: action primary, text accent/link, border
accent/focus and bg accent subtle all change together. The default brand may point at `blue`; a tenant
does not create `--palette-accent-*`, it re-declares the accent semantic bundle.

`danger`, `success`, `warning` and `info` also stop being ramps. They are semantic feedback roles that
read `red`, `emerald`, `amber` and `sky` by default. Feedback never reads accent: an informational
notice does not change meaning when the brand changes.

The `accent reach` dimension disappears. Navigation current states use accent directly; badges, tags,
kbd and decorative markers use accent's base semantics; ghost/quiet actions stay on
`--color-text-primary`; the media gradient uses `--color-action-accent`. There is no `data-accent` left,
and no global `--color-decorative-*`, `--color-nav-current-*`, `--color-action-quiet-fg` or
`--color-decorative-wash` tokens.

## What it supersedes

This decision supersedes the parts of ADR-0019, ADR-0019, ADR-0019, ADR-0019 and ADR-0019 that assumed
role ramps as a public primitive. It keeps three invariants from those decisions: components do not
consume tier 1, contrast is validated against the CSS that ships, and the brand is expressed as ordinary
CSS with no `data-brand` selector.

## Accepted cost

The system publishes many more tier 1 variables than before because it exposes every Tailwind-like
palette, several neutrals included. That is accepted because those variables are auditable constants,
they avoid runtime color generation, and they give a common base to products that need to re-declare
semantic bundles without inventing a palette of their own from scratch.
