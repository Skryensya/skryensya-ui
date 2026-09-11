import type { ComponentContract, OptionsOf } from "./contract.js";

/*
 * ANNOTATION, the contract for a drawing that names the parts of another drawing.
 *
 * A composition diagram has one job: point at a piece of a rendered thing and say what it is. Every
 * house style solves it the same way, and every one of them solves it badly: a label absolutely
 * positioned over the specimen (which covers the very part it names), or a numbered legend under it
 * (which makes the reader hold six numbers in their head while their eye travels). What actually
 * works is what technical illustration settled on a century ago: the label sits OUTSIDE the subject,
 * in a margin of its own, and a LEADER LINE connects the two.
 *
 * So this contract owns exactly two invariants, and they are the two that keep getting broken:
 *
 *   1. A LABEL IS NEVER OVER THE SUBJECT. The frame is a three-by-three grid; the subject holds the
 *      centre cell and the labels live in the four gutters around it. It is not "positioned away
 *      from" the subject, it is in a different track: no z-index, no overlap to avoid, and the
 *      gutters SIZE THEMSELVES to the labels they hold, so a longer name widens the margin instead
 *      of creeping over the drawing.
 *   2. THE LEADER IS THE FEWEST SEGMENTS THAT REACH. Only three headings exist (straight along the
 *      axis, straight across it, and 45 degrees), and `leaderPoints` below proves that ONE OR TWO
 *      segments always suffice. A three-segment elbow in a diagram reads as a pipe routing, which is
 *      a different diagram saying a different thing.
 *
 * WHY IT NEEDS A RUNTIME AT ALL, when so much of the kit refuses one. Where a label goes is not a
 * value an author can set at compose time: it follows from where its target LANDED, which follows
 * from the subject's own layout, which changes when the frame is resized, when a webfont arrives,
 * when a translation is longer. That is the same line every other contract with a machine sits on
 * (decision 25's own test: a runtime fact, not an authored one). So each binding measures and this
 * module decides, exactly the `hotkey` three-way split: the pure geometry here, an enhancer over
 * authored markup in Vanilla, a hook in React, one implementation of the hard part.
 *
 * WHAT IS DELIBERATELY NOT HERE: the placement of the label in its gutter. `patterns` and the
 * stylesheet own which cell a `data-side` lands in, including anything a consumer wants to do
 * responsively, and `annotationExitSide` READS THE RESULT back off the measured boxes rather than
 * trusting the request. A consumer who moves every label under the subject with one media query gets
 * correct leaders and writes no JavaScript: the drawing follows the layout, the layout never has to
 * ask the drawing.
 */

/** Which gutter a label sits in. Logical, like the rest of the system, so they swap in RTL. */
export type AnnotationSide = "inline-start" | "inline-end" | "block-start" | "block-end";

export const annotationSides = [
  "inline-start",
  "inline-end",
  "block-start",
  "block-end",
] as const satisfies readonly AnnotationSide[];

export function isAnnotationSide(value: unknown): value is AnnotationSide {
  return typeof value === "string" && (annotationSides as readonly string[]).includes(value);
}

/*
 * Two flat classes rather than a BEM pair for the label, the same call `anchored` makes: a label is
 * a CHILD of the frame in the DOM, but it is the only part a consumer ever styles on its own (its
 * type, its measure, its colour), and `sk-annotated__label` would put the frame's name in front of
 * every one of those rules for a containment nobody is reading it for.
 */
export const annotationParts = {
  /** The frame: the grid that holds a subject and the gutters its labels live in. */
  root: "sk-annotated",
  /** The centre cell. Whatever is being diagrammed, untouched. */
  subject: "sk-annotated__subject",
  /**
   * The `<svg>` the leaders are drawn into, laid over the whole frame and inert to the pointer. One
   * overlay rather than one element per label: a leader crosses the gutter boundary by definition,
   * so anything clipped to a gutter cell would cut every line in half.
   */
  leaders: "sk-annotated__leaders",
  /**
   * One mark: the `<g>` holding a leader and its ring, so the pair can be revealed, hidden and
   * coloured as the single thing they are. Written by a binding.
   */
  mark: "sk-annotated__mark",
  /** One `<path>`, written by a binding. Never authored: it is a measurement, not content. */
  leader: "sk-annotated__leader",
  /** The ring drawn over the part a leader names. Also written by a binding. */
  ring: "sk-annotated__ring",
  /** One label. */
  label: "sk-annotation",
} as const;

export type AnnotationPart = keyof typeof annotationParts;
export type AnnotationPartClass = (typeof annotationParts)[AnnotationPart];

export const annotationAttrs = {
  /** The enhancer's attachment point. Present in authored markup by construction; React needs none. */
  root: "data-sk-annotated",
  /**
   * The gutter the stylesheet puts this label in. A REQUEST: the stylesheet is free to answer it
   * differently (a consumer's own media query, a container query), which is why nothing downstream
   * reads this attribute to decide where a leader leaves from.
   */
  side: "data-side",
  /**
   * Where the leader actually left from, written back by the binding after it has measured the
   * label's real box. The counterpart of the request above, and the hook a consumer styles against
   * when they care about the OUTCOME (a label under the subject wants its text centred, wherever it
   * was asked to go).
   */
  resolvedSide: "data-sk-side",
  /**
   * This label is the one being read right now, and so is its mark. Written by the binding on the
   * label AND on its `<g>` in the overlay, because a mark and its name are one thing and the two
   * elements are in different subtrees with no selector able to reach across.
   */
  active: "data-sk-active",
  /** The selector, inside the subject, this label points at. */
  target: "data-for",
  /** Whether that selector names the first match or every one of them. */
  match: "data-match",
  /** Which side of a part's edge its ring sits on. Read by the binding, never rendered. */
  ringPlacement: "data-ring-placement",
  /** How far from that edge, in px. Read by the binding, never rendered. */
  ringDistance: "data-ring-distance",
  /** The ring's corner radius, in px. Read by the binding, never rendered. */
  ringRadius: "data-ring-radius",
  /**
   * The label's cross-axis alignment in the narrow-screen stack. Omitted preserves that stack's
   * default; set it only for the diagrams whose label order needs the opposite edge.
   */
  mobileAlign: "data-mobile-align",
} as const;

