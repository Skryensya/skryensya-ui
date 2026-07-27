import { render, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { Loader } from "./loader.js";

describe("Loader", () => {
  it("exposes labelled indeterminate work as a polite status", () => {
    const ui = render(<Loader className="custom" label="Cargando resultados" size="lg" />);
    const loader = ui.getByRole("status", { name: "Cargando resultados" });

    expect(loader.classList).toContain("sk-loader");
    expect(loader.classList).toContain("custom");
    expect(loader.getAttribute("data-size")).toBe("lg");
    expect(loader.getAttribute("data-variant")).toBe("ring");
    expect(loader.getAttribute("data-speed")).toBe("normal");
    expect(loader.getAttribute("aria-hidden")).toBeNull();
  });

  it("writes orthogonal variant and speed axes onto the root", () => {
    const ui = render(<Loader label="Sincronizando" size="sm" speed="slow" variant="bars" />);
    const loader = ui.getByRole("status", { name: "Sincronizando" });

    expect(loader.getAttribute("data-size")).toBe("sm");
    expect(loader.getAttribute("data-speed")).toBe("slow");
    expect(loader.getAttribute("data-variant")).toBe("bars");
  });

  it("stays decorative when the surrounding control already carries the status meaning", () => {
    const ui = render(
      <button type="button">
        Guardando <Loader />
      </button>,
    );
    const loader = ui.container.querySelector(".sk-loader");

    expect(loader?.getAttribute("aria-hidden")).toBe("true");
    expect(loader?.getAttribute("role")).toBeNull();
    expect(within(ui.container).getByRole("button", { name: "Guardando" })).toBeTruthy();
  });

  it("has no serious accessibility violations in labelled and decorative uses", async () => {
    const ui = render(
      <main>
        <Loader label="Cargando contenido" />
        <button type="button">
          Guardando <Loader />
        </button>
      </main>,
    );

    const result = await axe.run(ui.container);
    expect(result.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical")).toHaveLength(0);
  });
});
