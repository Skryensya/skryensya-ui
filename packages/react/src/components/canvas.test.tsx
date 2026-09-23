import { annotationParts } from "@skryensya/core/annotation";
import { canvasAttrs, canvasParts } from "@skryensya/core/canvas";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Annotated } from "./annotation.js";
import { Canvas } from "./canvas.js";

/*
 * The React half of `Canvas`, held to the Vanilla suite's numbers: the gestures are the shared
 * controller's and are proved there, so what is proved here is that this component renders the
 * parts that controller needs, runs it, and that `Annotated` puts a canvas around its FRAME only.
 *
 * jsdom lays nothing out: the content is stated as 800x400 and the viewport 400x200, so it fits at 50%.
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
});

describe("Canvas", () => {
  it("renders the parts the controller needs, named and labelled", () => {
    const { container } = render(
      <Canvas label="Diagram" zoomInLabel="Acercar">
        <p>drawing</p>
      </Canvas>,
    );
    const root = container.querySelector(`.${canvasParts.root}`)!;
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("aria-label")).toBe("Diagram");
    expect(root.querySelector(`.${canvasParts.viewport}`)!.getAttribute("tabindex")).toBe("0");
    expect(root.querySelector(`.${canvasParts.content} > p`)).not.toBeNull();
    expect(root.querySelector('[data-canvas-action="zoom-in"]')!.getAttribute("aria-label")).toBe("Acercar");
    expect(root.querySelector('[data-canvas-action="zoom-out"]')!.getAttribute("aria-label")).toBe("Zoom out");
    expect(root.querySelectorAll(`.${canvasParts.hint}`)).toHaveLength(2);
    // Icon-only and the smallest size, with no zoom level between them.
    const controls = [...root.querySelectorAll(`.${canvasParts.control}`)];
    expect(controls.map((c) => c.getAttribute("data-canvas-action"))).toEqual(["zoom-in", "zoom-out", "fit"]);
    expect(controls.every((c) => c.getAttribute("data-size") === "xs" && c.hasAttribute("data-icon-only"))).toBe(true);
    expect(root.querySelector("output")).toBeNull();
  });

  it("opens fitted and zooms from its buttons, as the enhancer does", () => {
    const { container } = render(
      <Canvas>
        <p>drawing</p>
      </Canvas>,
    );
    const root = container.querySelector<HTMLElement>(`.${canvasParts.root}`)!;
    const level = {
      get textContent(): string {
        const content = root.querySelector<HTMLElement>(`.${canvasParts.content}`)!;
        const scale = Number(/scale\(([^)]+)\)/.exec(content.style.transform)?.[1] ?? "1");
        return `${Math.round(scale * 100)}%`;
      },
    };
    expect(root.querySelector<HTMLElement>(`.${canvasParts.content}`)!.style.transform).toBe(
      "translate(0px, 0px) scale(0.5)",
    );
    expect(level.textContent).toBe("50%");

    act(() => root.querySelector<HTMLButtonElement>('[data-canvas-action="zoom-in"]')!.click());
    expect(level.textContent).toBe("63%");
    expect(root.hasAttribute(canvasAttrs.zoomed)).toBe(true);
  });
});

describe("Annotated zoomable", () => {
  it("puts a canvas around the frame and leaves the legend outside it", () => {
    const { container } = render(
      <Annotated
        annotations={[{ for: ".part", children: "part" }]}
        label="Anatomy"
        numbered
        subject={<p className="part">a</p>}
        zoomable
      />,
    );
    const figure = container.querySelector(`.${annotationParts.figure}`)!;
    const canvasRoot = figure.querySelector(`:scope > .${canvasParts.root}`)!;
    expect(canvasRoot).not.toBeNull();
    expect(canvasRoot.querySelector(`.${canvasParts.content} > .${annotationParts.root}`)).not.toBeNull();
    expect(figure.querySelector(`:scope > .${annotationParts.legend}`)).not.toBeNull();
    expect(canvasRoot.querySelector(`.${annotationParts.legend}`)).toBeNull();
  });

  it("renders no canvas when not asked", () => {
    const { container } = render(
      <Annotated annotations={[{ for: ".part", children: "part" }]} subject={<p className="part">a</p>} />,
    );
    expect(container.querySelector(`.${canvasParts.root}`)).toBeNull();
    expect(container.querySelector(`.${annotationParts.figure} > .${annotationParts.root}`)).not.toBeNull();
  });
});
