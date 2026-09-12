import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import {
  menuCompactItems,
  menuItems,
  menuMultilevelItems,
  menuSafetyItems,
} from "./data/menu";

/*
 * The context-menu demo's own CSS, shared by BOTH bindings (`MenuPage.astro`'s Vanilla `html` and
 * `react-demos/menu-context.tsx`'s live island): one string, injected into each preview's own
 * srcdoc (`ComponentPreview`'s `css` prop / `framed()`'s new `css` option), so the two stages are
 * guaranteed to be the SAME demo painted twice rather than two hand-kept copies that could drift.
 *
 * The box is a TARGET AREA, not a card: four corner marks (a viewfinder) instead of a full border,
 * insetting a few px from the true corner so they read as bracket marks sitting inside a softly
 * rounded surface rather than a rectangle drawn edge-to-edge. Centered on BOTH axes: `frame-body`
 * (component-preview.css) is deliberately `min-block-size: 0`, content-sized, "never a viewport
 * floor", so without an explicit height on OUR OWN wrapper the box sat flush at the top of the
 * stage's reserved space instead of centered in it. `18rem` matches
 * `--sk-component-preview-stage-min-block-size` for `viewport="menu"` exactly (component-preview.css)
 *. A fixed constant, not a measured one: `100dvh` was tried first and fed back into `fitFrame`'s own
 * measurement (the iframe's height depends on content height, which depended on `dvh`, which depends
 * on the iframe's height), which never settled. The whole area gets a hover state (a faint accent
 * wash, brighter marks) because a plain gray box with no visible affordance read as inert chrome,
 * not as the thing a reader is meant to interact with.
 */
export const menuContextCss = `.menu-context-demo {
  display: flex;
  justify-content: center;
  align-items: center;
  inline-size: 100%;
  min-block-size: 18rem;
}

.menu-context-demo__area {
  --menu-context-mark: var(--color-border-accent);
  --menu-context-mark-size: 1.5rem;
  --menu-context-mark-thickness: 2px;
  --menu-context-mark-inset: 6px;
  --menu-context-bg: var(--color-bg-surface-sunken);

  position: relative;
  display: grid;
  place-items: center;
  inline-size: min(100%, 20rem);
  min-block-size: 10rem;
  padding: var(--space-inset-lg);
  border-radius: var(--radius-control);
  background-color: var(--menu-context-bg);
  background-repeat: no-repeat;
  background-image:
    linear-gradient(var(--menu-context-mark), var(--menu-context-mark)),
    linear-gradient(var(--menu-context-mark), var(--menu-context-mark)),
    linear-gradient(var(--menu-context-mark), var(--menu-context-mark)),
    linear-gradient(var(--menu-context-mark), var(--menu-context-mark)),
    linear-gradient(var(--menu-context-mark), var(--menu-context-mark)),
    linear-gradient(var(--menu-context-mark), var(--menu-context-mark)),
    linear-gradient(var(--menu-context-mark), var(--menu-context-mark)),
    linear-gradient(var(--menu-context-mark), var(--menu-context-mark));
  background-position:
    left var(--menu-context-mark-inset) top var(--menu-context-mark-inset),
    left var(--menu-context-mark-inset) top var(--menu-context-mark-inset),
    right var(--menu-context-mark-inset) top var(--menu-context-mark-inset),
    right var(--menu-context-mark-inset) top var(--menu-context-mark-inset),
    right var(--menu-context-mark-inset) bottom var(--menu-context-mark-inset),
    right var(--menu-context-mark-inset) bottom var(--menu-context-mark-inset),
    left var(--menu-context-mark-inset) bottom var(--menu-context-mark-inset),
    left var(--menu-context-mark-inset) bottom var(--menu-context-mark-inset);
  background-size:
    var(--menu-context-mark-size) var(--menu-context-mark-thickness),
    var(--menu-context-mark-thickness) var(--menu-context-mark-size),
    var(--menu-context-mark-size) var(--menu-context-mark-thickness),
    var(--menu-context-mark-thickness) var(--menu-context-mark-size),
    var(--menu-context-mark-size) var(--menu-context-mark-thickness),
    var(--menu-context-mark-thickness) var(--menu-context-mark-size),
    var(--menu-context-mark-size) var(--menu-context-mark-thickness),
    var(--menu-context-mark-thickness) var(--menu-context-mark-size);
  color: var(--color-text-secondary);
  text-align: center;
  user-select: none;
  transition:
    background-color var(--motion-state-change-duration) var(--motion-state-change-easing),
    color var(--motion-state-change-duration) var(--motion-state-change-easing);
}

.menu-context-demo__area:hover {
  --menu-context-mark: var(--color-border-accent);
  --menu-context-bg: var(--color-bg-accent-subtle);
  color: var(--color-text-primary);
}

@media (prefers-reduced-motion: reduce) {
  .menu-context-demo__area {
    transition: none;
  }
}`;

