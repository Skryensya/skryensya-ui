import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { stepsItems, stepsVerticalItems } from "./data/steps";
import { namePart } from "./annotation-parts";

/** Root, item, marker, label and description: one complete stage named at rest. */
export const stepsAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("stepsPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "steps",
      signature: "Steps",
      slots: { items: stepsItems(t).slice(0, 3) },
    },
    items: [
      namePart(".sk-steps", "block-start"),
      namePart(".sk-steps__item", "inline-start"),
      namePart(".sk-steps__marker", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-steps__label", "inline-end"),
      namePart(".sk-steps__description", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/** Four stages with one current position and an icon as the non-colour completion cue. */
export const stepsTree = (t: Translate): UsageTree => ({
  contract: "steps",
  signature: "Steps",
  slots: { items: stepsItems(t) },
});

/** The same status model pinned to a vertical checkout rail. */
export const stepsVerticalTree = (t: Translate): UsageTree => ({
  contract: "steps",
  signature: "Steps",
  attrs: { "data-orientation": "vertical" },
  slots: { items: stepsVerticalItems(t) },
});
