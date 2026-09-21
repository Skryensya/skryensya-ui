import { diagramAttrs, diagramNodeText, diagramParts } from "@skryensya/core/diagram";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectDiagram, mountDiagram } from "./diagram.js";

/*
 * The geometry is proved in `packages/core/src/diagram.test.ts`, against numbers. What is proved
 * here is everything BETWEEN the DOM and those numbers, which is where a drawing actually breaks:
 * which element is which node, which coordinate space a rectangle arrives in, whether a second pass
 * over an unchanged frame rewrites the whole overlay, and whether the reading a screen reader gets
 * survives being derived from a node the same pass just wrote into.
 *
 * jsdom lays nothing out, so every box here is stated rather than measured. That is not a weaker
 * test: a real browser's numbers would make the assertions unrepeatable, and the one thing this file
 * has to get right (that a node's box, a label's translate and the path all share ONE origin) is
 * exactly what stated rectangles can pin.
 */

type Rect = { x: number; y: number; width: number; height: number };

/** Gives one element a box, in the page's own coordinates, for as long as the test wants it. */
const withBox = (element: Element, rect: Rect): void => {
  element.getBoundingClientRect = () =>
    ({
      x: rect.x,
      y: rect.y,
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height,
      toJSON: () => rect,
    }) as DOMRect;
};

type NodeSpec = { id: string; text: string; shape?: string };
type EdgeSpec = { from: string; to: string; label?: string; arrow?: string };

const frame = (nodes: readonly NodeSpec[], edges: readonly EdgeSpec[]): HTMLElement => {
  const root = document.createElement("div");
  root.className = diagramParts.root;
  root.setAttribute(diagramAttrs.root, "");
  root.innerHTML = `
    <svg class="${diagramParts.connectors}" aria-hidden="true" focusable="false"></svg>
    <ul class="${diagramParts.nodes}">
      ${nodes
        .map(
          (node) =>
            `<li class="${diagramParts.node}" data-node="${node.id}" data-shape="${node.shape ?? "process"}">${node.text}</li>`,
        )
        .join("")}
    </ul>
    <ul class="${diagramParts.edges}">
      ${edges
        .map(
          (edge) =>
            `<li class="${diagramParts.edge}" data-from="${edge.from}" data-to="${edge.to}" data-arrow="${edge.arrow ?? "end"}">${edge.label ?? ""}</li>`,
        )
        .join("")}
    </ul>
  `;
  document.body.append(root);
  return root;
};

const nodesOf = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(`.${diagramParts.node}`));
const edgesOf = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(`.${diagramParts.edge}`));
const overlayOf = (root: HTMLElement) =>
  root.querySelector<SVGSVGElement>(`.${diagramParts.connectors}`)!;

/*
 * One layout every test below shares, so an assertion can be read without re-deriving it. The frame
 * sits at the page origin, so frame coordinates and page coordinates are the same numbers:
 *
 *   the frame  at (  0,   0), 300 x 200
 *   top        at (100,   0), 100 x 40   (centre 150,  20)
 *   bottom     at (100, 100), 100 x 40   (centre 150, 120)
 */
const layOut = (root: HTMLElement): void => {
  withBox(root, { x: 0, y: 0, width: 300, height: 200 });
  withBox(root.querySelector(`.${diagramParts.nodes}`)!, { x: 0, y: 0, width: 300, height: 140 });
  const [first, second] = nodesOf(root);
  if (first) withBox(first, { x: 100, y: 0, width: 100, height: 40 });
  if (second) withBox(second, { x: 100, y: 100, width: 100, height: 40 });
};

const linear = (): HTMLElement => {
  const root = frame(
    [
      { id: "top", text: "Request" },
      { id: "bottom", text: "Response" },
    ],
    [{ from: "top", to: "bottom", label: "ok" }],
  );
  layOut(root);
  return root;
};

