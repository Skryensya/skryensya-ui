# @skryensya/core

A three-tier design token system and shared component contract. The token entrypoint is Sass, compiled by
the consumer's pipeline, with no generated token CSS committed for Sass-authored files. This package is the core
package of the [skryensya/ui](../../README.md) Turborepo; it's about the *engineering* of tokens
and shared component parts, how tiers reference each other, how theming dimensions compose, and how rules
are enforced by a validator instead of by hope.

```
packages/core/            ← this package (tokens + shared contract)
  css/
    tokens.scss             core Sass bundle: all token tiers and the root ramps
    primitives.scss         tier-1 entrypoint, ramps, scale, type and motion
    primitives/_ramps.scss  explicit default root ramps
    semantic.scss           tier-2 purpose tokens (light-dark, density, motion, state layer)
    semantic/               tier-2 source partials (color, space, size, radius, type, motion, state)
    scripts/build-css.mjs   generates dist/skryensya.css, the batteries-included <link> bundle
    modes/hc.scss           opt-in Sass high-contrast: overrides tier-2 color
    dimensions/radius.scss  opt-in Sass roundness dimension: overrides tier-2 radius roles
    components/button.css   opt-in tier-3 hooks, scoped to .sk-button
    patterns/state-layer.css  opt-in state layer (hover/focus/pressed/selected/dragged)
    patterns/scrollbar.css    opt-in: paint native scrollbar (always-on or reveal on hover)
    patterns/scroll-lock.css  opt-in: freeze page behind dialog:modal + stable scrollbar gutter
  contrast-pairs.json       the contrast contract the validator checks
  scripts/parse.mjs         the stylesheet parser, shared by the validator and docs reference
  scripts/lint.mjs          the stylesheet-native validator, five rules
```

`tokens.scss` is the complete token entrypoint. It ships one root ramp set; consumers replace complete
role ramps in their own unlayered `:root` stylesheet. Core exposes no color-generation input, brand
selector, or HTML attribute.

```bash
pnpm lint             # from repo root: turbo runs this package's validator
pnpm --filter @skryensya/core lint   # just this package
pnpm --filter @skryensya/docs dev      # serve the docs site, consuming this package via node_modules
```

Consumers import `tokens.scss`, optional dimension entrypoints, and the plain CSS hooks they use. The token
entrypoint includes the root ramps, so no second import or selector is needed.

## The three tiers, and the one rule that makes them worth having

| Tier | Answers | Example | May reference |
|------|---------|---------|---------------|
| **1 primitive** | what values exist | `--ramp-accent-600: oklch(56% .2 255)` | nothing |
| **2 semantic** | what it means | `--color-action-primary: light-dark(var(--ramp-accent-600), …)` | tier 1, or sideways within tier 2 |
| **3 component** | where it's used | `--sk-button-bg: var(--color-action-primary)` | tier 2 only |

The rule: **references point down, never up, and tier 3 may never skip to tier 1.** A component hook
that reaches straight into a ramp bypasses the mode-switching in tier 2, so it, and only it, breaks
in dark mode, which nobody notices until production. `scripts/lint.mjs` fails on it. That single
constraint is what a three-tier system buys you; without enforcement it is just three folders.

Tier 3 is **opt-in**: `components/button.css` is scoped to `.sk-button`, never `:root`. A consumer
that ships no buttons imports none of it.

## The cascade layer is the tier boundary

`tokens.scss` declares `@layer primitives, semantic, components, overrides`. The root ramps are tier 1
inside `primitives`; high contrast and optional dimensions use `overrides` and beat lower layers regardless
of source order. A consumer's unlayered CSS beats every layer, so brand tooling can emit the tier-1
contract directly:

```scss
@import "@skryensya/core/tokens.scss";
@import "./brand-ramps.css";
```

`brand-ramps.css` declares every position of each role it replaces, for example
`--ramp-accent-50` through `--ramp-accent-950`. Core performs no implicit runtime derivation.
Semantic tokens keep referencing role positions, never hues, so `accent-600` has one meaning
regardless of the configured identity. A complete ramp is deliberately verbose but auditable:
contrast tools validate exactly the values the application ships.

## Four dimensions that compose

| Dimension | Owns | Mechanism | File |
|-----------|------|-----------|------|
| **Color mode** | tier-2 color | `light-dark()` picks a slot | `semantic.scss` |
| **High contrast** | tier-2 color | override block re-declares the same tokens | `modes/hc.scss` |
| **Density** | tier-2 spacing | runtime `--sk-density` multiplier | `semantic.scss` |
| **Radius** | tier-2 radius | `data-radius` override block | `dimensions/radius.scss` |

Density's invariant is the WCAG touch-target floor. Radius leaves `--radius-pill` alone because a pill is a
shape, not a roundness setting.

## Three platform constraints that shaped the CSS

