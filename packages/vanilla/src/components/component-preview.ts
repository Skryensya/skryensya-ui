import { segmentedEvents } from "@skryensya/core/segmented";
import { tabsEvents } from "@skryensya/core/tabs";
import {
  componentPreviewAttrs,
  componentPreviewBindingChangeEvent,
  componentPreviewParts,
  componentPreviewScreenChangeEvent,
  type ComponentPreviewBinding,
  type ComponentPreviewScreen,
  type ComponentPreviewSource,
} from "@skryensya/core/component-preview";
import { codePreviewAttrs } from "@skryensya/core/code-preview";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const selector = (attribute: string): string => `[${attribute}]`;
const rootSelector = selector(componentPreviewAttrs.root);

type Cleanup = () => void;
type ValueChangeEvent = CustomEvent<{ value: string }>;

/** Shared Vanilla | React preference for every preview on the page. */
let sharedBinding: ComponentPreviewBinding | null = null;

/*
 * IntersectionObserver is the fast path, not a correctness dependency. A srcdoc stage starts
 * empty until this lifecycle promotes it, so losing an observer callback otherwise leaves a
 * visible preview behind its loading spinner forever. Keep one scroll/resize fallback for every
 * preview on the page; it also covers browsers that expose IntersectionObserver but throttle it
 * while restoring a background tab.
 */
const stageLifecycleRoots = new Set<HTMLElement>();
let stageLifecycleTimer: number | null = null;

function reconcileStageLifecycle(): void {
  for (const root of stageLifecycleRoots) {
    if (!root.isConnected) {
      stageLifecycleRoots.delete(root);
      continue;
    }
    if (stillNearView(root)) {
      restoreComponentPreviewStages(root);
    } else {
      releaseComponentPreviewStages(root);
    }
  }
}

function scheduleStageLifecycle(): void {
  if (stageLifecycleTimer !== null) return;
  stageLifecycleTimer = window.setTimeout(() => {
    stageLifecycleTimer = null;
    reconcileStageLifecycle();
  }, 0);
}

function startStageLifecycleFallback(): void {
  if (stageLifecycleRoots.size !== 1) return;
  window.addEventListener("scroll", scheduleStageLifecycle, { passive: true });
  window.addEventListener("resize", scheduleStageLifecycle);
}

function stopStageLifecycleFallback(): void {
  if (stageLifecycleRoots.size !== 0) return;
  window.removeEventListener("scroll", scheduleStageLifecycle);
  window.removeEventListener("resize", scheduleStageLifecycle);
  if (stageLifecycleTimer !== null) {
    window.clearTimeout(stageLifecycleTimer);
    stageLifecycleTimer = null;
  }
}

/** A preview is active within one viewport of the reader. */
function stillNearView(root: HTMLElement): boolean {
  if (!root.isConnected) return false;
  const box = root.getBoundingClientRect();
  const margin = window.innerHeight;
  return box.bottom >= -margin && box.top <= window.innerHeight + margin;
}

/** Test helper: drop the in-memory preference between cases. */
export function resetSharedComponentPreviewBinding(): void {
  sharedBinding = null;
}

function isBinding(value: string | null | undefined): value is ComponentPreviewBinding {
  return value === "vanilla" || value === "react";
}

function readDocumentBinding(): ComponentPreviewBinding | null {
  const value = document.documentElement.getAttribute(componentPreviewAttrs.documentBinding);
  return isBinding(value) ? value : null;
}

function writeDocumentBinding(binding: ComponentPreviewBinding): void {
  document.documentElement.setAttribute(componentPreviewAttrs.documentBinding, binding);
}

function publishBinding(binding: ComponentPreviewBinding): void {
  if (sharedBinding === binding) {
    writeDocumentBinding(binding);
    return;
  }
  sharedBinding = binding;
  writeDocumentBinding(binding);
  document.dispatchEvent(
    new CustomEvent(componentPreviewBindingChangeEvent, { detail: { value: binding } }),
  );
}

/**
 * Move a Segmented widget to `value` from the OUTSIDE: another preview's own change, or the
 * document preference this preview just adopted. Segmented owns its own state (aria-checked, the
 * sliding indicator, roving tabindex) and exposes no external setter, so the one lever this module
 * has is the same one a reader has. Clicking the matching option, which lets Segmented's own
 * `connectSegmented` do the actual painting instead of a second implementation of it here.
 *
 * A no-op when already correct: without this guard, syncing the instance that INITIATED the
 * change would re-click its own already-current option, which is at best redundant and at worst a
 * second `segmentedEvents.valueChange` in the middle of handling the first.
 */
function selectSegmentedOption(tabs: HTMLElement | null, optionAttr: string, value: string): void {
  if (!tabs || tabs.getAttribute("data-value") === value) return;
  tabs.querySelector<HTMLElement>(`${selector(optionAttr)}[data-value="${value}"]`)?.click();
}

/**
 * Every stage in this preview.
 *
 * Both bindings render an iframe stage now, and the height controls (the resizer, the screen
 * presets, the reload button) are ONE control each in the header, above both. So they act on all
 * of them: a reader who drags the grip and then flips to React must not find the height they just
 * chose reverted, and the hidden stage has to already be the right size when it appears rather
 * than resizing in front of them.
 */
function stagesOf(root: HTMLElement): HTMLElement[] {
  /*
   * Not `:scope >`: the React stage is nested under its slot host and Astro's island wrapper, both
   * of which are `display: contents` so the iframe is still a grid item of this preview. A nested
   * preview (the ComponentPreview page documents itself) lives in another DOCUMENT, so a plain
   * descendant query cannot reach into one and never over-matches.
   */
  return [...root.querySelectorAll<HTMLElement>(`.${componentPreviewParts.stage}`)];
}

