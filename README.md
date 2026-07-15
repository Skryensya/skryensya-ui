# allison-design-system

A Turborepo for the `@allison` design system. The base styles live in one publishable, zero-runtime-
dependency package; everything else consumes them.

```
.
├── packages/
│   └── tokens/          @allison/tokens — the base styles (pure CSS design system + validator)
├── apps/
│   └── demo/            @allison/demo — live demo + design proposals, consumes @allison/tokens
├── docs/
│   └── decisions.md     ADRs — every engineering decision, with alternatives rejected
├── turbo.json           task pipeline (lint / check / dev)
└── pnpm-workspace.yaml  workspaces: packages/* + apps/*
```

## Quick start

```bash
pnpm install          # links the workspace + installs turbo
pnpm lint             # turbo runs the token validator across the repo (cached)
pnpm --filter @allison/demo dev   # serve the demo at http://localhost:4173
```

## The base-styles package

[`packages/tokens`](packages/tokens/README.md) is the whole design system as hand-authored CSS — a
three-tier token architecture (primitives → semantic → component), four theming dimensions (brand,
light/dark, high-contrast, density) that compose through cascade layers, a state-layer pattern, and an
intent-based motion language. It ships with **zero runtime dependencies**: the `css/` folder *is* the
artifact, and a dependency-free validator (`scripts/lint.mjs`) enforces the tier rules, mode
completeness and WCAG contrast. Nothing builds; the CSS is published as-is.

## How the demo consumes the package

`apps/demo` declares `"@allison/tokens": "workspace:*"`, so pnpm symlinks the package into the app's
`node_modules`. The demo references it exactly as a real npm consumer would —
`node_modules/@allison/tokens/css/tokens.css` — proving the package works through normal resolution,
not a repo-relative shortcut.

## Tasks (Turborepo)

| Task | What it does | Where |
|------|--------------|-------|
| `lint` | Run the CSS-native token validator | `packages/tokens` |
| `check` | Alias of lint (runs `^lint` first) | root → all |
| `dev` | Serve the demo (persistent, uncached) | `apps/demo` |

Turbo caches `lint` on the token source, so unchanged runs replay in milliseconds (`FULL TURBO`).

## Why a monorepo

See [docs/decisions.md](docs/decisions.md) ADR-15. The short version: the tokens must stay a clean,
independently-publishable, zero-dependency package, while the demo and proposals need to consume them
*as a package* (not via relative paths) to prove the consumption story — which is exactly what a
workspace gives you, with a shared, cached task pipeline on top.
