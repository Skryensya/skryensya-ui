import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * THE STAGES OF EVERY STEPS DEMO, which is all a Steps demo really is: the composition carries an
 * orientation and nothing else, and every difference between the two examples lives here.
 */

/** The completion cue, and deliberately not a colour: a check mark reads without one. */
const completeMarker: UsageTree = {
  contract: "icon",
  signature: "Icon",
  options: { name: "check" },
};

/** Four stages of a brand setup, with one current position. */
export const stepsItems = (t: Translate): readonly ItemInput[] => [
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
];

/** The same status model, three stages of a checkout. */
export const stepsVerticalItems = (t: Translate): readonly ItemInput[] => [
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
];
