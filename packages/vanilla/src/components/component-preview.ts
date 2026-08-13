import {
  componentPreviewAttrs,
  componentPreviewBindingChangeEvent,
  componentPreviewParts,
  componentPreviewScreenChangeEvent,
  type ComponentPreviewBinding,
  type ComponentPreviewScreen,
  type ComponentPreviewSource,
} from "@skryensya/core/component-preview";
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
 * has is the same one a reader has — clicking the matching option — which lets Segmented's own
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

/** Re-boot the srcdoc stages so count-ups, loaders and mount side-effects run again. */
export function reloadComponentPreviewStage(root: HTMLElement): void {
  for (const stage of stagesOf(root)) {
    if (stage.tagName !== "IFRAME") continue;
    const frame = stage as HTMLIFrameElement;

    const srcdoc = frame.getAttribute("srcdoc") ?? frame.srcdoc;
    if (!srcdoc) continue;

    frame.removeAttribute(componentPreviewAttrs.frameReady);
    frame.removeAttribute(componentPreviewAttrs.frameError);
    frame.setAttribute("aria-busy", "true");
    // A height the reader chose survives the reboot; an auto-fitted one is re-measured.
    if (!frame.hasAttribute(componentPreviewAttrs.resized)) frame.style.removeProperty("height");

    // Browsers coalesce identical srcdoc writes; clear first so the document remounts.
    frame.srcdoc = "";
    requestAnimationFrame(() => {
      frame.srcdoc = srcdoc;
    });
  }
}

/** Shared screen preset for every preview on the page, exactly like `sharedBinding` above. */
let sharedScreen: ComponentPreviewScreen | null = null;

/** Test helper: drop the in-memory preference between cases. */
export function resetSharedComponentPreviewScreen(): void {
  sharedScreen = null;
}

function isScreen(value: string | null | undefined): value is ComponentPreviewScreen {
  return value === "free" || value === "tablet" || value === "mobile";
}

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
 * Screen presets for the stage: a real Segmented (Libre | Tablet | Móvil), the site's global
 * enhancer already knows how to run — this module only reacts to the `sk-value-change` it
 * dispatches on itself, the same way `sourceTabs` below reacts to Tabs' own event, rather than
 * re-implementing Segmented's click handling, aria-checked painting or sliding indicator.
 *
 * The preset takes over BOTH axes, so choosing one drops any height the reader had dragged: two
 * owners of the same height is the bug, and the preset is the one the reader just asked for. The
 * inline `height` has to go too, not only the `resized` flag; an inline style beats the preset's
 * rule, so a stale drag would silently win over the device height.
 *
 * `free` is the ABSENCE of the attribute rather than a value: every rule that fits, reserves or
 * scrolls then keeps working untouched, and the frame runtime needs no third case.
 *
 * The preference is per DOCUMENT, not per preview, and every mounted preview applies it; so a
 * preview with no toggle of its own (or one mounted later) still follows the page.
 */
function connectScreenTabs(root: HTMLElement): Cleanup {
  const tabs = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.screenTabs));
  if (!stagesOf(root).length) return () => {};

  const applyScreen = (screen: ComponentPreviewScreen) => {
    // Re-queried per call: the React stage is an island, so it can arrive after this mount ran.
    for (const stage of stagesOf(root)) {
      if (screen === "free") {
        stage.removeAttribute(componentPreviewAttrs.screen);
        continue;
      }
      stage.style.removeProperty("height");
      stage.removeAttribute(componentPreviewAttrs.resized);
      stage.setAttribute(componentPreviewAttrs.screen, screen);
    }
  };

  const onValueChange = (event: Event) => {
    const value = (event as ValueChangeEvent).detail?.value;
    if (!isScreen(value)) return;
    publishScreen(value);
    applyScreen(value);
  };

  const onSharedScreen = (event: Event) => {
    const value = (event as ValueChangeEvent).detail?.value;
    if (!isScreen(value)) return;
    applyScreen(value);
    selectSegmentedOption(tabs, componentPreviewAttrs.screenOption, value);
  };

  tabs?.addEventListener("sk-value-change", onValueChange);
  document.addEventListener(componentPreviewScreenChangeEvent, onSharedScreen);

  const fromTabs = tabs?.getAttribute("data-value");
  const initial = readDocumentScreen() ?? sharedScreen ?? (isScreen(fromTabs) ? fromTabs : "free");
  sharedScreen = initial;
  writeDocumentScreen(initial);
  applyScreen(initial);
  // Segmented reads this SAME attribute as ITS OWN initial value once it mounts; a plain write is
  // enough here, no click needed, because nothing has rendered a selection to correct yet.
  tabs?.setAttribute("data-value", initial);

  return () => {
    tabs?.removeEventListener("sk-value-change", onValueChange);
    document.removeEventListener(componentPreviewScreenChangeEvent, onSharedScreen);
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

  const nudge = (delta: number) =>
    setHeight((visibleStage()?.getBoundingClientRect().height ?? stageMinHeight) + delta);

  /*
   * A screen preset owns both axes, so grabbing the grip while one is active would make it a
   * SECOND owner of the height; the original reason the grip used to hide outright under a
   * preset. Clearing the preset here resolves that conflict procedurally instead: the reader's
   * drag is a clearer statement of intent ("I want THIS height") than a stale preset from
   * whichever preview last touched the shared, persisted preference, on this page or another.
   * `publishScreen` is synchronous (a plain `document.dispatchEvent`), so by the time this
   * returns, THIS stage has already lost its `screen` attribute and reverted to auto-fit sizing;
   * `startHeight` below reads the POST-escape box, not the device preset's.
   */
  const escapePresetIfActive = () => {
    if (stagesOf(root).some((stage) => stage.hasAttribute(componentPreviewAttrs.screen))) {
      publishScreen("free");
    }
  };

  let dragPointer: number | null = null;
  let startY = 0;
  let startHeight = 0;

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
    escapePresetIfActive();
    dragPointer = event.pointerId;
    startY = event.clientY;
    startHeight = visibleStage()?.getBoundingClientRect().height ?? stageMinHeight;
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
    setHeight(startHeight + (event.clientY - startY));
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
      escapePresetIfActive();
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

/** Switches the authored source panels without owning preview rendering or highlighted code. */
export function connectComponentPreview(root: HTMLElement): Cleanup {
  const bindingTabs = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.bindingTabs));
  const sourceTabs = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.sourceTabs));
  const reload = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.reload));

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
  const disconnectResizer = connectStageResizer(root);
  const disconnectScreenTabs = connectScreenTabs(root);

  bindingTabs?.addEventListener("sk-value-change", onBindingValueChange);
  sourceTabs?.addEventListener("sk-value-change", onSourceChange);
  document.addEventListener(componentPreviewBindingChangeEvent, onSharedBinding);
  reload?.addEventListener("click", onReload);

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
    disconnectResizer();
    disconnectScreenTabs();
  };
}

/** Opt-in mount: documentation previews are deliberately absent from initComponents(). */
export const mountComponentPreview = createConnectMount({
  key: "component-preview",
  rootSelector,
  connect: connectComponentPreview,
});
