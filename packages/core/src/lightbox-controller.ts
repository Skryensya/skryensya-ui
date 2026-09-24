import { isTypingContext } from "./hotkey.js";
import {
  LIGHTBOX_DOUBLE_TAP_MS,
  LIGHTBOX_DOUBLE_TAP_SLOP,
  LIGHTBOX_DOUBLE_TAP_ZOOM,
  LIGHTBOX_FIT_VIEW,
  LIGHTBOX_MIN_ZOOM,
  LIGHTBOX_TAP_SLOP,
  LIGHTBOX_ZOOM_STEP,
  formatLightboxCounter,
  lightboxAttrs,
  lightboxClampView,
  lightboxContract,
  lightboxKeyAction,
  lightboxParts,
  lightboxPinchView,
  lightboxPreloadIndices,
  lightboxReindex,
  lightboxStep,
  lightboxSwipeVerdict,
  lightboxTransform,
  lightboxWheelFactor,
  lightboxZoomTo,
  normalizeLightboxIndex,
  sanitizeLightboxMaxZoom,
  type LightboxAction,
  type LightboxImage,
  type LightboxPoint,
  type LightboxSize,
  type LightboxView,
} from "./lightbox.js";

/*
 * LIGHTBOX, the controller: the one place a lightbox's behaviour is wired. DOM-touching and
 * framework-free, for Canvas's reason: both bindings need exactly the same listeners, and two copies
 * of focus return or pinch arithmetic are two ways to be wrong. The Vanilla enhancer calls it on
 * authored markup; the React component calls it in an effect on the markup it rendered.
 *
 * WHAT IT WRITES, and nothing else: the two `<img>` it creates inside the stage, the text of the
 * counter, caption and live region, `hidden`/`aria-disabled` on the parts that come and go, the
 * image's `transform`, and a few `data-sk-*` flags on the root. React renders none of those, so the
 * two never fight over an attribute.
 *
 * ONE LIFECYCLE, whatever opens it. A thumbnail click, a button, another component and `open()` from
 * a script all run `open()` below, and every way of closing (the button, Escape, the backdrop, a
 * swipe down, `close()`, a `<form method="dialog">`, someone calling `dialog.close()` directly)
 * converges on the dialog's own `close` event and `finish()`. That is the only way to promise that
 * focus, listeners and the scroll lock are restored the same way every time.
 *
 * WHAT THE PLATFORM ALREADY DOES, and is not redone here: `showModal()` puts the dialog in the top
 * layer (no portal, no z-index), makes everything outside it inert (no `aria-hidden` sweep), and
 * draws `::backdrop`. `scroll-lock.css` freezes the page through `html:has(dialog:modal)`. What IS
 * done here is what the platform leaves loose: focus goes to a known control on open and back to a
 * CONNECTED element on close, Tab wraps inside the dialog instead of escaping to the browser chrome,
 * and Escape runs the same close as everything else.
 */

/** Settings a caller can give once (`connectLightbox`) or per opening (`open`). */
export type LightboxSettings = {
  /** Next from the last image goes to the first, and back. Default false. */
  readonly loop?: boolean;
  /** Zoom and pan. Default true. */
  readonly zoom?: boolean;
  /** How far in the zoom goes, as a multiple of fit. Default 4, at most 10. */
  readonly maxZoom?: number;
  /** The "3 / 12" in the toolbar. Default true; never drawn for one image. */
  readonly showCounter?: boolean;
  /** The caption, when the image has anything to put in it. Default true. */
  readonly showCaption?: boolean;
  /** A click on the dark around the image closes. Default true. */
  readonly closeOnBackdropClick?: boolean;
};

export type LightboxStatus = "idle" | "loading" | "loaded" | "error";

/** A snapshot. A new object on every change, so it can back `useSyncExternalStore` as is. */
export type LightboxState = {
  readonly open: boolean;
  readonly images: readonly LightboxImage[];
  /** `-1` while closed with nothing loaded. */
  readonly index: number;
  readonly count: number;
  readonly image: LightboxImage | null;
  /** 1 is fit. */
  readonly zoom: number;
  readonly status: LightboxStatus;
};

export type LightboxOpenOptions = LightboxSettings & {
  readonly images: readonly LightboxImage[];
  /** Which image to start on. Clamped into range; defaults to the first. */
  readonly index?: number;
  /**
   * Where focus returns on close. Defaults to whatever had focus when `open()` was called, so a
   * button that opens the lightbox gets focus back without saying so. `null` says "nowhere in
   * particular" and leaves the choice to `fallbackFocus`.
   */
  readonly returnFocus?: HTMLElement | null;
};

export type LightboxCallbacks = {
  readonly onOpenChange?: (open: boolean) => void;
  readonly onIndexChange?: (index: number, image: LightboxImage) => void;
  readonly onImageLoad?: (image: LightboxImage, index: number) => void;
  readonly onImageError?: (image: LightboxImage, index: number) => void;
};

export type LightboxConfig = LightboxSettings &
  LightboxCallbacks & {
    /** "Image {index} of {count}", read by the live region. */
    readonly counterLabel?: string;
    /**
     * Where focus goes on close when `returnFocus` is gone (removed from the page while the
     * lightbox was open) or was never there (opened from a timer, a route change). Returning
     * nothing leaves focus where the platform puts it.
     */
    readonly fallbackFocus?: () => HTMLElement | null;
  };

