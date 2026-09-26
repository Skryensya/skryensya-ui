import { tabbables, trapModalDialogs } from "./focus-trap.js";
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
  lightboxElasticView,
  lightboxFlingDistance,
  LIGHTBOX_SPRING_GLIDE,
  LIGHTBOX_SPRING_RELEASE,
  LIGHTBOX_TETHER_REACH,
  LIGHTBOX_TETHER_MAX,
  lightboxSpringSettled,
  lightboxSpringStep,
  lightboxTether,
  lightboxUntether,
  type LightboxSpring,
  type LightboxSpringAxis,
  lightboxKeyAction,
  lightboxParts,
  lightboxPinchView,
  lightboxPreloadIndices,
  lightboxReindex,
  lightboxSameShape,
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
 * image's `transform`, the Web Animations it runs on the images (see MOTION below), and a few
 * `data-sk-*` flags on the root. React renders none of those, so the
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

/**
 * A trigger, read as the image it opens. `href` is the image; the rest are data attributes.
 *
 * THE PLACEHOLDER IS NEVER A CROP. `data-lightbox-thumbnail` names one outright. Otherwise the
 * trigger's own `<img>` stands in only when it is the photo's shape: a square crop from a grid,
 * blurred inside a 3:2 box, turned into a different picture the moment the real photo landed.
 */
