import {
  canvasPinchView,
  canvasWheelFactor,
  canvasZoomAround,
  clampZoom,
  type CanvasPoint,
  type CanvasSize,
  type CanvasView,
} from "./canvas.js";
import type { ComponentContract, ContractTemplate, OptionsOf } from "./contract.js";

/*
 * LIGHTBOX, one image, or a gallery of them, shown as large as the screen allows, in a modal dialog.
 *
 * IT IS A DIALOG, and nothing else. There is no `lightbox` role; WAI's Modal Dialog pattern is the
 * whole accessibility contract, so the host is the native `<dialog>` opened with `showModal()`,
 * exactly as ADR-0005 demands of every modal here. The platform gives the top layer (so no portal and
 * no z-index), the inert page behind it, Escape, and a real `::backdrop`. What this file adds is what
 * the platform cannot know about: which image is showing, how to go to the next one, and how to look
 * closer at it.
 *
 * THE SPLIT, Canvas's: the arithmetic is pure and tested here (which index comes next, how far a
 * zoomed image may be dragged, whether a flick was a swipe); the event wiring is ONE framework-free
 * controller, `connectLightbox` in `lightbox-controller.ts`, which both bindings call on the same
 * markup. Two copies of pinch or focus-return logic would be two ways to be wrong.
 *
 * THE GEOMETRY IS CANVAS'S, with the origin moved to the stage's centre. A lightbox image is laid out
 * fitted by CSS (`max-inline-size`/`max-block-size: 100%`, never enlarged past its own pixels) and
 * zoomed with one `translate() scale()` about its centre, so every point below is measured from the
 * centre of the stage. `canvasZoomAround` and `canvasPinchView` do not care where the origin is, only
 * that points and the view agree on it, so they are reused rather than restated.
 */

/* ---------------------------------------------------------------------------------------------- *
 * Data
 * ---------------------------------------------------------------------------------------------- */

/** One image the lightbox can show. */
export type LightboxImage = {
  /** The full-size image: what the lightbox shows. */
  readonly src: string;
  /**
   * The text alternative, REQUIRED and never derived: a filename is not a description. `""` is the
   * honest value for an image that adds nothing a caption does not already say.
   */
  readonly alt: string;
  /**
   * A small version already on the page (the thumbnail that opened it). Shown blurred under the
   * loading indicator while `src` arrives, so the stage is never an empty black box.
   */
  readonly thumbnailSrc?: string;
  /** Visible caption heading. */
  readonly title?: string;
  /** Visible caption body. */
  readonly description?: string;
  /** Author, source or licence line. */
  readonly credit?: string;
  /** Intrinsic size, when known: reserves the image's box before it loads, so nothing jumps. */
  readonly width?: number;
  readonly height?: number;
};

/* ---------------------------------------------------------------------------------------------- *
 * Anatomy
 * ---------------------------------------------------------------------------------------------- */

export const lightboxParts = {
  /** The `<dialog>`. */
  root: "sk-lightbox",
  /** The outgoing photo during a swap, frozen where it was drawn. Created by the controller, never authored. */
  ghost: "sk-lightbox__ghost",
  /** The strip along the top: counter at the start, Close at the end. */
  toolbar: "sk-lightbox__toolbar",
  /** "3 / 12". Visual only; the live region says it in words. */
  counter: "sk-lightbox__counter",
  /** The end of the toolbar: Close, on its own. */
  actions: "sk-lightbox__actions",
  /** The zoom bar, Canvas's own: zoom in, zoom out and fit, stacked in one pill at the bottom end. */
  zoom: "sk-lightbox__zoom",
  /** Every icon-only button the lightbox draws. Which one is `data-lightbox-action`. */
  control: "sk-lightbox__control",
  /** Previous and next, over the inline edges of the stage. */
  nav: "sk-lightbox__nav",
  /** `<figure>`: the stage and its caption. */
  figure: "sk-lightbox__figure",
  /** The window the image is shown in, and the surface every gesture lands on. */
  stage: "sk-lightbox__stage",
  /** The full-size `<img>`. Created by the controller, never authored: an `<img>` with no `src` is not HTML. */
  image: "sk-lightbox__image",
  /** The thumbnail shown under the loading indicator. Also created by the controller. */
  placeholder: "sk-lightbox__placeholder",
  /** The loading indicator. A decorative Loader; the stage's state is what is announced. */
  loader: "sk-lightbox__loader",
  /** The text shown when an image fails to load. Words, never only an icon or a colour. */
  error: "sk-lightbox__error",
  /** `<figcaption>`: title, description and credit, each hidden while empty. */
  caption: "sk-lightbox__caption",
  title: "sk-lightbox__title",
  description: "sk-lightbox__description",
  credit: "sk-lightbox__credit",
  /** The polite live region that says "Image 3 of 12" once navigation settles. */
  live: "sk-lightbox__live",
  /** A thumbnail link that opens the lightbox. */
  trigger: "sk-lightbox__trigger",
} as const;

