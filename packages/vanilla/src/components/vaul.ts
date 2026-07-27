import { vaulEvents, type VaulEdge, type VaulOptions } from "@skryensya/core/vaul";
import { createConnectMount } from "../runtime/svelte-hydrate.js";
import { axisOf, decideDismiss, resist, VELOCITY_WINDOW, type Sample } from "./vaul-gesture.js";

/*
 * VAUL, drag-to-dismiss.
 *
 * Vaul is COMPLETE without this file: a native <dialog> already gives the focus trap, ESC, inert
 * page and focus restoration (decision 11), and CSS gives the slide. This enhancer exists for the one
 * behaviour with no platform equivalent, pulling the panel back toward its edge with a finger, which
 * no Zag machine covers either. It writes an offset and a state; it renders nothing and owns no markup.
 *
 * Drag is a TOUCH gesture, wired only below the desktop breakpoint (52rem). Above it a pointer dismisses
 * by clicking outside or pressing ESC, and patterns/vaul.css hides the grab handle to match.
 *
 * This file is now the DOM SHELL: pointer capture, window listeners, CSS-token reads, offset writes.
 * The question it exists to answer, "was that a dismissal?", and the geometry (`axisOf`, `resist`)
 * are pure, and live in ./vaul-gesture.ts where they can be tested without a DOM. The shell measures,
 * the pure module decides, `root.close()` acts.
 *
 * Everything else is the CSS's: the enhancer writes numbers, and the release curve (decision 10's
 * `release` intent) is what makes letting go read as the throw continuing rather than an animation
 * starting.
 */

type Cleanup = () => void;

