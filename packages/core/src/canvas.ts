import type { ComponentContract, ContractTemplate, OptionsOf } from "./contract.js";

/*
 * CANVAS, a viewport you can pan and zoom, for a drawing that is bigger than the screen showing it.
 *
 * The case that asked for it is a composition diagram on a phone. An `Annotated` Accordion with its
 * numbers, rings and brackets is laid out for a desktop-sized margin; squeezed into 360px the
 * specimen rewraps word by word and the drawing stops describing the component it names. The honest
 * answer is not a second, narrower drawing: it is the SAME drawing, laid out at its own width and
 * shown scaled down to fit, with the reader free to zoom into the part they care about. That is what
 * every design tool does with a canvas, and it is what this does, no more.
 *
 * THE CONTENT IS LAID OUT AT ITS OWN WIDTH, NEVER THE VIEWPORT'S. That is the whole point, and the
 * reason the viewport is `contain: inline-size`: whatever is inside keeps the width it would have on
 * a desktop (`--sk-canvas-content-inline-size`, `max-content` by default), and the viewport shows it
 * through a `translate() scale()` transform. A transform changes no box, so nothing inside reflows
 * when the reader zooms; an `Annotated` inside measures its parts in its own coordinates and divides
 * the scale back out (see `annotationScale`).
 *
 * AT REST IT IS FITTED: scaled down (never up) until the whole content is visible, and the viewport
 * is exactly as tall as the fitted content, capped by `--sk-canvas-max-block-size` and floored by
 * `--sk-canvas-min-block-size` (the drawing is centred in the extra height, never enlarged into
 * it). A reader who never touches it sees a plain, complete drawing with a small zoom bar in its
 * corner.
 *
 * IT NEVER TAKES THE PAGE'S SCROLL. This is the rule every embedded map learned the hard way, and it
 * decides every gesture below:
 *
 *   mouse        drag pans; Ctrl/Cmd + wheel (and a trackpad pinch, which the platform reports as
 *                Ctrl + wheel) zooms around the pointer. A PLAIN wheel scrolls the page while the
 *                canvas is at rest (fitted), and the canvas says how to zoom instead. Once the reader
 *                has zoomed or dragged, the canvas is ENGAGED and a plain wheel (or a trackpad's
 *                two-finger scroll) pans it instead, until the pan reaches an edge, where the scroll
 *                is handed back to the page. Fit (button or `0`) returns it to rest.
 *   touch        ONE finger scrolls the page, always. TWO fingers pan and pinch the canvas. A reader
 *                who drags one finger across it is told to use two, the way a map does; nothing has
 *                to be switched on first, and nothing is trapped.
 *   keyboard     with the viewport focused: `+` / `-` zoom, `0` fits, `1` is 100%, arrows pan.
 *   buttons      three icon-only buttons, zoom in, zoom out and fit: a vertical bar in the top
 *                corner over the drawing, or a strip of their own under it on a narrow screen.
 *
 * THE SPLIT, the `hotkey` / `annotation` one: the geometry is pure and tested here; the event wiring
 * is here too (`connectCanvasView`), DOM-touching and framework-free, because both bindings need
 * exactly the same dozen listeners and two copies of pinch arithmetic are two ways to be wrong. The
 * Vanilla enhancer and the React effect each call it on their own root and do nothing else.
 */

export const canvasParts = {
  /** The whole control: viewport, its zoom bar and its gesture hints. */
  root: "sk-canvas",
  /** The window onto the content. Focusable, clips, and owns every gesture. */
  viewport: "sk-canvas__viewport",
  /** What is shown, at its own width, moved and scaled by one transform. */
  content: "sk-canvas__content",
  /** The zoom bar: three icon-only buttons. */
  controls: "sk-canvas__controls",
  /** One button in it. Which one is `data-canvas-action`. */
  control: "sk-canvas__control",
  /** A gesture hint, shown briefly over the viewport when the reader tries the wrong gesture. */
  hint: "sk-canvas__hint",
} as const;

