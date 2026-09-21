import type { ComponentContract, OptionsOf } from "./contract.js";

/*
 * DIAGRAM, the contract for a drawing about how things RELATE.
 *
 * It is Annotation's sibling and deliberately not its generalization. Annotation points at one
 * rendered subject and names its pieces: subject in the middle, labels in the margins, a leader to
 * each part. Diagram has no subject at all. It has a handful of named things and the ways they lead
 * to one another, which is the other half of what a documentation drawing is ever for:
 *
 *   ANNOTATION   one thing  ->  what its parts are called.
 *   DIAGRAM      many things -> which one leads to which, and under what condition.
 *
 * The two share techniques (an SVG overlay, measured boxes, observers, a physical/logical seam) and
 * share no public vocabulary, because forcing "subject + labels" and "nodes + edges" into one API
 * would name neither. See `annotation.ts` for the mirror image of nearly every comment below.
 *
 * WHAT THIS IS NOT, and the boundary is the whole reason it stays small. It is not a graph library:
 * there is no layout solver, no force simulation, no zoom canvas, no ports the author addresses by
 * hand, no UML. It draws the diagrams that turn up inside prose - a linear flow, an if/else, a small
 * decision tree, a state machine with a cycle - and those four are NOT four modes. They are four
 * compositions of the same two nouns. A contract that offered `type="flowchart"` would be claiming a
 * difference in rendering that does not exist, and would then owe a fifth mode to the first person
 * whose drawing was between two of them.
 *
 * THE TWO INVARIANTS, which are the two a hand-rolled diagram always loses:
 *
 *   1. AN AUTHOR NEVER WRITES A COORDINATE. Not a path, not a viewBox, not an `x`. Where a connector
 *      runs follows from where two nodes LANDED, which follows from the grid, the container's width,
 *      the font that arrived late and the translation that was longer. Every one of those is a
 *      runtime fact, so the drawing is computed from measured boxes on every change and from nothing
 *      else. (Decision 25's own test, and the same line Annotation sits on.)
 *   2. THE LAYOUT IS THE CONSUMER'S CSS, not the component's algorithm. The nodes are list items in
 *      a grid; `columns` and `span` are the two numbers that cover the common shapes, and anything
 *      past that is `grid-area` in the consumer's own stylesheet. The drawing follows the layout,
 *      exactly as Annotation's leaders follow whichever gutter a label ended up in: move a node with
 *      a media query and the connectors re-route, with no JavaScript written anywhere.
 *
 * AND THE THIRD, WHICH IS ABOUT THE READER RATHER THAN THE DRAWING. An SVG line is not information:
 * it is `aria-hidden` by construction. So the relationships get a text form (`routes` below) that a
 * screen reader walks, nested under the node they lead FROM, because that nesting is what says which
 * way the arrow points without the component inventing the word "to" in a language it cannot know.
 */

/* ---------------------------------------------------------------------------------------------- *
 * Vocabulary
 * ---------------------------------------------------------------------------------------------- */

/**
 * What a node IS, in the only three flavours that change how it is drawn.
 *
 * Deliberately three, and deliberately not a shape catalogue. Every extra silhouette a diagram
 * vocabulary offers (parallelogram for input, cylinder for storage, hexagon for preparation) is a
 * convention the reader has to have been taught, and the ones below are the three that survive
 * without teaching:
 *
 *   `process`   a step. A box. The default, because most nodes are just a thing that happens.
 *   `decision`  a question with more than one answer out of it. A rhombus, which is the one shape
 *               in technical drawing that reads as "a branch happens here" on sight.
 *   `terminal`  where the drawing starts or stops. A pill, i.e. a box with nothing sharp about it,
 *               which is how a reader tells an endpoint from a step without a legend.
 *
 * `decision` is not a fourth kind of component and carries no branching behaviour: what makes a node
 * a decision is that two edges leave it, which the edges already say. The shape only makes the
 * drawing readable. What it DOES change, and the reason the geometry knows about it, is where a
 * connector may touch: see `sideOutline`.
 */
export type DiagramShape = "process" | "decision" | "terminal";

export const diagramShapes = [
  "process",
  "decision",
  "terminal",
] as const satisfies readonly DiagramShape[];

export function isDiagramShape(value: unknown): value is DiagramShape {
  return typeof value === "string" && (diagramShapes as readonly string[]).includes(value);
}

/**
 * Which ends of an edge carry an arrowhead.
 *
 * `end` is the default because a diagram of this kind is almost always about sequence, and an
 * undirected line between two steps is a sentence with no verb. `both` is for a relationship that
 * genuinely runs both ways in one stroke (two states that each transition to the other, drawn once);
 * `none` is for a plain association, which a state chart occasionally needs and a flowchart never
 * does.
 *
 * Note what is NOT here: a "dashed" or "dotted" edge. Line style says nothing on its own (is dashed
 * weaker, optional, asynchronous?), so it would be a convention the drawing cannot explain; a label
 * on the edge says the same thing in words the reader already has.
 */
export type DiagramArrow = "end" | "both" | "none";

export const diagramArrows = ["end", "both", "none"] as const satisfies readonly DiagramArrow[];

export function isDiagramArrow(value: unknown): value is DiagramArrow {
  return typeof value === "string" && (diagramArrows as readonly string[]).includes(value);
}

/*
 * Every class is a BEM element of the one block, including the ones a reader might expect to be
 * flat. Annotation gives its label a flat `sk-annotation` because a label is the one part a consumer
 * styles on its own and `sk-annotated__label` would prefix every such rule for a containment nobody
 * reads it for. Nothing here is in that position: a node outside a diagram is not a thing, and an
 * edge outside one is a line from nowhere.
 */
export const diagramParts = {
  /** The frame. The positioning context every measured coordinate is expressed in. */
  root: "sk-diagram",
  /**
   * The nodes, as a list. A `<ul>` and not a bag of `<div>`s, because a diagram IS a set of named
   * things and a list is the platform's word for that: a screen reader announces how many there are
   * before reading them, which is the first thing anyone wants to know about a drawing they cannot
   * see. It is also the grid, so the nodes are grid ITEMS and the author's own `grid-area` reaches
   * them without a wrapper in between.
   */
  nodes: "sk-diagram__nodes",
  /** One node: an `<li>`, holding whatever the author put in it. */
  node: "sk-diagram__node",
  /** The node's own words, in an element of their own so a node with rows has a heading. */
  title: "sk-diagram__node-title",
  /**
   * A node's MARK: a product logo, a service glyph, an icon. A box, sized by one hook, holding
   * whatever the author put in it.
   *
   * It exists because "put an image in the node" was already possible and already wrong: a node's
   * content slot takes any composition, so an author could compose an image into it, and then owned
   * the sizing of that image on every node of the drawing. An infrastructure diagram is twenty boxes
   * with a logo each, and twenty hand-sized images is twenty chances for one of them to be a
   * different height. One part with one hook is the difference between a drawing and a collage.
   *
   * DELIBERATELY NOT AN `img`, and not an icon name either. It is a slot, so it takes an `ImageFrame`
   * pointing at an SVG or a PNG, an `Icon` from whichever set is installed, or any other tree: the
   * kit ships no brand marks (CONTEXT.md's icon-set rule is that the system names a role and a set
   * supplies the drawing), and a diagram's logos are the author's to bring.
   */
  logo: "sk-diagram__node-logo",
  /**
   * A node's ROWS: the named lines inside a box, under a rule.
   *
   * It is what turns a box into a record, which is the one anatomy an explanatory drawing needs
   * that a box cannot express: a class with its members, a table with its columns, a message with
   * its fields. Optional and absent from most diagrams, which is why it is a slot and not a shape.
   */
  rows: "sk-diagram__rows",
  /**
   * One row. Addressable BY NAME, which is the whole reason it is a part rather than authored
   * content: an edge may point at a row instead of at the box around it, and the drawing then lands
   * the connector at that row's own height. See `DiagramEdgeInput.fromRow`.
   */
  row: "sk-diagram__row",
  /**
   * THE ZONES: labelled regions drawn around nodes the grid already placed. A VPC around its
   * subnets, a cluster around its services, a phase around its steps.
   *
   * Their own list, FIRST in the DOM, because a boundary is the bottom layer of the drawing:
   * everything else is inside it. Absent from most diagrams, which is why a frame with no zones
   * renders an empty list and nothing else.
   */
  zones: "sk-diagram__zones",
  /** One zone: a box the binding sizes, holding its own name. */
  zone: "sk-diagram__zone",
  /** A zone's name, in the band its top padding reserves. */
  zoneLabel: "sk-diagram__zone-label",
  /**
   * The edge labels, as a second list laid over the frame. Their own list rather than children of
   * the nodes, because an edge belongs to two nodes and a child belongs to one; and laid OVER rather
   * than placed in the grid, because a label sits at the middle of a line, which is a coordinate and
   * therefore not a cell.
   */
  edges: "sk-diagram__edges",
  /**
   * One edge: an `<li>` whose content is the label ("Yes", "on error", "retry"), or empty when the
   * relationship needs no word. Empty is the common case and costs nothing: the stylesheet draws no
   * chip around `:empty`, so an unlabelled edge is a line and not a line with a blank sticker on it.
   */
  edge: "sk-diagram__edge",
  /**
   * The `<svg>` the connectors are drawn into. One overlay for the whole frame rather than one
   * element per edge: a connector crosses cell boundaries by definition, so anything clipped to a
   * cell would cut every line in half. `aria-hidden`, always: see `routes`.
   */
  connectors: "sk-diagram__connectors",
  /**
   * One connector: the `<g>` holding a line and its arrowheads, so the pieces of one relationship
   * can be coloured and hidden as the single thing they are. Written by a binding.
   */
  connector: "sk-diagram__connector",
  /** One `<path>`, the line itself. Never authored: it is a measurement, not content. */
  line: "sk-diagram__line",
  /** One arrowhead `<path>`. Zero, one or two per connector, depending on `arrow`. */
  arrow: "sk-diagram__arrow",
  /**
   * THE READING OF THE DRAWING: a visually hidden `<ul>` inside a node, listing where that node
   * leads. Written by a binding, never authored.
   *
   * It exists because the alternative is a diagram whose entire content is invisible to a screen
   * reader. The nodes alone are a list of words; the connectors are `aria-hidden` (an SVG line is
   * not information, and exposing it would announce "graphic" four times and say nothing); so
   * without this the relationships, which ARE the diagram, exist only as pixels.
   *
   * NESTED UNDER THE NODE THEY LEAVE, and that placement is the whole design. A flat list of edges
   * somewhere below the drawing would have to say which way each one points, and the only ways to
   * say it are a word ("to", "then") in a language this component cannot know, or an arrow glyph
   * that readers announce inconsistently or not at all. Nesting says it structurally: these are the
   * ways out of THIS node, so the direction is carried by where the list is rather than by anything
   * in it.
   */
  routes: "sk-diagram__routes",
  /** One route: an `<li>` reading "<the edge's label>, <the node it reaches>". Binding-written. */
  route: "sk-diagram__route",
} as const;

export type DiagramPart = keyof typeof diagramParts;

export const diagramAttrs = {
  /** The enhancer's attachment point. Present in authored markup by construction; React needs none. */
  root: "data-sk-diagram",
  /** This node's name, and the only identity an edge has to point at. Unique within one frame. */
  node: "data-node",
  /** Which silhouette this node is drawn with. Read by the binding, because it decides port points. */
  shape: "data-shape",
  /** This row's name, unique within its own node. What an edge's `fromRow`/`toRow` points at. */
  row: "data-row",
  /** A zone's name. What a node's `zone` and another zone's `within` point at. */
  zone: "data-zone",
  /** The zone this zone sits inside. */
  within: "data-within",
  /** The row of `from` this edge leaves, when it leaves one row rather than the whole box. */
  fromRow: "data-from-row",
  /** The row of `to` it reaches. */
  toRow: "data-to-row",
  /** The node an edge leaves. */
  from: "data-from",
  /** The node an edge reaches. */
  to: "data-to",
  /** Which ends of an edge are arrowheads. */
  arrow: "data-arrow",
  /**
   * WRITTEN BY THE BINDING ONCE IT HAS MEASURED, and the one piece of state this component has.
   *
   * Everything about an edge's position is a measurement, so before the first pass there is nothing
   * to position it with. Rather than park every label at the frame's origin and let them jump, the
   * stylesheet keeps the edge list in NORMAL FLOW until this appears: with no JavaScript at all, a
   * reader gets the nodes as a list and the edge labels as a row beneath them, which is the most a
   * drawing of relationships can degrade to and still be read. This attribute is what flips it to
   * the overlay, so the enhancement is visible in the markup instead of implied by it.
   */
  placed: "data-sk-placed",
  /**
   * Written on an edge whose `from` or `to` names no node in this frame, or whose endpoints have no
   * box to point at. The stylesheet hides it: a line that cannot be drawn leaves a label floating in
   * the middle of a diagram claiming a relationship the drawing does not show, which is worse than
   * saying nothing. The validator catches the typo at compose time; this is what happens when the
   * markup is authored by hand and nobody validated it.
   */
  orphan: "data-sk-orphan",
} as const;

