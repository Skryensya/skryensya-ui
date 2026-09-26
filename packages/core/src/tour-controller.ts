import { isShown, tabbables } from "./focus-trap.js";
import { STORAGE_KEY, readStore, writeStore } from "./storage.js";
import {
  formatTourProgress,
  normalizeTourPlacement,
  parseTourMemory,
  placeTourPopover,
  tourAttrs,
  tourContract,
  tourFirstStep,
  tourMemorySlot,
  tourParts,
  tourProgress,
  tourRectInView,
  tourRectVisible,
  tourRingRadius,
  tourStep,
  type TourAction,
  type TourRect,
  type TourStatus,
  type TourStep,
} from "./tour.js";

/*
 * TOUR, the controller: the one place a tour's behaviour is wired. DOM-touching and framework-free,
 * for Lightbox's reason: both bindings need exactly the same listeners, and two copies of focus
 * return or of "which step is next when one is missing" are two ways to be wrong. The Vanilla
 * enhancer calls it on authored markup; the React component calls it in an effect on the markup it
 * rendered.
 *
 * WHAT IT WRITES, and nothing else: the text of the progress, title and description; the ids and
 * `aria-*` that tie them to the box; `hidden` on the buttons that come and go; the box's and the
 * ring's `top`/`left`/size and the ring's corner radii; and a few `data-sk-*` flags on the root, the
 * box, the ring and every trigger. React renders none of those, so the two never fight over one.
 *
 * WHAT IT NEVER DOES: move focus unless a tour control or `start()` asked, scroll unless a new step's
 * target is out of view, touch the page outside its own parts, or listen for a click outside.
 */

/** A snapshot. A new object on every change, so it can back `useSyncExternalStore` as is. */
export type TourState = {
  readonly status: TourStatus;
  /** Index into the authored steps, or `-1` while not running. */
  readonly index: number;
  readonly step: TourStep | null;
  /** 1-based, among the steps whose target is on the page. 0 while not running. */
  readonly position: number;
  readonly count: number;
  /** How the tour last ended, as remembered across visits; `null` when it never has. */
  readonly remembered: TourStatus | null;
};

export const TOUR_IDLE_STATE: TourState = Object.freeze({
  status: "idle",
  index: -1,
  step: null,
  position: 0,
  count: 0,
  remembered: null,
});

export type TourCallbacks = {
  readonly onStatusChange?: (status: TourStatus) => void;
  readonly onStepChange?: (index: number, step: TourStep) => void;
};

export type TourConfig = TourCallbacks & {
  /** "Step {index} of {count}". */
  readonly progressLabel?: string;
  /** Remember how the tour ended. Default true. */
  readonly remember?: boolean;
  /**
   * Where focus goes on close when the element that started the tour is gone. Returning nothing
   * falls back to the first trigger for this tour still on the page, then to the document body.
   */
  readonly fallbackFocus?: () => HTMLElement | null;
};

export type TourStartOptions = {
  /** Which step to start on. Defaults to the first one whose target is on the page. */
  readonly index?: number;
  /**
   * Where focus returns on close. Defaults to whatever had focus when the tour started, which is the
   * trigger when a trigger started it.
   */
  readonly returnFocus?: HTMLElement | null;
};

/** The whole public surface. Everything is a safe no-op when it cannot apply. */
export interface TourController {
  /** Starts the tour. While it is running, does nothing: use `restart()` to go back to step one. */
  start(options?: TourStartOptions): void;
  /** Starts over from the first step, whether it is running, ended or never ran. */
  restart(options?: TourStartOptions): void;
  /** Ends the tour as dismissed and returns focus. */
  close(): void;
  /** Ends the tour as skipped. What "Skip tour" does. */
  skip(): void;
  /** The next step with a target, or finishing on the last one. */
  next(): void;
  previous(): void;
  /** Goes to a step whose target is on the page; anything else is ignored. */
  goTo(index: number): void;
  /** Places the ring and the box again. Rarely needed: scroll, resize and target changes already do. */
  refresh(): void;
  /** Forgets how the tour ended, so the next visit is a first visit. */
  forget(): void;
  getState(): TourState;
  subscribe(listener: () => void): () => void;
  /** Merge new configuration: React passes its current props on every render. */
  configure(config: TourConfig): void;
  /** Closes without moving focus, removes every listener and restores everything it wrote. */
  destroy(): void;
}

