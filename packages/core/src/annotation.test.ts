import { describe, expect, it } from "vitest";
import {
  ANNOTATION_LANE_GAP,
  annotationExitSide,
  annotationHitIndex,
  annotationRingInset,
  annotationPath,
  annotationSides,
  distributeLanes,
  isAnnotationRingPlacement,
  isAnnotationSide,
  leaderPoints,
  placeAnnotations,
  type AnnotationBox,
  type AnnotationMeasurement,
  type AnnotationPlacement,
} from "./annotation.js";

/*
 * The whole component is these functions plus two thin shells that measure rectangles and assign
 * strings. Everything worth being wrong about is here: how few segments a leader takes, which way it
 * leaves, what happens when two labels want the same millimetre, and what a right-to-left frame does
 * to all of it.
 */

const box = (x: number, y: number, width: number, height: number): AnnotationBox => ({
  x,
  y,
  width,
  height,
});

describe("sides", () => {
  it("names the four gutters logically, so they swap themselves in RTL", () => {
    expect([...annotationSides]).toEqual([
      "inline-start",
      "inline-end",
      "block-start",
      "block-end",
    ]);
  });

  it("recognises only those four", () => {
    for (const side of annotationSides) expect(isAnnotationSide(side)).toBe(true);
    // Physical names are what a rectangle speaks, never what an author writes.
    expect(isAnnotationSide("left")).toBe(false);
    expect(isAnnotationSide(undefined)).toBe(false);
  });
});

describe("leaderPoints", () => {
  it("draws a level leader as one straight segment", () => {
    expect(leaderPoints({ x: 0, y: 50 }, { x: 120, y: 50 }, "inline")).toEqual([
      { x: 0, y: 50 },
      { x: 120, y: 50 },
    ]);
  });

  it("runs straight and then turns 45 degrees when there is room to", () => {
    // 100 across, 40 down: 60 of straight run, then a 40x40 diagonal.
    expect(leaderPoints({ x: 0, y: 0 }, { x: 100, y: 40 }, "inline")).toEqual([
      { x: 0, y: 0 },
      { x: 60, y: 0 },
      { x: 100, y: 40 },
    ]);
  });

  it("collapses to a single pure diagonal when the two axes match", () => {
    expect(leaderPoints({ x: 0, y: 0 }, { x: 40, y: 40 }, "inline")).toEqual([
      { x: 0, y: 0 },
      { x: 40, y: 40 },
    ]);
  });

  it("takes the diagonal first and finishes straight when the cross axis is longer", () => {
    // Only 30 of horizontal room for 90 of drop: the diagonal spends all 30, the rest is vertical.
    expect(leaderPoints({ x: 0, y: 0 }, { x: 30, y: 90 }, "inline")).toEqual([
      { x: 0, y: 0 },
      { x: 30, y: 30 },
      { x: 30, y: 90 },
    ]);
  });

  it("never needs more than two segments, in either direction, on either axis", () => {
    const ends = [-97, -40, -13, 0, 13, 40, 97];
    for (const dx of ends) {
      for (const dy of ends) {
        for (const axis of ["inline", "block"] as const) {
          const points = leaderPoints({ x: 0, y: 0 }, { x: dx, y: dy }, axis);
          expect(points.length).toBeLessThanOrEqual(3);

          // Every segment is axis-aligned or exactly 45 degrees, which is the whole promise.
          for (let i = 1; i < points.length; i += 1) {
            const stepX = Math.abs(points[i]!.x - points[i - 1]!.x);
            const stepY = Math.abs(points[i]!.y - points[i - 1]!.y);
            expect(stepX === 0 || stepY === 0 || stepX === stepY).toBe(true);
          }

          // And it actually arrives.
          expect(points.at(-1)).toEqual({ x: dx, y: dy });
        }
      }
    }
  });

  it("mirrors the whole rule on the block axis", () => {
    expect(leaderPoints({ x: 0, y: 0 }, { x: 40, y: 100 }, "block")).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 60 },
      { x: 40, y: 100 },
    ]);
  });

  it("keeps a block leader vertical when its target is only just above or below", () => {
    expect(leaderPoints({ x: 0, y: 0 }, { x: 100, y: 40 }, "block")).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 40 },
      { x: 100, y: 40 },
    ]);
  });

  it("draws nothing for a leader with no length", () => {
    expect(annotationPath(leaderPoints({ x: 8, y: 8 }, { x: 8, y: 8 }, "inline"))).toBe("");
  });

  it("writes path data a browser can read back", () => {
    expect(annotationPath(leaderPoints({ x: 0, y: 0 }, { x: 100, y: 40 }, "inline"))).toBe(
      "M 0 0 L 60 0 L 100 40",
    );
  });
});

