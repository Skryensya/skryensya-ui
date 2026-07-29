import type { ComponentContract } from "./contract.js";

export type PlaceholderShape = "text" | "block" | "circle";

export const placeholderParts = {
  root: "sk-placeholder",
} as const;

export type PlaceholderPart = keyof typeof placeholderParts;
export type PlaceholderPartClass = (typeof placeholderParts)[PlaceholderPart];

/*
 * The shape of content that has not arrived. Always `aria-hidden`: a skeleton is a picture of
 * absence, and announcing it would tell a screen-reader user about a thing that is not there.
 */
export const placeholderContract = {
  id: "placeholder",
  css: "@skryensya/core/components/placeholder.css",
  parts: placeholderParts,

  options: {
    shape: { type: "enum", values: ["text", "block", "circle"], default: "text", attr: "data-shape" },
  },

  signatures: {
    Placeholder: {
      intent: ["loading-skeleton", "content-not-yet-loaded", "shape-of-absent-content"],
      host: { element: "span" },
      options: ["shape"],
      slots: {},
      template: { element: "span", part: "root", host: true, attrs: { "aria-hidden": "true" } },
      react: { from: "@skryensya/react/placeholder", name: "Placeholder" },
    },
  },
} as const satisfies ComponentContract;
