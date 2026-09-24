import {
  diagramAttrs,
  diagramContract,
  diagramNodeText,
  diagramParts,
  diagramRoutes,
  diagramScale,
  diagramZoneHeaders,
  diagramZoneNames,
  placeDiagramZones,
  routeDiagram,
  type DiagramArrow,
  type DiagramBox,
  type DiagramDirection,
  type DiagramEdgePlacement,
  type DiagramNodeMeasurement,
  type DiagramRowMeasurement,
  type DiagramShape,
  type DiagramZonePlacement,
} from "@skryensya/core/diagram";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

/* Derived, never restated: the defaults live in the contract. */
const nodeShape = diagramContract.signatures.Diagram.slots.nodes.item.options.shape;
const edgeArrow = diagramContract.signatures.Diagram.slots.edges.item.options.arrow;

const VISUALLY_HIDDEN = "sk-visually-hidden";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/** One region drawn around the nodes that name it. It lays nothing out; it draws a boundary. */
export type DiagramZoneEntry = {
  /** This zone's name. What a node's `zone` and another zone's `within` point at. */
  zone: string;
  /** The zone this one is inside, when it is nested. */
  within?: string;
  children: ReactNode;
};

/** One named line inside a record. Addressable, which is why it has a name of its own. */
export type DiagramRowEntry = {
  /** This row's name, unique within its node. What an edge's `fromRow`/`toRow` points at. */
  row: string;
  children: ReactNode;
};

/** One node: what it says, what it is called, and how it is drawn. */
export type DiagramNodeEntry = {
  /** This node's name. What an edge points at, and unique within one diagram. */
  node: string;
  /** Which silhouette it is drawn with. Default `process`. */
  shape?: DiagramShape;
  /** How many grid columns it covers. A decision sits over both of its branches. */
  span?: number;
  /** The INNERMOST zone this node is in. Whether that zone nests is the zone's own business. */
  zone?: string;
  /**
   * This node's mark: a product logo, a service glyph, an icon.
   *
   * Anything that renders. An `<img>` at an SVG or a PNG, an `<svg>`, an `Icon` from whichever set
   * is installed. The component gives it a box of a known size (`--sk-diagram-logo-size`) and
   * nothing else: the kit ships no brand marks, so a diagram's logos are the author's to bring.
   */
  logo?: ReactNode;
  /**
   * The named lines inside this box: a class's members, a table's columns. A rule appears above
   * them, which is what turns a box into a record. A decision refuses them (a rhombus cuts a list
   * off at both ends), and the stylesheet hides them rather than drawing half of one.
   */
  rows?: readonly DiagramRowEntry[];
  /**
   * This node's VISIBLE name, drawn under the box and never measured.
   *
   * For the shape whose box cannot hold one: a gate is a silhouette with no inside, so its
   * `children` are clipped by the stylesheet and this is where a reference designator (`U1`, `G3`)
   * goes. It is positioned rather than laid out, because every port is measured from the node's box
   * and text in flow would move the nose off the symbol. It hangs into the rank gap as a result,
   * and the stylesheet reserves a line of caption for it there and below the last rank, so nothing
   * has to be tuned. Not announced as the node's name: the route list quotes the title alone.
   */
  designator?: ReactNode;
  children: ReactNode;
};

/** One relationship. Directional unless told otherwise. */
export type DiagramEdgeEntry = {
  /** The node this edge leaves. Must name one of `nodes`. */
  from: string;
  /** The node it reaches. Must name one of `nodes`; may be the same one. */
  to: string;
  /**
   * Which row of each end this edge is anchored to, when it is about a row rather than a box. The
   * connector then touches that node's side at the row's own height, and comes in inline, because
   * a row has a height and no width.
   */
  fromRow?: string;
  toRow?: string;
  /** Which ends carry an arrowhead. Default `end`. */
  arrow?: DiagramArrow;
  /** What the relationship is called ("Yes", "on error"). Most edges have none. */
  children?: ReactNode;
};

export type DiagramProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Names the drawing, and makes the frame a `group`. Required: see the contract's `a11y` rule. */
  label: string;
  nodes: readonly DiagramNodeEntry[];
  edges: readonly DiagramEdgeEntry[];
  /** How many columns the node grid has. Omitted, the stylesheet's own `1` answers. */
  columns?: number;
  /** Labelled regions drawn around the nodes that name them. Most diagrams have none. */
  zones?: readonly DiagramZoneEntry[];
};