describe("annotationHitIndex", () => {
  it("returns the label whose part contains the pointer", () => {
    expect(
      annotationHitIndex({ x: 250, y: 130 }, [
        { index: 0, box: box(200, 100, 400, 60) },
        { index: 1, box: box(200, 200, 400, 60) },
      ]),
    ).toBe(0);
  });

  it("prefers the smallest containing box when parts nest", () => {
    expect(
      annotationHitIndex({ x: 220, y: 120 }, [
        { index: 0, box: box(200, 100, 400, 200) },
        { index: 1, box: box(210, 110, 80, 24) },
      ]),
    ).toBe(1);
  });

  it("returns null when the pointer misses every part", () => {
    expect(
      annotationHitIndex({ x: 0, y: 0 }, [{ index: 0, box: box(200, 100, 400, 60) }]),
    ).toBeNull();
  });
});

describe("annotationExitSide", () => {
  const subject = box(200, 100, 400, 300);

  it("reads the gutter off the boxes, not off the request", () => {
    // Authored as inline-end, but the stylesheet put it clear of the subject's left edge.
    expect(annotationExitSide(box(0, 150, 120, 20), subject, "inline-end")).toBe("inline-start");
    expect(annotationExitSide(box(620, 150, 120, 20), subject, "inline-start")).toBe("inline-end");
    expect(annotationExitSide(box(300, 40, 120, 20), subject, "inline-start")).toBe("block-start");
    expect(annotationExitSide(box(300, 420, 120, 20), subject, "inline-start")).toBe("block-end");
  });

  it("swaps the two inline gutters in a right-to-left frame", () => {
    expect(annotationExitSide(box(0, 150, 120, 20), subject, "inline-end", "rtl")).toBe("inline-end");
    expect(annotationExitSide(box(620, 150, 120, 20), subject, "inline-start", "rtl")).toBe(
      "inline-start",
    );
  });

  it("lets the request win a corner, where two readings are both true", () => {
    /*
     * Where every block-axis label of a CENTRED diagram sits: the middle track is wider than the
     * specimen in it, so a label at the track's start is clear of the subject above it AND beside
     * it. Reading inline first and unconditionally put the `block-start` label of every such diagram
     * into the inline gutter, pointing at the specimen's side.
     */
    const corner = box(0, 20, 120, 20);
    expect(annotationExitSide(corner, subject, "block-start")).toBe("block-start");
    expect(annotationExitSide(corner, subject, "inline-start")).toBe("inline-start");
  });

  it("still reclassifies a label that is nowhere near the side it asked for", () => {
    // Asked to go above; the stylesheet put it clear of the subject's end edge and nowhere else.
    expect(annotationExitSide(box(620, 150, 120, 20), subject, "block-start")).toBe("inline-end");
  });

  it("keeps the request when the label overlaps the subject on both axes", () => {
    // Not a shape the grid can produce, but a consumer's own positioning can, and then the last
    // thing anyone stated on purpose is the request.
    expect(annotationExitSide(box(300, 150, 120, 20), subject, "block-end")).toBe("block-end");
  });
});

