import { lightboxAttrs, lightboxParts } from "@skryensya/core/lightbox";
import { lightboxEvents } from "@skryensya/core/lightbox-controller";
import { fireEvent } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLightbox, mountLightbox } from "./lightbox.js";

/*
 * The Vanilla half of Lightbox, on authored markup. Three things are proved here that the React suite
 * leaves to this one, because they are the controller's and not a binding's: the settings read off
 * the markup, the gallery assembled from triggers on the page, and the gestures (swipe, pan, pinch,
 * double tap, wheel), which need the stated geometry below: jsdom lays nothing out.
 *
 * Geometry: a 400x300 stage showing a photo fitted at 400x300, so 2x zoom leaves 200px of slack left
 * and right and 150px up and down.
 */

const control = (action: string, label: string) =>
  `<button type="button" class="sk-lightbox__control sk-button sk-interactive" data-lightbox-action="${action}" aria-label="${label}" data-icon-only data-variant="translucent" data-size="md"><span data-sk-icon="x"></span></button>`;

function markup(attrs = ""): string {
  return `
    <a class="sk-lightbox__trigger" href="/a.jpg" data-sk-lightbox-open="photos" data-lightbox-title="Dawn" data-lightbox-width="1600" data-lightbox-height="900" aria-haspopup="dialog"><img src="/a-t.jpg" alt="Lake at dawn"></a>
    <a class="sk-lightbox__trigger" href="/b.jpg" data-sk-lightbox-open="photos" aria-haspopup="dialog"><img src="/b-t.jpg" alt="Pine forest"></a>
    <a class="sk-lightbox__trigger" href="/c.jpg" data-sk-lightbox-open="photos" data-lightbox-alt="Snow on the summit" aria-haspopup="dialog"><img src="/c-t.jpg" alt="Peak"></a>
    <a class="sk-lightbox__trigger" href="/elsewhere.jpg" data-sk-lightbox-open="other"><img src="/x.jpg" alt="Other gallery"></a>
    <button type="button" id="outside">Outside</button>
    <dialog class="sk-lightbox" id="photos" data-sk-lightbox aria-label="Visor de imágenes" ${attrs}>
      <div class="sk-lightbox__toolbar">
        <p class="sk-lightbox__counter" aria-hidden="true"></p>
        <div class="sk-lightbox__actions">
          ${control("zoom-out", "Alejar")}${control("zoom-in", "Acercar")}${control("reset-zoom", "Restablecer zoom")}${control("close", "Cerrar")}
        </div>
      </div>
      <figure class="sk-lightbox__figure">
        <div class="sk-lightbox__stage">
          <span class="sk-lightbox__loader sk-loader" aria-hidden="true" data-size="lg"></span>
          <p class="sk-lightbox__error" data-error-label="No se pudo cargar." hidden>No se pudo cargar.</p>
        </div>
        <figcaption class="sk-lightbox__caption" hidden>
          <p class="sk-lightbox__title" hidden></p>
          <p class="sk-lightbox__description" hidden></p>
          <p class="sk-lightbox__credit" hidden></p>
        </figcaption>
      </figure>
      ${control("previous", "Imagen anterior").replace("sk-lightbox__control", "sk-lightbox__nav sk-lightbox__control")}
      ${control("next", "Imagen siguiente").replace("sk-lightbox__control", "sk-lightbox__nav sk-lightbox__control")}
      <p class="sk-lightbox__live sk-visually-hidden" aria-live="polite" aria-atomic="true"></p>
    </dialog>`;
}

const dialog = () => document.querySelector<HTMLDialogElement>("dialog")!;
const stage = () => document.querySelector<HTMLElement>(`.${lightboxParts.stage}`)!;
const image = () => document.querySelector<HTMLImageElement>(`.${lightboxParts.image}`)!;
const button = (action: string) => document.querySelector<HTMLButtonElement>(`[${lightboxAttrs.action}="${action}"]`)!;
const trigger = (alt: string) => document.querySelector<HTMLImageElement>(`img[alt="${alt}"]`)!.parentElement!;
const state = () => getLightbox("photos")!.getState();

