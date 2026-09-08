# skryensya/ui

The ubiquitous language of the design system. This is a **glossary, not a spec**, it defines what
the words mean, never how anything is built. `docs/decisions/` records *why* the system is shaped
the way it is; `README.md` records *what it does*.

When a word here conflicts with a word in a proposal, a PR, or a conversation, this file wins or it
changes, but the two never coexist.

## Language

English is the language of the repository: code, comments, identifiers, metadata, `docs/`, and the
decision records. Spanish is a **product locale**, and only that: the docs site pages under `/es/`,
their messages, and the `es:` half of a changelog entry.

The test is whether a counterpart exists in the other language. A file with `es:` and `en:` keys, or a
page that exists at both `/components/x` and `/es/componentes/x`, is a locale. A single Spanish copy
with no counterpart is not the Spanish version of anything; it is untranslated repository content. See
[ADR-0021](docs/decisions/0021-english-is-the-repository-language-and-spanish-is-a-product-locale.md).


## Tiers

**Tier**:
One of the three levels a token can live at. References point *down* a tier or sideways within one,
never up, and tier 3 may never reach tier 1.

**Primitive**:
A tier-1 token. Answers *what values exist* and references nothing.
_Avoid_: raw value, base token, global token

**Semantic token**:
A tier-2 token. Answers *what a value means*, its purpose, never its appearance.
_Avoid_: alias token, purpose token, theme token

**Styling hook**:
A tier-3 token, and the public override surface of a component. Answers *where a value is used*.
Named without its group segment, so a variant re-declares the same styling hook rather than adding one.
Always qualified: bare "hook" means a React hook, which is never this system's public API.
_Avoid_: hook (unqualified), component token, styling variable, custom property

## Tier 3 comes in two shapes

**Component**:
One named UI thing that owns its structure because no second component is known to need it unchanged.
Ships its class, structural CSS and styling hooks; the consumer still authors the documented markup.
When reuse is uncertain, this is the default because promoting shared structure later is additive.

**Pattern**:
Structure already shared unchanged by multiple components. Ships that structure and its styling hooks
once so its consumers compose it instead of duplicating it. Reuse is observed, never predicted from
an invariant anatomy.

## Navigation

**Nav list**:
A pattern. The list of destinations, a `<nav>` of `<ul><li><a>`, each link an icon, a label and
optional trailing metadata. Vertical in a sidebar, horizontal in a navbar; orientation is a variant,
not a second structure. Never "menu": `role="menu"` is an application menu of menuitems, and this is
links.
_Avoid_: menu, nav menu, sidebar menu, links

**Shell**:
A component that is a place to put things, a sidebar, a navbar, as opposed to the things put there.
A shell owns its own chrome and its own states, and adjusts its guests only by re-declaring their
styling hooks, never by reaching into their markup.

**Rail**:
The sidebar, collapsed: narrowed to one control wide, showing icons. It is not a hidden sidebar, 
nothing is removed, so a rail is never a disclosure.
_Avoid_: mini sidebar, icon sidebar, collapsed drawer

## Ordered sequences

**Process list**:
A static ordered sequence of instructions whose content is primary. Its numbers and connectors
express order, never progress; it has no complete, current, or upcoming state.
_Avoid_: stepper, steps, progress list, ordered List

**Steps**:
A progress indicator across ordered stages. Stage status is primary; it summarizes progress rather
than containing the instructions for each stage.
_Avoid_: process list, instructions, how-to

## Anatomy

**Part**:
A named element inside a component's anatomy, written as a BEM element, `.sk-tabs__list`. Parts are
**ours and permanent**: they stay the same if the machine underneath is replaced. Only components with
an invariant anatomy have parts at all.
_Avoid_: slot, section, region, element

**Wrapper**:
A layout pattern. A centred page column with a max inline measure from a **size scale**
(`sm`, `md`, `lg`, `full`), never by use-name (`prose`, `content`, `shell`). The measure is a
tier-2 `--size-wrapper-*` token, so a header and a body share one number. Distinct from the vanilla
layer's forbidden sense of "wrapper" (an enhancer is never called that).
_Avoid_: container, max-width utility, page container