export const canvasAttrs = {
  /** The enhancer's attachment point. */
  root: "data-sk-canvas",
  /** Which action a control performs. */
  action: "data-canvas-action",
  /** Which gesture a hint is about. */
  hint: "data-canvas-hint",
  /** Written by the binding on the root while a hint is showing: which one. */
  showing: "data-sk-hint",
  /** Written while the content is being dragged. */
  dragging: "data-sk-dragging",
  /** Written while the view is not the fitted one, so a consumer can style "zoomed in". */
  zoomed: "data-sk-zoomed",
  minZoom: "data-min-zoom",
  maxZoom: "data-max-zoom",
  /** Authored: the canvas only fits. No zoom, no pan, no zoom bar. */
  fitOnly: "data-fit-only",
} as const;

export type CanvasAction = "zoom-out" | "zoom-in" | "fit";
export const canvasActions = ["zoom-out", "zoom-in", "fit"] as const satisfies readonly CanvasAction[];

export type CanvasHint = "touch" | "wheel";

/** Where the content sits and how big it is drawn: a translate, then a scale about the origin. */
export type CanvasView = { readonly x: number; readonly y: number; readonly scale: number };
export type CanvasSize = { readonly width: number; readonly height: number };
export type CanvasPoint = { readonly x: number; readonly y: number };

export const CANVAS_MIN_ZOOM = 0.25;
export const CANVAS_MAX_ZOOM = 4;
/** One press of a button or a key multiplies or divides the scale by this. */
export const CANVAS_ZOOM_STEP = 1.25;
/** One arrow key moves the content this far, in screen px. */
export const CANVAS_PAN_STEP = 40;
/** How long a gesture hint stays up, in ms. */
export const CANVAS_HINT_DURATION = 1600;
/** A mouse press has to move this far, in px, before it is a drag rather than a click. */
export const CANVAS_DRAG_THRESHOLD = 3;

/* ---------------------------------------------------------------------------------------------- *
 * Pure geometry - no DOM. Tested from `packages/core/src/canvas.test.ts`.
 *
 * Every point is in the VIEWPORT's own coordinates (its padding box, origin top-left), which is the
 * space the content's transform is written in: a content point `p` is drawn at `view + p * scale`.
 * ---------------------------------------------------------------------------------------------- */

export function clampZoom(scale: number, min = CANVAS_MIN_ZOOM, max = CANVAS_MAX_ZOOM): number {
  if (!Number.isFinite(scale)) return 1;
  return Math.min(Math.max(scale, min), max);
}

/**
 * The scale a fitted view uses: small enough that ALL of the content shows, and never above 1. A
 * canvas enlarging a small drawing to fill a wide screen would be showing it at a size nobody drew
 * it at, and the first thing a reader would do is zoom it back out.
 *
 * `maxHeight` is the viewport's cap; without one the viewport simply grows to the fitted height, so
 * only the width constrains.
 */
export function canvasFitScale(
  content: CanvasSize,
  viewportWidth: number,
  maxHeight = Number.POSITIVE_INFINITY,
): number {
  if (content.width <= 0 || content.height <= 0 || viewportWidth <= 0) return 1;
  return Math.min(1, viewportWidth / content.width, maxHeight / content.height);
}

/** The fitted view itself: that scale, and the content centred in the viewport on both axes. */
export function canvasFitView(content: CanvasSize, viewport: CanvasSize, scale: number): CanvasView {
  return {
    x: round((viewport.width - content.width * scale) / 2),
    y: round((viewport.height - content.height * scale) / 2),
    scale,
  };
}

/**
 * Zoom to `next` keeping the content point under `anchor` exactly where it is on screen. This is
 * what makes zooming feel like pointing: the thing under the cursor or between the fingers stays
 * under them, and everything else moves away from it.
 */
