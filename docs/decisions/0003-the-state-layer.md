---
num: 3
title: The state layer uses `currentColor` and a ladder with exactly one active layer
short: "The state layer"
summary: >-
  The state layer is the system's interaction mechanism, not an opt-in extra: it travels in the base bundle
  (tokens.scss), always present, and no component invents its own hover/pressed colors. It is a
  semi-transparent overlay tinted with currentColor, so a single token covers neutral surfaces and saturated
  fills in both modes. Exactly one layer shows at a time, through a priority ladder resolved by file order,
  never by adding opacities. The layer is never the only signal: focus carries an independent ring verified
  at 3:1, in its own token family.
---

Interactive states (hover, focus, pressed, selected, dragged) need consistent visual treatment across
every component, variant and semantic color, without inventing a color per combination. The pattern is
a semi-transparent overlay: the **state layer**.

## It is the system's interaction mechanism, not an opt-in

The state layer is [a pattern](./0002-what-tier-3-ships.md) by the rule of what tier 3 ships, it ships
structure, because button, tile, menu-item and tab all need the same `::before`. But unlike the other
patterns, it is **not opt-in**: it travels in `tokens.scss`, the base bundle, the same as
[motion](./0004-motion-through-intent-tokens.md).

The reason is that interaction is **universal**. A pattern like the dialog's top layer is needed by only
some apps, so it is imported separately. But every interactive component has states, and a component
that invents its own hover/pressed colors is reimplementing this, exactly what happened to the button
before it was corrected. Making it base is what turns the state layer into **the** way to express
states, not one of two.

The `::before` is **inert until an element carries the `sk-interactive` class**, so shipping it in base
costs nothing on anything that is not interactive. The class is the mechanism's API, it marks which
elements are interactive, not a bundle opt-in: there is nothing to import.

## The tint is `currentColor`

`--state-layer-color: currentColor`, the component's own content color. A single token covers
everything:

- **It subsumes black-on-light / white-on-dark.** A neutral surface has dark text (light mode) or light
  text (dark mode), so the layer darkens or lightens on its own, with no branch per mode.
- **It is correct over saturated fills**, where black/white fails: a primary button's content is
  `on-accent` (nearly white), so the layer is a white veil over blue. A black overlay there looks muddy.
- **Zero color tokens per component.**

## Exactly one active layer

The opacity of **one** state is shown. Opacities are **never added**. The ladder, from highest to
lowest priority:

```
disabled > dragged > pressed > focus > hover > selected > default
```

And it is achieved **without combined selectors**: every state rule assigns the same
`--state-layer-opacity`, all selectors have the same specificity (0,2,0), so when several match it is
**file order** that decides. The rules are written in ascending priority: the last one wins. `disabled`
forces the opacity to 0.

## `selected` is the lowest rung, not an additive base

A persistent base underneath hover would mean two stacked layers, which is added opacity, which the
model forbids. So selected is the lowest and hover/pressed replace it.

Selection never disappears because **it always carries an independent indicator**: a check, a filled
control, a rail, a weight. A team that needs a stronger selected+hover defines a dedicated combined
opacity token, never a runtime sum.

## The opacities are mode-invariant

A number cannot live inside `light-dark()`
([why](./0019-public-palettes-and-constant-semantics.md)), so the ladder does not change between light
and dark. It is not doubled in high contrast either: more `currentColor` would pull the background
closer to the text and make the surface read as muted. `[data-contrast="high"]` keeps the wash and adds
an inset keyline whose width grows with the state's opacity; the independent focus ring goes to 3px.

## Accessibility, non-negotiable

The layer is **never the only signal**:

- Focus carries an independent ring, verified at >=3:1 by
  [the validator](./0019-public-palettes-and-constant-semantics.md). That is why it lives in its own
  `--focus-ring-*` family and **not** inside `--state-layer-*`: the name carries the guarantee. Folding
  it in would say the ring is part of the layer, when the whole guarantee is that it is independent.
- Selection carries a real indicator.
- `disabled` dims using the component's tokens and **forces the layer to 0**.
- `:focus-visible` is used, not `:focus`, so a mouse click does not leave a layer stuck on.
- The fade respects `prefers-reduced-motion`.

## Implementation and edge case

A `::before` with `pointer-events: none` and `z-index: -1` under `isolation: isolate`, plus
`border-radius: inherit`. The `:has()` variants let the same class cover native controls and inputs
wrapped in a label, since `::before` does not render on an `<input>`.

A consumer with a selector more specific than `.sk-interactive:hover` can break the ladder. That is a
CSS limitation, the same one the variant specificity accepts in
[the three tiers](./0019-public-palettes-and-constant-semantics.md).