**Image frame**:
A layout pattern. A clipped box that holds authored media (`img`, `video`, `picture`) to an
**aspect** ratio and decides how the media fills it (`object-fit` / `object-position`). Named with
CSS vocabulary (`16/9`, `cover`, `top`), never by use (`hero`, `thumbnail`). Distinct from Avatar,
which is a fixed circular identity token, not a general media frame.
_Avoid_: image component, media box, thumbnail

**Media gradient**:
A pattern. A wash nested in a media caption so type stays readable over a photo. Sized to the
caption (as tall or as wide as the text), tinted with the brand accent, never by use (`hero`,
`card`). Distinct from Backdrop (modal page scrim) and State layer (interaction paint).
_Avoid_: scrim, overlay, veil, shade, vignette (as the product name), ink, paper, light wash

**State**:
What a component currently *is*, selected, expanded, disabled. Owned by the machine and written by
it as a data attribute, never as a BEM modifier and never toggled by hand. Parts are ours; state is
the machine's.
_Avoid_: modifier, flag, status

**Markup contract**:
The authorable half of a **Contract**: the structure a consumer writes by hand, the parts in the right
nesting, with the attributes the contract maps its options onto. Documented, never shipped: the system
describes the markup and the consumer writes it. Not restricted to machine-driven components, a
component with no machine still has one, it just needs no enhancer to come alive.
_Avoid_: template, schema, markup API

## The contract

**Contract**:
Everything Core declares about one component: its signatures, the options they take, the parts they
own, the attributes those options map onto, and the accessibility a consumer owes. Core is its only
author, which is what makes React and Vanilla two views of one truth rather than two truths.
_Avoid_: schema, spec, component API, definition

**Binding**:
One realization of a Contract for one consumption path, React or Vanilla. A binding *realizes* a
contract and never restates it: an option it re-declares locally is drift, not a binding.
_Avoid_: adapter, wrapper, implementation, framework layer

**Signature**:
One selectable meaning inside a Contract, identified apart from the exported name because a single
export can carry several. What discriminates them is a value the consumer supplies, so a signature
names an intent and the host element it lands on, never an appearance.
_Avoid_: surface, variant, overload, mode

**Part template**:
The subtree of parts one signature owns, and where a child lands inside it. It exists because the
two bindings meet a contract at different depths, React writes three elements where authored markup
writes five, so the template is what makes those the same structure rather than two.
_Avoid_: markup template, skeleton, scaffold

**Surface**:
The part of a Contract a consumer can depend on: its options and their defaults, what each slot
accepts, which signatures exist and what they require. Deliberately narrower than the Contract -
a template rewrite or a reworded `because` changes nothing anyone wrote, so it is outside. Hashed,
so "did the promise move" is a question with a mechanical answer.
_Avoid_: API, shape, public interface

**Changelog entry**:
One dated, consumer-facing statement of what changed in one Contract, in both languages, under one
of five kinds (`breaking`, `feature`, `bugfix`, `rework`, `chore`). Append-only: an entry is never
rewritten, because it describes a moment. Its date is when it was WRITTEN; the release ledger is
what turns that into the version a consumer can ask for.
_Avoid_: release note, history, commit message

**Usage tree**:
A composition written as data: signatures, the options given to each, and their children. Authored
once and rendered by both bindings, so it is simultaneously the example, the snippet, the thing an
agent proposes and the thing the gates check. Written in signatures, never in parts, because
selecting meaning is the author's job and expanding it into structure is the template's.
_Avoid_: usage plan, spec, recipe (a recipe is a named usage tree, not a synonym)

## Native and enhanced

**Native alternative**:
An HTML platform element and its browser behaviour, authored with no `@skryensya/vanilla` enhancer.
It may use Core styling hooks, but selection, disclosure, modality and form behaviour remain the
browser's. Native alternatives are documented separately and secondarily when an enhanced module has a
larger interaction contract.
_Avoid_: vanilla component, unenhanced component

