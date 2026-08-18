import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataGrid, DataGridCell, DataGridRow } from "./data-grid.js";

/*
 * Same fixture shape as the vanilla suite: row 0 is Alice + her own remove button, row 1 is Bob +
 * his remove button + an extra buttonless cell (a ragged grid).
 */
function Fixture(props: { wrapRows?: boolean; wrapCols?: boolean } = {}) {
  return (
    <DataGrid label="Destinatarios" wrapCols={props.wrapCols} wrapRows={props.wrapRows}>
      <DataGridRow>
        <DataGridCell row={0}>Alice</DataGridCell>
        <DataGridCell row={0}>
          <button type="button">Quitar</button>
        </DataGridCell>
      </DataGridRow>
      <DataGridRow>
        <DataGridCell row={1}>Bob</DataGridCell>
        <DataGridCell row={1}>
          <button type="button">Quitar</button>
        </DataGridCell>
        <DataGridCell row={1}>Nota</DataGridCell>
      </DataGridRow>
    </DataGrid>
  );
}

const cellText = (ui: ReturnType<typeof render>, text: string) =>
  Array.from(ui.container.querySelectorAll<HTMLElement>('[role="gridcell"]')).find(
    (el) => el.textContent === text,
  )!;
const removeButtons = (ui: ReturnType<typeof render>) => ui.container.querySelectorAll<HTMLButtonElement>("button");

describe("DataGrid React contracts", () => {
  it("sets role=grid/row/gridcell and names the grid", () => {
    const ui = render(<Fixture />);
    const grid = ui.getByRole("grid", { name: "Destinatarios" });
    expect(grid.tagName).toBe("DIV");
    expect(ui.getAllByRole("row")).toHaveLength(2);
  });

  it("hands the roving stop to a cell's OWN interactive descendant, not the cell div", () => {
    const ui = render(<Fixture />);
    cellText(ui, "Alice").focus();
    fireEvent.keyDown(ui.getByRole("grid"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(removeButtons(ui)[0]);
  });

  it("derives a cell's row from its own DataGridRow's position when none is authored", () => {
    // No `row` prop anywhere: the common, contract-driven composition, where a cell states only
    // its content. Without the structural default, no cell can ever be the roving-tabindex stop.
    const ui = render(
      <DataGrid label="Destinatarios">
        <DataGridRow>
          <DataGridCell>ana@ejemplo.cl</DataGridCell>
          <DataGridCell>bruno@ejemplo.cl</DataGridCell>
        </DataGridRow>
      </DataGrid>,
    );
    const first = cellText(ui, "ana@ejemplo.cl");
    expect(first.tabIndex).toBe(0);
    expect(cellText(ui, "bruno@ejemplo.cl").tabIndex).toBe(-1);
  });

  it("clamps into a shorter row's last real cell on vertical movement (ragged grid)", () => {
    const ui = render(<Fixture />);
    removeButtons(ui)[0]!.focus(); // row 0, col 1
    fireEvent.keyDown(ui.getByRole("grid"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(removeButtons(ui)[1]); // row 1, col 1
    fireEvent.keyDown(ui.getByRole("grid"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(cellText(ui, "Nota")); // row 1, col 2
    fireEvent.keyDown(ui.getByRole("grid"), { key: "ArrowUp" });
    // Row 0 only has 2 cells — clamped, not an out-of-range column.
    expect(document.activeElement).toBe(removeButtons(ui)[0]);
  });

  it("does not wrap by default", () => {
    const plain = render(<Fixture />);
    removeButtons(plain)[0]!.focus();
    fireEvent.keyDown(plain.getByRole("grid"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(removeButtons(plain)[0]);
  });

  it("wraps columns into the next row when wrapCols is set", () => {
    const wrapped = render(<Fixture wrapCols />);
    removeButtons(wrapped)[0]!.focus();
    fireEvent.keyDown(wrapped.getByRole("grid"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(cellText(wrapped, "Bob"));
  });

  it("Home/End move within the row; Ctrl+Home/End jump the whole grid", () => {
    const ui = render(<Fixture />);
    const grid = ui.getByRole("grid");
    cellText(ui, "Nota").focus();
    fireEvent.keyDown(grid, { key: "Home" });
    expect(document.activeElement).toBe(cellText(ui, "Bob"));
    fireEvent.keyDown(grid, { key: "End" });
    expect(document.activeElement).toBe(cellText(ui, "Nota"));
    fireEvent.keyDown(grid, { key: "Home", ctrlKey: true });
    expect(document.activeElement).toBe(cellText(ui, "Alice"));
  });
});
