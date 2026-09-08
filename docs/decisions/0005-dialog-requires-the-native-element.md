---
num: 5
title: The dialog requires the native `<dialog>` element
short: "The native dialog"
summary: >-
  The dialog is the first component that needs behavior, focus trap, ESC, inert background, so the native
  <dialog> element with showModal() is required: the platform provides every behavior, and a div-based
  dialog would reimplement the browser runtime. It ships four files: a styling hooks component and three
  patterns (top layer, backdrop, scroll lock). The always-on border is not aesthetic: in high contrast the
  panel and the page are the same color, and softening it would make it invisible without any test
  failing.
---

The dialog is the first component that needs **behavior**, focus trap, ESC, inert background, focus
restoration, where `button` needed none.

**`<dialog>` + `showModal()` is required.** The platform provides every one of those behaviors, plus the
top layer and a real `::backdrop`. A div-based dialog reimplements the browser runtime in JS that would
have to ship, exactly what [is not done](./0019-public-palettes-and-constant-semantics.md). Requiring the
native element is what keeps the system shipping only CSS for a component that needs behavior.

## Element agnosticism is not a policy: it is self-evident

"Native only vs div tolerant" looks like a choice, and it dissolves into two, each answered by the
platform:

- **Styling hooks are element-agnostic for free.** `--sk-dialog-bg` is a custom property; custom
  properties do not care which element carries them. `components/dialog.css` works on a
  `<div role="dialog">` at zero cost.
- **Patterns are native-only by nature.** `patterns/top-layer.css` and `patterns/scroll-lock.css` depend
  on the top layer and on `:modal`, which no div can have at any price.

So a div gets the appearance and none of the machinery, and that is not a designed compromise, it is what
the platform already decided.

## Four files

Per [the rule of what tier 3 ships](./0002-what-tier-3-ships.md): `components/dialog.css` (styling hooks,
the header/body/footer layout is the app's business), `patterns/top-layer.css` and
`patterns/backdrop.css` and `patterns/scroll-lock.css` (patterns, a drawer, a sheet and a popover need
them character for character).

Top-layer and backdrop are kept **separate** even though they move in sync: a menu enters the top layer
without a scrim, so merging them would ship backdrop CSS to every popover. They cannot fall out of sync
because both consume the same [intent tokens](./0004-motion-through-intent-tokens.md) `--motion-enter-*`.

**The scroll lock is its own import** because `html:has(dialog:modal) { overflow: hidden }` is the
system's first rule that styles the **document root** from an opt-in file, where everything else is
scoped to its own element. The separate import *is* the consent. And many apps run their own scroll lock;
a silent one would apply twice. (`scrollbar-gutter: stable` is not decoration: `overflow: hidden` removes
the scrollbar and the page jumps about 15px on open.)

## Three silent traps the pattern exists to absorb

Animating a top layer element requires:

1. `@starting-style`, the only way to animate *from* `display: none`.
2. `transition-behavior: allow-discrete` declared **after** the shorthand, which silently resets it to
   `normal`.
3. `overlay` inside the transition, **without which the element leaves the top layer instantly and the
   exit animation plays invisibly**, with no error at all, in a component that looks perfect on the way
   in.

That a consumer would get all three wrong is why these are patterns and not hooks.

## The high contrast trap, do not "fix" this border

In `modes/hc.scss`, `--color-bg-surface` and `--color-bg-canvas` are byte-for-byte identical. Correct for
high contrast, and fatal for a dialog: the panel and the page behind it are **the same color**, so the
only separator left is `--elevation-top`, a shadow, for the users least able to perceive one.

That is why the dialog carries an always-on border,
`--sk-dialog-border-color: var(--color-border-default)`, which high contrast already promotes for free to
a hard black or white border.

**It must not be softened to `border-subtle` for aesthetics.** Subtle stays mid-gray in high contrast,
and [the validator](./0019-public-palettes-and-constant-semantics.md) exempts it from contrast checks as
decorative, an exemption that is void here, because a border that is the only separator is a
*significant* non-text element under WCAG 1.4.11. That one-word change makes the dialog invisible in high
contrast and **no test fails**.

## What was rejected

- *Div tolerant by policy.* It accumulated silent gaps: no backdrop, no top layer motion, no scroll lock,
  no focus trap, no ESC, no inert, no focus restoration. Each one renders perfectly and traps nothing. A
  dialog that looks right and behaves wrong is worse than one that does not render.
- *A machine for the dialog.* It reimplements `showModal()`, the focus trap, `inert` and the top layer in
  JS. The argument in favor was real, the native `<dialog>` is **imperative**, `showModal()` has to be
  called on a ref because the `open` attribute alone neither enters the top layer nor renders
  `::backdrop`, but that is an ergonomics annoyance, not a reason to reimplement the browser.

## Cost

A hard requirement on consumers (native `<dialog>`, no exceptions) and a dependency on the system's
newest baseline: `::backdrop` inheriting from its originating element arrived in Chrome 122, Firefox 120
and Safari 17.4, roughly a year younger than
[`oklch()`](./0019-public-palettes-and-constant-semantics.md) support. MDN's `::backdrop` page still
documents the old behavior; it is out of date, not a contradiction.
