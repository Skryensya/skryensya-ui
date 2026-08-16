import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountDataGrid } from "./data-grid.js";

/*
 * A "layout grid" fixture — WAI's own recipient-pill example shape: each row is a name plus its own
 * remove button, so the roving-tabindex unit for that second cell is the BUTTON, not the cell div
 * around it. Row 1 has a THIRD, buttonless cell to exercise a ragged (uneven) grid.
 */
function markup({ wrapRows = false, wrapCols = false }: { wrapRows?: boolean; wrapCols?: boolean } = {}) {
  document.body.innerHTML = `<div class="sk-data-grid" data-sk-data-grid aria-label="Destinatarios" role="grid" ${wrapRows ? 'data-wrap-rows=""' : ""} ${wrapCols ? 'data-wrap-cols=""' : ""}>
    <div role="row">
      <div role="gridcell">Alice</div>
      <button type="button" role="gridcell" data-remove="alice">Quitar</button>
    </div>
    <div role="row">
      <div role="gridcell">Bob</div>
      <button type="button" role="gridcell" data-remove="bob">Quitar</button>
      <div role="gridcell">Nota</div>
    </div>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-data-grid]")!;
  expect(mountDataGrid(document)).toBe(1);
  return root;
}

const cellText = (text: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="gridcell"]')).find((el) => el.textContent === text)!;
const removeButton = (name: string) => document.querySelector<HTMLButtonElement>(`[data-remove="${name}"]`)!;

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-data-grid]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("DataGrid vanilla enhancer", () => {
  it("gives exactly one unit a tab stop on mount — the first cell", () => {
    markup();
    const stops = Array.from(document.querySelectorAll<HTMLElement>('[role="gridcell"], button'))
      .filter((el) => el.tabIndex === 0);
    expect(stops).toEqual([cellText("Alice")]);
  });

  it("hands the roving stop to a cell's OWN interactive descendant, not the cell div around it", () => {
    const root = markup();
    cellText("Alice").focus();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    // The second cell in row 0 is the remove button itself — it, not a wrapping div, gets focus.
    expect(document.activeElement).toBe(removeButton("alice"));
    expect(removeButton("alice").tabIndex).toBe(0);
  });

  it("Down Arrow clamps into a shorter row's last real cell (ragged grid)", () => {
    const root = markup();
    removeButton("alice").focus(); // row 0, col 1
    fireEvent.keyDown(root, { key: "ArrowDown" });
    expect(document.activeElement).toBe(removeButton("bob")); // row 1, col 1 exists too
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(document.activeElement).toBe(cellText("Nota")); // row 1, col 2
    fireEvent.keyDown(root, { key: "ArrowUp" });
    // Row 0 only has 2 cells — clamped to its last one, not an out-of-range col 2.
    expect(document.activeElement).toBe(removeButton("alice"));
  });

  it("does not wrap past the grid's edges by default", () => {
    const root = markup();
    cellText("Alice").focus();
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(cellText("Alice"));
    fireEvent.keyDown(root, { key: "ArrowUp" });
    expect(document.activeElement).toBe(cellText("Alice"));
  });

  it("wraps columns into the next row when data-wrap-cols is set", () => {
    const root = markup({ wrapCols: true });
    removeButton("alice").focus(); // row 0, last cell
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(document.activeElement).toBe(cellText("Bob")); // row 1, first cell
  });

  it("Home/End move within the row; Ctrl+Home/End jump the whole grid", () => {
    const root = markup();
    cellText("Nota").focus();
    fireEvent.keyDown(root, { key: "Home" });
    expect(document.activeElement).toBe(cellText("Bob"));
    fireEvent.keyDown(root, { key: "End" });
    expect(document.activeElement).toBe(cellText("Nota"));
    fireEvent.keyDown(root, { key: "Home", ctrlKey: true });
    expect(document.activeElement).toBe(cellText("Alice"));
  });

  it("clicking a cell moves the roving stop there", () => {
    const root = markup();
    void root;
    fireEvent.click(cellText("Nota"));
    expect(document.activeElement).toBe(cellText("Nota"));
    expect(cellText("Alice").tabIndex).toBe(-1);
  });
});
