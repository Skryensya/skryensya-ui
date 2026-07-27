import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MediaCaption, MediaGradient } from "./media-gradient.js";

describe("MediaGradient", () => {
  it("maps strength and stays decorative", () => {
    const ui = render(<MediaGradient strength="lg" />);
    const el = ui.container.querySelector(".sk-media-gradient");
    expect(el?.getAttribute("data-strength")).toBe("lg");
    expect(el?.getAttribute("aria-hidden")).toBe("true");
  });

  it("MediaCaption hosts edge and can inject the wash via strength", () => {
    const ui = render(
      <MediaCaption edge="start" strength="md">
        <h3>Puerto</h3>
      </MediaCaption>,
    );
    const caption = ui.container.querySelector(".sk-media-caption");
    const wash = caption?.querySelector(".sk-media-gradient");
    expect(caption?.getAttribute("data-edge")).toBe("start");
    expect(wash?.getAttribute("data-strength")).toBe("md");
    expect(caption?.textContent).toContain("Puerto");
  });
});
