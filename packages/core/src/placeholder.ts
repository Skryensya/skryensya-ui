export type PlaceholderShape = "text" | "block" | "circle";

export const placeholderParts = {
  root: "sk-placeholder",
} as const;

export type PlaceholderPart = keyof typeof placeholderParts;
export type PlaceholderPartClass = (typeof placeholderParts)[PlaceholderPart];
