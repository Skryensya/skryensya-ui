---
num: 17
title: Meter paints its label and its value; Progress does not
short: "Meter's header"
summary: >-
  Meter and Progress shared track and fill down to the pixel: same `border-radius`, same height, same tone
  hook. The distinction between the two (a measurement that already happened against the progress of a
  task) lived only in the ARIA `role` and in `aria-label`/`aria-valuetext`, both invisible. A reader
  looking at the page had no way to tell them apart. This decision gives Meter a visible label + value row
  above the bar, taken from the same precedent that already justifies its own `role="meter"` (Adobe
  Spectrum's meter), and leaves Progress exactly as it was.
---

## The problem

`meter.css` said, literally, "deliberately identical in shape to Progress". And it was: same sunken
track, same fill with `border-radius: var(--radius-pill)`, same `--sk-*-color` hook per tone. The only
thing distinguishing them was semantic and out of sight:

- The `role` (`meter` against `progressbar`).
- `aria-label`/`aria-valuetext`, which a reader without a screen reader never hears.

That leaves the same problem that motivated separating the two contracts in the first place (see the
banner in `meter.ts`): the "measurement that already happened" against "progress of a task" distinction
is real and worth having, but it only reached people using a screen reader. A sighted reader seeing two
identical blue bars on two documentation pages had no clue at all.

## The decision

Meter gains a header row, painted above the track:

- `label` (already an option, already feeding `aria-label`) is now ALSO painted as visible text, via
  `textFromOption` in a `<span>` of its own.
- `valueText` (already existed, optional, already feeding `aria-valuetext`) is ALSO painted, but only
  when the author provides it. WAI lists it as recommended, not required, and a bare number ("68%") next
  to an unlabeled bar is less legible than no number at all.
- Neither one stops being a real ARIA attribute on the track: `textFromOption` adds a SECOND visible
  reading of the same string, it does not replace the first. What a screen reader announces never depends
  on whether the visual layout decided to show something.

The precedent is Adobe Spectrum: it is the closest sibling to this contract (the same ARIA `meter`
against `progressbar` split we already followed), and its `<sp-meter>` paints by default "a label that
describes what is being measured... and a percentage value showing the numeric progress". Spectrum's
track and fill are nearly identical between meter and progress-bar. Shape is not where the ecosystem
distinguishes the two; the label is.

`Progress` does not change. It stays a bare bar: its typical place of use (a table, a toolbar, a card)
rarely has room or need for a permanent label beside the bar, and its own `aria-label` already covers the
screen reader case.

## The cost, stated

The component tree grew a level: `.sk-meter` (the track, `role="meter"`) stopped being the root node and
became a child of a new `.sk-meter-group`, alongside `.sk-meter-group__header`. Everything that targeted
`.sk-meter` as the direct child of a layout (the `component-preview.css` case that forces
`flex: 1 1 100%` on the stage) had to retarget `.sk-meter-group`. The React binding can no longer pass
`className`/loose props to "the root element" without deciding which of the two roots receives what:
`className` goes to the group, the rest of `HTMLAttributes` goes to the track.

## What was not done

Automatic coloring by zone was not added (what native `<meter>` does: green/yellow/red according to
`low`/`high`/`optimum`). It is the other real precedent the research turned up, but it changes the
contract's API (new options, a zone computation the author does by hand today by picking `tone`) rather
than only the CSS. If it is requested later, the `tone` hook is already there. All that would be missing
is something to compute it.