/* ---------------------------------------------------------------------------------------------- *
 * Pure geometry - no DOM, no framework. Tested from `packages/core/src/diagram.test.ts`.
 *
 * Every box below is in the FRAME's own coordinates: the origin is the top-left of the root's
 * padding box, which is also the origin the connector `<svg>` resolves its user units against, so a
 * binding subtracts one rect and never converts again. Same arrangement as `annotation.ts`, for the
 * same reason.
 *
 * THE BOXES ARE PHYSICAL and the API is LOGICAL, and unlike Annotation there is no seam to cross,
 * because nothing an author writes here names a side. A diagram's layout is CSS Grid, which already
 * flips in RTL on its own; the only thing that still has to know about writing direction is which
 * way a back edge detours, and that is the one place `direction` is read.
 * ---------------------------------------------------------------------------------------------- */

export type DiagramPoint = { readonly x: number; readonly y: number };

export type DiagramBox = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type DiagramDirection = "ltr" | "rtl";

/** Which physical edge of a node a connector touches. Never authored; always derived from boxes. */
type PhysicalSide = "top" | "right" | "bottom" | "left";

/**
 * The arrowhead's length along the line, in px. Its width is `DIAGRAM_ARROW_RATIO` of that.
 *
 * EIGHT BY SIX, and the shape matters more than the size. A long thin dart (the first version was
 * ten by four) reads as a fifth segment of the line rather than as its head: at a hairline stroke
 * width the eye takes the taper for the stroke and the drawing loses its direction, which is the one
 * thing an arrow is for. Squat and wide, the head is a different OBJECT from the line and says
 * "here" at a glance. Both numbers stay whole so the two base corners round symmetrically: an
 * arrowhead one pixel wider on one side is visible at this size, and is exactly the kind of noise
 * the symmetry gate would then compare between the two bindings.
 */
export const DIAGRAM_ARROW_SIZE = 8;

/** The arrowhead's width, as a fraction of its length. */
export const DIAGRAM_ARROW_RATIO = 0.75;

/**
 * How far short of its target an arrowhead stops, in px.
 *
 * AN ARROW POINTS AT A THING; IT DOES NOT TOUCH IT. Drawn flush, the head's base merges into the
 * node's own border and the two read as one welded object: the box appears to have grown a spur,
 * and on a rhombus, whose border runs diagonally under a vertically arriving head, the tip
 * disappears into the corner entirely. A few pixels of air is what makes the head a separate mark
 * aimed at the box, which is what the drawing is claiming.
 *
 * Only the ARROWED end stands off. The departure end still meets its node, because a line has to
 * come FROM somewhere visibly, and a stroke floating clear at both ends belongs to neither box.
 */
export const DIAGRAM_ARROW_GAP = 8;

/**
 * How far INTO its own arrowhead the stroke runs, as a fraction of the head's length.
 *
 * The stroke used to run all the way to the tip, with the filled triangle laid over it. Nothing is
 * visible of that at a distance and it is wrong up close: `stroke-linecap: round` puts half a stroke
 * width of cap past the apex, so the point of every arrow in the drawing is a small dome rather than
 * a point. Stopping the line at the head's midline leaves the triangle to make the tip by itself.
 *
 * Not ZERO, which would be the tidy answer and leaves a hairline of background between the stroke's
 * cap and the head's base wherever antialiasing disagrees with rounding. Half a head is far enough
 * in that nothing can show through and far enough back that the apex is the triangle's alone.
 */
export const DIAGRAM_ARROW_OVERLAP = 0.5;

/**
 * Clear space a label chip keeps from anything it must not sit on: a node, or an arrowhead.
 *
 * A chip that merely touches a box reads as attached to it, and an edge label belongs to the LINE.
 * See `placeDiagramLabel`.
 */
export const DIAGRAM_LABEL_CLEARANCE = 5;

/**
 * How many positions along a connector are tried when placing its label.
 *
 * Twenty-five is not a tuning knob so much as "enough that a chip can slide past a box": at the
 * shortest connector a drawing has (about one rank gap, 40px) the step is under two pixels, and at
 * the longest it is still finer than the chip is wide.
 */
export const DIAGRAM_LABEL_SAMPLES = 25;

/**
 * What a label chip pays for sitting BESIDE its connector rather than on it.
 *
 * On the stroke is the right place whenever there is room: the chip's own ground masks a short
 * stretch of line, which every flowchart has always done, and beside it the pair takes twice the
 * width. So the two are not equal options, and this is the thumb on the scale, priced in the same
 * units as the overlap costs: a chip only steps aside once staying put would bury about a quarter
 * of something.
 */
export const DIAGRAM_LABEL_OFF_LINE = 25;

/**
 * How far a zone's boundary sits outside the nodes it holds, in px, and how much taller its top is.
 *
 * A zone is a labelled region drawn around nodes the grid has already placed: a VPC around its
 * subnets, a cluster around its services, a swimlane around a phase. The top is deeper than the
 * other three sides because the label lives up there, and a boundary whose name overlaps the first
 * node in it is a boundary that has lost the argument with its own contents.
 */
export const DIAGRAM_ZONE_PADDING = 18;
export const DIAGRAM_ZONE_HEADER = 28;

/**
 * How much a right-angle turn is rounded, in px.
 *
 * NOT ZERO, and the reason is about what a corner MEANS rather than about taste. An orthogonal
 * connector's turns are an artefact of routing (the line had to get from one column to another), so
 * a hard 90-degree corner draws the reader's eye to a place where nothing happens. Rounded, the
 * whole polyline reads as one continuous move from a node to a node, which is what it is. Clamped
 * per corner to half of each adjacent segment, so a short jog softens instead of overshooting.
 */
export const DIAGRAM_CORNER_RADIUS = 6;

/**
 * How far outside the nodes a back edge runs, in px.
 *
 * A back edge (a cycle: the target is ABOVE the source) is the one relationship that cannot take the
 * direct route, because the direct route is the corridor the forward edges already use. So it steps
 * out past everything in its way and comes back, which is exactly how a state chart has always drawn
 * "and then it starts over". This is the clearance of that detour from the widest node it passes.
 */
export const DIAGRAM_LANE_GAP = 18;

/**
 * The middle fraction of a node's side that connectors may leave from.
 *
 * Origins are spread across this band when several connectors share one side (see `portOffsets`),
 * never across the whole side: a line leaving within a few pixels of a corner reads as leaving the
 * NEXT side, and on a rounded box it leaves from the curve, where the box has no straight edge for
 * it to be perpendicular to.
 */
export const DIAGRAM_PORT_BAND = 0.6;

/**
 * How far apart two ports may be, across the corridor, and still be drawn as one straight run.
 *
 * A route is built at four points and then simplified, which removes a turn through nothing but not
 * a turn through almost nothing. A decision's branch leaving at x = 33 and arriving at x = 38 gets
 * two rounded corners five pixels apart: a visible wiggle in the middle of a line that every reader
 * would have drawn straight. Under this tolerance both ends are snapped to their average instead,
 * which moves a port by at most half of it and buys a clean stroke.
 */
export const DIAGRAM_SNAP = 6;

/**
 * How far apart two connectors are pulled when they would otherwise share a stretch of one rail.
 *
 * Ten, which is enough that two hairlines read as two at a glance and little enough that the pair
 * still reads as parallel rather than as a fan. See the corridor pass in `routeDiagram`.
 */
export const DIAGRAM_CORRIDOR_GAP = 10;

/** One row inside a node, as the binding measured it. */
export type DiagramRowMeasurement = {
  readonly id: string;
  readonly box: DiagramBox;
};

/** One node, as the binding measured it. The shape is here because it decides where a line may touch. */
export type DiagramNodeMeasurement = {
  readonly id: string;
  readonly box: DiagramBox;
  readonly shape: DiagramShape;
  /** Its named rows, when it has any. Empty or absent for the boxes that are just a box. */
  readonly rows?: readonly DiagramRowMeasurement[];
};

/** How big a label chip turned out to be, once the stylesheet had it. */
export type DiagramLabelBox = {
  readonly width: number;
  readonly height: number;
};

/** One relationship, as the author stated it. No geometry: that is this module's job. */
export type DiagramEdgeInput = {
  readonly from: string;
  readonly to: string;
  readonly arrow?: DiagramArrow;
  /**
   * WHICH ROW OF ITS NODE this edge leaves and arrives at, when it is about a row rather than a box.
   *
   * A foreign key does not point at a table, it points at a COLUMN, and a drawing that lands the
   * line on the middle of the box has thrown away the half of the fact that was worth drawing. The
   * row decides where along the node's side the connector touches; the node still decides which
   * side, because a connector that entered through the face to reach an interior row would have to
   * cross the box to get there.
   *
   * A row-anchored edge is therefore always INLINE: it comes in from the left or the right, at the
   * row's own height. A row has a height and not a width, so a connector arriving on the top edge
   * could not say which row it meant, and the anchor is dropped (with a note in `routeDiagram`) for
   * the one geometry where inline sides are impossible, two nodes stacked in the same column.
   */
  readonly fromRow?: string;
  readonly toRow?: string;
  /**
   * The MEASURED size of this edge's label chip, when it has one.
   *
   * It is an input to the geometry rather than a thing the stylesheet sorts out on its own, because
   * where a chip fits is a question about its size and about every box near it, and CSS can answer
   * neither. Absent (an unlabelled edge, or a binding that has not measured yet) the label point is
   * still computed and simply has nothing to avoid.
   *
   * Safe to measure on every pass and safe to feed back in: a chip is `position: absolute` and moved
   * with `translate`, so its size does not depend on where the last pass put it. There is no loop.
   */
  readonly label?: DiagramLabelBox;
};

/** What a binding writes for one edge. `null`, in `routeDiagram`'s output, for one it cannot draw. */
export type DiagramEdgePlacement = {
  /** The connector, as SVG path data, corners already rounded. */
  readonly path: string;
  /** Arrowheads, already oriented, as path data. Empty for `arrow: "none"`. */
  readonly arrows: readonly string[];
  /**
   * Where the chip's CENTRE goes: a point ON the connector, chosen by `placeDiagramLabel` to clear
   * the arrowhead, clear every node, and where it can, clear the bends.
   *
   * ON the line rather than beside it, and that was tried the other way round. A chip has a ground
   * of its own, so wherever it lands it hides that stretch of stroke, and hanging it off to one side
   * keeps the whole connector visible. It also puts the word wherever the side happens to point: on
   * a rank gap of 40px the state chart's `resolves` landed on top of the box it was labelling and
   * its `invalidate` hung off the frame entirely, because the gap a chip needs beside a line is
   * room the drawing does not have. Masking a short stretch of its own connector is the cheaper
   * trade; choosing WHICH stretch is what `placeDiagramLabel` is for.
   */
  readonly label: DiagramPoint;
};