/* ---------------------------------------------------------------------------------------------- *
 * Pure geometry - no DOM, no framework. Tested from `packages/core/src/annotation.test.ts`.
 *
 * Every box below is in the FRAME's own coordinates: the origin is the top-left of the root's
 * padding box, which is also the origin the leader `<svg>` resolves its user units against, so a
 * binding subtracts one rect and never converts again.
 *
 * The SIDES are logical and the BOXES are physical, and that seam is `physicalSide` below. A
 * rectangle read off the platform has no opinion about writing direction, so every comparison here
 * is left/right/top/bottom and the translation happens exactly once, on the way in and on the way
 * out. Horizontal writing modes only: a vertical one would also swap which axis "inline" names, and
 * nothing in the kit has asked for that yet.
 * ---------------------------------------------------------------------------------------------- */

export type AnnotationPoint = { readonly x: number; readonly y: number };

export type AnnotationBox = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type AnnotationDirection = "ltr" | "rtl";

/** Which physical edge of the frame a gutter is against, once the writing direction is known. */
type PhysicalSide = "left" | "right" | "top" | "bottom";

const physicalSide = (side: AnnotationSide, direction: AnnotationDirection): PhysicalSide => {
  if (side === "block-start") return "top";
  if (side === "block-end") return "bottom";
  const startsLeft = direction !== "rtl";
  return side === "inline-start" ? (startsLeft ? "left" : "right") : startsLeft ? "right" : "left";
};

const logicalSide = (side: PhysicalSide, direction: AnnotationDirection): AnnotationSide => {
  if (side === "top") return "block-start";
  if (side === "bottom") return "block-end";
  const startsLeft = direction !== "rtl";
  return side === "left"
    ? startsLeft
      ? "inline-start"
      : "inline-end"
    : startsLeft
      ? "inline-end"
      : "inline-start";
};

/** Clearance between two labels that would otherwise touch, in px. */
export const ANNOTATION_LANE_GAP = 6;

/** A narrow-screen stack label may hug either logical inline edge. */
export type AnnotationMobileAlign = "start" | "end";

export const annotationMobileAlignments = ["start", "end"] as const satisfies readonly AnnotationMobileAlign[];

export function isAnnotationMobileAlign(value: unknown): value is AnnotationMobileAlign {
  return typeof value === "string" && (annotationMobileAlignments as readonly string[]).includes(value);
}

/**
 * How far a leader's tip stays clear of its target's CORNERS, in px. Without it a leader aimed at a
 * tall target from far above lands exactly on the corner, where the line and the box edge overlap
 * for their whole length and the mark reads as a nick in the border rather than as a point.
 */
export const ANNOTATION_TIP_INSET = 6;

/*
 * THE RING IS A FOCUS RING, not a bead.
 *
 * A leader ends by OUTLINING the whole part it names: a rounded rectangle drawn just outside that
 * element's own box, with the element's own corner radius, exactly the shape `:focus-visible` draws.
 * Two earlier shapes were built and both were wrong, and the way they were wrong is the argument for
 * this one:
 *
 *   A FILLED DOT ON THE EDGE covers whatever it lands on, which on a diagram is the one thing the
 *   reader was asked to look at, and it names a POINT when the thing being named is an element.
 *
 *   A HOLLOW CIRCLE, inside the edge or outside it, fixes the covering and not the aim. Inside, on a
 *   `Stat`, it struck through the middle of the word "Revenue"; outside, on a row of chips 8px
 *   apart, the mark for the third chip landed on the fourth. Both times the reader has to infer
 *   which element a small circle belongs to from how close it happens to be, which on a dense
 *   composition is exactly the question the diagram exists to answer.
 *
 * An outline has no such ambiguity: the marked thing is whatever is inside it. It is also a shape
 * every reader already knows means "this one", because the browser has been drawing it around the
 * focused element their whole life.
 *
 * The numbers live here rather than in the stylesheet because the leader has to stop short of the
 * ring, and stopping short is a length the geometry needs. `annotation.css` keeps the stroke and the
 * colour.
 */

/**
 * WHICH SIDE OF ITS TARGET'S EDGE A RING SITS ON, and it is genuinely a choice, which is why it is an
 * option rather than a constant.
 *
 * `inset` is the default because it is unambiguous about WHICH element the mark belongs to: drawn
 * outside, a ring in a tight composition overlaps its neighbour, which is how the Accordion demo
 * ended up with the ring around `sk-tile__title` meeting the ring around `sk-tile__chevron` in the
 * gap between them. Inside, a ring is always within the thing it names, and there is nothing to
 * arbitrate.
 *
 * `offset` is for the opposite case, and a `Stat` is exactly it: the parts are single lines of text
 * in a small box, so an inset ring crops the glyphs it is drawn over and reads as a box ON the word
 * rather than AROUND it. Where there is air between the parts, going outside is the better drawing.
 */
export type AnnotationRingPlacement = "inset" | "offset";

/**
 * How many of a selector's matches one label names.
 *
 * `first` is the default because most names in a diagram are singular: there is one root, one
 * trigger, one panel, and a selector that happens to match a second one inside a repeated section
 * meant the first.
 *
 * `all` is for the name that is genuinely plural. A breadcrumb's `sk-breadcrumb__item` IS all four
 * crumbs, not the leftmost one, and a diagram that rings only that one is making a claim about the
 * part that is false. One label, one bubble, and a leader out to each thing it names.
 */
export type AnnotationMatch = "first" | "all";

export const annotationMatches = ["first", "all"] as const satisfies readonly AnnotationMatch[];

export function isAnnotationMatch(value: unknown): value is AnnotationMatch {
  return typeof value === "string" && (annotationMatches as readonly string[]).includes(value);
}

export const annotationRingPlacements = [
  "inset",
  "offset",
] as const satisfies readonly AnnotationRingPlacement[];

export function isAnnotationRingPlacement(value: unknown): value is AnnotationRingPlacement {
  return (
    typeof value === "string" && (annotationRingPlacements as readonly string[]).includes(value)
  );
}

/**
 * How far from its target's own edge the ring is drawn, in px, on whichever side `ringPlacement`
 * puts it. Slight by default either way: much more and it stops reading as that element's own edge.
 */
