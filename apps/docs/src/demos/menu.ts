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
 * — a fixed constant, not a measured one: `100dvh` was tried first and fed back into `fitFrame`'s own
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
 * File actions, a checkbox and a submenu — the rows are in `data/menu.ts`.
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
 * The rows it needs to be shown against — a sibling above and below the one that opens a submenu —
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