/*
 * A stage's `srcdoc` IS its browsing context: clearing it drops the nested realm (React's own
 * second copy of React included, see `react-demos/framed.tsx`) and the browser reclaims it,
 * while the `<iframe>` element itself, its size, its classes, its part attributes, stays exactly
 * where it was. Caching the string here rather than re-reading it off the element later is what
 * makes a released stage's `srcdoc` attribute a reliable "is this live" check on its own: empty
 * means released or never loaded, non-empty means live.
 */
const stageSrcdocCache = new WeakMap<HTMLIFrameElement, string>();

/** Drops one stage's realm. A no-op on a stage that is already released or never had content. */
function releaseStage(frame: HTMLIFrameElement): void {
  const srcdoc = frame.getAttribute("srcdoc") ?? frame.srcdoc;
  if (!srcdoc) return;
  stageSrcdocCache.set(frame, srcdoc);

  frame.removeAttribute(componentPreviewAttrs.frameReady);
  frame.removeAttribute(componentPreviewAttrs.frameError);
  frame.setAttribute("aria-busy", "true");
  // A height the reader chose survives the reboot; an auto-fitted one is re-measured.
  if (!frame.hasAttribute(componentPreviewAttrs.resized)) frame.style.removeProperty("height");

  frame.srcdoc = "";
}

/*
 * A STAGE BEHIND A TAB NOBODY PICKED MUST NOT BOOT, and `hidden` alone does not achieve that.
 *
 * `hidden` stops an element RENDERING; it does not stop an `<iframe>` inside it LOADING. Both
 * bindings render a stage, exactly one of them is visible, and until this check existed the
 * invisible one booted a whole second realm anyway - for React that is its own copy of React plus
 * `render-tree`'s 82 component modules, per preview, per page. See `framed.tsx` for the numbers.
 *
 * `closest`, not a binding comparison: what decides whether a stage is wanted is whether the panel
 * it sits in is on screen, which is the same question for both bindings and stays true if a third
 * ever appears.
 */
function stageIsBehindAHiddenPanel(frame: HTMLIFrameElement): boolean {
  return frame.closest("[hidden]") !== null;
}

/**
 * Remounts one stage from its cached document, or, the first time it becomes visible, from
 * {@link componentPreviewAttrs.doc}. Neither binding sets `srcdoc` directly in its markup:
 * `loading="lazy"` does nothing for inline `srcdoc` content, so authoring it eagerly defeats the
 * whole point of this observer. A no-op on a stage already live, hidden, or with no document to
 * mount.
 *
 * A binding that the reader did not choose remains an empty iframe. React otherwise brings its own
 * realm and component modules for every preview, multiplying page memory before anyone asks for it.
 */
function restoreStage(frame: HTMLIFrameElement): void {
  if (frame.srcdoc || stageIsBehindAHiddenPanel(frame)) return;
  const cached = stageSrcdocCache.get(frame);
  if (cached !== undefined) {
    frame.srcdoc = cached;
    return;
  }
  const doc = frame.getAttribute(componentPreviewAttrs.doc);
  if (doc) frame.srcdoc = doc;
}

/**
 * Releases every stage under `root`, Vanilla's own iframe and the React binding's nested one
 * alike (`stagesOf` already reaches both, see its own comment above). Skips a stage that
 * currently holds focus: `document.activeElement === frame` is how cross-document focus shows up
 * on the PARENT side, and yanking `srcdoc` out from under a reader who tabbed into a stage's
 * interactive content would drop that focus into the void.
 */
export function releaseComponentPreviewStages(root: HTMLElement): void {
  for (const stage of stagesOf(root)) {
    if (stage.tagName !== "IFRAME") continue;
    const frame = stage as HTMLIFrameElement;
    if (document.activeElement === frame) continue;
    releaseStage(frame);
  }
}

/** Restores every stage under `root` that a reader could actually see. */
export function restoreComponentPreviewStages(root: HTMLElement): void {
  for (const stage of stagesOf(root)) {
    if (stage.tagName !== "IFRAME") continue;
    restoreStage(stage as HTMLIFrameElement);
  }
}


/**
 * Re-boot the srcdoc stages so count-ups, loaders and mount side-effects run again. The reader-
 * facing reload button's own case of the same release/restore pair `connectStageLifecycle` below
 * runs off the scroll observer: release, then restore on the very next frame instead of whenever
 * the stage scrolls back near view.
 */
export function reloadComponentPreviewStage(root: HTMLElement): void {
  for (const stage of stagesOf(root)) {
    if (stage.tagName !== "IFRAME") continue;
    const frame = stage as HTMLIFrameElement;
    releaseStage(frame);
    requestAnimationFrame(() => restoreStage(frame));
  }
}

/** Shared screen preset for every preview on the page, exactly like `sharedBinding` above. */
let sharedScreen: ComponentPreviewScreen | null = null;

/** Test helper: drop the in-memory preference between cases. */
export function resetSharedComponentPreviewScreen(): void {
  sharedScreen = null;
}

function isScreen(value: string | null | undefined): value is ComponentPreviewScreen {
  return value === "free" || value === "xl" || value === "tablet" || value === "mobile";
}

const forcedMobileScreenQuery = "(max-width: 52rem)";

function readDocumentScreen(): ComponentPreviewScreen | null {
  const value = document.documentElement.getAttribute(componentPreviewAttrs.documentScreen);
  return isScreen(value) ? value : null;
}

