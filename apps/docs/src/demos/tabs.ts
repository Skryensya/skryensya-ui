import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Basic, states and live-status Tabs compositions shared by both locales. */

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
      slots: {
        items: [
          {
            options: { value: "summary" },
            slots: {
              label: t("demo.tabs.summary"),
              children: t("demo.tabs.summary.body"),
            },
          },
          {
            options: { value: "activity" },
            slots: {
              label: t("demo.tabs.activity"),
              children: t("demo.tabs.activity.body"),
            },
          },
          {
            options: { value: "metrics" },
            slots: {
              label: t("demo.tabs.metrics"),
              children: t("demo.tabs.metrics.body"),
            },
          },
          {
            options: { value: "settings" },
            slots: {
              label: t("demo.tabs.settings"),
              children: t("demo.tabs.settings.body"),
            },
          },
        ],
      },
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

export const tabsAdvancedScript = `
const root = document.querySelector("[data-tabs-advanced]");
const status = root?.querySelector("[data-tabs-status]");
root?.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-sk-tabs-trigger]");
  if (trigger && status) {
    const label = status.textContent.split(":")[0];
    status.textContent = label + ": " + trigger.textContent.trim();
  }
});
`;