/**
 * File actions, a checkbox and a submenu. The rows are in `data/menu.ts`.
 */
export const menuTree = (t: Translate): UsageTree => ({
  contract: "menu",
  signature: "Menu",
  options: { label: t("demo.menu.label") },
  slots: { trigger: t("demo.menu.trigger"), items: menuItems(t) },
});

/** Submenus that nest without limit: three levels of the same `children` slot. */
export const menuMultilevelTree = (t: Translate): UsageTree => ({
  contract: "menu",
  signature: "Menu",
  options: { label: t("demo.menu.multilevel.label") },
  slots: {
    trigger: t("demo.menu.multilevel.trigger"),
    items: menuMultilevelItems(t),
  },
});

/**
 * Same shape as a text editor's Format menu. `density: "compact"` is the one option that changes;
 * every row still resolves through the same hooks (menu.css), just re-declared smaller.
 */
export const menuCompactTree = (t: Translate): UsageTree => ({
  contract: "menu",
  signature: "Menu",
  options: { label: t("demo.menu.compact.label"), density: "compact" },
  slots: {
    trigger: t("demo.menu.compact.trigger"),
    items: menuCompactItems(t),
  },
});

/**
 * `debugSafetyTriangle` is the one option that changes, and every submenu it reaches (menu.ts's
 * `debugSafetyTriangle` doc comment) draws @zag-js/menu's own intent polygon and lock state live.
 * The rows it needs to be shown against. A sibling above and below the one that opens a submenu -
 * are `menuSafetyItems`.
 */
export const menuSafetyTree = (t: Translate): UsageTree => ({
  contract: "menu",
  signature: "Menu",
  options: { label: t("demo.menu.safety.trigger"), debugSafetyTriangle: true },
  slots: {
    trigger: t("demo.menu.safety.trigger"),
    items: menuSafetyItems(t),
  },
});

/*
 * THE ANATOMY SPECIMEN, and the one diagram on this site that is authored as MARKUP rather than
 * emitted from a usage tree.
 *
 * A menu's parts only exist while it is open, and a real Menu cannot be held open. `data-open`
 * starts the machine open (`Menu.svelte` reads it into `defaultOpen`), and then the first pointer
 * press anywhere in the frame reaches Zag's dismiss layer and closes it: measured, `open` ->
 * `closed` on one click, with no way back, because a specimen is `inert` and its trigger cannot be
 * pressed. A diagram that survives until the reader's first click is not a diagram.
 *
 * So there is no machine here at all: every `data-sk-*` MOUNT attribute is gone (no `data-sk-menu`,
 * no `data-sk-menu-trigger`, no `data-sk-menu-item`), which is what keeps `initComponents` from
 * ever seeing this tree (runtime/registry.ts mounts a menu off `[data-sk-menu]` and nothing else).
 * What stays is the part classes, the `data-state="open"` the stylesheet reads, and the two
 * attributes that are STYLING hooks rather than mount points (`data-sk-submenu`, which menu.css
 * uses to place a submenu, and `data-sk-menu-safe-area`, which raises the row the shape hangs off).
 * The panel is painted by the same menu.css every live menu on this page uses.
 *
 * The structure is the emitter's, verbatim from `validate_ui` on the equivalent tree, minus those
 * mount attributes. When the template changes, this string is what has to follow it, and the
 * emitted markup for a Menu with one submenu is the thing to diff it against.
 */
