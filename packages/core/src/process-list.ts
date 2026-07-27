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
