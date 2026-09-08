---
num: 18
title: Icon State Button is a primitive, with no signature of its own
short: "Icon State Button: anatomy and paint, not a third component"
summary: >-
  CopyButton and ThemeToggle are the two "icon button with states, one icon per state" cases that exist.
  Both already composed the Icon Toggle pattern for the cross-fade, but each wrote its own N faces by hand
  (twice each, once in the declarative contract and once in JSX) and its own "write the state + the
  aria-label" function. This decision lifts those two pieces into
  `@skryensya/core/icon-state-button`, a primitive with no `signature` of its own: it is not registered, it
  has no React export under its own name, it does not appear as a new component. CopyButton and
  ThemeToggle remain two distinct signatures, each owning its own transition trigger and its own CSS.
---

## What was there

Icon Toggle (`icon-toggle.ts` + `patterns/icon-toggle.css`) already solved the cross-fade between stacked
faces for any number of states. That part was already generic. What was not generic was everything
around it:

- Each component wrote its own N `<span data-face>` faces **twice**: once in the contract's
  `template.children` (what the authored/vanilla binding consumes), and again by hand in the React
  binding's JSX, kept in sync only by discipline and by the G2 symmetry gate.
- Each vanilla binding had its own `paint()`/`paintToggle()` function to write the root's state attribute
  and the `aria-label`, nearly identical to one another.
- CopyButton's React binding redeclared `FEEDBACK_DURATION = 1800` on its own. A comment in the file
  admits it was copied by hand from the vanilla version, "down to the 1800ms window".

## The decision: a primitive, not a third component

`icon-state-button.ts` (core) exports `buildIconStateFaces` (builds the contract's N faces from a
`{ name, icon }` list) and `setIconState`/`getIconState` (write or read the root's state attribute, plus
the optional `aria-label`). `icon-state-button.tsx` (react) exports the JSX equivalent,
`renderIconStateFaces`.

**Deliberately narrow scope**: anatomy and generic reading/writing of the attribute, nothing more. The
primitive does NOT decide when the state changes. CopyButton reverts itself on a timer, ThemeToggle
cycles forever and notifies its siblings by event. Those are two genuinely different shapes of behavior;
forcing one onto both would have been a false abstraction. That trigger stays with each component.

**And it has no signature.** `CopyButton` and `ThemeToggle` remain two separate entries in `signatures`,
each with its own `id`, its own React export (`@skryensya/react/copy-button`,
`@skryensya/react/theme-toggle`) and its own docs page. `icon-state-button.ts` is not added to the
registry in `packages/ai-compiler/src/registry.ts`. Same treatment as Icon Toggle itself, which is not
registered either. It is the same reasoning as decision 8: a primitive is published when a second
consumer already needs it, and "a second consumer" means two existing components share it, not that a new
component is born to justify it.

## The CSS was not touched

Each component still writes its own selectors by hand mapping its state attribute's value to the visible
face (`data-sk-copy-button-state` in copy-button.css, `data-scheme` in theme-toggle.css). CSS has no way
to say "activate the face whose name matches the value of my own attribute" without enumerating every
value by hand. The only real alternative is switching to the `data-active` mechanism Icon Toggle already
carries, and only JS can write that. That would have cost the no-JS paint both of them have today:
ThemeToggle's `prefers-color-scheme` fallback and CopyButton's "attribute absent = idle". Generating the
markup was worth it; generating the CSS, at that price, was not.

## The cost, stated

- `IconStateFace.icon` is typed against `StableIconName` (core), so an icon name that does not exist in
  the stable vocabulary fails at build. Previously each component wrote the bare string.
- The contract helper (`buildIconStateFaces`) returns a hand-written return type
  (`readonly ContractTemplate[]`) rather than an inferred one: the contract embedding it is
  `as const satisfies ComponentContract`, and `as const` does not re-narrow what a function call returns.
- CopyButton's `FEEDBACK_DURATION` and ThemeToggle's cycle/broadcast still share no code. That is real
  duplication that remains. Deliberately out of scope for this decision, not something overlooked.