/** `free` is the absence of the attribute here too, so the document element stays clean by default. */
function writeDocumentScreen(screen: ComponentPreviewScreen): void {
  if (screen === "free") document.documentElement.removeAttribute(componentPreviewAttrs.documentScreen);
  else document.documentElement.setAttribute(componentPreviewAttrs.documentScreen, screen);
}

/*
 * ALWAYS DISPATCHES, even when the value has not moved. This used to return early on a repeat,
 * which was free when every click published: the shared value and what the previews showed could
 * not drift apart. Now a plain click changes one stage without publishing, so they can, and a
 * repeat is exactly how a reader asks for the page to be put back in step ("everything to Tablet",
 * after having nudged two of them by hand). Skipping it would make the broadcast a no-op precisely
 * when it is most wanted. Nothing loops on it: the listeners below apply the value and never
 * publish.
 */
function publishScreen(screen: ComponentPreviewScreen): void {
  sharedScreen = screen;
  writeDocumentScreen(screen);
  document.dispatchEvent(
    new CustomEvent(componentPreviewScreenChangeEvent, { detail: { value: screen } }),
  );
}

/**
 * Screen presets for the stage: a real Segmented (Libre | XL | Tablet | Móvil), the site's global
 * enhancer already knows how to run. This module only reacts to the `segmentedEvents.valueChange` it
 * dispatches on itself, the same way `sourceTabs` below reacts to Tabs' own event, rather than
 * re-implementing Segmented's click handling, aria-checked painting or sliding indicator.
 *
 * Tablet, mobile and XL only change the stage's width. They preserve an auto-fitted or reader-chosen
 * height exactly like free desktop, so screen selection never competes with the resizer. XL is a
 * 1440 px viewport shown zoomed out so that width still fits the docs column.
 *
 * `free` is the ABSENCE of the attribute rather than a value: every rule that fits, reserves or
 * scrolls then keeps working untouched, and the frame runtime needs no extra case.
 *
 * The preference is per DOCUMENT, not per preview, and every mounted preview applies it; so a
 * preview with no toggle of its own (or one mounted later) still follows the page. XL is the
 * exception: only a card that offers the option applies it. Everyone else stays on free, and the
 * shared pref is left alone so a later Navbar or Layout Grid can still pick it up.
 *
 * Under the docs mobile breakpoint the chooser itself is hidden: there is no useful room for
 * desktop/tablet/mobile chrome, and the only honest preview is the mobile one. This forced state is
 * viewport-owned, not a preference: it does not write the document attribute, and leaving mobile
 * restores the reader's previous shared/local selection.
 */
