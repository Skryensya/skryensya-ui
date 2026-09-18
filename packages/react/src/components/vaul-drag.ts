import type { VaulEdge } from "@skryensya/core/vaul";
import { axisOf, decideDismiss, resist, VELOCITY_WINDOW, type Sample } from "@skryensya/core/vaul-gesture";
import { useEffect, type RefObject } from "react";

/*
 * VAUL, drag-to-dismiss, for the React binding.
 *
 * The same DOM shell as `@skryensya/vanilla`'s `connectVaul`, ported rather than imported: the two
 * bindings are peers, and `@skryensya/react` does not depend on `@skryensya/vanilla`. What is NOT
 * ported is the verdict. "Was that a dismissal?", the overpull curve and the drag axis live in
 * `@skryensya/core/vaul-gesture`, so both shells measure and one pure module decides - a flick that
 * dismisses the Vanilla palette dismisses this one, by construction rather than by keeping two copies
 * of the arithmetic in step.
 *
 * Like its Vanilla twin it renders nothing and owns no markup. It writes an offset, a progress and
 * two state flags (`data-dragging`, `data-releasing`) on the dialog, and `dialog-vaul.css` does the
 * rest; letting go reads as the throw continuing because the release curve is the CSS's.
 *
 * Wired only below the desktop breakpoint, read from `--breakpoint-desktop` exactly as the Vanilla
 * shell reads it, so the gesture and the stylesheet that hides the handle can never disagree about
 * where "desktop" starts.
 */
export function useVaulDrag(
  dialogRef: RefObject<HTMLDialogElement | null>,
  { enabled, edge = "block-end", threshold = 0.4 }: { enabled: boolean; edge?: VaulEdge; threshold?: number },
): void {
  useEffect(() => {
    const root = dialogRef.current;
    if (!enabled || !root) return;

    /* A DIRECT child only: a nested component's own `handle` part must never take the gesture. */
    const handle = root.querySelector<HTMLElement>(':scope > [data-part="handle"]');
    if (!handle) return;

    const velocity = 0.5;

    const setOffset = (px: number, size: number) => {
      root.style.setProperty("--sk-vaul-drag-offset", `${px}px`);
      const progress = size > 0 ? Math.min(1, Math.max(0, px / size)) : 0;
      root.style.setProperty("--sk-vaul-drag-progress", String(progress));
    };
    const clearOffset = () => {
      root.style.removeProperty("--sk-vaul-drag-offset");
      root.style.removeProperty("--sk-vaul-drag-progress");
    };
    const sizeOf = () =>
      edge === "block-end" ? root.getBoundingClientRect().height : root.getBoundingClientRect().width;
    const overpull = () => {
      const n = Number.parseFloat(getComputedStyle(root).getPropertyValue("--sk-vaul-overpull"));
      return Number.isFinite(n) && n > 0 ? n : 12;
    };
    const releaseMs = () => {
      const raw = getComputedStyle(root).getPropertyValue("--sk-vaul-release-duration").trim();
      const n = Number.parseFloat(raw);
      if (!Number.isFinite(n)) return 320;
      return raw.endsWith("ms") ? n : n * 1000;
    };

    let pointerId: number | null = null;
    let start = 0;
    let travelled = 0;
    let samples: Sample[] = [];
    let releaseTimer: number | undefined;

    /* A timer, not `transitionend`: a dismissal ends with the dialog leaving the top layer, the
       transition never finishes, and the flag would stick into the next open. */
    const beginRelease = () => {
      root.dataset.releasing = "";
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => delete root.dataset.releasing, releaseMs());
    };

    /* The browser's own drag (a link or a text selection under the handle) cancels every pointer
       gesture one frame in; claiming the pointer at the source is what keeps ours alive. */
    const onDragStart = (event: Event) => event.preventDefault();

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      if (event.buttons === 0) {
        finish(event);
        return;
      }
      const { axis, sign } = axisOf(edge, getComputedStyle(root).direction === "rtl");
      const pulled = ((axis === "x" ? event.clientX : event.clientY) - start) * sign;
      travelled = pulled >= 0 ? pulled : -resist(-pulled, overpull());
      setOffset(travelled, sizeOf());

      samples.push({ at: event.timeStamp, at_offset: travelled });
      const cutoff = event.timeStamp - VELOCITY_WINDOW;
      while (samples.length > 2 && samples[0]!.at < cutoff) samples.shift();
    };

    const stopTracking = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("dragstart", onDragStart);
    };

    function finish(event: PointerEvent) {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      stopTracking();
      delete root!.dataset.dragging;
      if (handle!.hasPointerCapture(event.pointerId)) handle!.releasePointerCapture(event.pointerId);

      const dismiss = decideDismiss(samples, { travelled, size: sizeOf(), threshold, velocity });
      beginRelease();
      clearOffset();
      if (dismiss) root!.close();
    }

    const onPointerDown = (event: PointerEvent) => {
      if (pointerId !== null || !event.isPrimary || event.buttons === 0) return;
      event.preventDefault();
      const { axis } = axisOf(edge, getComputedStyle(root).direction === "rtl");
      pointerId = event.pointerId;
      start = axis === "x" ? event.clientX : event.clientY;
      travelled = 0;
      samples = [{ at: event.timeStamp, at_offset: 0 }];
      window.clearTimeout(releaseTimer);
      delete root.dataset.releasing;
      root.dataset.dragging = "";
      handle.setPointerCapture(event.pointerId);
      /* On the WINDOW for the rest of the gesture: capture is dropped when the dialog leaves the top
         layer, which is exactly what a dismissal does, and a lost `pointerup` would leave the panel
         following the cursor with no button held. */
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
      window.addEventListener("dragstart", onDragStart);
    };

    const desktopBp = getComputedStyle(root).getPropertyValue("--breakpoint-desktop").trim() || "52rem";
    const belowDesktop = window.matchMedia(`(width < ${desktopBp})`);
    const syncDrag = () => {
      handle.removeEventListener("pointerdown", onPointerDown);
      if (belowDesktop.matches) handle.addEventListener("pointerdown", onPointerDown);
    };
    syncDrag();
    belowDesktop.addEventListener("change", syncDrag);

    return () => {
      belowDesktop.removeEventListener("change", syncDrag);
      handle.removeEventListener("pointerdown", onPointerDown);
      stopTracking();
      window.clearTimeout(releaseTimer);
      clearOffset();
      delete root.dataset.dragging;
      delete root.dataset.releasing;
    };
  }, [dialogRef, enabled, edge, threshold]);
}
