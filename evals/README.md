# evals

F7 from `docs/ai-ui-platform.md`: a corpus of product intents, in Spanish and English, each
paired with a usage tree. `run.ts` re-validates every tree against G0-G3 (the same gate
`validate_ui` runs) on every `pnpm check`, so a contract change that quietly breaks a composition
this corpus already proved correct fails here first, before it fails an agent.

## What is actually in `evals/`

Seventeen cases (`case.ts` defines the shape, `cases/*.ts` hold them, `index.ts` aggregates them):

**Regressions**. Each one recasts a documented historical bug from `ai-ui-platform.md` as a
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

**Semantic choice** ([ADR-0028](../docs/decisions/0028-evals-judge-choices-with-invariants.md)).
Cases where two structurally valid trees differ in whether they are RIGHT, so validity alone cannot
score them. Each declares `invariants` (`uses` at least one of some
signatures, `avoids` all of others) that any correct answer satisfies, rather than demanding the
reference tree:

- `cta-navigates-to-pricing`: action vs navigation (Button.navigation, never Button.action).
- `switch-immediate-setting` and `checkbox-no-for-id`: Switch vs Checkbox, in both directions.
- `faq-without-javascript`: Accordion vs native Details/DetailsGroup, decided by "no JavaScript".
- `view-switcher-exclusive`: a component vs the alternative its `avoidWhen` names (Segmented or
  RadioGroup, never pressed Button.action).

`run.ts` checks every reference tree satisfies its own invariants, so an invariant no answer could
meet fails the static gate instead of every live run.

Every tree here was built by hand from the real contracts (`get_contract`) and confirmed valid with
the real `validate_ui` before it was written down.

## What `run.ts` does NOT do

This is a regression net over hand-composed trees, not a measurement of the thing G6 actually asks
about: **whether an agent, given only the prompt and the MCP tools, arrives at a correct
composition on its own.** `run.ts` never calls a model. It re-validates the `tree` already sitting
in each file. A prompt whose stored tree is right and a prompt no agent could ever solve look
identical here.

## The live-agent harness (`agent/`, `run-agent.ts`)

The other half of G6: send `prompt.es`/`prompt.en` to a real model, wired to the actual MCP
tools over the actual stdio server (`packages/mcp/dist/index.js`, spawned exactly as `.mcp.json`
spawns it), capture whatever tree it independently arrives at, and score it.

A `Provider` (`agent/providers.ts`) is just "given one case, produce a scored run"; nothing about
`run-agent.ts` cares how. Four today:

