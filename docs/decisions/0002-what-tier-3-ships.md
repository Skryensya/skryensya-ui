---
num: 2
title: What tier 3 ships, styling hooks, patterns, and the vanilla layer
short: "What tier 3 ships"
summary: >-
  Tier 3 ships the CLASS and its styling hooks: importing button.css gives you a button. The old rule
  ("component = hooks only, the app writes the structure") was reversed because it did not survive use:
  22 of 36 stylesheets already shipped structure, nothing verified it, and the only consumer ended up
  writing 17 skins and duplicating one. The component/pattern distinction survives, but it now decides
  WHOSE a structure is, not whether it ships. Behavior the platform does not provide comes from a vanilla
  layer of enhancers, never as a framework contract.
---

## The old rule, and why it fell

This decision used to say:

> Do many components share this exact structure? **Yes -> pattern**, ships hooks and structure.
> **No -> component**, ships styling hooks only, because every consumer's markup and layout differ.

The argument was reasonable and the prediction was falsifiable: *"no two apps lay out a button the same
way"*. It was measured, and it failed in all three ways a rule can fail.

**It was not being followed.** Of 36 stylesheets in `css/components/`, 22 already shipped structure, up
to 163 declarations in `select.css`, 117 in `tile.css`, 85 in `details.css`. Fourteen shipped none. The
system did not have a rule with exceptions: it had two systems, and which half a component fell into
depended on what day it was written.

**Nothing verified it.** [The validator](./0019-public-palettes-and-constant-semantics.md) checked
reference directions, mode completeness, contrast and name shape. No rule looked at whether a component
shipped structure, so the corpus drifted silently, component by component, without anyone deciding to
reverse it.

**The prediction was measurable, and it came out wrong.** The only consumer that exists, this site, had
to write 17 skins in `apps/docs/src/examples/`. One of them, `.sk-badge`, ended up duplicated in
`site.css` and the two copies **diverged**: one lost its `border`. That is a single app duplicating
itself. The premise was that different apps would lay things out differently; what happened is that the
same app could not keep one copy in sync with itself.

And the real cost was at the front door: importing `button.css` did not give you a button, it gave you
variables. A design system whose first step is "now you write the CSS" is not shipping a button, it is
shipping the job of making one.

## The rule

> **A component ships the class and its styling hooks.**

Importing `components/button.css` gives you a button that looks like a button. The hooks remain the
public contract, and they remain how you change it: `--sk-button-bg` is re-declared from outside without
fighting specificity, because the structure lives in `@layer components` and any unlayered rule beats it
([decision 1](./0019-public-palettes-and-constant-semantics.md)). Shipping the structure does not close
the door the hooks opened; it leaves it open with something behind it.

The validator enforces this with the `component-ships-structure` rule: a sheet in `components/` that
declares hooks and no real property fails. The new rule is the exact inverse of the old one, and it
exists because the absence of a rule is what let the previous one drift.

## What is still a pattern

The component/pattern distinction **did not disappear**: it changed question. It used to decide *whether*
structure shipped. Now it decides **whose** a structure is.

> **Do many components share this exact structure?** If yes, it lives in `patterns/` and is written once.

`state-layer` is a pattern: button, tile, menu-item and tab all need the identical `::before`, with its
`pointer-events`, its `z-index`, its `isolation` and its `border-radius: inherit`. Writing it in every
component is exactly the duplication the pattern exists to prevent.

And there is still a case where a component writes no structure of its own: when it **composes** a
pattern. `drawer.css` declares no panel, border, slide or backdrop; it re-declares `--sk-vaul-*` from
`--sk-drawer-*` and that is all. It is not "I ship nothing", it is "this is a Vaul, tuned", and
everything structural a drawer might write is structure a bottom sheet needs identically. The validator
exempts that case, and only that: a sheet that re-declares ANOTHER component's or pattern's hooks.

## Invariant is not the same as shared

This part of the old argument survives intact, only now it justifies where a structure lives, not
whether it ships.

A combobox's anatomy **is invariant**: the machine dictates root -> control -> input + trigger,
positioner -> content -> items, and deviating breaks it. It is tempting to conclude that it is therefore
a pattern.