/** The whole public surface. Everything is a safe no-op when it cannot apply. */
export interface LightboxController {
  /** Opens on these images; while open, replaces them. An empty list does nothing. */
  open(options: LightboxOpenOptions): void;
  close(): void;
  next(): void;
  previous(): void;
  /** Goes to an index that exists; anything else is ignored. */
  goTo(index: number): void;
  zoomIn(): void;
  zoomOut(): void;
  resetZoom(): void;
  /**
   * Replaces the gallery. While open, the reader stays on the same photo if it is still there and
   * at the same position if it is not; an empty list closes. `index` overrides both.
   */
  setImages(images: readonly LightboxImage[], index?: number): void;
  getState(): LightboxState;
  subscribe(listener: () => void): () => void;
  /** Merge new configuration: React passes its current props on every render. */
  configure(config: LightboxConfig): void;
  /** Closes (restoring focus), removes every listener and the elements it created. */
  destroy(): void;
}

/** Fired on the `<dialog>`, for authored pages that listen rather than subscribe. */
export const lightboxEvents = {
  openChange: "sk:lightboxopenchange",
  indexChange: "sk:lightboxindexchange",
} as const;

const PRELOAD_CACHE = 6;
const ANNOUNCE_DELAY = 350;

const controllers = new WeakMap<HTMLElement, LightboxController>();

/** The controller already connected to this dialog, if any. */
export function getLightboxController(dialog: HTMLElement): LightboxController | null {
  return controllers.get(dialog) ?? null;
}

/** A trigger, read as the image it opens. `href` is the image; the rest are data attributes. */
export function lightboxImageFromTrigger(trigger: Element): LightboxImage {
  const thumb = trigger.querySelector("img");
  const number = (attr: string): number | undefined => {
    const value = Number.parseInt(trigger.getAttribute(attr) ?? "", 10);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };
  const text = (attr: string): string | undefined => trigger.getAttribute(attr)?.trim() || undefined;
  const thumbnailSrc = thumb?.currentSrc || thumb?.getAttribute("src") || undefined;
  return {
    src: trigger.getAttribute(lightboxAttrs.src) ?? trigger.getAttribute("href") ?? "",
    alt: trigger.getAttribute(lightboxAttrs.alt) ?? thumb?.getAttribute("alt") ?? "",
    thumbnailSrc,
    title: text(lightboxAttrs.title),
    description: text(lightboxAttrs.description),
    credit: text(lightboxAttrs.credit),
    width: number(lightboxAttrs.width),
    height: number(lightboxAttrs.height),
  };
}

/** Every trigger that opens the lightbox with this id, in document order: one gallery. */
export function lightboxTriggers(doc: Document, id: string): HTMLElement[] {
  if (!id) return [];
  return Array.from(doc.querySelectorAll<HTMLElement>(`[${lightboxAttrs.opens}]`)).filter(
    (trigger) => trigger.getAttribute(lightboxAttrs.opens) === id,
  );
}

/** An image the controller can actually show; anything else in a caller's list is dropped. */
const isShowable = (image: unknown): image is LightboxImage =>
  typeof image === "object" &&
  image !== null &&
  typeof (image as LightboxImage).src === "string" &&
  (image as LightboxImage).src.trim() !== "";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Wire one lightbox. Both bindings call exactly this on a `<dialog>` carrying the lightbox's parts.
 * Connecting the same dialog twice returns the controller it already has.
 */