- `anthropic`, `openai`: [TanStack AI](https://tanstack.com/ai) (`@tanstack/ai` + `@tanstack/ai-mcp`)
  driving a hand-rolled agent loop (`agent/harness.ts`) via the provider's API. Needs
  `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`.
- `claude-code`: the actual `claude` CLI, headless (`claude -p`), using its OWN agent loop
  (`agent/claude-code-provider.ts`). Uses the session's subscription login, not a separate API key;
  the only requirement is the `claude` binary on `PATH`.
- `codex-cli`: the actual `codex` CLI, headless (`codex exec --json`), using its OWN agent loop
  (`agent/codex-cli-provider.ts`). Uses the Codex CLI login (`codex login`, ChatGPT subscription or
  API key); the only requirement is the `codex` binary on `PATH`.

Adding another provider (OpenRouter, whatever) is one more entry in `providers.ts`, not a rewrite.

**Scoring** (`agent/scoring.ts`) reads the tool-call log the harness records (by wrapping every
discovered tool's `execute`, not by parsing `chat()`'s final text). A case PASSES when the agent's
*last* `validate_ui` call came back `valid: true` AND the final tree satisfies the case's
`invariants`, if it has any. Validity is still decided only by `validate_ui`; the invariants add
the product requirement a valid tree can still miss. Whether the agent's emitted markup matches the
reference tree is reported too, but **never fails a case on its own**: the reference tree is one
composition that passes G0-G3, not the only one a correct agent could produce.

Every run also records how the agent got there (`metrics` in each case's `.json`, columns in
`index.md`, means in `summary.json`): tool calls, catalogue pages read, whether `discover_ui` was
used, discovery calls before the first `validate_ui`, repair loops (every `validate_ui` after the
first), examples read and whether the final tree used one, and the selected root signature.

```
pnpm --filter @skryensya/evals agent [--provider anthropic|openai|claude-code|codex-cli] \
                                      [--model <id>] [--lang es|en|both] [--case <id>[,<id>]] \
                                      [--workflow discovery|catalog] [--server <path>] \
                                      [--concurrency <n>] [--verbose]
```

### Comparing the discovery workflow with the catalogue-first one

`--workflow` picks the framing the agent is given (`agent/system-prompt.ts`): `discovery` (the
default, the current server) or `catalog` (what the previous server's agents were told: read the
catalogue first). `--server` points the run at another build of the stdio server. To measure the
previous server, build it from the commit before the one that added ADR-0026, in a worktree, and
point at it:

```
BASE="$(git log --diff-filter=A --format=%H -- docs/decisions/0026-*.md | tail -1)^"
git worktree add /tmp/sk-mcp-before "$BASE"
(cd /tmp/sk-mcp-before && pnpm install --frozen-lockfile && pnpm --filter @skryensya/ai-compiler build \
  && pnpm --filter @skryensya/mcp build)
pnpm --filter @skryensya/evals agent --provider claude-code --workflow catalog \
  --server /tmp/sk-mcp-before/packages/mcp/dist/index.js --case <ids>
pnpm --filter @skryensya/evals agent --provider claude-code --case <ids>
```

Compare the two runs' `summary.json`, then `git worktree remove /tmp/sk-mcp-before`.

Needs `packages/mcp` built (`pnpm --filter @skryensya/mcp build`). Without `--provider`, it picks
the first available one, in declaration order (`anthropic`, `openai`, `claude-code`, `codex-cli`):
set an API key, or have `claude` / `codex` on `PATH`, and it runs with no other setup.

**Defaults to English only** (`--lang en`). The corpus itself still HAS both languages  -  `run.ts`
checks every case's `tree` holds for both on every `pnpm check`  -  but this is real, metered usage
per call, and doubling every measurement run for a language pass that isn't the thing under test is
exactly the spend to avoid. Pass `--lang both` or `--lang es` deliberately, e.g. after a
prompt-wording change where the language actually matters to what's being checked.

**Runs with `--concurrency 3` by default**, not one case at a time. Isolation lives in each
`Provider.run()` call itself (`claude-code`/`codex-cli` use per-call temp directories; TanStack uses
its own process-per-call MCP connection), not in waiting for one call to finish before starting the
next  -  running several in parallel doesn't weaken that. `--concurrency 1` restores strictly
sequential runs if a provider's rate limit needs it.

**This is opt-in and deliberately NOT wired into `pnpm check` or CI.** It spends real usage per run
and is not deterministic; the static `run.ts` gate stays the thing every commit runs; this is the
thing a person runs by hand to actually measure G6.

**`claude-code`'s remaining tradeoff, measured live, not assumed:** `claude -p` (no `--bare`) still
loads this machine's own hooks, skills and `CLAUDE.md` into context. Two sharper problems that WERE
here got fixed instead of just documented:

- **Fairness.** Measured before the fix: from the repo root, the model reached for `Read` (the one
  built-in tool `dontAsk` lets through unconditionally) and, once, read the eval case file's OWN
  reference tree before calling a single MCP tool. A run like that can't tell "composed it right"
  from "found the answer lying around." Fixed by spawning `claude -p` from a fresh, empty temp
  directory per call (`mkdtemp`, cleaned up after) with `--mcp-config` as inline JSON naming the
  server by its absolute built path. Nothing of this repo is reachable from there, so `Read` has
  nothing useful left to find.
- **The literal-answer failure mode.** Measured before the fix: a short, plain prompt like "a short
  survey with a single-choice question among three alternatives" sometimes got answered as an
  actual survey question, never touching a tool. Fixed with a shared system prompt
  (`agent/system-prompt.ts`, used by both providers) stating explicitly that the user's message is a
  UI to compose, not a question to answer. Not airtight: LLM agents are not deterministic, and a
  case can still occasionally slip through without a tool call, but confirmed across repeated runs
  it now converges reliably where it previously failed every time.

What was left, and why the catalogue is no longer the first call: the whole catalogue (~110KB then,
~190KB now) tripped a separate, LOWER, fixed threshold that persists a large tool result to a file
instead of inlining it; no env var moves that one. `get_catalog` became paged for that reason, and
reading every page before composing is what `discover_ui` replaced (ADR-0026).

## Reviewing what it composed (`agent/report.ts`, `apps/eval-viewer`)

Every `run-agent.ts` run writes its full detail to `evals/agent/runs/<runId>/` (gitignored  -  this is
a measurement of one run against the current catalogue, not a fixture): an `index.md` table of every
case's verdict, and per case a `<caseId>.<lang>.md` (prompt, verdict, the full tool-call trace, the
final tree, the emitted vanilla/react code) plus a matching `.json` carrying the same data
structured for a machine to read.

