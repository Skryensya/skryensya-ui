---
num: 4
title: Motion is handled with intent tokens
short: "Motion by intent"
summary: >-
  Motion is handled with intent tokens: components describe what a transition means (enter, respond,
  expand), not how long it lasts, so the technical values evolve without touching any API. The validator's
  tier-skip rule already forbids a component from using a raw duration. Reduced motion is not a switch to
  zero: it redefines the same tokens according to their role, so no component changes.
---

Without a language, every team picks arbitrary durations and easings. With one, components describe
**what a transition means**, enter, respond, expand, not how long it lasts, so the technical values
evolve without touching any component's API.

Motion is **not opt-in**: it lives in `primitives.scss` and `semantic.scss`, which means it comes in the
base bundle. If you import `tokens.scss`, it is already included.

## The same three tiers as color

- **Tier 1, technical values, no meaning.** `--scale-duration-{instant,fast,moderate,slow}`,
  `--scale-easing-{linear,standard,enter,exit,emphasized,spring}`.
- **Tier 2, intent.** `--motion-enter-{duration,easing,distance}`, `--motion-feedback-*`,
  `--motion-expand-*`, plus a `--motion-distance-{none,sm,md,lg}` scale.
- **Tier 3, components consume intent, and only intent.**

## Enforced for free by the rule that already existed

Because scale durations and easings are tier 1 primitives, the
[validator's](./0019-public-palettes-and-constant-semantics.md) tier-skip rule **already forbids** a
component from referencing a raw duration: it has to go through an intent token. No new rule was needed,
the color one does the work.

Adjusting a primitive (`fast` from 120 to 100ms) restyles the whole system with zero component edits.
That is the entire point of a semantic API.

```css
/* Build fails: a component does not reach a primitive. */
.sk-dialog { transition: opacity var(--scale-duration-fast); }

/* This is how it is consumed. */
.sk-dialog {
  transition: opacity var(--motion-enter-duration) var(--motion-enter-easing);
  translate: 0 var(--motion-enter-distance);
}
```

## Direction carries meaning

**Entering decelerates** (`easing-enter`) and travels an `md` distance into place. **Exiting
accelerates** (`easing-exit`), lasts less and travels less: about an element that is leaving the decision
is already made, so making the user wait is pure latency. Distance maps hierarchy: `lg` for navigation
and depth, `sm` for inline reveals.

Springs exist as a primitive but are marked **not for critical UI**: the overshoot reads as imprecision.

## Reduced motion is a functional variant, not a switch

A `@media` block that sets every duration to zero is the easy answer and it is wrong: it makes essential
state changes imperceptible. Instead, the same block redefines the **same** intent tokens according to
their role:

| Role | What happens to it |
|---|---|
| **Helpful** (enter, exit, reveal, navigate) | distance to 0, a short fade remains |
| **Essential** (state-change, expand/collapse) | keeps a brief, legible duration |
| **Decorative** (emphasize) | to 0 |
| **Continuous** (loading) | gentler duration; the component should switch to a non-spatial variant |

Because it redefines tokens the components already consume, **no component changes**. The reduction is
systemic, not per component.

## What was rejected

- *Exposing only technical tokens (`duration-fast`, `ease-in-out`).* That is exactly what lets teams
  choose arbitrarily; intent tokens are the whole request.
- *A JS provider as the source of truth.* The tokens are custom properties, so `prefers-reduced-motion`
  works with zero JS. A provider would only be needed to force a mode against the operating system's
  preference.
