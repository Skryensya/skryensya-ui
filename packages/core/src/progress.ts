import type { ComponentContract } from "./contract.js";

/*
 * PROGRESS, a determinate bar for a value between 0 and a max.
 *
 * Determinate only: the consumer knows the value. (An indeterminate spinner is a different
 * component with different semantics.) The fraction is clamped here so the rendered width and the
 * reported aria-valuenow can never disagree, whatever the caller passes.
 */
/** The tone vocabulary both bar-shaped controls share — `Progress`'s own and `Meter`'s (`meter.ts`),
 *  which reuses this rather than redeclaring the identical four-value union a second time. Not the
 *  same vocabulary Badge or Callout use (`neutral`/`info` have no meaning on a bar), so this stays
 *  its own export rather than a system-wide "tone" type. */
export const barTones = ["accent", "success", "warning", "danger"] as const;
export type BarTone = (typeof barTones)[number];
export type ProgressTone = BarTone;

export const progressParts = {
  root: "sk-progress",
  bar: "sk-progress__bar",
} as const;

export type ProgressPart = keyof typeof progressParts;
export type ProgressPartClass = (typeof progressParts)[ProgressPart];

/** Clamp value into [0, max] and return the completed fraction (0–1). Guards NaN and max ≤ 0. */
export function progressFraction(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(Math.max(value, 0), max) / max;
}

/*
 * A wait whose end is known, which is the whole difference from a Loader.
 *
 * `role="progressbar"` plus the three aria-value attributes are not decoration: they are what makes
 * "62%" audible. The fill is a child element rather than a background so the bar can be styled
 * without the value living in CSS.
 */
export const progressContract = {
  id: "progress",
  css: "@skryensya/core/components/progress.css",
  parts: progressParts,

  options: {
    value: { type: "number", default: 0, attr: "aria-valuenow" },
    max: { type: "number", default: 100, attr: "aria-valuemax" },
    tone: {
      type: "enum",
      values: barTones,
      default: "accent",
      attr: "data-tone",
    },
    /** The accessible name. A bar with no name announces a number about nothing. */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    Progress: {
      intent: ["determinate-progress", "percentage-complete", "upload-progress"],
      host: { element: "div" },
      options: ["value", "max", "tone", "label"],
      requires: ["label"],
      slots: {},
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "progressbar", "aria-valuemin": "0" },
        style: [{ property: "--sk-progress-fill", percentOf: ["value", "max"] }],
        children: [{ element: "div", part: "bar" }],
      },
      react: { from: "@skryensya/react/progress", name: "Progress" },
    },
  },
} as const satisfies ComponentContract;
