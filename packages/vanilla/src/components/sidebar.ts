import {
  SIDEBAR_WIDTH_PROPERTY,
  sidebarEvents,
  sidebarWidthPercent,
  sidebarWidthPreference,
  type SidebarCollapsedChangeDetails,
  type SidebarOptions,
  type SidebarResizeChangeDetails,
} from "@skryensya/core/sidebar";
import { hasCrossedDragThreshold, resolveSplitterKey, splitterDirectionSign } from "@skryensya/core/splitter";
import { applyAttrs, bindEvents } from "../runtime/apply.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";
import { clearPreference, getPreference, setPreference } from "../storage.js";

const rootSelector = "[data-sk-sidebar]";
const triggerSelector = "[data-sk-sidebar-trigger]";
const contentSelector = "[data-sk-sidebar-content]";
const resizeSelector = "[data-sk-sidebar-resize]";

type Cleanup = () => void;

/*
 * Collapsing narrows the sidebar; it never hides it. That is why this is not a `<details>`
 * disclosure (decision 8): the content stays visible, reachable and in the a11y tree at both
 * widths, so the labels keep naming the icons for a screen reader while sighted users see a rail.
 *
 * The trigger's accessible name is the consumer's, an enhancer patches attributes, never content.
 * The trigger is icon-sized, so that name has to come from an `aria-label` or visually hidden text;
 * a visible label inside it would be a label inside a square the width of an icon.
 *
 * RESIZING is the second, independent behaviour, and it is opt-in by composition: it exists when the
 * consumer authored a resize handle. This function owns the pointer, the keyboard and the storage;
 * the CLAMP is the stylesheet's (`components/sidebar.css`), which is why nothing below reads a
 * minimum or a maximum in order to enforce one. It writes a width, then reads back what the
 * stylesheet allowed.
 */
export function connectSidebar(root: HTMLElement, options: SidebarOptions = {}): Cleanup {
  const trigger = root.querySelector<HTMLButtonElement>(triggerSelector);
  const content = root.querySelector<HTMLElement>(contentSelector);
  const handle = root.querySelector<HTMLElement>(resizeSelector);
  /*
   * One of the two behaviours has to be there. It used to be "a trigger, always", which made a
   * resize-only sidebar (a rail nobody collapses, like a documentation index) impossible to enhance
   * without authoring a control it does not want.
   */
  if (!trigger && !handle) {
    throw new Error("Sidebar requires a [data-sk-sidebar-trigger] or a [data-sk-sidebar-resize] element.");
  }

  const id = options.id ?? (root.id || `sk-sidebar-${Math.random().toString(36).slice(2)}`);
  const isControlled = options.collapsed !== undefined;
  let collapsed = options.collapsed ?? options.defaultCollapsed ?? false;

  if (content && !content.id) content.id = `${id}-content`;

  const render = () => {
    applyAttrs(root, { "data-state": collapsed ? "collapsed" : "expanded" });
    if (!trigger) return;
    applyAttrs(trigger, {
      type: trigger.tagName === "BUTTON" ? "button" : null,
      "aria-expanded": String(!collapsed),
      "aria-controls": content?.id ?? null,
    });
  };

  const setCollapsed = (next: boolean) => {
    collapsed = isControlled ? Boolean(options.collapsed) : next;
    render();

    const details: SidebarCollapsedChangeDetails = { collapsed };
    options.onCollapsedChange?.(details);
    root.dispatchEvent(
      new CustomEvent<SidebarCollapsedChangeDetails>(sidebarEvents.collapsedChange, { bubbles: true, detail: details }),
    );
  };

  const cleanups: Cleanup[] = [];
  if (trigger) cleanups.push(bindEvents(trigger, { click: () => setCollapsed(!collapsed) }));
  if (handle) cleanups.push(connectResize(root, handle, options));

  render();

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

/**
 * The travel available to a drag, in CSS pixels, measured rather than parsed.
 *
 * The bounds are `clamp()` arguments in a stylesheet and can be any length a consumer writes: rem,
 * a percentage of the shell, a `min()` of both. Reading the custom property back gives that authored
 * TEXT ("11rem"), not a number, and re-implementing the CSS length grammar here to turn it into one
 * is how the two bindings would start disagreeing with the stylesheet and each other.
 *
 * So the element is asked instead: push the width past each end and see where it lands. The push
 * happens with the transition suppressed, and the previous value restored, inside one synchronous
 * block, so nothing is ever painted at either extreme.
 */
function measureBounds(root: HTMLElement): { min: number; max: number } {
  const previous = root.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY);
  const wasResizing = root.hasAttribute("data-resizing");

  root.setAttribute("data-resizing", "");
  root.style.setProperty(SIDEBAR_WIDTH_PROPERTY, "0px");
  const min = root.getBoundingClientRect().width;
  root.style.setProperty(SIDEBAR_WIDTH_PROPERTY, "100000px");
  const max = root.getBoundingClientRect().width;

  if (previous) root.style.setProperty(SIDEBAR_WIDTH_PROPERTY, previous);
  else root.style.removeProperty(SIDEBAR_WIDTH_PROPERTY);
  if (!wasResizing) root.removeAttribute("data-resizing");

  return { min, max };
}

