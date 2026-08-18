import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination, TablePagerStatus } from "./pagination.js";

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
