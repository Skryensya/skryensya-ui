export const tableParts = {
  scroll: "ds-table-scroll",
  root: "ds-table",
  caption: "ds-table__caption",
  head: "ds-table__head",
  foot: "ds-table__foot",
  body: "ds-table__body",
  row: "ds-table__row",
  header: "ds-table__header",
  cell: "ds-table__cell",
} as const;

export type TablePart = keyof typeof tableParts;
export type TablePartClass = (typeof tableParts)[TablePart];