const originals = new Map<string, PropertyDescriptor | undefined>();
const sizes: Record<string, Record<string, number>> = {
  [lightboxParts.image]: { offsetWidth: 400, offsetHeight: 300 },
  [lightboxParts.stage]: { clientWidth: 400, clientHeight: 300 },
};

beforeEach(() => {
  for (const key of ["offsetWidth", "offsetHeight", "clientWidth", "clientHeight"] as const) {
    const proto = key.startsWith("offset") ? HTMLElement.prototype : Element.prototype;
    originals.set(key, Object.getOwnPropertyDescriptor(proto, key));
    Object.defineProperty(proto, key, {
      configurable: true,
      get(this: Element) {
        for (const [className, box] of Object.entries(sizes)) {
          if (this.classList.contains(className) && box[key] !== undefined) return box[key];
        }
        return 0;
      },
    });
  }
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const width = this.classList.contains(lightboxParts.stage) ? 400 : 0;
    const height = this.classList.contains(lightboxParts.stage) ? 300 : 0;
    return { x: 0, y: 0, left: 0, top: 0, right: width, bottom: height, width, height, toJSON() {} } as DOMRect;
  });
});

afterEach(() => {
  for (const [key, descriptor] of originals) {
    const proto = key.startsWith("offset") ? HTMLElement.prototype : Element.prototype;
    if (descriptor) Object.defineProperty(proto, key, descriptor);
    else delete (proto as unknown as Record<string, unknown>)[key];
  }
  vi.restoreAllMocks();
  getLightbox("photos")?.destroy();
  document.body.innerHTML = "";
});

function setup(attrs = ""): void {
  document.body.innerHTML = markup(attrs);
  expect(mountLightbox(document)).toBe(1);
}

/* Pointer helpers: stage-local coordinates, the stage's centre is (200, 150). */
let nextId = 1;
const down = (x: number, y: number, pointerType = "touch", target: Element = stage()) => {
  const pointerId = nextId++;
  fireEvent.pointerDown(target, { pointerId, pointerType, clientX: x, clientY: y, button: 0 });
  return pointerId;
};
const move = (pointerId: number, x: number, y: number, pointerType = "touch") =>
  fireEvent.pointerMove(stage(), { pointerId, pointerType, clientX: x, clientY: y });
const up = (pointerId: number, x: number, y: number, pointerType = "touch", target: Element = stage()) =>
  fireEvent.pointerUp(target, { pointerId, pointerType, clientX: x, clientY: y });

function openLoaded(index = 0): void {
  fireEvent.click(trigger(["Lake at dawn", "Pine forest", "Peak"][index]!));
  fireEvent.load(image());
}