export function connectVaul(root: HTMLElement, options: VaulOptions = {}): Cleanup {
  if (!(root instanceof HTMLDialogElement)) {
    throw new Error("Vaul requires a native <dialog>: the modality is the platform's, not ours.");
  }

  const edge = options.edge ?? (root.dataset.edge as VaulEdge | undefined) ?? "inline-start";
  const threshold = options.dismissThreshold ?? 0.4;
  const velocity = options.dismissVelocity ?? 0.5;
  const draggable = options.draggable ?? true;

  root.dataset.scope = "vaul";
  root.dataset.part = root.dataset.part || "root";
  if (!root.dataset.edge) root.dataset.edge = edge;

  const announce = () => {
    root.dispatchEvent(
      new CustomEvent(vaulEvents.openChange, { detail: { open: root.open }, bubbles: true }),
    );
    options.onOpenChange?.({ open: root.open });
  };
  root.addEventListener("close", announce);

  /* Two ways to be THIS panel's handle, because Vaul has two skins and only one of them is `sk-vaul`.
   *
   * Dialog Vaul is a composition over `sk-dialog` (patterns/dialog-vaul.css styles a bare
   * `[data-part="handle"]`), so its handle never carries `sk-vaul__handle`, and requiring the class
   * meant the enhancer found nothing and returned before wiring anything. The page documented a drag
   * that did not exist and rendered a grab handle to advertise it: an affordance that lies, which is
   * the one thing this pattern says a handle must never be.
   *
   * The fallback is `:scope >` and not a bare part lookup on purpose. `handle` is a common part name
   * (a slider inside the panel has one), and a descendant search would hand the gesture to whatever
   * component happened to be nested. A DIRECT child of the panel can only be the panel's own. */
  const handle = root.querySelector<HTMLElement>(
    '[data-part="handle"].sk-vaul__handle, :scope > [data-part="handle"]',
  );
  if (!draggable || !handle) {
    return () => root.removeEventListener("close", announce);
  }

  const setOffset = (px: number, size: number) => {
    root.style.setProperty("--sk-vaul-drag-offset", `${px}px`);
    /* Unitless on purpose: the backdrop multiplies it, and a length there would be a category error. */
    const progress = size > 0 ? Math.min(1, Math.max(0, px / size)) : 0;
    root.style.setProperty("--sk-vaul-drag-progress", String(progress));
  };
  const clearOffset = () => {
    root.style.removeProperty("--sk-vaul-drag-offset");
    root.style.removeProperty("--sk-vaul-drag-progress");
  };

  const sizeOf = () =>
    edge === "block-end" ? root.getBoundingClientRect().height : root.getBoundingClientRect().width;

  /** The overpull cap, in px, as the CSS declares it, see `resist`. */
  const overpull = () => {
    const raw = getComputedStyle(root).getPropertyValue("--sk-vaul-overpull").trim();
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) && n > 0 ? n : 12;
  };

  let pointerId: number | null = null;
  let start = 0;
  let travelled = 0;
  let samples: Sample[] = [];
  let releaseTimer: number | undefined;

  /* The token owns the duration, so the flag has to ask it rather than restate it, a hard-coded
   * number here would go stale the day someone retunes the release intent, and nothing would say so. */
  const releaseMs = () => {
    const raw = getComputedStyle(root).getPropertyValue("--sk-vaul-release-duration").trim();
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n)) return 320;
    return raw.endsWith("ms") ? n : n * 1000; // a bare `s` value is seconds, and 0.32 ≠ 320
  };

  /* One flag for the whole throw, cleared when the panel stops. A timer rather than `transitionend`
   * because a dismissal ends with the element leaving the top layer: the transition never finishes,
   * so the event never fires, and the flag would stick, the next open would use the release curve
   * instead of its own. */
  const beginRelease = () => {
    root.dataset.releasing = "";
    window.clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => delete root.dataset.releasing, releaseMs());
  };

  /* The browser has its OWN gesture that starts the same way ours does, and it wins by default.
   *
   * A side panel's handle is a strip laid OVER the content (patterns/vaul.css: it is positioned, not
   * in flow), so on a drawer full of navigation the pointer goes down on the handle while a link sits
   * underneath. Chrome resolves the drag source by looking for a link at that point, fires `dragstart`
   * on it, and a native drag-and-drop cancels every other pointer gesture: we get `pointercancel` one
   * frame in, the panel springs home, and the drawer reads as "drag is broken here" for no reason the
   * author can see in their own markup. A sheet full of prose has the same problem with a text
   * selection drag.
   *
   * So the gesture claims the pointer at the source. Cancelling `pointerdown` suppresses the
   * compatibility mouse events, and native DnD and selection both start from those. `dragstart` is
   * still cancelled as well, belt and braces, because the drag source is the browser's decision and
   * not one we can see from here. Neither costs anything: the handle is `aria-hidden`, not focusable
   * and not clickable, so there is no default behaviour on it worth keeping. */
  const onDragStart = (event: Event) => event.preventDefault();

  const onPointerDown = (event: PointerEvent) => {
    if (pointerId !== null || !event.isPrimary) return;
    /* A drag starts with a button held. Anything else reaching this handler is not a grab. */
    if (event.buttons === 0) return;
    event.preventDefault();
    const rtl = getComputedStyle(root).direction === "rtl";
    const { axis } = axisOf(edge, rtl);

    pointerId = event.pointerId;
    start = axis === "x" ? event.clientX : event.clientY;
    travelled = 0;
    samples = [{ at: event.timeStamp, at_offset: 0 }];
    /* Grabbing a panel mid-flight must catch it where it is, not let the old throw finish underneath
     * the finger. */
    window.clearTimeout(releaseTimer);
    delete root.dataset.releasing;
    root.dataset.dragging = "";
    handle.setPointerCapture(event.pointerId);

    /* The gesture is tracked on the WINDOW, not on the handle, for the rest of its life.
     *
     * Pointer capture is supposed to make that unnecessary, it retargets every later event to the
     * handle, but it is a request, not a guarantee: it can be refused, and it is dropped outright when
     * the element leaves the top layer, which is exactly what dismissing this panel does. Lose it while
     * listening only on the handle and `pointerup` never arrives: `pointerId` stays set, the gesture
     * never ends, and the next time the cursor merely PASSES OVER the handle the panel starts moving
     * with no button held. The window always sees the release. */
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("dragstart", onDragStart);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    /* The button came up somewhere we never heard about, a released gesture, arriving as a move.
     * Treat it as the release it is rather than dragging a panel nobody is holding. */
    if (event.buttons === 0) {
      finish(event);
      return;
    }
    const rtl = getComputedStyle(root).direction === "rtl";
    const { axis, sign } = axisOf(edge, rtl);
    const pulled = ((axis === "x" ? event.clientX : event.clientY) - start) * sign;

    /* Toward the edge the panel follows exactly; away from it, it resists (see `resist`). */
    travelled = pulled >= 0 ? pulled : -resist(-pulled, overpull());
    setOffset(travelled, sizeOf());

    samples.push({ at: event.timeStamp, at_offset: travelled });
    const cutoff = event.timeStamp - VELOCITY_WINDOW;
    while (samples.length > 2 && samples[0].at < cutoff) samples.shift();
  };

  const stopTracking = () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", finish);
    window.removeEventListener("pointercancel", finish);
    window.removeEventListener("dragstart", onDragStart);
  };

  const finish = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    stopTracking();
    delete root.dataset.dragging;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);

    /* Was that a dismissal? The verdict is pure, samples and numbers in, boolean out, and lives in
     * vaul-gesture.ts. This shell only measured the inputs. */
    const dismiss = decideDismiss(samples, { travelled, size: sizeOf(), threshold, velocity });

    /* The offset is dropped either way, and the release curve carries the panel from wherever the
     * finger left it, home, or the rest of the way out. */
    beginRelease();
    clearOffset();
    if (dismiss) root.close();
  };

  /* Only the grab is the handle's, a drag begins there and nowhere else. The rest of the gesture
   * belongs to the window, and only while it lasts (see onPointerDown).
   *
   * And the grab is wired only below the desktop breakpoint. The threshold is NOT hard-coded here: it
   * is read from `--breakpoint-desktop`, the same source semantic/_breakpoints.scss gives the CSS, so
   * the JS gate and the CSS handle-hide can never drift. `(width < …)` is the exact complement of the
   * stylesheet's `(min-width: …)`, so they agree even at the boundary pixel. matchMedia is re-read on
   * `change`, so a window dragged across the line attaches or drops the gesture live, no reload, and
   * no handle left listening on a width where the CSS has already hidden it. */
  const desktopBp =
    getComputedStyle(root).getPropertyValue("--breakpoint-desktop").trim() || "52rem";
  const belowDesktop = window.matchMedia(`(width < ${desktopBp})`);
  const syncDrag = () => {
    handle.removeEventListener("pointerdown", onPointerDown);
    if (belowDesktop.matches) handle.addEventListener("pointerdown", onPointerDown);
  };
  syncDrag();
  belowDesktop.addEventListener("change", syncDrag);

  return () => {
    root.removeEventListener("close", announce);
    belowDesktop.removeEventListener("change", syncDrag);
    handle.removeEventListener("pointerdown", onPointerDown);
    stopTracking();
    window.clearTimeout(releaseTimer);
    clearOffset();
    delete root.dataset.dragging;
    delete root.dataset.releasing;
  };
}