1. **`light-dark()` takes exactly two `<color>` args.** Three color modes don't fit, so high
   contrast is a separate override block, not a third argument. And non-color tokens can't be
   mode-aware, which is why a shadow's *color* is its own token (`--shadow-md`) and `--elevation-*`
   is a composite that references it.

2. **Density can silently break accessibility.** `--size-control-*` emit
   `max(round(calc(base × var(--sk-density)), 2px), 24px)`, the WCAG 2.2 floor is inside the token
   where no consumer can multiply past it; `round(…, 2px)` keeps compact values from shimmering.

3. **Pure CSS has no build-time reference check.** An unresolved `var()` fails silently at runtime.
   That is the one thing SD gave us that CSS doesn't, so the validator closes exactly that gap.

## What the validator enforces (`npm run lint`)

It parses the source stylesheets with a minimal regex parser and checks the one root ramp set:

1. **refs-resolve**, every `var(--x)` points at a declared property (or carries a fallback).
2. **tier-direction**, references point down or sideways; a component hook never reaches a ramp.
3. **mode-complete**, the base `light-dark()` token set equals the high-contrast override set.
4. **contrast**, every pair in `contrast-pairs.json` clears its WCAG ratio in every declared mode. The
   validator resolves nested `color-mix(in oklab, …)` expressions to real OKLCH before measuring.
5. **name-shape**, declared names are lowercase kebab.

## State layers

`patterns/state-layer.css` adds one semi-transparent overlay for hover, focus, pressed, selected and dragged
to any element that opts in with `class="sk-interactive"`. It tints with `currentColor`, so the same mechanism
works on neutral surfaces and saturated fills in both color modes. Exactly one layer is active at a time;
focus, selection and disabled state each retain an independent indicator.

## Motion (intent-based tokens)

Motion is a **motion language** built the same way as color: tier-1 technical primitives
(`--scale-duration-*`, `--scale-easing-*`) → tier-2 **intent** tokens that describe purpose
(`--motion-enter-*`, `--motion-feedback-*`, `--motion-expand-*`, …, plus a `--motion-distance-*` scale)
→ components consume intent only. Because the raw durations are tier-1 primitives, the validator's
tier-skip rule already forbids a component from hardcoding a duration, it must go through an intent
token, so retuning a primitive restyles the whole system. **Reduced motion is a functional variant**:
a `@media (prefers-reduced-motion: reduce)` block in `semantic.scss` redefines the intent tokens by role
(Essential / Helpful / Decorative / Continuous) rather than zeroing them, so essential changes stay
legible. See [decision 10](../../docs/decisiones/0010-motion-por-tokens-de-intencion.md).

## One root brand, configured through complete ramps

The package intentionally ships one explicit default ramp configuration. The public color
interface is the tier-1 `--ramp-{role}-{position}` set itself. A consumer replaces the complete
roles owned by its brand:

```scss
@import "@skryensya/core/tokens.scss";
@import "./brand-ramps.css";
```

The brand stylesheet is normally generated by design tooling, but its output is ordinary,
unlayered CSS. There is no hidden root input, computed recipe, selector, or markup state in Core.
This clean cut keeps generation policy outside the runtime contract and makes partial overrides
visible during review.

The validator measures the defaults shipped by Core. Consumers validate their generated ramps,
just as they validate any unlayered override.

## Consuming

**With a bundler.** Import the token entrypoint and only the component hooks you ship:

```scss
@import "@skryensya/core/tokens.scss";
@import "@skryensya/core/modes/hc.scss";            /* optional */
@import "@skryensya/core/dimensions/radius.scss";   /* optional */
@import "@skryensya/core/components/button.css";    /* optional */
```

**Without a toolchain.** Link the batteries-included bundle, tokens, every component and every pattern in
one stylesheet:

```html
<link rel="stylesheet" href="node_modules/@skryensya/core/skryensya.css">
```

`dist/skryensya.css` is generated by `npm run build:css`, never committed, and shipped in the published tarball.

You write the component's structural CSS and consume the hooks (see
`../../apps/docs/src/examples/button.css`, the whole contract in ~30 lines); the system ships only
the hooks. Override any instance from outside without a new token.

Bare specifiers resolve through this package's `exports` map, so they need a bundler. That is the
canonical path (decision 12) and the one the docs site takes.

Set the color mode before first paint to avoid a flash, read `localStorage` synchronously in a
`<head>` script and set `color-scheme` on `<html>` (see the FOUC guard in
`../../apps/docs/src/layouts/Base.astro`).

## Migration note

This was a Style Dictionary + JSON pipeline until v0.2. See [decision 6](../../docs/decisiones/0006-css-puro-sin-build.md)
for why it became pure CSS, the short version: SD was reimplementing the browser's runtime at
build time for a web-only system, so deleting the build layer removed complexity instead of moving it.
