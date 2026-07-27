import { anchorPlacements, type AnchorPlacement } from "./anchored.js";

/** El vocabulario de colocación es el del pattern Anclaje (ADR-25); estos son sus alias acá. */
export type PopoverPlacement = AnchorPlacement;

export const popoverPlacements = anchorPlacements;

export const popoverParts = {
  root: "sk-popover",
  trigger: "sk-popover__trigger",
  positioner: "sk-popover__positioner",
  content: "sk-popover__content",
  title: "sk-popover__title",
  description: "sk-popover__description",
  close: "sk-popover__close",
} as const;

export const popoverAttrs = {
  root: "data-sk-popover",
  trigger: "data-sk-popover-trigger",
  positioner: "data-sk-popover-positioner",
  content: "data-sk-popover-content",
  placement: "data-sk-placement",
} as const;
