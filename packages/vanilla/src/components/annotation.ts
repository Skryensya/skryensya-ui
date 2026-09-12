import {
  ANNOTATION_RING_DISTANCE,
  ANNOTATION_RING_RADIUS,
  annotationAttrs,
  annotationElementRadius,
  annotationHitIndex,
  annotationParts,
  annotationRingInset,
  annotationTranslate,
  watchAnnotationSpecimenFocus,
  isAnnotationRingPlacement,
  isAnnotationSide,
  placeAnnotations,
  readAnnotationTranslate,
  type AnnotationBox,
  type AnnotationDirection,
  type AnnotationMark,
  type AnnotationMeasurement,
  type AnnotationPlacement,
  type AnnotationRingPlacement,
  type AnnotationSide,
  type AnnotationTarget,
} from "@skryensya/core/annotation";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${annotationAttrs.root}]`;
const SVG_NS = "http://www.w3.org/2000/svg";
/* Matches annotation.css: mobile turns the four gutters into two stacked label groups. */
const stackedLabelsQuery = "(max-width: 40rem)";

type Cleanup = () => void;

/*
 * ANNOTATION, the DOM shell around `@skryensya/core/annotation`'s geometry.
 *
 * The division is the same one `back-to-top` draws, and it is sharper here because there is more to
 * get wrong: this file MEASURES and ASSIGNS, and holds not one line of geometry. Four rectangles go
 * out to `placeAnnotations`, a translate, a side and two path strings come back, and the only
 * decisions left here are platform ones: which element is the target, when to re-measure, and how to
 * write the overlay without rebuilding it on every frame.
 *
 * WHY THE FLOW POSITION IS RECONSTRUCTED RATHER THAN RE-READ. `placeAnnotations` wants each label's
 * box WITHOUT the offset a previous pass gave it, and the obvious way to get that is to clear every
 * `translate`, read, then write again. That is two forced reflows per pass on a resize, and it makes
 * the labels flicker back to their flow positions on any frame the browser decides to paint between
 * the two. Instead the offset already applied is subtracted: `translate` never affects layout, so
 * the subtraction is exact rather than an approximation of one.
 *
 * And that offset is READ BACK OFF THE ELEMENT (`readAnnotationTranslate`), never remembered in a
 * variable here. This half could get away with remembering it, since it writes to the DOM
 * synchronously; the React half cannot, and that is the whole reason the helper is in Core. Both
 * bindings reading the same place is what keeps the two from drifting the moment one of them has to
 * be careful about something the other does not.
 *
 * WHAT IS OBSERVED, and why it is not just the root. A label's own box changes when its text
 * rewraps, which happens when the FRAME resizes, and the specimen's box changes when anything inside
 * it reflows, which the frame never hears about. So the root, the subject and every label are all
 * observed, and `document.fonts.ready` re-runs the pass once more: a webfont landing after first
 * paint moves every label and every leader by a few pixels, and a diagram is exactly the kind of
 * drawing where a few pixels read as a mistake.
 */
export function connectAnnotated(root: HTMLElement): Cleanup {
  const subject = root.querySelector<HTMLElement>(`.${annotationParts.subject}`);
  const overlay = root.querySelector<SVGSVGElement>(`.${annotationParts.leaders}`);
  const labels = Array.from(
    root.querySelectorAll<HTMLElement>(`:scope > .${annotationParts.label}`),
  );

  /* Nothing to draw between: a frame with no specimen or no overlay is authored markup that lost a
     part, and there is no sensible half-measure to fall back to. */
  if (!subject || !overlay) return () => {};

  /* A diagram is a drawing: the accordion (or anything else) inside is a specimen, not a control.
     Written as an attribute, not `.inert =`, because jsdom does not reflect the property. The
     watcher keeps `tabindex="-1"` after Zag / Breadcrumb restamp `tabindex="0"` on a later effect. */
  subject.toggleAttribute("inert", true);
  const unwatchFocus = watchAnnotationSpecimenFocus(subject);

  /*
   * Read ONCE, frame and labels alike: these are compose-time decisions about how the drawing is
   * made, not runtime state, so re-reading them on every resize frame would be measuring the DOM for
   * a constant. A label that overrides neither gets `undefined` and defers to the frame, which is
   * what keeps the override an override rather than a second default.
   */
  const framePlacement = ringPlacementOf(root, "inset");
  const frameDistance = ringNumberOf(root, annotationAttrs.ringDistance, ANNOTATION_RING_DISTANCE);
  /* `undefined` when the frame said nothing, and that is load-bearing rather than tidy: a number
     here would be indistinguishable from an author's own, and would override the corner each part
     asks for (see `ANNOTATION_RING_RADIUS`). Only an authored attribute speaks. */
  const frameRadius = root.hasAttribute(annotationAttrs.ringRadius)
    ? ringNumberOf(root, annotationAttrs.ringRadius, ANNOTATION_RING_RADIUS)
    : undefined;
  const ringInset = annotationRingInset(framePlacement, frameDistance);
  const labelRings = labels.map((label) => ({
    ringInset:
      label.hasAttribute(annotationAttrs.ringPlacement) ||
      label.hasAttribute(annotationAttrs.ringDistance)
        ? annotationRingInset(
            ringPlacementOf(label, framePlacement),
            ringNumberOf(label, annotationAttrs.ringDistance, frameDistance),
          )
        : undefined,
    ringRadius: label.hasAttribute(annotationAttrs.ringRadius)
      ? ringNumberOf(label, annotationAttrs.ringRadius, frameRadius ?? ANNOTATION_RING_RADIUS)
      : undefined,
  }));

  let previous: AnnotationPlacement[] | null = null;
  let frame = 0;

  const sync = (): void => {
    frame = 0;
    const stacked = window.matchMedia(stackedLabelsQuery).matches;
    const rootRect = root.getBoundingClientRect();
    /* The overlay resolves `inset: 0` against the PADDING box, so the origin every coordinate is
       written in is the border box shifted in by the border itself. */
    const originX = rootRect.left + root.clientLeft;
    const originY = rootRect.top + root.clientTop;
    const relative = (element: Element): AnnotationBox => {
      const rect = element.getBoundingClientRect();
      return { x: rect.left - originX, y: rect.top - originY, width: rect.width, height: rect.height };
    };
    /* A target carries its own corner along with its box, so a ring wraps a pill as a pill and a
       card as a card. Read on every pass rather than once, because a part's radius is not a
       constant: a container query or a mode swap can retune `--radius-*` under it. */
    const asTarget = (element: Element): AnnotationTarget => ({
      ...relative(element),
      radius: annotationElementRadius(element),
    });

    const measurements: AnnotationMeasurement[] = labels.map((label, index) => {
      const live = relative(label);
      const offset = readAnnotationTranslate(label.style.translate);
      const found = targetsOf(
        subject,
        label.getAttribute(annotationAttrs.target),
        label.getAttribute(annotationAttrs.match) === "all",
      );
      for (const element of found) watch(element, index);
      return {
        side: sideOf(label),
        ...labelRings[index],
        label: { ...live, x: live.x - offset.x, y: live.y - offset.y },
        targets: found.map(asTarget),
      };
    });

    /*
     * A FRAME WITH NO BOX IS NOT MEASURED AT ALL, and this is not defensiveness: a diagram inside a
     * closed tab panel, or one enhanced before it is in the document, reports every rectangle as
     * zero. Every label then wants the same spot, the overflow branch packs them in authoring order,
     * and those offsets are remembered as the flow positions the NEXT pass subtracts, so the first
     * real measurement comes out wrong by exactly the garbage the first one wrote. Waiting costs
     * nothing: becoming visible is a resize, and the observer is already watching for one.
     */
    const subjectBox = relative(subject);
    if (subjectBox.width === 0 && subjectBox.height === 0) return;

    const direction: AnnotationDirection =
      getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr";
    const placements = placeAnnotations(measurements, subjectBox, {
      direction,
      ringInset,
      ringRadius: frameRadius,
      distribute: !stacked,
      leaderRoute: stacked ? "right-elbow" : "direct",
    });

    /* A pass that decided nothing new writes nothing: a `ResizeObserver` fires for every observed
       element, so one resize of the frame arrives once per label plus twice more, and each of those
       would otherwise rewrite the whole overlay. */
    if (previous && placements.every((placement, index) => same(placement, previous![index]!))) return;
    previous = placements;

    placements.forEach((placement, index) => {
      const label = labels[index]!;
      label.style.translate = annotationTranslate(placement.translate);
      label.setAttribute(annotationAttrs.resolvedSide, placement.side);
    });

    drawLeaders(overlay, placements);
    /* A redraw can replace the `<g>` that carried the reveal, so re-stamp it: a resize while the
       pointer is resting on a label must not blank the mark the reader is looking at. */
    if (active !== null) overlay.children[active]?.toggleAttribute(annotationAttrs.active, true);
  };

  const schedule = (): void => {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  };

  /*
   * ONE MARK AT A TIME, and the pairing has to be done here because no selector can do it.
   *
   * A label and the `<g>` that draws its leader and ring are in different subtrees (the labels are
   * grid items, the marks live in one overlay that spans the whole frame), so `:hover` on one cannot
   * reach the other: not by descendant, not by sibling, not by `:has()`, which still only selects an
   * ANCESTOR of what it matches. The enhancer already knows which label goes with which mark,
   * because it drew them in the same order, so it marks both.
   *
   * Labels still get `pointerenter`/`focusin` directly. Targets do NOT: the specimen is `inert`, so
   * the platform skips them in hit-testing and those events never fire. Hovering a named part is
   * recovered by listening on the FRAME and asking `annotationHitIndex` which target's box contains
   * the pointer. The smallest containing box wins, so a title inside a tile lights the title.
   */
  let active: number | null = null;
  const setActive = (index: number | null): void => {
    if (active === index) return;
    for (const at of [active, index]) {
      if (at === null) continue;
      const on = at === index;
      labels[at]?.toggleAttribute(annotationAttrs.active, on);
      overlay.children[at]?.toggleAttribute(annotationAttrs.active, on);
    }
    active = index;
  };

  const listeners = labels.flatMap((label, index) => {
    const enter = () => setActive(index);
    const leave = () => setActive(null);
    label.addEventListener("pointerenter", enter);
    label.addEventListener("pointerleave", leave);
    label.addEventListener("focusin", enter);
    label.addEventListener("focusout", leave);
    return [
      () => label.removeEventListener("pointerenter", enter),
      () => label.removeEventListener("pointerleave", leave),
      () => label.removeEventListener("focusin", enter),
      () => label.removeEventListener("focusout", leave),
    ];
  });

  /* Targets registered for hit-testing (and resize), not for their own pointer listeners. */
  const hitTargets: { element: Element; index: number }[] = [];
  const onFramePointer = (event: PointerEvent): void => {
    /* Over a label: the label's own listeners own the reveal. Do not clear from a miss on targets. */
    if ((event.target as Element | null)?.closest?.(`.${annotationParts.label}`)) return;
    const hit = annotationHitIndex(
      { x: event.clientX, y: event.clientY },
      hitTargets.map(({ element, index }) => {
        const box = element.getBoundingClientRect();
        return { index, box: { x: box.left, y: box.top, width: box.width, height: box.height } };
      }),
    );
    setActive(hit);
  };
  const onFrameLeave = (): void => setActive(null);
  root.addEventListener("pointermove", onFramePointer);
  root.addEventListener("pointerleave", onFrameLeave);
  listeners.push(
    () => root.removeEventListener("pointermove", onFramePointer),
    () => root.removeEventListener("pointerleave", onFrameLeave),
  );

  const observer = new ResizeObserver(schedule);
  observer.observe(root);
  observer.observe(subject);
  for (const label of labels) observer.observe(label);

  /*
   * THE TARGETS ARE OBSERVED TOO, and leaving them out was a real bug rather than an oversight worth
   * tidying. A part can change size without its container changing size at all, and the kit does it
   * on every page: an accordion's `sk-tile__chevron` is an empty `[data-sk-icon]` placeholder when
   * the enhancers run and becomes a 40px `<svg>` one frame later, inside a grid cell that was
   * already that wide. So the subject's box never moved, no resize fired, and the chevron kept the
   * 0x0 box it had at first measurement: `isPointable` dropped it, and its label sat in the gutter
   * with no ring and no leader, undistributed, for the life of the page.
   *
   * Observed lazily, as each pass resolves them, because a selector can match something that was not
   * in the document when the enhancer mounted. Observing an element makes the observer fire once
   * immediately, which costs exactly one extra pass: the second one finds nothing new to observe and
   * decides the same thing, so `same()` writes nothing and it stops there.
   */
  const watched = new WeakSet<Element>();
  const watch = (element: Element, index: number): void => {
    if (watched.has(element)) return;
    watched.add(element);
    hitTargets.push({ element, index });
    observer.observe(element);
  };

  /*
   * A specimen can reveal or replace parts without changing its own box: Breadcrumb inserts its
   * collapse trigger and only flips `hidden` on its crumbs. ResizeObserver cannot see that change,
   * so watch the target subtree as well and redraw from the current matches.
   */
  const mutations = new MutationObserver(schedule);
  mutations.observe(subject, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-hidden", "hidden"],
  });

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
    mutations.disconnect();
    unwatchFocus();
    for (const off of listeners) off();
  };
}

const ringPlacementOf = (element: HTMLElement, fallback: AnnotationRingPlacement) => {
  const authored = element.getAttribute(annotationAttrs.ringPlacement);
  return isAnnotationRingPlacement(authored) ? authored : fallback;
};

/** An unparseable or negative length is the fallback, never a ring inverted through its own part. */
const ringNumberOf = (element: HTMLElement, attr: string, fallback: number): number => {
  const parsed = Number.parseFloat(element.getAttribute(attr) ?? "");
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const sideOf = (label: HTMLElement): AnnotationSide => {
  const authored = label.getAttribute(annotationAttrs.side);
  return isAnnotationSide(authored) ? authored : "inline-start";
};

/**
 * The elements a label points at: first match or every match when the label asked for `all`.
 *
 * A target may itself be `aria-hidden` (a decorative separator is still a drawable part). A target
 * nested under an `aria-hidden` ancestor is usually a measurement copy (Breadcrumb's unconstrained
 * clone) and is skipped WHEN a visible match exists. When every match lives under such a host  -
 * QRCode's modules path inside its decorative `aria-hidden` SVG  -  those matches are kept: they are
 * the only place the part exists, not a shadow of something else.
 *
 * Scoped to the subject rather than to the document, which is not only tidiness: a diagram that
 * documents a component is very often rendered on a page that USES that component, and a bare
 * `.sk-tile__trigger` would happily find one in the site chrome and draw a leader off the edge of the
 * frame.
 */
function targetsOf(subject: HTMLElement, selector: string | null, all: boolean): Element[] {
  if (!selector) return [];
  try {
    const matches = [...subject.querySelectorAll(selector)].filter(
      (target) => !target.closest("[hidden]"),
    );
    const preferred = matches.filter(
      (target) => !target.parentElement?.closest('[aria-hidden="true"]'),
    );
    const chosen = preferred.length > 0 ? preferred : matches;
    return all ? chosen : chosen.slice(0, 1);
  } catch {
    /* An invalid selector costs THAT label its leaders, never the whole drawing: one typo in one
       entry should not blank a diagram that is otherwise correct. */
    return [];
  }
}

const sameMark = (a: AnnotationMark, b: AnnotationMark): boolean =>
  a.path === b.path &&
  a.ring.x === b.ring.x &&
  a.ring.y === b.ring.y &&
  a.ring.width === b.ring.width &&
  a.ring.height === b.ring.height &&
  a.ring.radius === b.ring.radius;

const same = (a: AnnotationPlacement, b: AnnotationPlacement): boolean =>
  a.side === b.side &&
  a.translate.x === b.translate.x &&
  a.translate.y === b.translate.y &&
  a.marks.length === b.marks.length &&
  a.marks.every((mark, index) => sameMark(mark, b.marks[index]!));

/**
 * The overlay's children, reconciled rather than replaced.
 *
 * ONE `<g>` PER LABEL, ALWAYS, even for a label with nothing to point at, and that is not tidiness:
 * the reveal pairs a label with its mark BY INDEX, and drawing only the marks that have something to
 * draw makes those two lists different lengths the moment one selector matches nothing. Every label
 * after the gap would then light up its neighbour's ring. An empty `<g>` renders nothing, so the
 * placeholder costs a reader precisely nothing and keeps the index the one thing that cannot go
 * wrong.
 *
 * Reusing the existing elements is what keeps this from being an `innerHTML =` on every resize
 * frame; it also keeps the DOM the React binding produces and the DOM this produces the same shape,
 * which is the thing the symmetry gate is actually comparing.
 */
function drawLeaders(overlay: SVGSVGElement, placements: readonly AnnotationPlacement[]): void {
  while (overlay.childElementCount > placements.length) overlay.lastElementChild!.remove();
  while (overlay.childElementCount < placements.length) {
    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("class", annotationParts.mark);
    overlay.append(group);
  }

  placements.forEach((placement, index) => {
    const group = overlay.children[index]!;
    /* Two elements per thing named, because one label can name several (a breadcrumb's crumbs are
       all `sk-breadcrumb__item`). Reconciled by count the same way the groups above are. */
    while (group.childElementCount > placement.marks.length * 2) group.lastElementChild!.remove();
    while (group.childElementCount < placement.marks.length * 2) {
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("class", annotationParts.leader);
      const ring = document.createElementNS(SVG_NS, "rect");
      ring.setAttribute("class", annotationParts.ring);
      group.append(path, ring);
    }

    placement.marks.forEach((mark, at) => {
      const path = group.children[at * 2]!;
      const ring = group.children[at * 2 + 1]!;
      path.setAttribute("d", mark.path);
      ring.setAttribute("x", String(mark.ring.x));
      ring.setAttribute("y", String(mark.ring.y));
      ring.setAttribute("width", String(mark.ring.width));
      ring.setAttribute("height", String(mark.ring.height));
      ring.setAttribute("rx", String(mark.ring.radius));
    });
  });
}

export const mountAnnotated = createConnectMount({
  key: "annotated",
  rootSelector,
  connect: connectAnnotated,
});
