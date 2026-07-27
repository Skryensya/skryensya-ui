# skryensya/ui

The ubiquitous language of the design system. This is a **glossary, not a spec**, it defines what
the words mean, never how anything is built. `docs/decisiones/` records *why* the system is shaped
the way it is; `README.md` records *what it does*.

When a word here conflicts with a word in a proposal, a PR, or a conversation, this file wins or it
changes, but the two never coexist.

## Language

User-facing documentation and decision records are written in Spanish. Code, identifiers, and repository metadata are written in English. Comments may use either language when locally consistent.

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
The structure a consumer must author for a machine-driven component to work, the parts, in the right
nesting. Documented, never shipped: the system describes the markup and the consumer writes it.
_Avoid_: template, schema, markup API

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

**Ramp**:
A tier-1 ordered sequence of tones for one role, from lightest to darkest. Named by **role**
(`accent`, `neutral`, `danger`), never by hue (`blue`, `red`), the name must stay true after a
brand swaps the hue underneath it.
_Avoid_: palette, shades, scale, tones

**Ramp position**:
A step within a ramp. What semantic tokens reference, they name a position, never a hue, which is
the entire mechanism that makes a brand a tier-1 swap.

**Feedback role**:
A ramp whose name is a *state the system reports*: `danger`, `success`, `warning`, `info`. Fixed by
meaning, so a component that means one of them reads that role and never `accent` — accent is the
tenant's identity and moves when the brand does, which is the whole difference (ADR-26). A feedback
role remains independently swappable through its complete ramp; it never moves merely because the brand did.
_Avoid_: status color, state color, semantic color (that is tier 2), intent

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
The system's one root tier-1 ramp configuration. `tokens.scss` ships the default; a consumer replaces
complete role ramps from an unlayered stylesheet generated by its brand tooling. Core exposes no color
generation input. Brand is not a selectable dimension, package entrypoint, or HTML attribute.

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
always `aria-hidden` — it repeats what the placement already shows.
_Avoid_: caret, tail, pointer, beak, nub

## Enforcement

**The validator**:
The dependency-free checker that reads the CSS and fails on a broken rule. It is what makes the
tiers a system rather than three folders, every rule here is executable, not aspirational.
_Avoid_: the linter, stylelint