No. Invariance is **necessary but not sufficient** to promote something to `patterns/`. What justifies a
pattern is that the structure is **shared**, because there is real duplication to prevent. The
combobox's anatomy is used by exactly one component: the combobox. There is nothing to share, so it
lives in `components/combobox.css`, which is where it is written once anyway.

## The platform decides, component by component

The [pure CSS](./0019-public-palettes-and-constant-semantics.md) principle, do not reimplement the
browser runtime, cuts both ways, and the cut is per component:

| The platform ships it | -> CSS only, no machine |
|---|---|
| dialog | `<dialog>` + `showModal()` |
| popover | Popover API |
| disclosure | `<details>` / `<summary>` |

| The platform ships nothing | -> a machine earns its place |
|---|---|
| combobox, tabs, menu, tree, toast, date-picker, slider | no native equivalent exists |

A combobox with a machine reimplements **nothing**, because there is no native combobox, so the
objection has nothing to hold on to. A dialog with a machine reimplements `showModal()`, which is why
[the dialog is native](./0005-dialog-requires-the-native-element.md). This is not a middle ground
between two positions: it is the same principle applied twice, landing differently because the platform
is different.

## The vanilla layer

Behavior the platform does not ship comes from a **vanilla layer**: the consumer writes the HTML, links
the CSS, and calls `await initComponents()`. **No framework needed.**

Each unit is an **enhancer**: it finds an authored root, runs the machine, and patches attributes onto
elements that already exist. **It does not render markup and never writes a class**, both of which
belong to the consumer. Mounting is idempotent.

**Vanilla is the contract.** The consumer does not write, import or configure a framework. The layer
exists to hydrate authored markup: it finds roots, runs behavior and patches attributes onto elements
that already exist.

The **markup contract**, the parts in the correct nesting, is **documented, never shipped**. The system
describes the markup and the consumer writes it. That is the distinction not to confuse with the rule
above: shipping the **class** is shipping CSS, not HTML. `components/tabs.css` tells you what a
`.sk-tabs__list` looks like; you write the `<div class="sk-tabs__list">`.

The **parts** are named in BEM (`.sk-tabs__list`) and are ours and permanent: they survive if the
machine underneath is replaced. The **state** (selected, expanded, disabled) is written by the machine
as a data attribute, never as a BEM modifier and never by hand. The parts are ours; the state is the
machine's.

An enhancer **patches attributes onto authored markup and never writes a class**. The exception is
chrome derived from the content, which the author therefore cannot write: the carousel draws its own
controls because how many dots there are comes from MEASURING the track, not from counting slides
([decision 24](./0010-the-vanilla-layer-uses-svelte-and-the-machines-live-in-core.md)). It still invents
no content; it draws what only the machine knows.

**A framework is never the contract.** Vanilla is the surface the system promises; React is a documented
binding, one of several possible ones, not the front door
([decision 14](./0007-core-vanilla-and-react.md)). Tying the design system to a framework another
consumer would have no reason to use is exactly what the vanilla layer avoids.

## The shared package does not hold machines

`core` exists, but as a package of **tokens + parts + shared options**
([decision 14](./0007-core-vanilla-and-react.md)), what every binding needs to see identically. The state
machines do not live there: they are already standalone framework-agnostic packages, and a package that
only re-exported them fails [the deletion test](./0019-public-palettes-and-constant-semantics.md),
delete it, import the machine directly, and no complexity reappears in the callers. An enhancer imports
them where it uses them.

## The CSS stays in `packages/core`

`components/combobox.css` lives with every other stylesheet. The reason is enforcement, not tidiness:
the [validator's](./0019-public-palettes-and-constant-semantics.md) corpus is `packages/core/css/**`, so
CSS migrated to another package would fall outside the tier rules, mode completeness and cross-brand
contrast, silently exempt from every guarantee the validator exists to give.

## When in doubt

The question that remains ("do many components share this?") is still a **prediction**, and a wrong
prediction promotes a structure nobody reuses into `patterns/`. On genuine doubt, prefer `component`:
promoting later is additive, while demoting a pattern breaks all its consumers.

But the most expensive lesson of this decision is not about that question, it is about predictions in
general. The old rule rested on one ("no two apps lay out a button the same way"), nobody measured it
for months, and the corpus contradicted it sheet by sheet without that triggering anything. A rule the
validator cannot check is not a rule: it is an intention, and the code drifts away from it silently.
That is why the new rule arrived together with its check, and not before or after.