const menuAnatomySpecimen = (t: Translate): string => `<div class="sk-menu" aria-label="${t("demo.menu.anatomy.label")}">
  <button class="sk-menu__trigger sk-button sk-interactive sk-anchor" type="button" aria-expanded="true">
    ${t("demo.menu.anatomy.trigger")}
    <span aria-hidden="true"><span data-sk-icon="chevron-down" data-sk-icon-size="md"></span></span>
  </button>
  <div class="sk-menu__positioner sk-anchored">
    <div class="sk-menu__content" data-state="open" role="menu">
      <div class="sk-menu__item sk-interactive" role="menuitem">
        <span class="sk-menu__item-label">${t("demo.menu.rename")}</span>
      </div>
      <div class="sk-menu">
        <button
          class="sk-menu__item sk-interactive sk-anchor"
          type="button"
          role="menuitem"
          aria-expanded="true"
          data-sk-menu-safe-area
        >
          <span class="sk-menu__item-label">${t("demo.menu.export")}</span>
          <span class="sk-menu__item-indicator" aria-hidden="true"><span data-sk-icon="chevron-right" data-sk-icon-size="md"></span></span>
          <span class="sk-menu__safe-area" data-debug aria-hidden="true"></span>
        </button>
        <div class="sk-menu__positioner sk-anchored" data-sk-submenu>
          <div class="sk-menu__content" data-state="open" role="menu">
            <div class="sk-menu__item sk-interactive" role="menuitem">
              <span class="sk-menu__item-label">PDF</span>
            </div>
            <div class="sk-menu__item sk-interactive" role="menuitem">
              <span class="sk-menu__item-label">CSV</span>
            </div>
          </div>
        </div>
      </div>
      <div class="sk-menu__separator" role="separator"></div>
      <div class="sk-menu__item sk-interactive" data-tone="danger" role="menuitem">
        <span class="sk-menu__item-label">${t("demo.menu.anatomy.delete")}</span>
      </div>
    </div>
  </div>
</div>`;

/*
 * ONE LABEL, as the `Annotated` template writes it. The wrapper below is hand-authored for the same
 * reason the specimen is (a usage tree's subject slot takes a tree, and this subject is a string),
 * so the spans have to match what the emitter would have produced: the part class, the gutter,
 * `data-match` and the `tabindex` that makes every label reachable on its own.
 */