export function connectLightbox(dialog: HTMLDialogElement, initial: LightboxConfig = {}): LightboxController {
  const existing = controllers.get(dialog);
  if (existing) {
    existing.configure(initial);
    return existing;
  }

  const doc = dialog.ownerDocument;
  const win = doc.defaultView ?? window;
  const part = <T extends HTMLElement = HTMLElement>(name: keyof typeof lightboxParts): T | null =>
    dialog.querySelector<T>(`.${lightboxParts[name]}`);

  /* A stage is where the image goes; markup without one degrades to the dialog itself rather than
     throwing on a page that merely forgot a wrapper. */
  const stage = part("stage") ?? dialog;
  const counter = part("counter");
  const caption = part("caption");
  const captionTitle = part("title");
  const captionDescription = part("description");
  const captionCredit = part("credit");
  const errorText = part("error");
  const live = part("live");
  const controls = Array.from(dialog.querySelectorAll<HTMLButtonElement>(`[${lightboxAttrs.action}]`));
  const control = (action: LightboxAction) =>
    controls.find((button) => button.getAttribute(lightboxAttrs.action) === action) ?? null;

  /* The two images are created, never authored: an `<img>` with no `src` is not HTML, and a closed
     lightbox has nothing to put in one. Prepended, so the loader and the error text paint above. */
  const createImage = (className: string): HTMLImageElement => {
    const img = doc.createElement("img");
    img.className = className;
    img.alt = "";
    img.decoding = "async";
    img.draggable = false;
    return img;
  };
  const placeholder = createImage(lightboxParts.placeholder);
  placeholder.setAttribute("aria-hidden", "true");
  placeholder.hidden = true;
  const image = createImage(lightboxParts.image);
  stage.prepend(placeholder, image);

  /* ---- state ---- */
  let config: LightboxConfig = { ...initial };
  let session: LightboxSettings = {};
  let images: readonly LightboxImage[] = [];
  let index = -1;
  let isOpen = false;
  let status: LightboxStatus = "idle";
  let view: LightboxView = LIGHTBOX_FIT_VIEW;
  let returnFocus: HTMLElement | null = null;
  let sessionFallback: (() => HTMLElement | null) | null = null;
  let state: LightboxState = snapshot();
  const listeners = new Set<() => void>();

  function snapshot(): LightboxState {
    return {
      open: isOpen,
      images,
      index,
      count: images.length,
      image: images[index] ?? null,
      zoom: view.scale,
      status,
    };
  }

  /** Publish a new snapshot, only when something a subscriber can see actually changed. */
  const commit = (): void => {
    const next = snapshot();
    const same = (Object.keys(next) as (keyof LightboxState)[]).every((key) => next[key] === state[key]);
    if (same) return;
    state = next;
    for (const listener of listeners) listener();
  };

  const setting = <K extends keyof LightboxSettings>(key: K): LightboxSettings[K] => session[key] ?? config[key];
  const loop = () => setting("loop") ?? lightboxContract.options.loop.default;
  const zoomEnabled = () => setting("zoom") ?? lightboxContract.options.zoom.default;
  const maxZoom = () => sanitizeLightboxMaxZoom(setting("maxZoom"));
  const canZoom = () => isOpen && zoomEnabled() && status === "loaded";
  const zoomed = () => view.scale > LIGHTBOX_MIN_ZOOM + 1e-6;
  const rtl = () => (dialog.closest("[dir]")?.getAttribute("dir") ?? doc.documentElement.dir) === "rtl";
  const counterLabel = () => config.counterLabel ?? lightboxContract.options.counterLabel.default;

  const emit = (type: string, detail: unknown): void => {
    const Ctor = (win as typeof globalThis).CustomEvent ?? CustomEvent;
    dialog.dispatchEvent(new Ctor(type, { detail }));
  };

  /* ---- rendering: everything that follows the index ---- */
  const disable = (button: HTMLElement | null, disabled: boolean): void => {
    if (!button) return;
    /* `aria-disabled`, never `disabled`: a button that disables itself while focused (Next, on the
       last image) would drop focus to <body>, outside the dialog. This one stays focusable, says it
       is unavailable, and does nothing. */
    if (disabled) button.setAttribute("aria-disabled", "true");
    else button.removeAttribute("aria-disabled");
  };

  const setText = (element: HTMLElement | null, value: string | undefined): boolean => {
    if (!element) return false;
    const text = value?.trim() ?? "";
    element.textContent = text;
    element.hidden = text === "";
    return text !== "";
  };

  const renderChrome = (): void => {
    const count = images.length;
    const single = count <= 1;
    dialog.toggleAttribute(lightboxAttrs.single, single);
    if (counter) {
      counter.textContent = count > 0 ? `${index + 1} / ${count}` : "";
      counter.hidden = single || setting("showCounter") === false;
    }
    for (const [action, delta] of [
      ["previous", -1],
      ["next", 1],
    ] as const) {
      const button = control(action);
      if (!button) continue;
      button.hidden = single;
      disable(button, lightboxStep(index, delta, count, loop()) === null);
    }
    renderZoomControls();
  };

  const renderZoomControls = (): void => {
    const enabled = zoomEnabled();
    const ready = canZoom();
    for (const action of ["zoom-in", "zoom-out", "reset-zoom"] as const) {
      const button = control(action);
      if (!button) continue;
      button.hidden = !enabled;
      if (action === "zoom-in") disable(button, !ready || view.scale >= maxZoom() - 1e-6);
      else disable(button, !ready || !zoomed());
    }
    dialog.toggleAttribute(lightboxAttrs.zoomed, zoomed());
  };

  const renderCaption = (): void => {
    const current = images[index];
    const show = setting("showCaption") !== false && current !== undefined;
    const any = [
      setText(captionTitle, show ? current?.title : undefined),
      setText(captionDescription, show ? current?.description : undefined),
      setText(captionCredit, show ? current?.credit : undefined),
    ].some(Boolean);
    /* No empty box: the figcaption exists only while it has something in it. */
    if (caption) caption.hidden = !any;
  };

  const setStatus = (next: LightboxStatus): void => {
    status = next;
    if (next === "idle") dialog.removeAttribute(lightboxAttrs.status);
    else dialog.setAttribute(lightboxAttrs.status, next);
    if (errorText) errorText.hidden = next !== "error";
    renderZoomControls();
  };

  /* ---- live region: said once navigation settles, never per keypress ---- */
  let announceTimer = 0;
  const describe = (): string => {
    const current = images[index];
    if (!current) return "";
    const parts: string[] = [];
    if (images.length > 1) parts.push(formatLightboxCounter(counterLabel(), index, images.length));
    const name = current.title?.trim() || current.alt.trim();
    if (name) parts.push(name);
    if (status === "error" && errorText?.textContent) parts.push(errorText.textContent.trim());
    return parts.join(". ");
  };
  const announce = (immediate = false): void => {
    if (!live) return;
    win.clearTimeout(announceTimer);
    if (immediate) {
      live.textContent = describe();
      return;
    }
    /* Holding an arrow key through twelve photos is ONE announcement, of where it stopped. */
    announceTimer = win.setTimeout(() => {
      if (isOpen) live.textContent = describe();
    }, ANNOUNCE_DELAY);
  };

  /* ---- loading ---- */
  let loadToken = 0;
  const preloaded = new Map<string, HTMLImageElement>();

  const sizeTo = (img: HTMLImageElement, current: LightboxImage): void => {
    /* Known dimensions reserve the image's box before a single byte arrives, so nothing shifts when
       it does: the fitted rules in lightbox.css keep the ratio at any stage size. */
    if (current.width && current.height) {
      img.width = current.width;
      img.height = current.height;
    } else {
      img.removeAttribute("width");
      img.removeAttribute("height");
    }
  };

  const renderImage = (): void => {
    const current = images[index];
    if (!current) return;
    loadToken += 1;
    const token = loadToken;
    view = LIGHTBOX_FIT_VIEW;
    applyView();

    const thumb = current.thumbnailSrc && current.thumbnailSrc !== current.src ? current.thumbnailSrc : "";
    if (thumb) {
      sizeTo(placeholder, current);
      placeholder.src = thumb;
      placeholder.hidden = false;
    } else {
      placeholder.hidden = true;
      placeholder.removeAttribute("src");
    }

    setStatus("loading");
    image.alt = current.alt;
    sizeTo(image, current);
    image.src = current.src;
    /* Already in the cache: the load event may still come, but the photo is there now. */
    if (image.complete && image.naturalWidth > 0) settle(token, "loaded");
  };

  const settle = (token: number, outcome: "loaded" | "error"): void => {
    if (token !== loadToken || status !== "loading" || !isOpen) return;
    const current = images[index];
    if (!current) return;
    setStatus(outcome);
    if (outcome === "loaded") {
      placeholder.hidden = true;
      config.onImageLoad?.(current, index);
    } else {
      /* The thumbnail stays up under the message when there is one: a blurred preview of what
         failed is more use than a black box. */
      config.onImageError?.(current, index);
      announce(true);
    }
    preloadNeighbours();
    commit();
  };

  /* The events of an image that is no longer the current one never arrive (changing `src` aborts
     the old request), but the check is cheap and makes rapid navigation provably safe. */
  const onImageSettled = (outcome: "loaded" | "error") => (): void => {
    const current = images[index];
    if (!current || image.getAttribute("src") !== current.src) return;
    settle(loadToken, outcome);
  };
  const onImageLoad = onImageSettled("loaded");
  const onImageError = onImageSettled("error");
  image.addEventListener("load", onImageLoad);
  image.addEventListener("error", onImageError);

  const preloadNeighbours = (): void => {
    const connection = (win.navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    for (const at of lightboxPreloadIndices(index, images.length, loop())) {
      const src = images[at]!.src;
      const cached = preloaded.get(src);
      preloaded.delete(src);
      if (cached) {
        preloaded.set(src, cached);
        continue;
      }
      const Ctor = (win as typeof globalThis).Image ?? Image;
      const img = new Ctor();
      img.decoding = "async";
      img.src = src;
      preloaded.set(src, img);
    }
    /* A small, recent-first cache: enough that going back and forth never re-requests, never the
       whole gallery held in memory. */
    while (preloaded.size > PRELOAD_CACHE) preloaded.delete(preloaded.keys().next().value!);
  };

  /* ---- view ---- */
  const fittedSize = (): LightboxSize => ({ width: image.offsetWidth, height: image.offsetHeight });
  const stageSize = (): LightboxSize => ({ width: stage.clientWidth, height: stage.clientHeight });

  function applyView(): void {
    image.style.transform = lightboxTransform(view);
    renderZoomControls();
  }

  const setView = (next: LightboxView, publish = true): void => {
    view = next;
    applyView();
    if (publish) commit();
  };

  const zoomTo = (scale: number, anchor: LightboxPoint = { x: 0, y: 0 }): void => {
    if (!canZoom()) return;
    setView(lightboxZoomTo(view, scale, anchor, fittedSize(), stageSize(), maxZoom()));
  };

  /** A client point, relative to the stage's centre: the space every view is written in. */
  const local = (clientX: number, clientY: number): LightboxPoint => {
    const rect = stage.getBoundingClientRect();
    return { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 };
  };

  const toggleZoom = (anchor: LightboxPoint): void => {
    if (zoomed()) setView(LIGHTBOX_FIT_VIEW);
    else zoomTo(LIGHTBOX_DOUBLE_TAP_ZOOM, anchor);
  };

  /* ---- navigation ---- */
  const show = (next: number): void => {
    if (!isOpen || next === index || next < 0 || next >= images.length) return;
    index = next;
    renderImage();
    renderCaption();
    renderChrome();
    announce();
    const current = images[index]!;
    config.onIndexChange?.(index, current);
    emit(lightboxEvents.indexChange, { index, image: current });
    commit();
  };

  const step = (delta: 1 | -1): void => {
    const next = lightboxStep(index, delta, images.length, loop());
    if (next !== null) show(next);
  };

  /* ---- gestures ---- */
  type Single = {
    readonly kind: "single";
    readonly id: number;
    readonly type: string;
    startX: number;
    startY: number;
    readonly startAt: number;
    start: LightboxView;
    moved: boolean;
    readonly mode: "pan" | "swipe" | "none";
    dx: number;
    dy: number;
  };
  type Pinch = {
    readonly kind: "pinch";
    readonly ids: readonly [number, number];
    readonly start: LightboxView;
    readonly from: readonly [LightboxPoint, LightboxPoint];
  };
  const pointers = new Map<number, { x: number; y: number }>();
  let gesture: Single | Pinch | null = null;
  let gestureBounds: { fitted: LightboxSize; stage: LightboxSize } | null = null;
  let suppressClick = false;
  let lastTap: { at: number; x: number; y: number } | null = null;
  let lastPointerType = "mouse";
  let frame = 0;
  let pendingView: LightboxView | null = null;

  /* Pointer moves arrive faster than frames; the transform is written once per frame. */
  const scheduleView = (next: LightboxView): void => {
    pendingView = next;
    if (frame) return;
    frame = win.requestAnimationFrame(() => {
      frame = 0;
      if (pendingView) setView(pendingView, false);
      pendingView = null;
    });
  };
  const flushView = (): void => {
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    if (pendingView) setView(pendingView, false);
    pendingView = null;
    commit();
  };

  const setDragOffset = (x: number, y: number): void => {
    if (x === 0 && y === 0) {
      dialog.style.removeProperty("--sk-lightbox-drag-x");
      dialog.style.removeProperty("--sk-lightbox-drag-y");
      return;
    }
    dialog.style.setProperty("--sk-lightbox-drag-x", `${Math.round(x)}px`);
    dialog.style.setProperty("--sk-lightbox-drag-y", `${Math.round(y)}px`);
  };

  const beginSingle = (id: number, type: string, x: number, y: number): void => {
    gesture = {
      kind: "single",
      id,
      type,
      startX: x,
      startY: y,
      startAt: win.performance.now(),
      start: view,
      moved: false,
      /* THE ZOOM DECIDES WHAT A DRAG IS. Zoomed, one finger (or the mouse) moves the photo and can
         never change it. At fit, a finger swipes to a neighbour; the mouse does nothing, because a
         mouse user has buttons and keys and a drag that changes photos is a surprise to them. */
      mode: zoomed() ? "pan" : type === "mouse" ? "none" : "swipe",
      dx: 0,
      dy: 0,
    };
    gestureBounds = { fitted: fittedSize(), stage: stageSize() };
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (!isOpen) return;
    lastPointerType = event.pointerType;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as Element | null)?.closest?.("button, a")) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    suppressClick = false;

    if (pointers.size === 2 && canZoom()) {
      const [a, b] = Array.from(pointers.entries());
      setDragOffset(0, 0);
      gesture = {
        kind: "pinch",
        ids: [a![0], b![0]],
        start: view,
        from: [local(a![1].x, a![1].y), local(b![1].x, b![1].y)],
      };
      gestureBounds = { fitted: fittedSize(), stage: stageSize() };
      dialog.setAttribute(lightboxAttrs.dragging, "");
      return;
    }
    if (pointers.size === 1) beginSingle(event.pointerId, event.pointerType, event.clientX, event.clientY);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (!gesture || !gestureBounds) return;

    if (gesture.kind === "pinch") {
      const a = pointers.get(gesture.ids[0]);
      const b = pointers.get(gesture.ids[1]);
      if (!a || !b) return;
      if (event.cancelable) event.preventDefault();
      scheduleView(
        lightboxPinchView(
          gesture.start,
          gesture.from,
          [local(a.x, a.y), local(b.x, b.y)],
          gestureBounds.fitted,
          gestureBounds.stage,
          maxZoom(),
        ),
      );
      return;
    }

    if (event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (!gesture.moved) {
      if (Math.hypot(dx, dy) < LIGHTBOX_TAP_SLOP) return;
      gesture.moved = true;
      /* Captured only once it is a drag: capturing on press would retarget the click that follows a
         plain tap on the photo to the stage, and a click on the stage is a click on the backdrop. */
      stage.setPointerCapture?.(event.pointerId);
      dialog.setAttribute(lightboxAttrs.dragging, "");
    }
    gesture.dx = dx;
    gesture.dy = dy;
    if (gesture.mode === "pan") {
      scheduleView(
        lightboxClampView(
          { x: gesture.start.x + dx, y: gesture.start.y + dy, scale: gesture.start.scale },
          gestureBounds.fitted,
          gestureBounds.stage,
        ),
      );
    } else if (gesture.mode === "swipe") {
      /* The photo follows the finger along the axis it is going, so the swipe is seen before it
         commits: sideways toward a neighbour, or down toward closing. */
      if (Math.abs(dx) >= Math.abs(dy)) setDragOffset(dx, 0);
      else setDragOffset(0, Math.max(0, dy));
    }
  };

  const endGesture = (event: PointerEvent, cancelled: boolean): void => {
    const wasTracked = pointers.delete(event.pointerId);
    if (!wasTracked) return;
    if (stage.hasPointerCapture?.(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    const current = gesture;

    if (current?.kind === "pinch") {
      suppressClick = true;
      flushView();
      /* One finger lifted, one still down: carry on as a pan from where the pinch left the photo. */
      const [remaining] = Array.from(pointers.entries());
      if (remaining && zoomed()) {
        beginSingle(remaining[0], event.pointerType, remaining[1].x, remaining[1].y);
        (gesture as Single | null)!.moved = true;
      } else {
        gesture = null;
        dialog.removeAttribute(lightboxAttrs.dragging);
      }
      return;
    }

    if (!current || current.id !== event.pointerId) return;
    gesture = null;
    gestureBounds = null;
    dialog.removeAttribute(lightboxAttrs.dragging);

    if (current.moved) {
      suppressClick = true;
      if (current.mode === "pan") flushView();
      else if (current.mode === "swipe") {
        setDragOffset(0, 0);
        if (cancelled) return;
        const verdict = lightboxSwipeVerdict(current.dx, current.dy, win.performance.now() - current.startAt, {
          rtl: rtl(),
        });
        if (verdict === "next") step(1);
        else if (verdict === "previous") step(-1);
        else if (verdict === "close") close();
      }
      return;
    }

    /* A tap that did not move. Two of them on the photo, close together, zoom: the mouse gets the
       same from `dblclick`, which a touchscreen does not reliably send. */
    if (cancelled || current.type === "mouse") return;
    const now = win.performance.now();
    const onImage = event.target === image;
    if (
      lastTap &&
      onImage &&
      now - lastTap.at < LIGHTBOX_DOUBLE_TAP_MS &&
      Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < LIGHTBOX_DOUBLE_TAP_SLOP
    ) {
      lastTap = null;
      suppressClick = true;
      if (canZoom()) toggleZoom(local(event.clientX, event.clientY));
      return;
    }
    lastTap = onImage ? { at: now, x: event.clientX, y: event.clientY } : null;
  };
  const onPointerUp = (event: PointerEvent): void => endGesture(event, false);
  const onPointerCancel = (event: PointerEvent): void => endGesture(event, true);

  const onDoubleClick = (event: MouseEvent): void => {
    if (lastPointerType !== "mouse" || event.target !== image || !canZoom()) return;
    event.preventDefault();
    toggleZoom(local(event.clientX, event.clientY));
  };

  const onWheel = (event: WheelEvent): void => {
    if (!isOpen) return;
    /* A long caption scrolls on its own; everything else in a full-screen modal is ours, so the
       wheel never leaks through to a page that should be standing still. */
    if (caption && caption.contains(event.target as Node)) return;
    event.preventDefault();
    if (!canZoom()) return;
    zoomTo(view.scale * lightboxWheelFactor(event.deltaY, event.deltaMode), local(event.clientX, event.clientY));
  };

  /* Safari's own pinch-to-zoom of the page, which `touch-action` alone does not stop there. */
  const onGesture = (event: Event): void => event.preventDefault();

  /* ---- clicks: controls, then the backdrop ---- */
  const isBackdrop = (target: EventTarget | null): boolean =>
    target === dialog || target === stage || target === part("figure") || target === part("toolbar");

  const onClick = (event: MouseEvent): void => {
    const button = (event.target as Element | null)?.closest?.<HTMLElement>(`[${lightboxAttrs.action}]`);
    if (button && dialog.contains(button)) {
      if (button.getAttribute("aria-disabled") === "true") return;
      runAction(button.getAttribute(lightboxAttrs.action) as LightboxAction);
      return;
    }
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    if (setting("closeOnBackdropClick") !== false && isBackdrop(event.target)) close();
  };

  const runAction = (action: LightboxAction): void => {
    switch (action) {
      case "close":
        return close();
      case "previous":
        return step(-1);
      case "next":
        return step(1);
      case "zoom-in":
        return zoomTo(view.scale * LIGHTBOX_ZOOM_STEP);
      case "zoom-out":
        return zoomTo(view.scale / LIGHTBOX_ZOOM_STEP);
      case "reset-zoom":
        return setView(LIGHTBOX_FIT_VIEW);
    }
  };

  /* ---- keyboard ---- */
  const focusables = (): HTMLElement[] =>
    Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) =>
        !element.closest("[hidden]") &&
        !(element as HTMLButtonElement).disabled &&
        (typeof element.checkVisibility !== "function" || element.checkVisibility()),
    );

  /*
   * THE TAB WRAP. `showModal()` keeps focus off the inert page, but Tab from the last control still
   * leaves for the browser's own toolbar. APG's modal traps it; so does this: last wraps to first,
   * first wraps to last, and a focus that somehow sits outside (on <body>, after a click on the
   * photo) re-enters at the right end.
   */
  const trapTab = (event: KeyboardEvent): void => {
    const list = focusables();
    const active = doc.activeElement as HTMLElement | null;
    if (list.length === 0) {
      event.preventDefault();
      return;
    }
    const first = list[0]!;
    const last = list[list.length - 1]!;
    const inside = active !== null && dialog.contains(active) && active !== dialog;
    if (event.shiftKey && (!inside || active === first)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (!inside || active === last)) {
      event.preventDefault();
      first.focus();
    }
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!isOpen || event.defaultPrevented) return;
    const target = event.target as Node | null;
    /* The page is inert, so a key can only come from inside the dialog or from <body> (focus lands
       there after a click on something that cannot hold it). Anything else is not ours. */
    if (target && target !== doc.body && target !== doc.documentElement && !dialog.contains(target)) return;
    if (event.key === "Tab") {
      trapTab(event);
      return;
    }
    if (event.key !== "Escape" && isTypingContext(event.target)) return;
    const action = lightboxKeyAction(event, { zoomed: zoomed(), zoomEnabled: zoomEnabled(), rtl: rtl() });
    if (!action) return;
    event.preventDefault();
    switch (action.kind) {
      case "close":
        return close();
      case "step":
        return step(action.delta);
      case "edge":
        return show(action.to === "first" ? 0 : images.length - 1);
      case "zoom":
        return zoomTo(view.scale * action.by);
      case "reset":
        return setView(LIGHTBOX_FIT_VIEW);
      case "pan":
        return setView(
          lightboxClampView(
            { x: view.x + action.dx, y: view.y + action.dy, scale: view.scale },
            fittedSize(),
            stageSize(),
          ),
        );
    }
  };

  /* The platform's own Escape (and Android's back gesture) arrives as `cancel`: routed through the
     same close so nothing depends on which one fired. */
  const onCancel = (event: Event): void => {
    event.preventDefault();
    close();
  };
  const onNativeClose = (): void => finish();

  /* ---- resize: a rotated phone keeps a zoomed photo in its frame ---- */
  const onResize = (): void => {
    if (isOpen && zoomed()) setView(lightboxClampView(view, fittedSize(), stageSize()));
  };
  let resizeObserver: ResizeObserver | null = null;

  /* ---- triggers: every link naming this dialog's id, in document order, is one gallery ---- */
  const onDocumentClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0) return;
    /* A modified click is the reader asking for the link itself: a new tab, a download. */
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const trigger = (event.target as Element | null)?.closest?.<HTMLElement>(`[${lightboxAttrs.opens}]`);
    if (!trigger || !dialog.id || trigger.getAttribute(lightboxAttrs.opens) !== dialog.id) return;
    const triggers = lightboxTriggers(doc, dialog.id);
    const at = triggers.indexOf(trigger);
    if (at < 0) return;
    event.preventDefault();
    const id = dialog.id;
    open({ images: triggers.map(lightboxImageFromTrigger), index: at, returnFocus: trigger });
    /* If that thumbnail is gone by the time the lightbox closes, the one for the photo the reader
       ended on is the next most sensible place to land. */
    sessionFallback = () => lightboxTriggers(doc, id)[index] ?? null;
  };

  /* ---- lifecycle ---- */
  const attachSession = (): void => {
    doc.addEventListener("keydown", onKeyDown);
    win.addEventListener("resize", onResize);
    if (typeof ResizeObserver !== "undefined" && stage !== dialog) {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(stage);
    }
  };
  const detachSession = (): void => {
    doc.removeEventListener("keydown", onKeyDown);
    win.removeEventListener("resize", onResize);
    resizeObserver?.disconnect();
    resizeObserver = null;
  };

  const focusable = (element: HTMLElement | null | undefined): element is HTMLElement =>
    Boolean(element) &&
    element!.isConnected &&
    element !== doc.body &&
    !dialog.contains(element!) &&
    !element!.closest("[inert], [hidden]") &&
    !(element as HTMLButtonElement).disabled;

  const activeOutside = (): HTMLElement | null => {
    const active = doc.activeElement as HTMLElement | null;
    return active && active !== doc.body && typeof active.focus === "function" && !dialog.contains(active)
      ? active
      : null;
  };

  function open(options: LightboxOpenOptions): void {
    const list = Array.isArray(options?.images) ? options.images.filter(isShowable) : [];
    if (list.length === 0) return;
    const { images: _images, index: requested, returnFocus: focusTarget, ...settings } = options;

    if (isOpen) {
      /* A second open while open REPLACES what is shown; there is never a second overlay, and the
         focus to return to is still the one from the first. */
      session = settings;
      images = list;
      const nextIndex = normalizeLightboxIndex(requested, list.length);
      index = -1;
      renderAll(nextIndex);
      return;
    }

    session = settings;
    sessionFallback = null;
    returnFocus = focusTarget !== undefined ? focusTarget : activeOutside();
    images = list;
    isOpen = true;

    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch {
        /* Not in the document, or already open non-modally: either way it cannot be a modal. */
        isOpen = false;
        images = [];
        session = {};
        return;
      }
    }

    attachSession();
    index = -1;
    renderAll(normalizeLightboxIndex(requested, list.length), true);
    /* A known, harmless first stop: Close, the one control every reader can use. Explicit rather
       than `autofocus`, which React does not write to the DOM. */
    (control("close") ?? focusables()[0] ?? dialog).focus({ preventScroll: true });
    config.onOpenChange?.(true);
    emit(lightboxEvents.openChange, { open: true });
    commit();
  }

  /** Render everything for a (re)opened session, landing on `at`. */
  const renderAll = (at: number, opening = false): void => {
    index = at;
    renderImage();
    renderCaption();
    renderChrome();
    announce(opening);
    /* Opening lands on an index too, so a parent that controls `index` hears about a thumbnail's. */
    const current = images[index];
    if (current) {
      config.onIndexChange?.(index, current);
      emit(lightboxEvents.indexChange, { index, image: current });
    }
    if (!opening) commit();
  };

  function close(): void {
    if (!isOpen) return;
    if (dialog.open) dialog.close();
    finish();
  }

  /** Everything closing means, whatever closed it. Idempotent: the `close` event may come after. */
  function finish(): void {
    if (!isOpen) return;
    isOpen = false;
    detachSession();
    win.clearTimeout(announceTimer);
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    pendingView = null;
    pointers.clear();
    gesture = null;
    gestureBounds = null;
    lastTap = null;
    suppressClick = false;
    setDragOffset(0, 0);
    dialog.removeAttribute(lightboxAttrs.dragging);

    view = LIGHTBOX_FIT_VIEW;
    image.style.transform = "";
    /* Stop whatever is still downloading, and hold nothing a closed viewer does not need. */
    loadToken += 1;
    image.removeAttribute("src");
    placeholder.removeAttribute("src");
    placeholder.hidden = true;
    preloaded.clear();
    setStatus("idle");
    if (live) live.textContent = "";
    session = {};

    /*
     * FOCUS GOES BACK, and only to something that can take it. The element that opened the
     * lightbox if it is still on the page; otherwise the fallback (the thumbnail of the photo the
     * reader ended on, or the caller's own choice); otherwise wherever the platform put it. Never an
     * element that was removed while the lightbox was open, and never over a focus that someone else
     * already moved on purpose.
     */
    const candidates = [returnFocus, sessionFallback?.(), config.fallbackFocus?.()];
    returnFocus = null;
    sessionFallback = null;
    const target = candidates.find(focusable);
    const active = doc.activeElement;
    if (target && (!active || active === doc.body || dialog.contains(active) || active === target)) {
      target.focus();
    }

    config.onOpenChange?.(false);
    emit(lightboxEvents.openChange, { open: false });
    commit();
  }

  const setImages = (next: readonly LightboxImage[], at?: number): void => {
    const list = Array.isArray(next) ? next.filter(isShowable) : [];
    if (!isOpen) {
      images = list;
      index = list.length ? normalizeLightboxIndex(at ?? index, list.length) : -1;
      commit();
      return;
    }
    if (list.length === 0) {
      close();
      return;
    }
    const current = images[index] ?? null;
    const target = at !== undefined ? normalizeLightboxIndex(at, list.length) : lightboxReindex(current, index, list);
    const same = list[target]?.src === current?.src;
    images = list;
    if (same) {
      /* Same photo, new neighbours: only what depends on the list changes, the image does not reload. */
      index = target;
      renderCaption();
      renderChrome();
      commit();
      return;
    }
    index = -1;
    renderAll(target);
  };

  /* ---- wiring ---- */
  dialog.addEventListener("click", onClick);
  dialog.addEventListener("cancel", onCancel);
  dialog.addEventListener("close", onNativeClose);
  dialog.addEventListener("wheel", onWheel, { passive: false });
  dialog.addEventListener("dblclick", onDoubleClick);
  stage.addEventListener("pointerdown", onPointerDown);
  stage.addEventListener("pointermove", onPointerMove, { passive: false });
  stage.addEventListener("pointerup", onPointerUp);
  stage.addEventListener("pointercancel", onPointerCancel);
  stage.addEventListener("gesturestart", onGesture);
  doc.addEventListener("click", onDocumentClick);
  renderChrome();

  const controller: LightboxController = {
    open,
    close,
    next: () => step(1),
    previous: () => step(-1),
    goTo(target) {
      if (!Number.isInteger(target)) return;
      show(target);
    },
    zoomIn: () => zoomTo(view.scale * LIGHTBOX_ZOOM_STEP),
    zoomOut: () => zoomTo(view.scale / LIGHTBOX_ZOOM_STEP),
    resetZoom: () => {
      if (isOpen) setView(LIGHTBOX_FIT_VIEW);
    },
    setImages,
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    configure(next) {
      config = { ...config, ...next };
      if (isOpen) {
        renderCaption();
        renderChrome();
      }
    },
    destroy() {
      close();
      detachSession();
      dialog.removeEventListener("click", onClick);
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onNativeClose);
      dialog.removeEventListener("wheel", onWheel);
      dialog.removeEventListener("dblclick", onDoubleClick);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerCancel);
      stage.removeEventListener("gesturestart", onGesture);
      doc.removeEventListener("click", onDocumentClick);
      image.removeEventListener("load", onImageLoad);
      image.removeEventListener("error", onImageError);
      image.remove();
      placeholder.remove();
      listeners.clear();
      controllers.delete(dialog);
    },
  };
  controllers.set(dialog, controller);
  return controller;
}