export const ANNOTATION_RING_DISTANCE = 2;

/**
 * The signed inset the geometry actually uses: positive pulls the ring in, negative pushes it out,
 * the same convention `outline-offset` uses with its sign flipped. One number downstream instead of
 * a placement and a magnitude threaded through every function.
 */
export function annotationRingInset(
  placement: AnnotationRingPlacement,
  distance: number,
): number {
  const size = Number.isFinite(distance) ? Math.abs(distance) : ANNOTATION_RING_DISTANCE;
  return placement === "offset" ? -size : size;
}

/**
 * ONE RADIUS FOR EVERY RING BY DEFAULT, rather than each part's own.
 *
 * Matching the element (which is what this did first) sounds more correct and reads worse: a diagram
 * then has a pill around one part, a square around another and a soft rectangle around a third, and
 * the reader has to work out that these are all the same KIND of mark before they can read any of
 * them. A mark is a convention, and a convention that changes shape per instance is not one.
 *
 * A DEFAULT, though, not a law: a diagram of pill-shaped chips reads better with pill-shaped rings,
 * and a consumer says so once on the frame. `ringRadius` is settable per mark too, for the same
 * narrow reason `ringPlacement` is: the part that is unlike its neighbours.
 */
export const ANNOTATION_RING_RADIUS = 6;

/**
 * Clear space between where the leader stops and the ring's edge, and it is ZERO on purpose: the
 * leader MEETS the ring.
 *
 * Detaching them by a few pixels was the earlier default, borrowed from the arrangement where the
 * mark was a small circle and a line running into it made a lollipop. An outline is not a bead: the
 * line arriving at its edge reads as one continuous gesture from the name to the thing, while a
 * floating stub reads as a line that failed to reach and leaves the reader to close the gap.
 *
 * Still an option, because a consumer drawing a much heavier ring may want the line to stand off it.
 */
export const ANNOTATION_RING_GAP = 0;

/**
 * Which gutter this label ENDED UP in, read off the boxes rather than off the request.
 *
 * A label entirely clear of the subject on one side is on that side, and that is what lets a
 * consumer move every label somewhere else with one media query and still get correct leaders: the
 * drawing follows the layout rather than the layout having to tell the drawing.
 *
 * THE REQUEST BREAKS TIES, and it has to, because the four tests are NOT mutually exclusive. A label
 * in a corner is clear of the subject both above it and beside it, and both readings are true. This
 * is not a corner case in the dismissive sense: it is where the block-axis labels ordinarily live
 * once the subject is centred in its track, since the whole middle column is wider than the specimen
 * inside it. Testing inline first and unconditionally, which is what this did, sent the `block-start`
 * label of every centred diagram into the inline gutter, pointing at the specimen's side.
 *
 * So: if the label is clear on the side it ASKED for, that answer stands. Only a label that is
 * somewhere else entirely gets reclassified, which is exactly the case worth reclassifying. And a
 * label overlapping the subject on both axes (no geometric answer at all) keeps the request too, for
 * the same reason: it is the last thing anyone stated on purpose.
 */
export function annotationExitSide(
  label: AnnotationBox,
  subject: AnnotationBox,
  requested: AnnotationSide,
  direction: AnnotationDirection = "ltr",
): AnnotationSide {
  const clear: Record<PhysicalSide, boolean> = {
    left: label.x + label.width <= subject.x,
    right: label.x >= subject.x + subject.width,
    top: label.y + label.height <= subject.y,
    bottom: label.y >= subject.y + subject.height,
  };

  if (clear[physicalSide(requested, direction)]) return requested;

  for (const side of ["left", "right", "top", "bottom"] as const) {
    if (clear[side]) return logicalSide(side, direction);
  }
  return requested;
}

/**
 * The polyline from one point to another, in the fewest segments that run along an axis or exactly
 * 45 degrees. A leader MUST leave through its label's facing edge: a block-gutter label therefore
 * starts vertically, even when its target is much farther sideways than above or below it.
 *
 * Along its leaving axis, a leader can use a 45-degree segment for the shorter cross-axis distance
 * and a straight segment for the rest. Inline leaders spend the available horizontal distance on
 * that diagonal before finishing vertically when needed. A block leader in that same geometry does
 * not: the diagonal would make a label above or below its subject look as though its line escaped
 * from the side. It first clears vertically, then turns horizontally to the ring.
 *
 * Coordinates are used exactly as given; round them BEFORE calling if the output has to be stable
 * (`placeAnnotations` does), because rounding a knee computed from unrounded ends is what turns a
 * 45-degree segment into a 44.8-degree one.
 */
export function leaderPoints(
  from: AnnotationPoint,
  to: AnnotationPoint,
  axis: "inline" | "block",
): readonly AnnotationPoint[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  if (adx === 0 && ady === 0) return [from];
  if (axis === "block" && adx > ady) {
    return dedupe([from, { x: from.x, y: to.y }, to]);
  }

  const knee =
    axis === "inline"
      ? adx >= ady
        ? { x: from.x + Math.sign(dx) * (adx - ady), y: from.y }
        : { x: to.x, y: from.y + Math.sign(dy) * adx }
      : ady >= adx
        ? { x: from.x, y: from.y + Math.sign(dy) * (ady - adx) }
        : { x: from.x + Math.sign(dx) * ady, y: to.y };

  return dedupe([from, knee, to]);
}

const samePoint = (a: AnnotationPoint, b: AnnotationPoint): boolean => a.x === b.x && a.y === b.y;

/** Drops a knee that landed on one of the ends, so a straight run is one segment and not two. */
const dedupe = (points: readonly AnnotationPoint[]): AnnotationPoint[] =>
  points.filter((point, index) => index === 0 || !samePoint(point, points[index - 1]!));