const label = (target: string, side: string, text: string, extra = "", match = "first"): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="${match}"${extra} tabindex="0">${text}</span>`;

/*
 * THE DIAGRAM: the specimen, the labels, and the empty `<svg>` the enhancer draws the leaders into.
 *
 * `data-sk-annotated` is the ONE mount attribute in the whole string, and it is the annotation's
 * own: measuring boxes and drawing leaders is a live job (it re-runs on resize, on mutation and
 * once more after `document.fonts.ready`), so this is a frozen menu inside a live diagram rather
 * than a picture of one.
 *
 * THE ROOT READS FROM ABOVE, and it is the only one that does. Its ring encloses everything else
 * in the drawing, so from a gutter its leader lands on an edge that four other rings are already
 * stacked against, and the reader cannot tell which one it stopped at. From the block-start gutter
 * it comes down onto a top edge nothing else shares.
 *
 * SIDES: the subject is start-aligned, so the trigger, the positioner, the panel and every row
 * share one LEFT edge, and the submenu is the only thing that reaches out to the right. Everything
 * on that shared edge reads from the inline-start gutter and lands on it without crossing the
 * drawing.
 *
 * RINGS: inset is the default, and it is right for the panel AND for the rows, for the same reason
 * in both cases: there is air inside the box to draw in. A row declares only `--space-inset-xs`
 * of block padding but stands `--size-touch-target` tall with its content centred, so a ring two
 * pixels inside it clears the word by a dozen more. Outside is what looked wrong: rows sit one
 * pixel apart, so three offset rings merged with each other and with the panel's into a stack of
 * outlines nobody could assign to a name. The ROOT is the one box with nothing spare (it IS the
 * trigger and the panel, edge to edge), so that ring goes outside. The root's distance is the larger one so its ring
 * clears the panel's own, rather than reading as a second border on the same box. The positioner
 * has the same problem from the other direction: its box is EXACTLY the panel's, so an inset ring
 * would land on top of the panel's own and the two names would share one line. Outside, and read
 * from below, it is legible as the wrapper it is.
 *
 * The root's 6 against the positioner's 4 is the whole margin those two get, and it is enough: two
 * pixels of daylight at a hairline stroke reads as two lines rather than one. It was 8, which
 * cleared them by twice as much and bought nothing, since the ring only has to be outside the panel
 * to say so; what it cost was air, the frame growing on every side to hold a ring standing further
 * off the drawing than any other mark in it.
 *
 * GUTTER ORDER IS GEOMETRY, NOT AUTHORING ORDER: a gutter sorts its labels by the centre of what
 * each one points at (`distributeLanes`), because two labels that swapped places would cross their
 * own leaders. So the row label sits above the panel's for as long as it names ONE row, whose
 * centre is higher than the panel's. `match="all"` is what moves it, and it is the truer statement
 * anyway: `sk-menu__item` is not the first row, it is every row, so one bubble sends a leader to
 * each and wants to be level with all of them at once, which is the middle of the panel they sit
 * in, just below the panel's own label.
 *
 * THE :not() IS THE WHOLE DIFFERENCE between a plural label and a mess. Bare, `.sk-menu__item`
 * also matches the submenu's own two rows, so the bubble ringed five boxes and threw two leaders
 * clear across the drawing to reach PDF and CSV, past the panel, the safe area and the submenu's
 * edge. Excluding anything inside `[data-sk-submenu]` leaves the three rows of the panel the label
 * is standing next to: a short fan, all of it on its own side, and the claim is still plural. The trigger especially, whose box is the narrowest thing here and sits at the top of
 * that edge: named from the far side, its leader had to run the full width of the panel below it to
 * get back to a button it was already level with. The panel is there for a sharper version of the
 * same reason: the submenu sits flush against its right edge, so a leader from the other gutter
 * crossed the whole submenu to reach it, and a line that ends behind something reads as naming that
 * something.
 *
 * What stays in the inline-end gutter is what is genuinely over there AND has nothing in the way:
 * the label inside the top row (level with it, above where the submenu begins) and the safe area,
 * whose own right edge IS the submenu's left edge.
 */
export const menuAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("menuPage.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${menuAnatomySpecimen(t)}
  </div>
  ${label(".sk-menu", "block-start", "sk-menu", ' data-ring-placement="offset" data-ring-distance="6"')}
  ${label(".sk-menu__trigger", "inline-start", "sk-menu__trigger")}
  ${label(".sk-menu__content", "inline-start", "sk-menu__content")}
  ${label(".sk-menu__item:not([data-sk-submenu] *)", "inline-start", "sk-menu__item", "", "all")}
  ${label(".sk-menu__positioner", "block-end", "sk-menu__positioner", ' data-ring-placement="offset" data-ring-distance="4"')}
  ${label(".sk-menu__separator", "inline-start", "sk-menu__separator", ' data-ring-placement="offset" data-ring-distance="3"')}
  ${label(".sk-menu__item-label", "inline-end", "sk-menu__item-label", ' data-ring-placement="offset" data-ring-distance="4"')}
  ${label(".sk-menu__safe-area", "inline-end", "sk-menu__safe-area")}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

/*
 * THE SPECIMEN'S OWN CSS, and almost all of it is about ONE thing: putting the popup back in flow.
 *
 * An open menu floats. `.sk-menu__positioner` is `position: fixed`, placed by the browser's anchor
 * positioning against the trigger (patterns/anchored.css), which is right for a menu and useless
 * for a diagram: out of flow, the panel contributes nothing to the box `Annotated` measures, so the
 * frame sizes itself to the TRIGGER alone and the panel lands on top of the labels pointing at it.
 * Static instead, stacked under the trigger, and every leader then reaches a box that stays put. No
 * `!important` anywhere, and that is not luck: where anchor positioning exists the bindings strip
 * the machine's inline positioning style (`stripPositioningStyle`, anchored.css), so what is being
 * overridden here is a stylesheet rule, which plain specificity beats.
 *
 * The SUBMENU keeps coming out sideways, because that is the geometry the safe area is about.
 *
 * THE SAFE AREA IS A FREEZE-FRAME. In a live menu `menu-safe-area.ts` writes `left/top/width/height`
 * and a `clip-path` polygon on every pointermove, from the pointer's own position out to the
 * submenu's near edge; with no pointer and no machine there is nothing to measure, so the shape is
 * declared here at one plausible instant: apex inside the row where a pointer would be, far edge
 * spanning the submenu. `data-debug` in the markup is what paints it, and that is the same hook the
 * live `debugSafetyTriangle` option uses (menu.css) rather than a second, drifting picture of it.
 */
export const menuAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);

  /* ONE NUMBER, TWO PLACES: how wide each panel is, and how much room the subject reserves for the
     second one. menu.css floors a panel at 12rem, which is right for a real menu and too wide here:
     a panel plus its submenu plus two gutters of class names does not fit the docs column, and the
     middle track is what gets squeezed, so the submenu ends up under the labels naming it. Narrower
     panels are a presentation choice a diagram is allowed to make; what it must not do is let the
     two numbers disagree, hence the variable. */
  --sk-demo-menu-panel: 9.5rem;
}

.sk-annotated .sk-menu__content {
  min-inline-size: var(--sk-demo-menu-panel);
}

.sk-annotated__subject > .sk-menu {
  display: inline-grid;
  justify-items: start;
  gap: var(--space-stack-md);
}

.sk-annotated__subject > .sk-menu > .sk-menu__positioner {
  position: static;
  inline-size: max-content;
}

/* ROOM FOR THE SUBMENU, reserved on the SUBJECT and on nothing else. The submenu is absolutely
   positioned, so it adds nothing to the box the diagram measures: without this the middle track
   stops at the main panel's right edge and the inline-end labels are laid over the submenu they
   are supposed to sit beside. It goes on .sk-annotated__subject rather than on the menu or the
   positioner because both of those are LABELLED, and growing either would grow its ring: a ring
   around a panel plus a strip of empty air names the wrong box. */
.sk-annotated__subject {
  padding-inline-end: calc(var(--sk-demo-menu-panel) + var(--space-inline-xs));

  /* Centres the menu (an inline-grid) in that box. In the wide layout it changes nothing: the
     content box is exactly one panel wide and there is nowhere to move. It is the NARROW layout
     this is for, where annotation.css stacks the gutters above and below and hands the subject the
     full frame width: without it the drawing sits against the inline-start edge with the whole
     reserve as dead air beside it. */
  text-align: center;
}

/* The submenu's wrapper is a plain .sk-menu sitting in the panel, and a static box is not a
   containing block: without this the positioner below resolves against the SUBJECT (its filter
   makes it one), which puts the submenu beside the whole diagram instead of beside its own row. */
.sk-annotated .sk-menu__content > .sk-menu {
  position: relative;
}

/* Top edge level with the row that opens it, one --space-inline-xs to its inline-end: the same
   placement patterns/anchored.css resolves for a live submenu (inline-end span-block-end, align
   start), spelled as insets because nothing here is anchored to anything. */
.sk-annotated .sk-menu__positioner[data-sk-submenu] {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: calc(100% + var(--space-inline-xs));
}

.sk-annotated .sk-menu__safe-area {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 50%;
  inline-size: calc(50% + var(--space-inline-xs));
  block-size: 5.5rem;
  clip-path: polygon(0 22%, 100% 0, 100% 100%);
}`;