export function lightboxImageFromTrigger(trigger: Element): LightboxImage {
  const thumb = trigger.querySelector("img");
  const number = (attr: string): number | undefined => {
    const value = Number.parseInt(trigger.getAttribute(attr) ?? "", 10);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };
  const text = (attr: string): string | undefined => trigger.getAttribute(attr)?.trim() || undefined;
  const width = number(lightboxAttrs.width);
  const height = number(lightboxAttrs.height);
  const own = thumb?.currentSrc || thumb?.getAttribute("src") || undefined;
  /* Measured when it can be (a thumbnail on the page has almost always loaded by the click); one that
     cannot be yet is checked again as the placeholder loads (`onPlaceholderLoad`). */
  const ownFits =
    !thumb?.naturalWidth || !thumb.naturalHeight || !width || !height
      ? true
      : lightboxSameShape(thumb.naturalWidth, thumb.naturalHeight, width, height);
  const thumbnailSrc = text(lightboxAttrs.thumbnail) ?? (ownFits ? own : undefined);
  return {
    src: trigger.getAttribute(lightboxAttrs.src) ?? trigger.getAttribute("href") ?? "",
    alt: trigger.getAttribute(lightboxAttrs.alt) ?? thumb?.getAttribute("alt") ?? "",
    thumbnailSrc,
    title: text(lightboxAttrs.title),
    description: text(lightboxAttrs.description),
    credit: text(lightboxAttrs.credit),
    width,
    height,
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
  const releaseTrap = trapModalDialogs(doc);
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
  const zoomBar = part("zoom");
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
  type Spring = {
    readonly kind: "offset" | "pan";
    readonly tuning: LightboxSpring;
    readonly target: { x: number; y: number };
    x: LightboxSpringAxis;
    y: LightboxSpringAxis;
    last: number;
    raf: number;
  };
  /* The release spring, if one is running; see THE SPRING below. */
  let spring: Spring | null = null;
  let returnFocus: HTMLElement | null = null;
  let closing = false;
  /* Which close a finished animation belongs to, so a stale one never closes a reopened viewer. */
  let closeToken = 0;
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
    if (zoomBar) zoomBar.hidden = !enabled;
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
      /* The attributes alone do not do it: `inline-size: auto` beats their presentational width, and
         an image with no pixels yet is 0×0. The stylesheet turns these two into a fitted box. */
      img.style.setProperty("--sk-lightbox-image-width", `${current.width}px`);
      img.style.setProperty("--sk-lightbox-image-ratio", `${current.width} / ${current.height}`);
      img.setAttribute(lightboxAttrs.sized, "");
    } else {
      img.removeAttribute("width");
      img.removeAttribute("height");
      img.style.removeProperty("--sk-lightbox-image-width");
      img.style.removeProperty("--sk-lightbox-image-ratio");
      img.removeAttribute(lightboxAttrs.sized);
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
      /* Drawn only once it is whole: a placeholder arriving line by line is worse than none. */
      if (placeholder.complete && placeholder.naturalWidth > 0) onPlaceholderLoad();
      else placeholder.removeAttribute(lightboxAttrs.ready);
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
  /* The same rule for a thumbnail passed in code (`open({ images })`), checked once it has a size:
     a crop is dropped before it can stand in for the photo. */
  function onPlaceholderLoad(): void {
    const current = images[index];
    if (!current || placeholder.hidden) return;
    if (
      current.width &&
      current.height &&
      !lightboxSameShape(placeholder.naturalWidth, placeholder.naturalHeight, current.width, current.height)
    ) {
      placeholder.hidden = true;
      return;
    }
    placeholder.setAttribute(lightboxAttrs.ready, "");
  }
  placeholder.addEventListener("load", onPlaceholderLoad);
  image.addEventListener("load", onImageLoad);
  image.addEventListener("error", onImageError);

  /*
   * WARMED ON INTENT. A pointer resting on a thumbnail, or focus landing on one, is a reader about to
   * open it: its placeholder and its full image start downloading then, so by the click the
   * placeholder is usually whole (the flight out of the thumbnail has something to fly) and the photo
   * often is too. Kept apart from the neighbours' cache, and across closes, so a gallery browsed by
   * hovering does not refetch; a dozen at most. Never on Save-Data.
   */
  const warmed = new Map<string, HTMLImageElement>();
  const saveData = (): boolean =>
    Boolean((win.navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  const warm = (src: string | undefined): void => {
    if (!src || warmed.has(src) || preloaded.has(src)) return;
    const Ctor = (win as typeof globalThis).Image ?? Image;
    const img = new Ctor();
    img.decoding = "async";
    img.src = src;
    warmed.set(src, img);
    while (warmed.size > 12) warmed.delete(warmed.keys().next().value!);
  };
  const onTriggerIntent = (event: Event): void => {
    if (saveData() || !dialog.id) return;
    const trigger = (event.target as Element | null)?.closest?.<HTMLElement>(`[${lightboxAttrs.opens}]`);
    if (!trigger || trigger.getAttribute(lightboxAttrs.opens) !== dialog.id) return;
    const next = lightboxImageFromTrigger(trigger);
    warm(next.thumbnailSrc);
    warm(next.src);
  };

  const preloadNeighbours = (): void => {
    if (saveData()) return;
    for (const at of lightboxPreloadIndices(index, images.length, loop())) {
      /* The neighbour's placeholder too, so a swap to a photo still loading crosses to its blur, not
         to nothing. */
      warm(images[at]!.thumbnailSrc);
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
    stopSpring();
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

  /*
   * ---- MOTION ----
   *
   * The photo GROWS OUT OF THE THUMBNAIL that opened it and shrinks back into it on close, so the
   * reader never loses track of where it came from. It is the classic FLIP: measure the thumbnail
   * and the photo's fitted box, start the photo scaled and moved onto the thumbnail, clipped to the
   * thumbnail's crop (a square thumbnail of a 3:2 photo is a `cover` crop), and let it settle. Only
   * `translate`, `scale`, `clip-path` and `opacity` move, all composited, and none of them is the
   * `transform` zoom writes. Next and previous slide the new photo in from the side it comes from.
   *
   * WHAT KEEPS IT FROM BREAKING, each one a way it did:
   *   - the thumbnail on the page hides while the photo is in flight (`data-sk-lightbox-source`),
   *     so there are never two copies of it on screen, and comes back exactly as the photo lands;
   *   - the photo's box is known before it loads (`data-sk-sized`), so there is always something to
   *     measure, and what flies before it arrives is the sharp thumbnail, not a blur;
   *   - closing mid-open REVERSES the flight from wherever it is, instead of jumping to full size;
   *   - a swipe down flies back from where the finger let go, not from the centre;
   *   - with no thumbnail on screen, or zoomed in, the photo fades (and settles, motion allowing)
   *     instead of vanishing, and the fade runs on the stage, so a failed image never shows the
   *     browser's broken-image glyph on its way out;
   *   - opening again while it closes cancels the close and carries on, with nothing left behind.
   *
   * Web Animations rather than classes, because the numbers are measured, and because an animation
   * that is cancelled leaves nothing behind. Durations and easings are the system's motion tokens,
   * read off the dialog, so a theme retunes them in CSS. Reduced motion keeps only the fades. Without
   * `Element.animate` (jsdom) nothing runs and everything is immediate.
   */
  const canAnimate = (): boolean => typeof image.animate === "function";
  const canMove = (): boolean =>
    canAnimate() && !win.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const token = (name: string): string => win.getComputedStyle(dialog).getPropertyValue(name).trim();
  const ms = (name: string, fallback: number): number => {
    const raw = token(name);
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return fallback;
    return raw.endsWith("ms") ? value : raw.endsWith("s") ? value * 1000 : value;
  };
  const timing = (kind: "release" | "navigate" | "enter" | "exit", fallback: number): KeyframeAnimationOptions => ({
    duration: ms(`--motion-${kind}-duration`, fallback),
    easing: token(`--motion-${kind}-easing`) || "ease",
  });
  const px = (value: string): number => Number.parseFloat(value) || 0;
  const visibleImages = (): HTMLImageElement[] => [image, placeholder].filter((img) => !img.hidden);

  /* The thumbnail currently hidden on the page because the photo is standing in for it. */
  let source: HTMLElement | null = null;
  const hideSource = (thumb: HTMLElement): void => {
    showSource();
    /* The whole trigger, not only its `<img>`: a frame around it (ImageFrame's ground) would show. */
    source = thumb.closest<HTMLElement>(`[${lightboxAttrs.opens}]`) ?? thumb;
    source.setAttribute(lightboxAttrs.source, "");
  };
  const showSource = (): void => {
    source?.removeAttribute(lightboxAttrs.source);
    source = null;
  };

  /* The open's flight, kept so a close that lands mid-flight can reverse it. */
  let flight: Animation[] = [];

  /* Every animation this file started, including the close's, which holds its last frame. CSS
     transitions on the same elements are left alone. */
  const stopMotion = (): void => {
    const Transition = (win as typeof globalThis).CSSTransition;
    for (const element of [image, placeholder, stage]) {
      for (const animation of element.getAnimations?.() ?? []) {
        if (Transition && animation instanceof Transition) continue;
        animation.cancel();
      }
    }
    flight = [];
    showSource();
  };

  /** The thumbnail a trigger shows, which is what the photo flies to and from. */
  const thumbnailOf = (trigger: Element | null | undefined): HTMLElement | null => {
    if (!trigger || !trigger.isConnected) return null;
    const thumb = trigger.querySelector<HTMLElement>("img") ?? (trigger as HTMLElement);
    const rect = thumb.getBoundingClientRect();
    const onScreen =
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < win.innerHeight &&
      rect.left < win.innerWidth;
    return onScreen ? thumb : null;
  };

  /** Where a swipe left the photo, which the close flies back from. */
  const dragOffset = (): { x: number; y: number } => ({
    x: px(dialog.style.getPropertyValue("--sk-lightbox-drag-x")),
    y: px(dialog.style.getPropertyValue("--sk-lightbox-drag-y")),
  });

  /** Where the photo is drawn right now: the drag offset plus whatever slide is still running on it. */
  const drawnTranslate = (img: HTMLElement): { x: number; y: number } => {
    const [x = "0", y = "0"] = win.getComputedStyle(img).translate.split(" ");
    return { x: px(x), y: px(y) };
  };

  /** The two ends of one photo's FLIP between its fitted box and a thumbnail. */
  const flipFrames = (img: HTMLImageElement, thumb: HTMLElement): { onThumb: Keyframe; fitted: Keyframe } | null => {
    const drag = drawnTranslate(img);
    const rect = img.getBoundingClientRect();
    /* The fitted box itself, without the offset the rect includes: the flight starts where it is drawn. */
    const to = { left: rect.left - drag.x, top: rect.top - drag.y, width: rect.width, height: rect.height };
    const from = thumb.getBoundingClientRect();
    if (!to.width || !to.height || !from.width || !from.height) return null;
    const scale = Math.max(from.width / to.width, from.height / to.height);
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    /* The clip lives in the photo's own, unscaled box: the thumbnail's crop, divided back by the scale. */
    const insetX = Math.max(0, (to.width - from.width / scale) / 2);
    const insetY = Math.max(0, (to.height - from.height / scale) / 2);
    /* The rounding is often the frame's (an ImageFrame clips its `<img>`), so the largest on the way up. */
    const rounding = [thumb, thumb.parentElement, thumb.closest(`[${lightboxAttrs.opens}]`)].map((element) =>
      element ? px(win.getComputedStyle(element).borderTopLeftRadius) : 0,
    );
    const ownRadius = px(win.getComputedStyle(img).borderTopLeftRadius);
    return {
      onThumb: {
        translate: `${dx}px ${dy}px`,
        scale: `${scale}`,
        clipPath: `inset(${insetY}px ${insetX}px round ${Math.max(...rounding) / scale}px)`,
      },
      fitted: {
        translate: `${drag.x}px ${drag.y}px`,
        scale: "1",
        clipPath: `inset(0px 0px round ${ownRadius}px)`,
      },
    };
  };

  /** Opening: out of the thumbnail when there is one on screen, otherwise a fade and a small settle. */
  const animateIn = (trigger: Element | null | undefined): void => {
    if (!canAnimate()) return;
    stopMotion();
    clearGhosts();
    /* A thumbnail, not whatever button a script opened it from. */
    const thumb = canMove() && trigger?.hasAttribute(lightboxAttrs.opens) ? thumbnailOf(trigger) : null;
    const frames = thumb ? visibleImages().map((img) => [img, flipFrames(img, thumb)] as const) : [];
    if (thumb && frames.length > 0 && frames.every(([, pair]) => pair)) {
      const settle = timing("release", 320);
      /* The move is ADDED to the photo's own translate, not written over it: a hand that grabs the
         photo mid-flight moves it at once, instead of the drag showing up, all at once, on landing.
         The clip is its own animation because an inset does not add. */
      flight = frames.flatMap(([img, pair]) => {
        const { clipPath: fromClip, ...fromMove } = pair!.onThumb;
        const { clipPath: toClip, ...toMove } = pair!.fitted;
        return [
          img.animate([fromMove, { ...toMove, translate: "0px 0px" }], { ...settle, composite: "add" }),
          img.animate([{ clipPath: fromClip }, { clipPath: toClip }], settle),
        ];
      });
      hideSource(thumb);
      const landed = flight;
      void Promise.allSettled(landed.map((animation) => animation.finished)).then(() => {
        /* Landed, not cancelled or reversed: the backdrop covers the thumbnail from here on. */
        if (flight === landed && landed.every((animation) => animation.playState === "finished")) {
          flight = [];
          showSource();
        }
      });
      return;
    }
    const enter = timing("enter", 200);
    stage.animate([{ opacity: 0 }, { opacity: 1 }], enter);
    if (canMove()) {
      for (const img of visibleImages()) {
        img.animate([{ scale: token("--motion-materialize-scale") || "0.98" }, { scale: "1" }], enter);
      }
    }
  };

  /** Closing: back into the thumbnail of the photo the reader ended on, or a fade. */
  const animateOut = (): Promise<unknown> | null => {
    if (!canAnimate()) return null;

    /* Still flying in: turn the same flight around, from exactly where it is. */
    const inFlight = flight.filter((animation) => animation.playState === "running");
    if (inFlight.length > 0 && source) {
      for (const animation of inFlight) {
        animation.effect?.updateTiming({ fill: "both" });
        animation.reverse();
      }
      flight = [];
      return Promise.allSettled(inFlight.map((animation) => animation.finished));
    }

    /* Measured BEFORE anything is cancelled: a close mid-slide flies from where the photo is drawn. */
    const thumb = canMove() && !zoomed() ? thumbnailOf(sessionFallback?.()) : null;
    const frames = thumb ? visibleImages().map((img) => [img, flipFrames(img, thumb)] as const) : [];
    stopMotion();
    if (thumb && frames.length > 0 && frames.every(([, pair]) => pair)) {
      const back = { ...timing("navigate", 200), fill: "forwards" as const };
      hideSource(thumb);
      return Promise.allSettled(
        frames.map(([img, pair]) => img.animate([pair!.fitted, pair!.onThumb], back).finished),
      );
    }

    /* No thumbnail to go back to: fade, on the stage, and settle a little unless zoomed or reduced. */
    const exit = { ...timing("exit", 120), fill: "forwards" as const };
    const animations = [stage.animate([{ opacity: 1 }, { opacity: 0 }], exit)];
    if (canMove() && !zoomed()) {
      for (const img of visibleImages()) {
        animations.push(img.animate([{ scale: "1" }, { scale: token("--motion-materialize-scale") || "0.98" }], exit));
      }
    }
    return Promise.allSettled(animations.map((animation) => animation.finished));
  };

  /*
   * THE SWAP CROSSES, IT NEVER CUTS. There is one `<img>`, and changing its `src` replaced the photo in
   * a single frame: the old one gone, the new one in its own box, at another size, somewhere else.
   * So just before the swap the outgoing photo is copied, frozen exactly where and how it is drawn
   * (mid-drag, mid-slide, half faded), into a GHOST under the real one. The ghost leaves toward the
   * side the reader is moving away from and fades as it goes; the new photo comes in from the other
   * side and fades up. Neither box ever changes size on screen, which is what read as a layout shift.
   */
  const ghosts = new Set<HTMLImageElement>();
  const clearGhosts = (): void => {
    for (const ghost of ghosts) ghost.remove();
    ghosts.clear();
  };

  const ghostOf = (): HTMLImageElement | null => {
    if (!canAnimate()) return null;
    const from = status === "loaded" ? image : !placeholder.hidden && placeholder.src ? placeholder : null;
    if (!from) return null;
    const rect = from.getBoundingClientRect();
    const opacity = Number.parseFloat(win.getComputedStyle(from).opacity);
    if (!rect.width || !rect.height || !(opacity > 0)) return null;
    const box = stage.getBoundingClientRect();
    const ghost = doc.createElement("img");
    ghost.className = lightboxParts.ghost;
    if (from === placeholder) ghost.setAttribute(lightboxAttrs.ghostPlaceholder, "");
    ghost.alt = "";
    ghost.setAttribute("aria-hidden", "true");
    ghost.decoding = "sync";
    ghost.src = from.currentSrc || from.src;
    ghost.style.left = `${rect.left - box.left}px`;
    ghost.style.top = `${rect.top - box.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.opacity = String(opacity);
    stage.insertBefore(ghost, stage.firstChild);
    ghosts.add(ghost);
    return ghost;
  };

  /*
   * Next and previous: the ghost goes, the new photo comes in from the side it comes from.
   *
   * NOTHING IS CANCELLED ON THE WAY. The slide is ADDED to whatever already moves the photo: the
   * drag offset springing home after a swipe, a slide from the step before that has not landed, even
   * the open's flight. Cancelling any of them is what made the photo jump to the end of a motion it
   * had not finished. Each one runs out on its own, and they all end at zero. The fades lead the
   * slides (done at 60%), so the two photos are never both half there for long.
   */
  const animateStep = (direction: 1 | -1, ghost: HTMLImageElement | null): void => {
    if (!canAnimate()) return;
    const settle = timing("release", 320);
    const from = canMove() ? (rtl() ? -direction : direction) * px(token("--motion-navigate-distance")) * 4 : 0;
    if (ghost) {
      const out = ghost.animate(
        [
          { translate: "0px 0px", opacity: ghost.style.opacity },
          { opacity: 0, offset: 0.6 },
          { translate: `${-from}px 0px`, opacity: 0 },
        ],
        { ...settle, fill: "forwards" },
      );
      const drop = () => {
        ghost.remove();
        ghosts.delete(ghost);
      };
      void out.finished.then(drop, drop);
    }
    for (const img of visibleImages()) {
      if (from) img.animate([{ translate: `${from}px 0px` }, { translate: "0px 0px" }], { ...settle, composite: "add" });
      /* Up to the opacity it is meant to have: a photo still loading is 0 (its own transition brings
         it in when it lands), the blurred placeholder is less than 1. */
      const target = win.getComputedStyle(img).opacity;
      if (Number.parseFloat(target) > 0) img.animate([{ opacity: 0 }, { opacity: target, offset: 0.6 }, { opacity: target }], settle);
    }
  };

  /* ---- navigation ---- */
  const show = (next: number, direction?: 1 | -1): void => {
    if (!isOpen || closing || next === index || next < 0 || next >= images.length) return;
    const from = index;
    index = next;
    const ghost = ghostOf();
    renderImage();
    animateStep(direction ?? (next > from ? 1 : -1), ghost);
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
    if (next !== null) show(next, delta);
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
    readonly mode: "pan" | "swipe";
    dx: number;
    dy: number;
    /* Where a photo at fit was, in untethered px, when the hand caught it (mid-spring, or 0). */
    readonly base: { x: number; y: number };
    /* The last ~100ms of the pointer, for the speed it is let go at. */
    readonly samples: { t: number; x: number; y: number }[];
    /* It stopped a spring: a press that catches a moving photo is never also a click on the backdrop. */
    readonly caught: boolean;
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

  /*
   * ---- THE SPRING ----
   *
   * A released photo is not handed to a CSS transition: a transition starts from rest and runs a fixed
   * curve, so a photo thrown fast and a photo set down gently came home exactly the same way, and a
   * photo caught on its way back jumped to wherever the transition was going. Here each axis is a
   * damped spring that starts with the hand's own speed, and grabbing it again simply stops it where
   * it is drawn. `data-sk-settling` switches the stylesheet's transitions off while it runs. Reduced
   * motion (and a DOM with nothing to animate, like jsdom) skips it: the photo is set home at once.
   */

  function stopSpring(): void {
    if (!spring) return;
    win.cancelAnimationFrame(spring.raf);
    const wasPan = spring.kind === "pan";
    spring = null;
    dialog.removeAttribute(lightboxAttrs.settling);
    if (wasPan) commit();
  }

  const writeSpring = (current: Spring, x: number, y: number): void => {
    if (current.kind === "offset") writeDragOffset(x, y);
    else {
      view = { x, y, scale: view.scale };
      applyView();
    }
  };

  const runSpring = (
    kind: Spring["kind"],
    from: { x: number; y: number },
    velocity: { x: number; y: number },
    target: { x: number; y: number },
    tuning: LightboxSpring,
  ): void => {
    stopSpring();
    if (!canMove()) {
      if (kind === "offset") writeDragOffset(target.x, target.y);
      else setView({ x: target.x, y: target.y, scale: view.scale });
      return;
    }
    const current: Spring = {
      kind,
      tuning,
      target,
      x: { position: from.x, velocity: velocity.x },
      y: { position: from.y, velocity: velocity.y },
      last: win.performance.now(),
      raf: 0,
    };
    const tick = (now: number): void => {
      if (spring !== current) return;
      const dt = now - current.last;
      current.last = now;
      current.x = lightboxSpringStep(current.x, target.x, dt, tuning);
      current.y = lightboxSpringStep(current.y, target.y, dt, tuning);
      if (lightboxSpringSettled(current.x, target.x) && lightboxSpringSettled(current.y, target.y)) {
        writeSpring(current, target.x, target.y);
        stopSpring();
        return;
      }
      writeSpring(current, current.x.position, current.y.position);
      current.raf = win.requestAnimationFrame(tick);
    };
    spring = current;
    dialog.setAttribute(lightboxAttrs.settling, "");
    current.raf = win.requestAnimationFrame(tick);
  };

  /** The pointer's speed over its last ~100ms, in px/ms. Zero for a hand that stopped before letting go. */
  const releaseVelocity = (samples: Single["samples"]): { x: number; y: number } => {
    const last = samples[samples.length - 1];
    const first = samples[0];
    if (!last || !first || last === first) return { x: 0, y: 0 };
    if (win.performance.now() - last.t > 60) return { x: 0, y: 0 };
    /* Two events a millisecond apart are noise, not a speed; and no hand throws faster than this. */
    const dt = last.t - first.t;
    if (dt < 8) return { x: 0, y: 0 };
    const cap = (v: number) => Math.max(-6, Math.min(6, v));
    return { x: cap((last.x - first.x) / dt), y: cap((last.y - first.y) / dt) };
  };

  const tetherReach = (bounds: { stage: LightboxSize } | null) => ({
    x: Math.min((bounds?.stage.width ?? stage.clientWidth) * LIGHTBOX_TETHER_REACH, LIGHTBOX_TETHER_MAX),
    y: Math.min((bounds?.stage.height ?? stage.clientHeight) * LIGHTBOX_TETHER_REACH, LIGHTBOX_TETHER_MAX),
  });

  /** A public write: whatever is springing stops, and the offset is exactly this. */
  const setDragOffset = (x: number, y: number): void => {
    stopSpring();
    writeDragOffset(x, y);
  };

  function writeDragOffset(x: number, y: number): void {
    if (x === 0 && y === 0) {
      dialog.style.removeProperty("--sk-lightbox-drag-x");
      dialog.style.removeProperty("--sk-lightbox-drag-y");
      return;
    }
    /* Sub-pixel on purpose: a spring's last frames are fractions of a pixel, and rounding them makes
       it tick into place instead of settling. */
    dialog.style.setProperty("--sk-lightbox-drag-x", `${x.toFixed(2)}px`);
    dialog.style.setProperty("--sk-lightbox-drag-y", `${y.toFixed(2)}px`);
  }

  const beginSingle = (id: number, type: string, x: number, y: number): void => {
    /* Caught mid-flight: it stops where it is drawn, and the drag carries on from there. */
    const caught = spring;
    stopSpring();
    const bounds = { fitted: fittedSize(), stage: stageSize() };
    const reach = tetherReach(bounds);
    const drawn = caught?.kind === "offset" ? dragOffset() : { x: 0, y: 0 };
    gesture = {
      kind: "single",
      id,
      type,
      startX: x,
      startY: y,
      startAt: win.performance.now(),
      start: view,
      moved: false,
      /* THE ZOOM DECIDES WHAT A DRAG IS. Zoomed, one finger (or the mouse) pans the photo and can
         never change it. At fit, the photo is loose on the stage: anything can pick it up and move it
         anywhere, and it springs back to the centre when let go. Only a finger's release can turn
         that into a swipe; a mouse user has buttons and keys, and a drag that changes photos under
         them is a surprise. */
      mode: zoomed() ? "pan" : "swipe",
      dx: 0,
      dy: 0,
      base: { x: lightboxUntether(drawn.x, reach.x), y: lightboxUntether(drawn.y, reach.y) },
      samples: [{ t: win.performance.now(), x, y }],
      caught: caught !== null,
    };
    gestureBounds = bounds;
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (!isOpen) return;
    /* The same pointer pressing again means its last release never reached us: close that one first. */
    if (pointers.has(event.pointerId)) endGesture(event, true);
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
    /* A mouse that comes back with no button down was released somewhere we could not hear it (outside
       the window, or outside this frame): that was the release. */
    if (event.pointerType === "mouse" && event.buttons === 0) {
      endGesture(event, false);
      return;
    }
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
    const now = win.performance.now();
    gesture.samples.push({ t: now, x: event.clientX, y: event.clientY });
    while (gesture.samples.length > 2 && now - gesture.samples[0]!.t > 100) gesture.samples.shift();
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
      /* Elastic past the edges while held; `endGesture` clamps it back. */
      scheduleView(
        lightboxElasticView(
          { x: gesture.start.x + dx, y: gesture.start.y + dy, scale: gesture.start.scale },
          gestureBounds.fitted,
          gestureBounds.stage,
        ),
      );
    } else if (gesture.mode === "swipe") {
      /* The photo follows the hand on both axes, on its tether: a swipe is seen before it commits, and
         a drag that is not one is just the photo being held. */
      const reach = tetherReach(gestureBounds);
      writeDragOffset(
        lightboxTether(gesture.base.x + dx, reach.x),
        lightboxTether(gesture.base.y + dy, reach.y),
      );
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
    const bounds = gestureBounds;
    gesture = null;
    gestureBounds = null;
    dialog.removeAttribute(lightboxAttrs.dragging);

    if (current.moved) {
      suppressClick = true;
      const velocity = cancelled ? { x: 0, y: 0 } : releaseVelocity(current.samples);
      if (current.mode === "pan") {
        /* Let go: it coasts on its momentum and glides to rest inside the frame, or, let go past an
           edge, glides back to it. */
        flushView();
        if (!bounds) return;
        const landing = lightboxClampView(
          {
            x: view.x + lightboxFlingDistance(velocity.x),
            y: view.y + lightboxFlingDistance(velocity.y),
            scale: view.scale,
          },
          bounds.fitted,
          bounds.stage,
        );
        runSpring("pan", view, { x: velocity.x * 1000, y: velocity.y * 1000 }, landing, LIGHTBOX_SPRING_GLIDE);
      } else if (current.mode === "swipe") {
        const verdict = cancelled || current.type === "mouse"
          ? null
          : lightboxSwipeVerdict(current.dx, current.dy, win.performance.now() - current.startAt, { rtl: rtl() });
        /* A swipe down that closes keeps the photo where the finger left it: the close flies back
           from there. Everything else springs back to the centre first. */
        if (verdict === "close") return close();
        /* A swipe to a neighbour does not snap the offset away: the next photo slides in ON TOP of
           it springing home (the slide adds), and at either end of a gallery with no loop, where there
           is no neighbour, it simply springs home. */
        if (verdict === "next" || verdict === "previous") step(verdict === "next" ? 1 : -1);
        /* Home on the tether, starting at the hand's speed as the photo is drawn: the tether's own
           slope at that point scales it, so the throw and the drawing agree. */
        const reach = tetherReach(bounds);
        const from = dragOffset();
        const slope = (pulled: number, r: number) => 1 / (1 + Math.abs(pulled) / r) ** 2;
        const pulled = { x: current.base.x + current.dx, y: current.base.y + current.dy };
        runSpring(
          "offset",
          from,
          {
            x: velocity.x * 1000 * slope(pulled.x, reach.x),
            y: velocity.y * 1000 * slope(pulled.y, reach.y),
          },
          { x: 0, y: 0 },
          LIGHTBOX_SPRING_RELEASE,
        );
      }
      return;
    }

    /* Caught on its way home and let go where it was: it still has to get there. */
    if (current.caught) {
      suppressClick = true;
      if (current.mode === "swipe") {
        const at = dragOffset();
        if (at.x || at.y) runSpring("offset", at, { x: 0, y: 0 }, { x: 0, y: 0 }, LIGHTBOX_SPRING_RELEASE);
      } else if (bounds) {
        const home = lightboxClampView(view, bounds.fitted, bounds.stage);
        if (home.x !== view.x || home.y !== view.y) runSpring("pan", view, { x: 0, y: 0 }, home, LIGHTBOX_SPRING_GLIDE);
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

  /*
   * A DRAG NEVER OUTLIVES THE HAND. The browser owes us a `pointerup`, but not always: a release
   * outside the window, over another frame, or after the tab lost focus may never arrive, and the
   * photo stayed stuck to a cursor that had long let go. Losing the capture, the window losing focus
   * and the page going hidden each end every gesture in progress, as a cancel: nothing is decided,
   * the photo just goes home.
   */
  const onLostCapture = (event: PointerEvent): void => {
    if (pointers.has(event.pointerId)) endGesture(event, true);
  };
  const cancelGestures = (): void => {
    for (const pointerId of Array.from(pointers.keys())) {
      endGesture({ pointerId, pointerType: "mouse", target: null, clientX: 0, clientY: 0 } as unknown as PointerEvent, true);
    }
  };
  const onVisibility = (): void => {
    if (doc.visibilityState === "hidden") cancelGestures();
  };

  /*
   * WITH A MOUSE, THE PLAIN WHEEL AND A DOUBLE CLICK DO NOT ZOOM: on a desktop they are how people
   * scroll and select, and a photo that lurches under a stray notch is worse than one more click.
   * Touch keeps its own gestures, pinch and double tap, because there the photo is the only thing to
   * hold.
   *
   * CTRL OR CMD + WHEEL DOES, around the pointer: Canvas's gesture, and a trackpad pinch, which the
   * browser reports as exactly that (a wheel with `ctrlKey`). Holding the key is the intent a stray
   * notch never has. That wheel, and only that one, is cancelled: left alone, the browser would zoom
   * the whole page behind the modal. A plain wheel is still not cancelled and not listened to: the
   * page behind is frozen by `scroll-lock.css`, and a cancelled wheel is a claim that someone
   * consumed it, which an embedding (a docs preview forwarding the wheel to its host page) reads as
   * "leave it alone".
   *
   * Each notch is applied at once, with the transform's transition off (`data-sk-settling`) until the
   * wheel goes quiet: eased steps queued behind a pinch felt like zooming through syrup.
   */
  let wheelIdle = 0;
  const onWheel = (event: WheelEvent): void => {
    if (!isOpen || closing || !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    if (!canZoom()) return;
    zoomTo(view.scale * lightboxWheelFactor(event.deltaY, event.deltaMode), local(event.clientX, event.clientY));
    dialog.setAttribute(lightboxAttrs.settling, "");
    win.clearTimeout(wheelIdle);
    wheelIdle = win.setTimeout(() => {
      if (!spring) dialog.removeAttribute(lightboxAttrs.settling);
    }, 160);
  };

  /* Safari's own pinch-to-zoom of the page, which `touch-action` alone does not stop there. */
  const onGesture = (event: Event): void => event.preventDefault();

  /* ---- clicks: controls, then the backdrop ---- */
  const isBackdrop = (target: EventTarget | null): boolean =>
    target === dialog || target === stage || target === part("figure") || target === part("toolbar");

  const onClick = (event: MouseEvent): void => {
    if (closing) return;
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
  /*
   * THE TAB WRAP is not here. `showModal()` keeps focus off the inert page but lets Tab from the last
   * control leave for the browser's toolbar; `trapModalDialogs`, held from connect to `destroy()`,
   * wraps it for this dialog exactly as for every other modal in the kit, `<body>` re-entry included.
   * Not per session: it is stateless and only acts on a `:modal` dialog, so holding it while closed
   * costs one idle listener, the same one Dialog and Vaul hold while mounted.
   */
  const onKeyDown = (event: KeyboardEvent): void => {
    if (!isOpen || event.defaultPrevented) return;
    if (closing) {
      event.preventDefault();
      return;
    }
    const target = event.target as Node | null;
    /* The page is inert, so a key can only come from inside the dialog or from <body> (focus lands
       there after a click on something that cannot hold it). Anything else is not ours. */
    if (target && target !== doc.body && target !== doc.documentElement && !dialog.contains(target)) return;
    if (event.key === "Tab") return;
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
    win.addEventListener("blur", cancelGestures);
    doc.addEventListener("visibilitychange", onVisibility);
    if (typeof ResizeObserver !== "undefined" && stage !== dialog) {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(stage);
    }
  };
  const detachSession = (): void => {
    doc.removeEventListener("keydown", onKeyDown);
    win.removeEventListener("resize", onResize);
    win.removeEventListener("blur", cancelGestures);
    doc.removeEventListener("visibilitychange", onVisibility);
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

    /* Opened again while the close animation runs: the close is called off, and this open replaces
       what is shown like any other second open. */
    if (closing) {
      closing = false;
      closeToken += 1;
      dialog.removeAttribute(lightboxAttrs.closing);
      stopMotion();
      setDragOffset(0, 0);
    }

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
    animateIn(returnFocus);
    /* A known, harmless first stop: Close, the one control every reader can use. Explicit rather
       than `autofocus`, which React does not write to the DOM. */
    (control("close") ?? tabbables(dialog)[0] ?? dialog).focus({ preventScroll: true });
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

  /*
   * Closing waits for the photo to fly back to its thumbnail, when it has one on screen; the
   * backdrop and the chrome fade out alongside it (`data-sk-closing`, in the stylesheet). The dialog
   * stays open, and modal, until then, and every key and click in that window is swallowed.
   */
  function close(): void {
    if (!isOpen || closing) return;
    /* The flight home starts from where the photo is drawn now, and nothing moves it after. */
    stopSpring();
    const settled = animateOut();
    if (!settled) {
      if (dialog.open) dialog.close();
      finish();
      return;
    }
    closing = true;
    closeToken += 1;
    const mine = closeToken;
    dialog.setAttribute(lightboxAttrs.closing, "");
    void settled.then(() => {
      if (!closing || mine !== closeToken) return;
      if (dialog.open) dialog.close();
      finish();
    });
  }

  /** Everything closing means, whatever closed it. Idempotent: the `close` event may come after. */
  function finish(): void {
    if (!isOpen) return;
    isOpen = false;
    closing = false;
    dialog.removeAttribute(lightboxAttrs.closing);
    stopMotion();
    clearGhosts();
    win.clearTimeout(wheelIdle);
    dialog.removeAttribute(lightboxAttrs.settling);
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
    /* An `<img>` with alt text and no source draws as a broken image; the stylesheet hides it too. */
    image.alt = "";
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
  stage.addEventListener("pointerdown", onPointerDown);
  stage.addEventListener("pointermove", onPointerMove, { passive: false });
  stage.addEventListener("pointerup", onPointerUp);
  stage.addEventListener("pointercancel", onPointerCancel);
  stage.addEventListener("lostpointercapture", onLostCapture);
  stage.addEventListener("gesturestart", onGesture);
  /* On the dialog, not the stage: the key + wheel zooms wherever the pointer is over the viewer. */
  dialog.addEventListener("wheel", onWheel, { passive: false });
  doc.addEventListener("click", onDocumentClick);
  doc.addEventListener("pointerover", onTriggerIntent, { passive: true });
  doc.addEventListener("focusin", onTriggerIntent);
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
      releaseTrap();
      dialog.removeEventListener("click", onClick);
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onNativeClose);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerCancel);
      stage.removeEventListener("lostpointercapture", onLostCapture);
      stage.removeEventListener("gesturestart", onGesture);
      dialog.removeEventListener("wheel", onWheel);
      doc.removeEventListener("click", onDocumentClick);
      doc.removeEventListener("pointerover", onTriggerIntent);
      doc.removeEventListener("focusin", onTriggerIntent);
      warmed.clear();
      image.removeEventListener("load", onImageLoad);
      placeholder.removeEventListener("load", onPlaceholderLoad);
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
