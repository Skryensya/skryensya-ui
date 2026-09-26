---
num: 25
title: Hotkeys run on `@zag-js/hotkeys`, and both bindings share one `bindHotkey`
short: "Hotkeys run on Zag"
summary: >-
  The kit's own hotkey parser, matcher, formatter and two hand-written keydown listeners are replaced by
  `@zag-js/hotkeys`, from the same family as every machine here. `@skryensya/core/hotkey` keeps the
  names consumers already call and adds the kit's one rule on top (a chord with a modifier fires from
  inside a text field); `bindHotkey` moves into core so Vanilla re-exports it and React's `useHotkey`
  wraps it. Sequences (`"g > i"`) come with the move.
---

Hotkeys were the kit's own: about 170 lines of parser, matcher and formatter in `core`, and then the
same `keydown` listener written twice, once in `@skryensya/vanilla`'s `bindHotkey` and once in React's
`useHotkey`. Zag, which already runs every machine in the kit, ships a hotkey library that does more
(sequences, scopes, conflict handling, a recorder, validation) and is tested against more keyboards
(AltGr, dead keys, matching by `code` when a modifier changes `key`).

## What moved and what stayed

- **Parsing, matching and formatting are Zag's.** `parseHotkey`, `matchesHotkey` and `formatHotkey`
  keep their names and their `isMac` argument, and call Zag underneath.
- **`bindHotkey` is core's now,** on a Zag hotkey store per binding. Vanilla re-exports it from the
  same path; React's `useHotkey` holds it in an effect. The duplicated listener is gone.
- **The kit's rule stays on top.** Zag suppresses every hotkey inside a form field unless told
  otherwise; the kit's rule is that only a bare key is text, and a chord with ⌘, Ctrl or Alt always
  fires, because ⌘K has to reach you from inside the search box it opens. `bindHotkey` sets Zag's
  form-tag options from that rule.
- **`mod` is resolved before Zag sees it** when `bindHotkey` is given `mac`, since the store reads the
  platform itself and has no override. Tests and the docs rely on that option.
- **Bubble phase, as before.** Zag listens in capture by default; the kit keeps bubble so a widget with
  focus hears its own keys before a page-wide shortcut.
- **`detectMac` and `isTypingContext` stay the kit's.** 1.43.3, the version the release-age rule
  allows, does not export `getPlatform`, and the lightbox uses `isTypingContext` for its own keys.

## What changes for a spec

- **Modifiers come first.** `"k+mod"` used to parse; Zag reads it as the key `k+mod`. Every spec in
  the repo was already modifiers-first.
- **`opt` is no longer an alias** for Alt; `alt` and `option` are.
- **Sequences work:** `"g > i"` fires after `g` then `i` within a second. `matchesHotkey` is about one
  event, so it matches chords only.
- **The formatter uses Zag's glyphs:** Enter is `↵` and Space is `␣`, where the kit wrote the words.
  `⌘K` and `Ctrl+K` read exactly as before.
- **`parseHotkey` returns Zag's shape** (`keys`, `meta`, `ctrl`, …), not `{ mod, key }`. Nothing
  outside the tests read the old shape.

Scopes, the recorder and conflict reporting are available in Zag's store but not exposed through
`bindHotkey`, which stays "a spec and a handler". A component that needs them can take a store directly.
