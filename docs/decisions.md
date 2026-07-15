# Engineering decisions

Architecture decision records for the token system. Each entry captures **why** a choice
was made and **what was rejected**, so a future reader (or a future you) doesn't re-litigate
a settled question or quietly break the reasoning it rests on.

The README documents *what the system does*; this file documents *why it's shaped that way*.
When you change one of these, update the record — a stale ADR is worse than none.

Status legend: **Accepted** (in effect) · **Superseded by ADR-NN** · **Revisit** (deferred, see note).

| # | Decision | Status |
|---|----------|--------|
| 1 | Three tiers, with tier 3 opt-in and element-scoped | Accepted |
| 2 | Colour primitives are named `ramp`, by role, with the prefix kept | Accepted |
| 3 | Each theming dimension owns exactly one layer | Accepted |
| 4 | `light-dark()`'s two-slot limit dictates the colour format | Accepted |
| 5 | Modes live in `$extensions.ds.modes`, not in `$value` | Superseded by ADR-12 |
| 6 | Density is a runtime multiplier with the WCAG floor baked in | Accepted |
| 7 | Style Dictionary parses and resolves; we emit | Superseded by ADR-12 |
| 8 | Component hooks drop the group segment and win on specificity | Accepted |
| 9 | The linter is the enforcement layer, and it runs across brands | Accepted (amended by ADR-12) |
| 10 | Colour primitives are authored in OKLCH | Accepted |
| 11 | The contrast contract is data, checked at build time | Accepted (amended by ADR-12) |
| 12 | Author the tiers in pure CSS; drop Style Dictionary | Accepted |
| 13 | State layers use `currentColor` + a single-active-layer priority ladder | Accepted |
| 14 | Motion is intent-token-driven; reduced motion is a mode, not a kill switch | Accepted |
| 15 | Turborepo + pnpm workspaces; base styles are their own package | Accepted |

---

## ADR-1 — Three tiers, with tier 3 opt-in and element-scoped

**Status:** Accepted

**Context.** The article this system follows recommends *not* building a component tier unless
you have multi-brand or white-label needs, because component tokens add real maintenance weight.
We chose multi-brand, so tier 3 earns its place — but the usual way to ship it (Adobe Spectrum's
model: emit every component token to `:root`) means every consumer downloads the tokens for every
component whether they use it or not, and the global bundle grows with each component added.

**Decision.** Keep all three tiers, but make tier 3 **opt-in and scoped to the element**, never
emitted to `:root`. Each component compiles to its own `dist/css/components/<name>.css`, whose
declarations live under `.ds-<name>`. A consumer imports only the components it ships.

**Alternatives considered.**
- *Two tiers (skip tier 3).* Simplest, and what most systems do. Rejected because multi-brand is
  exactly the case the article says justifies tier 3, and we want the component-level override
  surface (`--ds-button-bg`) as a public contract.
- *Tier 3 in `:root` (Spectrum).* Auditable and lintable in one place, but every unused component
  is dead weight in every consumer's CSS. Rejected on bundle cost.
- *Hybrid (authored in JSON, emitted per-file).* This is effectively what we built — the tokens are
  in the source so they're versioned and lintable, but emitted per-component and scoped.

