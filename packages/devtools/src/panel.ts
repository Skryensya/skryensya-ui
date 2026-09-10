/*
 * A relative path into `@skryensya/core`'s own file tree, not its published `?raw` specifier: Vite's
 * resolver does not consult the package's wildcarded `exports` map (`"./components/*"` etc.) for a
 * `?raw`-suffixed request, and `@skryensya/core/components/button.css?raw` 404s as a result. The
 * same reason `apps/docs`'s own source-viewer pages reach around the exports map with a path alias
 * for this exact query shape. `@skryensya/core` is still the declared dependency (package.json); this
 * only names where inside it the file actually lives.
 */
import buttonCss from "../../core/css/components/button.css?raw";
import checkboxCss from "../../core/css/components/checkbox.css?raw";
import iconCss from "../../core/css/patterns/icon.css?raw";
import stateLayerCss from "../../core/css/patterns/state-layer.css?raw";
import { createHitAreaOverlay } from "./overlay";
import { createMotionSlowMo } from "./motion";
import { createFocusOrderOverlay } from "./focus-order";
import { createFpsMeter } from "./fps";
import { createPreviewMetrics } from "./preview-metrics";
import { clampPosition, exceedsDragThreshold, panelEdge } from "./geometry";

/*
 * Written by `apps/docs`'s `Base.astro`, right after its own `initComponents()` call resolves -
 * that return value IS the exact mount count (`registry.ts`'s own `mount(root)` interfaces each
 * return how many instances they just hydrated, summed by `initComponents()`). Reading a number
 * some OTHER script already computed, rather than re-deriving it here, is the same reasoning as the
 * hit-area/motion CSS text being duplicated instead of imported: this package cannot import from
 * `apps/docs`, so the two sides share a name instead, documented on both ends.
 */
declare global {
  interface Window {
    __skDevtoolsComponentCount?: number;
  }
}

/*
 * REAL COMPONENTS, not hand-rolled chrome: the toggle is a real `sk-button` and the "Hit areas"
 * control a real `sk-checkbox` (markup lifted verbatim from `validate_ui` against their published
 * contracts), with the actual published stylesheets injected as text into this shadow root. A tool
 * for inspecting the design system should look like it, and it means this file owns none of the
 * hover/press/focus states or the checked/indeterminate visuals. The same CSS every consumer gets
 * already owns all of that.
 *
 * `:host { all: initial }` plus a shadow root is the isolation story on top of that: nothing this
 * stylesheet declares can leak onto the host page, and nothing the host page declares. Resets, a
 * hostile `*` rule. Can reach in here either. Custom properties (`--color-*`, `--size-*`, the
 * current density/contrast/scheme) still cross the shadow boundary by inheritance from the host
 * element's own computed style, which is what lets the real component CSS resolve correctly without
 * this file re-declaring a single token.
 */
const LAYOUT_STYLES = `
  /*
   * \`all: initial\` also resets \`color-scheme\`. A REAL CSS property, not a custom one, so it is
   * NOT among the handful \`all\` leaves alone. Every token in the injected component stylesheets
   * that resolves through \`light-dark(...)\` (button.css's own \`--sk-button-bg\`/\`--sk-button-border-
   * color\` among them) reads that property off the element the declaration lands on, and without
   * this line every one of them was resolving as if the page were permanently in LIGHT mode: measured
   * with the site's own \`data-scheme="dark"\` set, this panel's background stayed pure white
   * (\`oklch(1 0 0)\`) instead of the dark surface token. \`inherit\`, not a hardcoded \`light dark\`: the
   * real value already lives on \`<html>\` (\`Base.astro\`'s pre-paint script sets it explicitly, never
   * left to guess at the OS preference alone), so inheriting it is what makes this panel track
   * whichever of light/dark/system the reader actually has chosen, not just their OS.
   */
  :host { all: initial; color-scheme: inherit; }
  * { box-sizing: border-box; }
  .root {
    position: fixed;
    z-index: 2147483001;
    /* The site's own body/code families, not a hardcoded stack. A product that retunes its type
       tokens (ADR-19's per-consumer retuning story) should see this panel retune with it, the same
       reason the colors above resolve through tokens rather than literals. */
    font: 13px/1.4 var(--font-family-body, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
    touch-action: none;
  }
  .toggle { cursor: grab; }
  .toggle[data-dragging] { cursor: grabbing; }
  .panel {
    position: absolute;
    right: 0;
    min-inline-size: 180px;
    background: var(--color-bg-surface, #18181b);
    color: var(--color-text-primary, #f4f4f5);
    border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.12));
    border-radius: var(--radius-surface, 10px);
    /* \`--space-inset-*\`, not literal px: these already scale with \`--sk-density\`, so a page running
       a compact demo shows a correspondingly tighter panel instead of one fixed size regardless of
       the density the rest of the page is proving out. */
    padding: var(--space-inset-sm, 8px) var(--space-inset-md, 16px);
    box-shadow: var(--elevation-raised, 0 8px 24px rgba(0, 0, 0, 0.4));
  }
  .panel[data-edge="bottom"] { top: calc(100% + var(--space-stack-xs, 8px)); }
  .panel[data-edge="top"] { bottom: calc(100% + var(--space-stack-xs, 8px)); }
  .panel[hidden] { display: none; }
  .title {
    margin: 0 0 var(--space-stack-xs, 8px);
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.6;
  }
  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-inline-sm, 8px);
    margin: 0 0 var(--space-stack-xs, 8px);
    padding-block: 2px;
  }
  .stat-row__value {
    font: 700 11px/1 var(--font-family-code, ui-monospace, "SF Mono", monospace);
    opacity: 0.8;
  }
  /* Separates the read-only stat above from the toggles below. Two different kinds of row (one
     reports, the rest control), and nothing before this distinguished them but a shared margin. */
  .divider {
    margin: 0 0 var(--space-stack-xs, 8px);
    border: none;
    border-block-start: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.12));
    opacity: 0.5;
  }
  .sk-checkbox + .sk-checkbox {
    margin-block-start: var(--space-stack-xs, 8px);
  }
`;

