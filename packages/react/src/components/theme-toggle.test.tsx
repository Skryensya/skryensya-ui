import { render, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./theme-toggle.js";

afterEach(() => {
  document.documentElement.removeAttribute("data-scheme");
  document.documentElement.style.colorScheme = "";
});

describe("ThemeToggle", () => {
  it("cycles color mode on the document element", () => {
    const ui = render(<ThemeToggle />);
    const button = ui.getByRole("button");

    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-scheme")).toBe("light");
    expect(button.getAttribute("aria-label")).toBe("Color mode: light");

    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-scheme")).toBe("dark");
  });

  it("keeps every ThemeToggle in sync when one cycles", async () => {
    const ui = render(
      <>
        <ThemeToggle />
        <ThemeToggle size="sm" />
      </>,
    );
    const [first, second] = ui.getAllByRole("button");

    fireEvent.click(first!);
    await waitFor(() => {
      expect(first!.getAttribute("data-scheme")).toBe("light");
      expect(second!.getAttribute("data-scheme")).toBe("light");
    });
    expect(document.documentElement.getAttribute("data-scheme")).toBe("light");

    fireEvent.click(second!);
    await waitFor(() => {
      expect(first!.getAttribute("data-scheme")).toBe("dark");
      expect(second!.getAttribute("data-scheme")).toBe("dark");
    });
    expect(document.documentElement.getAttribute("data-scheme")).toBe("dark");
  });
});
