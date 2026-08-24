/*
 * THE SAFE AREA: the corridor between a submenu trigger and its submenu, made real.
 *
 * @zag-js/menu already computes a "safety triangle" (`context.intentPolygon`), and for a while this
 * system did nothing but draw it. Measured, that polygon does much less than its name suggests, and
 * this module exists because of what the measurement showed.
 *
 * The submenu's `closing` state runs THREE effects at once: `trackPointerMove` (which closes early
 * if a move lands outside the polygon), `trackInteractOutside`, and `waitForCloseDelay`. A flat
 * 100ms timer that sends `DELAY.CLOSE` no matter where the pointer is. So `intentPolygon` can only
 * VETO an early close during those 100ms; it cannot extend them. Parking the pointer motionless
 * well INSIDE the polygon and touching nothing else, the submenu still closed at ~90ms and the
 * parent's `pointerRoutingMode` fell back to "interactive": no pointer move ever happened, so the
 * only thing that could have closed it is the fuse. `closing` is left only by `MENU_POINTERENTER`,
 * i.e. by the pointer physically reaching the submenu's own content. A reader crossing a sibling
 * row on the way there loses the submenu unless their hand makes the whole trip in under 100ms.
 *
 * The fix is not more geometry, it is the geometry the reader's browser already enforces for free:
 * `pointerleave` does not fire while the pointer is over a DESCENDANT of the element it left. So
 * the safe area is a real element INSIDE the trigger, covering the triangle the reader is about to
 * cross. Crossing it, the trigger is never left, `TRIGGER_POINTERLEAVE` never fires, the fuse is
 * never lit, and the sibling rows underneath never see a `pointermove` to steal the highlight with -
 * one mechanism instead of a close race and a highlight race fought separately. This is what
 * "counts as part of the parent element" has to mean to a browser.
 *
 * Three measured details it depends on:
 *
 *   - `position: fixed` escapes `.sk-menu__content`'s `overflow: auto` (nothing on the path
 *     establishes a containing block for fixed in either binding. Probed on the real page), and
 *     being out of flow it is NOT a grid item, so dropping it inside the trigger's own
 *     `display: grid` costs the trigger no layout.
 *   - `clip-path` clips HIT TESTING, not just paint. That is what makes this a triangle rather than
 *     a blanket: pointing at the submenu keeps the submenu, while moving straight DOWN off the
 *     trigger exits the shape within a few px and the row underneath answers normally
 *     (`elementFromPoint` inside the triangle returns the safe area; two px below the apex it
 *     returns the item's own label).
 *   - `.sk-menu__item` is `isolation: isolate`, so the safe area is trapped in the TRIGGER's
 *     stacking context and later sibling rows would paint over it. The trigger therefore carries
 *     `data-sk-menu-safe-area` while the shape is mounted, and menu.css raises it for exactly that
 *     long. The attribute is the mechanism, not a styling hook.
 */

export interface SafeAreaPoint {
  x: number;
  y: number;
}

/** Just the four numbers this needs; any `DOMRect` satisfies it. */
export interface SafeAreaRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SafeAreaShape {
  left: number;
  top: number;
  width: number;
  height: number;
  /** `polygon(...)`, in percentages of the box above, so the box and the shape can never disagree. */
  clipPath: string;
}

/**
 * Pulls the apex this far back INTO the trigger, away from the submenu. The triangle at any x
 * between apex and base widens as the apex moves further from the base, so a few px of bleed buys
 * tolerance for the first pointer sample after the boundary, which is never exactly on it. Zag's
 * own `setIntentPolygon` bleeds by 5 for the same reason; this stays under a single item's height
 * so the shape never reaches back across the whole trigger.
 */
const SAFE_AREA_BLEED = 4;

/**
 * The pointer has to stop somewhere. While it keeps moving inside the safe area the shape stays
 * (every `pointermove` re-arms this), but a hand that has come to rest is no longer travelling to
 * the submenu, and leaving the shape mounted would leave the row underneath unreachable. Including
 * unclickable, which is the one failure a reader cannot work around. 300ms is comfortably longer
 * than the pause inside a real diagonal (a crossing samples continuously) and short enough that a
 * reader who changed their mind does not notice the row was ever held.
 */
export const MENU_SAFE_AREA_DWELL_MS = 300;