function connectScreenTabs(root: HTMLElement): Cleanup {
  const tabs = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.screenTabs));
  if (!stagesOf(root).length) return () => {};

  /** This preview owns its preset outright: never reads or writes the shared/persisted one. */
  const localScreen = root.hasAttribute(componentPreviewAttrs.screenLocal);

  /*
   * A CLICK IS ABOUT THIS PREVIEW. SHIFT IS ABOUT THE PAGE. Changing the preset is usually a
   * question asked of ONE demo, "does this table survive a phone", and answering it by moving every
   * other preview on the page throws away wherever the reader had left them. So a plain click stays
   * here: it moves this stage and nothing else, and it does not touch the persisted preference.
   *
   * Shift is the deliberate broadcast. It publishes, so every preview follows and the choice is
   * saved the way the Vanilla | React preference is: it is the gesture for "the whole page, and the
   * next page too", and it costs a modifier because it is the one that overwrites other people's
   * boxes.
   *
   * A broadcast reaches previews the reader had already moved by hand. That is the point of asking
   * for it: shift is how you put the page back in step, so a plain click cannot opt a preview out of
   * one.
   *
   * `localScreen` is a different thing and stays absolute: it is an authoring decision (Vaul's demo
   * only reads at phone width), so it neither reads the shared preset at mount nor follows a
   * broadcast, with or without the modifier.
   */

  /*
   * A BROADCAST IS DRIVEN BY THE CLICK, NOT BY SEGMENTED'S VALUE CHANGE, and the difference is not
   * academic: Segmented reports a CHANGE, so pressing the option a preview is already showing emits
   * nothing at all. That is precisely the case shift exists for. Half the previews were nudged by
   * hand, the reader wants the page back on Tablet, and the preview under the pointer happens to be
   * the one still on Tablet. Hanging the broadcast off `valueChange` made that click a no-op.
   *
   * So the capture-phase click reads the option's own `data-value` and publishes it outright. It
   * runs before Segmented has turned the press into anything, and `shiftHeld` (set from the same
   * interaction, since a CustomEvent carries no modifier state) is what stops the value change that
   * MAY follow from publishing the same thing twice.
   */
  let shiftHeld = false;
  const rememberModifier = (event: Event) => {
    shiftHeld = Boolean((event as MouseEvent | KeyboardEvent).shiftKey);
  };
  const onShiftActivate = (event: Event) => {
    if (localScreen) return;
    if (!(event as MouseEvent).shiftKey) return;
    const target = event.target as HTMLElement | null;
    const option = target?.closest?.(selector(componentPreviewAttrs.screenOption));
    const value = option?.getAttribute("data-value");
    if (!isScreen(value)) return;
    currentUnforcedScreen = value;
    if (!viewport?.matches) publishScreen(value);
    applyEffectiveScreen(value);
  };
  tabs?.addEventListener("pointerdown", rememberModifier, true);
  tabs?.addEventListener("keydown", rememberModifier, true);
  tabs?.addEventListener("click", onShiftActivate, true);

  const offersXl = Boolean(
    tabs?.querySelector(`${selector(componentPreviewAttrs.screenOption)}[data-value="xl"]`),
  );

  /*
   * `xl` falls back to `free` on a preview that does not offer it - a shared preference reaching a
   * card whose own toggle has no such option.
   *
   * It used to fall back on a second condition too: `data-sk-fullscreen-preview`, which the
   * fullscreen shell put on `<html>` because that page WAS the viewport `xl` pretends to be. That
   * route is gone, so nothing sets the attribute and the test could only ever be false.
   */
  const resolveLocal = (screen: ComponentPreviewScreen): ComponentPreviewScreen => {
    if (screen === "xl" && !offersXl) return "free";
    return screen;
  };

  const syncXlZoom = () => {
    const target =
      Number.parseFloat(getComputedStyle(root).getPropertyValue("--sk-component-preview-screen-xl")) ||
      1440;
    const zoom = Math.min(1, root.clientWidth / target);
    root.style.setProperty("--sk-component-preview-xl-zoom", String(zoom));
  };

  const applyScreen = (screen: ComponentPreviewScreen) => {
    const next = resolveLocal(screen);
    // Re-queried per call: the React stage is an island, so it can arrive after this mount ran.
    for (const stage of stagesOf(root)) {
      if (next === "free") {
        stage.removeAttribute(componentPreviewAttrs.screen);
        continue;
      }
      stage.setAttribute(componentPreviewAttrs.screen, next);
    }
    if (next === "xl") syncXlZoom();
    else root.style.removeProperty("--sk-component-preview-xl-zoom");
  };

  const viewport =
    typeof window.matchMedia === "function" ? window.matchMedia(forcedMobileScreenQuery) : null;
  const effectiveScreen = (screen: ComponentPreviewScreen): ComponentPreviewScreen =>
    viewport?.matches ? "mobile" : screen;

  const applyEffectiveScreen = (screen: ComponentPreviewScreen) => {
    applyScreen(effectiveScreen(screen));
  };

  let currentUnforcedScreen: ComponentPreviewScreen = "free";

  const onValueChange = (event: Event) => {
    const value = (event as ValueChangeEvent).detail?.value;
    const withShift = shiftHeld;
    shiftHeld = false;
    if (!isScreen(value)) return;
    currentUnforcedScreen = value;
    if (localScreen) {
      applyEffectiveScreen(value);
      return;
    }
    /* Shift already published and applied from the click above; a plain click keeps to itself. */
    if (withShift) return;
    applyEffectiveScreen(value);
  };

  const onSharedScreen = (event: Event) => {
    const value = (event as ValueChangeEvent).detail?.value;
    if (!isScreen(value)) return;
    currentUnforcedScreen = value;
    applyEffectiveScreen(value);
    if (!viewport?.matches) {
      selectSegmentedOption(tabs, componentPreviewAttrs.screenOption, resolveLocal(value));
    }
  };

  tabs?.addEventListener(segmentedEvents.valueChange, onValueChange);
  if (!localScreen) document.addEventListener(componentPreviewScreenChangeEvent, onSharedScreen);
  const onViewportChange = () => {
    applyEffectiveScreen(currentUnforcedScreen);
    if (!viewport?.matches) {
      selectSegmentedOption(tabs, componentPreviewAttrs.screenOption, resolveLocal(currentUnforcedScreen));
    }
  };
  viewport?.addEventListener("change", onViewportChange);

  const fromTabs = tabs?.getAttribute("data-value");
  const rawInitial = localScreen
    ? isScreen(fromTabs)
      ? fromTabs
      : "free"
    : (readDocumentScreen() ?? sharedScreen ?? (isScreen(fromTabs) ? fromTabs : "free"));
  /* Same fullscreen guard as `resolveLocal` carried, and gone for the same reason. */
  const initial = rawInitial;
  currentUnforcedScreen = initial;
  if (!localScreen) {
    sharedScreen = initial;
    writeDocumentScreen(initial);
  }
  applyEffectiveScreen(initial);
  // Segmented reads this SAME attribute as ITS OWN initial value once it mounts; a plain write is
  // enough here, no click needed, because nothing has rendered a selection to correct yet.
  tabs?.setAttribute("data-value", resolveLocal(effectiveScreen(initial)));

  const resizeObserver =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncXlZoom) : null;
  resizeObserver?.observe(root);

  return () => {
    resizeObserver?.disconnect();
    viewport?.removeEventListener("change", onViewportChange);
    tabs?.removeEventListener("pointerdown", rememberModifier, true);
    tabs?.removeEventListener("keydown", rememberModifier, true);
    tabs?.removeEventListener("click", onShiftActivate, true);
    tabs?.removeEventListener(segmentedEvents.valueChange, onValueChange);
    if (!localScreen) document.removeEventListener(componentPreviewScreenChangeEvent, onSharedScreen);
  };
}

/** Floor for a dragged stage: below this the demo is a sliver and the grip is unreachable. */
const stageMinHeight = 64;
/** Keyboard steps, in CSS pixels. */
const stageKeyStep = 16;
const stageKeyStepLarge = 64;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Textarea-style height control for the stage.
 *
 * The reader owns the height from the first drag on: `resized` tells the frame runtime to stop
 * auto-fitting and to scroll its own document instead, so shrinking never clips the demo away.
 * Double click (or Home) hands the height back to the content.
 */
