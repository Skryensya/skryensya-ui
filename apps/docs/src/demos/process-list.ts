import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The three steps of installing the library, as instructions rather than as prose.
 *
 * A tree was written for this page once and deleted, because one step embeds a CODE BLOCK and
 * `code-preview` had no contract then — emitting the list would have dropped it. It has one now, so
 * the whole demo composes: an ordered list of steps, each with a title and a body that can hold
 * anything the system publishes.
 *
 * The third step ends with a Badge and a Link side by side, which is the point of the example: a
 * step is not a paragraph, it is a place where the outcome of the step can be shown.
 */
export const processListTree = (t: Translate): UsageTree => ({
  contract: "process-list",
  signature: "ProcessList",
  attrs: { "aria-label": t("demo.processList.label") },
  children: [
    {
      contract: "process-list",
      signature: "ProcessListItem",
      slots: {
        title: t("demo.processList.install.title"),
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.processList.install.body"),
            },
            {
              contract: "code-preview",
              signature: "CodePreview",
              slots: {
                label: "terminal",
                children: "pnpm add @skryensya/core @skryensya/react",
              },
            },
          ],
        },
      },
    },
    {
      contract: "process-list",
      signature: "ProcessListItem",
      slots: {
        title: t("demo.processList.import.title"),
        children: {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: t("demo.processList.import.body"),
        },
      },
    },
    {
      contract: "process-list",
      signature: "ProcessListItem",
      slots: {
        title: t("demo.processList.render.title"),
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.processList.render.body"),
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm" },
              children: [
                {
                  contract: "badge",
                  signature: "Badge",
                  options: { tone: "success" },
                  children: t("demo.processList.done"),
                },
                {
                  contract: "typography",
                  signature: "Link",
                  attrs: { href: "/componentes/process-list" },
                  children: t("demo.processList.docs"),
                },
              ],
            },
          ],
        },
      },
    },
  ],
});
