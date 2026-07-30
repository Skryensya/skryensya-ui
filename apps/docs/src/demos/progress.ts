import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
