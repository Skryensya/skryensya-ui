import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/**
 * `ComponentPreview.bare`: a titled stage plus its source, composed from `Button` and
 * `CodePreview` rather than reimplemented. The full apparatus this page otherwise teaches (binding
 * switch, screen presets) is this site's own chrome and has no tree of its own; this is the part
 * that does.
 */
export const componentPreviewBareTree = (t: Translate): UsageTree => ({
  contract: "component-preview",
  signature: "ComponentPreview.bare",
  slots: {
    title: t("demo.componentPreview.title"),
    stage: {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      children: t("demo.componentPreview.button"),
    },
    code: {
      contract: "code-preview",
      signature: "CodePreview",
      slots: {
        children: '<button class="sk-button" data-tone="accent">' + t("demo.componentPreview.button") + "</button>",
      },
    },
  },
});

/*
 * The first demo on the page: the smallest thing worth putting on a stage.
 *
 * A TREE and not the hand-written pair it replaced, for a reason this page's own audit turned up:
 * the Vanilla source was a Spanish string literal and the React island said "Save changes", so the
 * English page showed "Guardar cambios" in one binding and "Save changes" in the other, in a card
 * whose entire subject is that the two bindings are the same component seen twice. `demoHtml`  -  the
 * snippet quoted further down the page, and the body of the nested frame  -  is EMITTED from this
 * now, so there is nothing left to keep in agreement by hand.
 */
export const componentPreviewButtonTree = (t: Translate): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  children: t("demo.componentPreview.saveChanges"),
});

/*
 * The screen-preset demo: lanes keyed to the system's OWN named breakpoints, one below compact
 * (36rem), two at compact, three at desktop (52rem). Each preset therefore lands in a different
 * band (mobile 1, tablet 2, free 3), which is the claim the prose makes, shown instead of asserted.
 * The media queries resolve against the FRAME's viewport, which is the preset width: that is what
 * the iframe buys over a container query on a plain div.
 */
export const componentPreviewScreensTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", multicol: true },
  /* Spelled out rather than built from a key prefix: `t` takes a literal message id, and a template
     literal would type-check as `string` and lose the one guarantee the message tree offers. */
  children: [
    [t("demo.componentPreview.billingTitle"), t("demo.componentPreview.billingBody")],
    [t("demo.componentPreview.teamTitle"), t("demo.componentPreview.teamBody")],
    [t("demo.componentPreview.domainsTitle"), t("demo.componentPreview.domainsBody")],
    [t("demo.componentPreview.logsTitle"), t("demo.componentPreview.logsBody")],
    [t("demo.componentPreview.integrationsTitle"), t("demo.componentPreview.integrationsBody")],
    [t("demo.componentPreview.notificationsTitle"), t("demo.componentPreview.notificationsBody")],
  ].map(([title, description]) => ({
    contract: "tile",
    signature: "TileLink",
    options: { href: "#" },
    children: {
      contract: "tile",
      signature: "TileContent",
      slots: { title, description },
    },
  })),
});
