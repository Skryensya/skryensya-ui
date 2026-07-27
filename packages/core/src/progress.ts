/*
 * PROGRESS, a determinate bar for a value between 0 and a max.
 *
 * Determinate only: the consumer knows the value. (An indeterminate spinner is a different
 * component with different semantics.) The fraction is clamped here so the rendered width and the
 * reported aria-valuenow can never disagree, whatever the caller passes.
 */
export type ProgressTone = "accent" | "success" | "warning" | "danger";

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