/** Fired on the root, for authored pages that listen rather than subscribe. */
export const tourEvents = tourContract.events;

const controllers = new WeakMap<HTMLElement, TourController>();

/* `--scale-easing-standard`: Web Animations cannot read a custom property, so the curve is named here
   once, the one the stylesheet's expand intent uses. */
const SOFT_EASING = "cubic-bezier(0.2, 0, 0, 1)";

/** The controller already connected to this tour's root, if any. */
export function getTourController(root: HTMLElement): TourController | null {
  return controllers.get(root) ?? null;
}

/*
 * THE STATUS BY TOUR ID, readable before and without a controller. A trigger can be rendered
 * anywhere (another React subtree, a header outside the page's own tree), so it cannot ask the tour
 * for its status by walking up; it asks this, which the controller keeps current and which falls back
 * to what storage remembers.
 */
const statusListeners = new Map<string, Set<() => void>>();
const liveStatus = new Map<string, TourStatus>();

function storage(win: Window | null | undefined): Storage | null {
  try {
    return win?.localStorage ?? null;
  } catch {
    return null;
  }
}

/** How the tour with this id last ended, as stored; `null` when it never has or storage is unreachable. */
export function readTourMemory(tourId: string, win: Window | null | undefined = globalThis.window): TourStatus | null {
  if (!tourId) return null;
  try {
    return parseTourMemory(readStore(storage(win)?.getItem(STORAGE_KEY))[tourMemorySlot(tourId)]) ?? null;
  } catch {
    return null;
  }
}

function writeTourMemory(tourId: string, status: TourStatus | null, win: Window | null | undefined): void {
  const store = storage(win);
  if (!store || !tourId) return;
  try {
    const current = readStore(store.getItem(STORAGE_KEY));
    const slot = tourMemorySlot(tourId);
    if (status === null) delete current[slot];
    else current[slot] = status;
    store.setItem(STORAGE_KEY, writeStore(current));
  } catch {
    /* Private mode, a full quota: the tour works the same, it just will not remember. */
  }
}

/** The status a trigger for this tour should reflect: the live one while connected, else the remembered one. */
export function getTourStatus(tourId: string, win: Window | null | undefined = globalThis.window): TourStatus {
  return liveStatus.get(tourId) ?? readTourMemory(tourId, win) ?? "idle";
}

/** Called whenever the status of the tour with this id changes. */
export function subscribeTourStatus(tourId: string, listener: () => void): () => void {
  const set = statusListeners.get(tourId) ?? new Set();
  set.add(listener);
  statusListeners.set(tourId, set);
  return () => {
    set.delete(listener);
    if (set.size === 0) statusListeners.delete(tourId);
  };
}

function publishStatus(tourId: string, status: TourStatus | null): void {
  if (!tourId) return;
  if (status === null) liveStatus.delete(tourId);
  else liveStatus.set(tourId, status);
  for (const listener of statusListeners.get(tourId) ?? []) listener();
}

/** Every trigger that starts the tour with this id. */
export function tourTriggers(doc: Document, tourId: string): HTMLElement[] {
  if (!tourId) return [];
  return Array.from(doc.querySelectorAll<HTMLElement>(`[${tourAttrs.opens}]`)).filter(
    (trigger) => trigger.getAttribute(tourAttrs.opens) === tourId,
  );
}

/** The authored steps, read off the hidden list. Text only: a step's body is a sentence, not markup. */
export function readTourSteps(root: HTMLElement): TourStep[] {
  return Array.from(root.querySelectorAll<HTMLElement>(`.${tourParts.step}`)).map((item) => ({
    target: item.getAttribute(tourAttrs.target)?.trim() ?? "",
    title: item.querySelector(`.${tourParts.stepTitle}`)?.textContent?.trim() ?? "",
    description: item.querySelector(`.${tourParts.stepDescription}`)?.textContent?.trim() ?? "",
    placement: normalizeTourPlacement(item.getAttribute(tourAttrs.placement)),
  }));
}