export type LightboxPart = keyof typeof lightboxParts;

export const lightboxAttrs = {
  /** The Vanilla enhancer's attachment point. */
  root: "data-sk-lightbox",
  /** Which action a control performs. */
  action: "data-lightbox-action",
  /** On a trigger: the id of the lightbox it opens. Every trigger naming one id is one gallery. */
  opens: "data-sk-lightbox-open",
  /** Trigger metadata. `href` is the image; these are the rest of a `LightboxImage`. */
  src: "data-lightbox-src",
  alt: "data-lightbox-alt",
  title: "data-lightbox-title",
  description: "data-lightbox-description",
  credit: "data-lightbox-credit",
  thumbnail: "data-lightbox-thumbnail",
  width: "data-lightbox-width",
  height: "data-lightbox-height",
  /** Configuration read by the controller off the root. */
  loop: "data-loop",
  zoom: "data-zoom",
  maxZoom: "data-max-zoom",
  counter: "data-counter",
  caption: "data-caption",
  closeOnBackdrop: "data-close-on-backdrop",
  counterLabel: "data-counter-label",
  /** Written by the controller on the root: `loading`, `loaded` or `error`. */
  status: "data-sk-status",
  /** Written while the image is zoomed past fit. */
  zoomed: "data-sk-zoomed",
  /** Written while a finger or the mouse is moving the image. */
  dragging: "data-sk-dragging",
  /** On the placeholder once it has loaded whole (and is the photo's shape): only then is it drawn. */
  ready: "data-sk-ready",
  /** On a ghost copied from the blurred placeholder rather than the photo: it keeps the blur. */
  ghostPlaceholder: "data-sk-ghost-placeholder",
  /** Written while a released image springs or glides home: the script is moving it, not CSS. */
  settling: "data-sk-settling",
  /** Written when the gallery holds a single image, so the stage can take the nav's room back. */
  single: "data-sk-single",
  /** On each image the controller knows the size of: the stylesheet can fit its box before it loads. */
  sized: "data-sk-sized",
  /** On the page's thumbnail while the photo is flying out of it or back into it: it hides there. */
  source: "data-sk-lightbox-source",
  /** Written while the closing animation runs, before the dialog actually closes. */
  closing: "data-sk-closing",
} as const;

export type LightboxAction = "close" | "previous" | "next" | "zoom-in" | "zoom-out" | "reset-zoom";
export const lightboxActions = [
  "zoom-out",
  "zoom-in",
  "reset-zoom",
  "close",
  "previous",
  "next",
] as const satisfies readonly LightboxAction[];

/* ---------------------------------------------------------------------------------------------- *
 * Navigation - pure
 * ---------------------------------------------------------------------------------------------- */

/**
 * Any requested index, made one that exists: truncated, and clamped into `0..count-1`. `-1` only
 * when there is nothing to show. A caller asking for image 40 of 12 gets the last one rather than
 * an exception or a blank stage; asking is not a bug worth crashing a page over.
 */
export function normalizeLightboxIndex(index: number | undefined, count: number): number {
  if (count <= 0) return -1;
  if (index === undefined || !Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), count - 1);
}

/**
 * The index one step away (`delta` is +1 or -1), or `null` when there is no such image: the end of a
 * gallery that does not loop, or a gallery of one, which has nowhere to go even when it loops.
 */
export function lightboxStep(index: number, delta: number, count: number, loop: boolean): number | null {
  if (count <= 1 || index < 0) return null;
  const next = index + delta;
  if (next >= 0 && next < count) return next;
  if (!loop) return null;
  return ((next % count) + count) % count;
}

/**
 * Which images to fetch ahead of time: the one after and the one before, never the current one
 * (the stage is already loading it) and never more than those two. A gallery of four hundred does
 * not download four hundred full-size photos because someone opened it.
 */
export function lightboxPreloadIndices(index: number, count: number, loop: boolean): number[] {
  const out: number[] = [];
  for (const delta of [1, -1]) {
    const at = lightboxStep(index, delta, count, loop);
    if (at !== null && at !== index && !out.includes(at)) out.push(at);
  }
  return out;
}

/**
 * Where the same image sits in a new list: by `src`, because that is what makes it the same image.
 * Replacing the gallery while it is open keeps the reader on the photo they were looking at, and
 * when that photo is the one that was removed, stays at the same position (clamped).
 */
