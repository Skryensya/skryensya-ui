/*
 * SPLITTER — the shared "Window Splitter" behaviour (WAI-ARIA APG), the pure matcher and constants
 * every drag-to-resize handle in this system shares: Sidebar's rail edge, Treegrid's column
 * boundaries, and any Table that wants resizable columns too. Same three-way split every behaviour
 * here already uses (`hotkey.ts`'s own banner comment): the pure matcher here, the imperative
 * binding in `@skryensya/vanilla`, the declarative hook in `@skryensya/react`.
 *
 * WAI's pattern: `role="separator"`, `aria-orientation`, Left/Right move it, Shift+Left/Right moves
 * it FARTHER per keystroke, Home/End jump to the ends of its travel, Enter (and convention, though
 * not the spec: double-click) resets to the default. What "moving it" MEANS is the consumer's own
 * value model, never this file's: Sidebar redistributes one pane against a fixed bound via a CSS
 * `clamp()`; Treegrid redistributes width between two ADJACENT columns whose sum stays fixed. Both
 * are "a splitter", but the arithmetic those two need is genuinely different (one clamps a single
 * value, the other keeps a pair summing to a constant) — this file stays ignorant of which, and only
 * ever hands back a `delta` (or a `home`/`end`/`reset` intent) for the caller to apply however its
 * own value model requires.
 */

/** The one splitter every consumer starts from unless it has a reason not to — Sidebar and Treegrid
 * both do, today. */
export const SPLITTER_DEFAULTS = {
  /** How far, in px, a press must travel before it counts as a drag rather than a click. */
  dragThreshold: 4,
  /** One ArrowLeft/ArrowRight press, in the caller's own delta unit (px, almost always). */
  step: 16,
  /** One Shift+Arrow press. */
  coarseStep: 64,
} as const;

export interface SplitterKeyChord {
  readonly key: string;
  readonly shiftKey?: boolean;
}

export type SplitterKeyAction =
  | { readonly kind: "delta"; readonly delta: number }
  | { readonly kind: "home" }
  | { readonly kind: "end" }
  | { readonly kind: "reset" }
  | { readonly kind: "none" };

/**
 * One keystroke against a splitter, resolved against the caller's own step/coarseStep — Sidebar and
 * Treegrid both currently agree on 16/64, but neither is forced to via {@link SPLITTER_DEFAULTS}.
 * `"home"`/`"end"` mean "the minimum/maximum of this splitter's travel", not a literal direction —
 * resolving what that minimum or maximum IS (a measured bound, `+Infinity` for a clamp to saturate
 * against) is left to the caller, the same way `resolveTreegridKey` leaves "which row is home" to
 * its own.
 */
export function resolveSplitterKey(
  event: SplitterKeyChord,
  options: { readonly step?: number; readonly coarseStep?: number } = {},
): SplitterKeyAction {
  const step = options.step ?? SPLITTER_DEFAULTS.step;
  const coarseStep = options.coarseStep ?? SPLITTER_DEFAULTS.coarseStep;
  const magnitude = event.shiftKey ? coarseStep : step;
  switch (event.key) {
    case "ArrowLeft":
      return { kind: "delta", delta: -magnitude };
    case "ArrowRight":
      return { kind: "delta", delta: magnitude };
    case "Home":
      return { kind: "home" };
    case "End":
      return { kind: "end" };
    case "Enter":
      return { kind: "reset" };
    default:
      return { kind: "none" };
  }
}

/**
 * Whether pointer travel has crossed the drag threshold — the one piece of the "a press ARMS the
 * gesture, only travel past the threshold STARTS it" state machine (Sidebar's own vanilla binding
 * documents the full reasoning) that is pure math, so neither binding restates the constant or the
 * comparison.
 */
export function hasCrossedDragThreshold(
  startX: number,
  currentX: number,
  threshold: number = SPLITTER_DEFAULTS.dragThreshold,
): boolean {
  return Math.abs(currentX - startX) >= threshold;
}

/**
 * A value's position between two bounds, as a 0–100 percentage — what a focusable `role="separator"`
 * reports as `aria-valuenow`: a splitter's position is only meaningful RELATIVE to how far it can
 * travel, and a screen reader hearing a raw pixel count learns nothing from it. Returns 100 for a
 * degenerate range (`max` not greater than `min`) rather than dividing by zero.
 */
export function splitterValuePercent(value: number, min: number, max: number): number {
  if (!(max > min)) return 100;
  const clamped = Math.min(Math.max(value, min), max);
  return Math.round(((clamped - min) / (max - min)) * 100);
}

/**
 * RTL-aware sign for a pointer delta. A drag toward the reader's START is a drag toward LARGER x in
 * LTR and SMALLER x in RTL — every splitter that resizes "whatever sits on the near side of the
 * handle" needs this same flip, read per-gesture (never cached) since a document can change
 * direction under a long-lived component.
 */
