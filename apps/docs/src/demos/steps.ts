import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const completeMarker: UsageTree = {
  contract: "icon",
  signature: "Icon",
  options: { name: "check" },
};

/** Four stages with one current position and an icon as the non-colour completion cue. */
export const stepsTree = (t: Translate): UsageTree => ({
  contract: "steps",
  signature: "Steps",
  slots: {
    items: [
      {
        options: { status: "complete" },
        slots: {
          marker: completeMarker,
          label: t("demo.steps.brand.label"),
          description: t("demo.steps.brand.description"),
        },
      },
      {
        options: { status: "current", current: true },
        slots: {
          marker: "2",
          label: t("demo.steps.ramps.label"),
          description: t("demo.steps.ramps.description"),
        },
      },
      {
        options: { status: "upcoming" },
        slots: {
          marker: "3",
          label: t("demo.steps.contrast.label"),
          description: t("demo.steps.contrast.description"),
        },
      },
      {
        options: { status: "upcoming" },
        slots: {
          marker: "4",
          label: t("demo.steps.export.label"),
          description: t("demo.steps.export.description"),
        },
      },
    ],
  },
});

/** The same status model pinned to a vertical checkout rail. */
export const stepsVerticalTree = (t: Translate): UsageTree => ({
  contract: "steps",
  signature: "Steps",
  attrs: { "data-orientation": "vertical" },
  slots: {
    items: [
      {
        options: { status: "complete" },
        slots: {
          marker: completeMarker,
          label: t("demo.steps.account.label"),
          description: t("demo.steps.account.description"),
        },
      },
      {
        options: { status: "current", current: true },
        slots: {
          marker: "2",
          label: t("demo.steps.shipping.label"),
          description: t("demo.steps.shipping.description"),
        },
      },
      {
        options: { status: "upcoming" },
        slots: {
          marker: "3",
          label: t("demo.steps.payment.label"),
          description: t("demo.steps.payment.description"),
        },
      },
    ],
  },
});
