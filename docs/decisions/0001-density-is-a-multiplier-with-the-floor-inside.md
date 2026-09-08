---
num: 1
title: Density is a multiplier with the WCAG floor inside it
short: "Density"
summary: >-
  Density is a runtime multiplier (--sk-density), not a second set of values that could drift from the
  base ones. Interactive sizes carry the WCAG 24px floor inside the token itself, so no team can multiply
  below the accessible minimum, whatever they set. Typography, radius and the focus ring are deliberately
  invariant to density.
---

Density (comfortable/compact/dense) is a spacing dimension. The obvious implementation, writing a second
complete set of values for "compact", doubles the surface to maintain and lets the two scales drift.

And there is something worse: any density mechanism can violate accessibility silently. Shrink a control
far enough and it crosses the WCAG 2.2 SC 2.5.8 minimum target size (24px), something no code review
catches reliably.

## A single number

`--sk-density` (1 = comfortable). The spacing tokens emit:

```css
round(calc(<base> * var(--sk-density)), 2px)
```

Interactive sizes additionally floor the result:

```css
max(round(calc(<base> * var(--sk-density)), 2px), 24px)
```

**The floor is inside the token.** No product team can multiply below it, no matter what they assign to
`--sk-density`. It is unreachable by construction, not by documentation.

## Why `round(..., 2px)`

`calc(4px * 0.6)` = 2.4px falls off the base grid; a few of those together make a compact UI shimmer.
`round()` snaps them to a 2px sub-grid, a no-op at density 1 (every primitive is already a multiple of 4)
and a stabilizer everywhere else. It is the only place the token layer does arithmetic the designer did
not write, and it is justified.

## What is deliberately invariant to density

- **Typography**, scaling font-size without correcting line-height reads worse. Density is a spacing
  problem, not a type problem.
- **Corner radius**, it is roundness, not space; it has its own dimension
  ([decision 18](./0019-public-palettes-and-constant-semantics.md)) and that is why density does not
  touch it.
- **Focus ring width**, a ring that shrinks disappears.
- **Touch hit area**, a target can paint small and respond large: the invisible area stays at 44px.

## The downside, and its trap

The emitted values are `calc`/`round`/`max` expressions, not numbers. Reading them back from JS requires
the browser.

And there is a trap there that costs real time: `getComputedStyle().getPropertyValue('--x')` **does not
resolve** a custom property. It returns the specified value with the `var()`s substituted,
`round(calc(16px * 1), 2px)`, never `16px`. Custom properties are only evaluated when they are **used**
in a real property. To read the used value you have to assign the token to a property on an element and
read *that* property.