**`apps/eval-viewer`** reads those `.json` files and renders each case's composed tree LIVE  -  not the
emitted code shown as text, the actual component: vanilla mounts the emitted markup and runs the real
enhancers over it, React mounts the tree directly via `@skryensya/react/render-tree`, the same
live-render path the docs site's own demos use.

**The render is inside an IFRAME (`src/frame/`), never this app's own document  -  confirmed live as a
hard requirement, not a nicety.** The kit's tokens arm `light-dark()` via `color-scheme: light dark`
(`_base.scss`), which follows the reviewer's OS. Loaded into the SAME document as this app's own
chrome (an earlier version of this app did exactly that), that bled into the chrome's own plain
buttons and tables  -  no explicit color of their own, so they picked up the browser's native dark-mode
widget styling  -  while `app.css`'s hardcoded light backgrounds stayed put: "reads as dark mode on a
light background." `main.tsx` now imports NONE of the kit's CSS; `src/frame/kit-css.ts` compiles it
(`?inline`) for the iframe's own document only, which pins `color-scheme: light` explicitly (this is a
review tool, not a themed product surface  -  a fixed appearance beats one that silently differs by
reviewer's OS) and sets the kit's own `--font-family-body` token on its `body`, since the kit
deliberately never applies that itself (a real consumer's base stylesheet does). Confirmed live under
a forced-dark browser profile: this app's chrome stayed light, the iframe's `color-scheme` read
`"light"` regardless.

```
pnpm --filter @skryensya/eval-viewer dev
```

Starts at `:4190`; if that port is busy, Vite picks the next available port. Landing page lists every
run found on disk; pick one, pick a case, and the preview tab shows ONE binding at a time (Vanilla |
React toggle above the stage) with tabs for the raw tree, the emitted code, and the tool trace
underneath. Only one binding mounted at once, on purpose: comparing two isn't scanning two columns,
it's toggling between them the way `apps/docs`'s own ComponentPreview does  -  and it's also what makes
a component that paints into the browser's top layer (`dialog`, anything anchored) safe to preview at
all, see the note below. Started by hand, on purpose; it's a review tool, not something a run
auto-launches.

**Known limit:** new runs need a server restart to show up. `import.meta.glob`'s initial scan doesn't
reliably pick up a file that didn't exist yet when the dev server started. If a run you just
generated isn't in the list, stop and restart `pnpm --filter @skryensya/eval-viewer dev`.

**A limit that WAS here and got fixed twice over:** rendering both bindings side by side used to make
a component that opens into the browser's top layer (`dialog`, anything anchored) collide  -  confirmed
live on `confirmation-dialog`, a native `<dialog open>` always paints centered over the whole page
regardless of where it sits in the DOM. Mounting only one binding at a time (the toggle above) already
removed the collision within one document; the iframe removes it more fundamentally, since two
bindings can never even share a document to collide in. Confirmed live after both fixes, same case,
toggling Vanilla ↔ React under a forced-dark browser profile: exactly one `<dialog>` each time, light
appearance both times, no visual collision, no console errors.

**Getting the iframe working at all took three more fixes, each confirmed live, each worth naming
because the failure mode gave almost no signal:** `src/frame/entry.tsx` (loaded via `?worker&url`,
the same trick `apps/docs`'s own preview frame uses for a stable cross-document script URL) throws
`@vitejs/plugin-react`'s "can't detect preamble" the instant it runs, because Fast Refresh's injected
runtime checks for a bootstrap that only a page processed through Vite's `transformIndexHtml` hook
gets  -  and a hand-built `srcDoc` string never touches that hook. Two plausible-looking fixes didn't
hold: `worker.plugins` (a separate plugin pipeline from the main one) only governs PRODUCTION
bundling of a worker entry, so in DEV the files `entry.tsx` imports (`@skryensya/react/render-tree`
and everything it renders) are still transformed through the MAIN pipeline regardless, `@react-refresh`
and all  -  confirmed via a request log; and `react({ exclude })` on the main pipeline didn't stop it
either, since the plugin runs two separate JSX code paths and only one honored the option for these
files. The fix that held: `document.ts` manually injects the exact bootstrap
`transformIndexHtml` would have (`RefreshRuntime.injectIntoGlobalHook`, `$RefreshReg$`, `$RefreshSig$`,
`__vite_plugin_react_preamble_installed__`), dev-only  -  the same workaround Vite's own docs give for
any non-standard HTML entry point.

## Running the static gate

```
pnpm --filter @skryensya/evals check
```

Wired into `turbo run check` like every other package; no separate CI step was added, since the
existing `check` pipeline already covers it.
