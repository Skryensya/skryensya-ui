---
num: 23
title: The kit ships its own default sans, Hanken Grotesk, with a metric-matched fallback
short: "The kit ships its type"
summary: >-
  `--scale-font-family-sans` named `Inter` and nothing in this repo ever loaded it, so every surface
  resolved to `system-ui` and the type was whichever face the reader's OS happened to have. The token
  now names Hanken Grotesk, chosen by measurement on this site's own pages, and the package ships the
  files that back it (`@skryensya/core/fonts/hanken-grotesk.css`) plus a local-only fallback face
  carrying the real font's metrics, so the swap changes the drawing and not the layout.
---

A design system that leaves its type to the reader's operating system has three typefaces, not one: SF
on a Mac, Segoe on Windows, Roboto on Android. Every measurement this kit makes about density (a rail's
label before it truncates, a Toc entry that fits on one line, the 12px floor the dense chrome runs at)
was being made against a face the system never chose.

## What was actually wrong

`packages/core/css/primitives/_type.scss` read `--scale-font-family-sans: Inter, system-ui, sans-serif`,
and there was no `@font-face` and no font file anywhere in the repo. Naming a family is not shipping it.
The same held for `--scale-font-family-mono` and `JetBrains Mono`, which this ADR does not resolve.

## How the face was chosen

Measured, not browsed. Each candidate was mounted on this site's own Button page, at this site's own
tokens, and probed after `document.fonts.ready` with `canvas.measureText` and real DOM boxes:

| | `ComponentPreview` at 12px | Toc block | `Button` at 60px/700 | x-height / cap | tabular figures |
|---|---|---|---|---|---|
| system-ui (before) | 110.1px | 318px | 185.7 | 0.721 | yes |
| Inter | 111.1px | 318px | 185.0 | 0.709 | yes |
| Geist | 107.2px | 300px | 197.7 | 0.746 | yes |
| Instrument Sans | 110.4px | 300px | 197.5 | 0.708 | yes |
| IBM Plex Sans | 105.4px | 300px | 190.8 | 0.739 | yes, and by default |
| Public Sans | 108.4px | 318px | 193.8 | 0.715 | yes |
| **Hanken Grotesk** | **105.0px** | **300px** | **182.2** | 0.707 | yes |
| Archivo | 105.6px | 300px | 193.4 | 0.767 | yes |
| Work Sans | 113.3px | 318px | 201.5 | 0.758 | yes |
| Libre Franklin | 111.6px | 318px | 201.5 | 0.714 | **no** |
| Atkinson Hyperlegible | 101.9px | 300px | 186.7 | 0.743 | yes, but only 400/700 |
| Iosevka Aile | 111.6px | 318px | 198.0 | 0.707 | yes |

Three of those columns are requirements this repo already had, not preferences:

- **12px has to hold.** It is the size of the tree rail, the Toc, badges and the footer bar. Hanken sets
  a long component name in 105px against Inter's 111px, and the Toc's long entries drop from two lines
  to one (the block goes 318px -> 300px).
- **Tabular figures have to exist.** Eight sheets ask for `font-variant-numeric: tabular-nums` (chart,
  meter, time-field, list, table-pager, nav-list, code-preview). Libre Franklin failed the probe
  (`1111111111` and `0000000000` did not come out equal) and was dropped for it.
- **Four real weights.** 400 body / 500 label / 600 emphasis / 700 heading are each a distinct rung of
  `_type.scss`. Atkinson Hyperlegible publishes 400 and 700 only, so the middle two would be synthesised;
  dropped for it, compact as it is.

## Why this one and not a platform's

The brief ruled out families owned by a large platform. Hanken Grotesk is drawn by Alfredo Marco Pradil
(Hanken Design Co.) and its OFL copyright is held by the project's own authors
(`Copyright 2021 The Hanken Grotesk Project Authors`), which the vendored `OFL.txt` states. Distribution
is a separate question from ownership: the files here are the upstream ones, vendored into the package,
so no consumer of this kit fetches type from someone else's CDN.

## What ships

`@skryensya/core/fonts/hanken-grotesk.css`, an OPTIONAL import (the token names the family either way):

- Four `@font-face` rules: upright and real italic, each split into `latin` and `latin-ext` with its own
  `unicode-range`, one variable `wght` axis from 100 to 900. Latin is 34KB, latin-ext 20KB, and a page
  that types no character from the second never asks for it.
- One `Hanken Grotesk Fallback` face: `local()` sources only, so it downloads nothing and simply
  re-metricises a font the reader already has (Arial, Helvetica, Roboto, DejaVu Sans). Its numbers are
  measured, not guessed: `size-adjust: 100.69%`, `ascent-override: 99.32%`, `descent-override: 29.79%`,
  `line-gap-override: 0%`. Verified after the fact, fallback against real: 0.38% width difference at
  12px, 0.22% at 16px prose. The swap no longer moves a row.

The token becomes `"Hanken Grotesk", "Hanken Grotesk Fallback", system-ui, sans-serif`. An app that never
imports the sheet still gets the metric fallback and then `system-ui`, which is exactly where it was.

## What this does not decide

- **The mono.** `--scale-font-family-mono` still names `JetBrains Mono` and still loads nothing. Same
  bug, same fix shape, not done here.
- **The brand presets.** `presets.astro` keeps overriding `--font-family-body` per preset (Roboto,
  Manrope, Lora, Space Grotesk). The default is the floor, not a straitjacket: a preset is exactly the
  seam a consumer uses to sound like themselves.
- **Feature defaults.** No `font-feature-settings` are set globally. The kit asks for tabular figures
  where it means them and nowhere else.
