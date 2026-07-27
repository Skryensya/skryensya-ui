export const tableParts = {
  scroll: "sk-table-scroll",
  root: "sk-table",
  caption: "sk-table__caption",
  head: "sk-table__head",
  foot: "sk-table__foot",
  body: "sk-table__body",
  row: "sk-table__row",
  header: "sk-table__header",
  cell: "sk-table__cell",
} as const;

export type TablePart = keyof typeof tableParts;
export type TablePartClass = (typeof tableParts)[TablePart];
