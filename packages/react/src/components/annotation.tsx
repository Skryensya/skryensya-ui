import {
  ANNOTATION_RING_DISTANCE,
  ANNOTATION_RING_RADIUS,
  annotationHitIndex,
  annotationParts,
  annotationRingInset,
  annotationTranslate,
  watchAnnotationSpecimenFocus,
  placeAnnotations,
  readAnnotationTranslate,
  type AnnotationBox,
  type AnnotationDirection,
  type AnnotationMeasurement,
  type AnnotationMatch,
  type AnnotationMobileAlign,
  type AnnotationPlacement,
  type AnnotationRingPlacement,
  type AnnotationSide,
} from "@skryensya/core/annotation";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/* Matches annotation.css: mobile turns the four gutters into two stacked label groups. */
const stackedLabelsQuery = "(max-width: 40rem)";

/** One label: what it says, what it points at, and which margin it asks for. */
export type AnnotationEntry = {
  /** A CSS selector, resolved inside the subject. The first match wins. */
  for: string;
  /** The margin it asks for. A request; where it lands is what decides the leader. Default `inline-start`. */
  side?: AnnotationSide;
  /** Cross-axis alignment after narrow screens stack labels above or below the specimen. */
  mobileAlign?: AnnotationMobileAlign;
  /** Whether the selector names the first match or every one. `all` for a genuinely plural name. */
  match?: AnnotationMatch;
  /** This mark's own ring placement, overriding the frame's. For the part unlike its neighbours. */
  ringPlacement?: AnnotationRingPlacement;
  /** The same, for the distance. */
  ringDistance?: number;
  /** The same, for the corner radius. */
  ringRadius?: number;
  children: ReactNode;
};

export type AnnotatedProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** What is being diagrammed. Any composition; the frame never looks inside it. */
  subject: ReactNode;
  annotations: readonly AnnotationEntry[];
  /** Names the diagram, and makes the frame a `group`. Required when `inert` is set. */
  label?: string;
  /** The subject is a specimen: no pointer, no focus, out of the accessibility tree. Default on. */
  inert?: boolean;
  /** Which side of a part's own edge its ring is drawn on. Default `inset`. */
  ringPlacement?: AnnotationRingPlacement;
  /** How far from that edge, in px. Default 2. */
  ringDistance?: number;
  /** The corner radius every ring is drawn with. Default 6. */
  ringRadius?: number;
};

/*
 * ANNOTATED: the React half of the same contract the Vanilla enhancer connects to.
 *
 * It copies `connectAnnotated` rather than improving on it (the rule for every family whose two
 * bindings must stay one behaviour), and both of them are thin for the same reason: the geometry is
 * `@skryensya/core/annotation`'s, and what is left here is measuring rectangles and assigning the
 * strings that come back.
 *
 * The one thing React has to be careful about that the enhancer does not: this measures in an effect
 * and stores the result in state, so a pass that decided nothing new must not set state, or the
 * render it triggers schedules another pass and the component spins. `samePlacements` is that guard,
 * and it is also why the observer can safely watch every label: `translate` changes no box, so a
 * pass that only moves labels never wakes the observer again.
 *
 * THE OFFSET ALREADY PAINTED IS READ OFF THE ELEMENT, never held here. A measuring pass has to
 * subtract it to recover a label's flow box, and keeping it in a ref beside the state looks
 * equivalent and is not: the ref updates during the pass while the element only moves at the next
 * commit, so ANY pass in between subtracts an offset the layout does not have. That is not
 * theoretical, it is what the symmetry gate caught. `document.fonts.ready` resolves in exactly that
 * window, and the block-start label came out 224px away from where the Vanilla enhancer put it, on
 * the same tree at the same width. The element is the only record that is never early and never
 * stale.
 */
