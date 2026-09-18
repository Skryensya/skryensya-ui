import { fireEvent, render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Drawer, Vaul } from "./vaul.js";

/*
 * The markup half: everything the Vanilla enhancer looks for is already in the render, which keeps
 * the two bindings from disagreeing before a script runs. The behaviour half is further down.
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
    expect(panel.hasAttribute("data-sk-vaul")).toBe(true);
    expect(panel.getAttribute("data-scope")).toBe("vaul");
    expect(panel.getAttribute("data-part")).toBe("root");
    // The default edge, so a panel that says nothing still arrives from somewhere.
    expect(panel.getAttribute("data-edge")).toBe("block-end");
  });

  it("draws the handle hidden from assistive tech, always", () => {
    const ui = render(
      <Vaul label="Filtros" open>
        <p>Contenido</p>
      </Vaul>,
    );
    const handle = ui.container.querySelector(".sk-vaul__handle")!;

    // The gesture is pointer-only; Escape and the panel's own close control dismiss it for everyone.
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

/*
 * The behaviour this binding now owns, mirroring vanilla/src/components/vaul.test.ts. The verdict
 * ("was that a dismissal?") is `@skryensya/core/vaul-gesture`'s and is covered there.
 */
describe("Vaul behaviour", () => {
  let belowDesktop = true;

  beforeEach(() => {
    belowDesktop = true;
    vi.stubGlobal("matchMedia", (query: string) => ({
      media: query,
      get matches() {
        return belowDesktop;
      },
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const panelOf = (ui: ReturnType<typeof render>) => {
    const dialog = ui.container.querySelector("dialog")!;
    // jsdom measures everything as 0; a 400px panel makes the distances below mean something.
    dialog.getBoundingClientRect = () =>
      ({ bottom: 400, height: 400, left: 0, right: 400, top: 0, width: 400 }) as DOMRect;
    return dialog;
  };
  const pull = (dialog: HTMLElement, distance: number) => {
    const handle = dialog.querySelector<HTMLElement>(":scope > [data-part='handle']")!;
    fireEvent.pointerDown(handle, { buttons: 1, clientY: 0, isPrimary: true, pointerId: 1 });
    fireEvent.pointerMove(window, { buttons: 1, clientY: distance, pointerId: 1 });
  };

  it("hands the dialog to the consumer's ref, so showModal() is reachable", () => {
    const ref = createRef<HTMLDialogElement>();
    render(
      <Vaul label="Filtros" ref={ref}>
        <p>Contenido</p>
      </Vaul>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDialogElement);
  });

  it("drags from the handle and dismisses past the threshold", () => {
    const dialog = panelOf(render(<Vaul label="Filtros" open><p>Contenido</p></Vaul>));

    pull(dialog, 200);
    expect(dialog.style.getPropertyValue("--sk-vaul-drag-offset")).toBe("200px");
    expect(dialog.style.getPropertyValue("--sk-vaul-drag-progress")).toBe("0.5");

    fireEvent.pointerUp(window, { buttons: 0, clientY: 200, pointerId: 1 });
    expect(dialog.open).toBe(false);
  });

  it("follows dismissThreshold instead of the default", () => {
    const dialog = panelOf(
      render(<Vaul label="Filtros" open dismissThreshold={0.9}><p>Contenido</p></Vaul>),
    );

    pull(dialog, 200);
    // A pause turns the release into a slow drag rather than a flick, so only distance decides.
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        fireEvent.pointerMove(window, { buttons: 1, clientY: 200, pointerId: 1 });
        fireEvent.pointerUp(window, { buttons: 0, clientY: 200, pointerId: 1 });
        // Half the panel is past the default 0.4 but short of 0.9.
        expect(dialog.open).toBe(true);
        resolve();
      }, 150),
    );
  });

  it("keeps the handle but not the drag when draggable is false", () => {
    const dialog = panelOf(render(<Vaul label="Filtros" open draggable={false}><p>Contenido</p></Vaul>));

    pull(dialog, 200);
    expect(dialog.style.getPropertyValue("--sk-vaul-drag-offset")).toBe("");
    expect(dialog.querySelector(".sk-vaul__handle")).not.toBeNull();
  });

  it("announces every close to the DOM and to onOpenChange", () => {
    const onOpenChange = vi.fn();
    const listener = vi.fn();
    const dialog = panelOf(
      render(<Vaul label="Filtros" open onOpenChange={onOpenChange}><p>Contenido</p></Vaul>),
    );
    dialog.addEventListener("sk:vaulopenchange", listener);

    dialog.close();

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { open: false } }));
    expect(onOpenChange).toHaveBeenCalledWith({ open: false });
  });

  it("closes from a backdrop click and not from a click inside the panel", () => {
    const dialog = panelOf(render(<Vaul label="Filtros" open><p>Contenido</p></Vaul>));

    fireEvent.click(dialog, { clientX: 200, clientY: 200 });
    expect(dialog.open).toBe(true);

    fireEvent.click(dialog, { clientX: 200, clientY: 600 });
    expect(dialog.open).toBe(false);
  });
});

describe("Vaul.Trigger and Vaul.Close", () => {
  function Page({ onOpenChange }: { onOpenChange?: (details: { open: boolean }) => void }) {
    return (
      <>
        <Vaul.Trigger opens="filtros" variant="ghost">
          Filtrar
        </Vaul.Trigger>
        <Vaul id="filtros" label="Filtros" onOpenChange={onOpenChange}>
          <p>Contenido</p>
          <Vaul.Close>Listo</Vaul.Close>
        </Vaul>
      </>
    );
  }

  it("names the panel it controls and starts collapsed", () => {
    const ui = render(<Page />);
    const trigger = ui.getByRole("button", { name: "Filtrar" });

    expect(trigger.getAttribute("data-sk-vaul-open")).toBe("filtros");
    expect(trigger.getAttribute("aria-controls")).toBe("filtros");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("data-variant")).toBe("ghost");
    expect(trigger.classList).toContain("sk-button");
  });

  it("opens the panel modally, and the close button inside shuts it and collapses the trigger", async () => {
    const onOpenChange = vi.fn();
    const ui = render(<Page onOpenChange={onOpenChange} />);
    const trigger = ui.getByRole("button", { name: "Filtrar" });
    const panel = ui.container.querySelector<HTMLDialogElement>("#filtros")!;

    fireEvent.click(trigger);
    expect(panel.open).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(ui.getByText("Listo"));
    expect(panel.open).toBe(false);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
    expect(onOpenChange).toHaveBeenCalledWith({ open: false });
  });
});
