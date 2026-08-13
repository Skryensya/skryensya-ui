import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
 * File actions: a plain command, a checkbox that shows its state, and a submenu.
 *
 * The submenu is the point: it is a whole Menu standing where an item would, and in the tree that
 * is just an entry whose `children` are entries. Format names stay written: PDF and CSV read the
 * same in every language.
 */
export const menuTree = (t: Translate): UsageTree => ({
  contract: "menu",
  signature: "Menu",
  options: { label: t("demo.menu.label") },
  slots: {
    trigger: t("demo.menu.trigger"),
    items: [
      { options: { value: "rename" }, slots: { label: t("demo.menu.rename") } },
      {
        options: { value: "favorite", kind: "checkbox" },
        slots: { label: t("demo.menu.favorite") },
      },
      {
        options: { value: "export" },
        slots: {
          label: t("demo.menu.export"),
          children: [
            { options: { value: "pdf" }, slots: { label: "PDF" } },
            { options: { value: "csv" }, slots: { label: "CSV" } },
          ],
        },
      },
    ],
  },
});

/**
 * Three levels deep on purpose, not two: the contract's own claim is "submenus that nest without
 * limit" (menu.ts), and the one example on this page already shown (Exportar > PDF/CSV) stops at
 * two, which reads exactly like a special case rather than a recursion. Insertar > Medios > Imagen
 * is the same `children` slot pointing at itself a second time, nothing new to author.
 */
export const menuMultilevelTree = (t: Translate): UsageTree => ({
  contract: "menu",
  signature: "Menu",
  options: { label: t("demo.menu.multilevel.label") },
  slots: {
    trigger: t("demo.menu.multilevel.trigger"),
    items: [
      { options: { value: "heading" }, slots: { label: t("demo.menu.multilevel.heading") } },
      {
        options: { value: "media" },
        slots: {
          label: t("demo.menu.multilevel.media"),
          children: [
            {
              options: { value: "image" },
              slots: {
                label: t("demo.menu.multilevel.image"),
                children: [
                  { options: { value: "upload" }, slots: { label: t("demo.menu.multilevel.upload") } },
                  { options: { value: "from-url" }, slots: { label: t("demo.menu.multilevel.fromUrl") } },
                ],
              },
            },
            { options: { value: "video" }, slots: { label: t("demo.menu.multilevel.video") } },
          ],
        },
      },
      { options: { value: "table" }, slots: { label: t("demo.menu.multilevel.table") } },
    ],
  },
});

/**
 * Same shape as a text editor's Format menu: enough rows that a comfortable 44px each would push
 * the panel well past a single glance. `density: "compact"` is the one option that changes; every
 * row still resolves through the same hooks (menu.css), just re-declared smaller.
 */
export const menuCompactTree = (t: Translate): UsageTree => ({
  contract: "menu",
  signature: "Menu",
  options: { label: t("demo.menu.compact.label"), density: "compact" },
  slots: {
    trigger: t("demo.menu.compact.trigger"),
    items: [
      { options: { value: "bold" }, slots: { label: t("demo.menu.compact.bold") } },
      { options: { value: "italic" }, slots: { label: t("demo.menu.compact.italic") } },
      { options: { value: "underline" }, slots: { label: t("demo.menu.compact.underline") } },
      { options: { value: "strikethrough" }, slots: { label: t("demo.menu.compact.strikethrough") } },
      {
        options: { value: "align-left", kind: "radio", group: "align" },
        slots: { label: t("demo.menu.compact.alignLeft") },
      },
      {
        options: { value: "align-center", kind: "radio", group: "align" },
        slots: { label: t("demo.menu.compact.alignCenter") },
      },
      {
        options: { value: "align-right", kind: "radio", group: "align" },
        slots: { label: t("demo.menu.compact.alignRight") },
      },
    ],
  },
});

/**
 * A sibling directly ABOVE and another directly BELOW "Compartir", so a natural diagonal move from
 * either one toward the submenu that opens beside it actually crosses the other one's row —
 * `debugSafetyTriangle` is the one option that changes, and every submenu it reaches (menu.ts's
 * `debugSafetyTriangle` doc comment) draws @zag-js/menu's own intent polygon and lock state live.
 */
export const menuSafetyTree = (t: Translate): UsageTree => ({
  contract: "menu",
  signature: "Menu",
  options: { label: t("demo.menu.safety.trigger"), debugSafetyTriangle: true },
  slots: {
    trigger: t("demo.menu.safety.trigger"),
    items: [
      { options: { value: "new" }, slots: { label: t("demo.menu.safety.new") } },
      {
        options: { value: "share" },
        slots: {
          label: t("demo.menu.safety.share"),
          children: [
            { options: { value: "email" }, slots: { label: t("demo.menu.safety.email") } },
            { options: { value: "link" }, slots: { label: t("demo.menu.safety.link") } },
          ],
        },
      },
      { options: { value: "delete" }, slots: { label: t("demo.menu.safety.delete") } },
    ],
  },
});
