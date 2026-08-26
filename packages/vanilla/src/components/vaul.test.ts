import { fireEvent } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { connectVaul, mountVaul } from "./vaul.js";

/*
 * Vaul is COMPLETE without this enhancer: the modality, Escape and focus are the platform's, and the
 * slide is CSS. What is tested here is the shell around the one behaviour with no platform
 * equivalent, the drag, plus the wiring (triggers, closers, light dismiss) that turns authored markup
 * into a working panel. The verdict itself ("was that a dismissal?") is pure and already covered in
 * vaul-gesture.test.ts.
 */
let belowDesktop = true;

function markup({ attr = "data-sk-vaul", root = "", handle = true, extra = "" } = {}) {
  document.body.innerHTML = `
    <button ${attr}-open="panel" type="button">Abrir</button>
    <dialog class="sk-vaul" id="panel" ${attr} ${root}>
      ${handle ? '<div class="sk-vaul__handle" data-part="handle" aria-hidden="true"></div>' : ""}
      <p>Contenido</p>
      <button ${attr}-close type="button">Cerrar</button>
    </dialog>
    ${extra}`;
  const element = document.querySelector<HTMLDialogElement>("dialog")!;
  // A panel this size makes the drag distances below mean something: jsdom measures everything as 0.
  element.getBoundingClientRect = () =>
    ({ bottom: 400, height: 400, left: 0, right: 400, top: 0, width: 400 }) as DOMRect;
  return element;
}

const handleOf = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-part="handle"]')!;