export function canvasZoomAround(view: CanvasView, next: number, anchor: CanvasPoint): CanvasView {
  const ratio = next / view.scale;
  return {
    x: round(anchor.x - (anchor.x - view.x) * ratio),
    y: round(anchor.y - (anchor.y - view.y) * ratio),
    scale: next,
  };
}

/**
 * How much of the drawing a pan must leave in view: this share of the smaller of the drawn content
 * and the window, on each axis.
 */
export const CANVAS_KEEP_VISIBLE = 0.5;

/**
 * Keep the content from being lost, and otherwise let it go where the reader puts it.
 *
 * The first version centred any axis where the drawing fitted, which is tidy and wrong: a fitted
 * drawing could not be dragged at all, so the very first thing a reader tried did nothing. Now the
 * content moves freely as long as `CANVAS_KEEP_VISIBLE` of it stays inside the window, the way a
 * design tool lets you drag the page off-centre but never off-screen.
 */
export function canvasClampView(view: CanvasView, content: CanvasSize, viewport: CanvasSize): CanvasView {
  const axis = (at: number, size: number, window: number): number => {
    const drawn = size * view.scale;
    const keep = Math.min(drawn, window) * CANVAS_KEEP_VISIBLE;
    return round(Math.min(window - keep, Math.max(at, keep - drawn)));
  };
  return {
    x: axis(view.x, content.width, viewport.width),
    y: axis(view.y, content.height, viewport.height),
    scale: view.scale,
  };
}

/**
 * How much one wheel event zooms by. A mouse wheel notch arrives as ~100px (or 3 LINES, which is
 * what `deltaMode === 1` means), a trackpad pinch as a stream of 1-10px deltas; clamping each event
 * keeps a single notch to one comfortable step instead of a 2.7x lurch, and the exponential makes
 * zooming in and back out by the same distance land exactly where it started.
 */
export function canvasWheelFactor(deltaY: number, deltaMode = 0): number {
  const px = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY;
  const bounded = Math.min(Math.max(px, -50), 50);
  return Math.exp(-bounded * 0.01);
}

const distance = (a: CanvasPoint, b: CanvasPoint): number => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: CanvasPoint, b: CanvasPoint): CanvasPoint => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

/**
 * A two-finger gesture, as one transform: the SCALE follows how far apart the fingers are compared
 * with when they landed, and the content point that was between them when they landed stays between
 * them wherever they go. That single rule is pinch and two-finger pan at once, which is why the two
 * never fight: moving both fingers together changes only the midpoint, spreading them changes only
 * the distance.
 */
export function canvasPinchView(
  start: CanvasView,
  from: readonly [CanvasPoint, CanvasPoint],
  to: readonly [CanvasPoint, CanvasPoint],
  min = CANVAS_MIN_ZOOM,
  max = CANVAS_MAX_ZOOM,
): CanvasView {
  const before = distance(from[0], from[1]);
  const scale = clampZoom(before > 0 ? (start.scale * distance(to[0], to[1])) / before : start.scale, min, max);
  const origin = midpoint(from[0], from[1]);
  const now = midpoint(to[0], to[1]);
  // The content point that was under the fingers' midpoint when they landed.
  const cx = (origin.x - start.x) / start.scale;
  const cy = (origin.y - start.y) / start.scale;
  return { x: round(now.x - cx * scale), y: round(now.y - cy * scale), scale };
}

/** What a key does to the view, or `null` for a key the canvas leaves alone. */
export type CanvasKeyAction =
  | { readonly kind: "zoom"; readonly by: number }
  | { readonly kind: "fit" }
  | { readonly kind: "actual" }
  | { readonly kind: "pan"; readonly dx: number; readonly dy: number };

