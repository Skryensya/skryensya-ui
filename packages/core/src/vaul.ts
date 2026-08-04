import type { ComponentContract } from "./contract.js";
/*
 * VAUL, the contract.
 *
 * A modal panel anchored to an edge. The classes and parts are ours and permanent; the modality is
 * the platform's (a native <dialog>, decision 11), and drag-to-dismiss is Vaul's own enhancer
 * because neither the platform nor Zag has it.
 */

/** Which edge the Vaul arrives from. Logical, so the inline edges follow writing direction. */
export type VaulEdge = "inline-start" | "inline-end" | "block-end";

export type VaulOpenChangeDetails = {
  open: boolean;
};

export type VaulOptions = {
  /**
   * Where the panel is anchored. Must match the `data-edge` the markup already carries, the
   * enhancer reads it rather than writing it, because the edge is a layout decision the CSS makes.
   */
  edge?: VaulEdge;
  /**
   * Fraction of the panel's own size that must be dragged away before releasing dismisses it.
   * Below the threshold the panel springs back.
   */
  dismissThreshold?: number;
  /**
   * Speed (px/ms) past which a release dismisses regardless of distance, a flick is an intent, and
   * waiting for it to cross a distance threshold is what makes a sheet feel stuck.
   */
  dismissVelocity?: number;
  /** Set false to keep the panel but not the dragging. */
  draggable?: boolean;
  onOpenChange?: (details: VaulOpenChangeDetails) => void;
};

export const vaulParts = {
  root: "sk-vaul",
  handle: "sk-vaul__handle",
} as const;

export type VaulPart = keyof typeof vaulParts;
export type VaulPartClass = (typeof vaulParts)[VaulPart];

export const vaulScope = "vaul";

export const vaulDataParts = {
  root: "root",
  handle: "handle",
} as const;

export const vaulEvents = {
  openChange: "sk:openchange",
} as const;

/*
 * VAUL is published; it took a while because this file's stylesheet lives in `css/patterns/`,
 * which `NOT-PUBLISHED.md` used as the rule for what is a pattern and therefore takes no contract.
 *
 * That was reasoning from WHERE THE CODE SITS, the same mistake `toc` corrected. A pattern has no
 * anatomy of its own; `anchored` is classes and custom properties that six components compose, and
 * none of them "contains an anchored". A Vaul has two parts, four options, an event and a 291-line
 * enhancer, and the drawer page opens by saying "un drawer ES un Vaul". That is a component whose
 * sheet is filed in the wrong folder, not a pattern.
 *
 * What it is NOT is a second Dialog. Both are native `<dialog>`s and the modality is the platform's
 * in both; what Vaul adds is an EDGE and a gesture to dismiss along it. That is why the edge is an
 * option rather than a variant class: it decides layout, and the enhancer reads it to know which
 * axis a drag travels.
 */
export const vaulContract = {
  id: "vaul",
  css: "@skryensya/core/patterns/vaul.css",
  parts: vaulParts,

  options: {
    /** Where the panel is anchored. Logical, so the inline edges follow writing direction. */
    edge: {
      type: "enum",
      values: ["inline-start", "inline-end", "block-end"],
      default: "block-end",
      attr: "data-edge",
    },
    /** Rendered already open, non-modally — the platform's attribute, as on `Dialog`. */
    open: { type: "boolean", default: false, attr: "open", trueValue: "" },
  },

  signatures: {
    Vaul: {
      intent: ["edge-anchored-panel", "bottom-sheet", "drag-to-dismiss", "mobile-navigation"],
      host: { element: "dialog" },
      mount: "data-sk-vaul",
      options: ["edge", "open"],
      slots: {
        /** Whatever the panel holds. Its own semantics are the composition's business. */
        children: { accepts: "node", required: true },
      },
      template: {
        element: "dialog",
        part: "root",
        host: true,
        children: [
          /*
           * Always drawn, always `aria-hidden`. It is the affordance for a gesture that only exists
           * where the enhancer runs, and announcing a grip that may do nothing is worse than
           * silence; the panel closes with Escape and with its own control either way.
           */
          {
            element: "div",
            part: "handle",
            attrs: { "aria-hidden": "true", "data-part": "handle" },
          },
          { slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/vaul", name: "Vaul" },
    },

    /*
     * THE DRAWER: a Vaul that fills its edge instead of sitting against it.
     *
     * `drawer.css` is forty-five lines and ONE class. That is the whole difference, so this is a
     * signature of this family rather than a component of its own: a separate contract would
     * duplicate both parts, both options and the enhancer's mount point to say `sk-drawer`.
     * The docs page has always known; it opens with "un drawer ES un Vaul".
     */
    "Vaul.drawer": {
      intent: ["navigation-drawer", "side-panel", "mobile-navigation"],
      host: { element: "dialog" },
      mount: "data-sk-vaul",
      options: ["edge", "open"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "dialog",
        part: "root",
        also: ["sk-drawer"],
        host: true,
        children: [
          {
            element: "div",
            part: "handle",
            attrs: { "aria-hidden": "true", "data-part": "handle" },
          },
          { slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/vaul", name: "Drawer" },
    },
  },
} as const satisfies ComponentContract;
