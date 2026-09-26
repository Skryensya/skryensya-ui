import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FadeEdge } from "./fade-edge.js";

describe("FadeEdge React contracts", () => {
  it("writes mode and direction data attrs, including contract defaults", () => {
    const ui = render(
      <FadeEdge>
        <p>Contenido</p>
      </FadeEdge>,
    );
    const root = ui.container.querySelector(".sk-fade-edge")!;
    expect(root.getAttribute("data-fade")).toBe("transparent");
    expect(root.getAttribute("data-direction")).toBe("to-bottom");
  });

  it("maps size and color onto the published style hooks", () => {
    const ui = render(
      <FadeEdge mode="color" direction="to-top" size="7rem" color="rgb(15 23 42 / 85%)">
        <p>Foto</p>
      </FadeEdge>,
    );
    const root = ui.container.querySelector(".sk-fade-edge") as HTMLElement;
    expect(root.getAttribute("data-fade")).toBe("color");
    expect(root.getAttribute("data-direction")).toBe("to-top");
    expect(root.style.getPropertyValue("--sk-fade-edge-size")).toBe("7rem");
    expect(root.style.getPropertyValue("--sk-fade-edge-color")).toBe("rgb(15 23 42 / 85%)");
  });
});

describe("FadeEdge scrollAware", () => {
  it("writes nothing extra unless opted in", () => {
    const ui = render(<FadeEdge>x</FadeEdge>);
    const root = ui.container.querySelector(".sk-fade-edge")!;
    expect(root.hasAttribute("data-scroll-aware")).toBe(false);
    expect(root.hasAttribute("data-at-edge")).toBe(false);
  });

  /* jsdom lays nothing out: scrollHeight and clientHeight are both 0, which is content that fits. */
  it("marks content that fits as at its edge, and lets go of the attribute on unmount of the option", () => {
    const ui = render(<FadeEdge scrollAware>x</FadeEdge>);
    const root = ui.container.querySelector(".sk-fade-edge")!;
    expect(root.getAttribute("data-scroll-aware")).toBe("");
    expect(root.hasAttribute("data-at-edge")).toBe(true);

    ui.rerender(<FadeEdge>x</FadeEdge>);
    expect(root.hasAttribute("data-at-edge")).toBe(false);
  });
});
