import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination, TablePager, TablePagerBar, TablePagerEnd, TablePagerNav, TablePagerSize, TablePagerStatus } from "./pagination.js";

describe("Pagination", () => {
  it("marks the current page and disables prev/next at the bounds", () => {
    const ui = render(<Pagination page={1} total={10} />);
    expect(ui.getByRole("button", { current: "page" }).textContent).toBe("1");
    expect((ui.getByLabelText("Previous page") as HTMLButtonElement).disabled).toBe(true);
    expect((ui.getByLabelText("Next page") as HTMLButtonElement).disabled).toBe(false);
    expect(ui.getByLabelText("Previous page").classList.contains("sk-interactive")).toBe(true);
    expect(ui.getByLabelText("Previous page").querySelector(".sk-icon")).toBeTruthy();
  });

  it("collapses far pages behind an ellipsis and reports clicks clamped to range", () => {
    const onPageChange = vi.fn();
    const ui = render(<Pagination onPageChange={onPageChange} page={5} total={20} />);
    expect(ui.getAllByText("…").length).toBeGreaterThan(0);

    // The number IS the accessible name: no aria-label restates what the button already says.
    fireEvent.click(ui.getByRole("button", { name: "6" }));
    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it("dispatches sk:paginationpagechange on the root for DOM listeners", () => {
    const onDom = vi.fn();
    const ui = render(<Pagination page={2} total={10} />);
    const root = ui.getByRole("navigation");
    root.addEventListener("sk:paginationpagechange", onDom);
    expect(root.getAttribute("data-page")).toBe("2");
    expect(root.getAttribute("data-total")).toBe("10");

    fireEvent.click(ui.getByRole("button", { name: "3" }));
    expect(onDom).toHaveBeenCalled();
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual({ page: 3 });
  });
});

describe("TablePagerStatus", () => {
  it("announces the visible row range as a polite, atomic live region", () => {
    const ui = render(<TablePagerStatus>1–10 of 42</TablePagerStatus>);
    const status = ui.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.getAttribute("aria-atomic")).toBe("true");
    expect(status.textContent).toBe("1–10 of 42");
  });
});

describe("TablePager", () => {
  function Pager() {
    return (
      <TablePager pageSize={2} statusTemplate="{start}–{end} de {total}" pageLabel="Página">
        <div className="sk-table-scroll">
          <table>
            <tbody>
              {[1, 2, 3, 4, 5].map((n) => (
                <tr key={n}>
                  <td>{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagerBar>
          <TablePagerSize>
            <select aria-label="Filas por página" defaultValue="2">
              <option value="2">2</option>
              <option value="5">5</option>
            </select>
          </TablePagerSize>
          <TablePagerEnd>
            <TablePagerStatus>…</TablePagerStatus>
            <TablePagerNav label="Paginación" />
          </TablePagerEnd>
        </TablePagerBar>
      </TablePager>
    );
  }

  it("actually pages its rows and builds the nav, instead of rendering only the shell", () => {
    const ui = render(<Pager />);
    const hidden = () => [...ui.container.querySelectorAll("tbody tr")].map((row) => (row as HTMLElement).hidden);

    expect(hidden()).toEqual([false, false, true, true, true]);
    expect(ui.container.querySelector("[data-sk-table-pager-status]")?.textContent).toBe("1–2 de 5");
    expect(ui.getByRole("navigation", { name: "Paginación" }).querySelector(".sk-pagination__next svg")).toBeTruthy();

    fireEvent.click(ui.getByLabelText("Página 2"));
    expect(hidden()).toEqual([true, true, false, false, true]);

    const select = ui.getByLabelText("Filas por página") as HTMLSelectElement;
    select.value = "5";
    fireEvent.change(select);
    expect(hidden()).toEqual([false, false, false, false, false]);
  });
});