describe("Lightbox (Vanilla): mounting and triggers", () => {
  it("mounts once, and builds the two images inside the stage", () => {
    setup();
    expect(mountLightbox(document)).toBe(0);
    expect(stage().querySelectorAll("img")).toHaveLength(2);
  });

  it("assembles the gallery from every trigger naming its id, in page order, and no other", () => {
    setup();
    fireEvent.click(trigger("Peak"));
    expect(dialog().open).toBe(true);
    expect(state().count).toBe(3);
    expect(state().index).toBe(2);
    expect(state().images.map((item) => item.src)).toEqual(["/a.jpg", "/b.jpg", "/c.jpg"]);
  });

  it("reads each image's alt, metadata, size and thumbnail off its trigger", () => {
    setup();
    fireEvent.click(trigger("Lake at dawn"));
    expect(state().images[0]).toMatchObject({
      alt: "Lake at dawn",
      title: "Dawn",
      width: 1600,
      height: 900,
      thumbnailSrc: "/a-t.jpg",
    });
    // An explicit data-lightbox-alt wins over the thumbnail's own.
    expect(state().images[2]!.alt).toBe("Snow on the summit");
  });

  it("includes a thumbnail added to the page after mounting", () => {
    setup();
    dialog().insertAdjacentHTML(
      "beforebegin",
      `<a href="/d.jpg" data-sk-lightbox-open="photos"><img src="/d-t.jpg" alt="Late addition"></a>`,
    );
    fireEvent.click(trigger("Late addition"));
    expect(state().count).toBe(4);
    expect(state().index).toBe(3);
  });

  it("reads loop, zoom, counter and the counter label off the markup", () => {
    setup(`data-loop data-zoom="false" data-counter="false" data-counter-label="Foto {index} de {count}"`);
    fireEvent.click(trigger("Peak"));
    fireEvent.click(button("next"));
    expect(state().index).toBe(0);
    expect(button("zoom-in").hidden).toBe(true);
    expect(document.querySelector<HTMLElement>(`.${lightboxParts.counter}`)!.hidden).toBe(true);
  });

  it("opens from script through getLightbox, with the same lifecycle", () => {
    setup();
    const outside = document.getElementById("outside")!;
    outside.focus();
    getLightbox("photos")!.open({ images: [{ src: "/solo.jpg", alt: "Solo" }] });
    expect(dialog().open).toBe(true);
    expect(document.activeElement).toBe(button("close"));
    getLightbox("photos")!.close();
    expect(document.activeElement).toBe(outside);
  });

  it("announces opening and navigation as DOM events", () => {
    setup();
    const opened = vi.fn();
    const moved = vi.fn();
    dialog().addEventListener(lightboxEvents.openChange, opened);
    dialog().addEventListener(lightboxEvents.indexChange, moved);
    fireEvent.click(trigger("Lake at dawn"));
    fireEvent.click(button("next"));
    expect(opened.mock.calls[0]![0].detail).toEqual({ open: true });
    expect(moved.mock.calls.map(([event]) => event.detail.index)).toEqual([0, 1]);
  });
});

describe("Lightbox (Vanilla): every way out converges", () => {
  it("runs the full close when the platform's own cancel fires", () => {
    setup();
    openLoaded();
    const cancel = new Event("cancel", { cancelable: true });
    dialog().dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog().open).toBe(false);
    expect(state().open).toBe(false);
  });

  it("runs the full close when someone calls dialog.close() directly", () => {
    setup();
    fireEvent.click(trigger("Pine forest"));
    trigger("Pine forest").focus();
    button("close").focus();
    dialog().close();
    expect(state().open).toBe(false);
    expect(image().hasAttribute("src")).toBe(false);
    expect(document.activeElement).toBe(trigger("Pine forest"));
  });
});

