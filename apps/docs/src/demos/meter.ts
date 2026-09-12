import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * Header, label, value text, track and bar: one measurement named at rest. The live stack of three
 * tones starts below.
 */
export const meterAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("meterPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "meter",
      signature: "Meter",
      options: {
        value: 68,
        label: t("demo.meter.battery"),
        valueText: t("demo.meter.batteryText"),
      },
      attrs: { style: "inline-size: min(100%, 16rem)" },
    },
    items: [
      namePart(".sk-meter-group", "block-start"),
      namePart(".sk-meter-group__header", "inline-start"),
      namePart(".sk-meter-group__label", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-meter-group__value", "inline-end"),
      namePart(".sk-meter", "block-end"),
      namePart(".sk-meter__bar", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * Three measurements, one per tone: a rating (non-zero `min`, unlike Progress), disk usage, and
 * battery level. None of them is a task's completion. That's what tells them apart from `Progress`.
 */
export const meterTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "meter",
      signature: "Meter",
      options: {
        value: 4,
        min: 1,
        max: 5,
        tone: "success",
        label: t("demo.meter.rating"),
        valueText: t("demo.meter.ratingText"),
      },
    },
    {
      contract: "meter",
      signature: "Meter",
      options: {
        value: 92,
        tone: "danger",
        label: t("demo.meter.disk"),
        valueText: t("demo.meter.diskText"),
      },
    },
    {
      contract: "meter",
      signature: "Meter",
      options: { value: 68, label: t("demo.meter.battery"), valueText: t("demo.meter.batteryText") },
    },
  ],
});
