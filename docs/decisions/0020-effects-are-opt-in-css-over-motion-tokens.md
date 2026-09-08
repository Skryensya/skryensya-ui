---
num: 20
title: Effects are opt-in CSS over motion tokens, not a contract
short: "Effects, not contracts"
summary: >-
  A fourth CSS tier, `@skryensya/core/effects/*`, for decorative motion that is not a component: scroll
  reveal, a header that collapses on scroll, an emphasis pulse. A class applied over any element or
  component root, built only from motion intent tokens (ADR-4), progressive and JavaScript-free. It is not
  a Contract: it has no signature, the ai-compiler does not compile it, and it appears in neither the
  manifest nor the MCP.
---

The system had motion in two forms: intent tokens (ADR-4, `--motion-*`) that each component consumes for
its own transition, and one hand-made case inside `apps/docs`, a component page's header collapsing into
a fixed bar while scrolling. That second case mixed two things in one file: the MECHANISM (a registered
property walking 0->1 with `animation-timeline: scroll()`, a spacer whose height IS the animation's
range) and the docs site's specific PAINT (the accent, the backing plate, the tab strip's pin). None of
it was reusable, and there was nowhere to document "this is how you do a scroll reveal" for someone
building a product on the kit.

## The question this ADR resolves

Is a scroll/entrance effect a Contract (with a signature, typed options, compiled by `ai-compiler`, with
React and Vanilla bindings) or is it CSS applied on top of what already exists?

**It is not a Contract.** A Contract names a piece of UI with an anatomy of its own: parts, options, a
`template`. An effect has no anatomy: it is a class a consumer adds to AN ELEMENT THAT ALREADY EXISTS, be
it a hand-authored `<div>` or the root of a `Card` the kit already publishes. Forcing it into a Contract
would ask for a signature with a single option (`children`) wrapping what the consumer already had, a new
layer with no anatomy of its own to wrap.

## What an effect is

A fourth CSS tier alongside Patterns and Components, in `packages/core/css/effects/*.css`, published as
`@skryensya/core/effects/*`. Three rules, the same in every file in the directory:

1. **Intent tokens only.** Never a `--scale-*` primitive and never a loose literal (`4px`, `200ms`) in
   the sheet: distance and timing come from `--motion-*` (ADR-4). Retuning the system moves the effect
   with it, and `_reduced-motion.scss` already knows what to do with those tokens without the effect
   declaring anything.
2. **Progressive.** Everything scroll-driven lives behind `@supports (animation-timeline: ...)` and
   `@media (prefers-reduced-motion: no-preference)`. Without support the element stays in its rest state
   (visible, unpinned), never hidden: there is no separate base rule to keep in sync by hand.
3. **GPU only.** `transform`, `opacity`, `translate`, short `blur`. Nothing that triggers layout.

And an editorial limit, not a technical one: the folder is kept small on purpose. A catalogue of twenty
effects is an invitation to decorate every corner; see `/effects` (`--motion-emphasize-*`: "attention on a
real change, sparingly") for the same argument applied to the whole index, not just to one token.

## v1: three effects

- **`sk-fx-reveal`** (`effects/reveal.css`). Fade + rise the first time an element crosses the viewport,
  `animation-timeline: view()`. It replaces the hand-written `IntersectionObserver` + class a product on
  the kit would have written on its own.
- **`sk-fx-collapse-header`** (`effects/collapse-header.css`). The generalized mechanism from
  `/components/*`'s header: a registered property (`--sk-fx-collapse-progress`), a pair of classes
  (`sk-fx-collapse-header`, `sk-fx-collapse-header__spacer`) and three hooks the consumer declares
  (`--sk-fx-collapse-range`, `--sk-fx-collapse-bar-height`, `--sk-fx-collapse-top`). The docs site is its
  first and, for now, only consumer (`ComponentPageShell.astro`); what used to live hardcoded in
  `apps/docs/src/styles/site.css` is now one consumer's paint over a published mechanism.
- **`sk-fx-pulse`** (`effects/pulse.css`). A `scale` out and back, twice, over `--motion-emphasize-*`.
  That intent's property already says "attention on a real change. Use sparingly"; this file is that
  property made into a class.

## What was rejected

- *A `Reveal`/`Pulse` Contract with its own signature.* See the section above: there is no anatomy to
  name, only a class over something that already exists.
- *JavaScript (`IntersectionObserver`, a `ScrollTrigger`-like).* All three v1 effects are expressible
  entirely in CSS with `animation-timeline`; a runtime dependency for what the browser already solves is
  weight without reason, the same argument Anchoring (ADR-11) already ran against a JS popper.
- *A large catalogue from day one.* Three effects, chosen because each proves a different shape of the
  mechanism (`view()`, `scroll()` with a registered property, no timeline at all). A new one enters when
  a real product needs it, not to complete a list.