describe("Lightbox (Vanilla): gestures", () => {
  it("swipes to the next and previous image with one finger at fit", () => {
    setup();
    openLoaded();
    let id = down(300, 150);
    move(id, 250, 152);
    move(id, 180, 152);
    up(id, 180, 152);
    expect(state().index).toBe(1);
    id = down(100, 150);
    move(id, 250, 150);
    up(id, 250, 150);
    expect(state().index).toBe(0);
  });

  it("closes on a decisive swipe down", () => {
    setup();
    openLoaded();
    const id = down(200, 50);
    move(id, 202, 120);
    move(id, 204, 220);
    up(id, 204, 220);
    expect(dialog().open).toBe(false);
  });

  it("does not close from the click that ends a drag over the backdrop", () => {
    setup();
    openLoaded();
    const id = down(200, 150);
    move(id, 215, 150);
    up(id, 215, 150);
    fireEvent.click(stage());
    expect(dialog().open).toBe(true);
  });

  it("pans a zoomed image instead of swiping, and keeps it inside the frame", () => {
    setup();
    openLoaded();
    getLightbox("photos")!.zoomIn();
    getLightbox("photos")!.zoomIn();
    expect(state().zoom).toBe(2.25);
    const id = down(200, 150, "touch", image());
    move(id, 250, 150);
    move(id, 900, 150);
    up(id, 900, 150);
    expect(state().index).toBe(0);
    // 2.25x of 400 is 900 drawn in a 400 stage: 250px of slack, and no further.
    expect(image().style.transform).toBe("translate(250px, 0px) scale(2.25)");
  });

  it("drags a zoomed image with the mouse, and a mouse drag at fit changes nothing", () => {
    setup();
    openLoaded();
    let id = down(200, 150, "mouse", image());
    move(id, 50, 150, "mouse");
    up(id, 50, 150, "mouse");
    expect(state().index).toBe(0);
    getLightbox("photos")!.zoomIn();
    id = down(200, 150, "mouse", image());
    move(id, 180, 140, "mouse");
    up(id, 180, 140, "mouse");
    expect(image().style.transform).toBe("translate(-20px, -10px) scale(1.5)");
  });

  it("pinches to zoom with two fingers", () => {
    setup();
    openLoaded();
    const a = down(150, 150);
    const b = down(250, 150);
    move(a, 100, 150);
    move(b, 300, 150);
    up(a, 100, 150);
    up(b, 300, 150);
    expect(state().zoom).toBe(2);
  });

  it("zooms on a double tap on the photo, and back out on the next", () => {
    setup();
    openLoaded();
    for (const expected of [2.5, 1]) {
      let id = down(200, 150, "touch", image());
      up(id, 200, 150, "touch", image());
      id = down(202, 151, "touch", image());
      up(id, 202, 151, "touch", image());
      expect(state().zoom).toBe(expected);
    }
  });

  it("zooms on a mouse double click on the photo", () => {
    setup();
    openLoaded();
    const id = down(200, 150, "mouse", image());
    up(id, 200, 150, "mouse", image());
    fireEvent.dblClick(image(), { clientX: 200, clientY: 150 });
    expect(state().zoom).toBe(2.5);
  });

  it("zooms with the wheel, and never lets the wheel reach the page", () => {
    setup();
    openLoaded();
    const wheel = new WheelEvent("wheel", { deltaY: -100, clientX: 200, clientY: 150, bubbles: true, cancelable: true });
    image().dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(true);
    expect(state().zoom).toBeGreaterThan(1);
  });

  it("lets a long caption scroll under the wheel", () => {
    setup();
    openLoaded();
    const wheel = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
    document.querySelector(`.${lightboxParts.title}`)!.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(false);
  });

  it("zooms nothing until the image has loaded, and nothing when it failed", () => {
    setup();
    fireEvent.click(trigger("Lake at dawn"));
    getLightbox("photos")!.zoomIn();
    expect(state().zoom).toBe(1);
    fireEvent.error(image());
    getLightbox("photos")!.zoomIn();
    expect(state().zoom).toBe(1);
    // …and a failed image still navigates.
    fireEvent.click(button("next"));
    expect(state().index).toBe(1);
  });

  it("forgets a half-finished gesture on close", () => {
    setup();
    openLoaded();
    const id = down(300, 150);
    move(id, 250, 150);
    getLightbox("photos")!.close();
    expect(dialog().hasAttribute(lightboxAttrs.dragging)).toBe(false);
    expect(dialog().style.getPropertyValue("--sk-lightbox-drag-x")).toBe("");
  });
});

describe("Lightbox (Vanilla): focus stays inside", () => {
  it("re-enters the dialog when Tab is pressed with focus lost to the body", () => {
    setup();
    openLoaded();
    (document.activeElement as HTMLElement).blur();
    expect(document.activeElement).toBe(document.body);
    fireEvent.keyDown(document.body, { key: "Tab" });
    expect(dialog().contains(document.activeElement)).toBe(true);
    (document.activeElement as HTMLElement).blur();
    fireEvent.keyDown(document.body, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(button("next"));
  });

  it("ignores keys that come from outside the dialog", () => {
    setup();
    openLoaded();
    fireEvent.keyDown(document.getElementById("outside")!, { key: "ArrowRight" });
    expect(state().index).toBe(0);
  });
});
