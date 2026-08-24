import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * THE TABS AND THEIR PANELS, kept out of the compositions in `tabs.ts`.
 *
 * An entry here carries both halves of a tab. The label and the panel body it selects, so the
 * list reads as the content of the demo, and the tree beside it reads as one `Tabs` with an
 * orientation and an activation mode. That separation is the same one the emitted React snippet
 * makes when it writes `tabs-items.ts` next to the component.
 */

/** Two panels of plain text; the composition starts on the first. */
export const tabsBasicItems = (t: Translate): readonly ItemInput[] => [
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
];

/** Icons in labels, one disabled tab, and panel bodies that are themselves compositions. */
export const tabsStatesItems = (t: Translate): readonly ItemInput[] => [
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
];

/** Four plain panels: enough of them that a vertical list is worth showing. */
export const tabsAdvancedItems = (t: Translate): readonly ItemInput[] => [
  {
    options: { value: "summary" },
    slots: { label: t("demo.tabs.summary"), children: t("demo.tabs.summary.body") },
  },
  {
    options: { value: "activity" },
    slots: { label: t("demo.tabs.activity"), children: t("demo.tabs.activity.body") },
  },
  {
    options: { value: "metrics" },
    slots: { label: t("demo.tabs.metrics"), children: t("demo.tabs.metrics.body") },
  },
  {
    options: { value: "settings" },
    slots: { label: t("demo.tabs.settings"), children: t("demo.tabs.settings.body") },
  },
];