/* ---------------------------------------------------------------------------------------------- *
 * The handle: one stable object in front of a controller that may not exist yet.
 * ---------------------------------------------------------------------------------------------- */

/** What a caller holds: the controller's verbs and its state, never its teardown. */
export type LightboxHandle = Pick<
  LightboxController,
  | "open"
  | "close"
  | "next"
  | "previous"
  | "goTo"
  | "zoomIn"
  | "zoomOut"
  | "resetZoom"
  | "setImages"
  | "getState"
  | "subscribe"
>;

export const LIGHTBOX_CLOSED_STATE: LightboxState = Object.freeze({
  open: false,
  images: [],
  index: -1,
  count: 0,
  image: null,
  zoom: 1,
  status: "idle",
});

/**
 * A handle that exists BEFORE the dialog does, and forwards to its controller once one is bound.
 *
 * It is what makes a single, app-wide lightbox safe to call from anywhere: a component deep in the
 * tree can call `open()` from its own first effect, which runs before the provider's dialog has been
 * connected, and the call is kept and replayed on `bind` instead of being lost. Only the LAST `open`
 * is kept, and a `close` before bind cancels it, which is what the same calls would have done to a
 * live controller. Every other verb before bind is a no-op, for the same reason.
 */
export function createLightboxHandle(): LightboxHandle & {
  bind(controller: LightboxController | null): void;
} {
  let target: LightboxController | null = null;
  let pending: LightboxOpenOptions | null = null;
  let unsubscribe: (() => void) | null = null;
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    bind(controller) {
      unsubscribe?.();
      unsubscribe = null;
      target = controller;
      if (controller) {
        unsubscribe = controller.subscribe(notify);
        const queued = pending;
        pending = null;
        if (queued) controller.open(queued);
      }
      notify();
    },
    open(options) {
      if (target) target.open(options);
      else pending = options;
    },
    close() {
      pending = null;
      target?.close();
    },
    next: () => target?.next(),
    previous: () => target?.previous(),
    goTo: (index) => target?.goTo(index),
    zoomIn: () => target?.zoomIn(),
    zoomOut: () => target?.zoomOut(),
    resetZoom: () => target?.resetZoom(),
    setImages: (images, index) => target?.setImages(images, index),
    getState: () => target?.getState() ?? LIGHTBOX_CLOSED_STATE,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
