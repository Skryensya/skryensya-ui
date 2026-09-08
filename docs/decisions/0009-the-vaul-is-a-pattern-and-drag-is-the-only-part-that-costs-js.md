---
num: 9
title: Vaul is a pattern, and drag is the only part that costs JS
short: "Vaul and drag"
summary: >-
  A Vaul is a modal panel anchored to a viewport edge. It is a pattern and not a component because a
  drawer needs its exact structure on the inline edge. Dialog remains a centered dialog; Dialog Vaul is an
  explicit composition that gives it a block-end Vaul on mobile. The pattern requires the native <dialog>.
  Zag is not used: it has no Vaul machine and the platform already solves modality. Drag-to-dismiss is the
  only JavaScript, it is opt-in, and it uses the release intent.
---

A **Vaul** is a modal panel anchored to an **edge** of the viewport: it arrives from that edge, leaves the
page inert behind a backdrop, and leaves the way it came. The edge is the entire idea, a Vaul is named
for *where it comes from*, never for the shape it makes on arrival. We avoid `vault`, `sheet` and
`bottom sheet`: those are names of a shape, not of the pattern.

## Why it is a pattern and not a component

The rule from [decision 8](./0002-what-tier-3-ships.md) asks: *could a second component need this exact
structure?* Yes: **Drawer** (`sk-drawer`) is a Vaul on the inline edge, running the height of the screen.
That is why `components/drawer.css` only reassigns the `--sk-vaul-*` hooks from `--sk-drawer-*`; it does
not reimplement panel, border, slide or backdrop.

**Dialog is not a Vaul.** It is a natively centered box at any width. When a task needs a block-end sheet
on mobile, it opts into the **Dialog Vaul** pattern with `data-sk-dialog-vaul`; that composition keeps
the `sk-dialog` contract and only hands it Vaul's geometry, motion and drag at the compact breakpoint.
There is no implicit Dialog variant and no `sk-vaul` class on top of it.

## It requires the native `<dialog>`

For every reason in [decision 11](./0005-dialog-requires-the-native-element.md): focus trap, ESC, inert
background, focus restoration, top layer and a real `::backdrop` belong to the platform. A Vaul on a div
reimplements them in JavaScript, and `:modal` is not available to a div.

The hooks can be element-agnostic; the machinery cannot. That separation is a platform decision, not a
local policy.

## Zag is not used here

There is no Vaul machine in Zag. `@zag-js/dialog` would reimplement modality over a
`<div role="dialog">`; `@zag-js/presence` duplicates `@starting-style` and `allow-discrete`. Neither
brings state coordination that would justify its runtime.

## Drag is the only part that costs JS, and it is opt-in

`@skryensya/vanilla/vaul` enhances markup that is already written. It uses `data-sk-vaul` for a Vaul and
`data-sk-dialog-vaul` for the Dialog Vaul composition; it opens with the matching `-open` attribute and
closes with `-close`. It renders no markup and writes no classes.

Without the enhancer, a Vaul still has panel, slide, backdrop, ESC and outside click. With the enhancer,
below `52rem`, it adds drag-to-dismiss. The CSS maintains `--sk-vaul-drag-offset` and each edge decides
its own direction; the enhancer only reads geometry and writes offset/progress. It closes on distance or
velocity; a flick backwards beats distance.

## Releasing is an intent of its own

A released panel is not *exiting*: it is finishing the hand's momentum. That is why it consumes
`release`, not `enter` or `exit`. Release's curve and duration cover both returning home and leaving
entirely.

Dragging the wrong way resists with a cap of about 12px rather than locking. The backdrop follows
`--sk-vaul-drag-progress`, so the page comes back as the panel leaves.

## On desktop there is no dragging

The handle is touch-oriented and disappears above `52rem`; CSS and enhancer read the same breakpoint. The
rest of the document is not transformed: modality is expressed by the native backdrop, not by shrinking
the background DOM.
