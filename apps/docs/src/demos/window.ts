import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * The control names follow the page's locale: the contract's defaults are English, and a Spanish
 * page announcing "Minimize" would be the exact drift `closeLabel` and its siblings exist to stop.
 */
const labels = (t: Translate) => ({
  closeLabel: t("demo.window.close"),
  minimizeLabel: t("demo.window.minimize"),
  maximizeLabel: t("demo.window.maximize"),
  restoreLabel: t("demo.window.restore"),
});

export const windowTree = (t: Translate): UsageTree => ({
  contract: "window",
  signature: "Window",
  options: { ...labels(t), defaultWidth: 360, defaultHeight: 240 },
  slots: {
    trigger: t("demo.window.trigger"),
    title: t("demo.window.title"),
    children: t("demo.window.body"),
  },
});

/*
 * Pinned in size: `resizable={false}` removes the edges AND the stage controls, because the machine
 * refuses to minimize or maximize a window it cannot resize. It still moves; a window that did not
 * would be a Popover without an anchor.
 */
export const windowFixedTree = (t: Translate): UsageTree => ({
  contract: "window",
  signature: "Window",
  options: { ...labels(t), resizable: false, defaultWidth: 320, defaultHeight: 180 },
  slots: {
    trigger: t("demo.windowFixed.trigger"),
    title: t("demo.windowFixed.title"),
    children: t("demo.windowFixed.body"),
  },
});

/*
 * Open, and pulled into flow by `windowAnatomyCss`: a live window is positioned by its machine and
 * would float wherever it last was. The positioner and the drag region are the same boxes as the
 * content and the header, so they are named in the page's text rather than ringed twice; the eight
 * resize edges are a few pixels wide, so one is named for all of them.
 */
export const windowAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("windowPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "window",
      signature: "Window",
      options: { ...labels(t), defaultOpen: true, draggable: false, persistRect: false },
      slots: {
        trigger: t("demo.window.trigger"),
        title: t("demo.window.title"),
        children: t("demo.window.body"),
      },
    },
    items: [
      namePart(".sk-window__trigger", "block-start"),
      namePart(".sk-window__content", "inline-start", { mark: "bracket" }),
      namePart(".sk-window__header", "inline-start", { mark: "bracket" }),
      namePart(".sk-window__title", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-window__controls", "block-start"),
      namePart(".sk-window__close", "inline-end"),
      namePart(".sk-window__body", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      /* The bottom edge, not the first one: the first is the top edge, and a label reading from below
         would draw its leader straight through the window to reach it. */
      { options: { for: '.sk-window__resize[data-axis="s"]', side: "block-end" }, slots: { children: "sk-window__resize" } },
    ],
  },
});

export const windowAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-window {
  display: grid;
  justify-items: start;
  gap: var(--space-stack-md);
}

.sk-annotated__subject > .sk-window .sk-window__positioner {
  position: static !important;
  inset: auto !important;
  translate: none !important;
  transform: none !important;
  inline-size: 20rem;
}

.sk-annotated__subject > .sk-window .sk-window__content {
  position: relative;
  inline-size: 20rem;
  block-size: 11rem;
}`;