type Drawing = {
  readonly placements: readonly (DiagramEdgePlacement | null)[];
  readonly routes: readonly (readonly string[])[];
  readonly regions: readonly DiagramZonePlacement[];
};

const EMPTY: Drawing = { placements: [], routes: [], regions: [] };

/*
 * DIAGRAM: the React half of the same contract the Vanilla enhancer connects to.
 *
 * It copies `connectDiagram` rather than improving on it (the rule for every family whose two
 * bindings must stay one behaviour), and both of them are thin for the same reason: the geometry is
 * `@skryensya/core/diagram`'s, and what is left here is measuring rectangles and assigning the
 * strings that come back.
 *
 * The one thing React has to be careful about that the enhancer does not: this measures in an effect
 * and stores the result in state, so a pass that decided nothing new must not set state, or the
 * render it triggers schedules another pass and the component spins. `sameDrawing` is that guard,
 * and it is also why the observer can safely watch every node: the connectors and the labels are
 * drawn in an overlay that is out of flow, so a pass that only re-routes never changes a box and
 * never wakes the observer again.
 *
 * THE ROUTES ARE STATE HERE AND DOM WRITES THERE, and that difference is unavoidable rather than a
 * divergence: a route quotes the text of the node it reaches, and React cannot read the text of a
 * `ReactNode` without rendering it. So both bindings read the same thing from the same place (the
 * measured DOM, through `diagramNodeText`), and the only difference is where the answer is kept
 * until it is written. The markup that comes out is identical, which is what the symmetry gate
 * compares.
 */