export type DiagramRouteOptions = {
  readonly direction?: DiagramDirection;
  readonly arrowSize?: number;
  /** Clearance between an arrowhead's tip and the node it points at. See `DIAGRAM_ARROW_GAP`. */
  readonly arrowGap?: number;
  readonly cornerRadius?: number;
  readonly laneGap?: number;
  /** How far off straight a corridor may be before it is drawn straight. See `DIAGRAM_SNAP`. */
  readonly snap?: number;
  /** How far apart two connectors sharing a rail are pulled. See `DIAGRAM_CORRIDOR_GAP`. */
  readonly corridorGap?: number;
  /**
   * Bands a connector's horizontal rail must not lie along. In practice: the strip at the top of
   * each zone where its NAME is. See `diagramZoneHeaders`.
   */
  readonly keepRailsOut?: readonly DiagramBox[];
};

/**
 * Can this box be pointed at?
 *
 * A box with no area cannot, and that is not a defensive check against bad input: it is a shape the
 * platform hands back for real, correct markup. A node inside a closed tab panel, one in a
 * `display: none` subtree, or one measured before layout has run all report zeros at the VIEWPORT
 * origin, which in frame coordinates is a point somewhere off the top-left of the drawing. Drawing
 * to it would send a connector out of the frame; refusing to is the honest answer, and the edge
 * simply is not drawn until there is something to draw it to.
 */
export function isDiagramPointable(box: DiagramBox): boolean {
  return box.width > 0 || box.height > 0;
}

/**
 * THE OUTLINE THAT FACES ONE SIDE, as a polyline a port point can slide along.
 *
 * This is the one place a shape changes geometry rather than only paint, and it earns its keep on
 * the rhombus. For a rectangle, "the part of the outline facing down" is the bottom edge, and a
 * connector leaving a third of the way along it leaves from a real edge. For a rhombus the bottom of
 * the BOUNDING BOX is empty air: two thirds of it is outside the shape, so the same third-of-the-way
 * origin would start the line in the blank corner beside the node, visibly detached from it.
 *
 * So the facing outline of a decision's "bottom" is its two lower faces, from the west vertex down
 * to the south vertex and back up to the east vertex. Spread two connectors along it and they leave
 * from the lower-left and lower-right faces: which is not a coincidence and not a special case for
 * flowcharts, it is the same rule producing the drawing every flowchart has ever used for an
 * if/else. A single connector lands at t = 0.5, which is the vertex itself.
 *
 * Every side is parametrized the same way (left to right for the horizontal sides, top to bottom for
 * the vertical ones) so ordering the connectors on a side is one comparison and never a per-shape
 * one. `terminal` is a pill and rides with `process`: its straight edges are most of its outline,
 * and the port band keeps origins off the caps.
 */
export function sideOutline(
  box: DiagramBox,
  shape: DiagramShape,
  side: PhysicalSide,
): readonly DiagramPoint[] {
  const { x, y, width, height } = box;
  const right = x + width;
  const bottom = y + height;
  const cx = x + width / 2;
  const cy = y + height / 2;

  if (shape === "decision") {
    switch (side) {
      case "top":
        return [{ x, y: cy }, { x: cx, y }, { x: right, y: cy }];
      case "bottom":
        return [{ x, y: cy }, { x: cx, y: bottom }, { x: right, y: cy }];
      case "left":
        return [{ x: cx, y }, { x, y: cy }, { x: cx, y: bottom }];
      case "right":
        return [{ x: cx, y }, { x: right, y: cy }, { x: cx, y: bottom }];
    }
  }

  switch (side) {
    case "top":
      return [{ x, y }, { x: right, y }];
    case "bottom":
      return [{ x, y: bottom }, { x: right, y: bottom }];
    case "left":
      return [{ x, y }, { x, y: bottom }];
    case "right":
      return [{ x: right, y }, { x: right, y: bottom }];
  }
}

/** The total length of a polyline. Zero for anything shorter than two distinct points. */
function polylineLength(points: readonly DiagramPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += distance(points[i - 1]!, points[i]!);
  return total;
}

const distance = (a: DiagramPoint, b: DiagramPoint): number =>
  Math.hypot(b.x - a.x, b.y - a.y);

/**
 * Which way the polyline is running a fraction of the way along it.
 *
 * The label placement needs it and nothing else does: whether a chip steps sideways or up and down
 * to get off the stroke depends on which way that ONE segment runs, not on the polyline as a whole.
 */
export function headingAlong(points: readonly DiagramPoint[], t: number): DiagramPoint {
  if (points.length < 2) return { x: 0, y: 0 };
  const total = polylineLength(points);
  if (total === 0) return { x: 0, y: 0 };

  let travelled = Math.min(Math.max(t, 0), 1) * total;
  let last: DiagramPoint = { x: 0, y: 0 };
  for (let i = 1; i < points.length; i += 1) {
    const from = points[i - 1]!;
    const to = points[i]!;
    const length = distance(from, to);
    if (length === 0) continue;
    last = { x: to.x - from.x, y: to.y - from.y };
    if (travelled <= length) return last;
    travelled -= length;
  }
  return last;
}

/**
 * The point a fraction of the way along a polyline, BY ARC LENGTH rather than by segment count.
 *
 * Both callers need exactly this and would both be wrong with the cheaper version. A port point at
 * t = 1/3 of a rhombus's two-segment face has to fall a third of the way along the DRAWN outline, or
 * two connectors spread at 1/3 and 2/3 come out asymmetric on a node that is symmetric. And the
 * midpoint of a connector, which is where its label sits, has to be the visual middle of the line:
 * by segment count, the middle of an L with one long arm and one short one lands at the elbow.
 */
export function pointAlong(points: readonly DiagramPoint[], t: number): DiagramPoint {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0]!;
  const total = polylineLength(points);
  if (total === 0) return points[0]!;

  let travelled = Math.min(Math.max(t, 0), 1) * total;
  for (let i = 1; i < points.length; i += 1) {
    const from = points[i - 1]!;
    const to = points[i]!;
    const length = distance(from, to);
    if (length === 0) continue;
    if (travelled <= length) {
      const at = travelled / length;
      return { x: from.x + (to.x - from.x) * at, y: from.y + (to.y - from.y) * at };
    }
    travelled -= length;
  }
  return points[points.length - 1]!;
}

/**
 * Where N connectors sharing one side of one node leave from, as fractions along that side.
 *
 * Evenly spaced inside `DIAGRAM_PORT_BAND`, which for a single connector is the middle of the side
 * and for two is a third of the band either way. Deliberately not "as far apart as they fit": the
 * spread exists so two lines are visibly two lines, not so they fan.
 */
export function portOffsets(count: number, band: number = DIAGRAM_PORT_BAND): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0.5];
  const width = Math.min(Math.max(band, 0), 1);
  const start = 0.5 - width / 2;
  return Array.from({ length: count }, (_, i) => start + (width * i) / (count - 1));
}

/**
 * SVG path data for a polyline whose corners are rounded.
 *
 * Each interior vertex is cut back along both of its segments and replaced by a quadratic through
 * the corner, which is the cheapest curve that is tangent to both arms (an arc would be more correct
 * and indistinguishable at this radius). The cut is clamped to HALF of each adjacent segment, so two
 * turns close together round into each other's territory rather than past it, and a segment shorter
 * than the radius simply gets a gentler corner instead of a kink.
 */
export function diagramPath(
  points: readonly DiagramPoint[],
  radius: number = DIAGRAM_CORNER_RADIUS,
): string {
  const line = simplify(points);
  if (line.length < 2) return "";
  if (line.length === 2 || radius <= 0) {
    return line.map((p, i) => `${i === 0 ? "M" : "L"} ${round(p.x)} ${round(p.y)}`).join(" ");
  }

  const out: string[] = [`M ${round(line[0]!.x)} ${round(line[0]!.y)}`];
  for (let i = 1; i < line.length - 1; i += 1) {
    const previous = line[i - 1]!;
    const corner = line[i]!;
    const next = line[i + 1]!;
    const back = Math.min(radius, distance(previous, corner) / 2);
    const forward = Math.min(radius, distance(corner, next) / 2);
    const enter = towards(corner, previous, back);
    const leave = towards(corner, next, forward);
    out.push(`L ${round(enter.x)} ${round(enter.y)}`);
    out.push(`Q ${round(corner.x)} ${round(corner.y)} ${round(leave.x)} ${round(leave.y)}`);
  }
  const last = line[line.length - 1]!;
  out.push(`L ${round(last.x)} ${round(last.y)}`);
  return out.join(" ");
}

/** The arrowhead at `tip`, pointing the way the line was travelling when it got there. */
export function arrowPath(
  tip: DiagramPoint,
  heading: DiagramPoint,
  size: number = DIAGRAM_ARROW_SIZE,
): string {
  const length = Math.hypot(heading.x, heading.y);
  if (length === 0) return "";
  const dx = heading.x / length;
  const dy = heading.y / length;
  /* The perpendicular, for the two base corners. Either normal works: the triangle is symmetric. */
  const px = -dy;
  const py = dx;
  const baseX = tip.x - dx * size;
  const baseY = tip.y - dy * size;
  const half = (size * DIAGRAM_ARROW_RATIO) / 2;
  const a = { x: baseX + px * half, y: baseY + py * half };
  const b = { x: baseX - px * half, y: baseY - py * half };
  return `M ${round(tip.x)} ${round(tip.y)} L ${round(a.x)} ${round(a.y)} L ${round(b.x)} ${round(b.y)} Z`;
}

const round = (value: number): number => Math.round(value);

const towards = (from: DiagramPoint, to: DiagramPoint, by: number): DiagramPoint => {
  const length = distance(from, to);
  if (length === 0) return from;
  return { x: from.x + ((to.x - from.x) / length) * by, y: from.y + ((to.y - from.y) / length) * by };
};

const samePoint = (a: DiagramPoint, b: DiagramPoint): boolean =>
  Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y);

/**
 * THE FEWEST POINTS THAT DRAW THE SAME LINE: repeats dropped, and any point that merely sits ON the
 * segment between its neighbours dropped with them.
 *
 * Dropping repeats alone is the obvious version and it is not enough, because the routes above are
 * built at a fixed four points and most of them are straight. Two nodes in one column produce a
 * turn at the halfway line that turns through nothing, and a surviving collinear point is not
 * harmless: `diagramPath` rounds every INTERIOR vertex, so a straight run came out as
 * `M 150 40 L 150 62 Q 150 70 150 78 L 150 100` - a curve drawn through a corner that does not
 * exist. Simplifying here rather than special-casing each route is also what keeps "one or two
 * bends, never a decoration" a property of the output instead of a promise about the input.
 */
const simplify = (points: readonly DiagramPoint[]): DiagramPoint[] => {
  const out: DiagramPoint[] = [];
  for (const point of points) {
    if (out.length > 0 && samePoint(point, out[out.length - 1]!)) continue;
    if (out.length >= 2) {
      const a = out[out.length - 2]!;
      const b = out[out.length - 1]!;
      /* The cross product of the two steps: zero means `b` added no direction of its own. A tenth
         of a pixel-squared of tolerance, because a port point on a rhombus face is a fraction. */
      if (Math.abs((b.x - a.x) * (point.y - a.y) - (point.x - a.x) * (b.y - a.y)) < 0.1) out.pop();
    }
    out.push(point);
  }
  return out;
};

/**
 * WHICH SIDES AN EDGE LEAVES AND ARRIVES ON, read off the boxes and never authored.
 *
 * The rule is stated as a ladder and the order of the rungs is the whole of it:
 *
 *   1. A node to ITSELF is a self-transition. It has no direction to derive; see `selfRoute`.
 *   2. The target entirely ABOVE the source is a BACK EDGE, which is what makes a cycle a cycle.
 *      It gets the detour rather than the direct route, because the direct route is the corridor
 *      the forward edges are already in, and a return line drawn through it is indistinguishable
 *      from the line it is returning along.
 *   3. The target entirely BELOW is the ordinary case: down out of one, down into the next.
 *   4. Otherwise the two are side by side and it goes across, toward whichever one is on the far
 *      side.
 *   5. Anything left overlaps on both axes, which is two nodes sharing a cell. There is no honest
 *      answer, so it takes the ordinary one and the drawing shows the overlap rather than hiding it.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO is pick sides by the angle between the centres, which is the
 * obvious alternative and is worse in exactly the case that matters. An if/else puts both branches
 * BELOW a decision and slightly to either side, and the centre-to-centre angle there is nearer
 * horizontal than vertical, so the angular rule sends both branches out sideways and then U-turns
 * them down into their targets. Asking "is it below?" first is what keeps a flowchart flowing down.
 */
