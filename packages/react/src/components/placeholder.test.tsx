import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { Placeholder } from "./placeholder.js";

describe("Placeholder", () => {
  it("renders decorative geometry and forwards layout classes", () => {
    const ui = render(
      <main aria-busy="true">
        <Placeholder className="title-line" />
        <Placeholder shape="block" />
        <Placeholder shape="circle" />
      </main>,
    );
    const placeholders = ui.container.querySelectorAll(".sk-placeholder");

    expect(placeholders).toHaveLength(3);
    expect(placeholders[0]?.classList).toContain("title-line");
    expect(placeholders[0]?.getAttribute("data-shape")).toBe("text");
    expect(placeholders[1]?.getAttribute("data-shape")).toBe("block");
    expect(placeholders[2]?.getAttribute("data-shape")).toBe("circle");
    expect([...placeholders].every((node) => node.getAttribute("aria-hidden") === "true")).toBe(true);
  });

  it("has no serious accessibility violations inside a labelled busy region", async () => {
    const ui = render(
      <section aria-busy="true" aria-label="Cargando publicación">
        <Placeholder shape="block" />
        <Placeholder />
      </section>,
    );

    const result = await axe.run(ui.container);
    expect(
      result.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      ),
    ).toHaveLength(0);
  });
});
