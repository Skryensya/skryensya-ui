import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Drawer, Vaul } from "./vaul.js";

/*
 * Vaul renders markup and nothing else: opening is `showModal()` (a call) and dragging is a gesture
 * the enhancer supplies. So what this checks is that the markup already carries everything the
 * enhancer looks for, which is what keeps the two bindings from disagreeing before a script runs.
 */
describe("Vaul", () => {
  it("carries the enhancer's scope markers at rest", () => {
    const ui = render(
      <Vaul label="Filtros" open>
        <p>Contenido</p>
      </Vaul>,
    );
    const panel = ui.container.querySelector("dialog")!;

    expect(panel.classList.contains("sk-vaul")).toBe(true);
    expect(panel.getAttribute("data-scope")).toBe("vaul");
    expect(panel.getAttribute("data-part")).toBe("root");
    // The default edge, so a panel that says nothing still arrives from somewhere.
    expect(panel.getAttribute("data-edge")).toBe("block-end");
  });

  it("draws the handle as decoration, always", () => {
    const ui = render(
      <Vaul label="Filtros" open>
        <p>Contenido</p>
      </Vaul>,
    );
    const handle = ui.container.querySelector(".sk-vaul__handle")!;

    // A grip that may do nothing where the enhancer never runs, and announcing it would be worse
    // than silence: Escape and the panel's own close control dismiss it in every case.
    expect(handle.getAttribute("aria-hidden")).toBe("true");
    expect(handle.getAttribute("data-part")).toBe("handle");
  });

  it("takes a logical edge and the consumer's own className", () => {
    const ui = render(
      <Vaul label="Filtros" className="filtros" edge="inline-start" open>
        <p>Contenido</p>
      </Vaul>,
    );
    const panel = ui.container.querySelector("dialog")!;

    expect(panel.getAttribute("data-edge")).toBe("inline-start");
    expect(panel.classList.contains("sk-vaul")).toBe(true);
    expect(panel.classList.contains("filtros")).toBe(true);
    expect(panel.classList.contains("sk-drawer")).toBe(false);
  });

  it("adds the drawer modifier only for the drawer signature", () => {
    const ui = render(
      <Drawer label="Navegación" open>
        <p>Contenido</p>
      </Drawer>,
    );
    const panel = ui.container.querySelector("dialog")!;

    // One modifier class is the whole of what `drawer.css` is, so the shape stays a signature of
    // this family rather than a second component with parts to keep in step.
    expect(panel.classList.contains("sk-vaul")).toBe(true);
    expect(panel.classList.contains("sk-drawer")).toBe(true);
    expect(panel.querySelector(".sk-vaul__handle")).toBeTruthy();
  });

  it("forwards native dialog attributes untouched", () => {
    const ui = render(
      <Vaul label="Filtros" id="filtros" open>
        <p>Contenido</p>
      </Vaul>,
    );
    const panel = ui.container.querySelector("dialog")!;

    expect(panel.id).toBe("filtros");
    expect(panel.open).toBe(true);
    expect(panel.getAttribute("aria-label")).toBe("Filtros");
  });
});
