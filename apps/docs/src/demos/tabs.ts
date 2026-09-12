import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { tabsAdvancedItems, tabsBasicItems, tabsStatesItems } from "./data/tabs";
import { namePart } from "./annotation-parts";

/* Basic, states and live-status Tabs compositions shared by both locales. The panels themselves are
 * data: see `data/tabs.ts`. */


/** List, triggers and one panel: the tabs parts a reader has to learn first. */
export const tabsAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("tabsPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "tabs",
      signature: "Tabs",
      options: { value: "summary" },
      attrs: { "aria-label": t("demo.tabs.basic.label") },
      slots: { items: tabsBasicItems(t) },
    },
    items: [
      namePart(".sk-tabs", "block-start"),
      namePart(".sk-tabs__list", "inline-start"),
      namePart(".sk-tabs__trigger", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-tabs__content", "block-end"),
    ],
  },
});

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

/** The same two panels, once at `sm` and once at the `md` default, stacked so the trigger row's
 * height, padding and type read side by side. */
export const tabsSizeTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "tabs",
      signature: "Tabs",
      options: { value: "summary", size: "sm" },
      attrs: { "aria-label": t("demo.tabs.size.smLabel") },
      slots: { items: tabsBasicItems(t) },
    },
    {
      contract: "tabs",
      signature: "Tabs",
      options: { value: "summary" },
      attrs: { "aria-label": t("demo.tabs.size.mdLabel") },
      slots: { items: tabsBasicItems(t) },
    },
  ],
});

export { default as tabsAdvancedScript } from "./scripts/tabs-status.ts?raw";
