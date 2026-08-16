import { dataGridFocusableSelector, resolveDataGridKey } from "@skryensya/core/data-grid";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const selector = {
  root: "[data-sk-data-grid]",
  row: '[role="row"]',
  cell: '[role="gridcell"]',
} as const;

type CellEntry = {
  cell: HTMLElement;
  /** The roving-tabindex UNIT: the cell's own interactive descendant if it has exactly the kind
   *  WAI's own pattern describes ("preserve the semantics of their descendant elements"), or the
   *  cell itself when it holds none. */
  target: HTMLElement;
};

function readRows(root: HTMLElement): CellEntry[][] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector.row)).map((row) =>
    Array.from(row.querySelectorAll<HTMLElement>(selector.cell)).map((cell) => ({
      cell,
      target: cell.querySelector<HTMLElement>(dataGridFocusableSelector) ?? cell,
    })),
  );
}

function connect(root: HTMLElement): () => void {
  const rows = readRows(root);
  const rowCount = rows.length;
  const colCountOf = (row: number) => rows[row]?.length ?? 0;
  const wrapRows = root.hasAttribute("data-wrap-rows");
  const wrapCols = root.hasAttribute("data-wrap-cols");

  const entryAt = (row: number, col: number): CellEntry | undefined => rows[row]?.[col];

  const applyTabindex = (focus: { row: number; col: number }) => {
    for (const row of rows) for (const entry of row) entry.target.tabIndex = -1;
    const entry = entryAt(focus.row, focus.col);
    if (entry) entry.target.tabIndex = 0;
  };

  const currentFocus = (): { row: number; col: number } => {
    const active = root.ownerDocument?.activeElement;
    for (let row = 0; row < rows.length; row++) {
      const col = rows[row]!.findIndex((entry) => entry.target === active);
      if (col !== -1) return { row, col };
    }
    for (let row = 0; row < rows.length; row++) {
      const col = rows[row]!.findIndex((entry) => entry.target.tabIndex === 0);
      if (col !== -1) return { row, col };
    }
    return { row: 0, col: 0 };
  };

  const moveFocus = (focus: { row: number; col: number }) => {
    applyTabindex(focus);
    entryAt(focus.row, focus.col)?.target.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || !rowCount) return;
    const focus = currentFocus();
    const action = resolveDataGridKey({
      key: event.key,
      ctrl: event.ctrlKey || event.metaKey,
      focus,
      rowCount,
      colCountOf,
      wrapRows,
      wrapCols,
    });
    if (action.kind === "none") return;
    event.preventDefault();
    moveFocus(action.focus);
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    for (let row = 0; row < rows.length; row++) {
      const col = rows[row]!.findIndex((entry) => entry.cell.contains(target));
      if (col !== -1) {
        moveFocus({ row, col });
        return;
      }
    }
  };

  applyTabindex({ row: 0, col: 0 });
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("click", onClick);
  return () => {
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("click", onClick);
  };
}

export const mountDataGrid = createConnectMount({
  key: "data-grid",
  rootSelector: selector.root,
  connect,
});
