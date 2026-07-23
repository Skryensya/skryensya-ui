/*
 * STEPS, a linear progress indicator across an ordered sequence of stages.
 *
 * Each step reports one of three states; exactly one is normally "current". The component displays
 * the sequence, it does not own which step is active nor guard navigation between them.
 */
export type StepStatus = "complete" | "current" | "upcoming";

export type Step = {
  label: string;
  description?: string;
  status?: StepStatus;
};

export const stepsParts = {
  root: "ds-steps",
  item: "ds-steps__item",
  marker: "ds-steps__marker",
  label: "ds-steps__label",
  description: "ds-steps__description",
} as const;

export type StepsPart = keyof typeof stepsParts;
export type StepsPartClass = (typeof stepsParts)[StepsPart];
