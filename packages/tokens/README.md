# @allison/tokens

A three-tier design token system in **pure, hand-authored CSS**. No build step, no JSON, zero
dependencies. This repo is about the *engineering* of tokens — how the tiers reference each other,
how four theming dimensions compose, and how the rules are enforced by a validator instead of by
hope — not about the specific colours.

```
css/                the design system — hand-authored, this IS the source
  tokens.css        core bundle: declares @layer order, @imports primitives + semantic
  primitives.css    tier 1 — scale (brand-agnostic) + default ramps (OKLCH)
  semantic.css      tier 2 — purpose tokens (light-dark, density), @property --ds-density
  brands/dusk.css   opt-in brand: overrides ONLY tier-1 ramps
  modes/hc.css      opt-in high-contrast: overrides tier-2 colour
  components/button.css  opt-in tier-3 hooks, scoped to .ds-button
  patterns/state-layer.css  opt-in state layer (hover/focus/pressed/selected/dragged)
contrast-pairs.json the contrast contract the validator checks
scripts/lint.mjs    the CSS-native validator (zero deps)
demo/index.html     all four dimensions live on one component
docs/decisions.md   ADRs — WHY the system is shaped this way (ADR-12 records the pure-CSS pivot)
```

```bash
npm run lint          # parse the CSS, enforce the five rules. No build — the CSS ships as-is.
open demo/index.html
```

There is nothing to build. `css/` is the artifact.

## The three tiers, and the one rule that makes them worth having

| Tier | Answers | Example | May reference |
|------|---------|---------|---------------|
| **1 primitive** | what values exist | `--ramp-accent-600: oklch(56% .2 255)` | nothing |
| **2 semantic** | what it means | `--color-action-primary: light-dark(var(--ramp-accent-600), …)` | tier 1, or sideways within tier 2 |
| **3 component** | where it's used | `--ds-button-bg: var(--color-action-primary)` | tier 2 only |

The rule: **references point down, never up, and tier 3 may never skip to tier 1.** A component hook
that reaches straight into a ramp bypasses the mode-switching in tier 2, so it — and only it — breaks
in dark mode, which nobody notices until production. `scripts/lint.mjs` fails on it. That single
constraint is what a three-tier system buys you; without enforcement it is just three folders.

Tier 3 is **opt-in**: `components/button.css` is scoped to `.ds-button`, never `:root`. A consumer
that ships no buttons imports none of it.

## The cascade layer IS the tier boundary

`tokens.css` declares `@layer primitives, semantic, components, overrides`. A later layer wins, so:

- `brands/dusk.css` and `modes/hc.css` sit in `overrides` and beat base `semantic`/`primitives`
  **regardless of `<link>`/`@import` order** — no more "import this after that";
- any **unlayered** consumer rule beats every layer, so an app overrides a hook with no specificity
  fight: `.hero .ds-button { --ds-button-bg: rebeccapurple }`.

## Four dimensions that compose instead of multiply

Three brands × three colour modes × two densities is 18 combinations, but they collapse to a handful
of files because **each dimension owns a different layer**:

| Dimension | Owns | Mechanism | File |
|-----------|------|-----------|------|
| **Brand** | tier-1 ramps | swap the primitive palette | `brands/dusk.css` |
| **Colour mode** (light/dark) | tier-2 colour | `light-dark()` picks a slot via `color-scheme` | `semantic.css` |
| **High contrast** | tier-2 colour | override block re-declares the same tokens | `modes/hc.css` |
| **Density** | tier-2 spacing | runtime `--ds-density` multiplier | `semantic.css` |

Because semantic tokens reference *ramp positions* (`accent-600`), never *hues* (`blue`), a brand
swap is a pure tier-1 override — `brands/dusk.css` contains **zero semantic tokens**, the proof the
dimensions are orthogonal. `dark × dusk × compact` exists nowhere on disk; the cascade computes it live.

## Three platform constraints that shaped the CSS

