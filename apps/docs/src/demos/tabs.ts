import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Basic and states convert. Advanced stays authored: it needs a live-region status line driven by
 * `js` / React state, and that composition is the point of the demo.
 *
 * `value` lands as `data-value` in markup and `defaultValue` in React. "Atlas" and "Node 24" stay
 * written — product / version names.
 */

/** Two panels; the first starts selected. */
export const tabsBasicTree = (t: Translate): UsageTree => ({
  contract: "tabs",
  signature: "Tabs",
  options: { value: "summary" },
  attrs: { "aria-label": t("demo.tabs.basic.label") },
  slots: {
    items: [
      {
        options: { value: "summary" },
        slots: {
          label: t("demo.tabs.basic.summary"),
          children: t("demo.tabs.basic.summaryBody"),
        },
      },
      {
        options: { value: "activity" },
        slots: {
          label: t("demo.tabs.basic.activity"),
          children: t("demo.tabs.basic.activityBody"),
        },
      },
    ],
  },
});

/** Icons in labels, one disabled tab, stacked panel bodies. */
export const tabsStatesTree = (t: Translate): UsageTree => ({
  contract: "tabs",
  signature: "Tabs",
  options: { value: "details" },
  attrs: { "aria-label": t("demo.tabs.states.label") },
  slots: {
    items: [
      {
        options: { value: "details" },
        slots: {
          label: [
            { contract: "icon", signature: "Icon", options: { name: "info", size: "sm" } },
            t("demo.tabs.states.details"),
          ],
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Text",
                options: { weight: "emphasis" },
                children: t("demo.tabs.states.detailsTitle"),
              },
              {
                contract: "typography",
                signature: "Text",
                children: t("demo.tabs.states.detailsBody"),
              },
            ],
          },
        },
      },
      {
        options: { value: "validation" },
        slots: {
          label: [
            { contract: "icon", signature: "Icon", options: { name: "check", size: "sm" } },
            t("demo.tabs.states.validation"),
          ],
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Text",
                options: { weight: "emphasis" },
                children: t("demo.tabs.states.validationTitle"),
              },
              {
                contract: "typography",
                signature: "Text",
                children: t("demo.tabs.states.validationBody"),
              },
            ],
          },
        },
      },
      {
        options: { value: "settings", disabled: true },
        slots: {
          label: [
            { contract: "icon", signature: "Icon", options: { name: "settings", size: "sm" } },
            t("demo.tabs.states.settings"),
          ],
          children: t("demo.tabs.states.settingsBody"),
        },
      },
    ],
  },
});
