export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export const badgeParts = {
  root: "ds-badge",
} as const;

export type BadgePart = keyof typeof badgeParts;
export type BadgePartClass = (typeof badgeParts)[BadgePart];