export function edgeSides(
  from: DiagramBox,
  to: DiagramBox,
): { readonly exit: PhysicalSide; readonly enter: PhysicalSide; readonly back: boolean } {
  if (to.y + to.height <= from.y) return { exit: "top", enter: "bottom", back: true };
  if (to.y >= from.y + from.height) return { exit: "bottom", enter: "top", back: false };
  if (to.x >= from.x + from.width) return { exit: "right", enter: "left", back: false };
  if (to.x + to.width <= from.x) return { exit: "left", enter: "right", back: false };
  return { exit: "bottom", enter: "top", back: false };
}

/**
 * WHERE ALONG A SIDE A ROW SITS, as the fraction `pointAlong` takes, or `undefined` for no row.
 *
 * The row's own centre, projected onto the side's axis and expressed against the NODE's box, which
 * is the point: the connector touches the node's outline (it has to, or it would cross the border
 * to reach an interior line) at the height the row is actually drawn at. That is what makes an
 * arrow from a property read as being from THAT property.
 *
 * Clamped off the very ends, because a box has corners and a rounded one has no straight edge
 * there: a first or last row would otherwise be touched on the curve. Only the inline sides can
 * carry a row, for the reason `DiagramEdgeInput.fromRow` gives; a row asked for on a block side is
 * no anchor at all and says so by returning nothing.
 */
function rowPin(
  box: DiagramBox,
  side: PhysicalSide,
  row: DiagramRowMeasurement | undefined,
): number | undefined {
  if (!row || vertical(side) || box.height <= 0) return undefined;
  const centre = row.box.y + row.box.height / 2;
  return Math.min(0.92, Math.max(0.08, (centre - box.y) / box.height));
}

/* ---------------------------------------------------------------------------------------------- *
 * Zones
 * ---------------------------------------------------------------------------------------------- */

/** One region, as the author declared it: a name, what it is inside, and nothing about where it is. */
export type DiagramZoneInput = {
  readonly zone: string;
  /** The zone this one sits inside, when it is nested. A VPC's subnet says `within: "vpc"`. */
  readonly within?: string;
};

/** Where a zone's boundary goes. `null` for a zone no node claims: a region around nothing. */
export type DiagramZonePlacement = {
  readonly box: DiagramBox;
  /** How many zones deep this one is nested, counted from the innermost. */
  readonly depth: number;
} | null;

/**
 * WHICH NODES EACH ZONE HOLDS, resolved through nesting.
 *
 * A node names the INNERMOST zone it is in and nothing else, which is the only thing an author
 * reliably knows: an instance is "in the public subnet", and whether that subnet is in a VPC is the
 * subnet's business. Everything above it is reached by following `within`, so moving a subnet into
 * a different VPC is one edit rather than one per instance.
 *
 * A cycle in `within` (a zone inside itself, however indirectly) stops the walk rather than hanging:
 * each node contributes to each zone at most once.
 */
export function diagramZoneMembers(
  zones: readonly DiagramZoneInput[],
  nodeZones: ReadonlyMap<string, string>,
): ReadonlyMap<string, ReadonlySet<string>> {
  const within = new Map(zones.map((zone) => [zone.zone, zone.within] as const));
  const members = new Map<string, Set<string>>(zones.map((zone) => [zone.zone, new Set<string>()]));

  for (const [node, innermost] of nodeZones) {
    const seen = new Set<string>();
    let at: string | undefined = innermost;
    while (at !== undefined && !seen.has(at)) {
      seen.add(at);
      members.get(at)?.add(node);
      at = within.get(at);
    }
  }
  return members;
}

/**
 * HOW DEEP EACH ZONE IS, counted as the longest chain of zones nested INSIDE it.
 *
 * It exists so an outer boundary is drawn further out than the boundary it contains. Without it the
 * two are inflated by the same padding, and a VPC whose only contents are two subnets comes out
 * exactly as big as the pair of them: its border lands on theirs and the drawing says the three
 * regions are one. Counting downward rather than upward is what makes the outermost the biggest
 * without anything having to know the total.
 */
export function diagramZoneDepths(
  zones: readonly DiagramZoneInput[],
): ReadonlyMap<string, number> {
  const children = new Map<string, string[]>();
  for (const zone of zones) {
    if (zone.within === undefined) continue;
    const list = children.get(zone.within);
    if (list) list.push(zone.zone);
    else children.set(zone.within, [zone.zone]);
  }

  const depths = new Map<string, number>();
  const measure = (name: string, seen: ReadonlySet<string>): number => {
    const known = depths.get(name);
    if (known !== undefined) return known;
    if (seen.has(name)) return 0;
    const inside = new Set([...seen, name]);
    const depth = (children.get(name) ?? []).reduce(
      (deepest, child) => Math.max(deepest, 1 + measure(child, inside)),
      0,
    );
    depths.set(name, depth);
    return depth;
  };
  for (const zone of zones) measure(zone.zone, new Set());
  return depths;
}

/**
 * The strip at the top of each placed zone where its name sits, as boxes a rail can be told to
 * avoid. Fed to `routeDiagram` as `keepRailsOut`; see `clearOfBands`.
 */
export function diagramZoneHeaders(
  zones: readonly DiagramZonePlacement[],
  header: number = DIAGRAM_ZONE_HEADER,
): readonly DiagramBox[] {
  return zones.flatMap((zone) =>
    zone ? [{ x: zone.box.x, y: zone.box.y, width: zone.box.width, height: header }] : [],
  );
}

export type DiagramZoneOptions = {
  readonly padding?: number;
  readonly header?: number;
};

/**
 * The box each zone's boundary is drawn at: the union of what it holds, grown by its own depth.
 *
 * A ZONE DOES NOT LAY ANYTHING OUT, which is what keeps it inside this component's boundary rather
 * than over it. The grid places the nodes; a zone is a line drawn around where they landed. That is
 * also why it needs no geometry from the author: "which nodes" is the whole of the data, and the
 * rectangle follows from wherever those nodes are on the day.
 */
export function placeDiagramZones(
  nodes: readonly DiagramNodeMeasurement[],
  zones: readonly DiagramZoneInput[],
  nodeZones: ReadonlyMap<string, string>,
  options: DiagramZoneOptions = {},
): readonly DiagramZonePlacement[] {
  const padding = options.padding ?? DIAGRAM_ZONE_PADDING;
  const header = options.header ?? DIAGRAM_ZONE_HEADER;
  const members = diagramZoneMembers(zones, nodeZones);
  const depths = diagramZoneDepths(zones);
  const boxById = new Map(
    nodes.filter((node) => isDiagramPointable(node.box)).map((node) => [node.id, node.box] as const),
  );

  return zones.map((zone) => {
    const held = [...(members.get(zone.zone) ?? [])]
      .map((id) => boxById.get(id))
      .filter((box): box is DiagramBox => box !== undefined);
    if (held.length === 0) return null;

    const depth = depths.get(zone.zone) ?? 0;
    const grown = padding * (depth + 1);
    const left = Math.min(...held.map((box) => box.x)) - grown;
    const top = Math.min(...held.map((box) => box.y)) - grown - header;
    const right = Math.max(...held.map((box) => box.x + box.width)) + grown;
    const bottom = Math.max(...held.map((box) => box.y + box.height)) + grown;
    return {
      box: {
        x: Math.round(left),
        y: Math.round(top),
        width: Math.round(right - left),
        height: Math.round(bottom - top),
      },
      depth,
    };
  });
}

/** The outward unit vector of a side: the way a connector heads as it leaves, and arrives. */
const outward = (side: PhysicalSide): DiagramPoint => {
  switch (side) {
    case "top":
      return { x: 0, y: -1 };
    case "bottom":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
  }
};

const vertical = (side: PhysicalSide): boolean => side === "top" || side === "bottom";

/**
 * The whole decision, from measured rectangles to the handful of strings a binding assigns. Both
 * bindings call exactly this, and neither one holds any geometry of its own.
 *
 * Everything is rounded to whole pixels on the way out, for the reason Annotation rounds: the
 * symmetry gate compares the two bindings' attributes as STRINGS, so half a pixel of subpixel layout
 * noise between two stages of the same width would read as a divergence in a drawing that is in fact
 * identical.
 *
 * The result is INDEX-ALIGNED WITH `edges`, including the ones that could not be drawn, which come
 * back as `null`. A shorter list would be a second thing for a binding to keep in step with its own
 * DOM, and the first edge that ever named a missing node would silently shift every connector after
 * it onto its neighbour's line. Annotation learned the same lesson about its `<g>` per label.
 */
