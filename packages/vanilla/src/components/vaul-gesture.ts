import type { VaulEdge } from "@skryensya/core/vaul";

/*
 * VAUL, the gesture logic, pure.
 *
 * The whole job of drag-to-dismiss is answering one question at pointerup: was that a dismissal? That
 * answer is a pure function of the samples and a few numbers, no DOM, no pointer capture, no CSS reads
 * but it used to live inline inside the 305-line `connectVaul` closure, over mutable state, reachable
 * only through synthetic PointerEvents. Pulling it here gives it a test surface: feed samples, assert
 * the verdict (see vaul-gesture.test.ts). The DOM shell in vaul.ts keeps the plumbing and calls in.
 *
 * Three things decide it, and each exists because leaving it out is what makes a sheet feel cheap:
 *   distance, dragged far enough that letting go can only have meant "go away".
 *   velocity, a flick is an intent on its own, measured over the last frames only.
 *   direction, a flick BACK is a change of mind, and it beats distance.
 */

/** A position sample: when it was taken, and the drag offset at that moment. */
export type Sample = { at: number; at_offset: number };

/** Velocity is measured over the LAST few frames only, a flick is a statement about the last instant
 * of a gesture, not its whole duration. Averaging from pointerdown makes a real throw undetectable the
 * moment it is preceded by anything slow. */
export const VELOCITY_WINDOW = 100; // ms

/**
 * How the drag axis and its sign fall out of the edge. The CSS keeps the offset positive, so this is
 * the only place the geometry is known, and RTL flips only the inline edges.
 */
export function axisOf(edge: VaulEdge, rtl: boolean) {
  if (edge === "block-end") return { axis: "y" as const, sign: 1 };
  const startward = edge === "inline-start";
  // dragging an inline-start panel closed means moving LEFT (negative x), unless RTL mirrors it
  return { axis: "x" as const, sign: startward === rtl ? 1 : -1 };
}

/**
 * How far the panel gives when it is pulled the wrong way, away from its edge, into the viewport.
 *
 * It must give SOMETHING, or it reads as broken: the finger keeps moving and the thing under it does
 * not. So: resistance, capped. The curve leaves at 1∶1 under the fingertip (f'(0) = 1, no dead zone)
 * and bends asymptotically to the cap, so pulling harder yields less and less and never more than a few
 * pixels. `cap` is the CSS's `--sk-vaul-overpull`, read rather than restated, so the two agree.
 */
export const resist = (distance: number, cap: number) => cap * (1 - Math.exp(-distance / cap));

/** The parameters the dismissal verdict needs, everything the DOM shell measured. */
export type DismissParams = {
  /** Signed offset the panel ended at: positive toward the edge, negative for an over-pull. */
  travelled: number;
  /** The panel's extent along the drag axis, in px. */
  size: number;
  /** Fraction of `size` past which distance alone dismisses (default 0.4). */
  threshold: number;
  /** px/ms past which a flick dismisses, and, negated, a flick back home vetoes (default 0.5). */
  velocity: number;
};

/**
 * Was that release a dismissal? Pure: samples and numbers in, boolean out.
 *
 * A flick toward the edge OR a far-enough drag dismisses, but a flick BACK toward the edge overrules
 * both, because the hand's last word is its actual word. `speed` is px/ms over the tail of the gesture,
 * signed the same way `travelled` is (positive = toward the edge, i.e. toward dismissal).
 */
export function decideDismiss(samples: Sample[], { travelled, size, threshold, velocity }: DismissParams): boolean {
  if (samples.length === 0) return false;
  const first = samples[0];
  const last = samples[samples.length - 1];
  const span = last.at - first.at;
  const speed = span > 0 ? (last.at_offset - first.at_offset) / span : 0;

  const flicked = speed > velocity;
  const far = size > 0 && travelled / size > threshold;
  const caught = speed < -velocity; // a flick back home overrules distance
  return !caught && (flicked || far);
}