**Enhanced module**:
An interaction contract that uses a Vanilla enhancer or a React machine only for behaviour the platform
does not coordinate. It preserves native semantics whenever the platform supplies them.
_Avoid_: custom widget, JavaScript-first component

## The vanilla layer

**Vanilla layer**:
The package that hydrates authored markup with interactive behaviour, so a consumer needs no framework:
they write HTML, link the CSS, and `await initComponents()`. The selector manifest dynamically imports
only enhancer types present below the chosen root.
_Avoid_: framework adapter, framework package, component library

**Enhancer**:
One unit of the vanilla layer: it finds an authored root, runs the machine, and patches attributes
onto elements that already exist. It **renders no markup and never writes a class**, the consumer
owns both. Mounting is idempotent.
_Avoid_: component, widget, wrapper

**Machine**:
The finite state machine behind a component with no platform equivalent. Internal and replaceable, 
which is why parts are named in BEM rather than in the machine's vocabulary.
_Avoid_: controller, behaviour, logic, store

## Color

**Palette**:
A tier-1 ordered sequence of colour values named only by hue family, never by product meaning. It uses
the Tailwind scale shape (`50`…`950`) with CSS names like `--palette-slate-500`, plus absolute
`--palette-white` and `--palette-black`; semantic tokens may consume it, but component styling hooks
never do.
_Avoid_: brand, role, semantic color, meaning, ramp, `--color-blue-*`

**Accent**:
A configurable tier-2 brand meaning, expressed as a complete bundle of semantic colour tokens rather
than by a palette or ramp name. The default accent may point at `blue`, but a tenant changes accent by
re-declaring the accent semantic bundle, not by creating a meaningful palette.
_Avoid_: accent palette, semantic accent bundle, primary palette, source color

**Feedback role**:
A tier-2 colour meaning the system reports: `danger`, `success`, `warning`, `info`. Fixed by
meaning, so a component that means one of them reads semantic feedback tokens and never the
tenant's accent palette.
_Avoid_: status color, state color, palette, accent

## Icons

**Stable icon name**:
A role the system names and references, `chevron-down`, `delete`, `danger`. It survives a change of
icon set exactly as a ramp position survives a hue swap, so it is always the role and never the drawing:
`delete`, never `trash`; `visibility`, never `eye`. The vocabulary covers an app's common cases, not
only what foundational components consume, a role left out doesn't disappear, it comes back named
differently in every app. A product concept (`invoice`, `airplane-tilt`) is never one, and is passed
as icon data instead.
_Avoid_: semantic icon, icon token, glyph, ligature

**Icon set**:
A complete binding of every stable icon name to geometry, published as its own package, Lucide,
Phosphor, Material. **A set is a brand**: the system names the position, the set supplies the drawing.
Complete, never partial, exactly as a brand missing a ramp position is not a brand; which is why every
added stable name is work owed by every set author. Unlike a brand it cannot live in core, which names
no tenant and has no dependencies, so the system ships no geometry, and choosing a set is an install.
_Avoid_: icon provider, icon library, icon pack, icon font

**Icon data**:
The geometry itself: the children of an `<svg>`, the coordinate box they were drawn in, and the
`fill`/`stroke` intent. Owned by the set, and trusted, authored or build-generated, never from a user
or an API. The binding writes the `<svg>`, so a set never controls accessibility, the class, or the size.
_Avoid_: icon markup, svg string, icon body

## Depth

**Elevation**:
A tier-2 composite naming a **height above the page**, `flat`, `raised`, `floating`, `top`, never
the component that currently sits at that height. A name that says *who* uses a height becomes a lie
the moment a second thing needs it, exactly as a ramp named for a hue would.
_Avoid_: shadow, depth, z-level, overlay/modal as elevation names

## Theming

**Dimension**:
An independent axis of theming. Each dimension owns exactly one layer of the token graph, so dimensions
compose in the cascade instead of multiplying into authored combinations. There are four: color mode,
high contrast, density, and radius.


**Brand**:
The tenant identity expressed through the **Accent** semantic bundle, not a tier-1 palette and not a
dimension. Brand is which semantic accent values are declared, not how many components choose to use
those values.

