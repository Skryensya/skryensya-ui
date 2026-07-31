import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Native and tile radio groups share one authored choice model. */

/** An exclusive choice between three plans. Plan names are product nouns and stay written. */
export const radioGroupTree = (t: Translate): UsageTree => ({
  contract: "radio-group",
  signature: "RadioGroup",
  options: { name: "plan", value: "pro", orientation: "vertical" },
  attrs: { "aria-label": t("demo.radioGroup.label") },
  slots: {
    items: [
      { options: { value: "basic" }, slots: { label: "Basic" } },
      { options: { value: "pro" }, slots: { label: "Professional" } },
      { options: { value: "enterprise" }, slots: { label: "Enterprise" } },
    ],
  },
});

export const tileRadioGroupTree = (t: Translate): UsageTree => ({
  contract: "tile",
  signature: "TileRadioGroup",
  options: { name: "plan-tile", defaultValue: "pro", orientation: "horizontal" },
  attrs: { "aria-label": t("demo.radioGroup.label") },
  slots: {
    items: [
      {
        options: { value: "starter" },
        slots: {
          label: {
            contract: "tile",
            signature: "TileContent",
            slots: {
              title: t("demo.radioGroup.starter.title"),
              description: t("demo.radioGroup.starter.body"),
            },
          },
        },
      },
      {
        options: { value: "pro" },
        slots: {
          label: {
            contract: "tile",
            signature: "TileContent",
            slots: {
              title: t("demo.radioGroup.pro.title"),
              description: t("demo.radioGroup.pro.body"),
            },
          },
        },
      },
    ],
  },
});