/*
 * Progressive enhancement over authored Vaul and Dialog Vaul markup. Each root names its own
 * trigger/closer attributes; opening remains a plain click on a real button, while the enhancer adds
 * drag and nothing else changes hands.
 */
export const mountVaul = createConnectMount({
  key: "vaul",
  rootSelector: "[data-sk-vaul], [data-sk-dialog-vaul]",
  connect: (root) => {
  const cleanupDrag = connectVaul(root, {
    draggable: root.dataset.draggable !== "false",
    dismissThreshold: root.dataset.dismissThreshold ? Number(root.dataset.dismissThreshold) : undefined,
  });

  if (!(root instanceof HTMLDialogElement)) return cleanupDrag;

  /* The triggers live outside the panel, so they are found from the document rather than from the
   * root, an enhancer patches elements that already exist, wherever the author put them. */
  const open = () => {
    root.showModal();
  };
  const attributePrefix = root.matches("[data-sk-dialog-vaul]") ? "data-sk-dialog-vaul" : "data-sk-vaul";
  const triggers = root.id
    ? [...document.querySelectorAll<HTMLElement>(`[${attributePrefix}-open="${root.id}"]`)]
    : [];
  for (const trigger of triggers) trigger.addEventListener("click", open);

  const close = () => root.close();
  const closers = [...root.querySelectorAll<HTMLElement>(`[${attributePrefix}-close]`)];

  for (const closer of closers) closer.addEventListener("click", close);

  /* The backdrop is the dialog's own box, so a click outside the panel's rectangle is a click on the
   * backdrop, "tap outside to dismiss" with no second element to own it. */
  const onLightDismiss = (event: MouseEvent) => {
    if (event.target !== root) return;
    const box = root.getBoundingClientRect();
    const outside =
      event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    if (outside) root.close();
  };
  root.addEventListener("click", onLightDismiss);

  return () => {
    cleanupDrag();
    for (const trigger of triggers) trigger.removeEventListener("click", open);
    for (const closer of closers) closer.removeEventListener("click", close);
    root.removeEventListener("click", onLightDismiss);
  };
  },
});