function connectStageResizer(root: HTMLElement): Cleanup {
  const resizer = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.resizer));
  if (!stagesOf(root).length || !resizer) return () => {};

  /*
   * The one the reader is actually looking at. The drag reads its height to know where it started,
   * and writes the result to every stage; measuring a HIDDEN stage would read 0 and snap the demo
   * to the floor on the first pointer move.
   */
  const visibleStage = (): HTMLElement | null =>
    stagesOf(root).find((stage) => stage.offsetParent !== null || stage.getClientRects().length) ??
    stagesOf(root)[0] ??
    null;

  const maxHeight = () =>
    Math.max(stageMinHeight, Math.round((window.innerHeight || 0) * 0.9) || stageMinHeight);

  /** XL applies CSS `zoom`; getBoundingClientRect is visual, `style.height` is layout. */
  const stageZoom = (stage: HTMLElement): number => {
    const fromZoom = Number.parseFloat(getComputedStyle(stage).zoom);
    if (Number.isFinite(fromZoom) && fromZoom > 0) return fromZoom;
    const fromVar = Number.parseFloat(
      getComputedStyle(root).getPropertyValue("--sk-component-preview-xl-zoom"),
    );
    return Number.isFinite(fromVar) && fromVar > 0 ? fromVar : 1;
  };

  const layoutHeightOf = (stage: HTMLElement | null): number => {
    if (!stage) return stageMinHeight;
    return stage.getBoundingClientRect().height / stageZoom(stage);
  };

  const setHeight = (height: number) => {
    const next = Math.round(clamp(height, stageMinHeight, maxHeight()));
    for (const stage of stagesOf(root)) {
      stage.style.height = `${next}px`;
      stage.setAttribute(componentPreviewAttrs.resized, "");
    }
    resizer.setAttribute("aria-valuenow", String(next));
    resizer.setAttribute("aria-valuemin", String(stageMinHeight));
    resizer.setAttribute("aria-valuemax", String(maxHeight()));
    resizer.setAttribute("aria-valuetext", `${next} px`);
  };

  const resetHeight = () => {
    for (const stage of stagesOf(root)) {
      stage.style.removeProperty("height");
      stage.removeAttribute(componentPreviewAttrs.resized);
    }
    for (const name of ["aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext"]) {
      resizer.removeAttribute(name);
    }
  };

  const nudge = (delta: number) => setHeight(layoutHeightOf(visibleStage()) + delta);


  let dragPointer: number | null = null;
  let startY = 0;
  let startHeight = 0;
  let startZoom = 1;

  const endDrag = () => {
    if (dragPointer === null) return;
    // Capture is a nicety (and absent in jsdom); losing it must not strand the drag state.
    try {
      if (resizer.hasPointerCapture(dragPointer)) resizer.releasePointerCapture(dragPointer);
    } catch {
      /* ignore */
    }
    dragPointer = null;
    root.removeAttribute(componentPreviewAttrs.resizing);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (dragPointer !== null || (event.button !== 0 && event.pointerType === "mouse")) return;
    dragPointer = event.pointerId;
    startY = event.clientY;
    const stage = visibleStage();
    startHeight = layoutHeightOf(stage);
    startZoom = stage ? stageZoom(stage) : 1;
    try {
      resizer.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    root.setAttribute(componentPreviewAttrs.resizing, "");
    // Otherwise the drag selects the surrounding prose.
    event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== dragPointer) return;
    setHeight(startHeight + (event.clientY - startY) / startZoom);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== dragPointer) return;
    endDrag();
  };

  const onDoubleClick = () => resetHeight();

  const onKeyDown = (event: KeyboardEvent) => {
    const steps: Record<string, number> = {
      ArrowDown: stageKeyStep,
      ArrowUp: -stageKeyStep,
      PageDown: stageKeyStepLarge,
      PageUp: -stageKeyStepLarge,
    };
    const step = steps[event.key];
    if (step !== undefined) {
      nudge(step);
      event.preventDefault();
      return;
    }
    if (event.key === "Home" || event.key === "Escape") {
      resetHeight();
      event.preventDefault();
    }
  };

  resizer.addEventListener("pointerdown", onPointerDown);
  resizer.addEventListener("pointermove", onPointerMove);
  resizer.addEventListener("pointerup", onPointerUp);
  resizer.addEventListener("pointercancel", onPointerUp);
  resizer.addEventListener("dblclick", onDoubleClick);
  resizer.addEventListener("keydown", onKeyDown);

  return () => {
    endDrag();
    resizer.removeEventListener("pointerdown", onPointerDown);
    resizer.removeEventListener("pointermove", onPointerMove);
    resizer.removeEventListener("pointerup", onPointerUp);
    resizer.removeEventListener("pointercancel", onPointerUp);
    resizer.removeEventListener("dblclick", onDoubleClick);
    resizer.removeEventListener("keydown", onKeyDown);
  };
}

/**
 * Opens this preview alone, at its own SHORT, readable URL: `/f/{docs page}/{n}`, where `n` is this
 * card's 1-based index among `[data-sk-component-preview]` on the current page. `/f/…`
 * re-fetches that same page (it is static, already built; see ADR on `output: "static"`) and pulls
 * the Nth card back out of the FRESH markup itself, rather than this module serializing the
 * card's current DOM into the link: a page path and a number stay short regardless of how large the
 * demo is, where shipping the rendered markup (plus its stylesheets and scripts) does not.
 *
 * A plain synchronous `window.open`, no pre-opened blank tab to navigate later: there is no async
 * step here (no compression, no `fetch`) standing between the click and the URL, so the direct call
 * already satisfies every browser's "was this a user gesture" check for a new tab.
 */
/** What the two apps agree on. Neither imports the other, so these strings ARE the interface. */
export const playgroundReadyMessage = "sk-playground-ready";
export const playgroundHandoffMessage = "sk-playground-handoff";

