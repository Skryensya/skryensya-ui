import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state.js";

describe("EmptyState (React)", () => {
  it("renders the title as a heading, with no icon, description or actions by default", () => {
    const ui = render(<EmptyState title="Sin resultados" />);

    expect(ui.getByRole("heading", { name: "Sin resultados" })).toBeTruthy();
    expect(ui.container.querySelector(".sk-empty-state__icon")).toBeNull();
    expect(ui.container.querySelector(".sk-empty-state__description")).toBeNull();
    expect(ui.container.querySelector(".sk-empty-state__actions")).toBeNull();
  });

  it("renders an icon, hidden from assistive tech, only when given", () => {
    const ui = render(<EmptyState title="Sin resultados" icon={<svg data-testid="icon" />} />);
    const icon = ui.container.querySelector(".sk-empty-state__icon")!;
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.querySelector("[data-testid='icon']")).not.toBeNull();
  });

  it("renders a description only when given", () => {
    const ui = render(<EmptyState title="Sin resultados" description="Probá otra búsqueda." />);
    expect(ui.getByText("Probá otra búsqueda.")).toBeTruthy();
  });

  it("renders actions only when given", () => {
    const ui = render(
      <EmptyState title="Sin resultados" actions={<button>Reintentar</button>} />,
    );
    expect(ui.getByRole("button", { name: "Reintentar" })).toBeTruthy();
  });
});