describe("distributeLanes", () => {
  it("leaves labels exactly where they asked when nothing collides", () => {
    const lanes = [
      { desired: 0, size: 20 },
      { desired: 100, size: 20 },
      { desired: 200, size: 20 },
    ];
    expect(distributeLanes(lanes, 300)).toEqual([0, 100, 200]);
  });

  it("pushes apart what would overlap, and only by what it takes", () => {
    const lanes = [
      { desired: 100, size: 20 },
      { desired: 105, size: 20 },
    ];
    expect(distributeLanes(lanes, 400, 6)).toEqual([100, 126]);
  });

  it("keeps the targets' own order rather than the authoring order", () => {
    // Authored bottom-first: the result still runs down the gutter, so no two leaders cross.
    const lanes = [
      { desired: 200, size: 20 },
      { desired: 0, size: 20 },
    ];
    expect(distributeLanes(lanes, 400)).toEqual([200, 0]);
  });

  it("pulls a run that overflowed the far end back inside", () => {
    const lanes = [
      { desired: 260, size: 20 },
      { desired: 265, size: 20 },
    ];
    // The second would end at 286 in a 280 gutter, so it comes back to 260 and drags the first up
    // with it: still 6 apart, still in the order their targets are in.
    expect(distributeLanes(lanes, 280, 6)).toEqual([234, 260]);
  });

  it("packs from the start when the labels simply do not fit", () => {
    // Three 40px labels plus two 6px gaps need 132px of a 90px gutter. Overflowing the FAR end is
    // the recoverable half; running off the near one gets clipped by whatever holds the frame.
    const lanes = [
      { desired: 10, size: 40 },
      { desired: 20, size: 40 },
      { desired: 30, size: 40 },
    ];
    expect(distributeLanes(lanes, 90, 6)).toEqual([0, 46, 92]);
  });
});

describe("ring placement", () => {
  it("names the two sides of a part's edge, and only those two", () => {
    expect(isAnnotationRingPlacement("inset")).toBe(true);
    expect(isAnnotationRingPlacement("offset")).toBe(true);
    expect(isAnnotationRingPlacement("outside")).toBe(false);
    expect(isAnnotationRingPlacement(undefined)).toBe(false);
  });

  it("turns a placement and a distance into one signed inset", () => {
    expect(annotationRingInset("inset", 4)).toBe(4);
    expect(annotationRingInset("offset", 4)).toBe(-4);
  });

  it("reads a negative distance as a magnitude, never as an inverted ring", () => {
    // The sign is the PLACEMENT's to decide; an author writing -4 meant "four", not "the other way".
    expect(annotationRingInset("inset", -4)).toBe(4);
    expect(annotationRingInset("offset", -4)).toBe(-4);
  });

  it("falls back to the default distance on a number that is not one", () => {
    expect(annotationRingInset("inset", Number.NaN)).toBe(2);
  });
});

