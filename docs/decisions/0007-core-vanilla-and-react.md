---
num: 7
title: Core, Vanilla and React
short: "Core, Vanilla, React"
summary: >-
  The system has two bindings sharing one contract, so a shared package separates what is common from what
  is framework-specific. `@skryensya/core` concentrates the tokens, the BEM parts and the shared types;
  the machines and any DOM logic live in each binding. `@skryensya/vanilla` hydrates authored HTML without
  rendering markup or classes; React renders the same contract as declarative components. Each component's
  CSS lives inside core so it stays inside the validator.
---

The system has two bindings sharing one contract: a vanilla layer and a React layer. With more than one
framework in play, a shared package separates what is common from what is specific to each; without it,
the two layers would duplicate tokens, parts and types. (With a single framework it was not needed, which
is why [ADR-2](./0002-what-tier-3-ships.md) draws the line at the vanilla layer.)

## The `core` package

`@skryensya/core` has a narrow responsibility:

- it publishes the CSS tokens and the validated styling hooks;
- it publishes the permanent BEM parts that form the markup contract (`sk-tabs`, `sk-tabs__list`, etc.);
- it shares option types and helpers that belong to no framework.

It is not a shared runtime, it does not render DOM and it does not transform classes. It does not
re-export Zag machines either: each binding imports and adapts its own machine.

## The vanilla layer

`@skryensya/vanilla` is the progressive-enhancement implementation of ADR-2:

- `runtime/svelte-hydrate.ts` mounts enhancers over `[data-sk-*]` roots idempotently;
- `runtime/apply.ts` patches attributes and events onto existing HTML;
- `runtime/registry.ts` maps each selector to a dynamic `import()`;
- `auto.ts` exports `initComponents()`, which scans first and downloads only the types present.

The enhancers do not render markup and never write classes. The consumer authors HTML, imports CSS and
calls `await initComponents()`. CodePreview and ComponentPreview stay out of the registry: they are
opt-in documentation surfaces mounted from their explicit subpaths. Shiki resolves CodePreview's
highlighting at build/SSR time; neither of them introduces that work into the browser runtime.

In the docs, every demo runs in a static `iframe srcdoc`: it requires no preview route, but it does create
a `Document`, viewport and top layer of its own. The frame's entry runs `initComponents()` inside that
realm; CSS, dimensions and icon set remain explicit consumer decisions.

## React does not hydrate: it renders

`@skryensya/react` is a conventional React component library. It consumes `@skryensya/core` and
`@zag-js/react`, renders the documented anatomy and lets the consumer compose content with props and
children.

This does not contradict the vanilla layer. Each binding uses the natural idiom of its ecosystem:

- vanilla: preserve authored markup and add behavior;
- React: render declarative components.

The shared guarantee is that both produce the same parts contract. The state machine is an implementation
detail of each binding.

## The CSS lives in core

Each component's styling hooks live in `packages/core/css/components/`. Moving them next to the binding
would take that CSS out of the tier, mode and contrast validator described in
[ADR-19](./0019-public-palettes-and-constant-semantics.md). The contract is split on purpose:

- tokens, styling hooks, parts and shared types: `@skryensya/core`;
- behavior: the bindings (`@skryensya/vanilla`, `@skryensya/react`).

## Vertical slice

The first complete cut is `tabs`: core descriptor, vanilla enhancer, React component and
`components/tabs.css`. It is real enough to prove machines, parts, CSS and documentation without
multiplying the work across every component before the architecture is validated.
