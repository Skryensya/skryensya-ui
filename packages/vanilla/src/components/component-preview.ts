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
 * second `sk-value-change` in the middle of handling the first.
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

/** Remounts one stage from its cached document. A no-op with nothing cached, or already live. */
function restoreStage(frame: HTMLIFrameElement): void {
  const srcdoc = stageSrcdocCache.get(frame);
  if (srcdoc === undefined || frame.srcdoc) return;
  frame.srcdoc = srcdoc;
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

/** Restores every stage under `root` that `releaseComponentPreviewStages` had released. */
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

function publishScreen(screen: ComponentPreviewScreen): void {
  if (sharedScreen === screen) {
    writeDocumentScreen(screen);
    return;
  }
  sharedScreen = screen;
  writeDocumentScreen(screen);
  document.dispatchEvent(
    new CustomEvent(componentPreviewScreenChangeEvent, { detail: { value: screen } }),
  );
}

/**
 * Screen presets for the stage: a real Segmented (Libre | XL | Tablet | Móvil), the site's global
 * enhancer already knows how to run. This module only reacts to the `sk-value-change` it
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

  const offersXl = Boolean(
    tabs?.querySelector(`${selector(componentPreviewAttrs.screenOption)}[data-value="xl"]`),
  );

  const resolveLocal = (screen: ComponentPreviewScreen): ComponentPreviewScreen => {
    if (
      screen === "xl" &&
      (!offersXl || document.documentElement.hasAttribute("data-sk-fullscreen-preview"))
    ) {
      return "free";
    }
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
    if (!isScreen(value)) return;
    currentUnforcedScreen = value;
    if (localScreen) {
      applyEffectiveScreen(value);
      return;
    }
    if (!viewport?.matches) publishScreen(value);
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

  tabs?.addEventListener("sk-value-change", onValueChange);
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
  const initial =
    rawInitial === "xl" && document.documentElement.hasAttribute("data-sk-fullscreen-preview")
      ? "free"
      : rawInitial;
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
    tabs?.removeEventListener("sk-value-change", onValueChange);
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
export function openComponentPreviewFullscreen(root: HTMLElement): void {
  const n = [...document.querySelectorAll("[data-sk-component-preview]")].indexOf(root) + 1;
  if (n < 1) return;
  const page = location.pathname.replace(/\/+$/, "");
  window.open(new URL(`/f${page}/${n}`, location.origin).href, "_blank");
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
   * A binding with no file tabs has NOTHING to stand in front of: its own toggle already IS the
   * one real per-file button, already wired by `code-preview.ts`'s own `connectCodePreview` (every
   * `.sk-code-preview` mounts independently of this file)  -  AND it is also one of THIS function's
   * own representative toggles, since a binding with no tabs has no separate shared bar to be one.
   * Two things go wrong if a click is forwarded to it unfiltered, and both showed up live
   * (`aria-expanded` coming back unchanged  -  toggled, then immediately un-toggled):
   *
   *  1. `panelToggle.click()` on THE SAME element the reader just clicked fires
   *     `connectCodePreview`'s own listener a SECOND time, flipping its real state right back.
   *     Excluding the clicked toggle from its own forwarding pass (`!== clicked`) is what stops
   *     a toggle from re-clicking itself.
   *  2. That same synthetic click ALSO fires THIS file's own listener on it a second time
   *     (attached alongside `connectCodePreview`'s, since it doubles as a representative), which
   *     would start a SECOND forwarding pass back over every OTHER panel  -  flipping them again
   *     too. A reentrancy guard is what stops THAT: only the outermost, genuinely user-initiated
   *     click runs the forwarding loop; a listener re-entered synchronously from inside that loop
   *     sees the guard already up and returns without cascading further.
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
          if (entry.isIntersecting) restoreComponentPreviewStages(previewRoot);
          else releaseComponentPreviewStages(previewRoot);
        }
      },
      // One generous band, not a tighter release margin plus a separate restore margin: a reader
      // scrolling normally crosses this boundary once per direction, and toggling the segmented
      // control on the preview in front of them never crosses it at all, so there is nothing here
      // for two margins to buy over one.
      { rootMargin: "100% 0px" },
    );
  }
  return sharedStageObserver;
}

/** Releases a preview's stages once it scrolls a viewport past view, restores them when it scrolls back. */
function connectStageLifecycle(root: HTMLElement): Cleanup {
  const observer = stageObserver();
  if (!observer || !stagesOf(root).length) return () => {};
  observer.observe(root);
  return () => observer.unobserve(root);
}

/** Switches the authored source panels without owning preview rendering or highlighted code. */
export function connectComponentPreview(root: HTMLElement): Cleanup {
  const bindingTabs = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.bindingTabs));
  const sourceTabs = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.sourceTabs));
  const reload = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.reload));
  const fullscreen = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.fullscreen));

  const showBinding = (binding: ComponentPreviewBinding) => {
    root.querySelectorAll<HTMLElement>(selector(componentPreviewAttrs.binding)).forEach((panel) => {
      panel.hidden = panel.getAttribute(componentPreviewAttrs.binding) !== binding;
    });
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
  const onFullscreen = () => openComponentPreviewFullscreen(root);
  const disconnectResizer = connectStageResizer(root);
  const disconnectScreenTabs = connectScreenTabs(root);
  // Every source-tabs group this preview has (vanilla HTML/CSS/TS, react Componente/data), kept
  // in ONE shared open/closed state  -  unlike `sourceTabs` above (deliberately the first match
  // only, for the vanilla-only `showSource` logic), this reaches all of them at once.
  const disconnectSourceToggle = connectSourceToggles(root);
  const disconnectStageLifecycle = connectStageLifecycle(root);

  bindingTabs?.addEventListener("sk-value-change", onBindingValueChange);
  sourceTabs?.addEventListener("sk-value-change", onSourceChange);
  document.addEventListener(componentPreviewBindingChangeEvent, onSharedBinding);
  reload?.addEventListener("click", onReload);
  fullscreen?.addEventListener("click", onFullscreen);

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
    bindingTabs?.removeEventListener("sk-value-change", onBindingValueChange);
    sourceTabs?.removeEventListener("sk-value-change", onSourceChange);
    document.removeEventListener(componentPreviewBindingChangeEvent, onSharedBinding);
    reload?.removeEventListener("click", onReload);
    fullscreen?.removeEventListener("click", onFullscreen);
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
