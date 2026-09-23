import { describe, expect, it } from "vitest";
import {
  DIAGRAM_ARROW_GAP,
  DIAGRAM_ARROW_OVERLAP,
  DIAGRAM_ARROW_SIZE,
  DIAGRAM_CORRIDOR_GAP,
  DIAGRAM_LANE_GAP,
  DIAGRAM_ZONE_HEADER,
  DIAGRAM_ZONE_PADDING,
  arrowPath,
  diagramPath,
  diagramRouteText,
  diagramRoutes,
  diagramZoneDepths,
  diagramZoneHeaders,
  diagramZoneNames,
  diagramZoneMembers,
  placeDiagramZones,
  edgeSides,
  arrowBox,
  isDiagramPointable,
  placeDiagramLabel,
  pointAlong,
  portOffsets,
  routeDiagram,
  sideOutline,
  DIAGRAM_GATE_BACK_BOW,
  DIAGRAM_GATE_PORT_BAND,
  diagramGates,
  isDiagramGate,
  isDiagramShape,
  type DiagramBox,
  type DiagramNodeMeasurement,
} from "./diagram.js";

/*
 * THE GEOMETRY, against numbers. What is proved here is what the drawing IS; what the bindings prove
 * is that the DOM they measure arrives in the coordinate space this expects.
 *
 * One layout is shared by most of the tests below, so an assertion can be read without re-deriving
 * it. All of it is in the frame's own coordinates:
 *
 *   top     at (100,   0), 100 x 40   (centre 150,  20)
 *   bottom  at (100, 100), 100 x 40   (centre 150, 120)
 *
 * and the branch layout, for everything about a decision:
 *
 *   ask     at ( 60,   0), 180 x 180  (a rhombus, centre 150, 90)
 *   left    at (  0, 240), 120 x 40
 *   right   at (180, 240), 120 x 40
 */

const box = (x: number, y: number, width: number, height: number): DiagramBox => ({ x, y, width, height });

const node = (
  id: string,
  b: DiagramBox,
  shape: DiagramNodeMeasurement["shape"] = "process",
): DiagramNodeMeasurement => ({ id, box: b, shape });

const top = node("top", box(100, 0, 100, 40));
const bottom = node("bottom", box(100, 100, 100, 40));

const ask = node("ask", box(60, 0, 180, 180), "decision");
const left = node("left", box(0, 240, 120, 40));
const right = node("right", box(180, 240, 120, 40));

/*
 * TWO SETBACKS AT AN ARROWED END, and the assertions below name which one they mean.
 *
 *   TIP_BACK     where the arrowhead's point lands: clear of the node it aims at.
 *   STROKE_BACK  where the STROKE stops: further back still, behind the head's midline, so the
 *                apex is the triangle's alone and no round line cap domes past it.
 */
const TIP_BACK = DIAGRAM_ARROW_GAP;
const STROKE_BACK = DIAGRAM_ARROW_GAP + DIAGRAM_ARROW_SIZE * (1 - DIAGRAM_ARROW_OVERLAP);

/** The box a chip of this size claims when centred at a point, with its clearance around it. */
const grownBox = (at: { x: number; y: number }, chip: { width: number; height: number }, by: number): DiagramBox => ({
  x: at.x - chip.width / 2 - by,
  y: at.y - chip.height / 2 - by,
  width: chip.width + by * 2,
  height: chip.height + by * 2,
});

const intersects = (a: DiagramBox, b: DiagramBox): boolean =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/** Every coordinate a path names, in order, so a route can be asserted as points not as a string. */
const coordsOf = (path: string): number[] =>
  path.split(/[^-\d.]+/).filter(Boolean).map(Number);

describe("diagram geometry: the outline a connector may touch", () => {
  it("gives a rectangle the whole of the edge that faces the asked-for side", () => {
    expect(sideOutline(box(10, 20, 100, 40), "process", "bottom")).toEqual([
      { x: 10, y: 60 },
      { x: 110, y: 60 },
    ]);
    expect(sideOutline(box(10, 20, 100, 40), "process", "right")).toEqual([
      { x: 110, y: 20 },
      { x: 110, y: 60 },
    ]);
  });

  it("parametrizes every side the same way, left to right and top to bottom", () => {
    const b = box(10, 20, 100, 40);
    /* The first point of `left` is its TOP end, exactly as the first point of `right` is, so
       ordering two connectors on a side never needs to know which side it is. */
    expect(sideOutline(b, "process", "left")[0]).toEqual({ x: 10, y: 20 });
    expect(sideOutline(b, "process", "right")[0]).toEqual({ x: 110, y: 20 });
    expect(sideOutline(b, "process", "top")[0]).toEqual({ x: 10, y: 20 });
    expect(sideOutline(b, "process", "bottom")[0]).toEqual({ x: 10, y: 60 });
  });

  it("gives a decision its two facing rhombus faces instead of the empty box edge", () => {
    /* The bottom of the BOUNDING box is air: two thirds of it is outside the shape. */
    expect(sideOutline(ask.box, "decision", "bottom")).toEqual([
      { x: 60, y: 90 },
      { x: 150, y: 180 },
      { x: 240, y: 90 },
    ]);
  });

  it("treats a terminal as the rectangle it is, since its straight edges are most of its outline", () => {
    expect(sideOutline(box(0, 0, 100, 40), "terminal", "top")).toEqual(
      sideOutline(box(0, 0, 100, 40), "process", "top"),
    );
  });

  it("gives every gate a single OUTPUT POINT rather than a face to spread along", () => {
    /* One pin, so three edges leaving a gate leave from the same place. A face would draw three
       outputs, which is a claim about the part rather than about the drawing. */
    for (const gate of diagramGates) {
      expect(sideOutline(box(0, 0, 60, 48), gate, "right")).toEqual([{ x: 60, y: 24 }]);
    }
  });

  it("puts a flat-backed gate's input plane on the box edge", () => {
    for (const gate of ["and", "nand", "not"] as const) {
      expect(sideOutline(box(0, 0, 60, 48), gate, "left")).toEqual([
        { x: 0, y: 0 },
        { x: 0, y: 48 },
      ]);
    }
  });

  it("walks the OR family's bowed back, so a lead touches the symbol and not the air behind it", () => {
    /* The same correction the rhombus needed: the bounding box's left edge is not where the shape
       is. The V's depth is the silhouette's own, which is why the constant is shared. */
    for (const gate of ["or", "nor", "xor", "xnor"] as const) {
      expect(sideOutline(box(0, 0, 60, 48), gate, "left")).toEqual([
        { x: 0, y: 0 },
        { x: 60 * DIAGRAM_GATE_BACK_BOW, y: 24 },
        { x: 0, y: 48 },
      ]);
    }
  });

  it("lands a gate's two inputs on the third-heights the notation puts them at", () => {
    const outline = sideOutline(box(0, 0, 60, 48), "and", "left");
    const [first, second] = portOffsets(2, DIAGRAM_GATE_PORT_BAND).map((t) =>
      pointAlong(outline, t),
    );
    expect(first!.y).toBeCloseTo(16, 5);
    expect(second!.y).toBeCloseTo(32, 5);
  });

  it("keeps every t on the pin when a gate's output is asked for several times over", () => {
    const outline = sideOutline(box(0, 0, 60, 48), "or", "right");
    for (const t of portOffsets(3, DIAGRAM_GATE_PORT_BAND)) {
      expect(pointAlong(outline, t)).toEqual({ x: 60, y: 24 });
    }
  });
});

