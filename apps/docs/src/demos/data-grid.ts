import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";


/** Grid, row and cell: the three levels WAI names for a data grid. */
export const dataGridAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("dataGridPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "data-grid",
      signature: "DataGrid",
      options: { label: t("demo.dataGrid.scoresLabel") },
      children: [
        [t("demo.dataGrid.player"), t("demo.dataGrid.round1"), t("demo.dataGrid.round2")],
        ["Alex", "12", "9"],
      ].map((row) => ({
        contract: "data-grid",
        signature: "DataGridRow",
        children: row.map((cell) => ({
          contract: "data-grid",
          signature: "DataGridCell",
          children: cell,
        })),
      })),
    },
    items: [
      namePart(".sk-data-grid", "block-start"),
      namePart(".sk-data-grid__row", "inline-start"),
      namePart(".sk-data-grid__cell", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * Two demos for the one contract WAI itself treats as a single pattern: a data grid (plain text
 * cells, the roving stop lands on the cell itself) and a layout grid (each cell holds its own
 * button, the roving stop hands off to THAT instead; see `dataGridFocusableSelector`).
 */
export const dataGridScoresTree = (t: Translate): UsageTree => ({
  contract: "data-grid",
  signature: "DataGrid",
  options: { label: t("demo.dataGrid.scoresLabel") },
  children: [
    [t("demo.dataGrid.player"), t("demo.dataGrid.round1"), t("demo.dataGrid.round2")],
    ["Alex", "12", "9"],
    ["Sam", "7", "14"],
  ].map((row) => ({
    contract: "data-grid",
    signature: "DataGridRow",
    children: row.map((cell) => ({
      contract: "data-grid",
      signature: "DataGridCell",
      children: cell,
    })),
  })),
});

const quickAction = (label: string, icon: "edit" | "copy" | "delete" | "more"): UsageTree => ({
  contract: "data-grid",
  signature: "DataGridCell",
  children: {
    contract: "button",
    signature: "Button.action",
    options: { iconOnly: true, size: "sm" },
    attrs: { "aria-label": label },
    children: { contract: "icon", signature: "Icon", options: { name: icon } },
  },
});

export const dataGridActionsTree = (t: Translate): UsageTree => ({
  contract: "data-grid",
  signature: "DataGrid",
  options: { label: t("demo.dataGrid.actionsLabel") },
  children: [
    {
      contract: "data-grid",
      signature: "DataGridRow",
      children: [quickAction(t("demo.dataGrid.edit"), "edit"), quickAction(t("demo.dataGrid.copy"), "copy")],
    },
    {
      contract: "data-grid",
      signature: "DataGridRow",
      children: [quickAction(t("demo.dataGrid.delete"), "delete"), quickAction(t("demo.dataGrid.more"), "more")],
    },
  ],
});