/**
 * The triangle from `pointer` to the submenu's near edge, or `null` when there is nothing to bridge:
 * a submenu that is not beside its trigger at all (a flip to block-start/end, which the placement
 * this system asks for never produces, but a caller may), or a pointer already level with the near
 * edge, where the corridor has no width and the browser's own boundary events suffice.
 *
 * The near edge is chosen by COMPARING the two rects rather than by reading a placement string, so
 * RTL and a `flip-inline` are the same code path: whichever side the submenu actually came out on
 * is the side the reader is actually crossing to.
 */
export function safeAreaShape(
  pointer: SafeAreaPoint,
  trigger: SafeAreaRect,
  submenu: SafeAreaRect,
): SafeAreaShape | null {
  let nearX: number;
  let towardEnd: boolean;
  if (submenu.left >= trigger.right) {
    nearX = submenu.left;
    towardEnd = true;
  } else if (submenu.right <= trigger.left) {
    nearX = submenu.right;
    towardEnd = false;
  } else return null;

  /*
   * Which way the corridor runs is a fact about the two RECTS, never about the pointer: deriving it
   * from the pointer instead reverses the bleed the moment the pointer reaches the near edge, and
   * builds the shape on the submenu's side of it. The pointer's only say is whether it is still on
   * the trigger's side at all. Once it is not, there is no corridor left to bridge.
   */
  if (towardEnd ? pointer.x >= nearX : pointer.x <= nearX) return null;
  const apexX = pointer.x + (towardEnd ? -SAFE_AREA_BLEED : SAFE_AREA_BLEED);

  const left = Math.min(apexX, nearX);
  const top = Math.min(pointer.y, submenu.top);
  const width = Math.abs(nearX - apexX);
  /* Zero only before the submenu has been laid out, which a pointermove can beat. */
  const height = Math.max(pointer.y, submenu.bottom) - top;
  if (height < 1) return null;

  const pct = (x: number, y: number) =>
    `${(((x - left) / width) * 100).toFixed(3)}% ${(((y - top) / height) * 100).toFixed(3)}%`;
  const clipPath = `polygon(${pct(apexX, pointer.y)},${pct(nearX, submenu.top)},${pct(nearX, submenu.bottom)})`;

  return { left, top, width, height, clipPath };
}

export interface MenuSafeAreaOptions {
  /** Fires when the safe area starts and stops holding the pointer, for the debug readout. */
  onHoldChange?: (holding: boolean) => void;
  /** Paints the shape (`debugSafetyTriangle`). The element IS the mechanism, so it is also the picture. */
  debug?: boolean;
  dwellMs?: number;
  doc?: Document;
}

export interface MenuSafeAreaHandle {
  /**
   * Call on every mouse `pointermove` over the trigger WHILE the submenu is open. Aiming has to
   * happen before the pointer leaves, not after: an element created in response to `pointerleave`
   * arrives one event too late, with the fuse already lit.
   *
   * Ignored while the pointer is inside the shape. The apex freezes at the crossing point instead
   * of trailing the pointer, which is what keeps the reader from dragging the protected region
   * around with them.
   */
  aim(pointer: SafeAreaPoint, submenu: SafeAreaRect): void;
  /** Unmounts the shape now, keeping the handle usable. Call when the submenu closes. */
  clear(): void;
  destroy(): void;
}

export const menuSafeAreaAttr = "data-sk-menu-safe-area";

/*
 * `position: fixed` is normally viewport-relative, which is the whole reason this module can build
 * the shape from `getBoundingClientRect()` (always viewport coordinates) and hand it straight to
 * `left`/`top`. That stops being true the instant an ANCESTOR gets a `transform` (also `filter`,
 * `perspective`, `contain: paint|layout|strict|content`, `will-change: transform`, or
 * `backdrop-filter`): CSS then makes that ancestor the containing block for every `position: fixed`
 * descendant, this span included. A parent menu placed by the machine's own fallback (`strategy:
 * "fixed"`, written as `transform: translate3d(var(--x), var(--y), 0)`: `@zag-js/popper` always
 * positions this way, there is no plain-`top`/`left` mode to opt into) is exactly such an ancestor
 * whenever this trigger's own submenu sits in a tree that fell back to it. Measured against a live
 * nested Menu: the shape's `left`/`top` came out correct in viewport terms and rendered dozens of
 * pixels off. The same offset as the hijacking ancestor's own on-screen position, because the
 * browser was resolving them against ITS box, not the viewport this module assumed.
 */