1. **`light-dark()` takes exactly two `<color>` args.** Three colour modes don't fit, so high
   contrast is a separate override block, not a third argument. And non-colour tokens can't be
   mode-aware — which is why a shadow's *colour* is its own token (`--shadow-md`) and `--elevation-*`
   is a composite that references it.

2. **Density can silently break accessibility.** `--size-control-*` emit
   `max(round(calc(base × var(--ds-density)), 2px), 24px)` — the WCAG 2.2 floor is inside the token
   where no consumer can multiply past it; `round(…, 2px)` keeps compact values from shimmering.

3. **Pure CSS has no build-time reference check.** An unresolved `var()` fails silently at runtime.
   That is the one thing SD gave us that CSS doesn't — so the validator closes exactly that gap.

## What the validator enforces (`npm run lint`)

Zero dependencies. It parses the `.css` with a minimal regex parser (honest: only our own known-shape
CSS, comments stripped first) and checks, **across every brand**:

1. **refs-resolve** — every `var(--x)` points at a declared property.
2. **tier-direction** — references point down or sideways; a component hook never reaches a ramp.
3. **mode-complete** — the base `light-dark()` token set equals the high-contrast override set; every
   `light-dark()` has exactly two colours; the two hc blocks haven't drifted.
4. **contrast** — every pair in `contrast-pairs.json` clears its WCAG ratio in its mode, computed by
   resolving `var()` chains to OKLCH literals and converting to relative luminance.
5. **name-shape** — lowercase kebab.

## State layers (interaction states)

`patterns/state-layer.css` adds a **state layer** — one semi-transparent overlay that signals hover,
focus, pressed, selected and dragged — to any element that opts in with `class="ds-interactive"`. The
tint is `currentColor` (the component's own content colour), so a single token works on neutral
surfaces *and* saturated fills, in both modes and every brand, with zero per-component colour tokens.
Exactly one layer is active at a time, by the priority `disabled > dragged > pressed > focus > hover >
selected`; opacities are never summed. The layer is never the only cue — focus, selection and disabled
each carry an independent indicator. See [docs/decisions.md](docs/decisions.md) ADR-13, and the
"State layers" section of the demo.

## Motion (intent-based tokens)

Motion is a **motion language** built the same way as colour: tier-1 technical primitives
(`--scale-duration-*`, `--scale-easing-*`) → tier-2 **intent** tokens that describe purpose
(`--motion-enter-*`, `--motion-feedback-*`, `--motion-expand-*`, …, plus a `--motion-distance-*` scale)
→ components consume intent only. Because the raw durations are tier-1 primitives, the validator's
tier-skip rule already forbids a component from hardcoding a duration — it must go through an intent
token, so retuning a primitive restyles the whole system. **Reduced motion is a functional variant**:
a `@media (prefers-reduced-motion: reduce)` block in `semantic.css` redefines the intent tokens by role
(Essential / Helpful / Decorative / Continuous) rather than zeroing them, so essential changes stay
legible. See [docs/decisions.md](docs/decisions.md) ADR-14.

## Consuming

```css
@import "@allison/tokens/tokens.css";              /* required: primitives + semantic + @layer  */
@import "@allison/tokens/brands/dusk.css";         /* optional: reskin (apply via data-brand)    */
@import "@allison/tokens/modes/hc.css";            /* optional: high-contrast mode               */
@import "@allison/tokens/components/button.css";   /* optional: only if you ship buttons          */
```

You write the component's structural CSS and consume the hooks (see `demo/index.html`); the system
ships only the hooks. Override any instance from outside without a new token.

Set the colour mode before first paint to avoid a flash — read `localStorage` synchronously in a
`<head>` script and set `color-scheme` on `<html>` (see the FOUC guard at the top of the demo).

## Migration note

This was a Style Dictionary + JSON pipeline until v0.2. See [docs/decisions.md](docs/decisions.md)
ADR-12 for why it became pure CSS — the short version: SD was reimplementing the browser's runtime at
build time for a web-only system, so deleting the build layer removed complexity instead of moving it.
