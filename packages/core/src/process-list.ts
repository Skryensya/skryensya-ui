import type { ComponentContract } from "./contract.js";

/*
 * PROCESS LIST, a static ordered sequence of instructions with rich step content.
 *
 * Order is the only state: the native `<ol>` carries the sequence while the visual marker and
 * connector make it scannable. Process List never models progress; complete / current / upcoming
 * belong to Steps.
 */
export const processListParts = {
  root: "sk-process-list",
  item: "sk-process-list__item",
  content: "sk-process-list__content",
  title: "sk-process-list__title",
} as const;

export type ProcessListPart = keyof typeof processListParts;
export type ProcessListPartClass = (typeof processListParts)[ProcessListPart];

/*
 * A numbered set of instructions. The numbers come from `<ol>` and express ORDER, never progress:
 * there is no complete, current or upcoming here, and that absence is the whole difference from
 * Steps. A process list whose items had status would be a Steps with the content in the wrong place.
 */
export const processListContract = {
  id: "process-list",
  category: "content",
  css: "@skryensya/core/components/process-list.css",
  parts: processListParts,
  hooks: [
    "--sk-process-list-connector-color",
    "--sk-process-list-connector-size",
    "--sk-process-list-content-gap",
    "--sk-process-list-fg",
    "--sk-process-list-item-gap",
    "--sk-process-list-item-padding-x",
    "--sk-process-list-item-padding-y",
    "--sk-process-list-marker-bg",
    "--sk-process-list-marker-border-color",
    "--sk-process-list-marker-fg",
    "--sk-process-list-marker-ring-color",
    "--sk-process-list-marker-size",
    "--sk-process-list-title-fg",
    "--sk-process-list-title-font-size",
    "--sk-process-list-title-font-weight",
  ],
  options: {},

  signatures: {
    ProcessList: {
      intent: ["instructions", "how-to", "ordered-steps-to-follow"],
      host: { element: "ol" },
      options: [],
      slots: { children: { accepts: "signature", required: true, of: ["ProcessListItem"] } },
      /* `role="list"`: `list-style: none` (process-list.css) drops the implicit list role in
       * Safari/VoiceOver. */
      template: { element: "ol", part: "root", host: true, attrs: { role: "list" }, slot: "children" },
      react: { from: "@skryensya/react/process-list", name: "ProcessList" },
    },

    ProcessListItem: {
      intent: ["one-instruction", "one-step-of-a-how-to"],
      host: { element: "li" },
      options: [],
      parents: ["ProcessList"],
      slots: {
        title: { accepts: "text", required: true },
        children: { accepts: "node" },
      },
      template: {
        element: "li",
        part: "item",
        host: true,
        children: [
          {
            element: "div",
            part: "content",
            children: [
              { element: "span", part: "title", slot: "title" },
              { slot: "children" },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/process-list", name: "ProcessListItem" },
    },
  },
} as const satisfies ComponentContract;