/** One whole gesture: grab the handle, pull `distance` px toward the edge, let go. */
function drag(root: HTMLElement, distance: number) {
  const handle = handleOf(root);
  fireEvent.pointerDown(handle, { buttons: 1, clientY: 0, isPrimary: true, pointerId: 1 });
  fireEvent.pointerMove(window, { buttons: 1, clientY: distance, pointerId: 1 });
  fireEvent.pointerUp(window, { buttons: 0, clientY: distance, pointerId: 1 });
}

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
  const root = document.querySelector<HTMLElement>("dialog");
  if (root) destroyMount(root);
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("Vaul Vanilla contracts", () => {
  it("refuses anything that is not a native dialog", () => {
    document.body.innerHTML = `<div data-sk-vaul></div>`;
    // The modality is the platform's, and a div cannot supply it.
    expect(() => connectVaul(document.querySelector<HTMLElement>("[data-sk-vaul]")!)).toThrow(
      /native <dialog>/,
    );
  });

  it("writes the scope markers and resolves an edge", () => {
    const root = markup();
    connectVaul(root);

    expect(root.dataset.scope).toBe("vaul");
    expect(root.dataset.part).toBe("root");
    expect(root.dataset.edge).toBe("inline-start");
  });

  it("keeps the edge the markup already chose", () => {
    const root = markup({ root: 'data-edge="block-end"' });
    connectVaul(root);
    // The edge is a layout decision the CSS made; the enhancer reads it rather than writing it.
    expect(root.dataset.edge).toBe("block-end");
  });

  it("announces every close, to the DOM and to its caller", () => {
    const root = markup({ root: 'data-edge="block-end"' });
    const onOpenChange = vi.fn();
    const listener = vi.fn();
    root.addEventListener("sk:openchange", listener);
    connectVaul(root, { onOpenChange });

    root.showModal();
    root.close();

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { open: false } }));
    expect(onOpenChange).toHaveBeenCalledWith({ open: false });
  });

  it("pulls the panel with the finger and dismisses past the threshold", () => {
    const root = markup({ root: 'data-edge="block-end"' });
    connectVaul(root);
    root.showModal();

    const handle = handleOf(root);
    fireEvent.pointerDown(handle, { buttons: 1, clientY: 0, isPrimary: true, pointerId: 1 });
    fireEvent.pointerMove(window, { buttons: 1, clientY: 200, pointerId: 1 });

    expect(root.dataset.dragging).toBe("");
    expect(root.style.getPropertyValue("--sk-vaul-drag-offset")).toBe("200px");
    // Unitless: the backdrop multiplies it, and a length there would be a category error.
    expect(root.style.getPropertyValue("--sk-vaul-drag-progress")).toBe("0.5");

    fireEvent.pointerUp(window, { buttons: 0, clientY: 200, pointerId: 1 });

    expect(root.open).toBe(false);
    expect(root.dataset.dragging).toBeUndefined();
    // The offset goes either way: the release curve carries the panel the rest of the way out.
    expect(root.style.getPropertyValue("--sk-vaul-drag-offset")).toBe("");
    expect(root.dataset.releasing).toBe("");
  });

  it("springs home after a short pull that ended still", async () => {
    const root = markup({ root: 'data-edge="block-end"' });
    connectVaul(root);
    root.showModal();

    const handle = handleOf(root);
    fireEvent.pointerDown(handle, { buttons: 1, clientY: 0, isPrimary: true, pointerId: 1 });
    fireEvent.pointerMove(window, { buttons: 1, clientY: 40, pointerId: 1 });
    // Velocity is measured over the last frames only, so a pause makes this a slow drag rather
    // than a flick, and 40px of a 400px panel is nowhere near the distance threshold.
    await new Promise((resolve) => setTimeout(resolve, 150));
    fireEvent.pointerMove(window, { buttons: 1, clientY: 40, pointerId: 1 });
    fireEvent.pointerUp(window, { buttons: 0, clientY: 40, pointerId: 1 });

    expect(root.open).toBe(true);
    expect(root.style.getPropertyValue("--sk-vaul-drag-offset")).toBe("");
    expect(root.dataset.releasing).toBe("");
  });

  it("resists a pull away from the edge instead of following it", () => {
    const root = markup({ root: 'data-edge="block-end"' });
    connectVaul(root);
    root.showModal();

    fireEvent.pointerDown(handleOf(root), { buttons: 1, clientY: 0, isPrimary: true, pointerId: 1 });
    fireEvent.pointerMove(window, { buttons: 1, clientY: -200, pointerId: 1 });

    const offset = Number.parseFloat(root.style.getPropertyValue("--sk-vaul-drag-offset"));
    // Over-pull is capped, so 200px away from the edge moves the panel a few px and no more.
    expect(offset).toBeLessThan(0);
    expect(offset).toBeGreaterThan(-13);
  });

  it("does not wire the grab above the desktop breakpoint", () => {
    belowDesktop = false;
    const root = markup({ root: 'data-edge="block-end"' });
    connectVaul(root);
    root.showModal();

    drag(root, 300);

    // Above it a pointer dismisses by clicking outside or pressing Escape, and the CSS hides
    // the handle to match.
    expect(root.open).toBe(true);
    expect(root.dataset.dragging).toBeUndefined();
  });

  it("stays put when the author opted out of dragging", () => {
    const root = markup({ root: 'data-edge="block-end"' });
    connectVaul(root, { draggable: false });
    root.showModal();

    drag(root, 300);

    expect(root.open).toBe(true);
  });

  it("does nothing but announce when there is no handle to grab", () => {
    const root = markup({ handle: false, root: 'data-edge="block-end"' });
    const listener = vi.fn();
    root.addEventListener("sk:openchange", listener);

    expect(() => connectVaul(root)).not.toThrow();
    root.showModal();
    root.close();
    expect(listener).toHaveBeenCalledOnce();
  });

  it("ignores a handle that belongs to something nested inside the panel", () => {
    const root = markup({ handle: false, root: 'data-edge="block-end"' });
    root.insertAdjacentHTML(
      "afterbegin",
      '<div class="sk-slider"><span data-part="handle"></span></div>',
    );
    connectVaul(root);
    root.showModal();

    fireEvent.pointerDown(root.querySelector<HTMLElement>('[data-part="handle"]')!, {
      buttons: 1,
      clientY: 0,
      isPrimary: true,
      pointerId: 1,
    });
    fireEvent.pointerMove(window, { buttons: 1, clientY: 300, pointerId: 1 });

    // A slider's handle is not the panel's: only a DIRECT child can be.
    expect(root.dataset.dragging).toBeUndefined();
  });

  it("opens from its trigger, closes from its closer and from the backdrop", () => {
    const root = markup({ root: 'data-edge="block-end"' });
    expect(mountVaul(document)).toBe(1);
    expect(mountVaul(document)).toBe(0);

    const trigger = document.querySelector<HTMLElement>("[data-sk-vaul-open]")!;
    expect(trigger.getAttribute("aria-controls")).toBe("panel");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    expect(root.open).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(document.querySelector<HTMLElement>("[data-sk-vaul-close]")!);
    expect(root.open).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    // The backdrop IS the dialog's own box, so a click outside the panel's rectangle is a
    // click on the backdrop, with no second element to own it.
    fireEvent.click(root, { clientX: 900, clientY: 900 });
    expect(root.open).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps a click inside the panel from dismissing it", () => {
    const root = markup({ root: 'data-edge="block-end"' });
    mountVaul(document);
    fireEvent.click(document.querySelector<HTMLElement>("[data-sk-vaul-open]")!);

    fireEvent.click(root.querySelector("p")!, { clientX: 10, clientY: 10 });
    expect(root.open).toBe(true);

    fireEvent.click(root, { clientX: 10, clientY: 10 });
    expect(root.open).toBe(true);
  });

  it("answers to Dialog Vaul's own attributes too", () => {
    const root = markup({ attr: "data-sk-dialog-vaul", root: 'data-edge="block-end"' });
    expect(mountVaul(document)).toBe(1);

    fireEvent.click(document.querySelector<HTMLElement>("[data-sk-dialog-vaul-open]")!);
    expect(root.open).toBe(true);

    fireEvent.click(document.querySelector<HTMLElement>("[data-sk-dialog-vaul-close]")!);
    expect(root.open).toBe(false);
  });

  it("lets go of everything on cleanup", () => {
    const root = markup({ root: 'data-edge="block-end"' });
    const dispose = connectVaul(root);
    root.showModal();

    fireEvent.pointerDown(handleOf(root), { buttons: 1, clientY: 0, isPrimary: true, pointerId: 1 });
    dispose();
    fireEvent.pointerMove(window, { buttons: 1, clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(window, { buttons: 0, clientY: 300, pointerId: 1 });

    expect(root.open).toBe(true);
    expect(root.style.getPropertyValue("--sk-vaul-drag-offset")).toBe("");
    expect(root.dataset.dragging).toBeUndefined();
  });
});