export function lightboxReindex(
  current: LightboxImage | null,
  previousIndex: number,
  next: readonly LightboxImage[],
): number {
  if (next.length === 0) return -1;
  if (current) {
    const found = next.findIndex((image) => image.src === current.src);
    if (found >= 0) return found;
  }
  return normalizeLightboxIndex(previousIndex, next.length);
}

/** "Image {index} of {count}", filled. 1-based, because that is how people count photos. */
export function formatLightboxCounter(template: string, index: number, count: number): string {
  return template.replaceAll("{index}", String(index + 1)).replaceAll("{count}", String(count));
}

/* ---------------------------------------------------------------------------------------------- *
 * Zoom and pan - pure
 * ---------------------------------------------------------------------------------------------- */

/** Fit: the whole image, as large as the stage allows and never larger than its own pixels. */
export const LIGHTBOX_MIN_ZOOM = 1;
export const LIGHTBOX_MAX_ZOOM = 4;
/** Nobody needs more than this, and past it a photo is only its own compression artefacts. */
export const LIGHTBOX_ZOOM_CEILING = 10;
/** One press of a button or a key multiplies or divides the scale by this. */
export const LIGHTBOX_ZOOM_STEP = 1.5;
/** Where a double tap goes from fit. */
export const LIGHTBOX_DOUBLE_TAP_ZOOM = 2.5;
/** One arrow key moves a zoomed image this far, in screen px. */
export const LIGHTBOX_PAN_STEP = 60;

export type LightboxView = CanvasView;
export type LightboxSize = CanvasSize;
export type LightboxPoint = CanvasPoint;

/** Two sizes are one shape: within 2%, the rounding of a thumbnail resized to whole pixels. */
export function lightboxSameShape(aWidth: number, aHeight: number, bWidth: number, bHeight: number): boolean {
  if (!(aWidth > 0 && aHeight > 0 && bWidth > 0 && bHeight > 0)) return false;
  return Math.abs(Math.log(aWidth / aHeight / (bWidth / bHeight))) < 0.02;
}

/** The view at rest: fitted and centred. */
export const LIGHTBOX_FIT_VIEW: LightboxView = { x: 0, y: 0, scale: 1 };

/**
 * A `maxZoom` a caller supplied, made one that makes sense: at least fit, at most the ceiling, and
 * the default for anything that is not a number. `maxZoom: 0` or `Infinity` is a typo, not a wish.
 */
export function sanitizeLightboxMaxZoom(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return LIGHTBOX_MAX_ZOOM;
  return Math.min(Math.max(value, LIGHTBOX_MIN_ZOOM), LIGHTBOX_ZOOM_CEILING);
}

/**
 * Keep a zoomed image covering the stage wherever it can, and centred on any axis where it cannot.
 *
 * The drawn image is `fitted * scale`, centred on the stage before the translate. On an axis where it
 * is larger than the stage, it may slide until an EDGE of the image meets the edge of the stage and
 * no further, so there is never empty stage beside a zoomed photo and never a photo dragged off into
 * the dark. On an axis where it is still smaller, there is nothing to reveal by moving it, so it stays
 * centred. This is where the lightbox parts with Canvas's "keep half of it visible": a drawing on a
 * board may wander, a photo in a frame may not.
 */
export function lightboxClampView(view: LightboxView, fitted: LightboxSize, stage: LightboxSize): LightboxView {
  const axis = (at: number, size: number, window: number): number => {
    const slack = Math.max(0, (size * view.scale - window) / 2);
    return round(Math.min(slack, Math.max(-slack, at)));
  };
  return { x: axis(view.x, fitted.width, stage.width), y: axis(view.y, fitted.height, stage.height), scale: view.scale };
}

/**
 * How far past its limit a dragged photo actually goes, for `overshoot` px of pull. Never a wall:
 * the photo keeps following the hand, less and less, up to `limit`, and on release it springs back
 * (the stylesheet's transition). The curve is the one every phone uses at the end of a scroll.
 */
export function lightboxRubberBand(overshoot: number, limit: number): number {
  if (overshoot === 0 || limit <= 0) return 0;
  const pulled = Math.abs(overshoot);
  return Math.sign(overshoot) * (1 - 1 / ((pulled * 0.55) / limit + 1)) * limit;
}

/**
 * THE TETHER: where a photo at fit is drawn for `pulled` px of drag. It is held to the centre by
 * something elastic, not a wall: almost 1:1 near the centre, so it feels picked up rather than stuck,
 * and ever heavier further out, never past `reach`. `lightboxUntether` is the inverse, so a photo
 * caught mid-spring is picked up exactly where it is drawn.
 */
