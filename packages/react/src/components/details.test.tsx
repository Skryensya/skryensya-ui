import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Details, DetailsGroup } from "./details.js";

/*
 * Details is markup and nothing else: `<details>` opens, closes, takes focus and is announced with
 * no script, and a shared `name` makes the BROWSER keep one open at a time. So the tests are about
 * the anatomy and about what is deliberately NOT here: no machine, no state of its own.
 */
describe("Details", () => {
  it("composes the platform's own two pieces", () => {
    const ui = render(
      <Details>
        <Details.Summary>Requisitos</Details.Summary>
        <Details.Content>Node 24</Details.Content>
      </Details>,
    );

    const details = ui.container.querySelector("details")!;
    expect(details.classList.contains("sk-details")).toBe(true);
    expect(details.open).toBe(false);

    const summary = ui.container.querySelector("summary")!;
    expect(summary.classList.contains("sk-details__summary")).toBe(true);
    expect(summary.classList.contains("sk-interactive")).toBe(true);
    expect(ui.getByText("Node 24").classList).toContain("sk-details__content");
  });

  it("bakes in the disclosure mark the browser's own marker no longer draws", () => {
    const ui = render(
      <Details>
        <Details.Summary>Requisitos</Details.Summary>
        <Details.Content>Node 24</Details.Content>
      </Details>,
    );

    // Both marks ship and the stylesheet keys the swap on `[open]`: no JS of this component's own.
    const indicator = ui.container.querySelector(".sk-details__indicator")!;
    expect(indicator.getAttribute("aria-hidden")).toBe("true");
    expect(indicator.querySelector('[data-state="closed"] svg')?.getAttribute("data-icon")).toBe(
      "chevron-down",
    );
    expect(indicator.querySelector('[data-state="open"] svg')?.getAttribute("data-icon")).toBe(
      "chevron-up",
    );
  });

  it("leaves opening to the platform", () => {
    const ui = render(
      <Details>
        <Details.Summary>Requisitos</Details.Summary>
        <Details.Content>Node 24</Details.Content>
      </Details>,
    );
    const details = ui.container.querySelector("details")!;

    // jsdom implements the toggle, and this component contributes nothing to it: React never
    // re-renders here, the element's own state moves.
    fireEvent.click(ui.container.querySelector("summary")!);
    expect(details.open).toBe(true);
  });

  it("hands the one-at-a-time job to the browser through a shared name", () => {
    const ui = render(
      <DetailsGroup>
        <Details name="faq" open>
          <Details.Summary>Uno</Details.Summary>
          <Details.Content>Primero</Details.Content>
        </Details>
        <Details name="faq">
          <Details.Summary>Dos</Details.Summary>
          <Details.Content>Segundo</Details.Content>
        </Details>
      </DetailsGroup>,
    );

    const group = ui.container.querySelector("section")!;
    expect(group.classList.contains("sk-details-group")).toBe(true);
    // The shared name IS the coordinator: there is no accordion machine behind this.
    expect(
      Array.from(ui.container.querySelectorAll("details")).map((details) =>
        details.getAttribute("name"),
      ),
    ).toEqual(["faq", "faq"]);
    expect(ui.container.querySelectorAll("details[open]")).toHaveLength(1);
  });

  it("joins a consumer's className instead of replacing the part's", () => {
    const ui = render(
      <DetailsGroup className="faq">
        <Details className="destacado">
          <Details.Summary className="titulo">Requisitos</Details.Summary>
          <Details.Content className="cuerpo">Node 24</Details.Content>
        </Details>
      </DetailsGroup>,
    );

    expect(ui.container.querySelector("section")?.className).toBe("sk-details-group faq");
    expect(ui.container.querySelector("details")?.className).toBe("sk-details destacado");
    expect(ui.container.querySelector("summary")?.className).toBe(
      "sk-details__summary sk-interactive titulo",
    );
    expect(ui.getByText("Node 24").className).toBe("sk-details__content cuerpo");
  });
});