/** A polyline as SVG path data. Empty for a single point: a leader with no length is not drawn. */
export function annotationPath(points: readonly AnnotationPoint[]): string {
  if (points.length < 2) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

/**
 * The offset a label is CURRENTLY painted with, read back off its own inline `translate`.
 *
 * THE DOM IS THE MEMORY, and that is a correction, not a style preference. A binding has to subtract
 * the offset it already applied to recover a label's flow box, and the obvious place to keep that
 * number is a variable beside the code that wrote it. It is wrong: in React the value is written to
 * state and only reaches the element at the next commit, so any pass that runs in between (a
 * `document.fonts.ready` microtask is exactly such a pass, and it lost this race in the gate stage)
 * subtracts an offset the layout does not have yet and computes a flow box hundreds of pixels away
 * from the real one. Reading the element is never early and never stale, because it IS what the
 * browser laid out.
 *
 * CSSOM drops a trailing zero, so `"224px 0px"` reads back as `"224px"`: one component means the
 * second is zero, which is also why both bindings can write through this and produce byte-identical
 * attributes.
 */
export function readAnnotationTranslate(value: string | null | undefined): AnnotationPoint {
  if (!value) return { x: 0, y: 0 };
  const [x, y] = value.trim().split(/\s+/).map(Number.parseFloat);
  return {
    x: Number.isFinite(x) ? x! : 0,
    y: Number.isFinite(y) ? y! : 0,
  };
}

/** The string form of one, so the two bindings write the same bytes. */
export const annotationTranslate = (point: AnnotationPoint): string => `${point.x}px ${point.y}px`;

/** One label asking for a position along its gutter: where it wants to be, and how much room it takes. */
export type AnnotationLane = { readonly desired: number; readonly size: number };

/**
 * Slide labels along one gutter until none of them overlap, moving each as little as possible.
 *
 * Every label wants to sit level with its own target, and several targets close together want the
 * same millimetre. The order of the passes is the whole algorithm:
 *
 *   1. Sort by where they want to be, so the result keeps the targets' own sequence. Sorting is what
 *      makes this stable: two labels that swapped places would cross their own leaders.
 *   2. Forward: push each one along to clear the previous. This can only run off the far end.
 *   3. Backward from the far end: pull anything that overran back inside. Now nothing overlaps and
 *      nothing hangs off the end.
 *
 * When the labels genuinely DO NOT FIT (their own heights plus the gaps exceed the gutter) there is
 * no arrangement that satisfies both, and the three passes above would resolve it by running off the
 * NEAR end, which is the worse half: a label sliding up out of the frame is clipped by whatever the
 * frame sits in, while one hanging past the bottom is merely below the drawing. So that case is
 * detected up front and packed from the start instead.
 *
 * Returns offsets in the INPUT's order, not the sorted one: the caller has a list of labels, not a
 * list of lanes.
 */
export function distributeLanes(
  lanes: readonly AnnotationLane[],
  extent: number,
  gap: number = ANNOTATION_LANE_GAP,
): number[] {
  const order = lanes
    .map((lane, index) => ({ lane, index }))
    .sort((a, b) => a.lane.desired - b.lane.desired || a.index - b.index);

  const needed = order.reduce((sum, { lane }, i) => sum + lane.size + (i === 0 ? 0 : gap), 0);
  const placed: number[] = [];

  if (needed > extent) {
    let cursor = 0;
    for (const { lane } of order) {
      placed.push(cursor);
      cursor += lane.size + gap;
    }
  } else {
    let cursor = Number.NEGATIVE_INFINITY;
    for (const { lane } of order) {
      const at = Math.max(lane.desired, cursor);
      placed.push(at);
      cursor = at + lane.size + gap;
    }

    let ceiling = extent;
    for (let i = order.length - 1; i >= 0; i -= 1) {
      placed[i] = Math.min(placed[i]!, ceiling - order[i]!.lane.size);
      ceiling = placed[i]! - gap;
    }
  }

  const result: number[] = new Array(lanes.length).fill(0);
  order.forEach(({ index }, position) => {
    result[index] = placed[position]!;
  });
  return result;
}

/**
 * Can this box be pointed AT?
 *
 * A box with no area cannot, and that is not a defensive check against bad input: it is a shape the
 * platform hands back for real, correct markup. An element with `display: contents` HAS NO BOX by
 * definition (`getClientRects()` returns an empty list, and `getBoundingClientRect()` therefore
 * reports zeros at the viewport origin), and the kit ships such parts on purpose:
 * `sk-accordion__trigger-heading` is `display: contents` precisely so that carrying `role="heading"`
 * does not insert a box between a section and its button. Anything in a `display: none` subtree
 * reports the same.
 *
 * Found by pointing a demo at exactly that part: the zeros are not near the frame, they are near the
 * VIEWPORT, so once converted to frame coordinates the label was dragged 67px above the diagram and
 * its leader ran off the inline edge to `x = -24`. Treating it as unpointable is the honest answer,
 * because it is: the part is real, it just has nowhere to be pointed at. The label still renders and
 * still names the part; it simply gets no leader, the same as one whose selector matched nothing.
 */
export function isPointable(box: AnnotationBox): boolean {
  return box.width > 0 || box.height > 0;
}

/**
 * Which annotation a pointer is over, when the specimen itself cannot receive events.
 *
 * `inert` takes the subject out of hit-testing, so `pointerenter` on a named part never fires.
 * Bindings therefore listen on the frame and ask this: given the pointer and every target's box,
 * which label owns the part under it? The SMALLEST containing box wins, so hovering a title inside
 * a tile lights the title's mark, not the tile's.
 *
 * `point` and every `box` share one coordinate space (viewport or frame: both bindings use
 * `getBoundingClientRect`, so viewport). Empty candidates → null.
 */
export function annotationHitIndex(
  point: AnnotationPoint,
  candidates: readonly { readonly index: number; readonly box: AnnotationBox }[],
): number | null {
  let hit: number | null = null;
  let best = Number.POSITIVE_INFINITY;
  for (const { index, box } of candidates) {
    if (!isPointable(box)) continue;
    if (point.x < box.x || point.x >= box.x + box.width) continue;
    if (point.y < box.y || point.y >= box.y + box.height) continue;
    const area = box.width * box.height;
    if (area < best || (area === best && (hit === null || index < hit))) {
      best = area;
      hit = index;
    }
  }
  return hit;
}

/**
 * What a specimen still advertises as a tab stop after `inert` is set.
 *
 * `inert` is the real freeze (pointer, keyboard, accessibility tree). This list is the leftovers:
 * Zag restamps `tabindex` on an accordion trigger after mount, a native `<button>` has no attribute
 * to strip, and a focus-order overlay that only reads selectors would still badge them. Both
 * bindings walk this set and write `tabindex="-1"`.
 */
export const ANNOTATION_SPECIMEN_TABBABLE =
  "a[href], area[href], button, input, select, textarea, iframe, object, embed, [contenteditable]:not([contenteditable='false']), [tabindex]";

/**
 * Take every control inside a specimen out of the tab order.
 *
 * Writes the attribute, not only the property: DevTools and a focus-order overlay both read
 * `tabindex`, and a native `<button>` or `<a href>` has no attribute until someone sets one.
 * Only writes when the stop is still `>= 0`, so a MutationObserver watching `tabindex` can call
 * this on every stamp without looping.
 */
export function defocusAnnotationSpecimen(subject: HTMLElement): void {
  for (const node of subject.querySelectorAll(ANNOTATION_SPECIMEN_TABBABLE)) {
    if (!(node instanceof HTMLElement) && !(node instanceof SVGElement)) continue;
    if (node.tabIndex < 0) continue;
    node.setAttribute("tabindex", "-1");
  }
}

/**
 * Keep a specimen frozen after its own enhancers restamp `tabindex`.
 *
 * Accordion's Zag `$effect` and Breadcrumb's menu trigger both write `tabindex="0"` on every
 * patch, and those patches run after this frame's first measure. Watching the attribute and
 * writing `-1` back is what makes "no tab stop inside a diagram" survive the second stamp.
 */
export function watchAnnotationSpecimenFocus(subject: HTMLElement): () => void {
  defocusAnnotationSpecimen(subject);
  if (typeof MutationObserver === "undefined") return () => {};
  const observer = new MutationObserver(() => defocusAnnotationSpecimen(subject));
  observer.observe(subject, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["tabindex", "href", "contenteditable", "disabled"],
  });
  return () => observer.disconnect();
}