function connectResize(root: HTMLElement, handle: HTMLElement, options: SidebarOptions): Cleanup {
  const preference = options.storageKey ? sidebarWidthPreference(options.storageKey) : null;

  /*
   * Bounds passed to the CALL, for a caller that built the element in JavaScript. Authored markup
   * carries them as inline custom properties already (the contract maps both to `styleProperty`, so
   * the emitter writes them), which is why this is a patch and not a requirement: it writes only
   * what it was given, and a sidebar configured either way ends up with the same two properties on
   * the same element.
   */
  if (options.minInlineSize) root.style.setProperty("--sk-sidebar-min-inline-size", options.minInlineSize);
  if (options.maxInlineSize) root.style.setProperty("--sk-sidebar-max-inline-size", options.maxInlineSize);

  let bounds = measureBounds(root);

  /** What the stylesheet actually granted, which is the only width worth reporting or storing. */
  const settled = () => root.getBoundingClientRect().width;

  const describe = () => {
    // A degenerate range means the sidebar has no layout yet (detached, or inside a closed drawer).
    // Reporting a position against it would be inventing one, so the authored value stands.
    if (!(bounds.max > bounds.min)) return;
    applyAttrs(handle, { "aria-valuenow": String(sidebarWidthPercent(settled(), bounds.min, bounds.max)) });
  };

  const apply = (width: number | null) => {
    if (width === null) root.style.removeProperty(SIDEBAR_WIDTH_PROPERTY);
    else root.style.setProperty(SIDEBAR_WIDTH_PROPERTY, `${Math.round(width)}px`);
    describe();
  };

  const announce = () => {
    const details: SidebarResizeChangeDetails = { inlineSize: settled() };
    options.onResizeChange?.(details);
    root.dispatchEvent(
      new CustomEvent<SidebarResizeChangeDetails>(sidebarEvents.resizeChange, { bubbles: true, detail: details }),
    );
  };

  /** The end of an adjustment: what was granted is what gets remembered, and then announced. */
  const commit = () => {
    if (preference) setPreference(preference, settled());
    announce();
  };

  /**
   * One adjustment, with the width transition out of the way.
   *
   * Everything here works by writing a width and reading back what the stylesheet granted, and a
   * running transition breaks exactly that: the element keeps reporting the width it is animating
   * FROM, so each step measures the previous one. Six arrow presses drifted ten pixels, and the
   * position a screen reader was told was always one step stale.
   *
   * Suppressing the transition for the length of the adjustment makes the read honest, and it is
   * also the better gesture: a nudge that animates 16px over a fifth of a second reads as lag. The
   * bounds are re-measured here too, since a sidebar can be adjusted before it was ever laid out
   * (mounted in a hidden panel, then revealed).
   */
  const adjust = (next: (from: number) => number | null) => {
    const wasResizing = root.hasAttribute("data-resizing");
    root.setAttribute("data-resizing", "");
    bounds = measureBounds(root);
    apply(next(settled()));
    if (!wasResizing) root.removeAttribute("data-resizing");
  };

  /**
   * Back to the width the stylesheet says.
   *
   * It FORGETS rather than storing the default, and it announces without going through `commit`,
   * which would immediately write that default straight back into the slot it just cleared. Storing
   * today's default is how a product that later changes it never reaches the readers who never chose.
   */
  const reset = () => {
    adjust(() => null);
    if (preference) clearPreference(preference);
    announce();
  };

  if (preference) {
    const stored = getPreference(preference);
    if (stored !== null) apply(stored);
  }
  describe();

  /* The handle sits on the inline END of the panel, so in RTL a drag toward the reader's start is a
   * drag toward larger x. Read per gesture rather than cached: a document can flip direction. */
  const towardWider = () => splitterDirectionSign(getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr");

  /*
   * ── PRESSED IS NOT DRAGGING ───────────────────────────────────────────────────────────────────
   *
   * A press ARMS the gesture; only travel past `DRAG_THRESHOLD` starts it. Until then the width is
   * untouched, `data-resizing` is not on the root, and releasing does nothing at all.
   *
   * This is not polish. A press that never moved used to run the whole ending: it committed, which
   * FIRED `sk-resize-change` and, on a sidebar with a `storageKey`, WROTE the current width to
   * storage. So a stray click on the panel edge froze whatever width happened to be on screen into
   * the reader's browser, and a product that later changed its default could never reach them
   * again. It also ran twice on the way to a double-click, storing a width the reader was in the
   * middle of asking to forget.
   *
   * The threshold is travel and not a timer on purpose. A splitter with a hold delay lags: you
   * press, pull, and the panel sits still for a fifth of a second before catching up. Four pixels
   * is the usual slop for telling a click from a drag, and it is below what a hand does by accident
   * while clicking.
   */
  let pointerId: number | null = null;
  let startX = 0;
  let startWidth = 0;
  let dragging = false;

  const onPointerDown = (event: Event) => {
    const pointer = event as PointerEvent;
    // Secondary buttons open context menus and start selections; they do not resize.
    if (pointer.button !== 0) return;
    // Still prevented: the press must not start a text selection while we wait to see what it is.
    pointer.preventDefault();

    pointerId = pointer.pointerId;
    startX = pointer.clientX;
    dragging = false;
    /* Captured from the press, not from the arming: the pointer has to keep reporting to this
     * element while it travels the first four pixels, or the threshold could never be crossed. */
    handle.setPointerCapture(pointer.pointerId);
  };

  const onPointerMove = (event: Event) => {
    const pointer = event as PointerEvent;
    if (pointerId === null || pointer.pointerId !== pointerId) return;

    if (!dragging) {
      if (!hasCrossedDragThreshold(startX, pointer.clientX)) return;
      // The gesture is a drag. Measure from HERE, so the width does not jump by the slop.
      dragging = true;
      bounds = measureBounds(root);
      startX = pointer.clientX;
      startWidth = settled();
      root.setAttribute("data-resizing", "");
      handle.setAttribute("data-dragging", "");
    }

    apply(startWidth + (pointer.clientX - startX) * towardWider());
  };

  const onPointerUp = (event: Event) => {
    const pointer = event as PointerEvent;
    if (pointerId === null || pointer.pointerId !== pointerId) return;
    if (handle.hasPointerCapture(pointer.pointerId)) handle.releasePointerCapture(pointer.pointerId);
    pointerId = null;

    // A press that never became a drag ends here: nothing moved, so there is nothing to announce
    // and nothing to remember.
    if (!dragging) return;
    dragging = false;
    root.removeAttribute("data-resizing");
    handle.removeAttribute("data-dragging");
    commit();
  };

  const onKeyDown = (event: Event) => {
    const key = event as KeyboardEvent;
    const action = resolveSplitterKey(key);

    switch (action.kind) {
      case "delta":
        adjust((from) => from + action.delta * towardWider());
        break;
      case "home":
        // The ends of the travel, which `clamp()` resolves for us: overshoot and let CSS land it.
        adjust(() => 0);
        break;
      case "end":
        adjust(() => 100000);
        break;
      case "reset":
        // The keyboard's answer to double-click: one key that undoes every adjustment.
        key.preventDefault();
        reset();
        return;
      case "none":
        return;
    }

    key.preventDefault();
    commit();
  };

  const cleanup = bindEvents(handle, {
    pointerdown: onPointerDown,
    pointermove: onPointerMove,
    pointerup: onPointerUp,
    pointercancel: onPointerUp,
    keydown: onKeyDown,
    dblclick: reset,
  });

  return () => {
    cleanup();
    root.removeAttribute("data-resizing");
    handle.removeAttribute("data-dragging");
  };
}

export const mountSidebar = createConnectMount({
  key: "sidebar",
  rootSelector,
  connect: (root) =>
    connectSidebar(root, {
      defaultCollapsed: root.hasAttribute("data-default-collapsed"),
      storageKey: root.dataset.storageKey,
    }),
});
