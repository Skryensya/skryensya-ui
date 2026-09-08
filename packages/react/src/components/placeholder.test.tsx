import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { PLACEHOLDER_MAX_LINES, placeholderLines } from "@skryensya/core/placeholder";
import {
  Placeholder,
  PlaceholderBlock,
  PlaceholderCircle,
  PlaceholderParagraph,
} from "./placeholder.js";

describe("core: placeholder decisions", () => {
  it("clamps a line count to something renderable", () => {
    expect(placeholderLines(3)).toBe(3);
    // A paragraph of zero lines is not a paragraph, and a negative one is a caller's bug reaching
    // the DOM as `Array.from({ length: -3 })`.
    expect(placeholderLines(0)).toBe(1);
    expect(placeholderLines(-3)).toBe(1);
    expect(placeholderLines(2.7)).toBe(2);
    expect(placeholderLines(Number.NaN)).toBe(1);
    // Past the ceiling a skeleton stops predicting a paragraph and becomes a wall of grey.
    expect(placeholderLines(500)).toBe(PLACEHOLDER_MAX_LINES);
  });
});

describe("Placeholder", () => {
  it("sizes a line by the type role it replaces, not by a hand-written length", () => {
    const ui = render(
      <main aria-busy="true">
        <Placeholder className="title-line" text="h3" width="72%" />
        <Placeholder />
      </main>,
    );
    const [titled, plain] = [...ui.container.querySelectorAll<HTMLElement>(".sk-placeholder")];

    expect(titled?.classList).toContain("title-line");
    expect(titled?.dataset.shape).toBe("text");
    // The ROLE lands in the DOM; the stylesheet is what turns it into the h3 token pair, so nothing
    // here has to know what an h3 measures.
    expect(titled?.dataset.text).toBe("h3");
    expect(titled?.style.getPropertyValue("--sk-placeholder-inline-size")).toBe("72%");
    expect(plain?.dataset.text).toBe("body");
  });

  it("draws a paragraph as real lines, clamped, with the raggedness authored on the root", () => {
    const ui = render(<PlaceholderParagraph lastLine="40%" lines={4} text="sm" />);
    const root = ui.container.querySelector<HTMLElement>(".sk-placeholder")!;

    expect(root.dataset.shape).toBe("paragraph");
    expect(root.dataset.text).toBe("sm");
    // Real elements rather than a painted gradient: a line of prose has round ends.
    expect(root.querySelectorAll(".sk-placeholder__line")).toHaveLength(4);
    expect(root.style.getPropertyValue("--sk-placeholder-last-line")).toBe("40%");
  });

  it("clamps the rendered line count the same way the emitter does", () => {
    const ui = render(<PlaceholderParagraph lines={0} />);
    expect(ui.container.querySelectorAll(".sk-placeholder__line")).toHaveLength(1);
  });

  it("gives a filled block its parent's whole box, and a circle the avatar scale", () => {
    const ui = render(
      <main aria-busy="true">
        <PlaceholderBlock fill />
        <PlaceholderBlock height="12rem" width="8rem" />
        <PlaceholderCircle size="sm" />
      </main>,
    );
    const [filled, sized, circle] = [...ui.container.querySelectorAll<HTMLElement>(".sk-placeholder")];

    expect(filled?.dataset.shape).toBe("block");
    expect(filled?.hasAttribute("data-fill")).toBe(true);
    // Absent, not `data-fill="false"`: presence is how the stylesheet asks.
    expect(sized?.hasAttribute("data-fill")).toBe(false);
    expect(sized?.style.getPropertyValue("--sk-placeholder-block-size")).toBe("12rem");
    expect(circle?.dataset.shape).toBe("circle");
    expect(circle?.dataset.size).toBe("sm");
  });

  it("keeps every signature out of the accessibility tree", () => {
    const ui = render(
      <main aria-busy="true">
        <Placeholder />
        <PlaceholderParagraph lines={2} />
        <PlaceholderBlock />
        <PlaceholderCircle />
      </main>,
    );
    const placeholders = [...ui.container.querySelectorAll(".sk-placeholder")];

    expect(placeholders).toHaveLength(4);
    expect(placeholders.every((node) => node.getAttribute("aria-hidden") === "true")).toBe(true);
  });

  it("has no serious accessibility violations inside a labelled busy region", async () => {
    const ui = render(
      <section aria-busy="true" aria-label="Cargando publicación">
        <PlaceholderBlock />
        <PlaceholderParagraph lines={3} />
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
