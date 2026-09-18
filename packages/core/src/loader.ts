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
/*
 * Motion designs, in two families that differ in ANATOMY rather than in taste.
 *
 * The first six draw themselves out of the root's two pseudo-elements and have no children at all.
 * The last four are a ring of marks that fade in sequence, which two pseudo-elements cannot be: a
 * stagger needs one real element per mark. `loaderTicks` is what says how many.
 */
export type LoaderVariant =
  | "ring"
  | "sweep"
  | "bars"
  | "dots"
  | "arc"
  | "comet"
  | "orbit"
  | "clock"
  | "spokes"
  | "ticks"
  | "compass"
  | "beads";
export type LoaderSpeed = "fast" | "normal" | "slow";

export const loaderParts = {
  root: "sk-loader",
  tick: "sk-loader__tick",
} as const;

/**
 * The enhancer's attachment point.
 *
 * Bookkeeping, not content: React writes the marks itself and never writes this, which is exactly
 * what the symmetry gate reads `ContractSignature.mount` to know.
 */
export const loaderAttrs = {
  root: "data-sk-loader",
} as const;

/**
 * How many marks a staggered variant draws. Zero for the ones the pseudo-elements already cover.
 *
 * Pure and shared, for the reason `placeholderLines` is: React builds this many elements and the
 * emitter expands this many entries (`loader-ticks`, a `repeatComputed` window), so the two bindings
 * cannot disagree about how many marks a `spokes` is. An author never types this number, because it
 * is not a choice: twelve is what makes a `spokes` read as a spokes.
 *
 * WHICH mark each one is stays out of here, exactly as a placeholder line's width does. The angle
 * and the delay are PAINT, so `loader.css` derives both from `:nth-child()` and neither binding
 * computes anything.
 */
export const LOADER_TICKS: Readonly<Partial<Record<LoaderVariant, number>>> = {
  spokes: 12,
  ticks: 8,
  compass: 4,
  beads: 8,
};

export function loaderTicks(variant: string): number {
  return LOADER_TICKS[variant as LoaderVariant] ?? 0;
}

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
  category: "feedback",
  css: "@skryensya/core/components/loader.css",
  parts: loaderParts,
  /* Staggered tick children are enhancer/React-injected; emit has none. */
  systemOwned: ["tick"],
  hooks: [
    "--sk-loader-cycle",
    "--sk-loader-duration",
    "--sk-loader-easing",
    "--sk-loader-oscillation-easing",
    "--sk-loader-size",
    "--sk-loader-step",
    "--sk-loader-stroke-width",
    "--sk-loader-tempo",
    "--sk-loader-tick-angle",
    "--sk-loader-tick-count",
    "--sk-loader-track-color",
  ],
  /*
   * Loader.status paints with `sk-visually-hidden`. That class has no unique contract owner, so
   * `sheetsForTree` cannot discover the sheet from `also` alone, name it here.
   */
  hookSheets: ["@skryensya/core/patterns/visually-hidden.css"],

  options: {
    size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-size" },
    /** Motion design. Orthogonal to size and speed. */
    variant: {
      type: "enum",
      values: [
        "ring",
        "sweep",
        "bars",
        "dots",
        "arc",
        "comet",
        "orbit",
        "clock",
        "spokes",
        "ticks",
        "compass",
        "beads",
      ],
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
      /*
       * THE MARKS ARE INJECTED, not authored.
       *
       * A staggered variant needs one real element per mark, and twelve of them is exactly the kind
       * of markup a person miscounts: eleven `sk-loader__tick` spans is not an error anything
       * catches, it is a spinner with a gap. So authored markup names the design and nothing else,
       * and `mountLoader` builds the marks `loaderTicks` asks for. The eight pseudo-element variants
       * need none, and the enhancer leaves them exactly as written.
       *
       * The wait still paints with no JavaScript at all: `loader.css` suppresses the default ring
       * only on a root that HAS marks (`:has(.sk-loader__tick)`), so an un-enhanced staggered
       * variant is a plain ring rather than an empty box. That fallback is why a loading indicator
       * is allowed to depend on an enhancer here.
       */
      mount: loaderAttrs.root,
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