describe("placeAnnotations", () => {
  const subject = box(160, 0, 400, 300);
  const measurement = (
    over: Partial<AnnotationMeasurement> & { target?: AnnotationBox },
  ): AnnotationMeasurement => {
    const { target, ...rest } = over;
    return {
      side: "inline-start",
      label: box(0, 0, 140, 20),
      targets: target ? [target] : [],
      ...rest,
    };
  };

  /** The one mark of a label that names one thing, which is every case but the plural one. */
  const only = (placement: AnnotationPlacement | undefined) => placement!.marks[0];

  it("lifts a label level with its target and draws one straight segment", () => {
    const [placement] = placeAnnotations(
      [measurement({ target: box(160, 100, 400, 60) })],
      subject,
    );

    // The target's middle is y=130, so a 20px label sits at 120: the flow position is 0.
    expect(placement!.translate).toEqual({ x: 0, y: 120 });
    expect(placement!.side).toBe("inline-start");
    // The ring is the target pulled in by 2 on every side, and the line runs right up to its edge.
    expect(only(placement)!.ring).toEqual({ x: 162, y: 102, width: 396, height: 56, radius: 6 });
    expect(only(placement)!.path).toBe("M 140 130 L 162 130");
  });

  it("keeps stacked labels in flow when distribution is disabled", () => {
    const [placement] = placeAnnotations(
      [measurement({ side: "block-start", label: box(160, 0, 140, 20), target: box(300, 100, 40, 20) })],
      subject,
      { distribute: false },
    );

    expect(placement!.translate).toEqual({ x: 0, y: 0 });
    expect(only(placement)!.path).toBe("M 230 20 L 230 24 L 308 102");
  });

  it("routes a stacked label with only one elbow", () => {
    const [placement] = placeAnnotations(
      [measurement({ side: "block-start", label: box(160, 0, 140, 20), target: box(300, 100, 40, 20) })],
      subject,
      { distribute: false, leaderRoute: "right-elbow" },
    );

    expect(only(placement)!.path).toBe("M 300 10 L 308 10 L 308 102");
  });

  it("enters the lower edge when a stacked label sits below its target", () => {
    const [placement] = placeAnnotations(
      [measurement({ side: "block-end", label: box(160, 220, 140, 20), target: box(300, 100, 40, 20) })],
      subject,
      { distribute: false, leaderRoute: "right-elbow" },
    );

    expect(only(placement)!.path).toBe("M 300 230 L 308 230 L 308 118");
  });

  it("draws the ring outside the part when asked to offset it", () => {
    // A `Stat` is the case: its parts are single lines of text, so an inset ring crops the glyphs.
    const [placement] = placeAnnotations(
      [measurement({ target: box(200, 100, 80, 24) })],
      subject,
      { ringInset: annotationRingInset("offset", 4) },
    );
    expect(only(placement)!.ring).toMatchObject({ x: 196, y: 96, width: 88, height: 32 });
  });

  it("lets the distance be chosen, in either direction", () => {
    const [tight] = placeAnnotations([measurement({ target: box(200, 100, 80, 24) })], subject, {
      ringInset: annotationRingInset("inset", 6),
    });
    const [loose] = placeAnnotations([measurement({ target: box(200, 100, 80, 24) })], subject, {
      ringInset: annotationRingInset("offset", 12),
    });
    expect(only(tight)!.ring).toMatchObject({ x: 206, width: 68 });
    expect(only(loose)!.ring).toMatchObject({ x: 188, width: 104 });
  });

  it("never inverts a part too thin to inset, and has no such limit going outward", () => {
    const [thin] = placeAnnotations([measurement({ target: box(200, 100, 80, 4) })], subject, {
      ringInset: annotationRingInset("inset", 10),
    });
    // Pulled in by 10 a 4px-tall part would be -16 tall; it keeps its own extent instead.
    expect(only(thin)!.ring!.height).toBe(4);

    const [grown] = placeAnnotations([measurement({ target: box(200, 100, 80, 4) })], subject, {
      ringInset: annotationRingInset("offset", 10),
    });
    expect(only(grown)!.ring!.height).toBe(24);
  });

  it("lets one mark override the frame's ring placement", () => {
    // The Accordion case: a whole card and a button take the inset ring; the one line of description
    // among them does not, because inset there crops the glyphs.
    const [normal, overridden] = placeAnnotations(
      [
        measurement({ target: box(200, 100, 80, 24) }),
        measurement({
          target: box(200, 140, 80, 24),
          ringInset: annotationRingInset("offset", 4),
        }),
      ],
      subject,
      { ringInset: annotationRingInset("inset", 2) },
    );
    expect(only(normal)!.ring).toMatchObject({ x: 202, width: 76 });
    expect(only(overridden)!.ring).toMatchObject({ x: 196, width: 88 });
  });

  it("names every match when asked to, one leader each from the same label", () => {
    /*
     * The breadcrumb case: `sk-breadcrumb__item` IS all four crumbs, and a diagram that rings only
     * the leftmost is saying something false about the part. One label, one bubble, four marks.
     */
    const [placement] = placeAnnotations(
      [
        measurement({
          targets: [box(200, 100, 60, 20), box(280, 100, 60, 20), box(360, 100, 60, 20)],
        }),
      ],
      subject,
    );
    expect(placement!.marks).toHaveLength(3);
    expect(placement!.marks.map((mark) => mark.ring.x)).toEqual([202, 282, 362]);
  });

  it("spreads a label's own leaders along its edge rather than starting them all at one point", () => {
    /*
     * All of them from one pixel is a starburst, not a fan: the segment rule then bends most of them
     * immediately just to get away from each other. Projected onto the edge, each leader is nearly
     * straight and the group reads as one bracket opening onto several things.
     */
    const [placement] = placeAnnotations(
      [
        measurement({
          side: "block-start",
          label: box(0, 0, 160, 20),
          targets: [box(200, 100, 40, 20), box(300, 100, 40, 20), box(400, 100, 40, 20)],
        }),
      ],
      box(160, 60, 400, 240),
    );
    const starts = placement!.marks.map((mark) => mark.path.split(" L ")[0]);
    expect(new Set(starts).size).toBe(3);
  });

  it("draws a straight leader when a part sits level with the label's edge", () => {
    /*
     * The breadcrumb-separator case: several marks named from below. Once the label is slid under
     * their span, each separator's centre projects onto the bubble, and the leader is one vertical
     * segment, not an elbow forced by an evenly-spaced fan.
     */
    const [placement] = placeAnnotations(
      [
        measurement({
          side: "block-end",
          label: box(0, 200, 240, 20),
          targets: [box(200, 100, 12, 12), box(280, 100, 12, 12), box(360, 100, 12, 12)],
        }),
      ],
      box(160, 60, 400, 120),
    );
    for (const mark of placement!.marks) {
      expect(mark.path.split(" L ")).toHaveLength(2);
    }
  });

  it("hands those origins out in the targets' own order, so a label's leaders never cross", () => {
    // Authored back to front: the leftmost target must still get the leftmost origin.
    const [placement] = placeAnnotations(
      [
        measurement({
          side: "block-start",
          label: box(0, 0, 160, 20),
          targets: [box(400, 100, 40, 20), box(200, 100, 40, 20)],
        }),
      ],
      box(160, 60, 400, 240),
    );
    const originX = placement!.marks.map((mark) => Number(mark.path.split(" ")[1]));
    // The first entry points right and so starts further right than the second.
    expect(originX[0]!).toBeGreaterThan(originX[1]!);
  });

  it("still starts a singular name's leader at the middle of its edge", () => {
    const [placement] = placeAnnotations(
      [measurement({ side: "block-start", label: box(0, 0, 160, 20), target: box(300, 100, 40, 20) })],
      box(160, 60, 400, 240),
    );
    // Midpoint of a 160-wide label sitting at x=0, once the distribution has moved it.
    const originX = Number(placement!.marks[0]!.path.split(" ")[1]);
    expect(originX).toBe(Math.round(placement!.translate.x + 80));
  });

  it("sits level with the middle of everything it names, not with the first of them", () => {
    // Level with the first crumb, a label naming four would point up and to the side at all of them.
    const [placement] = placeAnnotations(
      [measurement({ targets: [box(200, 40, 60, 20), box(200, 240, 60, 20)] })],
      subject,
    );
    // The union spans y 40..260, middle 150, so a 20px label sits at 140.
    expect(placement!.translate).toEqual({ x: 0, y: 140 });
  });

  it("drops the matches that have no box, and keeps the rest", () => {
    const [placement] = placeAnnotations(
      [measurement({ targets: [box(200, 100, 60, 20), box(-180, -96, 0, 0)] })],
      subject,
    );
    expect(placement!.marks).toHaveLength(1);
  });

  it("gives a ring the corner of the part it wraps", () => {
    // The ring's whole claim is that it is the outline of the thing inside it, and a browser has
    // never drawn that outline square around a pill: a chip's corner and a card's are different
    // numbers because the parts are different shapes.
    const [chip] = placeAnnotations(
      [measurement({ targets: [{ ...box(200, 100, 80, 24), radius: 999 }] })],
      subject,
    );
    const [card] = placeAnnotations(
      [measurement({ targets: [{ ...box(200, 40, 300, 200), radius: 12 }] })],
      subject,
    );
    // Clamped to half the shorter side, which is what turns a pill token into an actual pill.
    expect(only(chip)!.ring!.radius).toBe(10);
    // Concentric: the part's 12 less the 2 the ring was pulled in by.
    expect(only(card)!.ring!.radius).toBe(10);
  });

  it("grows that corner instead when the ring is drawn outside the part", () => {
    // Same sign convention as the box itself: `offset` pushes out, so the corner opens up by as much
    // and the two curves stay parallel.
    const [placement] = placeAnnotations(
      [measurement({ targets: [{ ...box(200, 40, 300, 200), radius: 12 }] })],
      subject,
      { ringInset: annotationRingInset("offset", 4) },
    );
    expect(only(placement)!.ring!.radius).toBe(16);
  });

  it("falls back to one shared corner for a part that reports none", () => {
    // A caller measuring bare rectangles (no computed style to read) still gets a drawable mark.
    const [chip] = placeAnnotations([measurement({ target: box(200, 100, 80, 24) })], subject);
    const [card] = placeAnnotations([measurement({ target: box(200, 40, 300, 200) })], subject);
    expect(only(chip)!.ring!.radius).toBe(6);
    expect(only(card)!.ring!.radius).toBe(6);
  });

  it("lets the frame choose one radius for every ring, and one mark override it", () => {
    // The part's own corner is the default, not a law: a diagram that wants one shape regardless
    // says so once on the frame, and the odd part out says so for itself. Neither is converted the
    // way a part's own corner is: an authored number is already a statement about the ring.
    const [shared, odd] = placeAnnotations(
      [
        measurement({ targets: [{ ...box(200, 40, 300, 200), radius: 12 }] }),
        measurement({ targets: [{ ...box(200, 40, 300, 200), radius: 12 }], ringRadius: 0 }),
      ],
      subject,
      { ringRadius: 20 },
    );
    expect(only(shared)!.ring!.radius).toBe(20);
    expect(only(odd)!.ring!.radius).toBe(0);
  });

  it("clamps the radius on a part too small to hold it", () => {
    // The same thing a browser does to `border-radius`: a 6px corner on a 6px-tall box is not a
    // shape, it is a lozenge, and it reads as a different mark entirely.
    const [placement] = placeAnnotations(
      [measurement({ target: box(200, 100, 80, 10) })],
      subject,
    );
    expect(only(placement)!.ring!.height).toBe(6);
    expect(only(placement)!.ring!.radius).toBe(3);
  });

  it("treats a target with no box as no target at all", () => {
    /*
     * What `display: contents` reports, which is real markup: `sk-accordion__trigger-heading` is
     * `display: contents` so that `role="heading"` inserts no box, and the platform answers with
     * zeros at the VIEWPORT origin, which convert to coordinates well outside the frame.
     */
    const [placement] = placeAnnotations([measurement({ target: box(-180, -96, 0, 0) })], subject);
    expect(placement!.translate).toEqual({ x: 0, y: 0 });
    expect(placement!.marks).toEqual([]);
  });

  it("keeps a hairline target pointable: no area is the rule, not no thickness", () => {
    // A 1px rule or a zero-height full-width row still HAS a box, and is still worth outlining. It
    // keeps its own extent on the thin axis rather than being pulled inside out by the inset.
    const [placement] = placeAnnotations(
      [measurement({ target: box(160, 100, 400, 0) })],
      subject,
    );
    expect(only(placement)!.ring).toEqual({ x: 162, y: 100, width: 396, height: 0, radius: 0 });
    expect(only(placement)!.path).not.toBe("");
  });

  it("meets the ring's edge, and can be asked to stand off it instead", () => {
    const [placement] = placeAnnotations(
      [measurement({ target: box(300, 100, 200, 60) })],
      subject,
      { ringInset: 10, ringGap: 20 },
    );
    // Ring's facing edge at 300 + 10 = 310; the line gives up 20 before it.
    expect(only(placement)!.ring!.x).toBe(310);
    expect(only(placement)!.path).toBe("M 140 130 L 290 130");
  });

  it("leaves a label with no target in flow, and draws no leader for it", () => {
    const [placement] = placeAnnotations([measurement({})], subject);
    expect(placement!.translate).toEqual({ x: 0, y: 0 });
    expect(placement!.marks).toEqual([]);
  });

  it("keeps a targetless label out of the distribution entirely", () => {
    // The orphan's flow position (y=0) must not push the one that actually points somewhere.
    const [orphan, real] = placeAnnotations(
      [measurement({}), measurement({ target: box(160, 100, 400, 60) })],
      subject,
    );
    expect(orphan!.translate).toEqual({ x: 0, y: 0 });
    expect(real!.translate).toEqual({ x: 0, y: 120 });
  });

  it("distributes two labels whose targets nearly coincide", () => {
    const [first, second] = placeAnnotations(
      [
        measurement({ target: box(160, 100, 400, 20) }),
        measurement({ target: box(160, 104, 400, 20) }),
      ],
      subject,
    );
    expect(second!.translate.y - first!.translate.y).toBe(20 + ANNOTATION_LANE_GAP);
  });

  it("turns once when the label could not reach its target's level", () => {
    // Two labels forced apart, so the second one's leader has to climb back down to its target.
    const [, second] = placeAnnotations(
      [
        measurement({ target: box(160, 100, 400, 4) }),
        measurement({ target: box(160, 102, 400, 4) }),
      ],
      subject,
    );
    // Its ring is only 4 tall (too thin for the inset), with no room for the 6px corner clearance,
    // so the leader aims at the ring's own middle and takes one 45-degree knee to get there.
    expect(only(second)!.ring).toEqual({ x: 162, y: 102, width: 396, height: 4, radius: 2 });
    expect(only(second)!.path).toBe("M 140 128 L 162 106 L 162 104");
  });

  it("leaves a label in the block gutter downward, and slides it sideways", () => {
    const [placement] = placeAnnotations(
      [
        measurement({
          side: "block-start",
          label: box(160, 0, 140, 20),
          target: box(400, 40, 60, 200),
        }),
      ],
      box(160, 30, 400, 300),
    );
    // Target centre x=430, so a 140px label wants to start at 360: 200 right of its flow position.
    expect(placement!.translate).toEqual({ x: 200, y: 0 });
    expect(placement!.side).toBe("block-start");
    expect(only(placement)!.ring).toEqual({ x: 402, y: 42, width: 56, height: 196, radius: 6 });
  });

  it("reads a right-to-left frame's gutters the other way round", () => {
    // Same boxes as the first case; only the direction differs, so the leader leaves the label's
    // other edge and lands on the ring's other edge.
    const [placement] = placeAnnotations(
      [measurement({ side: "inline-end", target: box(160, 100, 400, 60) })],
      subject,
      { direction: "rtl" },
    );
    expect(placement!.side).toBe("inline-end");
    expect(only(placement)!.path).toBe("M 140 130 L 162 130");
  });

  it("rounds every coordinate, so two bindings of the same width write the same string", () => {
    const [placement] = placeAnnotations(
      [measurement({ label: box(0, 0, 140.4, 21.3), target: box(160.2, 100.7, 400, 61.9) })],
      subject,
    );
    expect(only(placement)!.path).toMatch(/^M (-?\d+) (-?\d+)( L -?\d+ -?\d+)+$/);
    expect(Number.isInteger(placement!.translate.y)).toBe(true);
    for (const value of Object.values(only(placement)!.ring!)) expect(Number.isInteger(value)).toBe(true);
  });
});
