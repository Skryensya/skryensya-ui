import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { tabsAdvancedItems, tabsBasicItems, tabsStatesItems } from "./data/tabs";

/* Basic, states and live-status Tabs compositions shared by both locales. The panels themselves are
 * data: see `data/tabs.ts`. */

/** Two panels; the first starts selected. */
export const tabsBasicTree = (t: Translate): UsageTree => ({
  contract: "tabs",
  signature: "Tabs",
  options: { value: "summary" },
  attrs: { "aria-label": t("demo.tabs.basic.label") },
  slots: { items: tabsBasicItems(t) },
});

/** Icons in labels, one disabled tab, stacked panel bodies. */
export const tabsStatesTree = (t: Translate): UsageTree => ({
  contract: "tabs",
  signature: "Tabs",
  options: { value: "details" },
  attrs: { "aria-label": t("demo.tabs.states.label") },
  slots: { items: tabsStatesItems(t) },
});

/** Vertical and manually activated, with a live region below that reports the current tab. */
export const tabsAdvancedTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  attrs: { "data-tabs-advanced": "" },
  children: [
    {
      contract: "tabs",
      signature: "Tabs",
      options: { value: "summary", orientation: "vertical", activationMode: "manual" },
      attrs: { "aria-label": t("demo.tabs.basic.label") },
      slots: { items: tabsAdvancedItems(t) },
    },
    {
      contract: "typography",
      signature: "Text",
      options: { size: "sm", tone: "secondary" },
      attrs: { role: "status", "data-tabs-status": "" },
      children: `${t("demo.tabs.status")}: ${t("demo.tabs.summary")}`,
    },
  ],
});

export { default as tabsAdvancedScript } from "./scripts/tabs-status.ts?raw";
