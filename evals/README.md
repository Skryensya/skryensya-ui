# evals

F7 from `docs/plataforma-ai-ui.md`: a corpus of product intents, in Spanish and English, each
paired with a usage tree. `run.ts` re-validates every tree against G0-G3 (the same gate
`validate_ui` runs) on every `pnpm check`, so a contract change that quietly breaks a composition
this corpus already proved correct fails here first, before it fails an agent.

## What is actually in `evals/`

Twelve cases (`case.ts` defines the shape, `cases/*.ts` hold them, `index.ts` aggregates them):

**Regressions** — each one recasts a documented historical bug from `plataforma-ai-ui.md` as a
product intent, so the bug cannot silently come back:

- `radio-group-value-at-group` — selection lives on the group (`value` + `selectedBy`), not on
  each entry (`checked`).
- `checkbox-no-for-id` — no `for`/`id` anywhere; wrapping is the association.
- `switch-immediate-setting` — Switch vs. Checkbox is a distinction of intent, not appearance.
- `icon-only-button-labelled` — the icon uses the `stableIconNames` enum, and the accessible name
  lives on the button (`aria-label`), not on the decorative icon.
- `table-caption-order` — `<caption>` first and at most one, `<tbody>` required.
- `progress-in-layout` — a composition that always validated structurally but once collapsed
  visually inside a flex `Stack`; see the note in that file for what this case does and does not
  prove.
- `tooltip-anchored-published` — guards against the anchored families (tooltip, popover, menu,
  select, combobox, date-picker, calendar, split-button) becoming unpublished again after the
  portal-vs-markup blocker that once excluded them.

**Breadth** — common product intents with no incident behind them, so the corpus is not only a
museum of past failures: `confirmation-dialog`, `paginated-data-table`, `field-with-hint`,
`callout-with-retry`, `settings-toggle-row`.

Every tree here was built by hand from the real contracts (`get_contract`) and confirmed valid with
the real `validate_ui` before it was written down.

## What this does NOT do

This is a regression net over hand-composed trees, not a measurement of the thing G6 actually asks
about: **whether an agent, given only the prompt and the three MCP tools, arrives at a correct
composition on its own.** `run.ts` never calls a model — it re-validates the `tree` already sitting
in each file. A prompt whose stored tree is right and a prompt no agent could ever solve look
identical here.

That measurement needs a live-agent-in-the-loop harness: send `prompt.es`/`prompt.en` to a model
wired to the real MCP tools, capture whatever tree it produces, and score it against
`validate_ui` and, ideally, against the reference tree. Nothing in this repository can do that yet
— there is no LLM-client SDK anywhere in the monorepo (`packages/mcp` depends only on
`@modelcontextprotocol/sdk`, the *server* SDK), and adding one is an infrastructure decision this
first slice does not make on its own. Until that exists, `run.ts` is what F7 has: real, but partial.

## Running it

```
pnpm --filter @skryensya/evals check
```

Wired into `turbo run check` like every other package; no separate CI step was added, since the
existing `check` pipeline already covers it.
