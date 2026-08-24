import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { treegridColumns, treegridRows } from "./data/treegrid";
import { treegridStressColumns, treegridStressRows } from "./data/treegrid-stress";

/*
 * `TreegridRow` is authored FLAT, in document order: never nested inside another `TreegridRow`, a
 * `<tr>` cannot contain a `<tr>` (see `packages/core/src/treegrid.ts`'s file banner). `level` /
 * `setSize` / `posInset` are the author's own facts about where a row sits in the hierarchy; nothing
 * here derives them from a nested shape the way `TreeView`'s recursive `items` collection does.
 */
const headerRow = (columns: readonly string[]): UsageTree => ({
  contract: "treegrid",
  signature: "TreegridHeadRow",
  children: columns.map((label) => ({
    contract: "treegrid",
    signature: "TreegridColumnHeader",
    children: label,
  })),
});

/*
 * Shared by every treegrid demo composition. The minimal inbox AND the stress-test file explorer
 * below are the same shape, just fed a different `columns`/`rows`/`label`, so the tree-building logic
 * (flat rows, `expanded` omitted entirely on a leaf) is written once.
 */
function treegridTree(
  label: string,
  columns: readonly string[],
  rows: readonly {
    readonly value: string;
    readonly level: number;
    readonly setSize: number;
    readonly posInset: number;
    readonly expanded?: boolean;
    readonly cells: readonly string[];
  }[],
  options: { readonly resizableColumns?: boolean; readonly resizeLabel?: string } = {},
): UsageTree {
  return {
    contract: "treegrid",
    signature: "TreegridScroll",
    children: {
      contract: "treegrid",
      signature: "Treegrid",
      options: { label, ...options },
      children: [
        {
          contract: "treegrid",
          signature: "TreegridHead",
          children: headerRow(columns),
        },
        {
          contract: "treegrid",
          signature: "TreegridBody",
          children: rows.map((row) => ({
            contract: "treegrid",
            signature: "TreegridRow",
            options: {
              value: row.value,
              level: row.level,
              setSize: row.setSize,
              posInset: row.posInset,
              // A leaf never authors `expanded` at all. Its absence, not `false`, is what marks it a
              // leaf (see the option's own doc comment in `treegrid.ts`).
              ...("expanded" in row ? { expanded: row.expanded } : {}),
            },
            children: row.cells.map((cell) => ({
              contract: "treegrid",
              signature: "TreegridCell",
              children: cell,
            })),
          })),
        },
      ],
    },
  };
}

export const treegridInboxTree = (t: Translate): UsageTree =>
  treegridTree(t("demo.treegrid.label"), treegridColumns(t), treegridRows(t));

/*
 * THE STRESS COMPOSITION. Four columns, seven levels deep, long content that forces ellipsis in
 * more than one column, and two collapsed branches (one at the root, one nested) at once. See
 * `data/treegrid-stress.ts`'s own banner for why a file explorer is the natural shape for this.
 */
export const treegridStressTree = (t: Translate): UsageTree =>
  treegridTree(t("demo.treegridStress.label"), treegridStressColumns(t), treegridStressRows(t), {
    resizableColumns: true,
    resizeLabel: t("demo.treegridStress.resizeLabel"),
  });