/** What a binding measured for one label, before anything has been decided about it. */
export type AnnotationMeasurement = {
  /** The gutter the author asked for. Only used when the boxes cannot answer. */
  readonly side: AnnotationSide;
  /** The label's box with NO offset applied: where the stylesheet alone would put it. */
  readonly label: AnnotationBox;
  /**
   * Every box this label points at, in document order. Empty when its selector matched nothing.
   *
   * A LIST, not one box, because one name legitimately names several things: a breadcrumb's
   * `sk-breadcrumb__item` IS all four crumbs, and a diagram that rings the first one and leaves the
   * other three bare is saying something false about the part. Whether a selector's other matches
   * count is the author's call (`match`), but once they do, they are all the same annotation: one
   * label, one bubble, one line per thing it names.
   */
  readonly targets: readonly AnnotationBox[];
  /**
   * This ONE mark's signed inset, when it differs from the frame's. Absent means the frame decides.
   *
   * The frame was the only level at first, on the argument that a diagram whose marks point two
   * different ways asks the reader to learn two conventions. That holds for a diagram where the
   * parts are alike, and breaks on one where they are not: the Accordion names a whole card, a
   * button and a single line of description, and the inset ring that is exactly right on the first
   * two crops the glyphs of the third. An override per mark is the narrow answer, and it stays an
   * override: nothing is set here unless the author says so.
   */
  readonly ringInset?: number;
  /** The same, for this mark's corner radius. Absent means the frame decides. */
  readonly ringRadius?: number;
};

/** The rounded rectangle drawn around a named part. A rect, so a binding writes it straight out. */
export type AnnotationRing = AnnotationBox & { readonly radius: number };

/** One thing a label names: the ring around it, and the leader that reaches it. */
export type AnnotationMark = {
  readonly path: string;
  readonly ring: AnnotationRing;
};

/** What the binding writes back. One per measurement, in the same order. */
export type AnnotationPlacement = {
  /** The gutter it ended up in, for `data-sk-side`. */
  readonly side: AnnotationSide;
  /** The nudge from the label's flow position to where it belongs, as a `translate`. */
  readonly translate: AnnotationPoint;
  /**
   * One mark per thing this label names, in document order. Empty when its selector matched nothing,
   * which is why a binding can render this list directly and never special-case the orphan.
   */
  readonly marks: readonly AnnotationMark[];
};

export type AnnotationPlacementOptions = {
  readonly gap?: number;
  readonly tipInset?: number;
  /** Signed: positive pulls the ring inside the part, negative pushes it outside. See
   *  `annotationRingInset`, which is how a placement and a distance become this. */
  readonly ringInset?: number;
  readonly ringRadius?: number;
  readonly ringGap?: number;
  readonly direction?: AnnotationDirection;
  /** Keep labels in their flow positions while still drawing leaders from those measured boxes. */
  readonly distribute?: boolean;
  /**
   * The mobile stack's leaders step only a little right from each bubble, then run toward its ring.
   * Each label gets a distinct elbow, so no shared rail reaches the container edge or crosses labels.
   */
  readonly leaderRoute?: "direct" | "right-elbow";
};

/**
 * The whole decision, from measured rectangles to the handful of strings a binding assigns. Both
 * bindings call exactly this, and neither one holds any geometry of its own.
 *
 * Everything is rounded to whole pixels on the way out, for two reasons that happen to agree. A
 * 45-degree segment stays 45 degrees only if both of its ends are integers (see `leaderPoints`), and
 * the symmetry gate compares the two bindings' attributes as STRINGS, so half a pixel of subpixel
 * layout noise between two stages of the same width would read as a divergence in a drawing that is
 * in fact identical.
 */
