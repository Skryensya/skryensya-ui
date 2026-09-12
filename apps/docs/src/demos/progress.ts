import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";


/** Track and fill: the two painted parts of a determinate Progress. */
export const progressAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("progressPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "progress",
      signature: "Progress",
      options: { value: 68, label: t("demo.progress.upload") },
      attrs: { style: "inline-size: min(100%, 16rem)" },
    },
    items: [
      namePart(".sk-progress", "block-start"),
      namePart(".sk-progress__bar", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * Three bars, one per tone, stacked.
 *
 * The Stack is what makes this demo need `component-preview.css`'s stretch rule: a Progress declares
 * `inline-size: 100%`, so it contributes no width of its own and the stage's wrapping flex row
 * collapses the whole column to zero. Worth knowing before writing another tree like this one.
 */
export const progressTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "progress",
      signature: "Progress",
      options: { value: 68, label: t("demo.progress.upload") },
    },
    {
      contract: "progress",
      signature: "Progress",
      options: { value: 100, tone: "success", label: t("demo.progress.complete") },
    },
    {
      contract: "progress",
      signature: "Progress",
      options: { value: 24, tone: "danger", label: t("demo.progress.quota") },
    },
  ],
});
