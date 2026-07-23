/*
 * STAT, a single headline metric: a label, a big value, and an optional change indicator.
 *
 * The trend colours the change independently of its sign, because "down is good" for churn and
 * "up is good" for revenue, the caller decides which direction is positive.
 */
export type StatTrend = "up" | "down" | "neutral";

export const statParts = {
  root: "ds-stat",
  label: "ds-stat__label",
  value: "ds-stat__value",
  change: "ds-stat__change",
} as const;

export type StatPart = keyof typeof statParts;
export type StatPartClass = (typeof statParts)[StatPart];