const CLICK_VS_DRAG_THRESHOLD_PX = 4;
const STORAGE_KEY = "sk-devtools-panel-position";

type SavedPosition = { left: number; top: number };

function loadPosition(): SavedPosition | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedPosition>;
    if (typeof parsed.left === "number" && typeof parsed.top === "number") return parsed as SavedPosition;
  } catch {
    /* ignore: falls back to the default corner */
  }
  return null;
}

function savePosition(position: SavedPosition): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch {
    /* private mode, quota exceeded. The position just does not survive reload */
  }
}

/** Keeps a `position: fixed` box fully inside the viewport after a drag or a resize. The decision
 *  itself is `clampPosition` (`./geometry.ts`, pure, tested there); this only supplies the one
 *  thing that makes it a DOM call rather than a plain function call: the live viewport size. */
function clamp(position: SavedPosition, size: { width: number; height: number }): SavedPosition {
  return clampPosition(position, size, { width: window.innerWidth, height: window.innerHeight });
}

/*
 * EVERY CHECK SURVIVES NAVIGATION, and that is not a convenience. It is what makes the panel usable
 * at all. Each of these answers a question you ask ACROSS pages ("is the focus order sane on every
 * component page", "does anything drop frames while I click through the catalogue"), and a flag that
 * resets on the next link turns that into re-ticking a box at every step until you stop bothering.
 * Only "Safety triangle" persisted before, and only because it had no choice: it needs a reload to
 * take effect, so it had to survive one.
 *
 * One key per check, `null`-safe on every access: a private window, a full quota or a browser with
 * site data blocked all throw on `localStorage`, and a debug overlay that throws while the page is
 * loading is worse than one that forgets a checkbox.
 */
const TOGGLE_KEY_PREFIX = "sk-devtools-toggle:";

function readToggle(id: string): boolean {
  try {
    return localStorage.getItem(`${TOGGLE_KEY_PREFIX}${id}`) === "1";
  } catch {
    return false;
  }
}

function writeToggle(id: string, on: boolean): void {
  try {
    if (on) localStorage.setItem(`${TOGGLE_KEY_PREFIX}${id}`, "1");
    else localStorage.removeItem(`${TOGGLE_KEY_PREFIX}${id}`);
  } catch {
    /* private mode, quota exceeded. The check still works, it just will not survive the reload */
  }
}

/*
 * NOT under the prefix above, deliberately. This exact string is also read by `Base.astro`'s own
 * early `<head>` script, before any menu mounts and long before this module loads. It is a
 * cross-file contract, not this panel's private storage, and renaming it for tidiness would silently
 * drop the flag for anyone who already has it set.
 */
const SAFETY_TRIANGLE_KEY = "sk-devtools-safety-triangle";

const PANEL_OPEN_KEY = `${TOGGLE_KEY_PREFIX}panel-open`;