export function lightboxTether(pulled: number, reach: number): number {
  if (reach <= 0) return 0;
  return pulled / (1 + Math.abs(pulled) / reach);
}

export function lightboxUntether(drawn: number, reach: number): number {
  if (reach <= 0) return 0;
  const held = Math.min(Math.abs(drawn), reach * 0.999);
  return (Math.sign(drawn) * held) / (1 - held / reach);
}

/**
 * How far the tether lets a photo go, per axis: a share of the stage, so it scales with the screen,
 * but never more than `LIGHTBOX_TETHER_MAX` px. The photo is held, not carried: it gives a little
 * under the hand and no more. A swipe is judged on the HAND's travel, not the photo's, so a short
 * reach costs no swipe.
 */
export const LIGHTBOX_TETHER_REACH = 0.2;
export const LIGHTBOX_TETHER_MAX = 120;

/**
 * A damped spring, per axis, in px and px/s. Two tunings: `release` carries a photo let go at fit
 * back to the centre with the hand's own speed and one barely-there overshoot (damping ratio 0.84),
 * which is what makes it read as elastic rather than eased, and quickly: home in about 0.15s, because a photo that dawdles back reads as sluggish, not as soft; `glide` lands a flung, zoomed photo at the end
 * of its momentum without a bounce (critically damped), because a photo in a frame should not wobble
 * against its edge.
 */
export type LightboxSpring = { readonly stiffness: number; readonly damping: number };
export const LIGHTBOX_SPRING_RELEASE: LightboxSpring = { stiffness: 1100, damping: 56 };
export const LIGHTBOX_SPRING_GLIDE: LightboxSpring = { stiffness: 170, damping: 26 };

export type LightboxSpringAxis = { position: number; velocity: number };

/**
 * Advance one axis by `dtMs` toward `target`. Semi-implicit Euler in fixed sub-steps of at most 4ms,
 * so a dropped frame (or a 30 Hz screen) takes more steps instead of exploding.
 */
export function lightboxSpringStep(
  axis: LightboxSpringAxis,
  target: number,
  dtMs: number,
  spring: LightboxSpring,
): LightboxSpringAxis {
  let { position, velocity } = axis;
  let remaining = Math.min(Math.max(dtMs, 0), 64) / 1000;
  while (remaining > 0) {
    const dt = Math.min(remaining, 0.004);
    velocity += (-spring.stiffness * (position - target) - spring.damping * velocity) * dt;
    position += velocity * dt;
    remaining -= dt;
  }
  return { position, velocity };
}

/** At rest: within half a pixel of the target and slower than a pixel every 100ms. */
export const lightboxSpringSettled = (axis: LightboxSpringAxis, target: number): boolean =>
  Math.abs(axis.position - target) < 0.5 && Math.abs(axis.velocity) < 10;

/**
 * Where a fling would coast to on its own, from its release speed in px/ms: the momentum of a
 * scroll view (a 0.995-per-ms decay, summed). The controller aims the glide spring there, clamped
 * into the frame, so a flick carries on and settles instead of stopping under the finger.
 */
export const lightboxFlingDistance = (velocityPxPerMs: number): number => velocityPxPerMs * (0.995 / (1 - 0.995));

/**
 * A pan of a zoomed photo WHILE the hand is still on it: `lightboxClampView`'s bounds, but elastic.
 * Past an edge the photo still moves, damped by `lightboxRubberBand`, so the edge is felt rather than
 * hit. The controller lets go by gliding it back inside.
 */
export function lightboxElasticView(view: LightboxView, fitted: LightboxSize, stage: LightboxSize): LightboxView {
  const held = lightboxClampView(view, fitted, stage);
  return {
    x: round(held.x + lightboxRubberBand(view.x - held.x, stage.width / 2)),
    y: round(held.y + lightboxRubberBand(view.y - held.y, stage.height / 2)),
    scale: view.scale,
  };
}

/**
 * Zoom to `next` around a point (relative to the stage's centre), and keep the result in bounds.
 * Reaching fit always means centred: a photo zoomed back out lands where it started, not wherever
 * the last anchor happened to leave it.
 */
export function lightboxZoomTo(
  view: LightboxView,
  next: number,
  anchor: LightboxPoint,
  fitted: LightboxSize,
  stage: LightboxSize,
  maxZoom = LIGHTBOX_MAX_ZOOM,
): LightboxView {
  const scale = clampZoom(next, LIGHTBOX_MIN_ZOOM, maxZoom);
  if (scale <= LIGHTBOX_MIN_ZOOM + 1e-6) return LIGHTBOX_FIT_VIEW;
  return lightboxClampView(canvasZoomAround(view, scale, anchor), fitted, stage);
}