function fixedContainingBlockOrigin(from: HTMLElement, doc: Document): SafeAreaPoint {
  const view = doc.defaultView;
  let node = from.parentElement;
  while (node && node !== doc.body) {
    const style = view?.getComputedStyle(node);
    if (
      style &&
      (style.transform !== "none" ||
        style.filter !== "none" ||
        style.perspective !== "none" ||
        style.backdropFilter !== "none" ||
        style.willChange.includes("transform") ||
        /paint|layout|strict|content/.test(style.contain))
    ) {
      const rect = node.getBoundingClientRect();
      return { x: rect.left, y: rect.top };
    }
    node = node.parentElement;
  }
  return { x: 0, y: 0 };
}

export function createMenuSafeArea(
  trigger: HTMLElement,
  options: MenuSafeAreaOptions = {},
): MenuSafeAreaHandle {
  const doc = options.doc ?? trigger.ownerDocument ?? document;
  const dwellMs = options.dwellMs ?? MENU_SAFE_AREA_DWELL_MS;
  let el: HTMLSpanElement | null = null;
  let holding = false;
  let dwellTimer: ReturnType<typeof setTimeout> | null = null;
  let lastClip = "";
  /*
   * Resolved once per mount, not per `aim()` (the highest-frequency call this module gets): the
   * ancestor that hijacks `position: fixed` for this trigger does not change while the submenu stays
   * open, only whether the shape itself is currently mounted.
   */
  let origin: SafeAreaPoint | null = null;

  const setHolding = (next: boolean) => {
    if (holding === next) return;
    holding = next;
    options.onHoldChange?.(next);
  };

  const stopDwell = () => {
    if (dwellTimer != null) clearTimeout(dwellTimer);
    dwellTimer = null;
  };

  const armDwell = () => {
    stopDwell();
    dwellTimer = setTimeout(clear, dwellMs);
  };

  function mount(): HTMLSpanElement {
    if (el) return el;
    const node = doc.createElement("span");
    node.className = "sk-menu__safe-area";
    node.setAttribute("aria-hidden", "true");
    if (options.debug) node.setAttribute("data-debug", "");
    node.addEventListener("pointerenter", () => {
      setHolding(true);
      armDwell();
    });
    node.addEventListener("pointermove", armDwell);
    /*
     * Leaving the shape is the END of the crossing, whichever way it went: into the submenu (done,
     * Zag's own `MENU_POINTERENTER` takes over) or back over a sibling row (the reader changed
     * their mind, and the trigger's real `pointerleave` now fires as it always would have). Either
     * way the shape stops existing, and the next `aim()` from the trigger rebuilds it.
     */
    node.addEventListener("pointerleave", clear);
    /* A press is a decision, never a traverse: never let the shape be what a click lands on. */
    node.addEventListener("pointerdown", clear);
    trigger.appendChild(node);
    trigger.setAttribute(menuSafeAreaAttr, "");
    el = node;
    origin = fixedContainingBlockOrigin(trigger, doc);
    return node;
  }

  function clear() {
    stopDwell();
    setHolding(false);
    lastClip = "";
    el?.remove();
    el = null;
    origin = null;
    trigger.removeAttribute(menuSafeAreaAttr);
  }

  return {
    aim(pointer, submenu) {
      if (holding) return;
      const shape = safeAreaShape(pointer, trigger.getBoundingClientRect(), submenu);
      if (!shape) {
        clear();
        return;
      }
      const node = mount();
      /* One string compare instead of five style writes per pointermove, and pointermove is the
       * highest-frequency event this component sees. */
      const clip = `${shape.left},${shape.top},${shape.width},${shape.height},${shape.clipPath}`;
      if (clip === lastClip) return;
      lastClip = clip;
      /* `shape.left`/`.top` are viewport coordinates; `origin` is where this span's ACTUAL
       * containing block sits in the viewport, `{0,0}` when nothing hijacked it. */
      node.style.left = `${shape.left - (origin?.x ?? 0)}px`;
      node.style.top = `${shape.top - (origin?.y ?? 0)}px`;
      node.style.width = `${shape.width}px`;
      node.style.height = `${shape.height}px`;
      node.style.clipPath = shape.clipPath;
    },
    clear,
    destroy: clear,
  };
}