describe("diagram vocabulary: which shapes are gates", () => {
  it("admits every gate as a shape, so a binding reading the attribute needs no second list", () => {
    for (const gate of diagramGates) expect(isDiagramShape(gate)).toBe(true);
  });

  it("holds the whole notation, inversions included", () => {
    expect([...diagramGates]).toEqual(["and", "or", "xor", "nand", "nor", "xnor", "not"]);
  });

  it("does not call a prose shape a gate", () => {
    for (const shape of ["process", "decision", "terminal"] as const) {
      expect(isDiagramGate(shape)).toBe(false);
    }
  });
});

describe("diagram geometry: walking a polyline", () => {
  it("measures the halfway point by arc length, not by counting segments", () => {
    /* An L with a long arm and a short one: by segment count the middle is the elbow, which is not
       where anyone would put a label. */
    const elbow = [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 20, y: 100 },
    ];
    expect(pointAlong(elbow, 0.5)).toEqual({ x: 0, y: 60 });
  });

  it("clamps past either end and survives a polyline with no length at all", () => {
    const line = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    expect(pointAlong(line, -1)).toEqual({ x: 0, y: 0 });
    expect(pointAlong(line, 4)).toEqual({ x: 10, y: 0 });
    expect(pointAlong([{ x: 5, y: 5 }], 0.5)).toEqual({ x: 5, y: 5 });
  });

  it("puts a single connector at the middle of its side and spreads several inside the band", () => {
    expect(portOffsets(1)).toEqual([0.5]);
    expect(portOffsets(2)).toEqual([0.2, 0.8]);
    expect(portOffsets(3)).toEqual([0.2, 0.5, 0.8]);
  });
});