export function routeDiagram(
  nodes: readonly DiagramNodeMeasurement[],
  edges: readonly DiagramEdgeInput[],
  options: DiagramRouteOptions = {},
): readonly (DiagramEdgePlacement | null)[] {
  const arrowSize = options.arrowSize ?? DIAGRAM_ARROW_SIZE;
  const arrowGap = options.arrowGap ?? DIAGRAM_ARROW_GAP;
  const cornerRadius = options.cornerRadius ?? DIAGRAM_CORNER_RADIUS;
  const laneGap = options.laneGap ?? DIAGRAM_LANE_GAP;
  const snap = options.snap ?? DIAGRAM_SNAP;
  const corridorGap = options.corridorGap ?? DIAGRAM_CORRIDOR_GAP;
  const keepRailsOut = options.keepRailsOut ?? [];
  const direction = options.direction ?? "ltr";

  /* First declaration wins, which is also what `querySelector` would do, so the two bindings agree
     about a frame whose author repeated a name. The validator rejects that composition anyway. */
  const byId = new Map<string, DiagramNodeMeasurement>();
  for (const node of nodes) if (!byId.has(node.id)) byId.set(node.id, node);

  type Resolved = {
    readonly index: number;
    readonly from: DiagramNodeMeasurement;
    readonly to: DiagramNodeMeasurement;
    readonly exit: PhysicalSide;
    readonly enter: PhysicalSide;
    readonly back: boolean;
    readonly self: boolean;
    /** The rows this edge is anchored to, when it names any that resolve. */
    readonly fromRow?: DiagramRowMeasurement;
    readonly toRow?: DiagramRowMeasurement;
  };

  const rowOf = (
    node: DiagramNodeMeasurement,
    id: string | undefined,
  ): DiagramRowMeasurement | undefined => {
    if (!id) return undefined;
    const row = node.rows?.find((candidate) => candidate.id === id);
    return row && isDiagramPointable(row.box) ? row : undefined;
  };

  const resolved: Resolved[] = [];
  for (const [index, edge] of edges.entries()) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) continue;
    if (!isDiagramPointable(from.box) || !isDiagramPointable(to.box)) continue;
    if (from === to) {
      resolved.push({ index, from, to, exit: "right", enter: "top", back: false, self: true });
      continue;
    }

    /*
     * A ROW-ANCHORED EDGE COMES IN FROM THE SIDE, always, and this is the one place an edge's own
     * data overrides the geometric ladder.
     *
     * A row has a height and no width, so a connector arriving on a node's TOP edge cannot say
     * which row it meant: it would land somewhere along a side the row does not span. Coming in
     * inline, the touch point IS the row's height, which is the whole claim a foreign key makes.
     *
     * The override needs the two boxes to be clear of each other horizontally, because "the side
     * facing the other node" is only a side when there is one. Two records stacked in the same
     * column have no such side, so they keep the ordinary ladder and lose the row anchor, which is
     * the honest outcome: the drawing cannot say what the data said, so it says less rather than
     * something false.
     */
    const rows = { fromRow: rowOf(from, edge.fromRow), toRow: rowOf(to, edge.toRow) };
    const anchored = rows.fromRow !== undefined || rows.toRow !== undefined;
    const clearInline = to.box.x >= from.box.x + from.box.width || to.box.x + to.box.width <= from.box.x;
    if (anchored && clearInline) {
      const rightwards = to.box.x >= from.box.x + from.box.width;
      resolved.push({
        index,
        from,
        to,
        exit: rightwards ? "right" : "left",
        enter: rightwards ? "left" : "right",
        back: false,
        self: false,
        ...rows,
      });
      continue;
    }

    const sides = edgeSides(from.box, to.box);
    /* A back edge does not leave through the side the ladder named: the ladder only told us it IS
       one. Where it detours is decided below, once every back edge on the frame is known, because
       the lane has to clear the nodes it passes rather than only the two it joins. */
    resolved.push({ index, from, to, ...sides, self: false });
  }

  /*
   * WHICH MARGIN EACH BACK EDGE RETURNS THROUGH, and how far out it runs.
   *
   * `inline-end` by preference, so that "this comes back" is one convention a drawing teaches once
   * rather than a decision a reader re-derives per line. The preference yields for exactly one
   * reason: the run out to that margin would cross a node that is not either of its own ends.
   *
   * That is not hypothetical tidiness. In a state chart whose last rank is two states side by side,
   * the LEFT one's return line goes out through the right margin and passes straight through its
   * neighbour on the way, which reads as an edge joining three nodes. Sent out the near margin
   * instead, each state returns on its own side and neither crosses anything. So the rule is "the
   * preferred margin unless it is blocked", and a diagram with nothing in the way still draws every
   * return on the same side.
   */
  const lanes = new Map<number, { side: PhysicalSide; at: number }>();
  const preferred: PhysicalSide = direction === "rtl" ? "left" : "right";
  const other: PhysicalSide = preferred === "right" ? "left" : "right";

  for (const edge of resolved) {
    if (!edge.back) continue;
    const top = Math.min(edge.from.box.y, edge.to.box.y);
    const bottom = Math.max(
      edge.from.box.y + edge.from.box.height,
      edge.to.box.y + edge.to.box.height,
    );
    /* Only the nodes the detour would actually pass: a wide node three rows away should not push
       the return line halfway across the drawing. Clear of THOSE, not of the frame, whose width is
       whatever CSS made it; the overlay does not clip, so a lane just outside them is both the
       shortest detour and the one that crosses least. */
    const passed = nodes.filter(
      (node) =>
        isDiagramPointable(node.box) &&
        node.box.y < bottom &&
        node.box.y + node.box.height > top,
    );
    const laneAt = (side: PhysicalSide): number =>
      side === "right"
        ? Math.max(...passed.map((node) => node.box.x + node.box.width)) + laneGap
        : Math.min(...passed.map((node) => node.box.x)) - laneGap;

    const first = { side: preferred, at: laneAt(preferred) };
    const blocked = crossings(nodes, edge.from, edge.to, first.side, first.at);
    if (blocked === 0) {
      lanes.set(edge.index, first);
      continue;
    }
    const second = { side: other, at: laneAt(other) };
    lanes.set(
      edge.index,
      crossings(nodes, edge.from, edge.to, second.side, second.at) < blocked ? second : first,
    );
  }

  /*
   * PORTS ARE ASSIGNED PER SIDE OF PER NODE, counting arrivals and departures together.
   *
   * Together, because they share one physical edge: two connectors that both touch the bottom of one
   * node at its midpoint are one stroke as far as a reader is concerned, however different their
   * roles. Ordered by where the OTHER end of each connector sits along that side's own axis, so the
   * line going left leaves on the left and nothing crosses anything it did not have to.
   */
  type PortRequest = {
    readonly edge: number;
    readonly end: "exit" | "enter";
    readonly along: number;
    /** A row's own position along the side, as a fraction. Pinned ports do not spread. */
    readonly pin?: number;
  };
  const ports = new Map<string, PortRequest[]>();
  const portKey = (nodeId: string, side: PhysicalSide): string => `${nodeId}\u0000${side}`;

  const requestPort = (
    node: DiagramNodeMeasurement,
    side: PhysicalSide,
    other: DiagramBox,
    edge: number,
    end: "exit" | "enter",
    row?: DiagramRowMeasurement,
  ): void => {
    const key = portKey(node.id, side);
    const along = vertical(side) ? other.x + other.width / 2 : other.y + other.height / 2;
    const list = ports.get(key);
    const request: PortRequest = { edge, end, along, pin: rowPin(node.box, side, row) };
    if (list) list.push(request);
    else ports.set(key, [request]);
  };

  for (const edge of resolved) {
    if (edge.self) continue;
    const lane = lanes.get(edge.index);
    if (lane) {
      requestPort(edge.from, lane.side, edge.to.box, edge.index, "exit");
      requestPort(edge.to, lane.side, edge.from.box, edge.index, "enter");
      continue;
    }
    requestPort(edge.from, edge.exit, edge.to.box, edge.index, "exit", edge.fromRow);
    requestPort(edge.to, edge.enter, edge.from.box, edge.index, "enter", edge.toRow);
  }

  const placedPorts = new Map<string, DiagramPoint>();
  for (const [key, requests] of ports) {
    const [id, side] = key.split("\u0000") as [string, PhysicalSide];
    const node = byId.get(id)!;
    const outline = sideOutline(node.box, node.shape, side);
    const order = [...requests].sort((a, b) => a.along - b.along || a.edge - b.edge);

    /*
     * A PINNED PORT KEEPS ITS OWN PLACE AND THE REST SHARE WHAT IS LEFT.
     *
     * A row-anchored connector is not negotiable: its whole claim is that it touches at THAT row's
     * height, and a spread that moved it to make room would be drawing a different fact. So the
     * pinned ones are taken out of the distribution and the unpinned ones spread among themselves,
     * which is also what keeps a record's three foreign keys from being fanned into a comb when
     * each one already knows exactly where it goes. Two rows at the same height would collide, and
     * the honest answer is that they are the same height: nothing here can separate them.
     */
    const loose = order.filter((request) => request.pin === undefined);
    const offsets = portOffsets(loose.length);
    let at = 0;
    for (const request of order) {
      const t = request.pin ?? offsets[at++]!;
      placedPorts.set(`${key}\u0000${request.edge}\u0000${request.end}`, pointAlong(outline, t));
    }
  }

  /*
   * TWO CONNECTORS MAY SHARE A RAIL, BUT NOT A STRETCH OF IT.
   *
   * Every corridor turns halfway between its two ends, which is what makes a branch's connectors
   * line up instead of forming a staircase, and it is worth keeping. What it also does, whenever two
   * relationships happen to run between the same pair of ranks, is put two lines on the SAME
   * millimetre: measured on the order model, `Customer -> Order` turned at x = 384 and
   * `Line item -> Order` at x = 385, and a reader saw one stroke where the drawing was claiming two.
   *
   * THE TEST IS OVERLAP, NOT PROXIMITY, and that distinction is the whole rule. An if/else's two
   * branches turn on the same line and occupy different stretches of it: they are a rail, and pulling
   * them apart would be inventing a difference. Two edges whose runs cover the same stretch are
   * hiding each other. So corridors that coincide are grouped, and inside a group the runs are laid
   * out by interval: any that do not overlap keep the same rail, and each one that does gets the
   * next rail over. It is the greedy pass every interval-scheduling problem takes, and on intervals
   * that pass is optimal.
   */
  type Corridor = {
    readonly index: number;
    /** Which coordinate the shared run is fixed at: `x` for a vertical run, `y` for a horizontal one. */
    readonly axis: "x" | "y";
    readonly mid: number;
    /** The stretch it covers along the other axis. */
    readonly from: number;
    readonly to: number;
  };

  const corridors: Corridor[] = [];
  for (const edge of resolved) {
    if (edge.self || lanes.has(edge.index)) continue;
    const start = placedPorts.get(`${portKey(edge.from.id, edge.exit)}\u0000${edge.index}\u0000exit`);
    const end = placedPorts.get(`${portKey(edge.to.id, edge.enter)}\u0000${edge.index}\u0000enter`);
    if (!start || !end) continue;
    corridors.push(
      vertical(edge.exit)
        ? {
            index: edge.index,
            axis: "y",
            mid: clearOfBands(
              (start.y + end.y) / 2,
              Math.min(start.x, end.x),
              Math.max(start.x, end.x),
              Math.min(start.y, end.y),
              Math.max(start.y, end.y),
              keepRailsOut,
              corridorGap,
              /* Room to turn the corner and then draw a head: below this, the arrival run is
                 shorter than the mark that ends it. */
              arrowGap + arrowSize + cornerRadius,
            ),
            from: Math.min(start.x, end.x),
            to: Math.max(start.x, end.x),
          }
        : {
            index: edge.index,
            axis: "x",
            mid: (start.x + end.x) / 2,
            from: Math.min(start.y, end.y),
            to: Math.max(start.y, end.y),
          },
    );
  }

  const rails = new Map<number, number>();
  const groups = new Map<string, Corridor[]>();
  for (const corridor of corridors) {
    /* Rounded to the separation, so "the same rail" means "within one rail's width of each other"
       rather than "equal to the pixel". */
    const key = `${corridor.axis}\u0000${Math.round(corridor.mid / corridorGap)}`;
    const list = groups.get(key);
    if (list) list.push(corridor);
    else groups.set(key, [corridor]);
  }

  for (const group of groups.values()) {
    if (group.length < 2) {
      rails.set(group[0]!.index, group[0]!.mid);
      continue;
    }
    const order = [...group].sort((a, b) => a.from - b.from || a.index - b.index);
    /* One entry per rail: how far along the shared axis that rail is already spoken for. */
    const taken: number[] = [];
    const track = new Map<number, number>();
    for (const corridor of order) {
      let at = taken.findIndex((end) => end <= corridor.from);
      if (at === -1) at = taken.push(Number.NEGATIVE_INFINITY) - 1;
      taken[at] = corridor.to;
      track.set(corridor.index, at);
    }
    /* Centred on the corridor they all wanted, so a pair splits either side of it rather than
       drifting off in one direction. */
    const centre = group.reduce((sum, corridor) => sum + corridor.mid, 0) / group.length;
    const spread = (taken.length - 1) / 2;
    for (const corridor of group) {
      rails.set(corridor.index, centre + (track.get(corridor.index)! - spread) * corridorGap);
    }
  }

  const placements: (DiagramEdgePlacement | null)[] = new Array(edges.length).fill(null);
  /*
   * A decision's obstacle is its BOUNDING BOX, although half of that box is empty air, and the
   * emptiest parts are the corners a branch label would like to sit in. Pricing the inscribed
   * rectangle instead (half width, half height, centred: the largest box that fits in a rhombus)
   * was tried and measured worse - 2 overlaps became 4. The permission to use a corner is also
   * permission to drift toward the middle, and a chip on the diamond costs less than the penalty
   * for stepping off the stroke, so the search takes it. Over-strict keeps labels off the shape;
   * under-strict puts them on it, which is the failure that shows.
   */
  const nodeBoxes = nodes.filter((node) => isDiagramPointable(node.box)).map((node) => node.box);
  /* Each label, once placed, becomes something the next label has to miss. See the note below. */
  const placedChips: DiagramBox[] = [];

  for (const edge of resolved) {
    const arrow = edges[edge.index]!.arrow ?? "end";
    const points = edge.self
      ? selfRoute(edge.from, laneGap)
      : routePoints(edge, lanes.get(edge.index), placedPorts, portKey, snap, rails.get(edge.index));
    /*
     * THE TIP IS WHERE THE HEAD IS, AND THE STROKE STOPS BEHIND IT.
     *
     * Two retractions, not one. The first is the standoff: the arrow points at its node from a few
     * pixels away rather than welding itself to the border (see `DIAGRAM_ARROW_GAP`), and it moves
     * the head, so it is applied before anything is drawn and everything downstream agrees about
     * where the line ends. The second is shorter and is only about the stroke: it stops at the
     * head's midline so the apex is the triangle's alone, because `stroke-linecap: round` otherwise
     * puts half a stroke width of dome past the point of every arrow in the drawing.
     */
    const tipped = simplify(
      retract(
        points.map((point) => ({ x: round(point.x), y: round(point.y) })),
        arrow === "none" ? 0 : arrowGap,
        arrow === "both" ? arrowGap : 0,
      ),
    );
    if (tipped.length < 2) continue;

    const arrows: string[] = [];
    const heads: DiagramBox[] = [];
    if (arrow === "end" || arrow === "both") {
      const tip = tipped[tipped.length - 1]!;
      const towards = heading(tipped[tipped.length - 2]!, tip);
      arrows.push(arrowPath(tip, towards, arrowSize));
      heads.push(arrowBox(tip, towards, arrowSize));
    }
    if (arrow === "both") {
      const tip = tipped[0]!;
      const towards = heading(tipped[1]!, tip);
      arrows.push(arrowPath(tip, towards, arrowSize));
      heads.push(arrowBox(tip, towards, arrowSize));
    }

    const behindHead = arrowSize * (1 - DIAGRAM_ARROW_OVERLAP);
    const line = simplify(
      retract(
        tipped,
        arrow === "none" ? 0 : behindHead,
        arrow === "both" ? behindHead : 0,
      ),
    );
    if (line.length < 2) continue;

    /*
     * The chip is placed against the FULL run (`tipped`), not the shortened stroke: what it has to
     * stay clear of is the head as a shape, and `heads` says where that is. Every node is an
     * obstacle, including this edge's own two: a label touching a box reads as belonging to it.
     *
     * AND EVERY CHIP ALREADY PLACED. Two labels colliding is the same failure as a label on a box,
     * and it is the one a branch produces on purpose: an if/else's two answers leave the same node
     * at the same height, so their chips want the same band. Feeding each placed chip forward as an
     * obstacle is a greedy pass, not an optimum, which is the right trade here: it is one loop, it
     * is deterministic in authoring order (so both bindings agree), and the case it cannot solve is
     * the case where there was no room for two labels anyway.
     */
    const measured = edges[edge.index]!.label;
    const anchor = placeDiagramLabel(tipped, measured, [
      ...heads,
      ...nodeBoxes,
      ...placedChips,
    ]);
    if (measured && (measured.width > 0 || measured.height > 0)) {
      placedChips.push({
        x: anchor.x - measured.width / 2,
        y: anchor.y - measured.height / 2,
        width: measured.width,
        height: measured.height,
      });
    }

    placements[edge.index] = {
      path: diagramPath(line, cornerRadius),
      arrows,
      label: { x: round(anchor.x), y: round(anchor.y) },
    };
  }

  return placements;
}