describe("connectDiagram", () => {
  let observed: Element[] = [];
  let fire: (() => void) | null = null;

  beforeEach(() => {
    observed = [];
    fire = null;
    /* The setup file's stub does nothing at all, and half of this component is what happens on the
       SECOND pass. This one records the callback so a test can BE the resize. */
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          fire = callback;
        }
        observe(element: Element) {
          observed.push(element);
        }
        unobserve() {}
        disconnect() {
          fire = null;
        }
      },
    );
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it("draws one connector group per edge, with the line first and the arrowhead after it", () => {
    const root = linear();
    connectDiagram(root);

    const groups = Array.from(overlayOf(root).children);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.getAttribute("class")).toBe(diagramParts.connector);
    expect(Array.from(groups[0]!.children).map((child) => child.getAttribute("class"))).toEqual([
      diagramParts.line,
      diagramParts.arrow,
    ]);
  });

  it("measures in the frame's own coordinates, so the path meets the boxes it was given", () => {
    const root = linear();
    connectDiagram(root);
    expect(overlayOf(root).querySelector("path")!.getAttribute("d")).toBe("M 150 40 L 150 88");
  });

  it("subtracts the frame's own offset rather than writing page coordinates", () => {
    const root = linear();
    /* The same drawing, 500px down the page: every number the overlay writes must be unchanged,
       because the overlay's `inset: 0` is resolved against the frame and not against the page. */
    withBox(root, { x: 40, y: 500, width: 300, height: 200 });
    withBox(root.querySelector(`.${diagramParts.nodes}`)!, { x: 40, y: 500, width: 300, height: 140 });
    withBox(nodesOf(root)[0]!, { x: 140, y: 500, width: 100, height: 40 });
    withBox(nodesOf(root)[1]!, { x: 140, y: 600, width: 100, height: 40 });
    connectDiagram(root);
    expect(overlayOf(root).querySelector("path")!.getAttribute("d")).toBe("M 150 40 L 150 88");
  });

  it("anchors each edge label to a point on its own stroke, clear of the arrowhead", () => {
    const root = linear();
    connectDiagram(root);
    expect(edgesOf(root)[0]!.style.translate).toBe("150px 66px");
  });

  it("flips the frame out of its no-JavaScript flow only once it has measured something", () => {
    const root = linear();
    expect(root.hasAttribute(diagramAttrs.placed)).toBe(false);
    connectDiagram(root);
    expect(root.hasAttribute(diagramAttrs.placed)).toBe(true);
  });

  it("measures nothing at all while the frame has no box, rather than drawing to its corner", () => {
    const root = linear();
    withBox(root.querySelector(`.${diagramParts.nodes}`)!, { x: 0, y: 0, width: 0, height: 0 });
    connectDiagram(root);
    expect(root.hasAttribute(diagramAttrs.placed)).toBe(false);
    expect(overlayOf(root).childElementCount).toBe(0);

    /* Becoming visible is a resize, and the observer is already watching for one. */
    layOut(root);
    fire?.();
    expect(root.hasAttribute(diagramAttrs.placed)).toBe(true);
    expect(overlayOf(root).querySelector("path")!.getAttribute("d")).toBe("M 150 40 L 150 88");
  });

  it("reads the authored shape, so a decision's connector leaves its face and not the empty corner", () => {
    const root = frame(
      [
        { id: "ask", text: "Authenticated?", shape: "decision" },
        { id: "yes", text: "Dashboard" },
      ],
      [{ from: "ask", to: "yes", label: "Yes" }],
    );
    withBox(root, { x: 0, y: 0, width: 300, height: 300 });
    withBox(root.querySelector(`.${diagramParts.nodes}`)!, { x: 0, y: 0, width: 300, height: 300 });
    withBox(nodesOf(root)[0]!, { x: 60, y: 0, width: 180, height: 180 });
    withBox(nodesOf(root)[1]!, { x: 90, y: 240, width: 120, height: 40 });
    connectDiagram(root);

    /* One connector, so it leaves the south vertex of the rhombus: (150, 180), not the bounding
       box's bottom edge at some other x. */
    expect(overlayOf(root).querySelector("path")!.getAttribute("d")).toContain("M 150 180");
  });

  it("keeps a group for an edge naming a node the drawing does not have, and hides its label", () => {
    const root = frame(
      [
        { id: "top", text: "Request" },
        { id: "bottom", text: "Response" },
      ],
      [
        { from: "top", to: "nowhere", label: "lost" },
        { from: "top", to: "bottom", label: "ok" },
      ],
    );
    layOut(root);
    connectDiagram(root);

    const groups = Array.from(overlayOf(root).children);
    expect(groups).toHaveLength(2);
    /* Empty, not absent: the pairing between an edge and its drawing is by index. */
    expect(groups[0]!.childElementCount).toBe(0);
    expect(groups[1]!.querySelector("path")!.getAttribute("d")).toBe("M 150 40 L 150 88");

    const [orphan, drawn] = edgesOf(root);
    expect(orphan!.hasAttribute(diagramAttrs.orphan)).toBe(true);
    expect(orphan!.style.translate).toBe("");
    expect(drawn!.hasAttribute(diagramAttrs.orphan)).toBe(false);
  });

  it("reads a node's own words past its mark, so a logo's alt never lands in the reading", () => {
    const root = linear();
    const target = nodesOf(root)[1]!;
    /* Authored markup, the way the emitter writes it: the mark comes before the words. An `alt`
       that says anything at all is the case worth pinning, because it is the one that would leak. */
    target.innerHTML =
      `<span class="${diagramParts.logo}"><img alt="Compute service" src="/x.svg"></span>` +
      `<span class="${diagramParts.title}">Response</span>`;
    connectDiagram(root);

    expect(diagramNodeText(target)).toBe("Response");
    /* The reading names the node it reaches, and the mark is not part of that name. */
    expect(nodesOf(root)[0]!.querySelector(`.${diagramParts.route}`)!.textContent).toBe(
      "ok, Response",
    );
  });

  it("writes into each node the ways out of it, announced and clipped out of sight", () => {
    const root = linear();
    connectDiagram(root);

    const routes = nodesOf(root)[0]!.querySelector(`.${diagramParts.routes}`)!;
    expect(routes.tagName).toBe("UL");
    expect(routes.classList.contains("sk-visually-hidden")).toBe(true);
    expect(Array.from(routes.children).map((line) => line.textContent)).toEqual(["ok, Response"]);
    /* A node with nowhere to go gets no list: "list, zero items" is a sentence about nothing. */
    expect(nodesOf(root)[1]!.querySelector(`.${diagramParts.routes}`)).toBeNull();
  });

  it("re-derives that reading without quoting the reading it wrote last time", () => {
    const root = linear();
    connectDiagram(root);
    fire?.();
    fire?.();

    const routes = nodesOf(root)[0]!.querySelector(`.${diagramParts.routes}`)!;
    expect(routes.childElementCount).toBe(1);
    expect(routes.children[0]!.textContent).toBe("ok, Response");
  });

  it("follows a node whose words changed, because the reading is derived and not copied once", () => {
    const root = linear();
    connectDiagram(root);
    nodesOf(root)[1]!.textContent = "Rechazado";
    fire?.();
    expect(nodesOf(root)[0]!.querySelector(`.${diagramParts.route}`)!.textContent).toBe(
      "ok, Rechazado",
    );
  });

  it("writes nothing on a second pass that decided the same thing", () => {
    const root = linear();
    connectDiagram(root);
    const path = overlayOf(root).querySelector("path")!;

    const writes = vi.spyOn(path, "setAttribute");
    fire?.();
    expect(writes).not.toHaveBeenCalled();
  });

  it("watches the frame, the grid, every node and every label chip", () => {
    const root = linear();
    connectDiagram(root);
    expect(observed).toContain(root);
    expect(observed).toContain(root.querySelector(`.${diagramParts.nodes}`));
    for (const node of nodesOf(root)) expect(observed).toContain(node);
    /* The chips too: how wide one turns out to be is what decides where along its connector it
       fits, so a chip that rewraps has to be re-placed. It cannot loop, because the enhancer moves
       a chip with `translate`, which does not change the box a ResizeObserver watches. */
    for (const edge of edgesOf(root)) expect(observed).toContain(edge);
  });

  it("keeps a labelled chip off the arrowhead of its own connector", () => {
    const root = linear();
    /* jsdom measures nothing, so the chip states its own size: 60 x 20, which is wide enough that
       a naive midpoint would sit on the head. */
    const chip = edgesOf(root)[0]!;
    withBox(chip, { x: 0, y: 0, width: 60, height: 20 });
    connectDiagram(root);

    const [, y] = chip.style.translate.split(" ").map(Number.parseFloat);
    /* The head's tip is at 92 and it is 8 long, so the chip's own bottom edge has to clear 84. */
    expect(y! + 10).toBeLessThan(84);
  });

  it("stops observing when it is torn down", () => {
    const root = linear();
    const cleanup = connectDiagram(root);
    expect(fire).not.toBeNull();
    cleanup();
    expect(fire).toBeNull();
  });

  it("does nothing at all to a frame that lost a part", () => {
    const root = document.createElement("div");
    root.className = diagramParts.root;
    root.setAttribute(diagramAttrs.root, "");
    document.body.append(root);
    expect(() => connectDiagram(root)()).not.toThrow();
    expect(root.hasAttribute(diagramAttrs.placed)).toBe(false);
  });

  it("mounts every authored frame below the target and is idempotent", async () => {
    linear();
    linear();
    expect(await mountDiagram(document)).toBe(2);
    expect(await mountDiagram(document)).toBe(0);
  });
});

/*
 * `diagramNodeText` lives in Core with the rest of the contract, and is proved here because Core's
 * own runner is Node by design (see `packages/core/vitest.config.ts`). Same split
 * `annotationElementRadius` sits on.
 */
describe("diagramNodeText", () => {
  it("reads a node's own words and skips the route list written into it", () => {
    const element = document.createElement("li");
    element.innerHTML = `Authenticated?<ul class="${diagramParts.routes}"><li>Yes, Dashboard</li></ul>`;
    expect(diagramNodeText(element)).toBe("Authenticated?");
  });

  it("collapses the whitespace authored markup indents a node with", () => {
    const element = document.createElement("li");
    element.textContent = "\n      Check the\n      token\n    ";
    expect(diagramNodeText(element)).toBe("Check the token");
  });

  it("keeps the words of a composition slotted into a node", () => {
    const element = document.createElement("li");
    element.innerHTML = `<strong>Retry</strong> <span>(3x)</span>`;
    expect(diagramNodeText(element)).toBe("Retry (3x)");
  });
});