/**
 * Hands this demo's source to the Playground, in the one way that survives the two apps being on
 * different origins.
 *
 * WHY NOT `sessionStorage`, which is what the Playground originally read. Storage is partitioned per
 * ORIGIN, and since the apps split they only share one when both sit behind a single host. Under
 * `pnpm dev` they are two ports, and a write here was simply unreadable there - the handoff worked in
 * production and silently did nothing in development, which is the worst of the two orders to have it.
 *
 * WHY NOT THE URL. Measured over the 182 canonical trees: median 1.2 KB, mean 1.9 KB, and
 * `comment-thread/thread` at 18 KB. A fragment would carry it, but "open in the playground" would
 * produce a URL nobody can read, share or paste, for the sake of a transfer that is over in one hop.
 *
 * SO: `postMessage`, which is the mechanism that exists for exactly this. No size limit, explicit
 * about the origin it will talk to, and it leaves the address bar clean. The cost is a handshake -
 * the new tab has to tell us it is listening, because there is no way to know when a document in
 * another origin has booted.
 *
 * Returns `false` when it could not take over the navigation (a popup blocker, no payload), so the
 * caller can let the plain link through instead of swallowing the click.
 */
/**
 * The payload plus where it came from: this page, as the reader has it (a `?tab=` included), with
 * the fragment pointed at this preview. The Playground's "See the docs" follows it back. Added here
 * rather than at build time because only the browser knows the origin the page is being read on.
 */
function withDocsAddress(payload: string, root: HTMLElement): string {
  try {
    const docs = new URL(location.href);
    docs.hash = root.id;
    return encodeURIComponent(JSON.stringify({ ...JSON.parse(decodeURIComponent(payload)), docs: docs.href }));
  } catch {
    return payload;
  }
}

export function openInPlayground(root: HTMLElement, url: string): boolean {
  const payload = root.getAttribute(componentPreviewAttrs.playground);
  if (!payload) return false;

  /* Synchronous, in the click's own turn: anything async first and the browser treats the open as
   * unsolicited. */
  const target = window.open(url, "_blank");
  if (!target) return false;

  const origin = new URL(url, location.href).origin;

  const onReady = (event: MessageEvent) => {
    /*
     * BOTH CHECKS MATTER. `event.source` proves the message came from the tab we just opened rather
     * than from any other frame that happens to know the string; `origin` is what we will only ever
     * send TO, so the payload cannot land anywhere else even if something else answered first.
     */
    if (event.source !== target) return;
    if ((event.data as { type?: unknown } | null)?.type !== playgroundReadyMessage) return;

    target.postMessage({ type: playgroundHandoffMessage, payload: withDocsAddress(payload, root) }, origin);
    window.removeEventListener("message", onReady);
  };

  window.addEventListener("message", onReady);

  /*
   * The listener is dropped after one minute whether or not the tab ever answered. A Playground that
   * failed to load, or that the reader closed on the way, would otherwise leave this page listening
   * for a handshake that is never coming.
   */
  window.setTimeout(() => window.removeEventListener("message", onReady), 60_000);

  return true;
}

/**
 * One shared "Ver código"/"Ocultar código" STATE for the whole preview, not one per binding: a
 * demo's Vanilla source-tabs group (HTML/CSS/TS) and its React one (Componente/data) are two
 * separate `sk-tabs` groups  -  the live stage each sits inside needs its own iframe/island either
 * way  -  but they show the SAME underlying disclosure question ("is this demo's source open right
 * now"), so a reader who expands it on Vanilla and then flips to React must find React's source
 * already open too, not reset to collapsed because it happens to be a different DOM subtree.
 *
 * Physically merging the two `sk-tabs` groups into one was the other way to get there, but the
 * source tabs live INSIDE each binding's own panel alongside that binding's own stage  -  hoisting
 * them out would mean restructuring the iframe/island layout this file and `component-preview.css`
 * already tune carefully for. Keeping two groups and synchronising their STATE, instead, reaches
 * the same reader-facing result (one shared yes/no, never two) for a fraction of the risk.
 *
 * `root` may hold ZERO source-tabs groups with anything to collapse (a short demo): every button
 * still exists in that case (CSS hides it, see `component-preview.css`'s own `:has()` rule), so
 * this connects unconditionally and is simply inert when `panelToggles()` comes back empty.
 */