/**
 * How many OTHER nodes a back edge's two horizontal runs would pass through, on a given margin.
 *
 * Only the horizontal runs are tested, because the vertical one is in the margin and by
 * construction outside every node. Each run is taken over its own end's FULL HEIGHT rather than at
 * the port's exact y: the port is somewhere inside that band, and a line that clips the corner of a
 * neighbour is as wrong as one through its middle.
 */
function crossings(
  nodes: readonly DiagramNodeMeasurement[],
  from: DiagramNodeMeasurement,
  to: DiagramNodeMeasurement,
  side: PhysicalSide,
  at: number,
): number {
  let count = 0;
  for (const node of nodes) {
    if (node === from || node === to || !isDiagramPointable(node.box)) continue;
    for (const end of [from, to]) {
      const lo = side === "right" ? end.box.x + end.box.width : at;
      const hi = side === "right" ? at : end.box.x;
      if (node.box.x + node.box.width <= lo || node.box.x >= hi) continue;
      if (node.box.y + node.box.height <= end.box.y || node.box.y >= end.box.y + end.box.height) continue;
      count += 1;
    }
  }
  return count;
}

/**
 * A HORIZONTAL RAIL MOVED OUT OF A ZONE'S NAME.
 *
 * A connector between two ranks turns halfway between them, and when a region's boundary happens to
 * start in that gap, halfway is exactly where its name is: measured on the infrastructure demo, the
 * load balancer's connector ran straight through the words "Private subnet". A line through a
 * region's header reads as a line through its title, which is the one thing in a drawing that is
 * not part of the drawing.
 *
 * ONLY HORIZONTAL RAILS, and that is the whole scope rather than a simplification. A rail is the
 * stretch a connector runs ALONG; a vertical one crosses a header band perpendicular, for the
 * thickness of the band, which reads as a line entering a region and is correct. It is running
 * level with the text that looks like a strike-through.
 *
 * It yields rather than insists: pushing the rail below the band is only allowed while it stays
 * between the two ports, because a rail outside them turns the elbow inside out. A band too deep to
 * escape keeps the rail it had, which is the honest outcome, and the drawing is no worse than it
 * was before this function existed.
 */
function clearOfBands(
  mid: number,
  from: number,
  to: number,
  lowest: number,
  highest: number,
  bands: readonly DiagramBox[],
  clearance: number,
  approach: number,
): number {
  /*
   * THE RAIL HAS TO LEAVE ROOM FOR THE ARRIVAL, and forgetting that is what the `approach` argument
   * is here to remember.
   *
   * The first version only checked that the moved rail stayed BETWEEN the two ports, which is true
   * of a rail one pixel above the target and is useless there: the final run is then shorter than
   * the arrowhead plus its standoff, so `retract` eats the whole of it and the head is drawn at the
   * end of the HORIZONTAL run instead. That is exactly what it looked like, a line arriving from
   * the side with an arrow on top of it pointing down, and it is the drawing contradicting itself
   * about which way the edge goes.
   *
   * So a move is only allowed if it leaves `approach` on both sides: enough to turn the corner and
   * enough to draw a head. Below first, because a region's name is at the top of it and below is
   * inside; above second, which puts the run outside the region and sends the connector across the
   * boundary perpendicular, and that reads correctly too. Neither one fitting means the rail stays
   * where it was, which is a line through a label and still better than a broken arrow.
   */
  let at = mid;
  for (const band of bands) {
    /* Only a band this rail actually runs across: one off to the side is not in the way. */
    if (band.x + band.width <= from || band.x >= to) continue;
    if (at < band.y || at > band.y + band.height) continue;

    const fits = (candidate: number): boolean =>
      candidate < highest - approach && candidate > lowest + approach;
    const below = band.y + band.height + clearance;
    const above = band.y - clearance;
    if (fits(below)) at = below;
    else if (fits(above)) at = above;
  }
  return at;
}

const heading = (from: DiagramPoint, to: DiagramPoint): DiagramPoint => ({
  x: to.x - from.x,
  y: to.y - from.y,
});

/** The box an arrowhead occupies, so a label can be kept off it by the same rule that keeps it off a node. */
export function arrowBox(
  tip: DiagramPoint,
  towards: DiagramPoint,
  size: number = DIAGRAM_ARROW_SIZE,
): DiagramBox {
  const length = Math.hypot(towards.x, towards.y);
  const dx = length === 0 ? 0 : towards.x / length;
  const dy = length === 0 ? 0 : towards.y / length;
  const half = (size * DIAGRAM_ARROW_RATIO) / 2;
  const base = { x: tip.x - dx * size, y: tip.y - dy * size };
  /* The triangle's bounding box: its apex, and its base spread across the perpendicular. */
  const corners = [
    tip,
    { x: base.x - dy * half, y: base.y + dx * half },
    { x: base.x + dy * half, y: base.y - dx * half },
  ];
  const left = Math.min(...corners.map((point) => point.x));
  const top = Math.min(...corners.map((point) => point.y));
  return {
    x: left,
    y: top,
    width: Math.max(...corners.map((point) => point.x)) - left,
    height: Math.max(...corners.map((point) => point.y)) - top,
  };
}

/**
 * How much two boxes share, in square pixels.
 *
 * AREA AND NOT A YES/NO, and that distinction is the whole of why the first version of this search
 * misbehaved. Priced as a flat penalty per obstacle, "overlaps something" is the same cost whether
 * a chip clips a node's corner by two pixels or sits squarely on its label, and in a corridor one
 * rank gap long EVERY position overlaps something, because the chip plus its clearance is taller
 * than the gap. The search then optimized the only thing left, the COUNT: a spot near the target
 * overlapped the node and the arrowhead (two), a spot up near the source overlapped only the source
 * (one), so every label in the state-chart demo climbed out of its corridor and parked on the box
 * above it. Area says what a person would say: a corner clipped is nearly free, a word buried is
 * not.
 */
function overlapArea(a: DiagramBox, b: DiagramBox): number {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return width > 0 && height > 0 ? width * height : 0;
}

const grow = (box: DiagramBox, by: number): DiagramBox => ({
  x: box.x - by,
  y: box.y - by,
  width: box.width + by * 2,
  height: box.height + by * 2,
});

export type DiagramLabelOptions = {
  readonly clearance?: number;
  readonly samples?: number;
  /** What a chip pays for leaving the stroke. See `DIAGRAM_LABEL_OFF_LINE`. */
  readonly offLinePenalty?: number;
};

/**
 * WHERE A LABEL CHIP GOES ON ITS OWN CONNECTOR, which is a placement problem and not a midpoint.
 *
 * A chip has a ground of its own, so it hides the stretch of stroke it covers, and it is wider than
 * the line it labels, so it reaches sideways into whatever is beside it. Both of those are fine in
 * the middle of a long straight run and wrong everywhere else, and a drawing has plenty of
 * everywhere else. THREE THINGS IT MUST NOT DO, in the order they were found:
 *
 *   1. SIT ON AN ARROWHEAD. The head is the only part of a connector that says which way the edge
 *      points; covering it leaves a word floating between two boxes saying nothing about direction.
 *   2. OVERLAP A NODE. A chip touching a box reads as belonging to that box, which is precisely the
 *      wrong reading: an edge label belongs to the LINE, and the whole point of the drawing is that
 *      those are different things. The clearance is what makes "not touching" mean "visibly apart".
 *   3. LAND ON A BEND. A corner is where a connector changes its mind, and a chip parked on one
 *      hides the change: the reader sees a line arrive, a word, and a line leave in a direction the
 *      word appears to have caused. It is not fatal the way the other two are, so it is a
 *      preference rather than a veto.
 *
 * WHY A SEARCH AND NOT A FORMULA. The three rules disagree: the position that clears the head is
 * often the one nearest a node, and the only spot clear of both may be a corner. There is no closed
 * form over a polyline and a pile of rectangles, and a formula that pretended otherwise would be a
 * pile of special cases. Sampling along the line and scoring each spot is smaller, it is honest
 * about the trade (the weights below ARE the priority order), and it degrades the right way: when
 * nothing is clear it returns the LEAST bad spot rather than nothing, because a label that vanished
 * would cost the reader more than one that overlaps.
 */
export function placeDiagramLabel(
  line: readonly DiagramPoint[],
  label: DiagramLabelBox | undefined,
  obstacles: readonly DiagramBox[],
  options: DiagramLabelOptions = {},
): DiagramPoint {
  const clearance = options.clearance ?? DIAGRAM_LABEL_CLEARANCE;
  const samples = Math.max(2, options.samples ?? DIAGRAM_LABEL_SAMPLES);
  if (line.length < 2) return line[0] ?? { x: 0, y: 0 };

  /* Nothing measured yet, or an edge with no words: there is nothing to keep clear of anything. */
  if (!label || (label.width === 0 && label.height === 0)) return pointAlong(line, 0.5);

  const bends = line.slice(1, -1);
  const area = Math.max(1, label.width * label.height);
  const offLine = options.offLinePenalty ?? DIAGRAM_LABEL_OFF_LINE;

  let best: DiagramPoint = pointAlong(line, 0.5);
  let bestCost = Number.POSITIVE_INFINITY;

  for (let i = 0; i < samples; i += 1) {
    const t = i / (samples - 1);
    const on = pointAlong(line, t);

    /*
     * THREE PLACES PER SAMPLE: on the stroke, and just clear of it either side.
     *
     * On the stroke is the right answer whenever there is room, and the penalty below is what keeps
     * it the default. There is not always room. A connector between two ranks is only as long as
     * the gap between them, and on a phone that gap is shorter than the chip: the state chart's two
     * branch labels each covered their whole elbow AND overlapped each other, because every
     * position either of them could take was equally bad and the search was choosing between bad
     * and bad. Beside the stroke is a fourth option, and it is the one a person drawing this by
     * hand would have taken.
     *
     * The offset is measured ACROSS the segment the sample sits on, so a chip beside a vertical run
     * moves sideways and one beside a horizontal run moves up or down: half the chip plus its
     * clearance, which puts its near edge exactly that far off the line.
     */
    const along = headingAlong(line, t);
    const length = Math.hypot(along.x, along.y);
    const across = length === 0 ? { x: 0, y: 0 } : { x: -along.y / length, y: along.x / length };
    const reach =
      (Math.abs(across.x) > Math.abs(across.y) ? label.width : label.height) / 2 + clearance;

    for (const step of [0, reach, -reach]) {
      const at = { x: on.x + across.x * step, y: on.y + across.y * step };
      const box: DiagramBox = {
        x: at.x - label.width / 2,
        y: at.y - label.height / 2,
        width: label.width,
        height: label.height,
      };
      const chip = grow(box, clearance);

      let cost = step === 0 ? 0 : offLine;
      for (const obstacle of obstacles) {
        const covered = overlapArea(box, obstacle);
        const crowded = overlapArea(chip, obstacle) - covered;
        /*
         * Two prices, and the ratio between them is the rule. COVERED is the chip actually on top
         * of something, measured as a fraction of whichever box is smaller, so burying a whole
         * arrowhead (48 square pixels) costs as much as burying a whole node: it is the SHARE of
         * the smaller thing that is lost, not the pixels. CROWDED is only the clearance band being
         * infringed, which is a manners problem and not a legibility one.
         */
        const share = Math.max(1, Math.min(area, obstacle.width * obstacle.height));
        cost += (covered / share) * 100;
        cost += (crowded / share) * 20;
      }
      /* A preference. One bend under the chip is worth avoiding; two is worse. */
      for (const bend of bends) {
        if (
          bend.x > chip.x &&
          bend.x < chip.x + chip.width &&
          bend.y > chip.y &&
          bend.y < chip.y + chip.height
        ) {
          cost += 8;
        }
      }
      /* And, everything else being equal, the middle of the line is where a label belongs. */
      cost += Math.abs(t - 0.5) * 4;

      if (cost < bestCost) {
        bestCost = cost;
        best = at;
      }
    }
  }

  return best;
}