export function canvasKeyAction(key: string): CanvasKeyAction | null {
  switch (key) {
    case "+":
    case "=":
      return { kind: "zoom", by: CANVAS_ZOOM_STEP };
    case "-":
    case "_":
      return { kind: "zoom", by: 1 / CANVAS_ZOOM_STEP };
    case "0":
      return { kind: "fit" };
    case "1":
      return { kind: "actual" };
    /* An arrow moves the VIEW the way the arrow points, which moves the content the other way: the
       same convention as scrolling a page. */
    case "ArrowLeft":
      return { kind: "pan", dx: CANVAS_PAN_STEP, dy: 0 };
    case "ArrowRight":
      return { kind: "pan", dx: -CANVAS_PAN_STEP, dy: 0 };
    case "ArrowUp":
      return { kind: "pan", dx: 0, dy: CANVAS_PAN_STEP };
    case "ArrowDown":
      return { kind: "pan", dx: 0, dy: -CANVAS_PAN_STEP };
    default:
      return null;
  }
}

/** The content's transform. Origin top-left, which `canvas.css` sets; every function above assumes it. */
export const canvasTransform = (view: CanvasView): string =>
  `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;

/* Two decimals of a pixel: enough for a transform to stay smooth, few enough that two bindings
   computing the same view write the same string. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/* ---------------------------------------------------------------------------------------------- *
 * The controller: the one place the gestures are wired. DOM-touching, framework-free.
 * ---------------------------------------------------------------------------------------------- */

export type CanvasViewOptions = {
  readonly minZoom?: number;
  readonly maxZoom?: number;
  /** Fit and refit, nothing else: no gesture, key or button is wired. See the `fitOnly` option. */
  readonly fitOnly?: boolean;
};

/**
 * Wire one canvas. Both bindings call exactly this on a root carrying the canvas's parts, and it
 * returns the cleanup.
 *
 * It WRITES to two places and reads everything else: the content's `transform`, and on the root a
 * handful of `data-sk-*` flags plus the view as custom properties (`--sk-canvas-x`, `-y`, `-scale`,
 * which move the dotted ground, and `--sk-canvas-fit-block-size`, the viewport's height at rest).
 * React never sets any of those, so the two never fight over an attribute.
 *
 * THE VIEW FOLLOWS FIT until the reader moves it. A resize while fitted refits, so a rotating
 * phone or a font arriving never leaves the drawing cropped; once the reader has zoomed or panned,
 * a resize only re-clamps, so it does not throw away where they were looking.
 */
export function connectCanvasView(root: HTMLElement, options: CanvasViewOptions = {}): () => void {
  const viewport = root.querySelector<HTMLElement>(`:scope > .${canvasParts.viewport}`);
  const content = viewport?.querySelector<HTMLElement>(`:scope > .${canvasParts.content}`);
  if (!viewport || !content) return () => {};
  const controls = Array.from(root.querySelectorAll<HTMLButtonElement>(`[${canvasAttrs.action}]`));
  const min = options.minZoom ?? CANVAS_MIN_ZOOM;
  const max = options.maxZoom ?? CANVAS_MAX_ZOOM;

  let view: CanvasView = { x: 0, y: 0, scale: 1 };
  let fitted = true;

  /* `offsetWidth`, not the bounding rect: the transform scales the rect and not the layout box, and
     it is the layout box, the content's own size, that every function above is written against. */
  const contentSize = (): CanvasSize => ({ width: content.offsetWidth, height: content.offsetHeight });
  const viewportSize = (): CanvasSize => ({ width: viewport.clientWidth, height: viewport.clientHeight });

  const apply = (): void => {
    content.style.transform = canvasTransform(view);
    /* The same view, for the stylesheet: the dotted ground pans and zooms with the drawing. */
    root.style.setProperty("--sk-canvas-x", `${view.x}px`);
    root.style.setProperty("--sk-canvas-y", `${view.y}px`);
    root.style.setProperty("--sk-canvas-scale", String(view.scale));
    for (const control of controls) {
      const action = control.getAttribute(canvasAttrs.action);
      control.disabled =
        (action === "zoom-in" && view.scale >= max - 1e-6) ||
        (action === "zoom-out" && view.scale <= min + 1e-6);
    }
    root.toggleAttribute(canvasAttrs.zoomed, !fitted);
  };

  const layout = (): void => {
    const size = contentSize();
    const width = viewport.clientWidth;
    if (size.width === 0 || width === 0) return;
    const cap = Number.parseFloat(getComputedStyle(viewport).maxHeight);
    const scale = clampZoom(canvasFitScale(size, width, Number.isFinite(cap) ? cap : undefined), min, max);
    root.style.setProperty("--sk-canvas-fit-block-size", `${Math.ceil(size.height * scale)}px`);
    const window = { width, height: viewport.clientHeight };
    view = fitted ? canvasFitView(size, window, scale) : canvasClampView(view, size, window);
    apply();
  };

  const move = (next: CanvasView): void => {
    fitted = false;
    view = canvasClampView(next, contentSize(), viewportSize());
    apply();
  };

  const centre = (): CanvasPoint => ({ x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 });
  const zoomBy = (factor: number, anchor: CanvasPoint = centre()): void =>
    move(canvasZoomAround(view, clampZoom(view.scale * factor, min, max), anchor));
  const fit = (): void => {
    fitted = true;
    layout();
  };

  const local = (clientX: number, clientY: number): CanvasPoint => {
    const rect = viewport.getBoundingClientRect();
    return { x: clientX - rect.left - viewport.clientLeft, y: clientY - rect.top - viewport.clientTop };
  };

  /* ---- hints ---- */
  let hintTimer = 0;
  const hint = (kind: CanvasHint): void => {
    root.setAttribute(canvasAttrs.showing, kind);
    clearTimeout(hintTimer);
    hintTimer = window.setTimeout(() => root.removeAttribute(canvasAttrs.showing), CANVAS_HINT_DURATION);
  };
  const clearHint = (): void => {
    clearTimeout(hintTimer);
    root.removeAttribute(canvasAttrs.showing);
  };

  /* ---- wheel: Ctrl/Cmd zooms; plain pans once engaged, and scrolls the page at rest ---- */
  const onWheel = (event: WheelEvent): void => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      clearHint();
      zoomBy(canvasWheelFactor(event.deltaY, event.deltaMode), local(event.clientX, event.clientY));
      return;
    }
    if (!fitted) {
      /* ENGAGED: the reader has zoomed or dragged, so the wheel is theirs to move around with. A
         mouse without a horizontal wheel pans sideways with Shift, the platform's own convention. */
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
      const dx = (event.shiftKey && event.deltaX === 0 ? event.deltaY : event.deltaX) * unit;
      const dy = (event.shiftKey && event.deltaX === 0 ? 0 : event.deltaY) * unit;
      const next = canvasClampView(
        { x: view.x - dx, y: view.y - dy, scale: view.scale },
        contentSize(),
        viewportSize(),
      );
      /* At an edge nothing moves, and then the scroll is NOT taken: it goes on to the page, so a
         reader who zoomed in is never trapped over the canvas. */
      if (next.x !== view.x || next.y !== view.y) {
        event.preventDefault();
        view = next;
        apply();
      }
      return;
    }
    /* A vertical scroll passing over the canvas is the page being read, not a failed zoom: only a
       reader who is plainly trying to act on the drawing gets told how. */
    if (Math.abs(event.deltaY) > 0 && root.matches(":hover")) hint("wheel");
  };

  /* ---- mouse and pen: drag pans ---- */
  let drag: { id: number; x: number; y: number; start: CanvasView; moved: boolean } | null = null;
  const onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: view, moved: false };
  };
  const onPointerMove = (event: PointerEvent): void => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < CANVAS_DRAG_THRESHOLD) return;
      drag.moved = true;
      viewport.setPointerCapture?.(event.pointerId);
      root.setAttribute(canvasAttrs.dragging, "");
    }
    move({ x: drag.start.x + dx, y: drag.start.y + dy, scale: drag.start.scale });
  };
  const onPointerUp = (event: PointerEvent): void => {
    if (!drag || event.pointerId !== drag.id) return;
    if (drag.moved) viewport.releasePointerCapture?.(event.pointerId);
    drag = null;
    root.removeAttribute(canvasAttrs.dragging);
  };

  /* ---- touch: one finger is the page's, two are the canvas's ---- */
  let pinch: { start: CanvasView; from: [CanvasPoint, CanvasPoint] } | null = null;
  const touchPoints = (event: TouchEvent): [CanvasPoint, CanvasPoint] => [
    local(event.touches[0]!.clientX, event.touches[0]!.clientY),
    local(event.touches[1]!.clientX, event.touches[1]!.clientY),
  ];
  let oneFinger: CanvasPoint | null = null;
  const onTouchStart = (event: TouchEvent): void => {
    if (event.touches.length >= 2) {
      clearHint();
      oneFinger = null;
      pinch = { start: view, from: touchPoints(event) };
    } else {
      oneFinger = { x: event.touches[0]!.clientX, y: event.touches[0]!.clientY };
    }
  };
  const onTouchMove = (event: TouchEvent): void => {
    if (pinch && event.touches.length >= 2) {
      /* The one listener that is NOT passive, and only for two fingers: this is where the canvas
         takes the gesture from the page. One finger never reaches a `preventDefault`. */
      if (event.cancelable) event.preventDefault();
      move(canvasPinchView(pinch.start, pinch.from, touchPoints(event), min, max));
      return;
    }
    /* One finger dragging SIDEWAYS is someone trying to move the drawing: a vertical drag is just
       the page scrolling past, and hinting at every scroll would be noise. */
    if (oneFinger && event.touches.length === 1) {
      const dx = Math.abs(event.touches[0]!.clientX - oneFinger.x);
      const dy = Math.abs(event.touches[0]!.clientY - oneFinger.y);
      if (dx > 12 && dx > dy) {
        hint("touch");
        oneFinger = null;
      }
    }
  };
  const onTouchEnd = (event: TouchEvent): void => {
    if (event.touches.length < 2) pinch = null;
    if (event.touches.length === 0) oneFinger = null;
  };
  /* Safari's own pinch-to-zoom of the PAGE, which `touch-action` alone does not stop there. */
  const onGesture = (event: Event): void => event.preventDefault();

  /* ---- keyboard ---- */
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const action = canvasKeyAction(event.key);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "zoom") zoomBy(action.by);
    else if (action.kind === "fit") fit();
    else if (action.kind === "actual") move(canvasZoomAround(view, clampZoom(1, min, max), centre()));
    else move({ x: view.x + action.dx, y: view.y + action.dy, scale: view.scale });
  };

  /* ---- buttons ---- */
  const onControl = (event: Event): void => {
    const action = (event.currentTarget as HTMLElement).getAttribute(canvasAttrs.action);
    if (action === "zoom-in") zoomBy(CANVAS_ZOOM_STEP);
    else if (action === "zoom-out") zoomBy(1 / CANVAS_ZOOM_STEP);
    else if (action === "fit") fit();
  };

  /* FIT ONLY: the drawing still fits and refits (the observers below), and that is all. Not one
     listener is attached, so the wheel, a drag and a pinch all stay the page's. */
  if (!options.fitOnly) {
    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: false });
    viewport.addEventListener("touchend", onTouchEnd);
    viewport.addEventListener("touchcancel", onTouchEnd);
    viewport.addEventListener("gesturestart", onGesture);
    viewport.addEventListener("keydown", onKeyDown);
    for (const control of controls) control.addEventListener("click", onControl);
  }

  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => layout());
  observer?.observe(viewport);
  observer?.observe(content);
  /*
   * THE WINDOW TOO, because the cap is `vh` and neither observed box has to change when it does. In
   * a content-sized iframe (every docs preview) the first fit ran at the default 150px frame, capped
   * the drawing at 120px, and the floor then pinned the viewport at one height while the frame grew
   * around it: nothing observed ever resized, and the diagram stayed at a third of its size.
   */
  const win = root.ownerDocument.defaultView;
  win?.addEventListener("resize", layout);
  layout();

  return () => {
    clearTimeout(hintTimer);
    observer?.disconnect();
    win?.removeEventListener("resize", layout);
    viewport.removeEventListener("wheel", onWheel);
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerup", onPointerUp);
    viewport.removeEventListener("pointercancel", onPointerUp);
    viewport.removeEventListener("touchstart", onTouchStart);
    viewport.removeEventListener("touchmove", onTouchMove);
    viewport.removeEventListener("touchend", onTouchEnd);
    viewport.removeEventListener("touchcancel", onTouchEnd);
    viewport.removeEventListener("gesturestart", onGesture);
    viewport.removeEventListener("keydown", onKeyDown);
    for (const control of controls) control.removeEventListener("click", onControl);
  };
}

/* ---------------------------------------------------------------------------------------------- *
 * Template - shared, because `Annotated` embeds the same structure around its frame.
 * ---------------------------------------------------------------------------------------------- */

/**
 * The canvas's own labels and hints, as options and slots. `Annotated` declares the same names when
 * it holds one, so a tree says "Acercar" to either one the same way.
 */
/**
 * FIT ONLY: the canvas as a frame that scales its drawing to fit and nothing more. For a drawing
 * that is read at rest and never explored (the docs' anatomy diagrams): no zoom bar, no hints, no
 * gestures, and the viewport is not a tab stop, because a focusable box that does nothing on any
 * key is a trap for the keyboard. It still refits on every resize, which is the part of the canvas
 * such a drawing needs: the same desktop layout, shown smaller on a phone. `Annotated` declares it
 * under the same name, so a tree says it to either one the same way.
 */
export const canvasFitOnlyOption = {
  fitOnly: {
    type: "boolean",
    default: false,
    attr: canvasAttrs.fitOnly,
    trueValue: "",
    machineInput: true,
  },
} as const;

export const canvasLabelOptions = {
  zoomInLabel: { type: "string", default: "Zoom in", attr: "aria-label" },
  zoomOutLabel: { type: "string", default: "Zoom out", attr: "aria-label" },
  fitLabel: { type: "string", default: "Fit to view", attr: "aria-label" },
} as const;

export const CANVAS_TOUCH_HINT = "Use two fingers to move the view";
export const CANVAS_WHEEL_HINT = "Use Ctrl + scroll to zoom";

const control = (action: CanvasAction, option: string, icon: string): ContractTemplate => ({
  element: "button",
  part: "control",
  also: ["sk-button", "sk-interactive"],
  options: [option],
  attrs: {
    type: "button",
    [canvasAttrs.action]: action,
    "data-icon-only": "",
    /* The smallest button there is: chrome on a drawing should take as little of it as possible. */
    "data-size": "xs",
    "data-variant": "ghost",
  },
  children: [{ element: "span", attrs: { "data-sk-icon": icon, "data-sk-icon-size": "sm" } }],
});

const hintNode = (kind: CanvasHint, slot: string, fallback: string): ContractTemplate => ({
  element: "p",
  part: "hint",
  attrs: { [canvasAttrs.hint]: kind, "aria-hidden": "true" },
  whenMissing: "fitOnly",
  children: [
    { element: "span", slot, whenGiven: slot },
    { element: "span", whenMissing: slot, text: fallback },
  ],
});

/**
 * The canvas's subtree below its root: viewport and content, the zoom bar, the two hints. `slot` is
 * where the content comes from, which is the whole difference between `Canvas` (its children) and
 * `Annotated` (its own frame, passed in as a template node).
 */
export const canvasTemplateChildren = (inner: ContractTemplate): readonly ContractTemplate[] =>
  [
    {
      element: "div",
      part: "viewport",
      /* Focusable, so the keyboard reaches the zoom; the root's group name is what it announces.
         Not when it only fits: there is nothing for the keyboard to do there. */
      attrsWhen: [{ option: "fitOnly", given: false, attrs: { tabindex: "0" } }],
      children: [{ element: "div", part: "content", children: [inner] }],
    },
    {
      element: "div",
      part: "controls",
      whenMissing: "fitOnly",
      children: [
        /* Top to bottom, the way a vertical zoom bar reads: in, out, then fit. */
        control("zoom-in", "zoomInLabel", "zoom-in"),
        control("zoom-out", "zoomOutLabel", "zoom-out"),
        control("fit", "fitLabel", "fit"),
      ],
    },
    hintNode("touch", "touchHint", CANVAS_TOUCH_HINT),
    hintNode("wheel", "wheelHint", CANVAS_WHEEL_HINT),
  ];

/* ---------------------------------------------------------------------------------------------- *
 * Contract
 * ---------------------------------------------------------------------------------------------- */

export const canvasContract = {
  id: "canvas",
  category: "content",
  css: "@skryensya/core/components/canvas.css",
  parts: canvasParts,
  hooks: [
    "--sk-canvas-bg",
    "--sk-canvas-border-color",
    "--sk-canvas-radius",
    "--sk-canvas-content-inline-size",
    "--sk-canvas-max-block-size",
    "--sk-canvas-min-block-size",
    "--sk-canvas-viewport-bg",
    "--sk-canvas-grid-color",
    "--sk-canvas-grid-size",
  ],

  options: {
    /** Names the canvas, and makes it a `group`. What the focused viewport is announced as. */
    label: { type: "string", attr: "aria-label" },
    /** The smallest scale a reader can zoom out to. */
    minZoom: {
      type: "number",
      default: CANVAS_MIN_ZOOM,
      min: 0.05,
      attr: canvasAttrs.minZoom,
      machineInput: true,
    },
    /** The largest scale a reader can zoom in to. */
    maxZoom: {
      type: "number",
      default: CANVAS_MAX_ZOOM,
      min: 1,
      attr: canvasAttrs.maxZoom,
      machineInput: true,
    },
    ...canvasFitOnlyOption,
    ...canvasLabelOptions,
  },

  signatures: {
    Canvas: {
      intent: [
        "pan-zoom",
        "zoomable-view",
        "canvas",
        "zoom-diagram",
        "large-figure-on-mobile",
        "figma-like-view",
      ],
      host: { element: "div" },
      mount: canvasAttrs.root,
      options: ["label", "minZoom", "maxZoom", "fitOnly", "zoomInLabel", "zoomOutLabel", "fitLabel"],
      slots: {
        /** What is shown. Laid out at its own width (`--sk-canvas-content-inline-size`). */
        children: { accepts: "node", required: true },
        /** The hint shown when one finger drags across the canvas. Default: "Use two fingers to move the view". */
        touchHint: { accepts: "text" },
        /** The hint shown when a plain wheel scrolls over it. Default: "Use Ctrl + scroll to zoom". */
        wheelHint: { accepts: "text" },
      },
      compose: [{ of: "icon", systemOwned: true }],
      template: {
        element: "div",
        part: "root",
        host: true,
        attrsWhen: [{ option: "label", given: true, attrs: { role: "group" } }],
        children: canvasTemplateChildren({ slot: "children" }),
      },
      react: { from: "@skryensya/react/canvas", name: "Canvas" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated. */
export type CanvasOptions = OptionsOf<typeof canvasContract>;
