import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProcessList, ProcessListItem } from "./process-list.js";

describe("ProcessList", () => {
  it("renders a native ordered sequence of instructions", () => {
    const ui = render(
      <ProcessList aria-label="Instalación">
        <ProcessListItem title="Instala el paquete">Contenido del primer paso</ProcessListItem>
        <ProcessListItem title="Importa los estilos">Contenido del segundo paso</ProcessListItem>
      </ProcessList>,
    );

    const list = ui.getByRole("list", { name: "Instalación" });
    expect(list.tagName).toBe("OL");
    expect(list.className).toContain("sk-process-list");
    expect(ui.getAllByRole("listitem")).toHaveLength(2);
  });

  it("keeps each title and arbitrary step content inside its item", () => {
    const ui = render(
      <ProcessList>
        <ProcessListItem className="setup" data-phase="setup" title="Instala el paquete">
          <p>Usa el gestor de paquetes del proyecto.</p>
          <code>pnpm add @skryensya/core</code>
        </ProcessListItem>
      </ProcessList>,
    );

    const item = ui.getByRole("listitem");
    expect(item.className).toContain("sk-process-list__item");
    expect(item.className).toContain("setup");
    expect(item.getAttribute("data-phase")).toBe("setup");
    expect(ui.getByText("Instala el paquete").className).toContain("sk-process-list__title");
    expect(ui.getByText("pnpm add @skryensya/core").tagName).toBe("CODE");
  });
});