/** The element a selector names, or `null` for no match and for a selector that is not one. */
export function resolveTourTarget(doc: Document, selector: string): HTMLElement | null {
  if (!selector) return null;
  try {
    return doc.querySelector<HTMLElement>(selector);
  } catch {
    return null;
  }
}

/**
 * Whether the reader can see this element at all: connected, not `hidden`, not `display: none` or
 * `visibility: hidden` anywhere up its tree. The check itself is `focus-trap.ts`'s `isShown`, which
 * this used to be a copy of; the name stays because both bindings import it.
 */
export function isTourTargetShown(element: HTMLElement | null): element is HTMLElement {
  return isShown(element);
}

/** Can focus land here and be seen? An element that is gone or hidden is not a place to put a reader. */
function canTakeFocus(element: HTMLElement | null | undefined): element is HTMLElement {
  return Boolean(element?.isConnected) && isTourTargetShown(element as HTMLElement) && !element!.closest("[inert]");
}

/**
 * Wire one tour. Both bindings call exactly this on a root carrying the tour's parts. Connecting the
 * same root twice returns the controller it already has.
 */
export function connectTour(root: HTMLElement, initial: TourConfig = {}): TourController {
  const existing = controllers.get(root);
  if (existing) {
    existing.configure(initial);
    return existing;
  }

  const doc = root.ownerDocument;
  const win = doc.defaultView ?? window;
  const part = <T extends HTMLElement = HTMLElement>(name: keyof typeof tourParts): T | null =>
    root.querySelector<T>(`.${tourParts[name]}`);

  const ring = part("ring");
  const popover = part("popover");
  const progress = part("progress");
  const title = part("title");
  const description = part("description");
  const live = part("live");
  const controls = Array.from(root.querySelectorAll<HTMLButtonElement>(`[${tourAttrs.action}]`));
  const control = (action: TourAction) =>
    controls.find((button) => button.getAttribute(tourAttrs.action) === action) ?? null;

  let config: TourConfig = { ...initial };
  const tourId = () => root.id;

  /* The ids the box's name and description point at, derived from the root's so they are stable across
     renders and unique per tour. Written only where the markup has none. */
  const idFor = (element: HTMLElement | null, suffix: string) => {
    if (element && !element.id) element.id = `${tourId() || "sk-tour"}-${suffix}`;
    return element?.id ?? "";
  };
  const titleId = idFor(title, "title");
  const progressId = idFor(progress, "progress");
  const descriptionId = idFor(description, "description");
  if (popover) {
    popover.setAttribute("aria-labelledby", titleId);
    popover.setAttribute("aria-describedby", [progressId, descriptionId].filter(Boolean).join(" "));
  }

  let state: TourState = { ...TOUR_IDLE_STATE, remembered: readTourMemory(tourId(), win) };
  let steps: TourStep[] = [];
  let target: HTMLElement | null = null;
  let returnFocus: HTMLElement | null = null;
  let frame = 0;
  let destroyed = false;
  const listeners = new Set<() => void>();
  const detach: (() => void)[] = [];

  const emit = (type: string, detail: unknown) => {
    const Ctor = (win as typeof globalThis).CustomEvent ?? CustomEvent;
    root.dispatchEvent(new Ctor(type, { detail }));
  };

  const setState = (next: Partial<TourState>) => {
    state = { ...state, ...next };
    for (const listener of listeners) listener();
  };

  /* ---------------------------------------------------------------------------------------------- *
   * Status: on the root, on every trigger, in storage and in the by-id store
   * ---------------------------------------------------------------------------------------------- */

  const stampStatus = (status: TourStatus) => {
    root.setAttribute(tourAttrs.status, status);
    /* A trigger reflects how the tour ENDED, not that it is running: "Repeat tour" stays "Repeat tour"
       while the second run is up, and a first run keeps its first label until it ends. */
    const shown = status === "running" ? (state.remembered ?? "idle") : status;
    for (const trigger of tourTriggers(doc, tourId())) trigger.setAttribute(tourAttrs.status, shown);
  };

  const setStatus = (status: TourStatus) => {
    const remembered =
      status === "completed" || status === "skipped" || status === "dismissed" ? status : state.remembered;
    if (remembered !== state.remembered && config.remember !== false) writeTourMemory(tourId(), remembered, win);
    const changed = status !== state.status;
    setState({ status, remembered });
    stampStatus(status);
    publishStatus(tourId(), status === "running" ? (remembered ?? "idle") : status);
    if (changed) {
      config.onStatusChange?.(status);
      emit(tourEvents.statusChange, { status });
    }
  };

  /* ---------------------------------------------------------------------------------------------- *
   * Steps and targets
   * ---------------------------------------------------------------------------------------------- */

  /* Asked again on every move: the page is live, and a target can come or go between two steps. */
  const availability = () => {
    steps = readTourSteps(root);
    return steps.map((step) => isTourTargetShown(resolveTourTarget(doc, step.target)));
  };

  const viewport = () => ({
    /* `||`, not `??`: an engine with no layout reports 0, which is a number and not a viewport. */
    width: win.visualViewport?.width || doc.documentElement.clientWidth || win.innerWidth,
    height: win.visualViewport?.height || doc.documentElement.clientHeight || win.innerHeight,
  });

  const reducedMotion = () => win.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

  const rtl = () => (win.getComputedStyle(root).direction || doc.documentElement.dir) === "rtl";

  /*
   * MOTION, all of it opt-out under `prefers-reduced-motion` and none of it looping:
   *   - entering, the box grows out of its arrow and the ring closes in on the target (tour.css,
   *     `@starting-style`);
   *   - between steps, the ring and the box TRAVEL to the next target (`data-sk-moving` turns their
   *     geometry transitions on for one trip) while the text fades in, so the eye follows the move
   *     instead of hunting for where the box went. Not when the page had to scroll: the box would
   *     glide while the page slid under it, two motions for one step;
   *   - leaving, both fade out gently before they are hidden.
   * Durations are the system's intent tokens, read off the box, so a retuned token retunes the tour.
   */
  const motionMs = (token: string, fallback: number) => {
    if (!popover) return fallback;
    const raw = win.getComputedStyle(popover).getPropertyValue(token).trim();
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return fallback;
    return raw.endsWith("ms") ? value : raw.endsWith("s") ? value * 1000 : value;
  };
  const canAnimate = (element: HTMLElement | null): element is HTMLElement & { animate: Element["animate"] } =>
    Boolean(element) && typeof (element as HTMLElement).animate === "function" && !reducedMotion();

  const exits = new Map<HTMLElement, Animation>();
  let movingTimer = 0;
  const stopMoving = () => {
    win.clearTimeout(movingTimer);
    movingTimer = 0;
    ring?.removeAttribute(tourAttrs.moving);
    popover?.removeAttribute(tourAttrs.moving);
  };

  const showLayer = (element: HTMLElement | null) => {
    if (!element) return;
    exits.get(element)?.cancel();
    exits.delete(element);
    element.inert = false;
    element.hidden = false;
    const layer = element as HTMLElement & { showPopover?: () => void };
    if (element.hasAttribute("popover") && typeof layer.showPopover === "function" && !element.matches(":popover-open")) {
      try {
        layer.showPopover();
      } catch {
        /* Not in the document, or the engine refused: `hidden` removed is still a visible box. */
      }
    }
  };

  const hideNow = (element: HTMLElement) => {
    const layer = element as HTMLElement & { hidePopover?: () => void };
    try {
      if (typeof layer.hidePopover === "function" && element.matches(":popover-open")) layer.hidePopover();
    } catch {
      /* Already closed. */
    }
    element.inert = false;
    element.hidden = true;
  };

  /* Fades out first when it can. `inert` for the length of the fade: a box on its way out takes no click. */
  const hideLayer = (element: HTMLElement | null) => {
    if (!element || element.hidden) return;
    if (!canAnimate(element)) {
      hideNow(element);
      return;
    }
    element.inert = true;
    const exit = element.animate(
      [{ opacity: 1 }, { opacity: 0, scale: element === popover ? "0.98" : "1.02" }],
      { duration: motionMs("--motion-enter-duration", 200), easing: SOFT_EASING },
    );
    exits.set(element, exit);
    exit.finished.then(
      () => {
        if (exits.get(element) !== exit) return;
        exits.delete(element);
        hideNow(element);
      },
      () => {},
    );
  };

  /* ---------------------------------------------------------------------------------------------- *
   * Placement
   * ---------------------------------------------------------------------------------------------- */

  const ringOffset = () => {
    if (!ring) return 0;
    const raw = win.getComputedStyle(ring).getPropertyValue("--sk-tour-ring-offset").trim();
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return 6;
    return raw.endsWith("rem") ? value * Number.parseFloat(win.getComputedStyle(doc.documentElement).fontSize || "16") : value;
  };

  const place = () => {
    frame = 0;
    if (state.status !== "running" || !target || !popover) return;
    if (!isTourTargetShown(target)) {
      onTargetLost();
      return;
    }
    const box = target.getBoundingClientRect();
    const rect: TourRect = { top: box.top, left: box.left, width: box.width, height: box.height };
    const view = viewport();
    const onScreen = tourRectVisible(rect, view);

    if (ring) {
      const offset = ringOffset();
      const style = win.getComputedStyle(target);
      Object.assign(ring.style, {
        top: `${rect.top - offset}px`,
        left: `${rect.left - offset}px`,
        width: `${rect.width + offset * 2}px`,
        height: `${rect.height + offset * 2}px`,
        borderTopLeftRadius: tourRingRadius(style.borderTopLeftRadius, offset),
        borderTopRightRadius: tourRingRadius(style.borderTopRightRadius, offset),
        borderBottomRightRadius: tourRingRadius(style.borderBottomRightRadius, offset),
        borderBottomLeftRadius: tourRingRadius(style.borderBottomLeftRadius, offset),
      });
      ring.toggleAttribute(tourAttrs.offscreen, !onScreen);
    }

    const size = popover.getBoundingClientRect();
    const at = placeTourPopover({
      target: rect,
      popover: { width: size.width, height: size.height },
      viewport: view,
      preferred: state.step?.placement,
      rtl: rtl(),
    });
    popover.style.top = `${at.top}px`;
    popover.style.left = `${at.left}px`;
    popover.setAttribute(tourAttrs.side, at.side);
    popover.toggleAttribute(tourAttrs.offscreen, !onScreen);
    if (at.arrow) {
      popover.setAttribute(tourAttrs.arrow, at.arrow.edge);
      popover.style.setProperty("--sk-tour-arrow-offset", `${at.arrow.offset}px`);
    } else {
      popover.removeAttribute(tourAttrs.arrow);
      popover.style.removeProperty("--sk-tour-arrow-offset");
    }
  };

  /* One placement per frame, however many scroll, resize and mutation events arrive in it. */
  const schedule = () => {
    if (frame || state.status !== "running") return;
    frame = win.requestAnimationFrame?.(place) ?? (win.setTimeout(place, 16) as unknown as number);
  };

  /* ---------------------------------------------------------------------------------------------- *
   * Showing a step
   * ---------------------------------------------------------------------------------------------- */

  let observers: (() => void)[] = [];
  const unobserve = () => {
    for (const stop of observers) stop();
    observers = [];
  };

  const observeTarget = (element: HTMLElement) => {
    unobserve();
    const Resize = (win as typeof globalThis).ResizeObserver;
    if (Resize) {
      const resize = new Resize(schedule);
      resize.observe(element);
      if (popover) resize.observe(popover);
      observers.push(() => resize.disconnect());
    }
    /* A target that is removed, hidden or moved by the page's own script. Mutations inside the tour's own
       parts are ignored: the controller writes the ring's style every frame, and observing its own writes
       would schedule a frame forever. */
    const Mutation = (win as typeof globalThis).MutationObserver;
    if (Mutation) {
      const mutation = new Mutation((records) => {
        if (records.some((record) => !root.contains(record.target))) schedule();
      });
      mutation.observe(doc.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["hidden", "class", "style", "open", "inert"],
      });
      observers.push(() => mutation.disconnect());
    }
  };

  /**
   * Show step `index`. `moveFocus` is true only when a tour control or `start()` asked for it: a step
   * changed because its target vanished must not pull focus out of whatever the reader is doing.
   */
  const show = (index: number, available: readonly boolean[], moveFocus: boolean) => {
    const step = steps[index];
    const element = step ? resolveTourTarget(doc, step.target) : null;
    if (!step || !isTourTargetShown(element)) return;

    const previousIndex = state.index;
    target = element;
    const { position, count } = tourProgress(index, available);
    const last = tourStep(index, 1, available) === null;
    const first = tourStep(index, -1, available) === null;

    if (progress) progress.textContent = formatTourProgress(config.progressLabel ?? progressDefault(), position, count);
    if (title) title.textContent = step.title;
    if (description) description.textContent = step.description;
    /* "Skip tour" on the first step only, Previous from the second on, and the pair keeps its place. */
    const skip = control("skip");
    if (skip) skip.hidden = !first;
    const back = control("previous");
    if (back) back.hidden = first;
    popover?.toggleAttribute(tourAttrs.last, last);
    popover?.setAttribute(tourAttrs.side, step.placement ?? "block-end");

    const wasShowing = state.status === "running" && previousIndex !== -1 && !popover?.hidden;
    setState({ index, step, position, count });
    if (state.status !== "running") setStatus("running");
    showLayer(ring);
    showLayer(popover);
    observeTarget(element);

    /* Scroll only when the target is not already in full view, once, and never smoothly for someone who
       asked for less motion. `block: center` leaves room for the box on either side. */
    const box = element.getBoundingClientRect();
    const inView = tourRectInView({ top: box.top, left: box.left, width: box.width, height: box.height }, viewport());
    if (!inView) {
      element.scrollIntoView?.({ block: "center", inline: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
    }

    stopMoving();
    if (wasShowing && index !== previousIndex && canAnimate(popover)) {
      if (inView) {
        ring?.setAttribute(tourAttrs.moving, "");
        popover.setAttribute(tourAttrs.moving, "");
        movingTimer = win.setTimeout(stopMoving, motionMs("--motion-expand-duration", 320) + 50);
      }
      const content = part("content");
      /* The text settles in once the box is most of the way there, on the same soft curve. */
      content?.animate?.(
        [
          { opacity: 0, translate: "0 2px" },
          { opacity: 1, translate: "0 0" },
        ],
        {
          duration: motionMs("--motion-expand-duration", 320),
          easing: SOFT_EASING,
          delay: inView ? 120 : 0,
          fill: "backwards",
        },
      );
    }
    place();

    /* The first step is announced by focus ENTERING the dialog (its name and description); a later one
       is not, because focus is already inside, so the live region says it, once. */
    announce(previousIndex === -1 ? "" : [progress?.textContent, step.title, step.description].filter(Boolean).join(". "));
    if (moveFocus) focusPrimary();

    if (index !== previousIndex) {
      config.onStepChange?.(index, step);
      emit(tourEvents.stepChange, { index, step });
    }
  };

  /*
   * FOCUS GOES TO CONTINUE, the action the step leads to: Enter or Space walks the whole tour without a
   * single Tab. On the first step, focus entering the dialog makes a screen reader say its name (the
   * title) and description (progress and body), so the step is heard with nothing added. On a later
   * step focus is already there and nothing is said by moving it, which is what `announce` is for.
   * Continue is never hidden: it reads Finish on the last step, so it is always there to take focus.
   */
  const focusPrimary = () => {
    control("next")?.focus({ preventScroll: true });
  };

  /* Cleared first, so saying the same text twice (two steps with one title) is still a change. */
  const announce = (message: string) => {
    if (!live) return;
    live.textContent = "";
    if (message) live.textContent = message;
  };

  const progressDefault = () => tourContract.options.progressLabel.default;

  /* ---------------------------------------------------------------------------------------------- *
   * Ending
   * ---------------------------------------------------------------------------------------------- */

  const end = (status: TourStatus, restoreFocus: boolean) => {
    if (state.status !== "running") return;
    /* Focus is brought home only from the tour's own ground: the box, the target, or nowhere. A reader who
       pressed Escape while typing somewhere else on the page keeps their place. */
    const active = doc.activeElement;
    const hadFocus =
      !active || active === doc.body || Boolean(popover?.contains(active)) || Boolean(target?.contains(active));
    unobserve();
    stopMoving();
    if (frame) win.cancelAnimationFrame?.(frame);
    frame = 0;
    hideLayer(popover);
    hideLayer(ring);
    announce("");
    target = null;
    setState({ index: -1, step: null, position: 0, count: 0 });
    setStatus(status);
    if (restoreFocus && hadFocus) returnFocusHome();
    returnFocus = null;
  };

  /* Back to what started the tour; if that is gone, to the consumer's fallback, then to a trigger for
     this tour, then to the body. Never to an element that is no longer on the page. */
  const returnFocusHome = () => {
    const candidates = [returnFocus, config.fallbackFocus?.() ?? null, ...tourTriggers(doc, tourId())];
    const home = candidates.find(canTakeFocus);
    if (home) home.focus({ preventScroll: true });
    else (doc.activeElement as HTMLElement | null)?.blur?.();
  };

  /* The current target left the page or was hidden: go on to the next step that has one, else back,
     else end. Focus follows only if it was in the box, so a reader typing elsewhere keeps their place. */
  const onTargetLost = () => {
    const available = availability();
    const hadFocus = Boolean(popover?.contains(doc.activeElement));
    const at = tourStep(state.index, 1, available) ?? tourStep(state.index, -1, available);
    if (at === null) {
      end("idle", true);
      return;
    }
    show(at, available, hadFocus);
  };

  /* ---------------------------------------------------------------------------------------------- *
   * Commands
   * ---------------------------------------------------------------------------------------------- */

  const begin = (options: TourStartOptions = {}) => {
    const available = availability();
    const requested = options.index;
    const index =
      requested !== undefined && available[requested] ? requested : tourFirstStep(available);
    /* Nothing to show: the tour does not open on an empty box, and says nothing it cannot back up. */
    if (index === null) return;
    const active = doc.activeElement as HTMLElement | null;
    returnFocus =
      options.returnFocus !== undefined ? options.returnFocus : active && active !== doc.body && !root.contains(active) ? active : null;
    show(index, available, true);
  };

  const controller: TourController = {
    start(options) {
      if (destroyed || state.status === "running") return;
      begin(options);
    },
    restart(options) {
      if (destroyed) return;
      /* A restart from the box's own flow keeps the original way home rather than pointing it at the box. */
      const keep = returnFocus;
      if (state.status === "running") end("idle", false);
      begin({ index: options?.index ?? 0, returnFocus: options?.returnFocus !== undefined ? options.returnFocus : (keep ?? undefined) });
    },
    close() {
      end("dismissed", true);
    },
    skip() {
      end("skipped", true);
    },
    next() {
      if (state.status !== "running") return;
      const available = availability();
      const at = tourStep(state.index, 1, available);
      if (at === null) end("completed", true);
      else show(at, available, true);
    },
    previous() {
      if (state.status !== "running") return;
      const available = availability();
      const at = tourStep(state.index, -1, available);
      if (at !== null) show(at, available, true);
    },
    goTo(index) {
      if (state.status !== "running") return;
      const available = availability();
      if (available[index]) show(index, available, true);
    },
    refresh() {
      schedule();
    },
    forget() {
      writeTourMemory(tourId(), null, win);
      setState({ remembered: null });
      if (state.status !== "running") setStatus("idle");
      else stampStatus("running");
      publishStatus(tourId(), state.status === "running" ? "idle" : state.status);
    },
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    configure(next) {
      config = { ...config, ...next };
      if (state.status === "running" && state.step) {
        const available = availability();
        const { position, count } = tourProgress(state.index, available);
        if (progress) progress.textContent = formatTourProgress(config.progressLabel ?? progressDefault(), position, count);
      }
    },
    destroy() {
      if (destroyed) return;
      end("idle", false);
      /* Nothing outlives the controller, not even a fade: whatever was on its way out is gone now. */
      for (const [element, exit] of exits) {
        exit.cancel();
        hideNow(element);
      }
      exits.clear();
      for (const off of detach) off();
      detach.length = 0;
      listeners.clear();
      controllers.delete(root);
      if (liveStatus.get(tourId()) !== undefined) publishStatus(tourId(), null);
      destroyed = true;
    },
  };

  /* ---------------------------------------------------------------------------------------------- *
   * Listeners
   * ---------------------------------------------------------------------------------------------- */

  const on = <K extends string>(target: EventTarget, type: K, handler: EventListener, options?: AddEventListenerOptions) => {
    target.addEventListener(type, handler, options);
    detach.push(() => target.removeEventListener(type, handler, options));
  };

  /* The box's own buttons. */
  on(root, "click", (event) => {
    const button = (event.target as Element | null)?.closest?.(`[${tourAttrs.action}]`);
    if (!button || !popover?.contains(button)) return;
    switch (button.getAttribute(tourAttrs.action) as TourAction) {
      case "close":
        controller.close();
        break;
      case "skip":
        controller.skip();
        break;
      case "previous":
        controller.previous();
        break;
      case "next":
        controller.next();
        break;
    }
  });

  /* Triggers anywhere on the page, delegated, so one rendered later still starts this tour. */
  on(doc, "click", (event) => {
    const trigger = (event.target as Element | null)?.closest?.<HTMLElement>(`[${tourAttrs.opens}]`);
    if (!trigger || trigger.getAttribute(tourAttrs.opens) !== tourId() || !tourId()) return;
    if ((trigger as HTMLButtonElement).disabled || trigger.getAttribute("aria-disabled") === "true") return;
    controller.restart({ returnFocus: trigger });
  });

  on(doc, "keydown", (event) => {
    const key = event as KeyboardEvent;
    if (state.status !== "running") return;
    if (key.key === "Escape") {
      if (escapeBelongsElsewhere(key)) return;
      key.preventDefault();
      controller.close();
      return;
    }
    if (key.key === "Tab" && !key.shiftKey && !key.altKey && !key.ctrlKey && !key.metaKey) bridgeToTarget(key);
  });

  /*
   * ESCAPE HAS AN OWNER, and it is not always the tour. A menu, a listbox, a combobox or a dialog that
   * is open is closer to the reader than a tour about the page, so the key is theirs: anything that
   * already handled it (`defaultPrevented`), an open modal dialog, an open light-dismiss popover that
   * is not ours, a control whose popup is expanded, and a text field with something in it (where
   * Escape clears). Only when none of those claims it does the tour close.
   */
  const escapeBelongsElsewhere = (event: KeyboardEvent): boolean => {
    if (event.defaultPrevented) return true;
    const matches = (selector: string) => {
      try {
        return Array.from(doc.querySelectorAll(selector)).some((element) => !root.contains(element));
      } catch {
        return false;
      }
    };
    if (matches("dialog:modal") || matches('[popover]:not([popover="manual"]):popover-open')) return true;
    const active = doc.activeElement as HTMLElement | null;
    if (!active || active === doc.body || popover?.contains(active)) return false;
    if (active.closest('[aria-expanded="true"]') || active.closest('[role="menu"], [role="listbox"], dialog[open]')) return true;
    const field = active as HTMLInputElement;
    const editable = active.isContentEditable || active.tagName === "TEXTAREA" || (active.tagName === "INPUT" && !/^(button|checkbox|radio|submit|reset|range|color|file)$/.test(field.type));
    return editable && Boolean(field.value ?? active.textContent);
  };

  /*
   * THE BRIDGE, and the only Tab the tour touches. Leaving the box forward with Tab lands on the target
   * (or the first thing inside it that takes focus), because that is what the step was about, and the
   * box's place in the DOM is wherever the tour was rendered, which is usually nowhere near the target.
   * Everything else is the page's own order: Shift+Tab, Tab from the target on, and a target with
   * nothing focusable, where Tab simply carries on.
   */
  const bridgeToTarget = (event: KeyboardEvent) => {
    if (!popover || !target) return;
    const inBox = tabbables(popover, { includeScope: true });
    if (inBox.length === 0 || doc.activeElement !== inBox[inBox.length - 1]) return;
    const destination = tabbables(target, { includeScope: true })[0];
    if (!destination) return;
    event.preventDefault();
    destination.focus();
  };

  const reflow = () => schedule();
  on(win, "scroll", reflow, { capture: true, passive: true });
  on(win, "resize", reflow, { passive: true });
  if (win.visualViewport) {
    on(win.visualViewport, "resize", reflow, { passive: true });
    on(win.visualViewport, "scroll", reflow, { passive: true });
  }

  controllers.set(root, controller);
  stampStatus(state.remembered ?? "idle");
  if (state.remembered) publishStatus(tourId(), state.remembered);
  return controller;
}
