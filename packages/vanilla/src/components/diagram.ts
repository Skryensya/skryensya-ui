import {
  diagramAttrs,
  diagramNodeText,
  diagramParts,
  diagramRoutes,
  diagramZoneHeaders,
  diagramZoneNames,
  isDiagramArrow,
  placeDiagramZones,
  isDiagramShape,
  routeDiagram,
  type DiagramArrow,
  type DiagramBox,
  type DiagramDirection,
  type DiagramEdgeInput,
  type DiagramEdgePlacement,
  type DiagramNodeMeasurement,
  type DiagramRowMeasurement,
  type DiagramShape,
  type DiagramZoneInput,
  type DiagramZonePlacement,
} from "@skryensya/core/diagram";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${diagramAttrs.root}]`;
const SVG_NS = "http://www.w3.org/2000/svg";
const VISUALLY_HIDDEN = "sk-visually-hidden";

type Cleanup = () => void;

/*
 * DIAGRAM, the DOM shell around `@skryensya/core/diagram`'s geometry.
 *
 * The division is Annotation's, and it is the same division for the same reason: this file MEASURES
 * and ASSIGNS, and holds not one line of geometry. A list of boxes goes out to `routeDiagram`, a
 * path, a couple of arrowheads and a midpoint come back per edge, and the only decisions left here
 * are platform ones: which element is which node, when to re-measure, and how to write the overlay
 * without rebuilding it on every frame.
 *
 * IT IS NOTICEABLY SHORTER THAN `connectAnnotated`, and the missing parts are worth naming because
 * they are not omissions:
 *
 *   NO FLOW-POSITION RECONSTRUCTION. Annotation's labels are grid items it nudges with a
 *   `translate`, so it has to subtract the offset it already applied to recover where the stylesheet
 *   put them. An edge label here is `position: absolute` at the frame's origin and nowhere else, so
 *   its `translate` IS its position: there is no flow box to recover and nothing to subtract.
 *
 *   NO HOVER PAIRING. Annotation has to light one mark at a time because a label in a gutter and a
 *   ring in an overlay are two elements in different subtrees and nothing on screen says they belong
 *   together. Here the line between two nodes is permanently drawn: the pairing IS the drawing.
 *
 *   NO `inert`. Annotation freezes its subject because the subject is somebody else's live
 *   component. A diagram's nodes are text the author wrote for this drawing.
 *
 * WHAT IS OBSERVED, and why it is not just the root. A node's box changes when its text rewraps,
 * which happens when the frame resizes; the grid's own box changes when a node grows a line. So the
 * root, the node list and every node are all observed, and `document.fonts.ready` re-runs the pass
 * once more: a webfont landing after first paint moves every box by a few pixels, and a diagram is
 * exactly the kind of drawing where a few pixels read as a mistake.
 *
 * THE EDGE LABELS ARE OBSERVED TOO, and they did not use to be. While a chip was simply centred on
 * the middle of its line, how wide it turned out to be changed nothing here. It decides its own
 * position now (`placeDiagramLabel` slides it along the connector until it clears the arrowhead and
 * every node), so its size is an INPUT, and a chip that rewrapped on a narrower frame would
 * otherwise keep the position its old size earned. Feeding it back is safe and cannot loop: a chip
 * is `position: absolute` and moved with `translate`, neither of which changes the box a
 * `ResizeObserver` watches.
 */
export function connectDiagram(root: HTMLElement): Cleanup {
  const list = root.querySelector<HTMLElement>(`.${diagramParts.nodes}`);
  const overlay = root.querySelector<SVGSVGElement>(`.${diagramParts.connectors}`);

  /* Nothing to draw between: a frame with no node list or no overlay is authored markup that lost a
     part, and there is no sensible half-measure to fall back to. */
  if (!list || !overlay) return () => {};

  const nodes = Array.from(list.querySelectorAll<HTMLElement>(`:scope > .${diagramParts.node}`));
  const zones = Array.from(
    root.querySelectorAll<HTMLElement>(`.${diagramParts.zones} > .${diagramParts.zone}`),
  );
  const edges = Array.from(
    root.querySelectorAll<HTMLElement>(`.${diagramParts.edges} > .${diagramParts.edge}`),
  );

  /*
   * Read ONCE: which shape a node is drawn with and which ends of an edge are arrowheads are
   * compose-time decisions about how the drawing is made, not runtime state, so re-reading them on
   * every resize frame would be measuring the DOM for a constant.
   */
  const shapes = nodes.map(shapeOf);
  const ids = nodes.map((node) => node.getAttribute(diagramAttrs.node) ?? "");
  /* A record's rows, found once: which element is which row is authored structure, not state. */
  const rows = nodes.map((node) =>
    Array.from(node.querySelectorAll<HTMLElement>(`.${diagramParts.row}`)).map((element) => ({
      id: element.getAttribute(diagramAttrs.row) ?? "",
      element,
    })),
  );
  /*
   * Each zone's own name, kept beside its zone. Its WIDTH is what the router needs, so a connector
   * entering the region can land beside the words rather than through them (`diagramZoneNames`),
   * and the width is the one thing about the label that can be read at any time: a word is as wide
   * as it is whether it is sitting in the flow fallback or placed in the corner of a boundary.
   */
  const zoneLabels = zones.map((zone) =>
    zone.querySelector<HTMLElement>(`.${diagramParts.zoneLabel}`),
  );
  /* Which zone each node is innermost in, and how the zones nest: authored structure, read once. */
  const zoneWiring: DiagramZoneInput[] = zones.map((zone) => ({
    zone: zone.getAttribute(diagramAttrs.zone) ?? "",
    within: zone.getAttribute(diagramAttrs.within) ?? undefined,
  }));
  const nodeZones = new Map<string, string>();
  nodes.forEach((node, index) => {
    const zone = node.getAttribute(diagramAttrs.zone);
    if (zone) nodeZones.set(ids[index]!, zone);
  });

  const wiring = edges.map((edge) => ({
    from: edge.getAttribute(diagramAttrs.from) ?? "",
    to: edge.getAttribute(diagramAttrs.to) ?? "",
    fromRow: edge.getAttribute(diagramAttrs.fromRow) ?? undefined,
    toRow: edge.getAttribute(diagramAttrs.toRow) ?? undefined,
    arrow: arrowOf(edge),
  }));

  /** The words of one node's row, for the reading. Empty when the edge names no row, or a wrong one. */
  const rowTextOf = (nodeId: string, rowId: string | undefined): string | undefined => {
    if (!rowId) return undefined;
    const at = ids.indexOf(nodeId);
    const row = at < 0 ? undefined : rows[at]!.find((candidate) => candidate.id === rowId);
    return row?.element.textContent?.replace(/\s+/g, " ").trim() || undefined;
  };

  let previous: readonly (DiagramEdgePlacement | null)[] | null = null;
  let previousRoutes: string | null = null;
  let previousRegions: string | null = null;
  let frame = 0;

  const sync = (): void => {
    frame = 0;
    const rootRect = root.getBoundingClientRect();
    /* The overlay resolves `inset: 0` against the PADDING box, so the origin every coordinate is
       written in is the border box shifted in by the border itself. */
    const originX = rootRect.left + root.clientLeft;
    const originY = rootRect.top + root.clientTop;
    const relative = (element: Element): DiagramBox => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left - originX,
        y: rect.top - originY,
        width: rect.width,
        height: rect.height,
      };
    };

    /*
     * A FRAME WITH NO BOX IS NOT MEASURED AT ALL, and this is not defensiveness. A diagram inside a
     * closed tab panel, or one enhanced before it is in the document, reports every rectangle as
     * zero; every connector would then be a zero-length line between two points at the origin, and
     * `data-sk-placed` would flip the labels into an overlay where they would all sit on top of one
     * another. Waiting costs nothing: becoming visible is a resize, and the observer is already
     * watching for one.
     */
    const listBox = relative(list);
    if (listBox.width === 0 && listBox.height === 0) return;

    const measurements: DiagramNodeMeasurement[] = nodes.map((node, index) => ({
      id: ids[index]!,
      box: relative(node),
      shape: shapes[index]!,
      /* Measured every pass with everything else: a row's height is what an anchored connector
         touches at, and it moves whenever the text rewraps. */
      rows: rows[index]!.map(
        (row): DiagramRowMeasurement => ({ id: row.id, box: relative(row.element) }),
      ),
    }));

    /* The chip's size is measured on every pass, with the rest: it is what decides where the label
       can fit, and it changes whenever the text rewraps. A hidden chip (an unlabelled edge is
       `display: none`) measures zero, which is exactly "nothing to keep clear of". */
    const inputs: DiagramEdgeInput[] = wiring.map((edge, index) => {
      const chip = edges[index]!.getBoundingClientRect();
      return { ...edge, label: { width: chip.width, height: chip.height } };
    });

    const direction: DiagramDirection =
      getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr";
    /*
     * ZONES FIRST, and the order is load-bearing rather than tidy. A region is computed from the
     * node boxes alone, so it owes the router nothing; the router owes IT something, which is to
     * keep a connector's rail from running along a region's name. Routing first would mean either
     * routing twice or drawing a line through the words "Private subnet".
     */
    const regions = placeDiagramZones(measurements, zoneWiring, nodeZones);
    const placements = routeDiagram(measurements, inputs, {
      direction,
      keepRailsOut: diagramZoneHeaders(regions),
      keepPortsOut: diagramZoneNames(
        regions,
        zoneLabels.map((label) => label?.getBoundingClientRect().width ?? 0),
        { direction },
      ),
    });

    /*
     * THE READING, recomputed from the same pass. It depends on the nodes' own words rather than on
     * their boxes, so nothing here would need a resize to be right; running it in the same pass is
     * what makes a node whose text CHANGED (a locale swap, a longer translation) correct without a
     * second observer, since text that changed also changed a box.
     */
    const routes = diagramRoutes(
      nodes.map((node, index) => ({ id: ids[index]!, text: diagramNodeText(node) })),
      edges.map((edge, index) => ({
        from: wiring[index]!.from,
        to: wiring[index]!.to,
        label: edge.textContent ?? "",
        toRow: rowTextOf(wiring[index]!.to, wiring[index]!.toRow),
      })),
    );
    const routeKey = JSON.stringify(routes);
    if (routeKey !== previousRoutes) {
      previousRoutes = routeKey;
      nodes.forEach((node, index) => writeRoutes(node, routes[index]!));
    }

    /* A pass that decided nothing new writes nothing: a `ResizeObserver` fires for every observed
       element, so one resize of the frame arrives once per node plus twice more, and each of those
       would otherwise rewrite the whole overlay. */
    const regionKey = JSON.stringify(regions);
    const settled = previous !== null && same(previous, placements) && regionKey === previousRegions;
    if (settled) return;
    previous = placements;
    previousRegions = regionKey;

    drawZones(zones, regions);

    placements.forEach((placement, index) => {
      const edge = edges[index]!;
      if (!placement) {
        edge.toggleAttribute(diagramAttrs.orphan, true);
        edge.style.removeProperty("translate");
        return;
      }
      edge.removeAttribute(diagramAttrs.orphan);
      edge.style.translate = `${placement.label.x}px ${placement.label.y}px`;
    });

    drawConnectors(overlay, placements);
    /* Last, and only now: the stylesheet keeps the labels in normal flow until this appears, so a
       reader with no JavaScript (or with it still loading) reads them as a row under the nodes
       rather than as a pile at the frame's corner. */
    root.toggleAttribute(diagramAttrs.placed, true);
  };

  const schedule = (): void => {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  };

  /* A zone's own box is written, never measured, so it is not observed: it follows the nodes it
     holds, and those already are. */
  const observer = new ResizeObserver(schedule);
  observer.observe(root);
  observer.observe(list);
  for (const node of nodes) observer.observe(node);
  for (const edge of edges) observer.observe(edge);

  /* One more pass once the webfonts are in, and it is deliberately not awaited by anything: a frame
     that never loads a font has already drawn itself correctly by then. */
  let cancelled = false;
  void document.fonts?.ready.then(() => {
    if (!cancelled) schedule();
  });

  sync();

  return () => {
    cancelled = true;
    if (frame) cancelAnimationFrame(frame);
    observer.disconnect();
  };
}

const shapeOf = (node: HTMLElement): DiagramShape => {
  const authored = node.getAttribute(diagramAttrs.shape);
  return isDiagramShape(authored) ? authored : "process";
};

const arrowOf = (edge: HTMLElement): DiagramArrow => {
  const authored = edge.getAttribute(diagramAttrs.arrow);
  return isDiagramArrow(authored) ? authored : "end";
};

const samePlacement = (
  a: DiagramEdgePlacement | null,
  b: DiagramEdgePlacement | null,
): boolean => {
  if (a === null || b === null) return a === b;
  return (
    a.path === b.path &&
    a.label.x === b.label.x &&
    a.label.y === b.label.y &&
    a.arrows.length === b.arrows.length &&
    a.arrows.every((arrow, index) => arrow === b.arrows[index])
  );
};

const same = (
  a: readonly (DiagramEdgePlacement | null)[],
  b: readonly (DiagramEdgePlacement | null)[],
): boolean => a.length === b.length && a.every((placement, index) => samePlacement(placement, b[index]!));

/**
 * The route list inside one node, reconciled rather than replaced.
 *
 * Replaced would be simpler and would also be a loop: removing and re-appending a child is a
 * `childList` mutation, and anything watching the node for one would schedule the pass that just
 * ran. Reconciling by count and writing text only where it differs means a settled diagram makes no
 * DOM writes at all, which is what lets this run on every resize frame without thinking about it.
 *
 * A node with nowhere to go loses its list entirely: an empty `<ul>` is announced as "list, zero
 * items", which is a sentence about nothing.
 */
function writeRoutes(node: HTMLElement, lines: readonly string[]): void {
  let list = node.querySelector<HTMLElement>(`:scope > .${diagramParts.routes}`);
  if (lines.length === 0) {
    list?.remove();
    return;
  }
  if (!list) {
    list = document.createElement("ul");
    list.className = `${diagramParts.routes} ${VISUALLY_HIDDEN}`;
    node.append(list);
  }
  while (list.childElementCount > lines.length) list.lastElementChild!.remove();
  while (list.childElementCount < lines.length) {
    const item = document.createElement("li");
    item.className = diagramParts.route;
    list.append(item);
  }
  lines.forEach((line, index) => {
    const item = list.children[index] as HTMLElement;
    if (item.textContent !== line) item.textContent = line;
  });
}

/**
 * The overlay's children, reconciled rather than replaced.
 *
 * ONE `<g>` PER EDGE, ALWAYS, including an edge that could not be routed, and that is not tidiness:
 * a shorter list would make the overlay's indices and the edge list's indices different the moment
 * one edge named a missing node, and every connector after the gap would belong to its neighbour.
 * An empty `<g>` renders nothing, so the placeholder costs a reader precisely nothing and keeps the
 * index the one thing that cannot go wrong. Annotation learned exactly this about its marks.
 *
 * Reusing the existing elements is what keeps this from being an `innerHTML =` on every resize
 * frame; it also keeps the DOM the React binding produces and the DOM this produces the same shape,
 * which is the thing the symmetry gate is actually comparing.
 */
function drawConnectors(
  overlay: SVGSVGElement,
  placements: readonly (DiagramEdgePlacement | null)[],
): void {
  while (overlay.childElementCount > placements.length) overlay.lastElementChild!.remove();
  while (overlay.childElementCount < placements.length) {
    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("class", diagramParts.connector);
    overlay.append(group);
  }

  placements.forEach((placement, index) => {
    const group = overlay.children[index]!;
    const wanted = placement === null ? 0 : 1 + placement.arrows.length;
    while (group.childElementCount > wanted) group.lastElementChild!.remove();
    while (group.childElementCount < wanted) {
      const path = document.createElementNS(SVG_NS, "path");
      /* The line is always the first child and the arrowheads follow it, so the class each element
         carries is decided by its position and never has to be re-read. */
      path.setAttribute("class", group.childElementCount === 0 ? diagramParts.line : diagramParts.arrow);
      group.append(path);
    }
    if (!placement) return;
    group.children[0]!.setAttribute("d", placement.path);
    placement.arrows.forEach((arrow, at) => {
      group.children[at + 1]!.setAttribute("d", arrow);
    });
  });
}

/**
 * Each zone's boundary, written as a position and a size.
 *
 * The rectangle is the OUTSIDE of the line, which is why the stylesheet gives a placed zone
 * `box-sizing: border-box`: what the geometry computed is where the border goes, not where its
 * padding starts. A zone holding nothing is left with no `left` at all, and the stylesheet hides
 * exactly that: a region around no nodes has no box, and a box of zero at the origin is a dot in
 * the corner of the drawing rather than an absence.
 *
 * PHYSICAL INSETS AND NOT `translate`, which is what this wrote first and is the one thing here
 * that is about PAINTING rather than about geometry. A non-none `translate` makes its element a
 * stacking context, and a stacking context is a lid: the zone's own name could then never be
 * painted above the connectors, however it was ordered, because everything inside the zone stacks
 * inside the zone. A caption a wire runs through is the failure that causes (see
 * `.sk-diagram__zone-label` in `diagram.css`). Insets place the same box in the same place, cost
 * the same pass, and leave the lid off.
 *
 * `left`/`top` and not the logical pair, for the reason the whole module is physical: these numbers
 * came out of `getBoundingClientRect`, and a right-to-left document would otherwise mirror them
 * twice.
 */
function drawZones(
  zones: readonly HTMLElement[],
  regions: readonly DiagramZonePlacement[],
): void {
  zones.forEach((zone, index) => {
    const region = regions[index];
    if (!region) {
      zone.style.removeProperty("left");
      zone.style.removeProperty("top");
      zone.style.removeProperty("inline-size");
      zone.style.removeProperty("block-size");
      return;
    }
    zone.style.left = `${region.box.x}px`;
    zone.style.top = `${region.box.y}px`;
    zone.style.inlineSize = `${region.box.width}px`;
    zone.style.blockSize = `${region.box.height}px`;
  });
}

export const mountDiagram = createConnectMount({
  key: "diagram",
  rootSelector,
  connect: connectDiagram,
});