/** Two fingers, as one transform: Canvas's pinch, then held in the frame. */
export function lightboxPinchView(
  start: LightboxView,
  from: readonly [LightboxPoint, LightboxPoint],
  to: readonly [LightboxPoint, LightboxPoint],
  fitted: LightboxSize,
  stage: LightboxSize,
  maxZoom = LIGHTBOX_MAX_ZOOM,
): LightboxView {
  const view = canvasPinchView(start, from, to, LIGHTBOX_MIN_ZOOM, maxZoom);
  if (view.scale <= LIGHTBOX_MIN_ZOOM + 1e-6) return LIGHTBOX_FIT_VIEW;
  return lightboxClampView(view, fitted, stage);
}

/** How much one wheel event zooms by: Canvas's curve, so a notch feels the same in both. */
export const lightboxWheelFactor = canvasWheelFactor;

/** The image's transform. Origin centre, which `lightbox.css` sets. */
export const lightboxTransform = (view: LightboxView): string =>
  view.scale === 1 && view.x === 0 && view.y === 0
    ? ""
    : `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;

/* ---------------------------------------------------------------------------------------------- *
 * Gestures - pure
 * ---------------------------------------------------------------------------------------------- */

/** A finger has to move this far, in px, before it is a gesture rather than a tap. */
export const LIGHTBOX_TAP_SLOP = 8;
/** A release this far along one axis is a swipe, whatever its speed. */
export const LIGHTBOX_SWIPE_DISTANCE = 64;
/** A shorter release still counts when it is this fast, in px/ms: a flick. */
export const LIGHTBOX_SWIPE_VELOCITY = 0.45;
/** Two taps this close in time (ms) and space (px) are a double tap. */
export const LIGHTBOX_DOUBLE_TAP_MS = 300;
export const LIGHTBOX_DOUBLE_TAP_SLOP = 24;

export type LightboxSwipe = "next" | "previous" | "close";

/**
 * What a released one-finger drag at FIT meant. A swipe has to be clearly along one axis (the other
 * at most two thirds of it), so a diagonal smear does nothing rather than something surprising.
 *
 * Horizontal goes to a neighbour: dragging the photo LEFT brings the next one in, mirrored in a
 * right-to-left page, where "next" sits on the left. Vertical DOWNWARD dismisses, the gesture every
 * phone photo viewer taught; upward does nothing, because nothing is up there.
 *
 * Never called for a zoomed image: there, the same drag is a pan, and deciding that is the
 * controller's job, not a threshold's.
 */
export function lightboxSwipeVerdict(
  dx: number,
  dy: number,
  durationMs: number,
  options: { readonly rtl?: boolean; readonly closeOnSwipeDown?: boolean } = {},
): LightboxSwipe | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  const speed = (distance: number) => (durationMs > 0 ? distance / durationMs : 0);
  const decisive = (distance: number) =>
    distance >= LIGHTBOX_SWIPE_DISTANCE ||
    (distance >= LIGHTBOX_TAP_SLOP * 2 && speed(distance) >= LIGHTBOX_SWIPE_VELOCITY);

  if (ax > ay * 1.5 && decisive(ax)) {
    const forward = dx < 0 !== Boolean(options.rtl);
    return forward ? "next" : "previous";
  }
  if (options.closeOnSwipeDown !== false && dy > 0 && ay > ax * 1.5 && decisive(ay)) return "close";
  return null;
}

/* ---------------------------------------------------------------------------------------------- *
 * Keyboard - pure
 * ---------------------------------------------------------------------------------------------- */

export type LightboxKeyAction =
  | { readonly kind: "close" }
  | { readonly kind: "step"; readonly delta: 1 | -1 }
  | { readonly kind: "edge"; readonly to: "first" | "last" }
  | { readonly kind: "zoom"; readonly by: number }
  | { readonly kind: "reset" }
  | { readonly kind: "pan"; readonly dx: number; readonly dy: number };

/**
 * What a key does, or `null` for a key the lightbox leaves alone (Tab, Enter and Space are the
 * focused button's, and any chord with Ctrl, Cmd or Alt is the browser's).
 *
 * THE ARROWS DEPEND ON THE ZOOM. At fit, Left and Right go to the neighbours (mirrored in RTL, the
 * same way the swipe is). Zoomed in, all four arrows move the image instead: panning is something
 * the mouse and a finger can do, so the keyboard has to be able to do it too (WCAG 2.1.1), and
 * leaving a zoomed photo by accident is exactly what a reader looking closely does not want. `0`
 * returns to fit, and then the arrows navigate again.
 */
export function lightboxKeyAction(
  event: { readonly key: string; readonly ctrlKey?: boolean; readonly metaKey?: boolean; readonly altKey?: boolean },
  state: { readonly zoomed: boolean; readonly zoomEnabled: boolean; readonly rtl?: boolean },
): LightboxKeyAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  const forward = state.rtl ? -1 : 1;
  switch (event.key) {
    case "Escape":
      return { kind: "close" };
    case "ArrowLeft":
      return state.zoomed ? { kind: "pan", dx: LIGHTBOX_PAN_STEP, dy: 0 } : { kind: "step", delta: -forward as 1 | -1 };
    case "ArrowRight":
      return state.zoomed ? { kind: "pan", dx: -LIGHTBOX_PAN_STEP, dy: 0 } : { kind: "step", delta: forward as 1 | -1 };
    case "ArrowUp":
      return state.zoomed ? { kind: "pan", dx: 0, dy: LIGHTBOX_PAN_STEP } : null;
    case "ArrowDown":
      return state.zoomed ? { kind: "pan", dx: 0, dy: -LIGHTBOX_PAN_STEP } : null;
    case "Home":
      return state.zoomed ? null : { kind: "edge", to: "first" };
    case "End":
      return state.zoomed ? null : { kind: "edge", to: "last" };
    case "+":
    case "=":
      return state.zoomEnabled ? { kind: "zoom", by: LIGHTBOX_ZOOM_STEP } : null;
    case "-":
    case "_":
      return state.zoomEnabled ? { kind: "zoom", by: 1 / LIGHTBOX_ZOOM_STEP } : null;
    case "0":
      return state.zoomEnabled ? { kind: "reset" } : null;
    default:
      return null;
  }
}

/* Two decimals of a pixel, and never `-0`: a clamp at zero slack otherwise writes `translate(0px, -0px)`. */
function round(value: number): number {
  return Math.round(value * 100) / 100 || 0;
}

/* ---------------------------------------------------------------------------------------------- *
 * Template
 * ---------------------------------------------------------------------------------------------- */

/*
 * ONE KIND OF BUTTON: ghost, sm (a 44px hit area around a smaller face). The zoom bar is Canvas's,
 * ghost buttons in one pill; Close, previous and next are the same lone ghost button, so the chrome
 * reads as one set and the photo stays the loudest thing on the screen.
 */
const controlLook = {
  zoom: { variant: "ghost", size: "sm", icon: "md" },
  close: { variant: "ghost", size: "sm", icon: "md" },
  nav: { variant: "ghost", size: "sm", icon: "md" },
} as const;

const control = (
  action: LightboxAction,
  option: string,
  icon: string,
  look: keyof typeof controlLook,
): ContractTemplate => ({
  element: "button",
  part: look === "nav" ? "nav" : "control",
  also: look === "nav" ? [lightboxParts.control, "sk-button", "sk-interactive"] : ["sk-button", "sk-interactive"],
  options: [option],
  attrs: {
    type: "button",
    [lightboxAttrs.action]: action,
    "data-icon-only": "",
    "data-variant": controlLook[look].variant,
    "data-size": controlLook[look].size,
  },
  children: [{ element: "span", attrs: { "data-sk-icon": icon, "data-sk-icon-size": controlLook[look].icon } }],
});

/* ---------------------------------------------------------------------------------------------- *
 * Contract
 * ---------------------------------------------------------------------------------------------- */

/*
 * THE MARKUP IS THE SHELL; THE CONTROLLER FILLS IT. Which image, its caption, the counter and the
 * disabled ends all change with the index, and both bindings get them from `connectLightbox`, so a
 * React re-render and an authored page can never disagree about which photo is up. What the markup
 * owns is everything that does NOT change: the buttons, their names, the regions.
 *
 * THE GALLERY IS THE TRIGGERS. Every `Lightbox.Trigger` naming a lightbox's id, in document order,
 * is one gallery, and clicking one opens it at that position. A trigger is an `<a href>` to the full
 * image, so with no script at all it still opens the photo.
 */
export const lightboxContract = {
  id: "lightbox",
  category: "overlays",
  css: "@skryensya/core/components/lightbox.css",
  parts: lightboxParts,
  /* The images, the placeholder and the caption's text are the controller's, in both bindings. */
  systemOwned: ["image", "placeholder"],
  hooks: [
    "--sk-lightbox-backdrop-bg",
    "--sk-lightbox-bg",
    "--sk-lightbox-fg",
    "--sk-lightbox-muted-fg",
    "--sk-lightbox-control-bg",
    "--sk-lightbox-control-border-color",
    "--sk-lightbox-caption-bg",
    "--sk-lightbox-caption-max-block-size",
    "--sk-lightbox-chrome-distance",
    "--sk-lightbox-gutter",
    "--sk-lightbox-image-radius",
    "--sk-lightbox-image-shadow",
    "--sk-lightbox-nav-room",
    "--sk-lightbox-trigger-radius",
  ],
  /*
   * The page behind a lightbox must not scroll, and `scroll-lock.css` is the system's one way to say
   * so (ADR-0005: the import IS the consent). Naming it here is what makes choosing a Lightbox that
   * consent: a full-screen viewer over a page that still scrolls under a wheel is not a choice anyone
   * makes on purpose.
   */
  hookSheets: ["@skryensya/core/patterns/scroll-lock.css", "@skryensya/core/patterns/visually-hidden.css"],

  options: {
    /** The lightbox's id, which its triggers name in `opens`. */
    lightboxId: { type: "string", attr: "id", prop: "id" },
    /**
     * The dialog's accessible name. Defaulted rather than required: a viewer of photos has no
     * natural heading, and "Image viewer" is a true one. Name it after the gallery when there is one.
     */
    label: { type: "string", default: "Image viewer", attr: "aria-label" },
    closeLabel: { type: "string", default: "Close", attr: "aria-label" },
    previousLabel: { type: "string", default: "Previous image", attr: "aria-label" },
    nextLabel: { type: "string", default: "Next image", attr: "aria-label" },
    zoomInLabel: { type: "string", default: "Zoom in", attr: "aria-label" },
    zoomOutLabel: { type: "string", default: "Zoom out", attr: "aria-label" },
    resetZoomLabel: { type: "string", default: "Reset zoom", attr: "aria-label" },
    /** What the stage says when an image cannot be loaded. */
    errorLabel: {
      type: "string",
      default: "This image could not be loaded.",
      attr: "data-error-label",
      machineInput: true,
    },
    /** What the live region says on navigation. `{index}` and `{count}` are filled in, 1-based. */
    counterLabel: {
      type: "string",
      default: "Image {index} of {count}",
      attr: lightboxAttrs.counterLabel,
      machineInput: true,
    },
    /** Next from the last image goes to the first, and back. Off: the ends are ends, and say so. */
    loop: { type: "boolean", default: false, attr: lightboxAttrs.loop, trueValue: "", machineInput: true },
    /** Zoom and pan. Off: no zoom buttons, no wheel, no pinch; the image only fits. */
    zoom: { type: "boolean", default: true, attr: lightboxAttrs.zoom, falseValue: "false", machineInput: true },
    /** How far in the zoom goes, as a multiple of fit. */
    maxZoom: {
      type: "number",
      default: LIGHTBOX_MAX_ZOOM,
      min: LIGHTBOX_MIN_ZOOM,
      max: LIGHTBOX_ZOOM_CEILING,
      attr: lightboxAttrs.maxZoom,
      machineInput: true,
    },
    /** The "3 / 12" in the toolbar. Never drawn for a single image. */
    counter: {
      type: "boolean",
      default: true,
      attr: lightboxAttrs.counter,
      falseValue: "false",
      prop: "showCounter",
      machineInput: true,
    },
    /** The caption under the image, when the image has anything to put in it. */
    caption: {
      type: "boolean",
      default: true,
      attr: lightboxAttrs.caption,
      falseValue: "false",
      prop: "showCaption",
      machineInput: true,
    },
    /** A click or tap on the dark around the image closes. Buttons and Escape always do. */
    closeOnBackdrop: {
      type: "boolean",
      default: true,
      attr: lightboxAttrs.closeOnBackdrop,
      falseValue: "false",
      prop: "closeOnBackdropClick",
      machineInput: true,
    },

    /* ---- Lightbox.Trigger ---- */
    /** The `lightboxId` of the lightbox this trigger opens. */
    opens: {
      type: "string",
      attr: lightboxAttrs.opens,
      refersTo: { contract: "lightbox", option: "lightboxId" },
    },
    /** The full-size image. Also the link's own destination, so it works with no script at all. */
    triggerSrc: { type: "string", attr: "href", prop: "src" },
    /** The full image's alt, when it should differ from the thumbnail's own. */
    triggerAlt: { type: "string", attr: lightboxAttrs.alt, prop: "alt" },
    triggerTitle: { type: "string", attr: lightboxAttrs.title, prop: "title" },
    triggerDescription: { type: "string", attr: lightboxAttrs.description, prop: "description" },
    triggerCredit: { type: "string", attr: lightboxAttrs.credit, prop: "credit" },
    triggerWidth: { type: "number", min: 1, integer: true, attr: lightboxAttrs.width, prop: "width" },
    triggerHeight: { type: "number", min: 1, integer: true, attr: lightboxAttrs.height, prop: "height" },
    /**
     * A small copy of the full image, at ITS proportions: shown blurred while the full one loads, and
     * what flies out of the thumbnail when that is not loaded yet. Needed whenever the thumbnail on the
     * page is a crop (a square grid): a crop is never used, because turning into a different shape
     * when the real photo lands is exactly the jump this exists to avoid.
     */
    triggerThumbnail: { type: "string", attr: lightboxAttrs.thumbnail, prop: "thumbnailSrc" },
  },

  signatures: {
    Lightbox: {
      intent: ["lightbox", "image-viewer", "photo-gallery-viewer", "zoom-image", "fullscreen-image"],
      host: { element: "dialog" },
      mount: lightboxAttrs.root,
      options: [
        "lightboxId",
        "label",
        "closeLabel",
        "previousLabel",
        "nextLabel",
        "zoomInLabel",
        "zoomOutLabel",
        "resetZoomLabel",
        "errorLabel",
        "counterLabel",
        "loop",
        "zoom",
        "maxZoom",
        "counter",
        "caption",
        "closeOnBackdrop",
      ],
      forward: ["aria-*"],
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "loader", sheets: ["@skryensya/core/components/loader.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      slots: {},
      template: {
        element: "dialog",
        part: "root",
        host: true,
        children: [
          {
            element: "div",
            part: "toolbar",
            children: [
              { element: "p", part: "counter", attrs: { "aria-hidden": "true" } },
              {
                element: "div",
                part: "actions",
                children: [control("close", "closeLabel", "close", "close")],
              },
            ],
          },
          {
            element: "figure",
            part: "figure",
            children: [
              {
                element: "div",
                part: "stage",
                children: [
                  {
                    element: "span",
                    part: "loader",
                    also: ["sk-loader"],
                    attrs: { "aria-hidden": "true", "data-size": "lg" },
                  },
                  {
                    element: "p",
                    part: "error",
                    options: ["errorLabel"],
                    attrs: { hidden: "" },
                    textFromOption: "errorLabel",
                  },
                ],
              },
              {
                element: "figcaption",
                part: "caption",
                attrs: { hidden: "" },
                children: [
                  { element: "p", part: "title", attrs: { hidden: "" } },
                  { element: "p", part: "description", attrs: { hidden: "" } },
                  { element: "p", part: "credit", attrs: { hidden: "" } },
                ],
              },
            ],
          },
          control("previous", "previousLabel", "chevron-left", "nav"),
          control("next", "nextLabel", "chevron-right", "nav"),
          {
            element: "div",
            part: "zoom",
            children: [
              /* Top to bottom, the way Canvas's vertical zoom bar reads: in, out, then fit. */
              control("zoom-in", "zoomInLabel", "zoom-in", "zoom"),
              control("zoom-out", "zoomOutLabel", "zoom-out", "zoom"),
              control("reset-zoom", "resetZoomLabel", "fit", "zoom"),
            ],
          },
          {
            element: "p",
            part: "live",
            also: ["sk-visually-hidden"],
            attrs: { "aria-live": "polite", "aria-atomic": "true" },
          },
        ],
      },
      react: { from: "@skryensya/react/lightbox", name: "Lightbox" },
    },

    /*
     * WHAT OPENS IT, from wherever the page shows a thumbnail. A link to the full image, so a page
     * with no script still shows the photo; the enhancer (or React's effect) turns the click into
     * the lightbox, and a Ctrl/Cmd click still opens the image in a new tab the way a link should.
     */
    "Lightbox.Trigger": {
      intent: ["open-image-in-lightbox", "gallery-thumbnail", "enlarge-image"],
      host: { element: "a" },
      options: [
        "opens",
        "triggerSrc",
        "triggerAlt",
        "triggerTitle",
        "triggerDescription",
        "triggerCredit",
        "triggerWidth",
        "triggerHeight",
        "triggerThumbnail",
      ],
      requires: ["opens", "triggerSrc"],
      forward: ["id", "aria-*"],
      slots: {
        /** The thumbnail: an ImageFrame or a plain image. Its `alt` names the link. */
        children: { accepts: "node", required: true },
      },
      template: {
        element: "a",
        part: "trigger",
        host: true,
        attrs: { "aria-haspopup": "dialog" },
        slot: "children",
      },
      react: { from: "@skryensya/react/lightbox", name: "Lightbox.Trigger" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated. */
export type LightboxOptions = OptionsOf<typeof lightboxContract>;