export function splitterDirectionSign(direction: "ltr" | "rtl"): 1 | -1 {
  return direction === "rtl" ? -1 : 1;
}

/*
 * ------------------------------------------------------------------------------------------------
 * COLUMN RESIZE — the adjacent-pair value model a resizable TABLE (any table: Treegrid grew this
 * first, a plain Table shares it verbatim) needs, and the one thing the rest of this file
 * deliberately does not know. A handle at index `i` sits BETWEEN column `i` and column `i + 1`;
 * dragging or arrowing it redistributes width between exactly that pair, so the table's own total
 * width never moves and every OTHER column stays exactly where it was — the same reason a
 * spreadsheet's column drag never disturbs a column two over. This is DIFFERENT from Sidebar's own
 * resize, which clamps ONE value against a fixed bound via a CSS `clamp()`: there is no "other pane"
 * to conserve total width with, so Sidebar never needed this half of the file at all.
 * ------------------------------------------------------------------------------------------------
 */

/** No CSS hook for this yet, unlike Sidebar's min/max (that contract's own note explains why those
 * ARE hooks): resizable columns are new, and a floor most columns never approach is a smaller
 * decision than the two bounds a resizable PANEL negotiates. Shared here so no binding restates the
 * number, the same reason {@link SPLITTER_DEFAULTS} lives here too. */
export const SPLITTER_MIN_COLUMN_WIDTH = 60;

/**
 * Redistributes width between column `index` and `index + 1` by `delta` px, clamped so NEITHER
 * column can shrink below `min` — the pair's combined width is invariant, so growing one is exactly
 * shrinking the other. `delta` of `+Infinity`/`-Infinity` (what a splitter's Home/End resolve to)
 * clamps straight to the max/min extent in one step, with no special-casing needed here:
 * `Math.min`/`Math.max` already saturate correctly against infinite input.
 */
export function resolveColumnResize(params: {
  readonly widths: readonly number[];
  readonly index: number;
  readonly delta: number;
  readonly min: number;
}): readonly number[] {
  const { widths, index, delta, min } = params;
  const before = widths[index];
  const after = widths[index + 1];
  if (before === undefined || after === undefined) return widths;
  const total = before + after;
  const nextBefore = Math.min(Math.max(before + delta, min), total - min);
  const result = widths.slice();
  result[index] = nextBefore;
  result[index + 1] = total - nextBefore;
  return result;
}

/*
 * ------------------------------------------------------------------------------------------------
 * COLUMN WEIGHTS — the INITIAL split of a resizable table's width across its columns, distinct from
 * `resolveColumnResize` above (which only ever touches one adjacent pair, after the fact). An equal
 * `total / colCount` split treats a content-heavy column — Treegrid's own hierarchy column, carrying
 * per-level indentation, a disclosure button, AND the row's label — exactly like a flat metadata
 * column next to it, so the heavy column gets squeezed just as hard and truncates first. This is
 * ONLY ever a seed: once mounted, every later drag stays on `resolveColumnResize`'s own adjacent-pair
 * arithmetic, which does not need to know about weights at all.
 * ------------------------------------------------------------------------------------------------
 */

/**
 * Per-column width weights, encoded as one comma-separated attribute value (`columnWeights`'s own
 * `data-column-weights`) since the option system's `type` union has no array member — see
 * `contract.ts`. Returns `null` on anything that cannot become exactly `count` positive weights (a
 * missing attribute, a bad number, the wrong count), the two bindings' own cue to fall back to their
 * own default rather than seed from a half-parsed, possibly wrong-length array.
 */
export function parseColumnWeights(raw: string | null | undefined, count: number): readonly number[] | null {
  if (!raw) return null;
  const weights = raw.split(",").map((part) => Number.parseFloat(part.trim()));
  if (weights.length !== count) return null;
  if (weights.some((weight) => !Number.isFinite(weight) || weight <= 0)) return null;
  return weights;
}

/**
 * Splits `total` px across `weights.length` columns proportionally to `weights`, every column
 * floored at `min` first: `extra` (whatever is left once every column's floor is paid) is the only
 * part handed out by weight, so a heavily-weighted column can never starve a lighter neighbor below
 * the same floor `resolveColumnResize` itself enforces on every later drag. Equal weights reduce to
 * the exact `total / count` split every consumer used before this existed — `min + (total - min *
 * count) / count` simplifies to `total / count` for any `count`.
 */
export function resolveWeightedColumnWidths(params: {
  readonly total: number;
  readonly weights: readonly number[];
  readonly min: number;
}): readonly number[] {
  const { total, weights, min } = params;
  if (weights.length === 0) return [];
  const extra = Math.max(0, total - min * weights.length);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0) || weights.length;
  return weights.map((weight) => min + (extra * weight) / weightSum);
}
