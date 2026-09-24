import { diagramParts } from "@skryensya/core/diagram";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Diagram } from "./diagram.js";

/*
 * The React half of the same contract `connectDiagram` realizes, held to the same assertions: the
 * geometry is Core's and is proved there, so what is proved here is the wiring around it plus the
 * one hazard React has and the enhancer does not, which is a measuring effect that sets state and
 * therefore schedules the render that would measure again.
 *
 * jsdom lays nothing out, so every box is stated. Same reasoning as the Vanilla suite, and the SAME
 * NUMBERS, so an assertion can be compared across the two files: frame at (0,0) 300x200, `top` at
 * (100,0) 100x40, `bottom` at (100,100) 100x40.
 */

type Rect = { x: number; y: number; width: number; height: number };

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

const nodesOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(`.${diagramParts.node}`));
const edgesOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(`.${diagramParts.edge}`));
const overlayOf = (container: HTMLElement) =>
  container.querySelector<SVGSVGElement>(`.${diagramParts.connectors}`)!;

const layOut = (container: HTMLElement): void => {
  withBox(container.querySelector(`.${diagramParts.root}`)!, { x: 0, y: 0, width: 300, height: 200 });
  withBox(container.querySelector(`.${diagramParts.nodes}`)!, { x: 0, y: 0, width: 300, height: 140 });
  const [first, second] = nodesOf(container);
  if (first) withBox(first, { x: 100, y: 0, width: 100, height: 40 });
  if (second) withBox(second, { x: 100, y: 100, width: 100, height: 40 });
};

const nodes = [
  { node: "top", children: "Request" },
  { node: "bottom", children: "Response" },
];
const edges = [{ from: "top", to: "bottom", children: "ok" }];

