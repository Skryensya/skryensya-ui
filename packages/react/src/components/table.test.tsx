import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

    expect(ui.getByRole("table", { name: "Available plans" }).className).toBe("ds-table plans");
    expect(ui.container.querySelector("div")?.className).toBe("ds-table-scroll overflow");
    expect(ui.container.querySelector("div")?.getAttribute("aria-label")).toBe("Available plans");
    expect(ui.container.querySelector("caption")?.className).toBe("ds-table__caption");
    expect(ui.container.querySelector("thead")?.className).toBe("ds-table__head");
    expect(ui.container.querySelector("tbody")?.className).toBe("ds-table__body");
    expect(ui.container.querySelector("tfoot")?.className).toBe("ds-table__foot");
    expect(ui.container.querySelectorAll("tr.ds-table__row")).toHaveLength(3);
    expect(ui.container.querySelectorAll("th.ds-table__header")).toHaveLength(3);
    expect(ui.container.querySelectorAll("td.ds-table__cell")).toHaveLength(2);
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
});
