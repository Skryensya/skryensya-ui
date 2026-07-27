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

/** Sync a Segmented control to the shared binding without a no-op click when already matched. */
function syncBindingTabs(tabs: HTMLElement | null, binding: ComponentPreviewBinding): void {
  if (!tabs) return;
  if (tabs.getAttribute("data-value") === binding) return;
  tabs.setAttribute("data-value", binding);
  // Prefer a silent attr write when the enhancer is not ready yet; click only if Segmented is live
  // so its closed-over value stays honest — and only then (user changes), so load never animates.
  if (!tabs.hasAttribute("data-sk-segmented-ready")) return;
  tabs
    .querySelector<HTMLElement>(
      `${selector("data-sk-segmented-option")}[data-value="${CSS.escape(binding)}"]`,
    )
    ?.click();
}

/** Re-boot the srcdoc stage so count-ups, loaders and mount side-effects run again. */
export function reloadComponentPreviewStage(root: HTMLElement): void {
  const stage = root.querySelector<HTMLIFrameElement>(`.${componentPreviewParts.stage}`);
  if (!stage || stage.tagName !== "IFRAME") return;

  const srcdoc = stage.getAttribute("srcdoc") ?? stage.srcdoc;
  if (!srcdoc) return;

  stage.removeAttribute(componentPreviewAttrs.frameReady);
  stage.removeAttribute(componentPreviewAttrs.frameError);
  stage.setAttribute("aria-busy", "true");
  // A height the reader chose survives the reboot; an auto-fitted one is re-measured.
  if (!stage.hasAttribute(componentPreviewAttrs.resized)) stage.style.removeProperty("height");

  // Browsers coalesce identical srcdoc writes; clear first so the document remounts.
  stage.srcdoc = "";
  requestAnimationFrame(() => {
    stage.srcdoc = srcdoc;
  });
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

/** Sync a Segmented control to the shared screen without a no-op click when already matched. */
function syncScreenTabs(tabs: HTMLElement | null, screen: ComponentPreviewScreen): void {
  if (!tabs) return;
  if (tabs.getAttribute("data-value") === screen) return;
  tabs.setAttribute("data-value", screen);
  // Same rule as the binding tabs: a silent attr write before the enhancer is ready, a real click
  // after, so Segmented's closed-over value stays honest and load never animates.
  if (!tabs.hasAttribute("data-sk-segmented-ready")) return;
  tabs
    .querySelector<HTMLElement>(
      `${selector("data-sk-segmented-option")}[data-value="${CSS.escape(screen)}"]`,
    )
    ?.click();
}

/**
 * Screen presets for the stage.
 *
 * The preset takes over BOTH axes, so choosing one drops any height the reader had dragged: two
 * owners of the same height is the bug, and the preset is the one the reader just asked for. The
 * inline `height` has to go too, not only the `resized` flag — an inline style beats the preset's
 * rule, so a stale drag would silently win over the device height.
 *
 * `free` is the ABSENCE of the attribute rather than a value: every rule that fits, reserves or
 * scrolls then keeps working untouched, and the frame runtime needs no third case.
 *
 * The preference is per DOCUMENT, not per preview, and every mounted preview applies it — so a
 * preview with no tabs of its own (or one mounted later) still follows the page.
 */
function connectScreenTabs(root: HTMLElement): Cleanup {
  const tabs = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.screenTabs));
  const stage = root.querySelector<HTMLElement>(`.${componentPreviewParts.stage}`);
  if (!stage) return () => {};

  const applyScreen = (screen: ComponentPreviewScreen) => {
    if (screen === "free") {
      stage.removeAttribute(componentPreviewAttrs.screen);
      return;
    }
    stage.style.removeProperty("height");
    stage.removeAttribute(componentPreviewAttrs.resized);
    stage.setAttribute(componentPreviewAttrs.screen, screen);
  };

  const onScreenChange = (event: Event) => {
    const value = (event as ValueChangeEvent).detail?.value;
    if (!isScreen(value)) return;
    publishScreen(value);
    applyScreen(value);
  };

  const onSharedScreen = (event: Event) => {
    const value = (event as ValueChangeEvent).detail?.value;
    if (!isScreen(value)) return;
    applyScreen(value);
    syncScreenTabs(tabs, value);
  };

  tabs?.addEventListener("sk-value-change", onScreenChange);
  document.addEventListener(componentPreviewScreenChangeEvent, onSharedScreen);

  const fromTabs = tabs?.getAttribute("data-value");
  const initial =
    readDocumentScreen() ?? sharedScreen ?? (isScreen(fromTabs) ? fromTabs : "free");
  sharedScreen = initial;
  writeDocumentScreen(initial);
  applyScreen(initial);
  syncScreenTabs(tabs, initial);

  return () => {
    tabs?.removeEventListener("sk-value-change", onScreenChange);
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
  const stage = root.querySelector<HTMLElement>(`.${componentPreviewParts.stage}`);
  const resizer = root.querySelector<HTMLElement>(selector(componentPreviewAttrs.resizer));
  if (!stage || !resizer) return () => {};

  const maxHeight = () =>
    Math.max(stageMinHeight, Math.round((window.innerHeight || 0) * 0.9) || stageMinHeight);

  const setHeight = (height: number) => {
    const next = Math.round(clamp(height, stageMinHeight, maxHeight()));
    stage.style.height = `${next}px`;
    stage.setAttribute(componentPreviewAttrs.resized, "");
    resizer.setAttribute("aria-valuenow", String(next));
    resizer.setAttribute("aria-valuemin", String(stageMinHeight));
    resizer.setAttribute("aria-valuemax", String(maxHeight()));
    resizer.setAttribute("aria-valuetext", `${next} px`);
  };

  const resetHeight = () => {
    stage.style.removeProperty("height");
    stage.removeAttribute(componentPreviewAttrs.resized);
    for (const name of ["aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext"]) {
      resizer.removeAttribute(name);
    }
  };

  const nudge = (delta: number) => setHeight(stage.getBoundingClientRect().height + delta);

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
    dragPointer = event.pointerId;
    startY = event.clientY;
    startHeight = stage.getBoundingClientRect().height;
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

  const applyBinding = (binding: ComponentPreviewBinding) => {
    showBinding(binding);
    syncBindingTabs(bindingTabs, binding);
  };

  const onBindingChange = (event: Event) => {
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
    applyBinding(value);
  };

  const onReload = () => reloadComponentPreviewStage(root);
  const disconnectResizer = connectStageResizer(root);
  const disconnectScreenTabs = connectScreenTabs(root);

  bindingTabs?.addEventListener("sk-value-change", onBindingChange);
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
  applyBinding(initial);

  const initialSource = sourceTabs?.getAttribute("data-value");
  if (initialSource === "html" || initialSource === "js") showSource(initialSource);

  return () => {
    bindingTabs?.removeEventListener("sk-value-change", onBindingChange);
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
