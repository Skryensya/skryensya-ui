import { render, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { LOADER_TICKS, loaderTicks, type LoaderVariant } from "@skryensya/core/loader";
import { Loader, LoaderStatus } from "./loader.js";

describe("Loader", () => {
  it("exposes labelled indeterminate work as a polite status", () => {
    const ui = render(<Loader className="custom" label="Cargando resultados" size="lg" />);
    const loader = ui.getByRole("status", { name: "Cargando resultados" });

    expect(loader.classList).toContain("sk-loader");
    expect(loader.classList).toContain("custom");
    expect(loader.hasAttribute("data-sk-loader")).toBe(true);
    expect(loader.getAttribute("data-size")).toBe("lg");
    expect(loader.getAttribute("data-variant")).toBe("ring");
    expect(loader.getAttribute("data-speed")).toBe("normal");
    expect(loader.getAttribute("aria-hidden")).toBeNull();
    expect(loader.getAttribute("aria-atomic")).toBe("true");
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

  /*
   * The count comes from core so that authored markup and React cannot disagree about it. These
   * assert the two halves that actually break: that a staggered variant gets the marks its design
   * needs, and that a pseudo-element variant gets NONE, since a stray child there would be painted
   * as a full-size layer over the spinner.
   */
  it("gives a staggered design one real mark per tick, since a stagger cannot live on two pseudo-elements", () => {
    const counts = Object.entries(LOADER_TICKS).map(([variant, expected]) => {
      const ui = render(<Loader variant={variant as LoaderVariant} />);
      const loader = ui.container.querySelector(".sk-loader");

      return [variant, loader?.querySelectorAll(".sk-loader__tick").length, expected];
    });

    expect(counts).toEqual([
      ["spokes", 12, 12],
      ["ticks", 8, 8],
      ["compass", 4, 4],
      ["beads", 8, 8],
    ]);
  });

  it("leaves a pseudo-element design with no children at all", () => {
    const pseudo = ["ring", "sweep", "bars", "dots", "arc", "comet", "orbit", "clock"] as const;

    // A stray child here would paint as a full-size layer on top of the spinner, not beside it.
    for (const variant of pseudo) {
      const ui = render(<Loader variant={variant} />);

      expect(loaderTicks(variant)).toBe(0);
      expect(ui.container.querySelector(".sk-loader")?.children).toHaveLength(0);
    }
  });

  it("announces a skeleton screen's wait without drawing anything", () => {
    const ui = render(<LoaderStatus label="Cargando artículos" />);
    const status = ui.getByRole("status", { name: "Cargando artículos" });

    expect(status.classList).toContain("sk-visually-hidden");
    expect(status.getAttribute("aria-atomic")).toBe("true");
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