**Consequences.** The design system ships *hooks*, not components — the consuming app writes the
structural CSS and wires the hooks (see `demo/index.html`). Unused components cost zero bytes. The
price is one extra concept ("import the component CSS you use") and a build step that groups tier-3
tokens per component. See [ADR-8](#adr-8--component-hooks-drop-the-group-segment-and-win-on-specificity)
for how the hooks themselves are named.

## ADR-2 — Colour primitives are named `ramp`, by role, with the prefix kept

**Status:** Accepted

**Context.** Tier 1 colour is an ordered sequence of tones per colour (`50`…`950`). Two naming
questions: what to call the sequence, and what to call each sequence. Both choices ripple into
whether multi-brand works at all.

**Decision.** Call the group `ramp`, and name each ramp by **role** (`accent`, `neutral`, `danger`,
`success`, `warning`), never by hue (`blue`, `gray`, `red`). Keep the `ramp` prefix on emitted
variables (`--ramp-accent-600`).

**Why by role, not hue.** The semantic layer references *ramp positions* — `color.action.primary
= {ramp.accent.600}` — and never mentions a colour. That indirection is the *entire* mechanism that
makes brand a tier-1 swap: the `default` brand puts blue in `accent`, `dusk` puts violet, and
`accent-600` keeps meaning "the full tone, slightly darkened" in both. If the ramp were named
`ramp.blue`, the `dusk` brand would have a ramp called "blue" containing violet — a lie in the name —
and the semantic layer would have to change per brand, which would make the dimensions non-orthogonal
(see [ADR-3](#adr-3--each-theming-dimension-owns-exactly-one-layer)).

**Why `ramp` over the alternatives.**
- `palette` implies an *unordered set*; it loses the fact that `500 → 700` is a directional move
  along a luminosity slope, which is the operation dark-mode and hover states rely on.
- `shades` (Tailwind's word) implies *darker only*, but the `50`–`400` steps are tints. Technically
  false for half the ramp.
- `scale` is the most accurate word for "ordered sequence" — but it's already taken by the
  non-colour primitives (`scale.space`, `scale.radius`). Reusing it would blur the distinction.
- `tones` (Material's word) is correct but vaguer than `ramp`.

**Why keep the prefix.** In emitted CSS a primitive reads `--ramp-accent-600` and a semantic token
reads `--color-action-primary`. The different prefix **marks the tier in the variable name**: seeing
`--ramp-*` inside a component's CSS is a visible smell that tier 3 skipped tier 2. Flattening to
`--accent-600` loses that signal; renaming to `--color-accent-600` collides with the `--color-*`
semantic namespace and loses it too.

**Known weaknesses (accepted).** `ramp` is insider jargon — a dev outside design-systems work won't
know it on sight; `color` would be more universally legible. And `ramp` is grammatically singular but
holds several ramps. Both are tolerable given the tier-marking benefit. **Revisit** only if the token
names' primary audience becomes designers or external consumers, where legibility would outweigh the
tier signal.

## ADR-3 — Each theming dimension owns exactly one layer

**Status:** Accepted

**Context.** We support four theming dimensions: colour mode (light/dark), brand, density, and high
contrast. Naively, brands × modes × densities is a combinatorial explosion — 3 × 3 × 2 = 18 authored
stylesheets — and every new component or brand multiplies it further.

**Decision.** Make the dimensions **orthogonal** by having each one own a different layer of the
token graph, so they compose in the cascade instead of being enumerated:

| Dimension | Owns | Mechanism |
|-----------|------|-----------|
| Brand | tier-1 ramps | swap the primitive palette (`brands/<brand>.css`) |
| Colour mode | tier-2 colour | `light-dark()` picks a slot via `color-scheme` |
| High contrast | tier-2 colour | an override block re-declares the same tokens |
| Density | tier-2 spacing | a runtime `--ds-density` multiplier |

**Consequences.** `dark × dusk × compact` exists nowhere on disk; the browser computes it live from
one brand file + the base tokens. The proof that it worked: `brands/dusk.css` contains **zero
semantic tokens** — a brand is a pure tier-1 override. This orthogonality is load-bearing and fragile:
the moment a semantic token references a hue instead of a ramp position, or a brand file starts
overriding semantic tokens, two dimensions start sharing a layer and the explosion returns. The
linter's tier-direction and no-raw-value rules exist partly to guard this.

## ADR-4 — `light-dark()`'s two-slot limit dictates the colour format

**Status:** Accepted

**Context.** `light-dark()` (CSS Color 5) is the native way to serve one of two values based on the
used `color-scheme`. It's attractive because flipping `color-scheme` on `<html>` re-themes the page
with no extra CSS and gives native dark scrollbars/form controls for free. But it has two hard limits:
it takes **exactly two arguments**, and it's only valid **where a `<color>` is valid**.

**Decision.** Use `light-dark()` for the light/dark axis, and let its two constraints shape the rest
of the colour model rather than fighting them:
- **Three colour modes don't fit in two slots**, so high contrast is *not* a third argument. It's a
  separate override block (`modes/hc.css`) that re-declares the same semantic tokens with `hc-*` ramp
  positions, still wrapped in `light-dark()` so it composes with the light/dark axis.
- **Non-colour values can't be mode-aware at all.** A shadow, a length, a font stack can never sit
  inside `light-dark()`. So where a shadow needs to vary by mode, its *colour* is isolated into its
  own colour token (`shadow.md`) and the `box-shadow` composite (`elevation.raised`) references it.

**Consequences.** Every mode-aware token in the system is, necessarily, a colour token — that's a
property of the platform, not a stylistic choice, and it's why elevation is modelled as
colour-token-plus-composite instead of one shadow token per mode. Anyone adding a mode-varying
non-colour token will hit this wall; the fix is always "extract the colour part."

## ADR-5 — Modes live in `$extensions.ds.modes`, not in `$value`

**Status:** Accepted

**Context.** The DTCG token spec defines only `$value`. It has no concept of light/dark/contrast
modes. We need per-mode values but want to stay within the DTCG format so standard tooling can parse
our files.

**Decision.** `$value` holds the **light** value (the default). Dark and both high-contrast values
live under `$extensions.ds.modes` (`dark`, `hc-light`, `hc-dark`). The CSS emitter collapses
`$value` + `dark` into a single `light-dark()` call and emits `hc-*` as the override block from
[ADR-4](#adr-4--light-darks-two-slot-limit-dictates-the-colour-format).

**Unexpected benefit.** Style Dictionary resolves `{alias}` references *inside* `$extensions`, not
just in `$value`. So `"dark": "{ramp.neutral.100}"` gets validated and resolved exactly like a real
token value — a typo'd ramp position in a dark-mode value fails the build. We get validation of the
mode values for free, which was the single biggest reason not to hand-author the theme CSS.

**Alternatives considered.**
- *Separate files per mode* (`color.light.json`, `color.dark.json`). Rejected: the light and dark
  values for one token drift apart across files, and there's no structural link forcing every token
  to define every mode. Co-locating them under one token makes [ADR-9](#adr-9--the-linter-is-the-enforcement-layer-and-it-runs-across-brands)'s
  mode-completeness check trivial.
- *`@media (prefers-color-scheme)` blocks authored by hand.* Rejected: no reference resolution, no
  validation, and it can't express the user-override-beats-OS logic cleanly.

**Consequences.** Our JSON is DTCG-parseable but *semantically* extended — a generic DTCG tool sees
valid tokens but ignores the modes. That's the intended trade: standard parsing, custom meaning.

## ADR-6 — Density is a runtime multiplier with the WCAG floor baked in

**Status:** Accepted

**Context.** Density (comfortable/compact/dense) is a spacing dimension. The obvious implementation —
author a second full set of spacing values for "compact" — doubles the surface area to maintain and
lets the two scales drift. And any density mechanism can silently violate accessibility: shrink a
control enough and you cross the WCAG 2.2 SC 2.5.8 minimum target size (24px), which no code review
reliably catches.

**Decision.** Density is a single runtime multiplier, `--ds-density` (1 = comfortable). Spacing
tokens emit `round(calc(<base> * var(--ds-density)), 2px)`. Interactive sizes additionally floor the
result: `max(round(calc(<base> * var(--ds-density)), 2px), 24px)`. The floor is *inside the token*,
so no product team can multiply past it regardless of what they set `--ds-density` to.

**Why `round(…, 2px)`.** `calc(4px * 0.6)` = 2.4px falls off the base grid; a few of those next to
each other make a compact UI shimmer. `round()` snaps results back onto a 2px sub-grid — a no-op at
density 1 (every primitive is already a multiple of 4) and a stabiliser everywhere else. This is the
one place the token layer does arithmetic the designer didn't author, and it's justified.

**What is deliberately density-invariant.** Typography (scaling font-size without correcting
line-height reads worse — density is a spacing problem, not a type problem), corner radius (a brand
property, not a spatial one), focus-ring width (a ring that shrinks in compact mode disappears), and
the touch-target hit area (paint small, hit big — the invisible target stays 44px). These carry no
`ds.density` extension.

**Consequences.** One multiplier expresses every density; there's no compact stylesheet to drift.
The accessibility floor is unreachable by construction rather than by documentation. Downside: the
emitted values are `calc`/`round`/`max` expressions, not plain numbers, so reading them back in JS
requires `getComputedStyle` (already true for any custom-property-based system).

## ADR-7 — Style Dictionary parses and resolves; we emit

**Status:** Accepted

**Context.** Style Dictionary is the de-facto token build tool and the one the source article
assumes. But nothing in its stock format pipeline knows about `light-dark()` collapsing, a density
multiplier, high-contrast override blocks, or per-component scoped output — all of which this system
needs.

**Decision.** Use Style Dictionary strictly as a **parser and reference resolver**: it merges the
token files, validates that every `{alias}` (including those nested in `$extensions`) resolves, and
hands back a flat token list carrying both the authored form (`original.$value`, keeping `{alias}`)
and the fully-resolved form (`$value`, a literal). All CSS/TS *emission* is ours, in `src/emit.mjs`
and `scripts/build.mjs`.

**Why both forms matter.** `original.$value` lets us emit `var(--ramp-accent-600)` and preserve the
runtime cascade (the equivalent of Style Dictionary's `outputReferences: true`). `$value` gives the
contrast linter real colours to do luminance maths on. We need both, per token, which the flat list
provides.

**Alternatives considered.**
- *Stock `css/variables` format.* Rejected: can't express any of the four things above. We proved
  this by probing its output before committing to custom emitters.
- *A different tool (Terrazzo).* DTCG-native with built-in contrast checks, tempting. Deferred, not
  rejected — the emitter logic here is tool-agnostic enough to port. **Revisit** if the custom
  emitter grows costly.
- *No build tool, hand-written CSS.* Rejected: loses reference validation and the free mode-value
  checking from [ADR-5](#adr-5--modes-live-in-extensionsdsmodes-not-in-value).

**Consequences.** We own ~200 lines of emitter code, which is the price of the four features. Style
Dictionary is a dependency but a shallow one — it's doing parsing and graph resolution, the parts
that are genuinely tedious to reimplement, and nothing we'd need to fight.

## ADR-8 — Component hooks drop the group segment and win on specificity

**Status:** Accepted

**Context.** A component has a base look plus variants (`primary`, `danger`, `ghost`) and sizes
(`sm`, `lg`) and states (`disabled`). The naive encoding gives each its own variable —
`--ds-button-primary-bg`, `--ds-button-danger-bg`, `--ds-button-ghost-bg` — which is a combinatorial
explosion of hooks that the consuming CSS then has to `if`/`else` between.

**Decision.** Drop the group segment from the emitted hook name. Base and every variant all declare
the *same* `--ds-button-bg`; the variant just re-declares it inside a more specific selector
(`.ds-button[data-variant='primary']`) and **wins on specificity**. The consumer writes
`background: var(--ds-button-bg)` once and never branches.

**Consequences.** The hook set stays small and flat — one `--ds-button-bg`, not one per variant — and
the whole thing behaves like a set of *styling hooks* rather than a token dump. It also makes external
override trivial and total: `.hero .ds-button { --ds-button-bg: rebeccapurple }` reskins every variant
in that scope with one line, because they all read the same hook. The cost is that variants are
expressed through selector specificity, so a consumer who invents a more specific selector can
accidentally out-rank a variant; documented as a consumption caveat.

## ADR-9 — The linter is the enforcement layer, and it runs across brands

**Status:** Accepted

**Context.** Every discipline in this system — references point down, modes are complete, no raw
values, contrast holds — is worthless if it's only a convention people are asked to follow. Three
folders named primitive/semantic/component don't make a three-tier system; the *enforced direction of
references* does.

**Decision.** `scripts/lint-tokens.mjs` runs before the build (`npm run check`) and across **every
brand**, because a rule that only holds for the default palette isn't a rule. It checks:
1. **Tier direction** — references may point down or sideways, never up; tier 3 may never reach tier 1.
2. **Mode completeness** — a mode-aware token must define `dark`, `hc-light`, and `hc-dark`, or
   `light-dark()` has a hole in some theme.
3. **No raw values** — tier 2/3 values must be aliases or a tiny literal allowlist, never a hardcoded
   colour or size.
4. **Contrast** — every pair in `contrast.pairs.json` clears its WCAG ratio in its mode, in every
   brand, computed from OKLCH (see [ADR-11](#adr-11--the-contrast-contract-is-data-checked-at-build-time)).
5. **Name shape** — lowercase kebab, no reserved DTCG characters.

**Evidence it works.** Building this repo, the contrast check rejected `border.default` at 1.44:1 and
`text.tertiary` at 3.74:1 — both values a designer would reach for first, both wrong by the tokens'
own stated requirements. The corrected values carry a note saying the linter made the call. A
deliberate negative test (pointing `button.primary.bg` straight at `{ramp.accent.600}`) confirmed the
tier-skip rule fails the build.

**Consequences.** The rules are executable, not aspirational, and they fail CI rather than a
reviewer's attention. The cost is that the linter has to re-implement OKLCH→sRGB→luminance to check
contrast without a browser; that maths lives in `scripts/lint-tokens.mjs` and is the fiddliest part
of the repo.

## ADR-10 — Colour primitives are authored in OKLCH

**Status:** Accepted

**Context.** Colour ramps can be authored in hex, HSL, or a perceptual space. Ramps need even
*perceptual* steps (so `500 → 600` looks like a consistent move at every position) and we want to
derive hover/pressed states by nudging lightness rather than hand-authoring each one.

**Decision.** Author every colour primitive in `oklch()`. Lightness is perceptually uniform, so
authoring a ramp is a matter of walking the `L` value down a smooth curve; hue stays constant across
a ramp (it's literally the third argument), which is what lets a brand swap be "same ramp, different
hue" (see [ADR-2](#adr-2--colour-primitives-are-named-ramp-by-role-with-the-prefix-kept)).

**Consequences.** State derivation with `color-mix(in oklab, …)` and relative colour syntax
(`oklch(from … calc(l + .08) c h)`) is available to consumers without extra tokens. The contrast
linter has to convert OKLCH→linear-sRGB→WCAG-luminance itself (no `getComputedStyle` in Node), which
is implemented once in the linter. Browser support for `oklch()` is Baseline; consumers needing
ancient browsers would require a hex fallback layer we haven't built.

## ADR-11 — The contrast contract is data, checked at build time

**Status:** Accepted

**Context.** Accessibility contrast is usually verified by eye, by per-component screenshot tests, or
not at all — all of which are expensive, flaky, or absent, and none of which survive a brand swap or a
value tweak without a human re-checking.

**Decision.** Express the contract as data: `tokens/contrast.pairs.json` lists every
foreground-on-background pair, the WCAG ratio it must clear (`4.5` normal text, `3` non-text/large,
`7` AAA), and the modes it applies to. The linter checks each pair against each brand and **fails the
build** on a violation.

**Deliberate omissions.** Disabled-text pairs are absent, not forgotten — WCAG 1.4.3 exempts disabled
controls, so linting them would be *wrong*, not lenient. Decorative borders (`border.subtle`) are
absent for the same reason (1.4.11 exempts non-meaningful elements).

**Consequences.** A contrast regression is caught in CI, before merge, across all brands at once —
far cheaper and more reliable than screenshot testing. The pairs file is a maintained artifact: adding
a new semantic colour without adding its pair means it's unchecked, so the pairs file has to grow with
the token set. That's a known gap — there's no rule yet that *every* text/bg token appears in some
pair; adding one is the obvious next hardening step.

## ADR-12 — Author the tiers in pure CSS; drop Style Dictionary

**Status:** Accepted. Supersedes ADR-5 and ADR-7; amends ADR-1, ADR-9, ADR-11.

**Context.** The system was JSON source → Style Dictionary (parse + resolve) → custom emitters →
CSS. An architecture review then asked what SD was actually buying a **web-only** design system.
The honest answer: multi-platform export (iOS/Android — never used) and build-time reference
validation. Everything the emitters produced — `light-dark()`, the density `calc()`/`round()`
expressions, `var()` alias chains, per-component scoping — is exactly what you would hand-write in
CSS. SD was reimplementing the browser's own runtime at build time.

**Decision.** Delete the build layer. The three tiers ARE hand-authored CSS files under `css/`
(`primitives.css`, `semantic.css`, `brands/*`, `modes/hc.css`, `components/*`). No JSON, no SD, no
emitters, **zero dependencies**. Enforcement survives as a CSS-native validator (`scripts/lint.mjs`)
that parses the `.css` directly.

**This is the deletion test applied to a whole layer, and it passes.** Deleting the build pipeline
did not make complexity reappear across callers — it vanished, because CSS custom properties +
`light-dark()` + `calc()`/`round()` are the runtime the emitters were duplicating. `emit.mjs`,
`build.mjs`, the `tokens/**` JSON, and the SD dependency all went; nothing replaced them but the CSS
that was already the generated output.

**Two improvements the rewrite bought (the "mejoralo"):**
- **Cascade layers as the tier boundary.** `@layer primitives, semantic, components, overrides`
  makes tier precedence native: a later layer wins, so brand/high-contrast overrides beat base
  semantics regardless of import order, and any unlayered consumer rule beats every layer — so an
  app overrides a hook with no specificity fight. This strengthens ADR-3 (dimensions compose) by
  moving it from import-order discipline to the cascade itself.
- **Two real bugs the SD pipeline had silently shipped, now fixed.** (1) The component emitter
  leaked its consumption example outside the CSS comment, producing invalid CSS. (2) `ds.scope`
  authored on group nodes never survived SD's flattening, so `sm`/`lg`/`disabled` emitted as
  `[data-variant='sm']` instead of `[data-size='sm']`/`:disabled` — sizing never applied. Hand-
  authoring made both impossible.

**What each amended ADR becomes:**
- **ADR-5** (modes in `$extensions`): gone. Modes are authored directly as `light-dark(a, b)`; the
  third mode is the `modes/hc.css` override block. No extension mechanism, no SD resolution.
- **ADR-7** (SD parses, we emit): gone. There is no parse/emit split; the CSS is the source.
- **ADR-1** (tier 3 opt-in, scoped): unchanged in intent — components are still opt-in, still
  scoped to the element, now in the `components` layer rather than an emitted file.
- **ADR-9 / ADR-11** (enforcement + contrast contract): unchanged in intent, retargeted. The
  validator reads `.css` instead of SD's token list; it resolves `var()` chains itself for contrast
  (a ~30-line resolver that replaces the whole SD dependency). Same five checks, same cross-brand
  discipline, same OKLCH contrast maths.

**Alternatives considered.**
- *Keep JSON but write our own tiny emitter.* Rejected: JSON would still be the source, so it isn't
  "pure CSS", and it keeps a build step for a web-only system that doesn't need one.
- *Zero tooling — hand CSS, no validator.* Rejected: enforcement (ADR-9) is what makes this a system
  rather than three folders; dropping SD doesn't require dropping the checks.
- *Stylelint instead of a custom validator.* Rejected: it can express unknown-custom-property and a
  contrast plugin, but not the system-specific tier-direction and mode-completeness rules.

**Consequences.** No `node_modules`, no build, no lockfile — the package is the `css/` folder.
Consumers `@import` or `<link>` the files directly. The cost paid: pure CSS gives **no build-time
error** on an unresolved `var()` by itself (it silently falls back at runtime), which is exactly the
gap the validator now closes. The bet is that ~250 lines of dependency-free validator are cheaper to
own than a Style Dictionary pipeline — for a web-only system, they are.

## ADR-13 — State layers use `currentColor` + a single-active-layer priority ladder

**Status:** Accepted

**Context.** Interactive states (hover, focus, pressed, selected, dragged) need a consistent visual
treatment across every component, variant, and semantic colour, without inventing a colour per
combination. The pattern is a semi-transparent overlay — the **state layer** (documented synonyms:
*interaction layer*, *interaction overlay*; `state layer` is the canonical name in tokens and code).

**Decision — colour.** The overlay tint is `currentColor`, the component's own content colour, exposed
as `--interaction-layer-color: currentColor`. Evaluated against the alternative (black-on-light /
white-on-dark):

- `currentColor` **subsumes** black/white: a neutral surface has dark (light mode) or light (dark mode)
  text, so the layer darkens or lightens correctly with no per-mode branch.
- It is **correct on saturated fills**, where black/white fails: a primary button's content is
  `on-accent` (near-white), so the layer is a white wash over blue — a black overlay there looks muddy.
- It needs **zero per-component colour tokens** — one token serves every component, variant, and brand.

**Decision — one active layer, by priority.** Exactly one state's opacity is shown; opacities are never
summed. The ladder is `disabled > dragged > pressed > focus > hover > selected > default`, realised
**without combined selectors**: every state rule assigns the same `--interaction-layer-opacity`, every
state selector has equal specificity (0,2,0), so when several match, source order decides and the
highest-priority rule (written last) wins. `disabled` forces the opacity to 0.

**Decision — selected is the base rung, not an additive base.** Reviewed the "persistent selected base
under hover/pressed" option and declined it for v1: an additive base means two overlapping layers,
i.e. summed opacity, which the model forbids. Instead selected is lowest and hover/pressed replace it;
selection never disappears because it always carries an **independent indicator** (check, filled
control, rail, weight). A team needing a stronger selected+hover defines a dedicated combined opacity
token — never a runtime sum.

**Constraint this inherited from ADR-4/ADR-12.** A number can't live inside `light-dark()`, so the
opacity tokens are **mode-invariant** — the tint flips automatically via `currentColor`, but the
opacity is one number for light and dark. High contrast raises the opacities (and the focus-ring width)
through the `[data-contrast]` override, which *is* attribute-driven, satisfying the high-contrast
visibility requirement without a per-mode number.

**Accessibility (non-negotiable).** The layer is never the sole signal. Focus carries an independent
ring (`outline`, checked ≥3:1 by the validator); selection carries a real indicator; disabled dims the
content tokens and forces the layer off; the fade respects `prefers-reduced-motion`. `:focus-visible`
(not `:focus`) keeps mouse clicks from leaving a lingering focus layer.

**Implementation.** One opt-in file, `css/patterns/state-layer.css`, defines `.ds-interactive`: a
`::before` layer (`pointer-events:none`, `z-index:-1` under `isolation:isolate`, `border-radius:inherit`)
and the ladder. `:has()` variants let the same class cover native controls and label-wrapped inputs
(`::before` doesn't render on `<input>`). The validator gained a `patterns/ → component` tier mapping
and now allows non-colour high-contrast overrides (the opacity bumps) provided they target a real base
token.

**Consequences.** Any component adopts states by adding one class and forwarding ARIA — no state colours
in the component, nothing hardcoded. The tint follows content colour, which is a surprise only if a
component sets an unusual text colour (override `--interaction-layer-color` locally). The single-layer
ladder can be broken by a consumer selector more specific than `.ds-interactive:state` — an inherent
CSS limitation, documented as an edge case.

## ADR-14 — Motion is intent-token-driven; reduced motion is a mode, not a kill switch

**Status:** Accepted

**Context.** Teams were free to pick arbitrary durations and easings. The goal is a **motion language**
(a **motion system** built from **semantic motion tokens** — the approach is *intent-based motion
tokens*): components describe *what a transition means* (enter, feedback, expand), not *how long it
lasts*, so technical values can evolve without touching any component API.

**Decision — three tiers, same as colour.** Tier 1 primitives are pure technical values
(`--scale-duration-{instant,fast,moderate,slow}`, `--scale-easing-{linear,standard,enter,exit,
emphasized,spring}`). Tier 2 **intent** tokens compose them per purpose
(`--motion-enter-{duration,easing,distance}`, `--motion-feedback-*`, `--motion-expand-*`, …, plus a
`--motion-distance-{none,sm,md,lg}` scale). Components (tier 3) consume intent tokens only.

**This is enforced for free by the existing tier rules.** Because the scale durations/easings are tier-1
primitives, the validator's **tier-skip** rule already forbids a component from referencing a raw
duration — it must go through an intent token. Retuning a primitive (`fast` 120→100ms) restyles the
whole system with zero component or intent-token edits, which is the entire point of the semantic API.

**Decision — direction carries meaning.** Enter decelerates (`easing-enter`) and travels a `md`
distance into place; exit accelerates (`easing-exit`), is shorter, and travels less — an element leaving
has already been decided about, so making the user wait is pure latency. Distance maps to hierarchy:
`lg` for navigation/drill-down depth, `sm` for inline reveals. Springs exist as a primitive but are
flagged not-for-critical-UI (overshoot reads as imprecision).

**Decision — reduced motion is a functional variant (principle #10), not an exception.** A
`@media (prefers-reduced-motion: reduce)` block redefines the SAME intent tokens by role rather than
zeroing all of them: **Helpful** spatial motion (enter/exit/reveal/navigate) drops distance to 0 and
keeps a short fade; **Essential** changes (state-change, expand/collapse) keep a brief legible duration;
**Decorative** (emphasize) goes to 0; **Continuous** (loading) falls back to a gentler duration but
components are expected to swap to a non-spatial variant. Because it redefines tokens components already
consume, no component code changes — the reduction is systemic, not per-component.

**Alternatives considered.**
- *Expose only technical tokens (`duration.fast`, `ease.in-out`).* Rejected: that's what lets teams
  pick arbitrarily; intent tokens are the whole ask.
- *Blanket `@media` that zeroes every duration/distance.* Rejected: it makes essential state changes
  imperceptible. The role-classified reduction keeps them legible.
- *A JS `MotionProvider` as the source of truth.* Deferred: the tokens are CSS custom properties, so
  `prefers-reduced-motion` works with zero JS; a provider is only needed to force a mode against the OS
  setting, which the proposal documents as an optional layer.

**Consequences.** Motion values live in one place and evolve behind a stable semantic API; the tier
system enforces intent usage without a new rule; reduced motion is complete and legible by default.
Component motion aliases (`dialog.motion.enter`) are allowed but must consume intent tokens, never
primitives — the same tier-skip rule keeps them honest.

## ADR-15 — Turborepo + pnpm workspaces; base styles are their own package

**Status:** Accepted

**Context.** The project had grown from a token package into a token package *plus* a live demo *plus*
two design proposals. Keeping them in one flat folder blurred two different things: `@allison/tokens`
is meant to be a clean, independently-publishable, zero-runtime-dependency artifact, while the demo and
proposals are consumers that should prove the package works *as a package*. A flat repo let the demo
reach the CSS via `../css/…` relative paths — which is exactly the shortcut a real consumer can't take,
so it proved nothing.

**Decision.** Restructure as a Turborepo with pnpm workspaces:
- `packages/tokens` — the base styles. Stays zero-runtime-dependency and publishable; the `css/` folder
  is the artifact, `scripts/lint.mjs` the validator. Unchanged in substance, just relocated.
- `apps/demo` — the live demo + proposals. Declares `"@allison/tokens": "workspace:*"`, so pnpm
  symlinks the package into `apps/demo/node_modules/@allison/tokens`, and the demo references
  `node_modules/@allison/tokens/css/…` — real package resolution, not a repo-relative path.
- `turbo.json` — a `lint`/`check`/`dev` pipeline. `lint` is cached on the token source, so unchanged
  runs replay in milliseconds.

**Why pnpm.** It's the Turborepo default, and workspace deps get a *direct* symlink (not a store
indirection), which is what lets the static demo resolve the package over `file://` and `http://`
without a bundler. npm workspaces would also work; pnpm is idiomatic and the symlink semantics are
cleaner for a build-free static consumer.

**Why the tokens package keeps zero runtime deps.** The monorepo *tooling* (turbo, pnpm) lives at the
root and in devDependencies; it never enters `packages/tokens`, whose `dependencies` stay empty. The
publish story is unchanged: `npm publish` from `packages/tokens` ships only `css/`.

**Alternatives considered.**
- *Stay flat.* Rejected: can't demonstrate real package consumption, and mixes the publishable artifact
  with its consumers.
- *npm/yarn workspaces.* Viable; rejected only for pnpm's cleaner workspace symlinks and Turborepo
  defaults.
- *Add a Vite app for the demo.* Rejected: a bundler would pull the demo away from the "pure CSS,
  consumed directly" story and add dependencies. A ~20-line zero-dep static server (`apps/demo/serve.mjs`)
  serves it and follows the workspace symlink, keeping the ethos intact.

**Consequences.** The base styles are a standalone package with a validated, cached CI task; the demo
proves consumption through `node_modules`; `docs/` stays at the root as repo-wide documentation. The
cost is the usual monorepo overhead — a `pnpm install` is now required before the demo can resolve the
package, where the flat repo needed nothing. For a package whose whole point is being consumed cleanly,
that trade is right.