**Color mode**:
A dimension. Light or dark. Only *color* can be mode-aware; a mode-varying non-color value is a
contradiction the platform won't express.
_Avoid_: theme, appearance, scheme

**High contrast**:
A dimension, and a third color mode that cannot be a third slot, so it re-declares semantic
tokens rather than extending the light/dark axis.
_Avoid_: a11y mode, contrast theme

**Density**:
A dimension. A single runtime multiplier over spacing, never a second authored scale. A spacing
concern only: type, radius, focus rings and hit areas are deliberately density-invariant.
_Avoid_: compact mode, size mode, spacing scale

**Radius**:
A dimension. Global corner *roundness*, five discrete steps `none · sm · md · lg · xl`, with `md`
the baseline, as an override block that re-declares the semantic radius roles, orthogonal to brand.
Each step seats `--radius-control` on its own `--scale-radius-*` and `--radius-surface` on the next
step up; `--radius-pill` is the dimension's deliberate invariant, because a pill is a shape, not a
roundness setting. Not a brand property (that older framing is superseded), and not
a spatial one, so it stays density-invariant.
_Avoid_: corner style, shape mode, roundness theme

## Interaction and motion

**State layer**:
A pattern. One semi-transparent overlay, tinted with the component's own content color, that
signals hover, focus, pressed, selected or dragged. Exactly one state shows at a time; opacities
are never summed.
_Avoid_: interaction layer, interaction overlay, ripple

**Virtual focus**:
The focus ring on an option that DOM focus never reached: focus stays in a text input and
`aria-activedescendant` points at the option, so the ring is the only thing on screen that says
where the arrow keys have landed. Keyboard-driven only, a ring following the pointer reads as broken
focus. While an option holds it, the input's own control gives its ring up, so the ring *moves*
rather than nesting. Combobox and the command palette are the two that have it.
_Avoid_: active descendant (that is the attribute), highlight (that is the tint), fake focus

**Intent token**:
A tier-2 motion token naming what a transition *means* (enter, feedback, expand), never how long it
lasts. Components consume intent only, so retuning a primitive restyles the system.
_Avoid_: duration token, easing token, timing token

## The top layer

**Top layer**:
The browser-managed layer above the whole page, which a modal dialog enters. Nothing in the document
can be painted above it, so an element there needs no z-index, the concept the `top` elevation and
the top-layer pattern are both named for.
_Avoid_: overlay layer, z-stack, portal

**Backdrop**:
A pattern. The scrim between a top-layer element and the page beneath it. Named for the platform's
own `::backdrop`, and deliberately independent of the top-layer pattern, a menu enters the top
layer with no scrim, and a non-modal dialog has a scrim with no top layer.
_Avoid_: scrim, overlay, veil, shade

**Modal**:
An adjective, never a noun, a *property* of a dialog (it blocks the page and traps focus), not a
kind of thing. There is no "a modal" in this system; there is a dialog that is modal. A token or
file named `modal` is naming a tenant, and tenancy is forbidden above tier 3.
_Avoid_: modal (as a noun), lightbox

**Vaul**:
A pattern. A modal panel anchored to an **edge** of the viewport: it arrives from that edge, holds
the page inert behind a backdrop, and leaves the way it came. The edge is the whole idea, a Vaul is
named for where it comes from, never for the shape it makes there, which is why one pattern covers a
drawer and a bottom sheet without either being a special case.

It is a pattern and not a component because a second component needs the identical structure: a
**drawer** *is* a Vaul on the inline edge. A **dialog** is a centred native dialog; it is never a
Vaul by default.
_Avoid_: vault, sheet, bottom sheet, side panel, slide-over, off-canvas

**Dialog Vaul**:
A responsive composition pattern. It keeps a native dialog centred at ordinary widths and gives that
dialog a Vaul on the block-end edge at narrow widths. It is explicit because content, not the dialog
component or the viewport alone, decides whether the mobile Vaul is appropriate.

