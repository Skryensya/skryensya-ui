import type { ComponentContract } from "./contract.js";

/*
 * LOADER, indeterminate work with no measurable completion value.
 *
 * The visual is CSS-only and has no Vanilla enhancer. Accessibility belongs to the authored root:
 * a labelled Loader is a polite status; an unlabelled one is decorative beside another status label.
 *
 * Size, variant, and speed are orthogonal axes: any motion design can be small and slow.
 */
export type LoaderSize = "sm" | "md" | "lg";
export type LoaderVariant = "ring" | "sweep" | "bars" | "dots";
export type LoaderSpeed = "fast" | "normal" | "slow";

export const loaderParts = {
  root: "sk-loader",
} as const;

export type LoaderPart = keyof typeof loaderParts;
export type LoaderPartClass = (typeof loaderParts)[LoaderPart];

/*
 * A wait, with the accessibility decided by whether it is named.
 *
 * `label` is the whole semantic: with one, the loader IS the status and gets `role="status"`; without
 * one, it is decoration beside a status somebody else announces, and gets `aria-hidden`. Announcing
 * both would say "loading" twice; announcing neither would leave the wait silent.
 */
export const loaderContract = {
  id: "loader",
  css: "@skryensya/core/components/loader.css",
  parts: loaderParts,

  options: {
    size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-size" },
    /** Motion design. Orthogonal to size and speed. */
    variant: {
      type: "enum",
      values: ["ring", "sweep", "bars", "dots"],
      default: "ring",
      attr: "data-variant",
    },
    speed: { type: "enum", values: ["fast", "normal", "slow"], default: "normal", attr: "data-speed" },
    /** The accessible name. Its PRESENCE is what makes this a status rather than decoration. */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    Loader: {
      intent: ["loading", "waiting", "in-progress-unknown-duration"],
      host: { element: "span" },
      options: ["size", "variant", "speed", "label"],
      slots: {},
      template: {
        element: "span",
        part: "root",
        host: true,
        // The label decides the semantics: named is a status, unnamed is decoration beside one.
        attrsWhen: [
          { option: "label", given: true, attrs: { role: "status" } },
          { option: "label", given: false, attrs: { "aria-hidden": "true" } },
        ],
      },
      react: { from: "@skryensya/react/loader", name: "Loader" },
    },
  },
} as const satisfies ComponentContract;
