# skryensya/ui

**One contract, two runtimes, zero drift.** A framework-agnostic design system where the component
contract is the source of truth, and every binding is derived from it rather than written twice.

**[ui.skryensya.dev](https://ui.skryensya.dev)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D24-brightgreen.svg)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-10.18.2-orange.svg)](package.json)
[![Contracts](https://img.shields.io/badge/contracts-79-8957e5.svg)](contracts/semantic)

## The problem

A design system with more than one runtime usually ships the same component twice: once in React,
once in HTML plus a sprinkle of JavaScript. The two start identical and drift immediately. A prop is
renamed on one side, an `aria-*` attribute is fixed on the other, and six months later "the same
component" means two components that merely look alike.

## The approach

`@skryensya/core` publishes the contract: the parts, the option types, the attributes each option
writes, and the accessibility rules that must hold. No framework, and no DOM of its own. The stateful
components share their Zag state machines from here too, so both bindings drive identical behavior
rather than two lookalike implementations ([decision 10](docs/decisions/0010-the-vanilla-layer-uses-svelte-and-the-machines-live-in-core.md)).

Both bindings **read** that contract instead of restating it.

- `@skryensya/vanilla` progressively enhances authored HTML.
- `@skryensya/react` renders the same markup as React components.

Rename an option in Core and both sides change at once, because neither one hard-codes it. And the
claim is not taken on trust: `@skryensya/ai-gates` renders every canonical usage tree in **both**
bindings in a real browser and asserts they land on the same DOM, expose the same accessibility
tree, and paint the same pixels.

## Quick start

Requires **Node >= 24** and **pnpm 10.18.2** (via `corepack enable`).

```bash
pnpm install                            # link the workspace
pnpm --filter @skryensya/docs dev       # docs site at http://localhost:4173

# The everyday gate: typecheck, lint and tests across every package.
pnpm check
```

That is what `pre-push` runs, and it skips the browser gates. `pnpm check:gates` runs those alone
(about 19 minutes, worth it for anything visual) and `pnpm check:all` runs both.

[**ui.skryensya.dev**](https://ui.skryensya.dev) is the primary reference: every contract has a page
with live previews in both bindings, its options, its accessibility notes, and a real pass/fail test
report. The command above serves the same site locally.

## Packages

### Published surface

| Package | What it is |
|---|---|
| [`@skryensya/core`](packages/core) | The contract itself: design tokens, component parts, shared option types, the shared state machines, and the token validator. |
| [`@skryensya/vanilla`](packages/vanilla) | Progressive enhancers for authored HTML. Zag state machines behind a Svelte-rendered internal layer. |
| [`@skryensya/react`](packages/react) | React components rendering the same markup contract. |
| [`@skryensya/charts`](packages/charts) | Renderer for the chart contract's line and area kinds. |
| [`@skryensya/editor`](packages/editor) | The ProseMirror engine behind the Editor contract: schema, commands, keymap, serialization. |
| [`@skryensya/devtools`](packages/devtools) | Optional runtime debug overlay: hit-area visualization and inspection aids. |
| [`@skryensya/icons-lucide`](packages/icons-lucide) · [`-material`](packages/icons-material) · [`-phosphor`](packages/icons-phosphor) | Three icon libraries bound to one stable icon vocabulary. Each ships data, not a runtime. |

### Tooling

| Package | What it is |
|---|---|
| [`@skryensya/ai-compiler`](packages/ai-compiler) | Reconciles the declared contracts with the semantic overlay and emits `artifacts/ai-manifest.json`. |
| [`@skryensya/mcp`](packages/mcp) | MCP server over that manifest, so an agent can read the catalogue and validate a composition before writing code. |
| [`@skryensya/ai-gates`](packages/ai-gates) | Playwright gates: cross-binding symmetry, accessibility, focus-ring modality, and visual baselines. |

### Content and apps

| Package | What it is |
|---|---|
| [`@skryensya/recipes`](contracts/recipes) | Whole screens as usage trees, one per state, validated against the contracts. |
| [`@skryensya/snippets`](contracts/snippets) | Established compositions below screen scale: one component well composed, or a small molecule. |
| [`@skryensya/docs`](apps/docs) | The documentation site at [ui.skryensya.dev](https://ui.skryensya.dev) (Astro), and the system's own biggest consumer. |
| [`@skryensya/eval-viewer`](apps/eval-viewer) | Local-only viewer for agent eval runs. |

## Repository layout

```
.
├── packages/          the system: core, both bindings, icons, tooling
├── apps/docs/         the documentation site, and the system's own biggest consumer
├── contracts/
│   ├── semantic/      one YAML per contract, the human-readable overlay (79 of them)
│   ├── changelog/     one YAML per contract, its published history
│   ├── recipes/       whole screens as usage trees
│   └── snippets/      smaller established compositions
├── artifacts/         compiled output: ai-manifest.json, ai-index.json, test-results.json
├── docs/
│   ├── decisions/    20 decision records, each with the alternatives rejected
│   └── ...            audits, writing guide, pending work
├── evals/             agent evaluation corpus and runner
└── CONTEXT.md         the glossary: what the words mean, and which words not to use
```

## Why a monorepo

`@skryensya/core` must stay independently publishable and free of the build tooling around it, while
the docs site must consume it **as a package**, through the `exports` map, not through relative
paths. That way the site takes the path it teaches: break the `exports` map and the site stops
building. Turbo, pnpm and Astro live at the root and in `apps/docs`, never inside `packages/core`.

See [decision 6](docs/decisions/0006-the-monorepo-and-the-site.md), and
[decision 13](docs/decisions/0013-the-contract-lives-in-core-and-frameworks-are-bindings.md) for why the
contract lives in Core and the frameworks are bindings.

## Commands

| Command | What it does |
|---|---|
| `pnpm check` | Typecheck, lint and test every package except the browser gates. The everyday loop, and what `pre-push` runs. Cached by Turbo: unchanged packages do not re-run. |
| `pnpm check:gates` | The browser gates (Playwright, ~19 min). Their dependencies build first, from cache if nothing moved. |
| `pnpm check:all` | Both. The full gate, and what CI runs on a pull request. |
| `pnpm lint` | Token validator across the repo (cached by Turbo). |
| `pnpm build` | Build every package. The docs site's static output lands in `apps/docs/dist`. |
| `pnpm --filter @skryensya/docs dev` | Docs site on port 4173. |
| `pnpm --filter @skryensya/ai-gates check` | The browser gates alone. About 15 minutes, and sensitive to machine load: run them with the machine otherwise idle, or use `--workers=1` to judge a failure. |

Turbo caches aggressively, so an unchanged run replays in milliseconds.

## Contributing

Contributions are welcome. [`CONTRIBUTING.md`](CONTRIBUTING.md) is the full guide: setup, the
contract-first checklist for a new component, how translations and the Tests tab are wired, and how
to read a failing browser gate. The essentials are below, because a few things about this repo are
unusual and knowing them up front saves a rejected commit.

### Sending a change

Fork, branch from `main`, and open a pull request. The template asks what changed and why.

### The gates are local first

Most checks run on your machine, in Git hooks, because failing in two seconds beats failing in three
minutes on a runner:

| Hook | What it enforces |
|---|---|
| `commit-msg` | Conventional Commits shape, a 100-character subject, a 300-character body, no trailers. |
| `pre-commit` | Secret scanning (gitleaks) and icon-vocabulary completeness. |
| `pre-push` | Dependency audit, then the full check across every package except the browser gates. |

If a hook blocks you, read what it printed: each one names the fix. Reach for `--no-verify` only when
you are pushing work in progress to a branch of your own.

A pull request from a fork never runs those hooks, so
[CI](.github/workflows/check.yml) applies the same gates on every PR: the full check, plus each
commit message validated by running `.husky/commit-msg` itself rather than a second copy of its
rules.

### Commit messages

```
type(optional scope): description

Optional body, after a blank line. At most 300 characters.
```

Types: `feat fix docs style refactor perf test build ci chore revert`. The scope is optional and the
description is free text. The subject is capped at 100 characters and the body at 300; anything that
needs more room is an ADR or a code comment. No `Co-authored-by:` or `Signed-off-by:`
trailers, ever.

`.husky/commit-msg` enforces this, so a non-conforming message is rejected at commit time. See
[`CONTRIBUTING.md`](CONTRIBUTING.md#commit-messages) for the reasoning behind the cap.

### Adding or changing a component

The contract comes first, and both bindings follow it:

1. Declare or amend the contract in `packages/core`, with its pure behavior and its tests.
2. Add the semantic overlay in `contracts/semantic/<name>.yaml` and seed `contracts/changelog/`.
3. Implement **both** bindings, each with its own tests. One binding alone is a drift you have shipped.
4. Write the CSS in `packages/core/css/components/`.
5. Document it in `apps/docs`, in both locales.
6. Run the check, then the browser gates for anything visual.

### House conventions

- **No em dashes.** A repo-wide test enforces this. Use a comma, a colon, or a spaced hyphen.
- **Comments explain why, not what.** This codebase leans hard on that; match the surrounding density.
- **Dependencies wait 30 days** before they can be installed (`minimumReleaseAge` in
  `pnpm-workspace.yaml`). A genuine security fix can skip the queue per package, and that exception
  gets written down.
- **Translations live in `apps/docs/src/i18n/messages/`**, in a tree that mirrors the site's routes.
  Every key exists in both locales, and a test proves it.

### Before you propose something large

Read [`CONTEXT.md`](CONTEXT.md) for the vocabulary and [`docs/decisions/`](docs/decisions) for the
decisions already made and the alternatives already rejected. Many "why isn't this X?" questions have
a numbered answer there.

## License

[MIT](LICENSE) © Allison Peña
