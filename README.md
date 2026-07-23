# skryensya-design-system

A Turborepo for the `@skryensya` design system. `@skryensya/core` owns the Sass token source and the
framework-agnostic component contract; React and vanilla bindings consume it.

```
.
├── packages/
│   ├── core/            @skryensya/core, Sass token source + shared component contract + validator
│   ├── vanilla/         @skryensya/vanilla, progressive enhancers for authored HTML
│   └── react/           @skryensya/react, React components that render the same contract
├── apps/
│   └── docs/            @skryensya/docs, documentation site and package consumer
├── docs/
│   └── decisiones/       one file per decision record, every engineering decision, with alternatives rejected
├── CONTEXT.md           the glossary, what the words mean, and which words not to use
├── turbo.json           task pipeline (lint / check / dev / build)
└── pnpm-workspace.yaml  workspaces: packages/* + apps/*
```

## The previews are inline

Every component page renders its demo **in the page**: authored markup with `data-ds-*`, hydrated by
the single `initComponents()` call the layout makes. The source below each demo carries a **Vanilla /
React** tab, React is documented as a consumer binding, never executed by the site, so there is no
framework integration in `astro.config.mjs` and no island on any page. The site takes the path it
teaches.

## Quick start

```bash
pnpm install          # links the workspace + installs turbo
pnpm lint             # turbo runs the token validator across the repo (cached)
pnpm --filter @skryensya/docs dev     # serve the docs site at http://localhost:4173
pnpm --filter @skryensya/docs build   # static build into apps/docs/dist
```

## The core package

[`packages/core`](packages/core/README.md) owns the design system contract: Sass-authored token source,
component styling hooks, shared BEM parts and framework-agnostic option types. The compiled token CSS uses
the three-tier architecture (primitives → semantic → component), one root ramp configuration, four theming
dimensions (light/dark, high-contrast, density, radius), cascade layers, state-layer patterns and
intent-based motion. The validator (`scripts/lint.mjs`) enforces tier rules, mode completeness and WCAG contrast.

## How the docs site consumes the package

`apps/docs` declares `"@skryensya/core": "workspace:*"`, so pnpm symlinks the package into the app's
`node_modules`. Every import in the site is a **bare specifier**, `@skryensya/core/tokens.scss`, 
resolved through the package's `exports` map, which is the path the site documents as canonical. It
therefore takes the path it teaches: break the `exports` map and the site stops building. See
[decision 12](docs/decisiones/0012-monorepo-y-el-sitio.md).

The site shares one more thing with the package: `scripts/parse.mjs`, the stylesheet parser. The validator
runs it to check the rules; the site runs it to generate the token reference. A reference generated
from a different reading of the source than the one the rules are checked against would describe a system
nobody validates.

## Tasks (Turborepo)

| Task | What it does | Where |
|------|--------------|-------|
| `lint` | Run the CSS-native token validator | `packages/core` |
| `check` | Run each package's `check` script after dependency checks (`^check`) | root → all |
| `dev` | Serve the docs site (persistent, uncached) | `apps/docs` |
| `build` | Static build of the docs site (runs `^lint` first) | `apps/docs` |

Turbo caches `lint` on the token source, so unchanged runs replay in milliseconds (`FULL TURBO`).

## Component coverage

The matrix records shipped public surfaces and behavior coverage.

| Component / pattern | Core contract | CSS | React | vanilla | Docs | Tests |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Badge | ✓ | ✓ | ✓ |, | ✓ | ✓ |
| Kbd | ✓ | ✓ | ✓ |, | ✓ | ✓ |
| Button | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Field and Input | ✓ | ✓ | ✓ | Native | ✓ | ✓ |
| Checkbox, RadioGroup, and Switch | ✓ | ✓ | ✓ | Native | ✓ | ✓ |
| Navbar | ✓ | ✓ | ✓ |, | ✓ | ✓ |
| Sidebar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Nav list | ✓ | ✓ | ✓ |, | ✓ | ✓ |
| Select nativo | ✓ | ✓ | ✓ | Native | ✓ | ✓ |
| Select enhanced | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tabs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Table | ✓ | ✓ | ✓ |, | ✓ | ✓ |
| Tile family | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PageHeader, Toolbar, and EmptyState | ✓ | ✓ | ✓ |, | ✓ | ✓ |
| Toast | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Box, Stack, Inline, and Grid | ✓ | ✓ | ✓ |, | ✓ | ✓ |
| Text, Heading, and Link | ✓ | ✓ | ✓ |, | ✓ | ✓ |
| Icon | ✓ | ✓ | ✓ |, | ✓ | ✓ |
| State layer |, | ✓ |, |, | ✓ |, |

**Legend:** ✓ shipped and covered; Native platform behavior, intentionally no enhancer;, no binding or behavior test.

## Why a monorepo

See [decision 12](docs/decisiones/0012-monorepo-y-el-sitio.md). The short version: the tokens
must stay a clean, independently-publishable, zero-dependency package, while the site must consume them
*as a package*, through the `exports` map, not via relative paths, to prove the consumption story.
That's exactly what a workspace gives you, with a shared, cached task pipeline on top.

The monorepo tooling (turbo, pnpm, Astro) lives at the root and in `apps/docs`. It never enters
`packages/core`, whose `dependencies` stay empty.
