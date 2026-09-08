# Contributing

Thanks for wanting to work on this. Start with the [README](README.md) for what the system is; this
file is about how to change it without fighting the tooling.

Most of what follows exists because this repo makes one promise: **a contract in
`@skryensya/core`, and two bindings derived from it that never drift.** Nearly every rule below is
downstream of keeping that true.

## Read these first

| File | What it decides |
|---|---|
| [`CONTEXT.md`](CONTEXT.md) | The glossary. Which word names each concept, and which words not to use. It is the only authority on terminology. |
| [`docs/decisiones/`](docs/decisiones) | 20 decision records, each with the alternatives rejected. Most "why isn't this X?" questions have a numbered answer. |
| [`docs/guia-escritura.md`](docs/guia-escritura.md) | How prose is written: register, person, punctuation, and what changes between Spanish and English. |
| [`docs/pending-tasks.md`](docs/pending-tasks.md) | The live backlog, ranked. If you want something to pick up, take the top unchecked item of Nivel 1. |

## Setup

Requires **Node >= 24**. pnpm comes from `corepack`, pinned by `packageManager`.

```bash
corepack enable
pnpm install
pnpm --filter @skryensya/docs dev     # http://localhost:4173
```

Everyday gate, the same one `pre-push` runs:

```bash
pnpm turbo run check --filter='!@skryensya/ai-gates' --concurrency=1
```

`--concurrency=1` is not decoration. In parallel this check has intermittent timeouts in this repo.

## Sending a change

Outside contributors cannot push to `main`, so work arrives as a pull request:

1. **Fork** the repository and clone your fork.
2. **Branch** from `main`. Name it after the change, not after yourself: `fix/calendar-cell-size`.
3. **Commit** following the rules below. The hooks run on your machine and will tell you when
   something is off.
4. **Open a pull request** against `main`. The template asks what changed and why; the checklist is
   there because a binding changed alone is the exact drift this system exists to prevent.
5. **CI runs the same gates.** A red check is not a formality: it is the check you would have run
   locally anyway.

