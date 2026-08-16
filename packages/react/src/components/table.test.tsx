import { fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, TableScroll } from "./table.js";

describe("Table React contracts", () => {
  it("renders the native table structure with every stable part class", () => {
    const ui = render(
      <TableScroll className="overflow" aria-label="Available plans">
        <Table className="plans">
          <TableCaption>Available plans</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeader>Plan</TableHeader>
              <TableHeader>Price</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableHeader scope="row">Starter</TableHeader>
              <TableCell>$9</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Prices exclude tax.</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableScroll>,
    );

    expect(ui.getByRole("table", { name: "Available plans" }).className).toBe("sk-table plans");
    expect(ui.container.querySelector("div")?.className).toBe("sk-table-scroll overflow");
    expect(ui.container.querySelector("div")?.getAttribute("aria-label")).toBe("Available plans");
    expect(ui.container.querySelector("caption")?.className).toBe("sk-table__caption");
    expect(ui.container.querySelector("thead")?.className).toBe("sk-table__head");
    expect(ui.container.querySelector("tbody")?.className).toBe("sk-table__body");
    expect(ui.container.querySelector("tfoot")?.className).toBe("sk-table__foot");
    expect(ui.container.querySelectorAll("tr.sk-table__row")).toHaveLength(3);
    expect(ui.container.querySelectorAll("th.sk-table__header")).toHaveLength(3);
    expect(ui.container.querySelectorAll("td.sk-table__cell")).toHaveLength(2);
  });

  it("defaults headers to columns while preserving explicit row scope", () => {
    const ui = render(
      <Table>
        <TableHead><TableRow><TableHeader>Plan</TableHeader></TableRow></TableHead>
        <TableBody><TableRow><TableHeader scope="row">Starter</TableHeader></TableRow></TableBody>
      </Table>,
    );

    const table = within(ui.container);
    expect(table.getByRole("columnheader", { name: "Plan" }).getAttribute("scope")).toBe("col");
    expect(table.getByRole("rowheader", { name: "Starter" }).getAttribute("scope")).toBe("row");
  });

  it("never renders a column resizer unless `resizableColumns` is on", () => {
    const ui = render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Plan</TableHeader>
            <TableHeader>Price</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableHeader scope="row">Starter</TableHeader>
            <TableCell>$9</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(ui.container.querySelector("[data-sk-column-resizer]")).toBeNull();
  });
});

/** Three columns, so "no resizer after the LAST column" is distinguishable from "no resizer at
 * all", and a row-header (`scope="row"`) in the BODY proves a resizer never leaks onto it. */
function ResizableFixture() {
  return (
    <Table resizableColumns resizeLabel="Redimensionar columna">
      <TableHead>
        <TableRow>
          <TableHeader>Nombre</TableHeader>
          <TableHeader>Tipo</TableHeader>
          <TableHeader>Tamaño</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeader scope="row">index.ts</TableHeader>
          <TableCell>Archivo</TableCell>
          <TableCell>2 KB</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Table column resize", () => {
  const resizers = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>("[data-sk-column-resizer]"));
  const colWidths = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLTableColElement>("col")).map((c) => Number.parseFloat(c.style.width));

  /* jsdom lays nothing out, so the mount-time seed would clamp every column to the min floor — see
   * `treegrid.test.tsx`'s identical stub for the full reasoning. */
  const stubTableWidth = (px: number) => {
    const spy = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockReturnValue({ width: px, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) });
    return () => spy.mockRestore();
  };

  it("renders one resizer per column boundary — never after the last column, never on a body row-header", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handles = resizers(ui.container);
    expect(handles).toHaveLength(2); // three columns, two boundaries
    for (const handle of handles) {
      expect(handle.getAttribute("role")).toBe("separator");
      expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    }
    restore();
  });

  it("names each resizer from the shared label plus its OWN column header", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handles = resizers(ui.container);
    expect(handles[0]!.getAttribute("aria-label")).toBe("Redimensionar columna: Nombre");
    expect(handles[1]!.getAttribute("aria-label")).toBe("Redimensionar columna: Tipo");
    restore();
  });

  it("Left/Right resize by a step, Shift+Left/Right by the coarse step", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handle = resizers(ui.container)[0]!;
    const before = colWidths(ui.container)[0]!;
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(colWidths(ui.container)[0]).toBeCloseTo(before + 16);
    fireEvent.keyDown(handle, { key: "ArrowLeft", shiftKey: true });
    expect(colWidths(ui.container)[0]).toBeCloseTo(before + 16 - 64);
    restore();
  });

  it("Home/End jump to the resized pair's min/max extent, total conserved", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handle = resizers(ui.container)[0]!;
    const [w0, w1, w2] = colWidths(ui.container);
    const total = w0! + w1!;

    fireEvent.keyDown(handle, { key: "End" });
    expect(colWidths(ui.container)[0]).toBeCloseTo(total - 60); // 60 = SPLITTER_MIN_COLUMN_WIDTH
    expect(colWidths(ui.container)[2]).toBe(w2); // the untouched third column never moves

    fireEvent.keyDown(handle, { key: "Home" });
    expect(colWidths(ui.container)[0]).toBeCloseTo(60);
    restore();
  });

  it("Enter (and double-click) resets the pair to an even split", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handle = resizers(ui.container)[0]!;

    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.keyDown(handle, { key: "Enter" });
    const [w0, w1] = colWidths(ui.container);
    expect(w0).toBeCloseTo(w1!);

    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.dblClick(handle);
    const [r0, r1] = colWidths(ui.container);
    expect(r0).toBeCloseTo(r1!);
    restore();
  });

  it("reports its position as a percentage of the pair's travel, not a raw pixel count", () => {
    const restore = stubTableWidth(600);
    const ui = render(<ResizableFixture />);
    const handle = resizers(ui.container)[0]!;
    expect(handle.getAttribute("aria-valuemin")).toBe("0");
    expect(handle.getAttribute("aria-valuemax")).toBe("100");
    fireEvent.keyDown(handle, { key: "End" });
    expect(handle.getAttribute("aria-valuenow")).toBe("100");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(handle.getAttribute("aria-valuenow")).toBe("0");
    restore();
  });
});