**Drag-to-dismiss**:
Pulling a Vaul back toward its edge to close it. The one Vaul behaviour with no platform equivalent
and none in Zag either, so it is the only JavaScript a Vaul costs, and it is opt-in: a Vaul is
complete without it. Not "swipe": a swipe is a flick with no position, and this tracks the finger.
_Avoid_: swipe, swipe-to-close, snap points

## Anchored placement

**Anchored**:
A pattern. A box placed relative to an element rather than to the page: it sits on a chosen side of
that element, moves to another side when it would overflow, and hides when the element scrolls away.
Contrast with Vaul, which is anchored to an *edge of the viewport*; this is anchored to *another
element*. Nine components need the identical structure, which is what makes it a pattern.
_Avoid_: floating, popper, positioning engine, overlay

**Anchor**:
The element a positioner is placed against, and the one that carries `anchor-name`. Usually the
trigger, never automatically so: an anchor is a geometric role and a trigger is an interactive one,
and a component may anchor to a wrapper while the trigger inside it stays the control.
_Avoid_: reference, target, source

**Positioner**:
The part that holds the placement and nothing else. It never paints and never intercepts the
pointer, so that the box it reserves cannot block what is under it; its child, the content, is what
is visible and clickable. Splitting the two is what lets placement be a pattern while paint stays
the component's.
_Avoid_: wrapper, floating element, container

**Placement**:
Which side of the anchor a positioner asks for, in logical axes, one of `block-start`, `block-end`,
`inline-start`, `inline-end`. A request and not a guarantee: the browser may flip it to the opposite
side of the *same* axis when it does not fit, because someone asking for `inline-end` wants the box
beside the anchor, and landing above it would be disobedience rather than adaptation.
_Avoid_: side, position, direction, align

**Arrow**:
The optional notch poking out of an anchored box toward its anchor. Authored or absent, never
inferred: it belongs to floating chrome that must say *which* control it describes (a tooltip, a
popover), not to a box whose shared edge already says it (a menu, a select). Always decorative, so
always `aria-hidden`; it repeats what the placement already shows.
_Avoid_: caret, tail, pointer, beak, nub

## Consumer setup

**Root contract**:
Everything a new consumer must author once, before composing any component: the token import, the
color-mode script that runs before first paint, and the override mechanism for anything Core names
but does not supply, a type-face included. The system never ships a font, the same way it never
ships a semantic accent bundle (ADR-19): it exposes the tier-1 hook (`--scale-font-family-sans`, unlayered,
already overridable) and stops there. Analogous to a Markup contract but at the scope of the whole
app rather than one component; documented, never shipped, and never implied by an individual
component's own guide.
_Avoid_: bootstrap, setup, boilerplate, starter, font provisioning

## Usage of the system

**Usage observation**:
One live Binding instance of a Contract: a React mount, or a Vanilla enhancer that has become ready. Not a render, not a click, not authored Native alternative markup, and not a usage tree.
_Avoid_: event, hit, impression, pageview, telemetry event, mount (unqualified)

**Sample decision**:
Whether this Document sends usage observations. Taken once for that Document's browser session. Not an identity, and not shared across Documents.
_Avoid_: session ID, visitor sample, user sample, session (unqualified)

**Usage batch**:
The aggregated usage observations of one Document since the last accepted flush.
_Avoid_: event stream, analytics payload, beacon (as the product name)

**Ingest**:
The owned HTTP surface that accepts a usage batch. Design-system callers never address Umami; Umami sits behind ingest.
_Avoid_: telemetry API, analytics endpoint, Umami webhook

## Enforcement

**The surface gate**:
The check that refuses to emit anything when a Contract's Surface no longer matches the hash its
changelog recorded. It is what makes "add an entry when a component changes" a rule rather than a
habit: the build stops and names the new hash to paste. Nothing enforces the entry's WORDS, so the
gate buys the moment, not the quality.
_Avoid_: the changelog check, the version bump

**The validator**:
The dependency-free checker that reads the CSS and fails on a broken rule. It is what makes the
tiers a system rather than three folders, every rule here is executable, not aspirational.
_Avoid_: the linter, stylelint