export function placeAnnotations(
  measurements: readonly AnnotationMeasurement[],
  subject: AnnotationBox,
  options: AnnotationPlacementOptions = {},
): AnnotationPlacement[] {
  const gap = options.gap ?? ANNOTATION_LANE_GAP;
  const tipInset = options.tipInset ?? ANNOTATION_TIP_INSET;
  const ringInset = options.ringInset ?? ANNOTATION_RING_DISTANCE;
  const ringRadius = options.ringRadius ?? ANNOTATION_RING_RADIUS;
  const ringGap = options.ringGap ?? ANNOTATION_RING_GAP;
  const direction = options.direction ?? "ltr";
  const distribute = options.distribute ?? true;
  const leaderRoute = options.leaderRoute ?? "direct";

  const sides = measurements.map((measurement) =>
    annotationExitSide(measurement.label, subject, measurement.side, direction),
  );
  const physical = sides.map((side) => physicalSide(side, direction));
  /* Normalized ONCE, here, so "has something to point at" means the same thing to the distribution
     below and to the drawing after it. Asking twice is how the two would come to disagree. */
  const targets = measurements.map((measurement) => measurement.targets.filter(isPointable));

  /*
   * One lane per gutter, and a label with nothing to point at sits the distribution out entirely: it
   * has no opinion about where it wants to be, so letting it claim its flow position would let it
   * push labels that DO have an opinion away from their targets.
   */
  const offsets: number[] = new Array(measurements.length).fill(0);
  if (distribute) {
    for (const gutter of ["left", "right", "top", "bottom"] as const) {
      const members = measurements
        .map((measurement, index) => ({ measurement, index }))
        .filter(({ index }) => physical[index] === gutter && targets[index]!.length > 0);
      if (members.length === 0) continue;

      const vertical = gutter === "left" || gutter === "right";
      const origin = vertical ? subject.y : subject.x;
      const extent = vertical ? subject.height : subject.width;

      const lanes = members.map(({ measurement, index }) => {
        /* A label naming SEVERAL things wants to be level with all of them, which is level with the
           middle of the box that holds them: it is the only position from which no one of its leaders
           is obviously the odd one out. */
        const span = unionOf(targets[index]!);
        const size = vertical ? measurement.label.height : measurement.label.width;
        const middle = vertical ? span.y + span.height / 2 : span.x + span.width / 2;
        // Level with that centre, expressed from the gutter's own start.
        return { desired: middle - size / 2 - origin, size };
      });

      const placed = distributeLanes(lanes, extent, gap);
      members.forEach(({ measurement, index }, position) => {
        const flow = vertical ? measurement.label.y : measurement.label.x;
        offsets[index] = origin + placed[position]! - flow;
      });
    }
  }

  return measurements.map((measurement, index) => {
    const side = sides[index]!;
    const gutter = physical[index]!;
    const vertical = gutter === "left" || gutter === "right";
    const shift = Math.round(offsets[index]!);
    const translate = vertical ? { x: 0, y: shift } : { x: shift, y: 0 };

    const label: AnnotationBox = vertical
      ? { ...measurement.label, y: measurement.label.y + shift }
      : { ...measurement.label, x: measurement.label.x + shift };

    /*
     * One mark per thing named, each leaving the label's facing edge at its OWN point.
     *
     * Projecting each target onto the edge (see `spreadAlong`) keeps every leader as short and
     * straight as the bubble allows: a separator sitting above the label gets a single vertical
     * run, not an elbow forced by an evenly-spaced fan. Origins stay ordered with the targets so
     * no two of a label's own leaders cross.
     */
    const origins = leaderRoute === "direct" ? spreadAlong(label, gutter, targets[index]!) : [];
    const marks = targets[index]!.map((target, at) => {
      const ring = ringAround(
        target,
        measurement.ringInset ?? ringInset,
        measurement.ringRadius ?? ringRadius,
      );
      if (leaderRoute === "right-elbow") {
        const from = { x: label.x + label.width, y: label.y + label.height / 2 };
        const edge: PhysicalSide = from.y <= ring.y + ring.height / 2 ? "top" : "bottom";
        const to = leaderTarget(from, ring, edge, tipInset, ringGap);
        /*
         * A mobile label needs the fewest route possible: horizontal to the point above or below the
         * ring, then a vertical entry. Adding an intermediate rail turns this simple relationship
         * into four segments without avoiding anything the labels' higher paint layer does not.
         */
        return {
          path: annotationPath(dedupe([from, { x: to.x, y: from.y }, to])),
          ring,
        };
      }
      const from = origins[at]!;
      const to = leaderTarget(from, ring, gutter, tipInset, ringGap);
      return {
        path: annotationPath(leaderPoints(from, to, vertical ? "inline" : "block")),
        ring,
      };
    });

    return { side, translate, marks };
  });
}

/** The smallest box holding all of them. Empty in, empty out is impossible: callers filter first. */
function unionOf(boxes: readonly AnnotationBox[]): AnnotationBox {
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.width));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/**
 * The ring itself: the target's own box inset by `inset` on every side, at the one shared radius.
 * A negative inset grows the box instead, which is how `offset` placement is drawn.
 *
 * A part thinner than two insets cannot be pulled in on that axis without turning inside out, so it
 * keeps its own extent there: a hairline rule gets a ring exactly as thin as the rule is, which is
 * the honest drawing of it. Growing has no such limit, so the guard only ever fires on `inset`. The
 * radius is clamped to half the smaller side for the same reason a browser clamps `border-radius`:
 * a 6px corner on a 4px-tall box is not a shape.
 */
function ringAround(target: AnnotationBox, inset: number, radius: number): AnnotationRing {
  const width = target.width > inset * 2 ? target.width - inset * 2 : target.width;
  const height = target.height > inset * 2 ? target.height - inset * 2 : target.height;
  return {
    x: Math.round(target.width > inset * 2 ? target.x + inset : target.x),
    y: Math.round(target.height > inset * 2 ? target.y + inset : target.y),
    width: Math.round(width),
    height: Math.round(height),
    radius: Math.round(Math.min(radius, Math.min(width, height) / 2)),
  };
}

/**
 * Where each of a label's leaders leaves it: one point per thing it names, on the facing edge.
 *
 * A single mark gets the edge's midpoint. Several used to be spread evenly along the edge, which
 * made a tidy fan and also forced every leader that was NOT level with its evenly-spaced origin to
 * bend: a breadcrumb's separators, named from below, became a nest of elbows when the label was
 * narrower than the trail. Prefer PROJECTING each target onto the edge (clamped to the bubble), so
 * a part sitting above or beside the label gets a straight run, and only the ones that fall past
 * the bubble's ends still turn. Origins stay ordered with the targets along that axis, so a label's
 * own leaders never cross.
 */