/**
 * Shortens a polyline at either end, along its own last (or first) segment.
 *
 * Pulled back along the SEGMENT rather than toward the other endpoint, which for an elbow are two
 * different directions: a connector arriving from the side and turning down into its target would,
 * on the naive version, retreat diagonally and leave its arrowhead beside the corridor instead of
 * in it. It also refuses to eat a segment whole (half of it is the floor), so a very short final
 * run gets a smaller gap rather than an inverted one.
 */
function retract(points: readonly DiagramPoint[], atEnd: number, atStart: number): DiagramPoint[] {
  const out = points.map((point) => ({ ...point }));
  const pull = (index: number, towardIndex: number, by: number): void => {
    if (by <= 0 || out.length < 2) return;
    const tip = out[index]!;
    const inner = out[towardIndex]!;
    const length = Math.hypot(inner.x - tip.x, inner.y - tip.y);
    if (length === 0) return;
    const step = Math.min(by, length / 2);
    out[index] = {
      x: tip.x + ((inner.x - tip.x) / length) * step,
      y: tip.y + ((inner.y - tip.y) / length) * step,
    };
  };
  pull(out.length - 1, out.length - 2, atEnd);
  pull(0, 1, atStart);
  return out;
}

/**
 * The corridor between two nodes, as an orthogonal polyline.
 *
 * Two bends at most, and the turn happens HALFWAY between the two nodes rather than as late or as
 * early as possible. Halfway is what makes a row of siblings read as a row: every connector from one
 * parent turns on the same line, so the horizontal runs stack into one visual rail instead of a
 * staircase. Late turns would put each bend against its own target and draw a different comb for
 * every diagram.
 */
function routePoints(
  edge: {
    readonly index: number;
    readonly from: DiagramNodeMeasurement;
    readonly to: DiagramNodeMeasurement;
    readonly exit: PhysicalSide;
    readonly enter: PhysicalSide;
  },
  lane: { side: PhysicalSide; at: number } | undefined,
  placed: ReadonlyMap<string, DiagramPoint>,
  portKey: (nodeId: string, side: PhysicalSide) => string,
  snap: number,
  /** The rail this connector was given, once corridors that collided were pulled apart. */
  rail: number | undefined,
): DiagramPoint[] {
  const exitSide = lane?.side ?? edge.exit;
  const enterSide = lane?.side ?? edge.enter;
  const start = placed.get(`${portKey(edge.from.id, exitSide)}\u0000${edge.index}\u0000exit`);
  const end = placed.get(`${portKey(edge.to.id, enterSide)}\u0000${edge.index}\u0000enter`);
  if (!start || !end) return [];

  /* The detour: out to the lane, along it, and back in on the same side of the target. Both ends
     leave and arrive horizontally, so the whole return is one bracket around the drawing. */
  if (lane) {
    return [start, { x: lane.at, y: start.y }, { x: lane.at, y: end.y }, end];
  }

  if (vertical(exitSide)) {
    /* Near enough to straight IS straight: see `DIAGRAM_SNAP`. */
    if (Math.abs(start.x - end.x) <= snap) {
      const x = (start.x + end.x) / 2;
      return [{ x, y: start.y }, { x, y: end.y }];
    }
    const mid = rail ?? (start.y + end.y) / 2;
    return [start, { x: start.x, y: mid }, { x: end.x, y: mid }, end];
  }
  if (Math.abs(start.y - end.y) <= snap) {
    const y = (start.y + end.y) / 2;
    return [{ x: start.x, y }, { x: end.x, y }];
  }
  const mid = rail ?? (start.x + end.x) / 2;
  return [start, { x: mid, y: start.y }, { x: mid, y: end.y }, end];
}

/**
 * A node that transitions to ITSELF, which a state chart needs and a flowchart never draws.
 *
 * It leaves the inline-end side, climbs past the top of the node and comes back down into it, so the
 * loop sits in the corner beside the node rather than over it. Drawn in the frame's own physical
 * coordinates like everything else here; a right-to-left document flips the LAYOUT, and a loop that
 * also flipped would be the only thing on the drawing that moved for a reason the reader cannot see.
 */
function selfRoute(node: DiagramNodeMeasurement, gap: number): DiagramPoint[] {
  const { x, y, width, height } = node.box;
  const right = x + width;
  const exitY = y + height / 2 - Math.min(height / 3, 14);
  const lane = right + gap;
  const top = y - gap;
  const enterX = x + width * 0.75;
  return [
    { x: right, y: exitY },
    { x: lane, y: exitY },
    { x: lane, y: top },
    { x: enterX, y: top },
    { x: enterX, y },
  ];
}

/* ---------------------------------------------------------------------------------------------- *
 * The reading of the drawing
 * ---------------------------------------------------------------------------------------------- */

/**
 * A node's OWN text, with the routes list a binding writes into it left out.
 *
 * The routes quote the nodes they reach, so reading a node's `textContent` after the routes exist
 * would quote the quotes, and every pass would grow the string it read last time. Skipping the one
 * element by class is what makes the derivation idempotent, which matters because it re-runs on
 * every resize.
 *
 * Whitespace is collapsed because authored markup is indented: a node written across three lines has
 * a `textContent` full of newlines, and a screen reader that is handed it verbatim announces the
 * indentation.
 */
export function diagramNodeText(node: Element): string {
  /* A record's TITLE is what names it. Reading the whole box would fold its rows into every route
     that mentions it ("many to 1, Product sku name"), which is a sentence about the wrong thing:
     the rows are named separately, by the edges that actually point at them. */
  const title = node.querySelector(`.${diagramParts.title}`);
  if (title) return collapse(title.textContent ?? "");

  let text = "";
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 1 && (child as Element).classList.contains(diagramParts.routes)) continue;
    text += child.textContent ?? "";
  }
  return collapse(text);
}

const collapse = (text: string): string => text.replace(/\s+/g, " ").trim();

/**
 * One route line: what an edge is called, then what it reaches.
 *
 * JOINED BY A COMMA AND NOTHING ELSE, which is the narrowest thing that could work and is chosen
 * over two alternatives that both look better on paper. A word ("to", "then", "leads to") would be
 * English inside a kit whose Spanish pages would then read half in each; there is no option that
 * could supply it without asking every author to write the same word once per diagram. An arrow
 * glyph is announced as "right arrow" by some readers, skipped by others and read as nothing by the
 * rest, so the meaning would depend on the reader's punctuation settings. A comma is punctuation
 * rather than vocabulary: it is the same mark in both languages, and every reader pauses on it,
 * which is exactly the break the line needs between the condition and the destination.
 *
 * The direction is not in this string at all. It is in WHERE the line lives: inside the node the
 * edge leaves. See `diagramParts.routes`.
 */
export function diagramRouteText(label: string, target: string): string {
  const condition = label.replace(/\s+/g, " ").trim();
  const destination = target.replace(/\s+/g, " ").trim();
  if (!condition) return destination;
  if (!destination) return condition;
  return `${condition}, ${destination}`;
}

/**
 * Every outgoing edge of each node, in authoring order, as the route lines to write into it.
 *
 * An edge anchored to a row names the ROW as well, because that is what it points at: "many to 1,
 * Product, sku" rather than "many to 1, Product". The extra comma is the same punctuation-not-
 * vocabulary choice `diagramRouteText` makes, one level down.
 */
export function diagramRoutes(
  nodes: readonly { readonly id: string; readonly text: string }[],
  edges: readonly {
    readonly from: string;
    readonly to: string;
    readonly label: string;
    /** The target row's own words, when the edge names one and it resolved. */
    readonly toRow?: string;
  }[],
): readonly (readonly string[])[] {
  const textById = new Map(nodes.map((node) => [node.id, node.text] as const));
  return nodes.map((node) =>
    edges
      .filter((edge) => edge.from === node.id && textById.has(edge.to))
      .map((edge) =>
        diagramRouteText(
          edge.label,
          edge.toRow ? `${textById.get(edge.to)!}, ${edge.toRow}` : textById.get(edge.to)!,
        ),
      ),
  );
}

/* ---------------------------------------------------------------------------------------------- *
 * Contract
 * ---------------------------------------------------------------------------------------------- */

