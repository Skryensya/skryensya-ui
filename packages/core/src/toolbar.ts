export type ToolbarOrientation = "horizontal" | "vertical";

export const toolbarParts = {
  root: "sk-toolbar",
  group: "sk-toolbar__group",
  separator: "sk-toolbar__separator",
} as const;

export const toolbarAttrs = {
  root: "data-sk-toolbar",
  item: "data-sk-toolbar-item",
} as const;
