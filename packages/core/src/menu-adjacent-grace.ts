/*
 * A gap Zag's own safety triangle leaves open.
 *
 * `context.intentPolygon` (menu-intent-overlay.ts) is a narrow diagonal region between the anchor
 * point and the submenu's near edge, built once from the trigger's own `TRIGGER_POINTERMOVE`. It
 * protects a genuine diagonal approach TOWARD the submenu, but a pointer leaving the trigger
 * heading STRAIGHT at the very next item in the list — the single most common way to graze past
 * an open submenu on the way to somewhere else, or just an unsteady hand — falls outside that
 * polygon almost immediately, and `pointerRoutingMode` unlocks the moment it does (measured: a few
 * pointer samples, well before a reader would call that "moving away"). The item below then steals
 * the highlight, and the submenu closes with it, even though the reader's hand is still near the
 * trigger.
 *
 * This is a small, EXTRA hold layered ON TOP of Zag's mechanism, not a replacement for it: while a
 * sibling submenu is open, hovering any OTHER item in the same list holds that item's highlight
 * change for `MENU_ADJACENT_GRACE_MS` before applying it, and drops the hold outright the moment
 * the pointer reaches the open submenu. Neither binding reads or writes `intentPolygon` or
 * `pointerRoutingMode` here; Zag still owns those, and its own diagonal-approach protection keeps
 * working exactly as it did. This only widens the window a LITTLE past the mouse's exact position,
 * in TIME rather than in geometry — which a purely geometric polygon cannot express, because the
 * reader grazing an adjacent row is often still deciding, not yet committed to any direction.
 */

export const MENU_ADJACENT_GRACE_MS = 200;

export interface AdjacentGraceController {
  /**
   * Call on every pointer move over a candidate item (a sibling of an open submenu, not that
   * submenu's own trigger). Re-entrant calls for the SAME item while its hold is already pending
   * are no-ops — the timer is not restarted by pointer jitter. `onElapsed` fires once, after
   * `delay`, unless `cancel` runs first.
   */
  hold(itemValue: string, onElapsed: () => void): void;
  /** Call when the pointer leaves `itemValue`, or reaches the open submenu: drops any hold on it with no commit. */
  cancel(itemValue: string): void;
  /** Call when the submenu closes or the list unmounts: drops whatever hold is pending, if any. */
  reset(): void;
}

export function createAdjacentGraceController(
  delay: number = MENU_ADJACENT_GRACE_MS,
): AdjacentGraceController {
  let pendingValue: string | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function clear() {
    if (timer != null) clearTimeout(timer);
    timer = null;
    pendingValue = null;
  }

  return {
    hold(itemValue, onElapsed) {
      if (pendingValue === itemValue) return;
      clear();
      pendingValue = itemValue;
      timer = setTimeout(() => {
        clear();
        onElapsed();
      }, delay);
    },
    cancel(itemValue) {
      if (pendingValue === itemValue) clear();
    },
    reset: clear,
  };
}

/**
 * Whether SOME submenu among `itemEl`'s own siblings (not a deeper level) is currently open. A
 * plain DOM read rather than a machine query on purpose: it is the one signal both bindings can
 * ask identically, and it is already true the instant Zag paints `data-state="open"`, no separate
 * subscription to keep in sync.
 */
export function hasOpenSubmenuSibling(itemEl: Element): boolean {
  const content = itemEl.closest("[data-sk-menu-content]");
  if (!content) return false;
  return (
    content.querySelector('[data-sk-submenu] [data-sk-menu-content][data-state="open"]') != null
  );
}
