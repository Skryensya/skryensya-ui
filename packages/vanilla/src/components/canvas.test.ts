import { canvasAttrs, canvasParts } from "@skryensya/core/canvas";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { connectCanvas } from "./canvas.js";

/*
 * The geometry is proved in `packages/core/src/canvas.test.ts`. What is proved here is the wiring:
 * which events move the view and which are left to the page, what the controller writes back, and
 * that the enhancer reads its limits off the authored markup.
 *
 * jsdom lays nothing out, so the sizes are stated: the content is 800x400 and the viewport 400 wide
 * and 200 tall, which fits at exactly 50%.
 */

const sizes: Record<string, Partial<Record<"offsetWidth" | "offsetHeight" | "clientWidth" | "clientHeight", number>>> = {
  [canvasParts.content]: { offsetWidth: 800, offsetHeight: 400 },
  [canvasParts.viewport]: { clientWidth: 400, clientHeight: 200 },
};

const originals = new Map<string, PropertyDescriptor | undefined>();

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
});

afterEach(() => {
  for (const [key, descriptor] of originals) {
    const proto = key.startsWith("offset") ? HTMLElement.prototype : Element.prototype;
    if (descriptor) Object.defineProperty(proto, key, descriptor);
    else delete (proto as unknown as Record<string, unknown>)[key];
  }
  document.body.innerHTML = "";
});

const canvas = (attrs = ""): HTMLElement => {
  document.body.innerHTML = `
    <div class="${canvasParts.root}" data-sk-canvas ${attrs}>
      <div class="${canvasParts.viewport}" tabindex="0">
        <div class="${canvasParts.content}"><p>drawing</p></div>
      </div>
      <div class="${canvasParts.controls}">
        <button type="button" class="${canvasParts.control}" data-canvas-action="zoom-out" aria-label="Zoom out"></button>
        <button type="button" class="${canvasParts.control}" data-canvas-action="zoom-in" aria-label="Zoom in"></button>
        <button type="button" class="${canvasParts.control}" data-canvas-action="fit" aria-label="Fit to view"></button>
      </div>
    </div>`;
  return document.querySelector<HTMLElement>(`.${canvasParts.root}`)!;
};

const partsOf = (root: HTMLElement) => ({
  viewport: root.querySelector<HTMLElement>(`.${canvasParts.viewport}`)!,
  content: root.querySelector<HTMLElement>(`.${canvasParts.content}`)!,
  /* The zoom as a percentage, read back off the one thing the controller writes: the transform. */
  level: {
    get textContent(): string {
      const content = root.querySelector<HTMLElement>(`.${canvasParts.content}`)!;
      const scale = Number(/scale\(([^)]+)\)/.exec(content.style.transform)?.[1] ?? "1");
      return `${Math.round(scale * 100)}%`;
    },
  },
  button: (action: string) => root.querySelector<HTMLButtonElement>(`[data-canvas-action="${action}"]`)!,
});

/** A touch event carrying the given finger positions, which jsdom cannot construct natively. */
const touch = (type: string, points: readonly [number, number][]): Event => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  const touches = points.map(([clientX, clientY]) => ({ clientX, clientY }));
  Object.defineProperty(event, "touches", { value: touches });
  return event;
};