function connectSourceToggles(root: HTMLElement): Cleanup {
  /*
   * ONE representative toggle per BINDING (Vanilla, React), not per tabs group: a demo whose
   * React side is a single file (no `reactData`, so no tabs at all) still has to agree with a
   * tabbed Vanilla side, and vice versa. Each binding contributes whichever toggle it actually
   * has  -  the shared bar's own, a direct child of `sourceTabs`, when there are file tabs; the
   * lone panel's own otherwise (`.sk-component-preview__code` with no tabs wrapper around it)  - 
   * or none at all, for a binding short enough that nothing there collapses.
   *
   * `:scope > .sk-code-preview__more` for the grouped case, not a marker attribute: the shared
   * bar is plain `@skryensya/core/code-preview` markup (see `ComponentPreview.astro`'s own
   * comment on why), and its ONLY distinguishing mark is sitting directly under `sourceTabs`
   * itself. A per-file toggle's own `.sk-code-preview__more` is always nested several levels
   * deeper, under `.sk-tabs__content`, so this can never reach one of those by accident.
   */
  const bindingPanels = [...root.querySelectorAll<HTMLElement>(`.${componentPreviewParts.binding}`)];
  const toggleOf = (panel: HTMLElement): HTMLButtonElement | null =>
    panel.querySelector<HTMLButtonElement>(
      `:scope > .${componentPreviewParts.sourceTabs} > .sk-code-preview__more ${selector(codePreviewAttrs.toggle)}, ` +
        `:scope > .${componentPreviewParts.code} ${selector(codePreviewAttrs.toggle)}`,
    );
  const toggles = bindingPanels.map(toggleOf).filter((el): el is HTMLButtonElement => el !== null);
  if (toggles.length === 0) return () => {};

  // Same two places `code-preview.ts`'s own `connectCodePreview` reads them from: each button's
  // OWN rendered label text (SSR's the collapsed wording already) and its `expandedLabel`
  // attribute. Read ONCE per button, before any click has a chance to overwrite the label's own
  // text with the opposite wording.
  const labelsOf = new Map<HTMLButtonElement, { expand: string; collapse: string }>(
    toggles.map((toggle) => {
      const label = toggle.querySelector<HTMLElement>(selector(codePreviewAttrs.toggleLabel));
      return [
        toggle,
        { expand: label?.textContent ?? "", collapse: toggle.getAttribute(codePreviewAttrs.expandedLabel) ?? "" },
      ];
    }),
  );

  /* Every collapsible file's own toggle across the WHOLE preview, both bindings, not just
     whichever is currently visible: a hidden React tab still has to flip together with the
     active Vanilla one, so switching bindings (or files within one) later shows it already in
     the state this button last set, never the SSR default it happened to start from. */
  const panelToggles = (): HTMLButtonElement[] =>
    [
      ...root.querySelectorAll<HTMLElement>(
        `${selector(codePreviewAttrs.collapsible)}, ${selector(codePreviewAttrs.condensedCollapsible)}`,
      ),
    ]
      .map((panel) => panel.querySelector<HTMLButtonElement>(selector(codePreviewAttrs.toggle)))
      .filter((el): el is HTMLButtonElement => el !== null);

  const syncFromPanels = () => {
    const [first] = panelToggles();
    const expanded = first?.getAttribute("aria-expanded") === "true";
    for (const toggle of toggles) {
      toggle.setAttribute("aria-expanded", String(expanded));
      const label = toggle.querySelector<HTMLElement>(selector(codePreviewAttrs.toggleLabel));
      const wording = labelsOf.get(toggle);
      if (label && wording) label.textContent = expanded ? wording.collapse : wording.expand;
    }
  };

  /*
   * A binding with no file tabs has nothing to stand in front of: its representative toggle is
   * also its real panel toggle. Do not forward a click back to that same element, and suppress the
   * handler while a synthetic click reaches the other representative.
   */
  let forwarding = false;
  const makeOnClick = (clicked: HTMLButtonElement) => () => {
    if (forwarding) return;
    forwarding = true;
    try {
      for (const panelToggle of panelToggles()) {
        if (panelToggle !== clicked) panelToggle.click();
      }
    } finally {
      forwarding = false;
    }
    syncFromPanels();
  };

  const cleanups = toggles.map((toggle) => {
    const onClick = makeOnClick(toggle);
    toggle.addEventListener("click", onClick);
    return () => toggle.removeEventListener("click", onClick);
  });
  syncFromPanels();

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

/*
 * ONE observer for the whole page, exactly like `sharedBinding`/`sharedScreen` above are one
 * preference for the whole page rather than one per preview: a page with a dozen previews gets a
 * dozen `.observe()` calls against a single instance instead of a dozen redundant instances doing
 * the same job. Built lazily, once, on the first preview that mounts.
 *
 * `IntersectionObserver` itself is guarded the same way `connectStageResizer` above already
 * guards `ResizeObserver`: absent (an old browser, or jsdom in tests) means every preview simply
 * stays live for the page's whole life, today's behaviour, not a broken one.
 */
let sharedStageObserver: IntersectionObserver | null = null;

function stageObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!sharedStageObserver) {
    sharedStageObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const previewRoot = entry.target as HTMLElement;
          /*
           * The browser may report a stale intersection while a layout shift moves a preview under
           * the reader. Re-read the current box before releasing its realm: an empty `srcdoc`
           * behind the visible loader has no recovery until another observer delivery arrives.
           */
          if (stillNearView(previewRoot)) {
            restoreComponentPreviewStages(previewRoot);
          } else releaseComponentPreviewStages(previewRoot);
        }
      },
      { rootMargin: "100% 0px" },
    );
  }
  return sharedStageObserver;
}

function connectStageLifecycle(root: HTMLElement): Cleanup {
  const observer = stageObserver();
  if (observer && stagesOf(root).length) observer.observe(root);
  stageLifecycleRoots.add(root);
  startStageLifecycleFallback();
  scheduleStageLifecycle();

  /*
   * A preview can start behind the component page's own tabs. IntersectionObserver does not fire
   * when that ancestor merely loses `hidden`, so watch the panel state and promote the stage when
   * the reader opens it.
   */
  const panel = root.closest<HTMLElement>('[role="tabpanel"]');
  const panelObserver = panel
    ? new MutationObserver(scheduleStageLifecycle)
    : null;
  panelObserver?.observe(panel, { attributes: true, attributeFilter: ["hidden"] });

  return () => {
    observer?.unobserve(root);
    panelObserver?.disconnect();
    stageLifecycleRoots.delete(root);
    stopStageLifecycleFallback();
  };
}