/**
 * One `sk-checkbox` row (markup lifted verbatim from `validate_ui`, same as the button; see the
 * file header). Only the "checked" glyph is drawn: none of this panel's checkboxes ever go
 * indeterminate, so that state's icon would never paint. The empty sibling still has to exist -
 * checkbox.css positions both by part name, and the CSS drives visibility off `:checked`/
 * `:indeterminate` on the real input, not off whether this file bothered to fill each one in.
 */
function createCheckboxRow(labelText: string): { row: HTMLLabelElement; input: HTMLInputElement } {
  const row = document.createElement("label");
  row.className = "sk-checkbox";
  const input = document.createElement("input");
  input.className = "sk-checkbox__input";
  input.type = "checkbox";
  const control = document.createElement("span");
  control.className = "sk-checkbox__control sk-interactive";
  control.setAttribute("aria-hidden", "true");
  control.innerHTML = `
    <span class="sk-checkbox__indicator" data-state="checked">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5"></path></svg>
    </span>
    <span class="sk-checkbox__indicator" data-state="indeterminate"></span>
  `;
  const text = document.createElement("span");
  text.className = "sk-checkbox__label";
  text.textContent = labelText;
  row.append(input, control, text);
  return { row, input };
}

export type DebugPanelHandle = { unmount: () => void };
export type DebugPanelOptions = { toggleLabel?: string };

/**
 * Mounts a small, self-contained debug overlay: a draggable toggle button and a panel with the
 * available checks (see `overlay.ts` for "Hit areas"; "Safety triangle" is wired up just below).
 *
 * Everything a reader sets here survives navigation and reload, which check is on, whether the
 * panel is open, and where the button sits, so the panel comes back exactly as it was left on the
 * next page. See `persistedToggle` below, and the storage helpers above it for why every access is
 * wrapped.
 */
