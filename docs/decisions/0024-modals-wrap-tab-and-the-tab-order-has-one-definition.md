---
num: 24
title: Modals wrap Tab at the ends, and the tab order has one definition
short: "Modals wrap Tab"
summary: >-
  `showModal()` keeps focus off the inert page but lets Tab leave for the browser's toolbar at either
  end of a dialog. The lightbox wrapped it by hand; Dialog, Vaul, Command Palette and Comment Thread
  did not. `@skryensya/core/focus-trap` now wraps Tab inside whichever `<dialog>` is `:modal`, one
  document-wide listener that both bindings install, and its `tabbables()` replaces the four
  hand-kept "what can take focus" lists that disagreed with each other.
---

[Decision 5](./0005-dialog-requires-the-native-element.md) gave modality to the platform: the top
layer, the inert page, Escape and focus restoration all come from `showModal()`, and nothing in the kit
reimplements them. This decision does not revisit that. It closes the one gap the platform leaves.

## The gap

With a modal open, the page behind is inert, so Tab cannot reach it. But Tab from the dialog's last
control does not come back to its first: it leaves the document for the browser's own chrome (the
address bar, the tabs), and Shift+Tab from the first control does the same. APG's modal dialog pattern
wraps. The lightbox already did, in 40 lines of its own; every other modal in the kit did not, so the
same keypress behaved differently depending on which component had opened the box.

## What the kit does now

`trapModalDialogs(document)` adds one `keydown` listener. On Tab, and only when no handler below it has
already called `preventDefault()` (an editor indenting, a composite owning its stop), it finds the modal
the key belongs to (the nearest `:modal` ancestor of the target, or the last open modal when focus sits
on `<body>`) and moves focus only at the two ends. Anywhere in the middle the browser's own order
stands. It is counted: every holder releases it, and the listener goes with the last one.

- **Vanilla** registers a `dialog` enhancer that marks nothing and installs the listener for the page.
- **React** calls `useModalTabWrap()` in Dialog, Vaul, Command Palette and Comment Thread.
- **The lightbox controller** holds it for the length of a session instead of carrying its own copy.
- **The docs site** installs it once in `Base.astro` for its own search and preferences dialogs.

Not wrapped, deliberately: the Tour and the Megamenu, which are not modal and document Tab flowing on
through the page as their behaviour.

## One definition of "tabbable"

The lightbox, the tour and the feed each carried a focusable selector and a filter, and no two agreed:
one matched disabled buttons, one missed `<audio controls>`, one missed `area`, and only one skipped
`display: none`. `tabbables()` is now the only list, with one visibility rule (`checkVisibility()`,
falling back to `hidden` / `display` / `visibility` where it is missing) and radio groups counted as a
single stop. Two lists stay apart on purpose: `annotation.ts` strips every stop including
`tabindex="-1"` ones Zag is about to restamp, and `@skryensya/devtools`'s badge list is CSS text.

## Why not `@zag-js/focus-trap`

Zag is already a dependency, and its focus trap is a good one. It, and `@zag-js/dom-query`'s
`getTabbables` under it, decide visibility from layout (`offsetWidth || getClientRects().length`). jsdom
does no layout, so every element reads as hidden there, and every binding test that crosses a modal
would see an empty tab order. It also brings initial focus, Escape and focus return, which `showModal()`
already owns and decision 5 keeps with the platform.