export function connectComponentPreview(root: HTMLElement): Cleanup {
  const bindingTabs = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.bindingTabs));
  const sourceTabs = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.sourceTabs));
  const reload = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.reload));
  const playground = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.playgroundOpen));
  /*
   * A PREVIEW THAT ONLY HAS ONE BINDING HAS NOTHING TO SWITCH, and must not be switched away from.
   *
   * The reader's binding preference is a document-wide attribute, so it arrives at previews that
   * cannot honour it: a demo authored with only a `react` slot (no `html`, so no Vanilla stage) was
   * being handed `"vanilla"` and hid the one stage it had. The card then showed nothing at all, and
   * its spinner ran forever, because the rule that hides the loader
   * (`component-preview.css`) waits for a stage that is BOTH ready and `:not([hidden])` - the frame
   * was ready the whole time, just hidden. The mirror case is a Vanilla-only preview meeting a
   * reader whose preference is React.
   *
   * Bailing when no panel carries the requested binding fixes both, and leaves a two-binding
   * preview switching exactly as before.
   */
  const showBinding = (binding: ComponentPreviewBinding) => {
    const panels = [...root.querySelectorAll<HTMLElement>(selector(componentPreviewAttrs.binding))];
    if (!panels.some((panel) => panel.getAttribute(componentPreviewAttrs.binding) === binding)) return;
    panels.forEach((panel) => {
      panel.hidden = panel.getAttribute(componentPreviewAttrs.binding) !== binding;
    });
    /*
     * The panel that just became visible may hold a stage that was never booted, because the scroll
     * path skips whatever is behind a hidden panel (`restoreStage`). Usually the idle prewarm got
     * there first and this is a no-op; when the reader switches faster than the browser goes idle,
     * this is what starts the realm instead of leaving a blank stage under a spinner.
     */
    restoreComponentPreviewStages(root);
  };

  const showSource = (source: ComponentPreviewSource) => {
    const vanilla = root.querySelector<HTMLElement>(
      `[${componentPreviewAttrs.binding}="vanilla"]`,
    );
    vanilla?.querySelectorAll<HTMLElement>(selector(componentPreviewAttrs.source)).forEach((panel) => {
      panel.hidden = panel.getAttribute(componentPreviewAttrs.source) !== source;
    });
  };

  const onBindingValueChange = (event: Event) => {
    const value = (event as ValueChangeEvent).detail?.value;
    if (!isBinding(value)) return;
    publishBinding(value);
    showBinding(value);
  };

  const onSourceChange = (event: Event) => {
    const value = (event as ValueChangeEvent).detail?.value;
    if (value === "html" || value === "js") showSource(value);
  };

  const onSharedBinding = (event: Event) => {
    const value = (event as ValueChangeEvent).detail?.value;
    if (!isBinding(value)) return;
    showBinding(value);
    selectSegmentedOption(bindingTabs, componentPreviewAttrs.bindingOption, value);
  };

  const onReload = () => reloadComponentPreviewStage(root);
  /*
   * The handoff needs to own the navigation, because it has to hold a reference to the tab it opened
   * in order to talk to it. So the click is taken over - but only a PLAIN one.
   *
   * A modified click (cmd, ctrl, shift, middle button) is the reader asking the browser for a tab on
   * their own terms, and stealing that would be rude. Those fall through to the `href`, land on the
   * Playground's own catalogue, and simply arrive without this demo's source. Same for a popup
   * blocker, which is what the `false` return covers.
   */
  const onPlayground = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const url = (event.currentTarget as HTMLAnchorElement | null)?.href;
    if (!url) return;
    if (openInPlayground(root, url)) event.preventDefault();
  };
  const disconnectResizer = connectStageResizer(root);
  const disconnectScreenTabs = connectScreenTabs(root);
  // Every source-tabs group this preview has (vanilla HTML/CSS/TS, react Componente/data), kept
  // in ONE shared open/closed state  -  unlike `sourceTabs` above (deliberately the first match
  // only, for the vanilla-only `showSource` logic), this reaches all of them at once.
  const disconnectSourceToggle = connectSourceToggles(root);
  const disconnectStageLifecycle = connectStageLifecycle(root);

  bindingTabs?.addEventListener(segmentedEvents.valueChange, onBindingValueChange);
  sourceTabs?.addEventListener(tabsEvents.valueChange, onSourceChange);
  document.addEventListener(componentPreviewBindingChangeEvent, onSharedBinding);
  reload?.addEventListener("click", onReload);
  playground?.addEventListener("click", onPlayground as EventListener);

  const fromTabs = bindingTabs?.getAttribute("data-value");
  const initial =
    readDocumentBinding() ??
    sharedBinding ??
    (isBinding(fromTabs) ? fromTabs : "vanilla");
  sharedBinding = initial;
  writeDocumentBinding(initial);
  showBinding(initial);
  // Segmented reads this SAME attribute as ITS OWN initial value once it mounts; see the matching
  // note in connectScreenTabs.
  bindingTabs?.setAttribute("data-value", initial);

  const initialSource = sourceTabs?.getAttribute("data-value");
  if (initialSource === "html" || initialSource === "js") showSource(initialSource);

  return () => {
    bindingTabs?.removeEventListener(segmentedEvents.valueChange, onBindingValueChange);
    sourceTabs?.removeEventListener(tabsEvents.valueChange, onSourceChange);
    document.removeEventListener(componentPreviewBindingChangeEvent, onSharedBinding);
    reload?.removeEventListener("click", onReload);
    playground?.removeEventListener("click", onPlayground as EventListener);
    disconnectResizer();
    disconnectScreenTabs();
    disconnectSourceToggle();
    disconnectStageLifecycle();
  };
}

/** Opt-in mount: documentation previews are deliberately absent from initComponents(). */
export const mountComponentPreview = createConnectMount({
  key: "component-preview",
  rootSelector,
  connect: connectComponentPreview,
});
