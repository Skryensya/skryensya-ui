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
        // `aria-atomic`, explicit: the same fix already applied to Toast and Callout, both of
        // which share this exact `role="status"` live-region shape.
        attrsWhen: [
          { option: "label", given: true, attrs: { role: "status", "aria-atomic": "true" } },
          { option: "label", given: false, attrs: { "aria-hidden": "true" } },
        ],
      },
      react: { from: "@skryensya/react/loader", name: "Loader" },
    },

    /*
     * The wait ANNOUNCED and not drawn.
     *
     * A second signature rather than an option, because the constraint differs: a Loader with no
     * label is legitimate decoration beside a named one, while a hidden loader with no label is
     * nothing at all, so this one requires it. Choosing between the two is choosing whether the
     * wait is drawn, which is a real design decision and not a flag.
     *
     * It exists because of the skeleton screen. Placeholders are the right paint while a known shape
     * loads (the page does not jump when the data lands), but they say NOTHING to anyone who cannot
     * see them: no live region, so a screen reader finds a still page and no reason to wait. Adding a
     * spinner above the skeletons to fix that would undo the reason for the skeletons.
     */
    "Loader.status": {
      intent: ["announce-loading", "status-for-a-skeleton", "loading-without-a-spinner"],
      host: { element: "span" },
      options: ["label"],
      requires: ["label"],
      slots: {},
      template: {
        element: "span",
        // No part class: this draws nothing, so it has no anatomy, only the hiding and the role.
        also: ["sk-visually-hidden"],
        host: true,
        attrs: { role: "status", "aria-atomic": "true" },
      },
      react: { from: "@skryensya/react/loader", name: "LoaderStatus" },
    },
  },
} as const satisfies ComponentContract;