function spreadAlong(
  label: AnnotationBox,
  gutter: PhysicalSide,
  targets: readonly AnnotationBox[],
): AnnotationPoint[] {
  const vertical = gutter === "left" || gutter === "right";
  const fixed = Math.round(
    vertical
      ? gutter === "left"
        ? label.x + label.width
        : label.x
      : gutter === "top"
        ? label.y + label.height
        : label.y,
  );
  const start = vertical ? label.y : label.x;
  const extent = vertical ? label.height : label.width;
  const point = (along: number): AnnotationPoint =>
    vertical ? { x: fixed, y: Math.round(along) } : { x: Math.round(along), y: fixed };

  if (targets.length < 2) return targets.map(() => point(start + extent / 2));

  /* The edge is short and its ends are curved, so origins stay an eighth in from each corner. */
  const margin = extent / 8;
  const lo = start + margin;
  const hi = start + extent - margin;

  const ideals = targets.map((target) => {
    const along = vertical ? target.y + target.height / 2 : target.x + target.width / 2;
    return Math.min(Math.max(along, lo), hi);
  });

  /*
   * When two targets project to the same spot (both outside the same end of a narrow bubble), fan
   * just that cluster so the leaders still leave as distinct strokes instead of a single knot.
   */
  const order = ideals
    .map((along, at) => ({ at, along }))
    .sort((a, b) => a.along - b.along || a.at - b.at);

  const placed: number[] = new Array(targets.length);
  let clusterStart = 0;
  while (clusterStart < order.length) {
    let clusterEnd = clusterStart + 1;
    while (
      clusterEnd < order.length &&
      Math.abs(order[clusterEnd]!.along - order[clusterStart]!.along) < 1
    ) {
      clusterEnd += 1;
    }
    const count = clusterEnd - clusterStart;
    if (count === 1) {
      placed[order[clusterStart]!.at] = order[clusterStart]!.along;
    } else {
      const centre = order[clusterStart]!.along;
      const room = Math.min(centre - lo, hi - centre, (count - 1) * 4);
      const from = centre - room;
      const span = room * 2;
      for (let i = 0; i < count; i += 1) {
        placed[order[clusterStart + i]!.at] =
          count === 1 ? centre : from + (span * i) / (count - 1);
      }
    }
    clusterStart = clusterEnd;
  }

  return targets.map((_, at) => point(placed[at]!));
}

/**
 * The far end of one leader: the RING's facing edge (plus `gap`, normally zero), as nearly level
 * with where the leader LEFT as the ring allows.
 *
 * Aimed at the edge rather than drawn to the ring and trimmed back, which is what this did while the
 * mark was a circle. A circle is the same distance from its centre in every direction, so trimming
 * along the path was the only way to clear it; a rectangle's facing edge is a straight line at a
 * known coordinate, so the endpoint is simply that coordinate, and the arithmetic is exact instead
 * of being a walk back along a polyline.
 *
 * Clamping to the leader's own level (rather than fixing it at the ring's centre) is what makes the
 * common case ONE straight segment: as long as the label is anywhere alongside its target, the line
 * is level and has nothing to turn for. `tipInset` keeps it off the corners, falling back to the
 * ring's own centre when the ring is too small to hold it.
 */
function leaderTarget(
  from: AnnotationPoint,
  ring: AnnotationRing,
  gutter: PhysicalSide,
  tipInset: number,
  gap: number,
): AnnotationPoint {
  const round = Math.round;

  if (gutter === "left" || gutter === "right") {
    return {
      x: round(gutter === "left" ? ring.x - gap : ring.x + ring.width + gap),
      y: round(clampInside(from.y, ring.y, ring.height, tipInset)),
    };
  }

  return {
    x: round(clampInside(from.x, ring.x, ring.width, tipInset)),
    y: round(gutter === "top" ? ring.y - gap : ring.y + ring.height + gap),
  };
}

function clampInside(value: number, start: number, size: number, inset: number): number {
  if (size <= inset * 2) return start + size / 2;
  return Math.min(Math.max(value, start + inset), start + size - inset);
}

/* ---------------------------------------------------------------------------------------------- *
 * Contract
 * ---------------------------------------------------------------------------------------------- */

