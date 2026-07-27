import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./pagination.js";

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

    fireEvent.click(ui.getByLabelText("Page 6"));
    expect(onPageChange).toHaveBeenCalledWith(6);
  });
});
