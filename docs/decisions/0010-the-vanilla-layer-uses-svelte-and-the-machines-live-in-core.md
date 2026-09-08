---
num: 10
title: The vanilla layer uses Svelte as an internal implementation, and the machines live in core
short: "Internal Svelte and machines in core"
summary: >-
  A stateful component had its machine twice: React took it from Zag and the vanilla layer reimplemented it
  by hand, pinned together only by the `*Parts` consts and a golden fixture that passed both even when
  both were wrong. This decision unifies them: Zag's machines are re-exported from
  `@skryensya/core/machines` and consumed by BOTH bindings, React with `@zag-js/react`, the vanilla layer
  with `@zag-js/svelte` inside `.svelte` components that hydrate the authored markup in light DOM. Svelte
  is an internal implementation, not a consumer contract. It reverses ADR-19/15 (the vanilla layer does
  not render / does not use Svelte) and the "core with no dependencies" invariant, with the costs stated.
---

A stateful component, tabs, accordion, a disclosure, a tile checkbox, has ONE state machine, not two.
Until now it lived duplicated: React took it from Zag (`@zag-js/tabs`, `/collapsible`, `/checkbox`,
`/radio-group`), and the vanilla layer reimplemented it by hand in an FSM of its own. The two copies were
pinned together only by core's `*Parts` consts, and the only behavioral pin, `tile-contracts.ts`, was a
golden fixture shared by both bindings' tests: a bug both shared passed both suites. That is the defect
the architecture review flagged as the "through-line".

## One machine, two adapters

Zag's machines are framework-agnostic, which is exactly what core publishes. So core re-exports them in
**`@skryensya/core/machines`**, and both bindings consume them:

- **React** adapts them with `@zag-js/react` (`useMachine` + `connect`), as it already did, only changing
  where it imports the machine from: `@zag-js/tabs` to `@skryensya/core/machines`.
- **The vanilla layer** adapts them with **`@zag-js/svelte`** inside `.svelte` components, which mount
  over the `[data-sk-*]` markup the consumer already wrote and **patch the attributes** `connect`
  returns onto that DOM (`applyZagProps`), without rendering structure of their own.

Behavior has a single owner; the parts contract is verified against the machine instead of being
duplicated in a fixture.

## Svelte is an internal implementation, in light DOM

This **reverses ADR-19 and ADR-19**, which said the vanilla layer does not render and does not use
Svelte. What does NOT change is what those decisions protected: the layer **still hydrates authored
markup**, and it does so in **light DOM**, `mount()` over the existing root, no custom elements and no
shadow DOM, so `.hero .sk-tabs { ... }` still reaches the element and the styling hooks model stays
intact. Svelte is the internal engine, replaceable, never a contract for the consumer: you author HTML
with classes and `data-sk-*`, you call `initComponents()`, and you write not one line of Svelte. The site
([ADR-19](./0006-the-monorepo-and-the-site.md)) compiles those `.svelte` files with
`@sveltejs/vite-plugin-svelte` and renders no Svelte UI at all.

The enhancers WITHOUT a Zag machine, button, segmented, sidebar, slider, toast, vaul (pure gesture), the
tile-link/tile-button factories, remain hand-written attribute patching and coexist with the Svelte ones
in the same `initComponents()`.

## Core has dependencies, and that is fine

Centralizing the machines means `@skryensya/core` has `dependencies`, those of `@zag-js/*`, which
**reverses** the "core with no deps" invariant from
[ADR-19](./0019-public-palettes-and-constant-semantics.md) /
[ADR-19](./0006-the-monorepo-and-the-site.md). It is accepted because a machine **is not a tenant**: it
names no brand and no vendor, it is platform-agnostic behavior, which is what core publishes. The
distinction with icons holds: a set's geometry does belong to a tenant and still cannot live in core; a
machine does not. The reference repo (kitdigital) does exactly this.

## Costs, stated

- **The accordion's animation is pending.** React composes its accordion with a `collapsible` per item,
  which provides `--height` and animates. The vanilla layer uses `@zag-js/accordion` (a single machine,
  single/multiple, keyboard), which does not expose `--height`, so the height does not animate smoothly
  yet. It is functionally correct; matching the animation requires switching to `collapsible`-per-item
  like React.
- **The tile checkbox/radio markup changed.** Zag's model hides the native input behind a visual control
  (`getHiddenInputProps` + an authored `[data-part=indicator]`), the same as React. A consumer who
  authored the checkbox with a visible input has to add the indicator. That is a contract change, not
  just an internal detail, and it is chosen in exchange for aligning vanilla with React.
- **Tests: jsdom's fidelity.** `@zag-js/svelte`'s `flush` is `flushSync(() => queueMicrotask(fn))` and
  Zag defers focus with `raf()`; browsers drain microtasks between `raf` callbacks and jsdom does not, so
  select-on-focus with arrows and restoration on `form.reset()` are tested in the browser (visual review
  of the site), not in jsdom. In jsdom we test deterministic interaction (click, state, events), which is
  the bulk of the contract.
- **A `CSS.escape` polyfill** in the test setup, because Zag escapes generated ids (which contain `:`)
  and jsdom does not ship `CSS`.