describe("connectCanvas", () => {
  it("opens fitted: scaled until all of it shows, and as tall as that", () => {
    const root = canvas();
    connectCanvas(root);
    const { content, level } = partsOf(root);

    expect(content.style.transform).toBe("translate(0px, 0px) scale(0.5)");
    expect(level.textContent).toBe("50%");
    expect(root.style.getPropertyValue("--sk-canvas-fit-block-size")).toBe("200px");
    // The view, for the dotted ground to follow.
    expect(root.style.getPropertyValue("--sk-canvas-scale")).toBe("0.5");
    expect(root.style.getPropertyValue("--sk-canvas-x")).toBe("0px");
    expect(root.hasAttribute(canvasAttrs.zoomed)).toBe(false);
  });

  it("zooms with the buttons, and fit brings it back", () => {
    const root = canvas();
    connectCanvas(root);
    const { level, button } = partsOf(root);

    button("zoom-in").click();
    expect(level.textContent).toBe("63%");
    expect(root.hasAttribute(canvasAttrs.zoomed)).toBe(true);

    button("fit").click();
    expect(level.textContent).toBe("50%");
    expect(root.hasAttribute(canvasAttrs.zoomed)).toBe(false);
  });

  it("disables zoom-out at the minimum it read off the markup", () => {
    const root = canvas(`data-min-zoom="0.5"`);
    connectCanvas(root);
    // Fitted at 50%, which IS the minimum here.
    expect(partsOf(root).button("zoom-out").disabled).toBe(true);
    expect(partsOf(root).button("zoom-in").disabled).toBe(false);
  });

  it("zooms on Ctrl + wheel and leaves a plain wheel to the page", () => {
    const root = canvas();
    connectCanvas(root);
    const { viewport, level } = partsOf(root);

    const plain = new WheelEvent("wheel", { deltaY: 40, cancelable: true, bubbles: true });
    viewport.dispatchEvent(plain);
    expect(plain.defaultPrevented).toBe(false);
    expect(level.textContent).toBe("50%");

    const zoom = new WheelEvent("wheel", { deltaY: -40, ctrlKey: true, cancelable: true, bubbles: true });
    viewport.dispatchEvent(zoom);
    expect(zoom.defaultPrevented).toBe(true);
    expect(level.textContent).not.toBe("50%");
  });

  it("pans on a plain wheel once zoomed, and hands the scroll back to the page at an edge", () => {
    const root = canvas();
    connectCanvas(root);
    const { viewport, content, button } = partsOf(root);
    const wheel = (deltaY: number) => {
      const event = new WheelEvent("wheel", { deltaY, cancelable: true, bubbles: true });
      viewport.dispatchEvent(event);
      return event;
    };

    // At rest the wheel is the page's.
    expect(wheel(40).defaultPrevented).toBe(false);

    // Zoomed in, it pans the canvas.
    button("zoom-in").click();
    const before = content.style.transform;
    expect(wheel(40).defaultPrevented).toBe(true);
    expect(content.style.transform).not.toBe(before);

    // Far enough, the pan hits its limit: nothing moves, and the scroll goes on to the page.
    for (let i = 0; i < 50; i += 1) wheel(40);
    const atEdge = content.style.transform;
    expect(wheel(40).defaultPrevented).toBe(false);
    expect(content.style.transform).toBe(atEdge);

    // Fit returns it to rest.
    button("fit").click();
    expect(wheel(40).defaultPrevented).toBe(false);
  });

  it("answers + - 0 from the keyboard, and leaves Ctrl-chords to the browser", () => {
    const root = canvas();
    connectCanvas(root);
    const { viewport, level } = partsOf(root);
    const key = (init: KeyboardEventInit) => {
      const event = new KeyboardEvent("keydown", { ...init, cancelable: true, bubbles: true });
      viewport.dispatchEvent(event);
      return event;
    };

    key({ key: "+" });
    expect(level.textContent).toBe("63%");
    key({ key: "0" });
    expect(level.textContent).toBe("50%");

    const browserZoom = key({ key: "+", ctrlKey: true });
    expect(browserZoom.defaultPrevented).toBe(false);
    expect(level.textContent).toBe("50%");
  });

  it("takes two fingers and leaves one to the page, hinting when one drags sideways", () => {
    const root = canvas();
    connectCanvas(root);
    const { viewport, level } = partsOf(root);

    // One finger, sideways: not prevented, and the hint says to use two.
    viewport.dispatchEvent(touch("touchstart", [[100, 100]]));
    const one = touch("touchmove", [[140, 102]]);
    viewport.dispatchEvent(one);
    expect(one.defaultPrevented).toBe(false);
    expect(root.getAttribute(canvasAttrs.showing)).toBe("touch");
    viewport.dispatchEvent(touch("touchend", []));

    // Two fingers spreading to twice the distance: prevented, and the scale doubles.
    viewport.dispatchEvent(touch("touchstart", [[100, 100], [200, 100]]));
    const two = touch("touchmove", [[50, 100], [250, 100]]);
    viewport.dispatchEvent(two);
    expect(two.defaultPrevented).toBe(true);
    expect(level.textContent).toBe("100%");
    expect(root.hasAttribute(canvasAttrs.showing)).toBe(false);
  });

  it("stops listening once disconnected", () => {
    const root = canvas();
    const disconnect = connectCanvas(root);
    disconnect();
    partsOf(root).button("zoom-in").click();
    expect(partsOf(root).level.textContent).toBe("50%");
  });
});
