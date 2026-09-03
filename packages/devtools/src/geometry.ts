/*
 * THE PURE DECISIONS BEHIND THE PANEL, no DOM, no `window`, no `localStorage`. `panel.ts` and
 * `fps.ts` own the shell (drag listeners, `requestAnimationFrame`, persistence); this is every
 * place they had to decide something rather than just measure or paint something, pulled out so
 * the decision has a name and a test.
 *
 * Same split `@skryensya/core/back-to-top` and `@skryensya/charts/geometry` already use: the DOM
 * shell calls a small set of pure functions, and the functions are what a test drives directly.
 */

export type Point = { left: number; top: number };
export type Size = { width: number; height: number };

/**
 * Keeps a `position: fixed` box's top-left corner inside the viewport, after a drag or a resize
 * that left it (partially or fully) off-screen. `viewport` is a parameter, not `window.innerWidth`/
 * `-Height` read inside: the panel is always the whole viewport, but the function itself does not
 * need to know that, and not reading a global is what makes it callable from a test with no DOM.
 */
export function clampPosition(position: Point, size: Size, viewport: Size): Point {
  const maxLeft = Math.max(0, viewport.width - size.width);
  const maxTop = Math.max(0, viewport.height - size.height);
  return {
    left: Math.min(Math.max(0, position.left), maxLeft),
    top: Math.min(Math.max(0, position.top), maxTop),
  };
}

/**
 * Was a pointer that went down and is still down a DRAG, or is it still just a CLICK that has not
 * released yet? Distance travelled since `pointerdown`, in CSS pixels, past which the gesture stops
 * being a click even if the pointer comes back to the origin before release — the platform only
 * knows "down, then up on the same element", never "moved and came back", so this is the one
 * signal a caller has for telling the two apart while the pointer is still down.
 */
export function exceedsDragThreshold(dx: number, dy: number, thresholdPx: number): boolean {
  return Math.hypot(dx, dy) >= thresholdPx;
}

/**
 * Which edge the panel opens from: it opens UPWARD from its toggle by default (the toggle sits at
 * a screen corner, and content growing off-screen reads as broken), and flips to grow downward only
 * when there genuinely is not `minSpace` px of room above the toggle to grow into.
 */
export function panelEdge(spaceAboveToggle: number, minSpace: number): "top" | "bottom" {
  return spaceAboveToggle < minSpace ? "bottom" : "top";
}

/**
 * Frames-per-second from a raw count over a window, smoothed by construction: the caller accumulates
 * `frames` across a whole window (`fps.ts`'s own ~250ms) rather than calling this once a frame, so
 * one slow frame moves the reading by a fraction of a fps instead of swinging it by dozens.
 */
export function fpsFromFrameCount(frames: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return Math.round((frames * 1000) / elapsedMs);
}
