/*
 * A relative path into `@skryensya/core`'s own file tree, not its published `?raw` specifier: Vite's
 * resolver does not consult the package's wildcarded `exports` map (`"./components/*"` etc.) for a
 * `?raw`-suffixed request, and `@skryensya/core/components/button.css?raw` 404s as a result — the
 * same reason `apps/docs`'s own source-viewer pages reach around the exports map with a path alias
 * for this exact query shape. `@skryensya/core` is still the declared dependency (package.json); this
 * only names where inside it the file actually lives.
 */
import buttonCss from "../../core/css/components/button.css?raw";
import checkboxCss from "../../core/css/components/checkbox.css?raw";
import iconCss from "../../core/css/patterns/icon.css?raw";
import stateLayerCss from "../../core/css/patterns/state-layer.css?raw";
import { createHitAreaOverlay } from "./overlay";

/*
 * REAL COMPONENTS, not hand-rolled chrome: the toggle is a real `sk-button` and the "Hit areas"
 * control a real `sk-checkbox` (markup lifted verbatim from `validate_ui` against their published
 * contracts), with the actual published stylesheets injected as text into this shadow root. A tool
 * for inspecting the design system should look like it, and it means this file owns none of the
 * hover/press/focus states or the checked/indeterminate visuals — the same CSS every consumer gets
 * already owns all of that.
 *
 * `:host { all: initial }` plus a shadow root is the isolation story on top of that: nothing this
 * stylesheet declares can leak onto the host page, and nothing the host page declares — resets, a
 * hostile `*` rule — can reach in here either. Custom properties (`--color-*`, `--size-*`, the
 * current density/contrast/scheme) still cross the shadow boundary by inheritance from the host
 * element's own computed style, which is what lets the real component CSS resolve correctly without
 * this file re-declaring a single token.
 */
const LAYOUT_STYLES = `
  :host { all: initial; }
  * { box-sizing: border-box; }
  .root {
    position: fixed;
    z-index: 2147483001;
    font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
    padding: 10px 12px;
    box-shadow: var(--elevation-raised, 0 8px 24px rgba(0, 0, 0, 0.4));
  }
  .panel[data-edge="bottom"] { top: calc(100% + 8px); }
  .panel[data-edge="top"] { bottom: calc(100% + 8px); }
  .panel[hidden] { display: none; }
  .title {
    margin: 0 0 8px;
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.6;
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
    /* private mode, quota exceeded — the position just does not survive reload */
  }
}

/** Keeps a `position: fixed` box fully inside the viewport after a drag or a resize. */
function clamp(position: SavedPosition, size: { width: number; height: number }): SavedPosition {
  const maxLeft = Math.max(0, window.innerWidth - size.width);
  const maxTop = Math.max(0, window.innerHeight - size.height);
  return { left: Math.min(Math.max(0, position.left), maxLeft), top: Math.min(Math.max(0, position.top), maxTop) };
}

export type DebugPanelHandle = { unmount: () => void };
export type DebugPanelOptions = { toggleLabel?: string };

/**
 * Mounts a small, self-contained debug overlay: a draggable toggle button and a panel with the
 * available checks. The only check today is "Hit areas" (see `overlay.ts`); the panel is built so
 * a second one is another block appended to it, not a rewrite.
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
  toggle.textContent = "\u{1F41E}"; // 🐞, decorative but self-explanatory as a debug marker
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

  const hitAreaLabel = document.createElement("label");
  hitAreaLabel.className = "sk-checkbox";
  const hitAreaCheckbox = document.createElement("input");
  hitAreaCheckbox.className = "sk-checkbox__input";
  hitAreaCheckbox.type = "checkbox";
  const hitAreaControl = document.createElement("span");
  hitAreaControl.className = "sk-checkbox__control sk-interactive";
  hitAreaControl.setAttribute("aria-hidden", "true");
  /* Only the "checked" glyph is drawn: this checkbox never goes indeterminate, so that state's icon
   * would never paint. The empty sibling still has to exist — checkbox.css positions both by part
   * name, and the CSS drives visibility off `:checked`/`:indeterminate` on the real input, not off
   * whether this file bothered to fill each one in. */
  hitAreaControl.innerHTML = `
    <span class="sk-checkbox__indicator" data-state="checked">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5"></path></svg>
    </span>
    <span class="sk-checkbox__indicator" data-state="indeterminate"></span>
  `;
  const hitAreaText = document.createElement("span");
  hitAreaText.className = "sk-checkbox__label";
  hitAreaText.textContent = "Hit areas";
  hitAreaLabel.append(hitAreaCheckbox, hitAreaControl, hitAreaText);
  panel.appendChild(hitAreaLabel);

  const hitAreaOverlay = createHitAreaOverlay();
  hitAreaCheckbox.addEventListener("change", () => {
    if (hitAreaCheckbox.checked) hitAreaOverlay.start();
    else hitAreaOverlay.stop();
  });

  document.body.appendChild(host);

  /*
   * POSITIONING. Anchored by `left`/`top` (never `right`/`bottom`): a drag reads the pointer's own
   * viewport coordinates, and computing a `right`/`bottom` offset from those would mean re-deriving
   * them from `innerWidth`/`innerHeight` on every move for no benefit — `left`/`top` is what the
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
   * button's native `click` handler normally — `pointerdown` never calls `preventDefault()` for
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
    if (!dragged && Math.hypot(dx, dy) < CLICK_VS_DRAG_THRESHOLD_PX) return;
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
    const wasHidden = panel.hidden;
    panel.hidden = !wasHidden;
    toggle.setAttribute("aria-expanded", String(wasHidden));
    if (wasHidden) {
      // Open UPWARD by default; flip below only when the panel would not fit above the button.
      const spaceAbove = toggle.getBoundingClientRect().top;
      panel.dataset.edge = spaceAbove < 220 ? "bottom" : "top";
    }
  });

  return {
    unmount(): void {
      hitAreaOverlay.stop();
      host.remove();
    },
  };
}