describe("Diagram", () => {
  let fire: (() => void) | null = null;
  let passes = 0;

  beforeEach(() => {
    fire = null;
    passes = 0;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          fire = () => {
            passes += 1;
            callback();
          };
        }
        observe() {}
        unobserve() {}
        disconnect() {
          fire = null;
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the frame, the node list and an overlay to draw into", () => {
    const { container } = render(<Diagram edges={edges} label="Request handling" nodes={nodes} />);

    const root = container.querySelector(`.${diagramParts.root}`)!;
    expect(root.hasAttribute("data-sk-diagram")).toBe(true);
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("aria-label")).toBe("Request handling");
    expect(container.querySelector(`.${diagramParts.nodes}`)!.tagName).toBe("UL");
    expect(nodesOf(container).map((node) => node.tagName)).toEqual(["LI", "LI"]);
    expect(overlayOf(container).getAttribute("aria-hidden")).toBe("true");
  });

  it("writes the same attributes on a node and an edge that authored markup carries", () => {
    const { container } = render(
      <Diagram
        edges={[{ from: "top", to: "bottom", arrow: "both" }]}
        label="Request handling"
        nodes={[
          { node: "top", shape: "terminal", span: 2, children: "Request" },
          { node: "bottom", children: "Response" },
        ]}
      />,
    );
    const [first, second] = nodesOf(container);
    expect(first!.getAttribute("data-node")).toBe("top");
    expect(first!.getAttribute("data-shape")).toBe("terminal");
    expect(first!.style.getPropertyValue("--sk-diagram-node-span")).toBe("2");
    /* The default is written, not omitted: the markup emitter fills it, so a silent default here
       would read as a divergence at the symmetry gate that does not exist. */
    expect(second!.getAttribute("data-shape")).toBe("process");
    expect(second!.style.getPropertyValue("--sk-diagram-node-span")).toBe("");

    const [edge] = edgesOf(container);
    expect(edge!.getAttribute("data-from")).toBe("top");
    expect(edge!.getAttribute("data-to")).toBe("bottom");
    expect(edge!.getAttribute("data-arrow")).toBe("both");
  });

  it("gives a node's mark a box of its own, and a node without one no box at all", () => {
    const { container } = render(
      <Diagram
        edges={edges}
        label="Request handling"
        nodes={[
          { node: "top", logo: <img alt="" src="/demos/services/compute.svg" />, children: "Request" },
          { node: "bottom", children: "Response" },
        ]}
      />,
    );
    const [first, second] = nodesOf(container);
    const logo = first!.querySelector(`.${diagramParts.logo}`);
    expect(logo).not.toBeNull();
    /* Before the words: a mark is read before a name. */
    expect(logo!.nextElementSibling!.className).toBe(diagramParts.title);
    expect(logo!.querySelector("img")).not.toBeNull();
    /* And nothing at all where there is no mark: an empty box would still take its own width. */
    expect(second!.querySelector(`.${diagramParts.logo}`)).toBeNull();
  });

  it("takes any tree as a mark, not a source, so an icon and an image land the same way", () => {
    const { container } = render(
      <Diagram
        edges={edges}
        label="Request handling"
        nodes={[
          { node: "top", logo: <svg data-glyph="" />, children: "Request" },
          { node: "bottom", children: "Response" },
        ]}
      />,
    );
    expect(
      nodesOf(container)[0]!.querySelector(`.${diagramParts.logo} svg`),
    ).not.toBeNull();
  });

  it("puts the column count on the frame as the hook the stylesheet reads", () => {
    const { container } = render(
      <Diagram columns={2} edges={edges} label="Request handling" nodes={nodes} />,
    );
    expect(
      container.querySelector<HTMLElement>(`.${diagramParts.root}`)!.style.getPropertyValue(
        "--sk-diagram-columns",
      ),
    ).toBe("2");
  });

  it("draws the same connector the enhancer draws, in the same shape", async () => {
    const { container } = render(<Diagram edges={edges} label="Request handling" nodes={nodes} />);
    layOut(container);
    await act(async () => fire?.());

    const groups = Array.from(overlayOf(container).children);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.getAttribute("class")).toBe(diagramParts.connector);
    expect(Array.from(groups[0]!.children).map((child) => child.getAttribute("class"))).toEqual([
      diagramParts.line,
      diagramParts.arrow,
    ]);
    expect(groups[0]!.querySelector("path")!.getAttribute("d")).toBe("M 150 40 L 150 88");
  });

  it("divides a canvas's zoom back out, so a scaled drawing routes exactly as an unscaled one", async () => {
    const { container } = render(<Diagram edges={edges} label="Request handling" nodes={nodes} />);
    /* Inside a Canvas zoomed to 200%: every rect doubled, the layout box still 300 wide. */
    const root = container.querySelector<HTMLElement>(`.${diagramParts.root}`)!;
    Object.defineProperty(root, "offsetWidth", { configurable: true, value: 300 });
    withBox(root, { x: 0, y: 0, width: 600, height: 400 });
    withBox(container.querySelector(`.${diagramParts.nodes}`)!, { x: 0, y: 0, width: 600, height: 280 });
    const [first, second] = nodesOf(container);
    withBox(first!, { x: 200, y: 0, width: 200, height: 80 });
    withBox(second!, { x: 200, y: 200, width: 200, height: 80 });
    await act(async () => fire?.());
    expect(overlayOf(container).querySelector("path")!.getAttribute("d")).toBe("M 150 40 L 150 88");
  });

  it("anchors each edge label to a point on its own stroke, clear of the arrowhead", async () => {
    const { container } = render(<Diagram edges={edges} label="Request handling" nodes={nodes} />);
    layOut(container);
    await act(async () => fire?.());
    expect(edgesOf(container)[0]!.style.translate).toBe("150px 66px");
  });

  it("flips the frame out of its no-JavaScript flow only once it has measured something", async () => {
    const { container } = render(<Diagram edges={edges} label="Request handling" nodes={nodes} />);
    const root = container.querySelector(`.${diagramParts.root}`)!;
    expect(root.hasAttribute("data-sk-placed")).toBe(false);
    layOut(container);
    await act(async () => fire?.());
    expect(root.hasAttribute("data-sk-placed")).toBe(true);
  });

  it("writes into each node the ways out of it, announced and clipped out of sight", async () => {
    const { container } = render(<Diagram edges={edges} label="Request handling" nodes={nodes} />);
    layOut(container);
    await act(async () => fire?.());

    const routes = nodesOf(container)[0]!.querySelector(`.${diagramParts.routes}`)!;
    expect(routes.tagName).toBe("UL");
    expect(routes.classList.contains("sk-visually-hidden")).toBe(true);
    expect(Array.from(routes.children).map((line) => line.textContent)).toEqual(["ok, Response"]);
    expect(nodesOf(container)[1]!.querySelector(`.${diagramParts.routes}`)).toBeNull();
  });

  it("does not quote the reading it wrote last time, however many passes run", async () => {
    const { container } = render(<Diagram edges={edges} label="Request handling" nodes={nodes} />);
    layOut(container);
    await act(async () => fire?.());
    await act(async () => fire?.());
    await act(async () => fire?.());

    const routes = nodesOf(container)[0]!.querySelector(`.${diagramParts.routes}`)!;
    expect(routes.childElementCount).toBe(1);
    expect(routes.children[0]!.textContent).toBe("ok, Response");
  });

  it("keeps a group for an edge that could not be routed, and hides its label", async () => {
    const { container } = render(
      <Diagram
        edges={[
          { from: "top", to: "nowhere", children: "lost" },
          { from: "top", to: "bottom", children: "ok" },
        ]}
        label="Request handling"
        nodes={nodes}
      />,
    );
    layOut(container);
    await act(async () => fire?.());

    const groups = Array.from(overlayOf(container).children);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.childElementCount).toBe(0);
    expect(edgesOf(container)[0]!.hasAttribute("data-sk-orphan")).toBe(true);
    expect(edgesOf(container)[1]!.hasAttribute("data-sk-orphan")).toBe(false);
  });

  it("stops re-measuring once a pass decides what the last one did", async () => {
    const { container } = render(<Diagram edges={edges} label="Request handling" nodes={nodes} />);
    layOut(container);
    await act(async () => fire?.());
    const settled = passes;

    await act(async () => fire?.());
    /* One more pass because this test fired one, and not a chain of them: the state guard is what
       stops the render it would otherwise schedule from measuring again. */
    expect(passes).toBe(settled + 1);
    expect(overlayOf(container).querySelector("path")!.getAttribute("d")).toBe("M 150 40 L 150 88");
  });

  it("measures nothing at all while the frame has no box", async () => {
    const { container } = render(<Diagram edges={edges} label="Request handling" nodes={nodes} />);
    withBox(container.querySelector(`.${diagramParts.nodes}`)!, { x: 0, y: 0, width: 0, height: 0 });
    await act(async () => fire?.());
    expect(overlayOf(container).childElementCount).toBe(0);

    layOut(container);
    await act(async () => fire?.());
    expect(overlayOf(container).querySelector("path")!.getAttribute("d")).toBe("M 150 40 L 150 88");
  });

  /*
   * THE GATES, on the same numbers the Vanilla suite states, so the two files can be read against
   * each other: a and b on the left, an AND at (200, 40) 60 x 48 whose nose is (260, 64) and whose
   * input thirds are 56 and 72, and a terminal level with the nose.
   */
  describe("a logic gate", () => {
    const gateNodes = [
      { node: "a", children: "A" },
      { node: "b", children: "B" },
      { node: "and", shape: "and" as const, children: "AND" },
      { node: "carry", shape: "terminal" as const, children: "Carry" },
    ];
    const gateEdges = [
      { from: "a", to: "and", arrow: "none" as const },
      { from: "b", to: "and", arrow: "none" as const },
      { from: "and", to: "carry", arrow: "none" as const },
    ];

    const layOutGates = (container: HTMLElement): void => {
      withBox(container.querySelector(`.${diagramParts.root}`)!, { x: 0, y: 0, width: 400, height: 200 });
      withBox(container.querySelector(`.${diagramParts.nodes}`)!, { x: 0, y: 0, width: 400, height: 200 });
      const [a, b, gate, carry] = nodesOf(container);
      withBox(a!, { x: 0, y: 20, width: 80, height: 40 });
      withBox(b!, { x: 0, y: 100, width: 80, height: 40 });
      withBox(gate!, { x: 200, y: 40, width: 60, height: 48 });
      withBox(carry!, { x: 320, y: 44, width: 80, height: 40 });
    };

    const linesOf = (container: HTMLElement): number[][] =>
      Array.from(overlayOf(container).querySelectorAll(`.${diagramParts.line}`)).map((line) =>
        (line.getAttribute("d") ?? "").split(/[^-\d.]+/).filter(Boolean).map(Number),
      );

    it("writes a gate's shape onto the node, the same attribute the enhancer reads", () => {
      const { container } = render(
        <Diagram edges={gateEdges} label="Half adder" nodes={gateNodes} />,
      );
      expect(nodesOf(container)[2]!.getAttribute("data-shape")).toBe("and");
    });

    it("draws the same ports the Vanilla binding draws: the back thirds, and one nose", async () => {
      const { container } = render(
        <Diagram edges={gateEdges} label="Half adder" nodes={gateNodes} />,
      );
      layOutGates(container);
      await act(async () => fire?.());

      const [first, second, result] = linesOf(container);
      expect(first!.slice(-2)).toEqual([200, 56]);
      expect(second!.slice(-2)).toEqual([200, 72]);
      expect(result!.slice(0, 2)).toEqual([260, 64]);
    });

    it("draws a designator under a gate, and nothing at all where none was given", () => {
      const { container } = render(
        <Diagram
          edges={gateEdges}
          label="Half adder"
          nodes={gateNodes.map((node) => (node.node === "and" ? { ...node, designator: "U1" } : node))}
        />,
      );
      const [, , gate, carry] = nodesOf(container);
      const designator = gate!.querySelector(`.${diagramParts.designator}`);
      expect(designator!.textContent).toBe("U1");
      /* After the words, and its own element: the box is the symbol, so this is drawn beside it
         rather than in it. */
      expect(designator!.previousElementSibling!.className).toBe(diagramParts.title);
      /* An empty span would still be an element the stylesheet has to position. */
      expect(carry!.querySelector(`.${diagramParts.designator}`)).toBeNull();
    });

    it("keeps a designator out of the announced reading of the drawing", async () => {
      const { container } = render(
        <Diagram
          edges={gateEdges}
          label="Half adder"
          nodes={gateNodes.map((node) => (node.node === "and" ? { ...node, designator: "U1" } : node))}
        />,
      );
      layOutGates(container);
      await act(async () => fire?.());

      /* "AND, Carry" and not "AND U1, Carry": a designator is a handle for prose to point at, not
         another name for the part. `diagramNodeText` returns the title part alone. */
      const routes = nodesOf(container)[2]!.querySelector(`.${diagramParts.routes}`)!;
      expect(routes.textContent).not.toContain("U1");
      expect(routes.textContent).toContain("Carry");
    });

    it("keeps a gate's name in the markup, because only the stylesheet hides it", async () => {
      const { container } = render(
        <Diagram edges={gateEdges} label="Half adder" nodes={gateNodes} />,
      );
      layOutGates(container);
      await act(async () => fire?.());

      const gate = nodesOf(container)[2]!;
      expect(gate.querySelector(`.${diagramParts.title}`)!.textContent).toBe("AND");
      expect(gate.querySelector(`.${diagramParts.routes}`)!.textContent).toContain("Carry");
    });
  });
});
