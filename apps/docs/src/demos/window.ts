import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
