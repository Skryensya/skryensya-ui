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
