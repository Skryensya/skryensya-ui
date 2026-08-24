import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
