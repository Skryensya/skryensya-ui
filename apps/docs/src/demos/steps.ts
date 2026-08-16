import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { stepsItems, stepsVerticalItems } from "./data/steps";

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
