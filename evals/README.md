# evals

F7 from `docs/plataforma-ai-ui.md`: a corpus of product intents, in Spanish and English, each
paired with a usage tree. `run.ts` re-validates every tree against G0-G3 (the same gate
`validate_ui` runs) on every `pnpm check`, so a contract change that quietly breaks a composition
this corpus already proved correct fails here first, before it fails an agent.

## What is actually in `evals/`

Twelve cases (`case.ts` defines the shape, `cases/*.ts` hold them, `index.ts` aggregates them):

**Regressions**. Each one recasts a documented historical bug from `plataforma-ai-ui.md` as a
product intent, so the bug cannot silently come back:

- `radio-group-value-at-group`. Selection lives on the group (`value` + `selectedBy`), not on
  each entry (`checked`).
- `checkbox-no-for-id`: no `for`/`id` anywhere; wrapping is the association.
- `switch-immediate-setting`. Switch vs. Checkbox is a distinction of intent, not appearance.
- `icon-only-button-labelled`. The icon uses the `stableIconNames` enum, and the accessible name
  lives on the button (`aria-label`), not on the decorative icon.
- `table-caption-order`: `<caption>` first and at most one, `<tbody>` required.
- `progress-in-layout`. A composition that always validated structurally but once collapsed
  visually inside a flex `Stack`; see the note in that file for what this case does and does not
  prove.
- `tooltip-anchored-published`. Guards against the anchored families (tooltip, popover, menu,
  select, combobox, date-picker, calendar, split-button) becoming unpublished again after the
  portal-vs-markup blocker that once excluded them.

**Breadth**. Common product intents with no incident behind them, so the corpus is not only a
museum of past failures: `confirmation-dialog`, `paginated-data-table`, `field-with-hint`,
`callout-with-retry`, `settings-toggle-row`.

Every tree here was built by hand from the real contracts (`get_contract`) and confirmed valid with
the real `validate_ui` before it was written down.

## What `run.ts` does NOT do

This is a regression net over hand-composed trees, not a measurement of the thing G6 actually asks
about: **whether an agent, given only the prompt and the three MCP tools, arrives at a correct
composition on its own.** `run.ts` never calls a model. It re-validates the `tree` already sitting
in each file. A prompt whose stored tree is right and a prompt no agent could ever solve look
identical here.

## The live-agent harness (`agent/`, `run-agent.ts`)

The other half of G6: send `prompt.es`/`prompt.en` to a real model, wired to the actual three MCP
tools over the actual stdio server (`packages/mcp/dist/index.js`, spawned exactly as `.mcp.json`
spawns it), capture whatever tree it independently arrives at, and score it.

Built on [TanStack AI](https://tanstack.com/ai) (`@tanstack/ai` + `@tanstack/ai-mcp`), which is
provider-agnostic on purpose: G6 asks whether *an agent* converges on a correct composition, not
whether one specific model does, so this is not locked to Anthropic. `agent/providers.ts` is a
small registry (`anthropic`, `openai` today; adding another provider is one more entry, not a
rewrite).

**Scoring** (`agent/scoring.ts`) reads the tool-call log the harness records (by wrapping every
discovered tool's `execute`, not by parsing `chat()`'s final text), and asks one question: did the
agent's *last* `validate_ui` call come back `valid: true`? That is the only thing that fails a
case. Whether the agent's emitted markup matches the reference tree in the case file is reported
too, but **never fails a case on its own**: the reference tree is one composition that passes
G0-G3, not the only one a correct agent could produce.

```
pnpm --filter @skryensya/evals agent [--provider anthropic|openai] [--model <id>] \
                                      [--lang es|en|both] [--case <id>] [--verbose]
```

Needs `packages/mcp` built (`pnpm --filter @skryensya/mcp build`) and one provider's API key set
(`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`); the script names both if neither is present. Defaults to
every case, both languages, whichever provider has a key set.

**This is opt-in and deliberately NOT wired into `pnpm check` or CI.** It spends a real API call per
case per language and is not deterministic; the static `run.ts` gate stays the thing every commit
runs; this is the thing a person runs by hand to actually measure G6.

## Running the static gate

```
pnpm --filter @skryensya/evals check
```

Wired into `turbo run check` like every other package; no separate CI step was added, since the
existing `check` pipeline already covers it.