describe("diagram geometry: the path it draws", () => {
  it("writes a two-point run as one straight line with no curve in it", () => {
    expect(diagramPath([{ x: 0, y: 0 }, { x: 0, y: 50 }])).toBe("M 0 0 L 0 50");
  });

  it("rounds an interior corner into a quadratic through the vertex", () => {
    const path = diagramPath(
      [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
      ],
      8,
    );
    expect(path).toBe("M 0 0 L 0 92 Q 0 100 8 100 L 100 100");
  });

  it("clamps a corner to half of each arm, so a short jog softens instead of overshooting", () => {
    const path = diagramPath(
      [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
      ],
      40,
    );
    expect(path).toBe("M 0 0 L 0 5 Q 0 10 5 10 L 10 10");
  });

  it("drops a repeated point rather than curving through it", () => {
    expect(
      diagramPath([
        { x: 0, y: 0 },
        { x: 0, y: 50 },
        { x: 0, y: 50 },
        { x: 0, y: 90 },
      ]),
    ).toBe("M 0 0 L 0 90");
  });

  it("drops a point that only sits on the line between its neighbours", () => {
    /* A four-point route between two nodes in one column turns at the halfway line, through
       nothing: left in, the rounding would draw a curve at a corner that does not exist. */
    expect(
      diagramPath([
        { x: 150, y: 40 },
        { x: 150, y: 70 },
        { x: 150, y: 70 },
        { x: 150, y: 100 },
      ]),
    ).toBe("M 150 40 L 150 100");
  });

  it("keeps a point that genuinely turns", () => {
    expect(
      diagramPath(
        [
          { x: 0, y: 0 },
          { x: 0, y: 50 },
          { x: 40, y: 50 },
        ],
        0,
      ),
    ).toBe("M 0 0 L 0 50 L 40 50");
  });

  it("points the arrowhead the way the line was travelling, and keeps both base corners even", () => {
    /* Heading straight down: the tip is the arrival point and the base is one length back. */
    expect(arrowPath({ x: 150, y: 100 }, { x: 0, y: 60 })).toBe("M 150 100 L 147 92 L 153 92 Z");
    /* Heading right: the same triangle, turned. */
    expect(arrowPath({ x: 100, y: 50 }, { x: 40, y: 0 })).toBe("M 100 50 L 92 53 L 92 47 Z");
  });

  it("draws no arrowhead for a heading with no direction in it", () => {
    expect(arrowPath({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe("");
  });
});

describe("diagram geometry: where a label chip may sit", () => {
  /* A long straight run down the page, so a chip has somewhere to slide. */
  const straight = [
    { x: 100, y: 0 },
    { x: 100, y: 200 },
  ];
  const chip = { width: 60, height: 20 };

  it("takes the middle of the line when nothing is in the way", () => {
    expect(placeDiagramLabel(straight, chip, [])).toEqual({ x: 100, y: 100 });
  });

  it("takes the middle when no chip has been measured, since nothing has a size to clash", () => {
    expect(placeDiagramLabel(straight, undefined, [box(0, 80, 400, 40)])).toEqual({ x: 100, y: 100 });
  });

  it("slides clear of a node parked across the middle of its own connector", () => {
    const blocker = box(60, 80, 80, 40);
    const at = placeDiagramLabel(straight, chip, [blocker]);
    const around = grownBox(at, chip, 5);
    expect(intersects(around, blocker)).toBe(false);
  });

  it("keeps the clearance, so clearing a box means visibly apart and not merely touching", () => {
    const blocker = box(60, 80, 80, 40);
    const at = placeDiagramLabel(straight, chip, [blocker], { clearance: 20 });
    expect(intersects(grownBox(at, chip, 20), blocker)).toBe(false);
  });

  it("stays on the line rather than jumping off it to find room", () => {
    const at = placeDiagramLabel(straight, chip, [box(60, 80, 80, 40)]);
    expect(at.x).toBe(100);
    expect(at.y).toBeGreaterThanOrEqual(0);
    expect(at.y).toBeLessThanOrEqual(200);
  });

  it("prefers a straight stretch over parking on a bend", () => {
    const elbow = [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 200, y: 100 },
    ];
    const at = placeDiagramLabel(elbow, { width: 30, height: 16 }, []);
    /* The corner is (0, 100); a chip centred within 15 x 8 of it would contain the bend. */
    expect(Math.abs(at.x) > 15 || Math.abs(at.y - 100) > 8).toBe(true);
  });

  it("returns the least bad spot rather than nothing when the line is boxed in", () => {
    /* A wall over the whole connector: there is no clear position, and a label that vanished would
       cost the reader more than one that overlaps. */
    const at = placeDiagramLabel(straight, chip, [box(-500, -500, 1000, 1000)]);
    expect(Number.isFinite(at.x)).toBe(true);
    expect(Number.isFinite(at.y)).toBe(true);
  });

  it("boxes an arrowhead by its own triangle, so the same rule keeps a chip off it", () => {
    /* Pointing straight down at (100, 200), eight long and six across. */
    expect(arrowBox({ x: 100, y: 200 }, { x: 0, y: 1 })).toEqual({
      x: 97,
      y: 192,
      width: 6,
      height: 8,
    });
  });

  it("steps along its own line rather than cover a connector that crosses it", () => {
    /* A second relationship running across the middle of this one: at the midpoint the chip's own
       ground would swallow it, and what the reader is left with is a word between two stubs. */
    const crossing = [
      { x: 0, y: 100 },
      { x: 200, y: 100 },
    ];
    const at = placeDiagramLabel(straight, chip, [], { strokes: [crossing] });
    /* Still on its own stroke - sliding is cheap, stepping aside is not - and clear of the other. */
    expect(at.x).toBe(100);
    expect(Math.abs(at.y - 100)).toBeGreaterThan(chip.height / 2);
  });

  it("pays nothing for a connector that passes nowhere near the chip", () => {
    const elsewhere = [
      { x: 0, y: 190 },
      { x: 200, y: 190 },
    ];
    expect(placeDiagramLabel(straight, chip, [], { strokes: [elsewhere] })).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("never lets a chip land on the arrowhead of its own edge", () => {
    const short = [
      { x: 100, y: 0 },
      { x: 100, y: 60 },
    ];
    const head = arrowBox({ x: 100, y: 60 }, { x: 0, y: 1 });
    const at = placeDiagramLabel(short, { width: 40, height: 18 }, [head]);
    expect(intersects(grownBox(at, { width: 40, height: 18 }, 5), head)).toBe(false);
  });
});

describe("diagram geometry: which sides an edge uses", () => {
  it("goes down out of one node and into the top of the one below it", () => {
    expect(edgeSides(top.box, bottom.box)).toEqual({ exit: "bottom", enter: "top", back: false });
  });

  it("calls the reverse of that a back edge, which is what makes a cycle a cycle", () => {
    expect(edgeSides(bottom.box, top.box)).toEqual({ exit: "top", enter: "bottom", back: true });
  });

  it("goes across when the two overlap vertically, toward whichever one is on the far side", () => {
    expect(edgeSides(box(0, 0, 100, 40), box(200, 10, 100, 40))).toEqual({
      exit: "right",
      enter: "left",
      back: false,
    });
    expect(edgeSides(box(200, 0, 100, 40), box(0, 10, 100, 40))).toEqual({
      exit: "left",
      enter: "right",
      back: false,
    });
  });

  it("falls back to the ordinary downward answer for two nodes sharing a cell", () => {
    expect(edgeSides(box(0, 0, 100, 40), box(10, 10, 100, 40))).toEqual({
      exit: "bottom",
      enter: "top",
      back: false,
    });
  });

  it("asks whether the target is below BEFORE asking which way the centres point", () => {
    /* An if/else: the branch is further sideways than it is down, so an angle-based rule would send
       the connector out of the decision's side and U-turn it back down. */
    expect(edgeSides(ask.box, left.box)).toEqual({ exit: "bottom", enter: "top", back: false });
  });

  it("ignores the ladder entirely when a gate is at either end", () => {
    /* The gate is ABOVE its operand, which the ladder alone calls a BACK edge and routes out to a
       margin - and a margin lane asks both ends for a port on the same physical side, which at a
       gate means feeding the nose. The arrival is pinned to the back plane and the detour is off. */
    const operand = box(0, 200, 100, 40);
    const gate = box(200, 0, 60, 48);
    expect(edgeSides(operand, gate, { from: "process", to: "and" })).toEqual({
      exit: "right",
      enter: "left",
      back: false,
    });
    /* The ladder on its own would have made that a back edge, and "top" was its answer only because
       a detour was going to use it. */
    expect(edgeSides(operand, gate)).toEqual({ exit: "top", enter: "bottom", back: true });
    /* And the other way round: the result leaves the nose, and the box below it - which is not a
       gate and has no opinion - still takes the arrival the ladder chose for it. */
    expect(edgeSides(gate, operand, { from: "and", to: "process" })).toEqual({
      exit: "right",
      enter: "top",
      back: false,
    });
  });

  it("sends an operand out of the side facing its gate, so the wire arrives ALONG the back plane", () => {
    /*
     * The half adder's own geometry: `A` is a rank above and a column left of the AND it feeds. The
     * ladder alone says "below, so let go downwards", and a corridor's last segment follows the side
     * it LEFT - so the wire reached a correct pin by running down the gate's own back plane, which
     * on the page reads as an operand arriving through the roof.
     */
    const a = box(23, 0, 96, 48);
    const and = box(194, 98, 60, 48);
    expect(edgeSides(a, and, { from: "terminal", to: "and" })).toEqual({
      exit: "right",
      enter: "left",
      back: false,
    });

    const placed = routeDiagram(
      [node("a", a, "terminal"), node("and", and, "and")],
      [{ from: "a", to: "and", arrow: "none" }],
    );
    const points = coordsOf(placed[0]!.path);
    /* The last two points of the run share a y: the wire comes in level with the pin it touches,
       rather than down the edge the pin sits on. */
    const [, lastButOneY, , lastY] = points.slice(-4);
    expect(lastY).toBe(lastButOneY);
    /* And it touches the back plane, not the top. */
    expect(points[points.length - 2]).toBe(and.x);
  });

  it("keeps the ladder's answer for a wire that runs BACKWARDS, which has no gap to turn in", () => {
    /* A gate whose result is read by a box in an EARLIER column. Facing the gate would send the
       wire out of the nose and back into the same side of the box; the feedback route that would
       draw properly is four bends, which this module does not have. */
    const gate = box(200, 0, 60, 48);
    const behind = box(0, 200, 100, 40);
    expect(edgeSides(gate, behind, { from: "and", to: "process" })).toEqual({
      exit: "right",
      enter: "top",
      back: false,
    });
  });

  it("pins only the end that IS a gate, and leaves the other one to the ladder", () => {
    /* The box sits above, so it still lets go downwards: the drawing keeps flowing the way the grid
       laid it out, and only the arrival is forced onto the back plane. */
    const step = box(0, 0, 100, 40);
    const gate = box(0, 200, 60, 48);
    expect(edgeSides(step, gate, { from: "process", to: "or" })).toEqual({
      exit: "bottom",
      enter: "left",
      back: false,
    });
  });

  it("turns a suppressed back edge's orphaned side toward the gate instead of out the roof", () => {
    /* The operand is BELOW the gate it feeds, which is the rung that answers "top" so a detour can
       run up the margin. There is no detour, so the line would have left the top of the box and come
       straight back down into a gate beside it. */
    const operand = box(0, 200, 100, 40);
    const gate = box(200, 0, 60, 48);
    expect(edgeSides(operand, gate, { from: "process", to: "and" }).exit).toBe("right");

    const mirrored = box(400, 200, 100, 40);
    expect(edgeSides(mirrored, gate, { from: "process", to: "and" }).exit).toBe("left");
  });

  it("mirrors a gate's ports in an RTL drawing, because the grid has already mirrored", () => {
    const a = box(200, 0, 60, 48);
    const b = box(0, 0, 60, 48);
    expect(edgeSides(a, b, { from: "and", to: "or", direction: "rtl" })).toEqual({
      exit: "left",
      enter: "right",
      back: false,
    });
  });

  it("never calls an edge that touches a gate a back edge", () => {
    /* A margin lane asks both ends for a port on the SAME physical side, i.e. a signal into the nose
       or an output off the back plane. A backwards wire is drawn as an ordinary connector instead -
       readably only while the two gates are in different columns, which is the limit `edgeSides`
       states and the semantic overlay tells an author about. */
    const later = box(200, 0, 60, 48);
    const earlier = box(0, 200, 60, 48);
    expect(edgeSides(later, earlier, { from: "nor", to: "nor" }).back).toBe(false);
  });

  it("leaves every shapeless call answering exactly as it did before gates existed", () => {
    expect(edgeSides(bottom.box, top.box)).toEqual(
      edgeSides(bottom.box, top.box, { from: "process", to: "process" }),
    );
  });
});

describe("diagram routing: a gate", () => {
  const a = node("a", box(0, 0, 100, 40));
  const b = node("b", box(0, 120, 100, 40));
  const gate = node("gate", box(200, 40, 60, 48), "and");
  const out = node("out", box(360, 40, 100, 40), "terminal");

  const placements = routeDiagram(
    [a, b, gate, out],
    [
      { from: "a", to: "gate", arrow: "none" },
      { from: "b", to: "gate", arrow: "none" },
      { from: "gate", to: "out", arrow: "none" },
    ],
  );

  it("brings both operands in on the back plane and takes the result off the nose", () => {
    const [first, second, result] = placements;
    /* `arrow: "none"`, so nothing is retracted and the first and last coordinates ARE the ports. */
    const ends = (path: string) => {
      const c = coordsOf(path);
      return { start: { x: c[0], y: c[1] }, end: { x: c[c.length - 2], y: c[c.length - 1] } };
    };
    expect(ends(first!.path).end.x).toBe(200);
    expect(ends(second!.path).end.x).toBe(200);
    expect(ends(result!.path).start).toEqual({ x: 260, y: 64 });
  });

  it("spreads the two operands onto the gate's own third-heights, not onto the band a box uses", () => {
    const ends = placements
      .slice(0, 2)
      .map((placement) => coordsOf(placement!.path).slice(-1)[0]!);
    /* 48 tall from y = 40: a third and two thirds are 56 and 72. The general 0.6 band would have
       put them at 49.6 and 78.4, out at the corners of the back plane. */
    expect(ends.map(Math.round).sort((x, y) => x - y)).toEqual([56, 72]);
  });

  it("fans a gate's output out of ONE point however many edges read it", () => {
    const second = node("second", box(360, 140, 100, 40), "terminal");
    const fanned = routeDiagram(
      [gate, out, second],
      [
        { from: "gate", to: "out", arrow: "none" },
        { from: "gate", to: "second", arrow: "none" },
      ],
    );
    const starts = fanned.map((placement) => coordsOf(placement!.path).slice(0, 2));
    expect(starts[0]).toEqual([260, 64]);
    expect(starts[1]).toEqual([260, 64]);
  });
});

describe("diagram routing: a linear flow", () => {
  const placements = routeDiagram([top, bottom], [{ from: "top", to: "bottom" }]);

  it("draws one straight run between two nodes in the same column", () => {
    /* It leaves the node above it and stops short of the one below: an arrowhead points AT a box,
       it does not weld itself onto its border, and the stroke stops behind the head. */
    expect(placements[0]!.path).toBe(`M 150 40 L 150 ${100 - STROKE_BACK}`);
  });

  it("puts the label in the middle of the stroke, leaving the arrowhead uncovered", () => {
    /* Nothing measured its chip, so there is nothing to keep clear of and the anchor is the middle
       of the run the arrow actually covers: 40 to 92, not 40 to 100. */
    expect(placements[0]!.label).toEqual({ x: 150, y: 66 });
  });

  it("centres on the whole line when neither end carries a head", () => {
    const plain = routeDiagram([top, bottom], [{ from: "top", to: "bottom", arrow: "none" }]);
    expect(plain[0]!.label).toEqual({ x: 150, y: 70 });
  });

  it("keeps clear of both heads when the edge runs both ways", () => {
    const both = routeDiagram([top, bottom], [{ from: "top", to: "bottom", arrow: "both" }]);
    /* 45 to 95, minus a head at each end, centres on the same place the line does. */
    expect(both[0]!.label).toEqual({ x: 150, y: 70 });
  });

  it("puts one arrowhead at the arrival by default", () => {
    expect(placements[0]!.arrows).toHaveLength(1);
    expect(placements[0]!.arrows[0]).toBe(`M 150 ${100 - TIP_BACK} L 147 84 L 153 84 Z`);
  });

  it("draws a second arrowhead at the departure when the edge runs both ways", () => {
    const both = routeDiagram([top, bottom], [{ from: "top", to: "bottom", arrow: "both" }]);
    expect(both[0]!.arrows).toHaveLength(2);
    /* Both ends stand off now, because both ends have a head to stand off with. */
    expect(both[0]!.path).toBe(`M 150 ${40 + STROKE_BACK} L 150 ${100 - STROKE_BACK}`);
    expect(both[0]!.arrows[1]).toBe(`M 150 ${40 + TIP_BACK} L 153 56 L 147 56 Z`);
  });

  it("meets both nodes when the relationship has no direction and no head to keep clear", () => {
    const plain = routeDiagram([top, bottom], [{ from: "top", to: "bottom", arrow: "none" }]);
    expect(plain[0]!.arrows).toEqual([]);
    expect(plain[0]!.path).toBe("M 150 40 L 150 100");
  });
});

describe("diagram routing: a branch", () => {
  const placements = routeDiagram(
    [ask, left, right],
    [
      { from: "ask", to: "left" },
      { from: "ask", to: "right" },
    ],
  );

  it("leaves a decision's two lower faces rather than both leaving one vertex", () => {
    /* The south vertex is (150, 180); both origins are above it, ON the faces. */
    expect(coordsOf(placements[0]!.path).slice(0, 2)).toEqual([96, 126]);
    expect(coordsOf(placements[1]!.path).slice(0, 2)).toEqual([204, 126]);
  });

  it("keeps the two origins symmetric about the decision's own centre line", () => {
    const [leftX] = coordsOf(placements[0]!.path);
    const [rightX] = coordsOf(placements[1]!.path);
    expect(150 - leftX!).toBe(rightX! - 150);
  });

  it("orders the origins by where each branch sits, so the two connectors never cross", () => {
    const reversed = routeDiagram(
      [ask, left, right],
      [
        { from: "ask", to: "right" },
        { from: "ask", to: "left" },
      ],
    );
    /* Authoring order changed; the drawing did not: the connector to `left` still leaves on the
       left. */
    expect(coordsOf(reversed[1]!.path).slice(0, 2)).toEqual([96, 126]);
    expect(coordsOf(reversed[0]!.path).slice(0, 2)).toEqual([204, 126]);
  });

  it("draws a nearly straight corridor straight, instead of wiggling through it", () => {
    /* A branch whose origin and target are a few pixels apart across the corridor: built at four
       points it turns twice within five pixels, which reads as a kink in a line every reader would
       have drawn straight. */
    const ask2 = node("ask2", box(60, 0, 180, 180), "decision");
    const under = node("under", box(90, 240, 120, 40));
    const [placement] = routeDiagram([ask2, under], [{ from: "ask2", to: "under" }]);
    expect(placement!.path).toBe(`M 150 180 L 150 ${240 - STROKE_BACK}`);
  });

  it("turns halfway between the two ranks, so sibling connectors share one rail", () => {
    /* Both elbows are on y = 183, which is the midpoint of 126 and the children's top edge, 240. */
    expect(placements[0]!.path).toContain("183");
    expect(placements[1]!.path).toContain("183");
  });

  it("arrives above the top of each branch, in the middle of it", () => {
    expect(coordsOf(placements[0]!.path).slice(-2)).toEqual([60, 240 - STROKE_BACK]);
    expect(coordsOf(placements[1]!.path).slice(-2)).toEqual([240, 240 - STROKE_BACK]);
  });

  it("pulls back along the last segment, not toward the other end of the line", () => {
    /* The connector arrives vertically, so the gap has to be vertical: retreating toward the far
       endpoint would put the arrowhead beside the corridor instead of in it. */
    const coords = coordsOf(placements[0]!.path);
    expect(coords.at(-2)).toBe(coords.at(-4));
  });
});

describe("diagram routing: an edge anchored to a row", () => {
  /*
   * Two records side by side, each 140 x 100 with rows 20 tall:
   *
   *   line    at (  0, 0)   rows: qty (centre y 40), ref (centre y 70)
   *   product at (240, 0)   rows: sku (centre y 60)
   */
  const record = (
    id: string,
    x: number,
    rows: readonly (readonly [string, number])[],
  ): DiagramNodeMeasurement => ({
    id,
    box: box(x, 0, 140, 100),
    shape: "process",
    rows: rows.map(([rowId, centre]) => ({ id: rowId, box: box(x, centre - 10, 140, 20) })),
  });

  const line = record("line", 0, [["qty", 40], ["ref", 70]]);
  const product = record("product", 240, [["sku", 60]]);

  it("touches the node's own side at the row's height, not at the middle of the box", () => {
    const [placement] = routeDiagram(
      [line, product],
      [{ from: "line", to: "product", fromRow: "ref", toRow: "sku" }],
    );
    const coords = coordsOf(placement!.path);
    /* Out of `line`'s right edge level with `ref`, in at `product`'s left edge level with `sku`. */
    expect(coords.slice(0, 2)).toEqual([140, 70]);
    expect(coords.at(-1)).toBe(60);
  });

  it("comes in from the side even when the geometry would otherwise go down", () => {
    /* `product` sits lower AND to the right: the ordinary ladder would call that "below" only if
       they were clear vertically, but the row anchor settles it either way. */
    const lower = { ...product, box: box(240, 40, 140, 100) };
    const [placement] = routeDiagram(
      [line, lower],
      [{ from: "line", to: "product", fromRow: "qty", toRow: "sku" }],
    );
    expect(coordsOf(placement!.path)[0]).toBe(140);
  });

  it("goes out the near side when the target is to the left", () => {
    const [placement] = routeDiagram(
      [line, product],
      [{ from: "product", to: "line", fromRow: "sku", toRow: "ref" }],
    );
    /* Out of `product`'s LEFT edge at 240, and in at `line`'s right edge at 140: arriving
       leftwards, so the stroke stops its own setback short of it. */
    expect(coordsOf(placement!.path).slice(0, 2)).toEqual([240, 60]);
    expect(coordsOf(placement!.path).at(-2)).toBe(140 + STROKE_BACK);
  });

  it("keeps a pinned port where the row is while the unpinned ones spread around it", () => {
    const plain = { id: "note", box: box(240, 200, 140, 40), shape: "process" as const };
    const placements = routeDiagram(
      [line, product, plain],
      [
        { from: "line", to: "product", fromRow: "ref", toRow: "sku" },
        /* No row named: this one is free to be spread, and must not drag the anchored one. */
        { from: "line", to: "note" },
      ],
    );
    expect(coordsOf(placements[0]!.path).slice(0, 2)).toEqual([140, 70]);
  });

  it("drops the anchor rather than lie when the two nodes share a column", () => {
    /* Stacked: there is no side facing the other node, so a row cannot be addressed. The drawing
       says less instead of saying something false. */
    const below = { ...product, box: box(0, 200, 140, 100) };
    const [placement] = routeDiagram(
      [line, below],
      [{ from: "line", to: "product", fromRow: "ref", toRow: "sku" }],
    );
    /* Down out of the bottom edge, in the middle: the ordinary rule, unchanged. */
    expect(coordsOf(placement!.path).slice(0, 2)).toEqual([70, 100]);
  });

  it("ignores a row name no row has, and draws the edge as though none were given", () => {
    const [anchored] = routeDiagram(
      [line, product],
      [{ from: "line", to: "product", fromRow: "typo", toRow: "typo" }],
    );
    const [plain] = routeDiagram([line, product], [{ from: "line", to: "product" }]);
    expect(anchored!.path).toBe(plain!.path);
  });

  it("keeps a row off the corners, where a rounded box has no straight edge", () => {
    const edgy = record("edgy", 0, [["first", 2]]);
    const [placement] = routeDiagram(
      [edgy, product],
      [{ from: "edgy", to: "product", fromRow: "first" }],
    );
    /* The row's own centre is 2px down; the port is clamped to 8% of a 100px side. */
    expect(coordsOf(placement!.path)[1]).toBe(8);
  });

  it("names the row in the reading, because that is what the edge points at", () => {
    const routes = diagramRoutes(
      [
        { id: "line", text: "Line item" },
        { id: "product", text: "Product" },
      ],
      [{ from: "line", to: "product", label: "many to 1", toRow: "sku" }],
    );
    expect(routes[0]).toEqual(["many to 1, Product, sku"]);
  });
});

describe("diagram routing: a wire aimed at a fixed pin", () => {
  /*
   * `A` feeds a gate a rank away. The gate's pins are the notation's (the thirds of its back plane)
   * and cannot move; `A`'s exit is an ordinary port and `portOffsets` spreads it across its own side
   * knowing nothing about what it is aiming at, which is how four wires end up with a six pixel kink
   * a few pixels clear of their boxes.
   */
  const source = node("source", box(0, 0, 100, 48));
  const gate = node("gate", box(200, 0, 60, 48), "and");
  const second = node("second", box(0, 200, 100, 48));

  it("leaves the free end on the pin's own line, so the wire is drawn straight", () => {
    const placed = routeDiagram(
      [source, gate],
      [{ from: "source", to: "gate", arrow: "none" }],
    );
    const points = coordsOf(placed[0]!.path);
    /* One straight run: two points, and both at the pin's height. */
    expect(points).toHaveLength(4);
    expect(points[1]).toBe(points[3]);
  });

  it("keeps the jog when its own side cannot reach that high", () => {
    /* A rank below its gate: the pin is above everything this side offers, so the wire bends, which
       is the honest drawing of an operand that really is a rank away. */
    const placed = routeDiagram(
      [second, gate],
      [{ from: "second", to: "gate", arrow: "none" }],
    );
    const points = coordsOf(placed[0]!.path);
    expect(points.length).toBeGreaterThan(4);
  });

  it("never moves a pin to meet another pin, when BOTH ends are the notation's", () => {
    /*
     * The guard the whole pass hangs on. Two gates wired together: each end is fixed, neither may
     * give, and a rule that aligned "whenever either end is fixed" would pull one symbol's inputs
     * off its own back plane. The wire bends instead.
     */
    const downstream = node("downstream", box(360, 100, 60, 48), "or");
    const placed = routeDiagram(
      [gate, downstream],
      [{ from: "gate", to: "downstream", arrow: "none" }],
    );
    const points = coordsOf(placed[0]!.path);
    /* Off the first gate's nose, at its own middle. */
    expect(points.slice(0, 2)).toEqual([260, 24]);
    /*
     * And onto the second's back plane where the notation puts a single operand: the middle of it,
     * 124 on a gate spanning 100 to 148. NOT 24, which is where aligning would have dragged it.
     * The x is past the box's own left edge because an OR's back plane is bowed and its pins sit on
     * the curve, which is the notation's business and not this pass's.
     */
    const [endX, endY] = points.slice(-2);
    expect(endY).toBe(124);
    expect(endX).toBeGreaterThanOrEqual(360);
  });
});

describe("diagram routing: a label on a crowded frame", () => {
  /*
   * TWO RELATIONSHIPS THAT CROSS, and the labelled one is written FIRST. That order is the test:
   * a label placed while the rest of the drawing is still unrouted can only miss the part of it
   * that exists, which is why every connector is routed before any chip is placed.
   *
   *   above  at (100,   0), 100 x 40     feed: above -> below, down the middle, labelled
   *   below  at (100, 200), 100 x 40
   *   west   at (-200, 100), 60 x 40     span: west -> east, straight across at y = 120
   *   east   at ( 340, 100), 60 x 40
   */
  const above = node("above", box(100, 0, 100, 40));
  const below = node("below", box(100, 200, 100, 40));
  const west = node("west", box(-200, 100, 60, 40));
  const east = node("east", box(340, 100, 60, 40));
  const chip = { width: 60, height: 20 };

  it("puts the chip at the middle of its own run when nothing crosses it", () => {
    const alone = routeDiagram([above, below], [{ from: "above", to: "below", label: chip }]);
    expect(alone[0]!.label).toEqual({ x: 150, y: 116 });
  });

  it("keeps a chip off a connector that is only routed after it", () => {
    const crowded = routeDiagram(
      [above, below, west, east],
      [
        { from: "above", to: "below", label: chip },
        { from: "west", to: "east" },
      ],
    );
    /* `span` runs at y = 120, and the middle of `feed` is y = 116: at its preferred place the chip
       covers the other line entirely. It slides, rather than stepping off its own stroke. */
    expect(crowded[0]!.label.x).toBe(150);
    /* Clear of it, to the edge of the chip: what is priced is a line running UNDER the label, and
       the clearance band is deliberately not part of that test (see the note in `placeDiagramLabel`). */
    expect(Math.abs(crowded[0]!.label.y - 120)).toBeGreaterThanOrEqual(chip.height / 2);
  });

  it("moves the label and not the line, so the drawing is the same drawing", () => {
    const alone = routeDiagram([above, below], [{ from: "above", to: "below", label: chip }]);
    const crowded = routeDiagram(
      [above, below, west, east],
      [
        { from: "above", to: "below", label: chip },
        { from: "west", to: "east" },
      ],
    );
    expect(crowded[0]!.path).toBe(alone[0]!.path);
    expect(crowded[0]!.arrows).toEqual(alone[0]!.arrows);
  });
});

describe("diagram routing: a cycle", () => {
  const placements = routeDiagram(
    [top, bottom],
    [
      { from: "top", to: "bottom" },
      { from: "bottom", to: "top" },
    ],
  );

  it("sends the return line out past the widest node it passes", () => {
    const lane = 200 + DIAGRAM_LANE_GAP;
    expect(placements[1]!.path).toContain(`${lane}`);
  });

  it("leaves and arrives on the same inline side, so the return is one bracket", () => {
    expect(coordsOf(placements[1]!.path).slice(0, 2)).toEqual([200, 120]);
    expect(coordsOf(placements[1]!.path).slice(-2)).toEqual([200 + STROKE_BACK, 20]);
  });

  it("leaves the forward edge exactly where it was, in its own corridor", () => {
    expect(placements[0]!.path).toBe(`M 150 40 L 150 ${100 - STROKE_BACK}`);
  });

  it("gives up its preferred margin rather than cross a node that is not its own end", () => {
    /* The last rank of a state chart: two states side by side, and the LEFT one returns upward.
       Sent out through the inline-end margin it would pass straight through its neighbour, which
       reads as one edge joining three nodes. */
    const above = node("above", box(0, 0, 300, 40));
    const near = node("near", box(0, 100, 120, 40));
    const far = node("far", box(180, 100, 120, 40));
    const placements = routeDiagram(
      [above, near, far],
      [
        { from: "near", to: "above" },
        { from: "far", to: "above" },
      ],
    );
    /* `near` goes out the left, `far` keeps the preferred right: neither crosses the other. */
    expect(coordsOf(placements[0]!.path).slice(0, 2)).toEqual([0, 120]);
    expect(coordsOf(placements[0]!.path)).toContain(0 - DIAGRAM_LANE_GAP);
    expect(coordsOf(placements[1]!.path).slice(0, 2)).toEqual([300, 120]);
    expect(coordsOf(placements[1]!.path)).toContain(300 + DIAGRAM_LANE_GAP);
  });

  it("keeps every return on one margin when nothing is in the way", () => {
    /* Two cycles in one drawing and no obstacle: both brackets land on the same side, so "this
       comes back" stays a convention the reader learns once. */
    const a = node("a", box(100, 0, 100, 40));
    const b = node("b", box(100, 100, 100, 40));
    const c = node("c", box(100, 200, 100, 40));
    const placements = routeDiagram(
      [a, b, c],
      [
        { from: "b", to: "a" },
        { from: "c", to: "b" },
      ],
    );
    for (const placement of placements) expect(coordsOf(placement!.path)[0]).toBe(200);
  });

  it("returns through the other margin when the document reads right to left", () => {
    const rtl = routeDiagram(
      [top, bottom],
      [{ from: "bottom", to: "top" }],
      { direction: "rtl" },
    );
    expect(coordsOf(rtl[0]!.path).slice(0, 2)).toEqual([100, 120]);
    expect(rtl[0]!.path).toContain(`${100 - DIAGRAM_LANE_GAP}`);
  });

  it("loops a node that transitions to itself out beside it and back in at the top", () => {
    const self = routeDiagram([top], [{ from: "top", to: "top" }]);
    const coords = coordsOf(self[0]!.path);
    /* Out of the inline-end side, above the node, and down into its block-start edge. */
    expect(coords.slice(0, 2)).toEqual([200, 7]);
    expect(coords.slice(-2)).toEqual([175, 0 - STROKE_BACK]);
    expect(Math.min(...coords.filter((_, index) => index % 2 === 1))).toBeLessThan(top.box.y);
  });
});

describe("diagram routing: what it refuses to draw", () => {
  it("returns nothing for an edge naming a node the drawing does not have", () => {
    const placements = routeDiagram([top, bottom], [{ from: "top", to: "elsewhere" }]);
    expect(placements).toEqual([null]);
  });

  it("keeps the result index-aligned with the edges, gaps included", () => {
    const placements = routeDiagram(
      [top, bottom],
      [
        { from: "top", to: "nowhere" },
        { from: "top", to: "bottom" },
      ],
    );
    expect(placements[0]).toBeNull();
    /* The second edge is still the second placement: a shorter list would hand this connector to
       the label above it. */
    expect(placements[1]!.path).toBe(`M 150 40 L 150 ${100 - STROKE_BACK}`);
  });

  it("refuses a node with no box rather than drawing to the frame's corner", () => {
    const hidden = node("bottom", box(0, 0, 0, 0));
    expect(isDiagramPointable(hidden.box)).toBe(false);
    expect(routeDiagram([top, hidden], [{ from: "top", to: "bottom" }])).toEqual([null]);
  });

  it("takes the first of two nodes that claim the same name, the way a selector would", () => {
    const twin = node("bottom", box(0, 500, 10, 10));
    const placements = routeDiagram([top, bottom, twin], [{ from: "top", to: "bottom" }]);
    expect(placements[0]!.path).toBe(`M 150 40 L 150 ${100 - STROKE_BACK}`);
  });
});

describe("diagram routing: keeping a rail off a region's name", () => {
  /* Stacked but offset, so the connector has a real horizontal rail to run along. */
  const above = node("above", box(100, 0, 100, 40));
  const below = node("below", box(0, 200, 100, 40));
  const edge = [{ from: "above", to: "below" }];
  /* The natural rail is halfway: y = (40 + 200) / 2 = 120. */

  it("leaves the rail where it is when no band is in the way", () => {
    const [placement] = routeDiagram([above, below], edge);
    expect(coordsOf(placement!.path)).toContain(120);
  });

  it("pushes the rail below a band it would otherwise run along", () => {
    const band = box(0, 110, 300, 28);
    const [placement] = routeDiagram([above, below], edge, { keepRailsOut: [band] });
    const coords = coordsOf(placement!.path);
    expect(coords).not.toContain(120);
    /* Clear of the band's bottom edge by the corridor separation. */
    expect(coords).toContain(band.y + band.height + DIAGRAM_CORRIDOR_GAP);
  });

  it("ignores a band the rail never runs across", () => {
    const [placement] = routeDiagram([above, below], edge, {
      keepRailsOut: [box(400, 110, 100, 28)],
    });
    expect(coordsOf(placement!.path)).toContain(120);
  });

  it("goes above a band rather than land the rail on top of its own target", () => {
    /*
     * The infrastructure case: a region's boundary starts just above the node inside it, so the
     * gap BELOW its name is narrower than an arrowhead and its standoff. Squeezed in there, the
     * arrival run is shorter than the mark that ends it and the head gets drawn at the end of the
     * horizontal run instead: a line arriving from the side with an arrow on top pointing down.
     * Above the band the run is outside the region and crosses its boundary perpendicular, which
     * is both correct and what an architecture diagram looks like.
     */
    /* Deep enough that below it there is no room left to turn and then draw a head, but not so
       deep that above it is out of reach either. */
    const band = box(0, 110, 300, 58);
    const [placement] = routeDiagram([above, below], edge, { keepRailsOut: [band] });
    const coords = coordsOf(placement!.path);
    expect(coords).toContain(band.y - DIAGRAM_CORRIDOR_GAP);
    expect(coords).not.toContain(band.y + band.height + DIAGRAM_CORRIDOR_GAP);
    /* And the last run is vertical, so the head points the way the line was going. */
    expect(coords.at(-2)).toBe(coords.at(-4));
  });

  it("keeps the rail it had rather than turn the elbow inside out", () => {
    /* A band deeper than the gap: escaping it would put the rail past the node it is going to, so
       the honest outcome is the rail it already had. */
    const [placement] = routeDiagram([above, below], edge, {
      keepRailsOut: [box(0, 40, 300, 170)],
    });
    expect(coordsOf(placement!.path)).toContain(120);
  });

  it("never moves a vertical rail, which crosses a band rather than running along it", () => {
    /* Side by side, so the corridor is vertical: a line entering a region through its header is a
       line entering a region, and moving it would be inventing a detour. */
    const left = node("left", box(0, 0, 100, 40));
    const right = node("right", box(300, 100, 100, 40));
    const [plain] = routeDiagram([left, right], [{ from: "left", to: "right" }]);
    const [banded] = routeDiagram([left, right], [{ from: "left", to: "right" }], {
      keepRailsOut: [box(0, 0, 500, 200)],
    });
    expect(banded!.path).toBe(plain!.path);
  });

  it("turns each placed zone's name strip into a band a rail can avoid", () => {
    const placed = [{ box: box(10, 20, 200, 300), depth: 0 }, null];
    expect(diagramZoneHeaders(placed, 28)).toEqual([{ x: 10, y: 20, width: 200, height: 28 }]);
  });
});

describe("diagram zones: keeping a connector off a region's name", () => {
  /*
   * The infrastructure drawing's own shape, cut down to the two boxes that matter:
   *
   *   alb    at (100,   0), 100 x 40   feeding
   *   api    at ( 60, 140),  96 x 40   which is the first node of a region whose name is
   *   plate  at ( 40, 100),  85 x 28   the strip's leading corner, over the api's own centre line.
   */
  const alb = node("alb", box(100, 0, 100, 40));
  const api = node("api", box(60, 140, 96, 40));
  const plate = box(40, 100, 85, 28);
  const xOf = (path: string): number => coordsOf(path).slice(-2)[0]!;

  it("lands the arrival beside the words when the descent would cross them", () => {
    const through = routeDiagram([alb, api], [{ from: "alb", to: "api" }]);
    /* Untold, it touches down at the node's own middle, which is inside the name. */
    expect(xOf(through[0]!.path)).toBe(108);

    const beside = routeDiagram([alb, api], [{ from: "alb", to: "api" }], {
      keepPortsOut: [plate],
    });
    expect(xOf(beside[0]!.path)).toBeGreaterThan(plate.x + plate.width);
  });

  it("leaves a port alone when its own run never reaches the name", () => {
    /* The same plate, but the connector runs between two boxes BELOW it: a name three ranks up is
       not in this wire's corridor, and a port that dodged it would be moving for nothing. */
    const below = node("below", box(60, 300, 96, 40));
    const placed = routeDiagram(
      [api, below],
      [{ from: "api", to: "below" }],
      { keepPortsOut: [plate] },
    );
    expect(xOf(placed[0]!.path)).toBe(108);
  });

  it("keeps the place it asked for when the whole side is under the name", () => {
    /* A name wider than the node it sits over: there is nowhere clear to slide to, so the drawing
       says so rather than inventing a port off the box. The label's own ground is what saves the
       words in that case. */
    const wide = box(0, 100, 400, 28);
    const placed = routeDiagram([alb, api], [{ from: "alb", to: "api" }], { keepPortsOut: [wide] });
    expect(xOf(placed[0]!.path)).toBe(108);
  });

  it("does not slide one arrival onto another that was already there", () => {
    /*
     * Two sources feeding the region's first node, on a box wide enough for both to stand clear of
     * the name. One of them is already past the plate and does not move; the other has to, and the
     * place it wants is where the first one is standing.
     */
    const wide = node("wide", box(60, 140, 260, 40));
    const second = node("second", box(0, 0, 80, 40));
    const placed = routeDiagram(
      [alb, second, wide],
      [
        { from: "alb", to: "wide" },
        { from: "second", to: "wide" },
      ],
      { keepPortsOut: [plate] },
    );
    const first = xOf(placed[0]!.path);
    const other = xOf(placed[1]!.path);
    expect(first).toBeGreaterThan(plate.x + plate.width);
    expect(other).toBeGreaterThan(plate.x + plate.width);
    /* Two, and visibly two: the same separation the rails are pulled apart by. */
    expect(Math.abs(first - other)).toBeGreaterThanOrEqual(DIAGRAM_CORRIDOR_GAP);
  });

  it("gives up the separation before it gives up the name, when the band holds only one", () => {
    /*
     * The same pair on a box with barely a finger's width clear of the caption. Both ends cannot be
     * had, and the two failures are not equal: two wires a few pixels apart are still two wires, a
     * wire through a word is a word nobody can read. So both stay off the plate.
     */
    const second = node("second", box(0, 0, 80, 40));
    const placed = routeDiagram(
      [alb, second, api],
      [
        { from: "alb", to: "api" },
        { from: "second", to: "api" },
      ],
      { keepPortsOut: [plate] },
    );
    expect(xOf(placed[0]!.path)).toBeGreaterThan(plate.x + plate.width);
    expect(xOf(placed[1]!.path)).toBeGreaterThan(plate.x + plate.width);
  });

  it("builds a name plate at each region's leading corner, and none for a region with no name", () => {
    const regions = [
      { box: box(10, 20, 300, 200), depth: 0 },
      null,
      { box: box(40, 60, 100, 80), depth: 0 },
    ];
    expect(diagramZoneNames(regions, [64, 40, 0])).toEqual([
      { x: 10, y: 20, width: 64, height: DIAGRAM_ZONE_HEADER },
    ]);
  });

  it("puts the plate at the other corner when the drawing reads right to left", () => {
    const regions = [{ box: box(10, 20, 300, 200), depth: 0 }];
    expect(diagramZoneNames(regions, [64], { direction: "rtl" })).toEqual([
      { x: 246, y: 20, width: 64, height: DIAGRAM_ZONE_HEADER },
    ]);
  });
});

describe("diagram zones: a boundary around what the grid already placed", () => {
  /*
   *   web  at (  0, 0) 100 x 40      db   at (200, 0) 100 x 40
   * both in `public`, which is in `vpc`.
   */
  const web = node("web", box(0, 0, 100, 40));
  const db = node("db", box(200, 0, 100, 40));
  const members = new Map([
    ["web", "public"],
    ["db", "public"],
  ]);
  const zones = [{ zone: "vpc" }, { zone: "public", within: "vpc" }];

  it("reaches an outer zone through the inner one a node actually named", () => {
    /* A node names only where it is; the VPC's membership follows from the subnet's `within`. */
    const held = diagramZoneMembers(zones, members);
    expect([...(held.get("public") ?? [])].sort()).toEqual(["db", "web"]);
    expect([...(held.get("vpc") ?? [])].sort()).toEqual(["db", "web"]);
  });

  it("counts a zone's depth by what nests inside it, so the outer one draws wider", () => {
    const depths = diagramZoneDepths(zones);
    expect(depths.get("vpc")).toBe(1);
    expect(depths.get("public")).toBe(0);
  });

  it("draws the outer boundary outside the inner one, though they hold the same nodes", () => {
    /* The case the depth exists for: with one padding for both, a VPC whose only contents are its
       subnet comes out exactly as big as the subnet and the two borders land on each other. */
    const [vpc, subnet] = placeDiagramZones([web, db], zones, members);
    expect(vpc!.box.x).toBeLessThan(subnet!.box.x);
    expect(vpc!.box.x + vpc!.box.width).toBeGreaterThan(subnet!.box.x + subnet!.box.width);
  });

  it("leaves room at the top for the name and hugs the other three sides", () => {
    const [, subnet] = placeDiagramZones([web, db], zones, members);
    expect(subnet!.box.x).toBe(0 - DIAGRAM_ZONE_PADDING);
    expect(subnet!.box.y).toBe(0 - DIAGRAM_ZONE_PADDING - DIAGRAM_ZONE_HEADER);
    expect(subnet!.box.x + subnet!.box.width).toBe(300 + DIAGRAM_ZONE_PADDING);
  });

  it("gives a zone that holds nothing no box at all, rather than a dot at the origin", () => {
    const [empty] = placeDiagramZones([web], [{ zone: "unused" }], new Map());
    expect(empty).toBeNull();
  });

  it("ignores a node whose zone no zone declares", () => {
    const held = diagramZoneMembers([{ zone: "vpc" }], new Map([["web", "typo"]]));
    expect([...(held.get("vpc") ?? [])]).toEqual([]);
  });

  it("stops rather than hangs on a zone declared inside itself", () => {
    const looped = [
      { zone: "a", within: "b" },
      { zone: "b", within: "a" },
    ];
    expect([...(diagramZoneMembers(looped, new Map([["web", "a"]])).get("b") ?? [])]).toEqual(["web"]);
    expect(diagramZoneDepths(looped).get("a")).toBeTypeOf("number");
  });
});

describe("diagram reading: what a screen reader is given", () => {
  /* `diagramNodeText` reads an Element, so it is proved where there is a DOM to read: see
     `packages/vanilla/src/components/diagram.test.ts`. Same split `annotationElementRadius` sits
     on, and the same reason (this runner is Node, deliberately). */

  it("names the condition and then the destination, with nothing invented between them", () => {
    expect(diagramRouteText("Yes", "Dashboard")).toBe("Yes, Dashboard");
  });

  it("says only the destination when the relationship has no name", () => {
    expect(diagramRouteText("", "Dashboard")).toBe("Dashboard");
    expect(diagramRouteText("  ", "Dashboard")).toBe("Dashboard");
  });

  it("gives each node the ways OUT of it, in authoring order", () => {
    const routes = diagramRoutes(
      [
        { id: "ask", text: "Authenticated?" },
        { id: "yes", text: "Dashboard" },
        { id: "no", text: "Login" },
      ],
      [
        { from: "ask", to: "yes", label: "Yes" },
        { from: "ask", to: "no", label: "No" },
        { from: "no", to: "ask", label: "retry" },
      ],
    );
    expect(routes).toEqual([
      ["Yes, Dashboard", "No, Login"],
      [],
      ["retry, Authenticated?"],
    ]);
  });

  it("gives a node with nowhere to go no lines at all, rather than an empty sentence", () => {
    const routes = diagramRoutes(
      [
        { id: "a", text: "Start" },
        { id: "b", text: "End" },
      ],
      [{ from: "a", to: "b", label: "" }],
    );
    expect(routes[1]).toEqual([]);
  });

  it("drops a route whose destination is not in the drawing, the same as the connector does", () => {
    const routes = diagramRoutes(
      [{ id: "a", text: "Start" }],
      [{ from: "a", to: "gone", label: "Yes" }],
    );
    expect(routes[0]).toEqual([]);
  });
});
