/*
 * ANCHORED, the contract, and deliberately the smallest module in core.
 *
 * Nine components place a box against another element, tooltip, popover, popup, menu and its
 * submenus, select, combobox, date picker, flyout. The PLACEMENT of that box is not JavaScript's
 * job (decision 25): where the browser has CSS Anchor Positioning it lays the box out itself, with
 * `position-try-fallbacks` doing the flip and `position-visibility` handling the lost anchor, both
 * inside the layout engine where that information already lives. Where it does not, the component's
 * Zag machine positions it, because `@zag-js/popper` is already in the tree.
 *
 * So this file contains NO GEOMETRY. It never measures an element, never reads a rect, never runs on
 * scroll. What it owns is the one thing that cannot live in a shared stylesheet: the RELATIONSHIPS
 * between an anchor, the box placed against it and the arrow that points back at the anchor, which
 * are names unique per instance. Everything else, the sides, the gap, the flip, the hiding, is in
 * `patterns/anchored.css`.
 *
 * The two engines must never both run. On the browser path a binding drops the inline `style` that
 * the machine puts on the positioner (`stripPositioningStyle`), and that is what lets the pattern's
 * declarations stay free of `!important`. It is load-bearing rather than tidiness: `position-try`
 * can only flip declarations that are NOT `!important`, so one there would switch the flip off.
 */

/**
 * Which side of the anchor the box asks for, in logical axes like the rest of the system, so they
 * swap themselves in RTL. A REQUEST and not a guarantee: when it does not fit, the browser flips it
 * to the opposite side of the SAME axis. Asking for `inline-end` means wanting the box beside the
 * anchor, so landing above it would be disobedience rather than adaptation.
 */
export type AnchorPlacement = "block-start" | "block-end" | "inline-start" | "inline-end";

export const anchorPlacements = [
  "block-start",
  "block-end",
  "inline-start",
  "inline-end",
] as const satisfies readonly AnchorPlacement[];

export function isAnchorPlacement(value: unknown): value is AnchorPlacement {
  return typeof value === "string" && (anchorPlacements as readonly string[]).includes(value);
}

/**
 * Zag's placements are PHYSICAL; ours are logical. Only the JS fallback needs the translation, on
 * the browser path `position-area` is already logical and resolves against the writing direction
 * with nobody translating anything.
 */
export const anchorPlacementToZag = {
  "block-start": "top",
  "block-end": "bottom",
  "inline-start": "left",
  "inline-end": "right",
} as const satisfies Record<AnchorPlacement, string>;

/*
 * Two flat classes, not a BEM pair: the anchor is not inside the positioner, and in React the
 * positioner is portalled to the body, so nesting one under the other would name a containment that
 * does not exist. They compose with the component's own parts the way `sk-interactive` composes with
 * `sk-button`: `class="sk-tooltip__trigger sk-anchor"`, `class="sk-tooltip__positioner sk-anchored"`.
 */
export const anchoredParts = {
  /** The element the box is placed against. Carries `anchor-name`. */
  anchor: "sk-anchor",
  /** The box being placed. Carries `position-anchor` and everything else. */
  positioner: "sk-anchored",
  /**
   * OPTIONAL. A rotated square poking out of the box toward the anchor, authored as a child of the
   * positioner. Absent unless the markup asks for it: a tooltip or a popover wants one because it is
   * floating chrome that has to say WHICH control it is talking about; a menu or a select does not,
   * because a shared edge already says it. Decorative, so it is always `aria-hidden`.
   *
   * It comes out of the ANCHOR, not out of the box's centre, so it is an anchored box in its own
   * right even though it lives inside the positioner. What makes that possible is `position: fixed`:
   * the spec only lets an element use an anchor that descends from its CONTAINING BLOCK, and the
   * trigger does not descend from the positioner, but a fixed box is contained by the viewport,
   * where the trigger does live. With `absolute` the containing block would be the positioner and
   * every anchor reference would be invalid, silently. The geometry is in `patterns/anchored.css`.
   */
  arrow: "sk-anchored-arrow",
} as const;

export type AnchoredPart = keyof typeof anchoredParts;
export type AnchoredPartClass = (typeof anchoredParts)[AnchoredPart];