export function Annotated({
  annotations,
  className,
  inert = true,
  label,
  ringDistance = ANNOTATION_RING_DISTANCE,
  ringPlacement = "inset",
  ringRadius = ANNOTATION_RING_RADIUS,
  subject,
  ...props
}: AnnotatedProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [placements, setPlacements] = useState<readonly AnnotationPlacement[]>([]);
  /*
   * WHICH MARK IS BEING READ. One at a time: a diagram showing every ring at once is a cage over the
   * specimen, and the ring's whole job is to answer "which part is this name about?", which is a
   * question about ONE name.
   *
   * The pairing is done here rather than in CSS because no selector can express it: a label and its
   * mark live in different subtrees (grid items versus one overlay spanning the frame), so `:hover`
   * on one cannot reach the other, and `:has()` only ever selects an ancestor of what it matches.
   */
  const [active, setActive] = useState<number | null>(null);

  /*
   * THE TARGETS ARE OBSERVED TOO, and leaving them out was a real bug. A part can change size without
   * its container changing size at all: an accordion's `sk-tile__chevron` is an empty
   * `[data-sk-icon]` placeholder when the enhancers run and a 40px `<svg>` one frame later, inside a
   * grid cell that was already that wide. The subject's box never moves, no resize fires, and the
   * chevron keeps the 0x0 box it had at first measurement: dropped as unpointable, its label left in
   * the gutter with no ring and no leader for the life of the page.
   *
   * A ref rather than a value, because the measuring pass is what discovers the targets and the
   * observer is what they have to be handed to; the two are created in the other order.
   */
  const watchTarget = useRef<((element: Element, index: number) => void) | null>(null);
  const hitTargets = useRef<{ element: Element; index: number }[]>([]);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const subjectElement = subjectRef.current;
    if (!root || !subjectElement) return;
    const stacked = window.matchMedia(stackedLabelsQuery).matches;

    const rect = root.getBoundingClientRect();
    /* `inset: 0` on the overlay resolves against the PADDING box, which is the border box shifted in
       by the border itself: one origin for the measurements and for the path data. */
    const originX = rect.left + root.clientLeft;
    const originY = rect.top + root.clientTop;
    const relative = (element: Element): AnnotationBox => {
      const box = element.getBoundingClientRect();
      return { x: box.left - originX, y: box.top - originY, width: box.width, height: box.height };
    };

    const measurements: AnnotationMeasurement[] = annotations.map((annotation, index) => {
      const element = labelRefs.current[index];
      const live = element
        ? relative(element)
        : ({ x: 0, y: 0, width: 0, height: 0 } satisfies AnnotationBox);
      const offset = readAnnotationTranslate(element?.style.translate);
      const found = findTargets(subjectElement, annotation.for, annotation.match === "all");
      for (const element of found) watchTarget.current?.(element, index);
      /* An override stays an override: a label setting neither defers to the frame entirely. */
      const overridden =
        annotation.ringPlacement !== undefined || annotation.ringDistance !== undefined
          ? annotationRingInset(
              annotation.ringPlacement ?? ringPlacement,
              annotation.ringDistance ?? ringDistance,
            )
          : undefined;
      return {
        side: annotation.side ?? "inline-start",
        ringInset: overridden,
        ringRadius: annotation.ringRadius,
        label: { ...live, x: live.x - offset.x, y: live.y - offset.y },
        targets: found.map(relative),
      };
    });

    /*
     * A FRAME WITH NO BOX IS NOT MEASURED AT ALL. A diagram inside a closed tab panel reports every
     * rectangle as zero; every label then wants the same spot, the overflow branch packs them in
     * authoring order, and those offsets become the flow positions the next pass subtracts, so the
     * first real measurement is wrong by exactly the garbage the first one wrote. Becoming visible
     * is a resize, and the observer is already watching for one.
     */
    const subjectBox = relative(subjectElement);
    if (subjectBox.width === 0 && subjectBox.height === 0) return;

    const direction: AnnotationDirection =
      getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr";
    const next = placeAnnotations(measurements, subjectBox, {
      direction,
      ringInset: annotationRingInset(ringPlacement, ringDistance),
      ringRadius,
      distribute: !stacked,
      leaderRoute: stacked ? "right-elbow" : "direct",
    });

    setPlacements((current) => (samePlacements(current, next) ? current : next));
  }, [annotations, ringDistance, ringPlacement, ringRadius]);

  useEffect(() => {
    const root = rootRef.current;
    const subjectElement = subjectRef.current;
    if (!root || !subjectElement) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    observer.observe(subjectElement);
    for (const element of labelRefs.current) if (element) observer.observe(element);

    /* Observed lazily, as each pass resolves them, because a selector can match something that was
       not in the document when the effect ran. Observing fires the callback once immediately, which
       costs exactly one extra pass: the next finds nothing new and decides the same thing, so the
       state guard writes nothing and it stops there. */
    const watched = new WeakSet<Element>();
    hitTargets.current = [];
    watchTarget.current = (element, index) => {
      if (watched.has(element)) return;
      watched.add(element);
      hitTargets.current.push({ element, index });
      observer.observe(element);
    };

    /*
     * A child can reveal a target without resizing its specimen. Breadcrumb does exactly that when
     * it inserts its collapse trigger and toggles `hidden` on the middle crumbs.
     */
    const mutations = new MutationObserver(measure);
    mutations.observe(subjectElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-hidden", "hidden"],
    });
    const unwatchFocus = inert ? watchAnnotationSpecimenFocus(subjectElement) : () => {};

    /*
     * Hovering a named part: the specimen is `inert`, so targets never receive pointer events.
     * Listen on the frame and hit-test target boxes; the smallest containing box wins. Skip when
     * the pointer is over a label — those handlers own the reveal themselves.
     */
    const onFramePointer = (event: PointerEvent): void => {
      if ((event.target as Element | null)?.closest?.(`.${annotationParts.label}`)) return;
      const hit = annotationHitIndex(
        { x: event.clientX, y: event.clientY },
        hitTargets.current.map(({ element, index }) => {
          const box = element.getBoundingClientRect();
          return { index, box: { x: box.left, y: box.top, width: box.width, height: box.height } };
        }),
      );
      setActive(hit);
    };
    const onFrameLeave = (): void => setActive(null);
    root.addEventListener("pointermove", onFramePointer);
    root.addEventListener("pointerleave", onFrameLeave);

    /* One more pass once the webfonts land: they move every label and every leader by a few pixels,
       which in a drawing reads as a mistake rather than as a reflow. */
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });

    measure();
    return () => {
      cancelled = true;
      observer.disconnect();
      mutations.disconnect();
      unwatchFocus();
      root.removeEventListener("pointermove", onFramePointer);
      root.removeEventListener("pointerleave", onFrameLeave);
      watchTarget.current = null;
      hitTargets.current = [];
    };
  }, [inert, measure]);

  return (
    <div
      {...props}
      aria-label={label}
      className={cx(annotationParts.root, className)}
      ref={rootRef}
      /* Only when there is a name for it: an unnamed group is one more level a screen reader
         announces and nobody asked for. */
      role={label ? "group" : undefined}
    >
      <div className={annotationParts.subject} inert={inert} ref={subjectRef}>
        {subject}
      </div>
      {annotations.map((annotation, index) => {
        const placement = placements[index];
        return (
          <span
            className={annotationParts.label}
            data-for={annotation.for}
            data-match={annotation.match}
            data-ring-distance={annotation.ringDistance}
            data-ring-placement={annotation.ringPlacement}
            data-ring-radius={annotation.ringRadius}
            data-mobile-align={annotation.mobileAlign}
            data-side={annotation.side ?? "inline-start"}
            data-sk-active={index === active ? "" : undefined}
            data-sk-side={placement?.side}
            key={`${annotation.for}-${index}`}
            /* Focusable so the reveal is reachable without a pointer; see the contract's own note
               on this attribute for why a tab stop per label is worth it. */
            tabIndex={0}
            onBlur={() => setActive((current) => (current === index ? null : current))}
            onFocus={() => setActive(index)}
            /* `pointerEnter`/`pointerLeave` rather than `mouseOver`/`mouseOut`: they do not fire
               again as the pointer crosses the bubble's own text node, which would otherwise
               flicker the ring on every character boundary. */
            onPointerEnter={() => setActive(index)}
            onPointerLeave={() => setActive((current) => (current === index ? null : current))}
            ref={(element) => {
              labelRefs.current[index] = element;
            }}
            style={placement ? { translate: annotationTranslate(placement.translate) } : undefined}
          >
            {annotation.children}
          </span>
        );
      })}
      {/* Empty until something has been measured, exactly as the authored markup is empty until the
          enhancer runs: every number in here is a measurement, so there is nothing to render first.
          ONE `<g>` PER LABEL once it has, including labels with nothing to point at, so the reveal
          can pair a label with its mark by index; see `drawLeaders` in the Vanilla enhancer for
          what a shorter list costs. The index is the key because the marks ARE an ordered drawing. */}
      <svg aria-hidden="true" className={annotationParts.leaders} focusable="false">
        {placements.map((placement, index) => (
          <g
            className={annotationParts.mark}
            data-sk-active={index === active ? "" : undefined}
            key={index}
          >
            {/* Two elements per thing named, because one label can name several: a breadcrumb's
                crumbs are all `sk-breadcrumb__item`. A Fragment and not a nested `<g>`, to match
                what the enhancer appends. */}
            {placement.marks.map((mark, at) => (
              <Fragment key={at}>
                <path className={annotationParts.leader} d={mark.path} />
                <rect
                  className={annotationParts.ring}
                  height={mark.ring.height}
                  rx={mark.ring.radius}
                  width={mark.ring.width}
                  x={mark.ring.x}
                  y={mark.ring.y}
                />
              </Fragment>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * The elements a label points at: first match or every match when the label asked for `all`. A
 * target may itself be `aria-hidden` (a decorative separator is still a drawable part), but a target
 * inside an accessibility-hidden measurement copy is excluded.
 *
 * Scoped for a reason that bites in exactly this component's home: a diagram documenting a component
 * is usually rendered on a page that USES that component, so a bare `.sk-tile__trigger` would find
 * one in the page chrome and draw a leader off the edge of the frame. An invalid selector costs that
 * one label its leaders rather than throwing through the render.
 */
function findTargets(subject: HTMLElement, selector: string, all: boolean): Element[] {
  if (!selector) return [];
  try {
    const matches = [...subject.querySelectorAll(selector)].filter(
      (target) => !target.closest("[hidden]") && !target.parentElement?.closest('[aria-hidden="true"]'),
    );
    return all ? matches : matches.slice(0, 1);
  } catch {
    return [];
  }
}

function samePlacements(
  a: readonly AnnotationPlacement[],
  b: readonly AnnotationPlacement[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (placement, index) =>
      placement.side === b[index]!.side &&
      placement.translate.x === b[index]!.translate.x &&
      placement.translate.y === b[index]!.translate.y &&
      placement.marks.length === b[index]!.marks.length &&
      placement.marks.every((mark, at) => {
        const other = b[index]!.marks[at]!;
        return (
          mark.path === other.path &&
          mark.ring.x === other.ring.x &&
          mark.ring.y === other.ring.y &&
          mark.ring.width === other.ring.width &&
          mark.ring.height === other.ring.height &&
          mark.ring.radius === other.ring.radius
        );
      }),
  );
}
