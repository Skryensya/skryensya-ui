---
num: 15
title: Evidence is rendered in both bindings
short: "The site is the executable catalogue"
summary: >-
  The executable catalogue the rebuild plan demanded already exists: `apps/docs` renders both bindings side
  by side (vanilla in an `srcdoc` iframe, React as a `client:load` island) on 57 of its 67 pages. This
  decision declares it the system's executable catalogue, makes its `ComponentPreview` take usage trees
  instead of strings, and adopts Playwright to run the four runtime gates: DOM-diff symmetry, interaction,
  accessibility and visual. Storybook does not come back.
---

## The problem

The rebuild plan asked for an executable catalogue and named Storybook for all of it: CSF as the example
unit, play tests for interaction, visual baselines, and the Storybook MCP as the way the agent would see
the result.

Storybook was built in this repo, twice, one for vanilla with `@storybook/html-vite` and another for
React, and deleted on 2026-07-17. It was not an accident or a technical limitation: it was rejected on
purpose, with a request to go back to the site's previews.

And meanwhile the site was already doing what Storybook was going to do. `ComponentPreview.astro` mounts
the vanilla demo in an `srcdoc` iframe with its own DOM, viewport and top layer, and the React demo as a
real `@astrojs/react` island (not a code string) in the same document, with a segmented control to switch
between them. **57 of 67 pages already have both stages live.** A second catalogue in parallel would not
have added a single capability; it would have added a second thing to keep in sync.

## The decision

**`apps/docs` is the executable catalogue.** Not a reflection of it: the same artifact.
`ComponentPreview` stops taking `html` and `react` as strings and takes a usage tree, which it renders
with the same emitter the MCP uses (decision 29). The code the page shows is the emitted code, not a
transcription. A regression in the contract shows up on the page.

The pages stay human where they should be: the order, the sections, the explanation of when to use what.
What stops being written by hand is the evidence.

**Playwright runs the runtime gates**, all four:

| Gate | What it proves |
|---|---|
| Symmetry | Both bindings of the same tree produce the same normalized DOM: parts, mapped attributes, ARIA tree |
| Interaction | The signature does what it declares, in a real browser |
| Accessibility | `@axe-core/playwright` over each stage, and the ARIA snapshot as a contract |
| Visual | Baselines approved per canonical state |

Playwright is installed even though the repo did not have it. Driving Chrome over CDP by hand was a
workaround for not having it, never a preference: hand-writing axe injection, image diffing and trace
capture is exactly the wheel not to reinvent. And Playwright MCP is what the agent drives to verify the
consuming app.

## What was rejected

**Reintroducing Storybook**, which is what the source documents literally specify in G2, G4, G5 and in
their integration phase. It brings a11y and visual solved, but it was already rejected once with full
knowledge, and it would duplicate a catalogue that exists and works.

**Formalizing the in-house CDP harness.** Zero new dependencies and total control of the protocol, in
exchange for maintaining the runner, the baselines and the evidence capture by hand.

**jsdom for the structural half and a browser only for the visual one.** The cheap gates would run on
every commit, but jsdom has already demonstrated in this repo that it lies with Zag (`raf`, microtasks,
missing `CSS.escape`) precisely in the components whose interaction matters. A gate that lies fast is not
cheap.

**Making the site the CI runner too**, exposing its trees on a machine-readable route. A single place
where things render, at the price of coupling the gates to the site's build and to the dev server being
healthy.

## Cost

`ComponentPreview.astro` and the 67 pages are touched once to move from strings to trees, and the 10
pages that have no React demo today need one or fall outside the symmetry gate. Playwright adds a large
dependency and a browser to CI.
