---
num: 12
title: The Toolbar treats each composite widget as one stop
short: "Segmented inside Toolbar"
summary: >-
  The Toolbar enhancer arrowed through EVERY focusable button inside the root, without distinguishing a
  loose button from an option of a composite widget (Segmented, Tabs) that already brings its own roving
  tabindex. Nesting a Segmented inside a Toolbar produced a double jump: the option moved focus one
  position and the Toolbar, seeing the same bubbled event, moved it a second time. This decision makes the
  Toolbar visit only the `tabindex="0"` stop of each child and respect `event.defaultPrevented`, so a
  composite widget counts as one stop, not N.
---

## The problem

This site's component preview groups two related controls in its header: the screen size selector and the
Vanilla/React toggle. Both are Segmented: each its own `radiogroup` with a roving tabindex
([`connectSegmented`](../../packages/vanilla/src/components/segmented.ts): only the selected option has
`tabindex="0"`, the rest `-1`). Grouping them visually as a single bar of controls is exactly what
Toolbar exists to do.

But the Toolbar enhancer knew nothing about this:

```ts
const controls = Array.from(root.querySelectorAll<HTMLElement>(controlsSelector));
```

`controlsSelector` is `button:not([disabled]), a[href], ...`: it collects EVERY button inside the root,
without filtering by tabindex. Nesting a 3-option Segmented inside a Toolbar meant the Toolbar saw 3
stops where it should have seen 1. Worse: Segmented already handles its own arrows (`onOptionKeydown`,
with `event.preventDefault()` and `next.focus()`), so pressing `ArrowRight` with focus on an option had
two handlers reacting to the same event:

1. Segmented's option keydown moved focus to the next option and called `preventDefault()`.
2. The event bubbled up to the Toolbar root, whose own `onKeyDown` did not check `defaultPrevented`: it
   found the `document.activeElement` already updated by step 1, and moved it one position further.

A single arrow key jumped two stops.

## The decision

Two changes in [`packages/vanilla/src/components/toolbar.ts`](../../packages/vanilla/src/components/toolbar.ts):

1. **Filter by stop, not by focusability.** `controls` now excludes any element with `tabindex="-1"`. A
   composite widget that exposes its own roving tabindex (Segmented, and any future widget following the
   same contract) counts as a single stop for the Toolbar, without the Toolbar having to know its type.
2. **Respect `event.defaultPrevented`.** If the child already handled the key (Segmented, Tabs), the
   Toolbar's `onKeyDown` does not move again. This is not Segmented-specific: it is the general contract
   "whoever already consumed the event is not second-guessed by the parent".

With this, a nested Segmented behaves like the ARIA APG pattern for "toolbar with composite widgets":
Home/End and the Toolbar's arrows navigate BETWEEN widgets (or loose buttons); once focus enters a
composite widget, its own arrows navigate WITHIN it and do not escape to the Toolbar's next group.

## Where it is used

The component preview's own header (`apps/docs/src/components/ComponentPreview.astro`) is the real case,
not a laboratory example: the screen size selector and the Vanilla/React toggle are now an `sk-toolbar`
with two `sk-toolbar__group`, each containing a Segmented, separated by an `sk-toolbar__separator`. It is
documented as a pattern in [`/components/toolbar`](/components/toolbar), section "Toolbar with composite
widgets".

## What was not done

Segmented (or Tabs) was not asked to know it can live inside a Toolbar. The contract stays
unidirectional: any widget that already implements roving tabindex correctly (one stop at `tabindex="0"`)
works nested with no changes of its own, because it is the Toolbar that adapts to that contract, not the
other way around.