export const annotationContract = {
  id: "annotation",
  css: "@skryensya/core/components/annotation.css",
  parts: annotationParts,

  options: {
    /**
     * Names the whole diagram, and turns the frame into a `group` so a screen reader hears the
     * labels as belonging to one figure instead of as loose words after the specimen. Required
     * whenever `inert` is set, because at that point it is the only name left (see `a11y`).
     */
    label: { type: "string", attr: "aria-label" },
    /**
     * The subject is a SPECIMEN, not a control: it takes no pointer, no focus and no keyboard, and
     * it leaves the accessibility tree. Default ON, because a diagram that still Tabs into the
     * accordion it is naming is two things fighting over the same markup.
     *
     * `inert` rather than a pile of `pointer-events`/`tabindex` overrides, because those two do not
     * cover the third case: a screen-reader user is otherwise walked through a full interactive
     * accordion that does not respond, which is worse than not meeting it at all. The platform has
     * one word for "this is here to be looked at" and this is it. The bindings still take every
     * leftover tab stop out (`defocusAnnotationSpecimen`): Zag and friends restamp `tabindex` after
     * mount, and a focus-order overlay that only reads attributes would still badge those buttons.
     * The component still MOUNTS, so every part it renders at rest is on screen to be pointed at;
     * it simply never changes.
     */
    inert: { type: "boolean", default: true, attr: "inert", trueValue: "" },
    /**
     * Which gutter a label asks for. A request, not a guarantee: the stylesheet places it and
     * `annotationExitSide` reads back where it landed.
     */
    side: {
      type: "enum",
      values: [...annotationSides],
      default: "inline-start",
      attr: annotationAttrs.side,
    },
    /**
     * A CSS selector, resolved inside the subject, for the element this label names. The FIRST match
     * wins: an anatomy diagram points at one representative of each part, and a selector that can
     * only ever mean "the first trigger" is easier to read than an index beside it.
     *
     * `computedInput`, in spirit and in fact: it lands on the markup (the enhancer has no other
     * channel to read it from) but nothing renders it, and what it produces is a measurement.
     */
    for: { type: "string", attr: annotationAttrs.target },
    /**
     * Which side of a part's own edge its ring is drawn on. `inset` is unambiguous about which
     * element a mark belongs to and is right for a dense composition; `offset` is right where the
     * parts are lines of text with air around them, because an inset ring there is a box drawn ON
     * the word rather than around it. Set on the FRAME, not per label: a diagram whose marks pointed
     * two different ways would be asking the reader to learn two conventions to read one drawing.
     */
    ringPlacement: {
      type: "enum",
      values: [...annotationRingPlacements],
      default: "inset",
      attr: annotationAttrs.ringPlacement,
      machineInput: true,
    },
    /** How far from that edge, in px. */
    ringDistance: {
      type: "number",
      default: ANNOTATION_RING_DISTANCE,
      attr: annotationAttrs.ringDistance,
      machineInput: true,
    },
    /**
     * The corner radius every ring is drawn with. One shared value rather than each part's own, so
     * the mark stays one convention across a drawing; see `ANNOTATION_RING_RADIUS`. A diagram of
     * pill-shaped chips raises it once here and gets pill-shaped rings throughout.
     */
    ringRadius: {
      type: "number",
      default: ANNOTATION_RING_RADIUS,
      attr: annotationAttrs.ringRadius,
      machineInput: true,
    },
  },

  signatures: {
    Annotated: {
      intent: [
        "annotate-parts",
        "anatomy-diagram",
        "composition-diagram",
        "callout-labels",
        "label-the-pieces",
        "leader-line",
      ],
      host: { element: "div" },
      options: ["label", "inert", "ringPlacement", "ringDistance", "ringRadius"],
      slots: {
        /** What is being diagrammed. Any composition at all; the frame never looks inside it. */
        subject: { accepts: "node", required: true },
        /**
         * The labels, as DATA rather than as children, for the reason every collection is data here:
         * one entry becomes two things in two different places (a label in a gutter and a path in
         * the overlay) and what pairs them is the entry itself. Composed as children they would also
         * be placeable anywhere, including over the subject, which is the one thing this contract
         * exists to make impossible.
         */
        items: {
          accepts: "items",
          required: true,
          prop: "annotations",
          item: {
            options: {
              for: { type: "string", attr: annotationAttrs.target },
              side: {
                type: "enum",
                values: [...annotationSides],
                default: "inline-start",
                attr: annotationAttrs.side,
              },
              /**
               * Whether this label names the FIRST element its selector matches or every one of
               * them. `all` for a name that is genuinely plural (a breadcrumb crumb, a table row);
               * `first`, the default, for the singular names that are most of a diagram.
               */
              match: {
                type: "enum",
                values: [...annotationMatches],
                default: "first",
                attr: annotationAttrs.match,
                machineInput: true,
              },
              /**
               * This mark's own ring placement, overriding the frame's. For the part that is unlike
               * its neighbours: an Accordion's `sk-tile__description` is one line of text among
               * parts that are whole boxes, so the inset ring right for the others crops its glyphs.
               * Omitted, which is the normal case, the frame decides for every mark at once.
               */
              ringPlacement: {
                type: "enum",
                values: [...annotationRingPlacements],
                attr: annotationAttrs.ringPlacement,
                machineInput: true,
              },
              /** The same, for the distance. */
              ringDistance: {
                type: "number",
                attr: annotationAttrs.ringDistance,
                machineInput: true,
              },
              /** The same, for the corner radius. */
              ringRadius: {
                type: "number",
                attr: annotationAttrs.ringRadius,
                machineInput: true,
              },
              /**
               * Cross-axis alignment when the narrow layout stacks labels above or below the
               * specimen. Omit it for the stack default; use `end` for a label that belongs against
               * the far edge without forcing every label in that group to follow it.
               */
              mobileAlign: {
                type: "enum",
                values: [...annotationMobileAlignments],
                attr: annotationAttrs.mobileAlign,
              },
            },
            slots: { children: { accepts: "node", required: true } },
          },
        },
      },
      mount: annotationAttrs.root,
      template: {
        element: "div",
        part: "root",
        host: true,
        /* The group role only exists when there is a name for it: an unnamed group is an extra
           level of nesting a screen reader announces and nobody asked for. */
        attrsWhen: [{ option: "label", given: true, attrs: { role: "group" } }],
        children: [
          {
            element: "div",
            part: "subject",
            slot: "subject",
            /* `inert` lands HERE and not on the host: the labels are not part of the specimen, and
               an inert frame would take them out of the accessibility tree along with it. */
            options: ["inert"],
          },
          /*
           * FOCUSABLE, and this is the price of showing one mark at a time rather than all of them.
           *
           * A ring that only appears under the pointer is information a keyboard reader cannot
           * reach, and "the leaders are decorative" is not an answer: the ring is the only thing
           * that says WHICH part a name belongs to, which is the entire content of the diagram. A
           * tab stop per label is the cheapest way to make that reachable, and it turns the diagram
           * into something a reader can walk rather than only hover, which is worth having on its
           * own. The stylesheet keys the reveal on `:hover` and `:focus-visible` alike.
           */
          {
            element: "span",
            part: "label",
            repeat: "items",
            itemOptions: ["for", "side", "mobileAlign", "match", "ringPlacement", "ringDistance", "ringRadius"],
            itemSlot: "children",
            attrs: { tabindex: "0" },
          },
          /*
           * EMPTY BY CONSTRUCTION. Its contents are one `<path>` and one `<circle>` per label, and
           * every number in them is measured, so there is nothing here for an author to write and
           * nothing for the emitter to emit. `focusable="false"` because IE-era SVG is still in
           * enough tab orders to be worth two attributes, and `aria-hidden` because the leader says
           * nothing the label does not already say out loud.
           */
          {
            element: "svg",
            part: "leaders",
            attrs: { "aria-hidden": "true", focusable: "false" },
          },
        ],
      },
      react: { from: "@skryensya/react/annotation", name: "Annotated" },
    },
  },

  a11y: [
    {
      when: { inert: "present" },
      requiresOneOf: ["label"],
      because:
        "un sujeto inerte sale del árbol de accesibilidad, así que sin `label` el grupo queda como una lista de nombres de partes sin decir de qué son las partes",
    },
  ],
} as const satisfies ComponentContract;

/** Derived, never restated. */
export type AnnotationOptions = OptionsOf<typeof annotationContract>;