For anything larger than a fix, open an issue first. See
[Proposing something large](#proposing-something-large).

## Where the gates run

Most of the quality checks in this repo are **local Git hooks**, not CI. That is deliberate: failing
in two seconds on your own machine is worth more than failing in three minutes on a runner.

| Hook | What it runs | Roughly |
|---|---|---|
| `commit-msg` | Conventional Commits shape, a 100-character subject cap, no trailers | instant |
| `pre-commit` | `gitleaks` on staged changes, plus icon-vocabulary completeness when the icon vocabulary is touched | about 1s |
| `pre-push` | Dependency audit, then the full check minus the browser gates | a few minutes |

Read what a failing hook printed: each one names its own fix. `--no-verify` exists for pushing work
in progress to a branch of your own. It is not a way past a red gate on shared history.

The catch is that **a pull request from a fork never runs any of them**, because they live on the
author's machine. So [`.github/workflows/check.yml`](.github/workflows/check.yml) applies the same
gates where the hooks cannot reach: the full check, and every commit message in the pull request
validated by running `.husky/commit-msg` itself rather than a second copy of its rules.

CI is the backstop, not the primary. Run the hooks locally and CI has nothing to catch.

Two more notes:

- **`gitleaks` is scoped to what is staged**, not the whole tree, and it only scans commits made
  since it was added. If you are auditing history, run `gitleaks git --no-banner --redact .` for the
  whole repo. On a public repository, GitHub's own secret scanning covers the pushed side.
- **The browser gates are excluded everywhere**, from `pre-push` and from CI, because they take
  about 15 minutes and are sensitive to machine load, which makes a red result on a shared runner
  weak evidence. Run them yourself for anything visual (see below).

## Commit messages

```
type(scope opcional): descripcion

Cuerpo opcional, despues de una linea en blanco, para el detalle que no entra en el asunto.
```

Types: `feat fix docs style refactor perf test build ci chore revert`. The scope is optional. The
description is free text: it may start uppercase and it may end with a period.

Three things `.husky/commit-msg` does enforce:

- **The subject is capped at 100 characters.** It is the only part `git log --oneline`, the GitHub
  history and `git blame` ever show, and past a certain length it stops summarizing and becomes a
  misplaced paragraph. 100 rather than the classic 72 because this history writes long subjects on
  purpose: over the last 200 commits the median is 56 and the 90th percentile is 82, so 72 would have
  rejected 39 of them and 100 rejects 5.
- **A body must be separated by a blank line.** Git only treats the rest as a body if that blank line
  is there; without it the whole thing renders as one very long subject.
- **No `Co-authored-by:` or `Signed-off-by:` trailers**, whatever tool authored the change.

The hook does not enforce the language, but the house style is **Spanish**, and the whole history
follows it:

```
fix(calendar): sube las celdas de dia a sm para que el widget tenga un solo escalon de tamano
refactor(i18n): parte ui.ts en un arbol de mensajes que espeja las rutas del sitio
docs(changelog): registra los arreglos de chart, command-palette y editor
```

Describe the effect, not the file you touched. One commit is one subject: if you need a semicolon to
join two unrelated changes, they are two commits.

## Adding or changing a component

The contract comes first and both bindings follow it. A binding that ships alone is the drift this
system exists to prevent.

1. **Contract** in `packages/core/src/<name>.ts`: parts, option types, the attribute each option
   writes, and the accessibility rules that must hold. Pure behavior and its tests live here too, so
   both bindings share one implementation rather than two lookalikes.
2. **Semantic overlay** in `contracts/semantic/<name>.yaml`: `useWhen`, `avoidWhen`, `alternatives`.
   The structure lives in Core; this file is only *why you would choose it*.
3. **Changelog seed** in `contracts/changelog/<name>.yaml`, bilingual.
4. **CSS** in `packages/core/css/components/<name>.css`.
5. **Both bindings**, each with its own tests: `packages/vanilla` (an enhancer over authored markup)
   and `packages/react`.
6. **Publish it**: the `exports` map of each package it ships from, and the compiler's registry.
7. **A canonical usage tree** in `packages/ai-gates/src/trees.ts`. A tree no gate runs is not
   evidence of anything, which is why this list and the catalogue grow together.
8. **Docs**: a page in `apps/docs`, in both locales, plus its nav registration.
9. **Regenerate the artifacts**: `pnpm --filter @skryensya/ai-compiler build`.
10. **Run the check**, then the browser gates.

## Documentation and translations

Every user-facing string lives in `apps/docs/src/i18n/messages/`, in a tree that mirrors the site's
routes: `componentes/<slug>.ts` for a component page, `arquitectura.ts` for a top-level route, and
`_chrome/` for what the layout and shared components own.

Each file holds **both locales side by side**, `es` first. That adjacency is the point: a test
compares the two halves, and splitting them per language would put the two sides of every comparison
in different files.

Rules a test will enforce for you:

- Every key exists in both locales. A key present only in `es` silently serves Spanish to an English
  reader, so it fails the build instead.
- Two long values that are byte-identical across locales are treated as a paste error. If they are
  identical on purpose, add the key to the allowlist in `ui.test.ts` with a comment saying why.

Client-side modules must import `i18n/locales`, **never** `i18n/ui`. The dictionary is built by
spreading ~110 route shards, which a bundler cannot prove pure, so importing it from the browser
retains every translated string in the bundle.

## The Tests tab

A component page can carry a "Tests" tab showing a real pass/fail per test, not a hand-typed status.
Wiring a new one takes three steps, and skipping any of them shows a neutral "not run" clock instead
of lying:

1. Add the test file to `TARGETS` in `scripts/build-test-report.mjs`.
2. Pass `tests={[{ file, tests: [{ name, description }] }]}` to the component's `*Page.astro`, where
   `name` matches the real `it(...)` title **verbatim**. That string is the lookup key.
3. Run `node scripts/build-test-report.mjs` to regenerate `artifacts/test-results.json`.

The report is deliberately not part of `check` or `build`: a stale report should degrade one tab, not
fail the whole build.

## The browser gates

```bash
pnpm --filter @skryensya/ai-gates check          # all of them, about 15 minutes
npx playwright test src/symmetry.spec.ts         # one file
npx playwright test <spec> --workers=1           # to judge whether a failure is real
```

These render every canonical tree in both bindings and assert they land on the same DOM, expose the
same accessibility tree, and paint the same pixels.

**They are sensitive to machine load.** Measured across four runs of an identical tree: 14 minutes
with 2 failures, 51 minutes with 21, and the failing test names differed every time while none
reproduced in isolation. If a run takes much longer than about 15 minutes, it is contended and its
failures are not evidence. Re-run the suspects with `--workers=1` before believing a red result.

Two failure signatures worth recognizing:

- Failures hitting **both bindings of the same case symmetrically** usually mean the stage never
  loaded, not that the markup is wrong.
- `toHaveScreenshot` failing on "waiting for element to be stable" is contention, not a runaway
  animation.

Keep scratch specs out of `packages/ai-gates/src/`. The runner picks up anything matching there, and
a debug spec pointing at a different server once starved the worker pool and took five unrelated
gates down with it.

## Dependencies

New versions wait **30 days** before they can be installed (`minimumReleaseAge` in
`pnpm-workspace.yaml`). The quarantine is only safe because something watches for CVEs during it,
which is what `scripts/audit-gate.mjs` does on every push.

When a fix is needed sooner, except that one package rather than lowering the global number, and say
why in the file:

```yaml
minimumReleaseAgeExclude:
  - "the-package-in-question"
```

## House rules

- **No em dashes.** A repo-wide test enforces this, over every source and Markdown file. Use a comma,
  a colon, or a spaced hyphen.
- **Comments explain why, not what.** This codebase leans hard on that: the alternative that was
  rejected, the measurement that settled it, the failure the code is avoiding. Match the density of
  the file you are editing.
- **Names come from `CONTEXT.md`.** If a term is not there and you need one, add it there first.
- **Prose language follows [`docs/guia-escritura.md`](docs/guia-escritura.md)**: user-facing
  documentation and decision records in Spanish, code and repository metadata in English.

## Proposing something large

Open an issue before building it. A new contract is a public surface with a changelog, two bindings
and a gate behind it, so the useful conversation is about whether it should exist and what it is
called, and that is cheaper before the code than after.

If the answer turns out to be "this is a composition, not a component", that is a real outcome: see
[`contracts/snippets`](contracts/snippets) and [`contracts/recipes`](contracts/recipes) for where
compositions live.
