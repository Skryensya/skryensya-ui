import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { segmentedItems } from "./data/segmented";
import { namePart } from "./annotation-parts";


/** Root, sliding indicator and options: the segmented control at rest. */
export const segmentedAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("segmentedPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "segmented",
      signature: "Segmented",
      options: { value: "day", label: t("demo.segmented.label") },
      slots: { items: segmentedItems(t) },
    },
    items: [
      namePart(".sk-segmented", "block-start"),
      namePart(".sk-segmented__indicator", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-segmented__option", "inline-end"),
    ],
  },
});

/** Three ranges, the first selected. */
export const segmentedTree = (t: Translate): UsageTree => ({
  contract: "segmented",
  signature: "Segmented",
  options: { value: "day", label: t("demo.segmented.label") },
  slots: { items: segmentedItems(t) },
});