export function Diagram({
  className,
  columns,
  edges,
  label,
  nodes,
  style,
  zones,
  ...props
}: DiagramProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const nodeRefs = useRef<(HTMLLIElement | null)[]>([]);
  /*
   * Read for two things the props cannot answer: the chip's own TEXT (authored as a `ReactNode`,
   * and the DOM is the one place it exists as a string the route line can quote) and its measured
   * SIZE, which is what decides where along its connector the label fits.
   */
  const edgeRefs = useRef<(HTMLLIElement | null)[]>([]);
  /*
   * A zone's own name, for its WIDTH alone: it is what lets a connector entering the region land
   * beside the words rather than through them (`diagramZoneNames`). The width is the one thing
   * about a label that is true before anything is placed, which matters because the zones are
   * placed after this pass has routed.
   */
  const zoneLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /* Keyed `node\u0000row`, because a row name is only unique inside its own node. */
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const [drawing, setDrawing] = useState<Drawing>(EMPTY);
  /*
   * Whether anything has been measured yet, which is the same flag the stylesheet reads to decide
   * whether the edge labels are a row under the drawing or an overlay on it. Separate from the
   * placements because an edge list that legitimately routes to nothing still means the pass RAN.
   */
  const [placed, setPlaced] = useState(false);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return;

    const rect = root.getBoundingClientRect();
    /* `inset: 0` on the overlay resolves against the PADDING box, which is the border box shifted in
       by the border itself: one origin for the measurements and for the path data. */
    /* Inside a zoomed canvas every rect is in screen pixels and the overlay is drawn in the frame's
       own, so each length is divided back out; the border (`clientLeft`) is a layout length already. */
    const scale = diagramScale(root, rect);
    const originX = rect.left + root.clientLeft * scale;
    const originY = rect.top + root.clientTop * scale;
    const relative = (element: Element): DiagramBox => {
      const box = element.getBoundingClientRect();
      return {
        x: (box.left - originX) / scale,
        y: (box.top - originY) / scale,
        width: box.width / scale,
        height: box.height / scale,
      };
    };

    /*
     * A FRAME WITH NO BOX IS NOT MEASURED AT ALL. A diagram inside a closed tab panel reports every
     * rectangle as zero; every connector would be a zero-length line at the origin and every label
     * would pile up in the same corner. Becoming visible is a resize, and the observer is already
     * watching for one.
     */
    const listBox = relative(list);
    if (listBox.width === 0 && listBox.height === 0) return;

    const measurements: DiagramNodeMeasurement[] = nodes.map((node, index) => {
      const element = nodeRefs.current[index];
      return {
        id: node.node,
        box: element ? relative(element) : { x: 0, y: 0, width: 0, height: 0 },
        shape: node.shape ?? nodeShape.default,
        rows: (node.rows ?? []).flatMap((row): DiagramRowMeasurement[] => {
          const line = rowRefs.current.get(`${node.node}\u0000${row.row}`);
          return line ? [{ id: row.row, box: relative(line) }] : [];
        }),
      };
    });

    const direction: DiagramDirection =
      getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr";
    /*
     * ZONES FIRST: a region is computed from the node boxes alone and owes the router nothing,
     * while the router owes it one thing, which is to keep a connector's rail off a region's name.
     */
    const nodeZones = new Map(
      nodes.flatMap((node) => (node.zone ? [[node.node, node.zone] as const] : [])),
    );
    const regions = placeDiagramZones(measurements, zones ?? [], nodeZones);

    const placements = routeDiagram(
      measurements,
      edges.map((edge, index) => {
        /* A hidden chip (an unlabelled edge is `display: none`) measures zero, which is exactly
           "nothing to keep clear of". */
        const chip = edgeRefs.current[index]?.getBoundingClientRect();
        return {
          from: edge.from,
          to: edge.to,
          fromRow: edge.fromRow,
          toRow: edge.toRow,
          arrow: edge.arrow ?? edgeArrow.default,
          label: chip ? { width: chip.width / scale, height: chip.height / scale } : undefined,
        };
      }),
      {
        direction,
        keepRailsOut: diagramZoneHeaders(regions),
        keepPortsOut: diagramZoneNames(
          regions,
          (zones ?? []).map(
            (_, index) => (zoneLabelRefs.current[index]?.getBoundingClientRect().width ?? 0) / scale,
          ),
          { direction },
        ),
      },
    );

    /* Read off the rendered nodes rather than off the props: `children` is a ReactNode and the only
       place its words exist as words is the DOM. `diagramNodeText` skips the route list this same
       pass wrote, so reading is idempotent. */
    const routes = diagramRoutes(
      nodes.map((node, index) => {
        const element = nodeRefs.current[index];
        return { id: node.node, text: element ? diagramNodeText(element) : "" };
      }),
      edges.map((edge, index) => ({
        from: edge.from,
        to: edge.to,
        label: edgeRefs.current[index]?.textContent ?? "",
        toRow:
          rowRefs.current.get(`${edge.to}\u0000${edge.toRow}`)?.textContent?.replace(/\s+/g, " ").trim() ||
          undefined,
      })),
    );

    const next: Drawing = { placements, routes, regions };
    setDrawing((current) => (sameDrawing(current, next) ? current : next));
    setPlaced(true);
  }, [edges, nodes, zones]);

  useEffect(() => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    observer.observe(list);
    for (const element of nodeRefs.current) if (element) observer.observe(element);
    /* The chips too: their size is an input now (see `placeDiagramLabel`), and one that rewraps on
       a narrower frame would otherwise keep the position its old size earned. It cannot loop: a chip
       is moved with `translate`, which does not change the box a ResizeObserver watches. */
    for (const element of edgeRefs.current) if (element) observer.observe(element);

    /* One more pass once the webfonts land: they move every box by a few pixels, which in a drawing
       reads as a mistake rather than as a reflow. */
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });

    measure();
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [measure]);

  const rootStyle: CSSProperties | undefined =
    columns === undefined
      ? style
      : ({ ...style, "--sk-diagram-columns": columns } as CSSProperties);

  return (
    <div
      {...props}
      aria-label={label}
      className={cx(diagramParts.root, className)}
      ref={rootRef}
      role="group"
      style={rootStyle}
      {...{ [diagramAttrs.root]: "", ...(placed ? { [diagramAttrs.placed]: "" } : {}) }}
    >
      {/* THE BOTTOM LAYER: a boundary is what everything else is drawn inside. Empty until
          something has been measured, because a zone's rectangle is the union of boxes that do not
          exist until the grid has run. */}
      <ul className={diagramParts.zones}>
        {(zones ?? []).map((zone, index) => {
          const region = drawing.regions[index];
          return (
            <li
              className={diagramParts.zone}
              data-within={zone.within}
              data-zone={zone.zone}
              key={zone.zone}
              style={
                /* Physical insets rather than `translate`, and the reason is the enhancer's:
                   `translate` would make every zone a stacking context, and its own name could
                   then never be painted over the connectors. See `drawZones` in the Vanilla
                   binding, which writes exactly these four properties in exactly this order. */
                region
                  ? {
                      left: `${region.box.x}px`,
                      top: `${region.box.y}px`,
                      inlineSize: `${region.box.width}px`,
                      blockSize: `${region.box.height}px`,
                    }
                  : undefined
              }
            >
              <span
                className={diagramParts.zoneLabel}
                ref={(element) => {
                  zoneLabelRefs.current[index] = element;
                }}
              >
                {zone.children}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Then the connectors, which paint behind the nodes: a line crossing over a box reads as passing through
          it. Empty until something has been measured, exactly as the authored markup is empty until
          the enhancer runs. ONE `<g>` PER EDGE once it has, including an edge that could not be
          routed, so the overlay's indices and the edge list's can never drift apart. */}
      <svg aria-hidden="true" className={diagramParts.connectors} focusable="false">
        {drawing.placements.map((placement, index) => (
          <g className={diagramParts.connector} key={index}>
            {placement && <path className={diagramParts.line} d={placement.path} />}
            {placement?.arrows.map((arrow, at) => (
              <path className={diagramParts.arrow} d={arrow} key={at} />
            ))}
          </g>
        ))}
      </svg>

      <ul className={diagramParts.nodes} ref={listRef}>
        {nodes.map((node, index) => {
          const routes = drawing.routes[index] ?? [];
          return (
            <li
              className={diagramParts.node}
              data-node={node.node}
              data-shape={node.shape ?? nodeShape.default}
              data-zone={node.zone}
              key={node.node}
              ref={(element) => {
                nodeRefs.current[index] = element;
              }}
              style={
                node.span === undefined
                  ? undefined
                  : ({ "--sk-diagram-node-span": node.span } as CSSProperties)
              }
            >
              {/* Before the words, because a mark is read before a name and because that is where
                  every architecture diagram has always put one. */}
              {node.logo !== undefined && (
                <span className={diagramParts.logo}>{node.logo}</span>
              )}
              <span className={diagramParts.title}>{node.children}</span>
              {node.designator !== undefined && (
                <span className={diagramParts.designator}>{node.designator}</span>
              )}
              {node.rows && node.rows.length > 0 && (
                <ul className={diagramParts.rows}>
                  {node.rows.map((row) => (
                    <li
                      className={diagramParts.row}
                      data-row={row.row}
                      key={row.row}
                      ref={(element) => {
                        const key = `${node.node}\u0000${row.row}`;
                        if (element) rowRefs.current.set(key, element);
                        else rowRefs.current.delete(key);
                      }}
                    >
                      {row.children}
                    </li>
                  ))}
                </ul>
              )}
              {/* WHERE THIS NODE LEADS, announced and never drawn. Nested here rather than listed
                  below the drawing because the nesting is what says which way the arrow points, with
                  no word this component would have to invent in a language it cannot know. A node
                  with nowhere to go gets no list: "list, zero items" is a sentence about nothing. */}
              {routes.length > 0 && (
                <ul className={`${diagramParts.routes} ${VISUALLY_HIDDEN}`}>
                  {routes.map((route, at) => (
                    <li className={diagramParts.route} key={at}>
                      {route}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <ul className={diagramParts.edges}>
        {edges.map((edge, index) => {
          const placement = drawing.placements[index];
          return (
            <li
              className={diagramParts.edge}
              data-arrow={edge.arrow ?? edgeArrow.default}
              data-from={edge.from}
              data-from-row={edge.fromRow}
              data-to={edge.to}
              data-to-row={edge.toRow}
              data-sk-orphan={placed && !placement ? "" : undefined}
              key={`${edge.from}-${edge.to}-${index}`}
              ref={(element) => {
                edgeRefs.current[index] = element;
              }}
              style={placement ? { translate: `${placement.label.x}px ${placement.label.y}px` } : undefined}
            >
              {edge.children}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function samePlacement(
  a: DiagramEdgePlacement | null,
  b: DiagramEdgePlacement | null,
): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.path === b.path &&
    a.label.x === b.label.x &&
    a.label.y === b.label.y &&
    a.arrows.length === b.arrows.length &&
    a.arrows.every((arrow, index) => arrow === b.arrows[index])
  );
}

function sameDrawing(a: Drawing, b: Drawing): boolean {
  if (a.placements.length !== b.placements.length) return false;
  if (a.routes.length !== b.routes.length) return false;
  /* Serialized rather than walked: a zone is a box and a depth, there are a handful of them, and
     the alternative is a fourth hand-written comparison that can fall out of step with its type. */
  if (JSON.stringify(a.regions) !== JSON.stringify(b.regions)) return false;
  if (!a.placements.every((placement, index) => samePlacement(placement, b.placements[index]!))) return false;
  return a.routes.every(
    (lines, index) =>
      lines.length === b.routes[index]!.length &&
      lines.every((line, at) => line === b.routes[index]![at]),
  );
}