export const diagramContract = {
  id: "diagram",
  category: "content",
  css: "@skryensya/core/components/diagram.css",
  parts: diagramParts,
  /* Connectors and routes are binding-written after measure; emit leaves the overlay empty and the
     nodes without their reading. Everything in them is derived from a rectangle or from a node's own
     text, so there is nothing here for an author to write. */
  systemOwned: ["connector", "line", "arrow", "routes", "route"],
  hookSheets: ["@skryensya/core/patterns/visually-hidden.css"],
  hooks: [
    "--sk-diagram-columns",
    "--sk-diagram-column-gap",
    "--sk-diagram-row-gap",
    "--sk-diagram-node-span",
    "--sk-diagram-node-bg",
    "--sk-diagram-node-border-color",
    "--sk-diagram-node-border-width",
    "--sk-diagram-node-color",
    "--sk-diagram-node-radius",
    "--sk-diagram-node-padding-inline",
    "--sk-diagram-node-padding-block",
    "--sk-diagram-node-min-inline-size",
    "--sk-diagram-node-max-inline-size",
    "--sk-diagram-node-font-size",
    "--sk-diagram-node-line-height",
    "--sk-diagram-node-font-weight",
    "--sk-diagram-node-shadow",
    "--sk-diagram-logo-size",
    "--sk-diagram-logo-gap",
    "--sk-diagram-row-color",
    "--sk-diagram-row-font-size",
    "--sk-diagram-row-line-height",
    "--sk-diagram-row-padding-block",
    "--sk-diagram-row-padding-inline",
    "--sk-diagram-row-rule-color",
    "--sk-diagram-decision-aspect",
    "--sk-diagram-decision-stroke-scale",
    "--sk-diagram-connector-color",
    "--sk-diagram-connector-width",
    "--sk-diagram-zone-bg",
    "--sk-diagram-zone-border-color",
    "--sk-diagram-zone-border-style",
    "--sk-diagram-zone-border-width",
    "--sk-diagram-zone-color",
    "--sk-diagram-zone-font-size",
    "--sk-diagram-zone-inset",
    "--sk-diagram-zone-inset-block-start",
    "--sk-diagram-zone-padding-block",
    "--sk-diagram-zone-padding-inline",
    "--sk-diagram-zone-radius",
    "--sk-diagram-edge-bg",
    "--sk-diagram-edge-color",
    "--sk-diagram-edge-border-color",
    "--sk-diagram-edge-radius",
    "--sk-diagram-edge-padding-inline",
    "--sk-diagram-edge-padding-block",
    "--sk-diagram-edge-font-size",
    "--sk-diagram-edge-line-height",
  ],

  options: {
    /**
     * Names the drawing, and makes the frame a `group` so a screen reader hears the nodes as one
     * figure instead of a loose list in the middle of the prose. REQUIRED, unlike most names in the
     * kit: this component's own content is a set of relationships with no heading of their own, so
     * an unnamed diagram is a list of four words nobody can place.
     */
    label: { type: "string", attr: "aria-label" },
    /**
     * How many columns the node grid has.
     *
     * The only layout number on the contract, and the argument for stopping at one: with `1` the
     * nodes stack, which is a linear flow and a state chart; with `2` a decision spanning both sits
     * over its two branches, which is an if/else and a decision tree. Those are the shapes this
     * component exists for. Anything past them is `grid-area` in the consumer's own stylesheet
     * against `.sk-diagram__node`, which is normal CSS on a normal grid and needs nothing from here.
     *
     * NO DEFAULT ON THE OPTION, on purpose: the stylesheet declares `--sk-diagram-columns: 1`, so an
     * unset option leaves the hook where the sheet put it, and a consumer's media query can retune
     * the whole drawing without fighting an inline style neither binding needed to write.
     */
    columns: {
      type: "number",
      min: 1,
      integer: true,
      styleProperty: "--sk-diagram-columns",
    },
  },

  signatures: {
    Diagram: {
      intent: [
        "flowchart",
        "decision-tree",
        "state-diagram",
        "state-machine",
        "workflow-diagram",
        "nodes-and-edges",
        "boxes-and-arrows",
        "branching-flow",
      ],
      host: { element: "div" },
      options: ["label", "columns"],
      requires: ["label"],
      slots: {
        /**
         * The things. DATA rather than children, for the reason every collection here is data: one
         * entry is referred to by NAME from a different entry, and children have no names. It is
         * also what lets the validator answer the one authoring question this component actually
         * has, which is whether an edge's `from` and `to` point at anything.
         */
        nodes: {
          accepts: "items",
          required: true,
          /* One node is not a diagram; it is a box, and `Box` already draws that. */
          minItems: 2,
          item: {
            key: "node",
            requires: ["node", "children"],
            options: {
              /** This node's name. What an edge points at, and unique within one frame. */
              node: { type: "string", attr: diagramAttrs.node },
              /**
               * Which silhouette it is drawn with. `process` is the default because most nodes are
               * a step; see `DiagramShape` for why the set stops at three.
               */
              shape: {
                type: "enum",
                values: [...diagramShapes],
                default: "process",
                attr: diagramAttrs.shape,
              },
              /**
               * How many grid columns this node covers. The one thing a two-column diagram needs
               * that plain flow cannot give it: a decision sits over BOTH its branches, so it spans
               * both. No default here for the same reason `columns` has none.
               */
              span: {
                type: "number",
                min: 1,
                integer: true,
                styleProperty: "--sk-diagram-node-span",
              },
              /**
               * The INNERMOST zone this node is in, and only that one. Whether that zone is itself
               * inside another is the zone's business (`within`), which is what makes moving a
               * subnet into a different VPC one edit rather than one per instance.
               */
              zone: { type: "string", attr: diagramAttrs.zone, keyOf: { slot: "zones" } },
            },
            slots: {
              /** What the node says. Text, or a composition; the drawing never looks inside it. */
              children: { accepts: "node", required: true },
              /**
               * THIS NODE'S MARK: a product logo, a service glyph, an icon.
               *
               * A SLOT AND NOT A SOURCE, which is the whole of the design. `logo: "/aws/s3.svg"`
               * would be smaller to write and would commit this contract to one kind of picture, one
               * loading story and one set of accessibility decisions. A slot takes an `ImageFrame`
               * around an SVG or a PNG, an `Icon` from whichever set is installed, or anything else
               * the catalogue can render, and the component's only job is to give it a box of a
               * known size. The kit ships no brand marks and never will (CONTEXT.md: the system
               * names a role, a set supplies the drawing), so a diagram's logos are the author's to
               * bring and this is where they land.
               *
               * The size is `--sk-diagram-logo-size` and it is one number for the whole drawing,
               * because twenty nodes with twenty hand-sized images is twenty chances for one of them
               * to be a different height.
               */
              logo: { accepts: "node" },
              /**
               * THE NAMED LINES INSIDE A BOX: a class's members, a table's columns, a message's
               * fields. A rule appears above them, which is what turns a box into a record.
               *
               * A SLOT AND NOT A SHAPE, deliberately. A record is not a silhouette a reader has to
               * be taught, it is a box with more in it, and what makes the drawing different is
               * that the contents are ADDRESSABLE: an edge may name a row and the connector then
               * lands at that row's own height (`fromRow` / `toRow`), which is the difference
               * between a line that says "these two tables are related" and one that says which
               * column joins to which. A shape could not carry that; only named content can.
               */
              rows: {
                accepts: "items",
                item: {
                  key: "row",
                  requires: ["row", "children"],
                  options: {
                    /** This row's name, unique within its node. What an edge's `fromRow` points at. */
                    row: { type: "string", attr: diagramAttrs.row },
                  },
                  slots: {
                    /** One line. Text: a row is a name, and a composition in it is a second diagram. */
                    children: { accepts: "text", required: true },
                  },
                },
              },
            },
          },
        },
        /**
         * THE REGIONS, which is the other thing an infrastructure drawing is made of: a VPC around
         * its subnets, a cluster around its services, a phase around its steps.
         *
         * A ZONE LAYS NOTHING OUT, and that is what keeps it inside this component's boundary
         * rather than over it. The grid places the nodes; a zone is a boundary drawn around where
         * they landed, so it needs no geometry from the author at all. Which nodes it holds is not
         * declared here either: a NODE names the zone it is in, because that is the fact an author
         * actually has, and a zone naming its members would be the same fact written twice.
         */
        zones: {
          accepts: "items",
          item: {
            key: "zone",
            requires: ["zone", "children"],
            options: {
              /** This zone's name. What a node's `zone` and another zone's `within` point at. */
              zone: { type: "string", attr: diagramAttrs.zone },
              /** The zone this one is inside. Nesting is what makes an outer boundary draw wider. */
              within: {
                type: "string",
                attr: diagramAttrs.within,
                keyOf: { slot: "zones" },
              },
            },
            slots: {
              /** What the region is called. It sits in the band the boundary's top reserves. */
              children: { accepts: "text", required: true },
            },
          },
        },
        /**
         * The relationships. A second collection rather than edges nested inside their source node,
         * and the choice is worth stating because nesting is the tidier-looking option: an edge
         * belongs to TWO nodes, and a cycle belongs to two nodes in both orders. Nested, the second
         * half of every cycle would be written somewhere the reader of the first half will not look.
         * Flat, the diagram is a list of things and a list of sentences about them, which is also
         * exactly how it is read aloud.
         */
        edges: {
          accepts: "items",
          required: true,
          minItems: 1,
          item: {
            requires: ["from", "to"],
            options: {
              /** The node this edge leaves. Must name an entry of `nodes`. */
              from: { type: "string", attr: diagramAttrs.from, keyOf: { slot: "nodes" } },
              /** The node it reaches. Must name an entry of `nodes`; may be the same one. */
              to: { type: "string", attr: diagramAttrs.to, keyOf: { slot: "nodes" } },
              /**
               * WHICH ROW OF ITS NODE each end is anchored to, when the relationship is about a row
               * rather than about the box.
               *
               * A foreign key points at a COLUMN, not at a table, and a drawing that lands the line
               * on the middle of the box has thrown away the half of the fact worth drawing. Unset
               * (the ordinary case) the connector touches wherever the geometry decides.
               *
               * NOT CHECKED BY `keyOf`, unlike `from` and `to`: a row name is only unique inside
               * ONE node, so "does this name exist" is not a question about the collection, it is a
               * question about the entry `from` happens to point at, and the contract vocabulary
               * has no way to ask it. A row that resolves to nothing costs the edge its anchor and
               * nothing else: the connector is still drawn, from the side, as though no row had
               * been named.
               */
              fromRow: { type: "string", attr: diagramAttrs.fromRow },
              toRow: { type: "string", attr: diagramAttrs.toRow },
              /** Which ends carry an arrowhead. See `DiagramArrow`. */
              arrow: {
                type: "enum",
                values: [...diagramArrows],
                default: "end",
                attr: diagramAttrs.arrow,
              },
            },
            slots: {
              /**
               * What the relationship is called: "Yes", "on error", "retry". Optional, and most
               * edges in a linear flow have none, which is why an empty one draws no chip at all
               * rather than a blank sticker on the line.
               */
              children: { accepts: "text" },
            },
          },
        },
      },
      mount: diagramAttrs.root,
      template: {
        element: "div",
        part: "root",
        host: true,
        /* The group role only exists when there is a name for it, which `requires` guarantees. */
        attrsWhen: [{ option: "label", given: true, attrs: { role: "group" } }],
        children: [
          /*
           * THE BOTTOM LAYER. A boundary is what everything else is drawn inside, so it comes
           * first: zones, then connectors, then the nodes, then the edge labels. Empty by
           * construction like the overlay beside it, because a zone's rectangle is the union of
           * boxes that do not exist until something has been laid out.
           */
          {
            element: "ul",
            part: "zones",
            children: [
              {
                element: "li",
                part: "zone",
                repeat: "zones",
                itemOptions: ["zone", "within"],
                children: [{ element: "span", part: "zoneLabel", itemSlot: "children" }],
              },
            ],
          },
          /*
           * SECOND, and the order is the paint order rather than a preference.
           *
           * A connector must run BEHIND the nodes it joins: a line crossing over a box reads as
           * passing through it. All three children are positioned, so painting is decided by
           * document order alone and this file needs no `z-index` anywhere: connectors, then the
           * nodes over them, then the edge labels over both, which is exactly the stacking a
           * drawing wants and the one thing a hand-rolled version always gets wrong.
           *
           * EMPTY BY CONSTRUCTION. Every number in here is measured.
           */
          {
            element: "svg",
            part: "connectors",
            attrs: { "aria-hidden": "true", focusable: "false" },
          },
          {
            element: "ul",
            part: "nodes",
            children: [
              {
                element: "li",
                part: "node",
                repeat: "nodes",
                itemOptions: ["node", "shape", "span", "zone"],
                children: [
                  /*
                   * THE NODE'S WORDS GET AN ELEMENT OF THEIR OWN, even for the boxes that have
                   * nothing else in them. A node with rows needs a heading above the rule, and one
                   * anatomy for every node is worth more than the span a plain box does not need:
                   * the alternative is two shapes of node and a stylesheet that has to know which
                   * it is looking at.
                   */
                  /* Before the words, because a mark is read before a name and because that is
                     where every architecture diagram has always put one. */
                  {
                    element: "span",
                    part: "logo",
                    whenItemSlotGiven: "logo",
                    itemSlot: "logo",
                  },
                  { element: "span", part: "title", itemSlot: "children" },
                  {
                    element: "ul",
                    part: "rows",
                    whenItemSlotGiven: "rows",
                    children: [
                      {
                        element: "li",
                        part: "row",
                        repeatItemSlot: "rows",
                        itemOptions: ["row"],
                        itemSlot: "children",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            element: "ul",
            part: "edges",
            children: [
              {
                element: "li",
                part: "edge",
                repeat: "edges",
                itemOptions: ["from", "to", "fromRow", "toRow", "arrow"],
                itemSlot: "children",
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/diagram", name: "Diagram" },
    },
  },

  a11y: [
    {
      when: { label: "absent" },
      requiresOneOf: ["label"],
      because:
        "un diagrama es un grupo sin encabezado propio: sin `label`, un lector de pantalla anuncia una lista de palabras sueltas y nada dice de qué es el dibujo",
    },
  ],
} as const satisfies ComponentContract;

/** Derived, never restated. */
export type DiagramOptions = OptionsOf<typeof diagramContract>;