export function mountDebugPanel(options: DebugPanelOptions = {}): DebugPanelHandle {
  const host = document.createElement("div");
  host.setAttribute("data-sk-devtools-host", "");
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `${buttonCss}\n${checkboxCss}\n${iconCss}\n${stateLayerCss}\n${LAYOUT_STYLES}`;
  shadow.appendChild(style);

  const root = document.createElement("div");
  root.className = "root";
  shadow.appendChild(root);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "sk-button sk-interactive toggle";
  toggle.setAttribute("data-sk-button", "");
  toggle.setAttribute("data-variant", "neutral");
  toggle.setAttribute("data-size", "sm");
  toggle.setAttribute("data-icon-only", "");
  toggle.setAttribute("aria-label", options.toggleLabel ?? "skryensya/ui debug panel");
  toggle.setAttribute("aria-expanded", "false");
  /*
   * An inline SVG, not the 🐞 emoji this used to be: an emoji glyph renders as a DIFFERENT icon on
   * every platform (a literal ladybug on some, a generic insect on others, missing entirely on a
   * system with no color-emoji font), which is a strange first impression for a design-system tool
   * to make. `currentColor` + the same `viewBox="0 0 24 24"`/2px-stroke convention as the checkbox
   * glyph above (and every icon this design system ships) means it also inherits the button's own
   * `color`, so it repaints correctly across every variant and scheme this panel already tracks.
   */
  toggle.innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 12h4l2-7 4 14 3-9 2 2h5"></path></svg>';
  root.appendChild(toggle);

  const panel = document.createElement("div");
  panel.className = "panel";
  panel.dataset.edge = "bottom";
  panel.hidden = true;
  root.appendChild(panel);

  const title = document.createElement("p");
  title.className = "title";
  title.textContent = "Debug";
  panel.appendChild(title);

  /*
   * COMPONENTS MOUNTED, read-only: `Base.astro` writes `window.__skDevtoolsComponentCount` (and
   * fires a matching event) once its own `initComponents()` call resolves. The LISTENER is
   * registered before the synchronous fallback read runs, on purpose: measured, this panel's own
   * dynamic-import can start running before that script's `await initComponents()` finishes, so the
   * property alone can be read too early. `addEventListener` still catches the event fired after -
   * it does not matter which side registered first, so this covers both orderings, and the
   * synchronous read only wins the ones where the property was already there. A snapshot either
   * way, not a live counter: the docs site is a plain multi-page site (a full navigation per link),
   * so the count cannot change again once either path lands a number here.
   */
  const componentCountRow = document.createElement("p");
  componentCountRow.className = "stat-row";
  const componentCountLabel = document.createElement("span");
  componentCountLabel.textContent = "Components mounted";
  const componentCountValue = document.createElement("span");
  componentCountValue.className = "stat-row__value";
  componentCountValue.textContent = String(window.__skDevtoolsComponentCount ?? "N/A");
  window.addEventListener(
    "sk:devtools-component-count",
    (event) => {
      componentCountValue.textContent = String((event as CustomEvent<number>).detail);
    },
    { once: true },
  );
  componentCountRow.append(componentCountLabel, componentCountValue);
  panel.appendChild(componentCountRow);

  const divider = document.createElement("hr");
  divider.className = "divider";
  panel.appendChild(divider);

  /**
   * One persisted check. Restores itself at mount by actually RUNNING `start()` when the flag was
   * left on, not just by ticking the box: a checkbox that reads "on" over a page showing none of the
   * effect is worse than no persistence at all, because it makes you doubt the tool rather than the
   * page. The write happens after the effect, so a `start()` that throws cannot leave a flag behind
   * claiming a state the page never reached.
   */
  function persistedToggle(
    id: string,
    labelText: string,
    controls: { start: () => void; stop: () => void },
  ): { row: HTMLLabelElement; input: HTMLInputElement } {
    const { row, input } = createCheckboxRow(labelText);
    input.checked = readToggle(id);
    if (input.checked) controls.start();
    input.addEventListener("change", () => {
      if (input.checked) controls.start();
      else controls.stop();
      writeToggle(id, input.checked);
    });
    return { row, input };
  }

  const hitAreaOverlay = createHitAreaOverlay();
  const { row: hitAreaRow } = persistedToggle("hit-areas", "Hit areas", hitAreaOverlay);
  panel.appendChild(hitAreaRow);

  /*
   * SAFETY TRIANGLE. Unlike "Hit areas", this cannot toggle live: `Menu.svelte` reads
   * `data-sk-menu-debug-intent` off an ancestor ONCE, at each menu's own setup (see the matching
   * comment in `Base.astro`), so flipping the attribute after a menu has already mounted does
   * nothing for that menu. This writes the SAME `localStorage` key `Base.astro`'s early script
   * reads before any menu mounts, then reloads. The only way the flag can actually take effect,
   * on or off. The checkbox opens already reflecting whatever that key currently says, rather than
   * always starting unchecked and lying about the state a page carried in from the last reload.
   */
  const { row: safetyRow, input: safetyCheckbox } = createCheckboxRow("Safety triangle");
  try {
    safetyCheckbox.checked = localStorage.getItem(SAFETY_TRIANGLE_KEY) === "1";
  } catch {
    /* private mode. Opens unchecked, same as a reader who never set it */
  }
  panel.appendChild(safetyRow);
  safetyCheckbox.addEventListener("change", () => {
    try {
      if (safetyCheckbox.checked) localStorage.setItem(SAFETY_TRIANGLE_KEY, "1");
      else localStorage.removeItem(SAFETY_TRIANGLE_KEY);
    } catch {
      /* private mode, quota exceeded: nothing to persist, so nothing to reload for either */
      return;
    }
    location.reload();
  });

  /*
   * FPS METER. The checkbox here is only a remote control: the reading itself renders as a real
   * light-DOM badge (`fps.ts`'s own `createFpsMeter()`), not a node inside this panel's shadow
   * root; see that file's header comment for why. That also means, unlike every other row in this
   * function, there is nothing of this check's own to append to `panel`; the row is a plain toggle.
   */
  const fpsMeter = createFpsMeter();
  const { row: fpsRow } = persistedToggle("fps", "FPS meter", fpsMeter);
  panel.appendChild(fpsRow);

  const motionSlowMo = createMotionSlowMo();
  const { row: slowMoRow } = persistedToggle("slow-motion", "Slow motion (6x)", motionSlowMo);
  panel.appendChild(slowMoRow);

  const focusOrderOverlay = createFocusOrderOverlay();
  const { row: focusOrderRow } = persistedToggle("focus-order", "Focus order", focusOrderOverlay);
  panel.appendChild(focusOrderRow);

  /*
   * PREVIEW METRICS. Like the FPS meter, the checkbox is only a remote control: the readings render
   * as real light-DOM lines under each preview card (see `preview-metrics.ts`), because the thing
   * being watched is a load sequence that plays out while this panel is shut.
   */
  const previewMetrics = createPreviewMetrics();
  const { row: previewMetricsRow } = persistedToggle("preview-metrics", "Preview metrics", previewMetrics);
  panel.appendChild(previewMetricsRow);

  /*
   * OPEN/CLOSED IS STATE TOO, and it persists for the same reason the checks do: someone working
   * through a run of pages with the panel open should not have to re-open it on every navigation.
   * One function owns the three things that must move together. The `hidden` flag, the button's
   * `aria-expanded`, and which edge the panel grows from, so restoring at mount and toggling on
   * click cannot drift apart.
   */
  function setPanelOpen(open: boolean): void {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (!open) return;
    // Open UPWARD by default; flip below only when the panel would not fit above the button.
    // The threshold itself is `panelEdge` (`./geometry.ts`, pure, tested there).
    const spaceAbove = toggle.getBoundingClientRect().top;
    panel.dataset.edge = panelEdge(spaceAbove, 220);
  }

  document.body.appendChild(host);

  /* After `appendChild`: the edge decision above measures the toggle, and a detached element
   * measures 0, which would pin the panel to "bottom" on every restore regardless of room. */
  try {
    if (localStorage.getItem(PANEL_OPEN_KEY) === "1") setPanelOpen(true);
  } catch {
    /* private mode. Opens closed, the same default a first-time reader gets */
  }

  /*
   * POSITIONING. Anchored by `left`/`top` (never `right`/`bottom`): a drag reads the pointer's own
   * viewport coordinates, and computing a `right`/`bottom` offset from those would mean re-deriving
   * them from `innerWidth`/`innerHeight` on every move for no benefit: `left`/`top` is what the
   * pointer already gives you. Restored on mount from `localStorage`, clamped so a viewport that
   * shrank since the position was saved cannot leave the button reachable only off-screen.
   */
  function place(left: number, top: number): void {
    const rect = toggle.getBoundingClientRect();
    const clamped = clamp({ left, top }, { width: rect.width || 40, height: rect.height || 40 });
    root.style.left = `${clamped.left}px`;
    root.style.top = `${clamped.top}px`;
  }

  const saved = loadPosition();
  if (saved) {
    place(saved.left, saved.top);
  } else {
    const rect = toggle.getBoundingClientRect();
    place(window.innerWidth - (rect.width || 40) - 16, window.innerHeight - (rect.height || 40) - 16);
  }

  window.addEventListener("resize", () => {
    const rect = root.getBoundingClientRect();
    place(rect.left, rect.top);
  });

  /*
   * DRAG VS. CLICK. A pointer that never travels past the threshold is a click and reaches the
   * button's native `click` handler normally: `pointerdown` never calls `preventDefault()` for
   * that case. One that does travel is a drag: this suppresses the `click` that would otherwise
   * ALSO fire on release (the platform does not know a drag happened, only that the pointer went
   * down and came back up on the same element), so releasing a drag never also toggles the panel.
   */
  let dragOrigin: { pointerId: number; startX: number; startY: number; rootLeft: number; rootTop: number } | null =
    null;
  let dragged = false;

  toggle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const rect = root.getBoundingClientRect();
    dragOrigin = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, rootLeft: rect.left, rootTop: rect.top };
    dragged = false;
    toggle.setPointerCapture(event.pointerId);
  });

  toggle.addEventListener("pointermove", (event) => {
    if (!dragOrigin || event.pointerId !== dragOrigin.pointerId) return;
    const dx = event.clientX - dragOrigin.startX;
    const dy = event.clientY - dragOrigin.startY;
    // The threshold decision is `exceedsDragThreshold` (`./geometry.ts`, pure, tested there).
    if (!dragged && !exceedsDragThreshold(dx, dy, CLICK_VS_DRAG_THRESHOLD_PX)) return;
    dragged = true;
    toggle.setAttribute("data-dragging", "");
    place(dragOrigin.rootLeft + dx, dragOrigin.rootTop + dy);
  });

  function endDrag(event: PointerEvent): void {
    if (!dragOrigin || event.pointerId !== dragOrigin.pointerId) return;
    toggle.releasePointerCapture(event.pointerId);
    toggle.removeAttribute("data-dragging");
    if (dragged) {
      const rect = root.getBoundingClientRect();
      savePosition({ left: rect.left, top: rect.top });
    }
    dragOrigin = null;
  }
  toggle.addEventListener("pointerup", endDrag);
  toggle.addEventListener("pointercancel", endDrag);

  toggle.addEventListener("click", (event) => {
    if (dragged) {
      // The click that follows a drag's pointerup: real, but not what a reader meant.
      event.preventDefault();
      dragged = false;
      return;
    }
    setPanelOpen(panel.hidden);
    try {
      if (panel.hidden) localStorage.removeItem(PANEL_OPEN_KEY);
      else localStorage.setItem(PANEL_OPEN_KEY, "1");
    } catch {
      /* private mode. The panel just opens closed again next time */
    }
  });

  return {
    unmount(): void {
      hitAreaOverlay.stop();
      motionSlowMo.stop();
      focusOrderOverlay.stop();
      fpsMeter.stop();
      host.remove();
    },
  };
}