export const anchoredAttrs = {
  /**
   * The requested placement. Authored on a component's root where that is convenient, but it must
   * END UP on the positioner, which is where the stylesheet reads it: React portals the positioner
   * to the body, and inheritance from the root does not reach it there.
   */
  placement: "data-sk-placement",
} as const;

/**
 * The styling hooks the pattern publishes. `name` is the odd one: it is written by a binding rather
 * than authored, because it must differ per instance.
 */
export const anchoredHooks = {
  /** The dashed-ident tying one anchor to one positioner. Set on BOTH elements. */
  name: "--sk-anchored-name",
  /**
   * The dashed-ident naming the POSITIONER itself, so its arrow can measure it. The arrow reads only
   * its SIZE (`anchor-size()`), never its position: a size cannot go stale on scroll, and Blink does
   * not re-resolve one anchored element against another during a scroll-only update.
   */
  boxName: "--sk-anchored-box-name",
  /** The gap to the anchor. One hook, because a flip changes the SIDE but not the gap. */
  offset: "--sk-anchored-offset",
  /** `auto` by default; `anchor-size(width)` is how Select matches its trigger's width. */
  size: "--sk-anchored-size",
  /** Escape hatch for a placement outside the four, such as a submenu's `inline-end span-block-end`. */
  positionArea: "--sk-anchored-position-area",
  positionTry: "--sk-anchored-position-try",
  /** The arrow's side, and its two colors. A component re-declares these; consumers rarely do. */
  arrowSize: "--sk-anchored-arrow-size",
  arrowBg: "--sk-anchored-arrow-bg",
  arrowBorderColor: "--sk-anchored-arrow-border-color",
  /**
   * How far the arrow's centre stays clear of the box's corner, so a diamond never lands on the
   * rounded part. Defaults to one and a half times the arrow, which clears a control-sized radius.
   */
  arrowInset: "--sk-anchored-arrow-inset",
} as const;

/**
 * Is the browser the positioning engine here? When false, the component's machine is, and a binding
 * must leave the machine's inline styles alone.
 */
export function supportsAnchorPositioning(): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("anchor-name: --a")
  );
}

/**
 * A dashed-ident unique to one instance, derived from an id the component already has. Zag's
 * generated ids carry `:` and consumers author anything, so everything outside `[A-Za-z0-9_-]`
 * folds to `-`; collisions are impossible in practice because the id was already unique.
 */
export function anchorNameFor(id: string): string {
  return `--sk-anchor-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

/**
 * The same, for the POSITIONER's own name, which its arrow measures. A second per-instance ident and
 * not `anchor-scope` on one shared name: two positioners open at once (a menu and its submenu) would
 * both answer to it, and each arrow has to measure ITS box.
 */
export function anchorBoxNameFor(id: string): string {
  return boxNameFrom(anchorNameFor(id));
}

const boxNameFrom = (name: string) => `${name}-box`;

/**
 * Wire one anchor to one positioner, and hand back the undo.
 *
 * The names go on BOTH elements as custom properties rather than being inherited from a common
 * ancestor: there is no common ancestor once React portals the positioner to the body. An arrow
 * inside the positioner needs both names too, and gets them by inheritance, which is one more reason
 * it is authored in there. Idempotent, so a binding that re-runs it on every render, which is what it
 * must do when the machine rewrites the positioner's inline style, costs nothing.
 */
export function bindAnchor(
  anchor: HTMLElement,
  positioner: HTMLElement | null | undefined,
  name: string,
): () => void {
  anchor.style.setProperty(anchoredHooks.name, name);
  positioner?.style.setProperty(anchoredHooks.name, name);
  positioner?.style.setProperty(anchoredHooks.boxName, boxNameFrom(name));

  return () => {
    anchor.style.removeProperty(anchoredHooks.name);
    positioner?.style.removeProperty(anchoredHooks.name);
    positioner?.style.removeProperty(anchoredHooks.boxName);
  };
}

/**
 * Drop a machine's `style` from its positioner props so it stops positioning, used on the browser
 * path only. Attributes it also owns, id, dir, hidden, are kept: the machine still runs the popup,
 * it just does not place it.
 */
export function stripPositioningStyle<T extends Record<string, unknown>>(props: T): Omit<T, "style"> {
  const { style: _style, ...rest } = props;
  return rest;
}
