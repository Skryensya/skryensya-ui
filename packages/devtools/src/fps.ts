/*
 * FPS / FRAME-TIME METER — reads the TOP document's own paint rate, not each preview iframe's.
 *
 * Every other check in this panel is a stylesheet rule mirrored into preview iframes by attribute
 * (see `component-preview-frame.ts`'s `rootAttributes`), because painting a REAL element is cheap
 * and correct wherever the attribute lands. A frame-rate reading is different: it is a measurement
 * of ONE document's own compositor, and the number a reader actually wants is "is the page I'm
 * looking at janky right now" — the top document, where the panel itself lives — not an average
 * blended across a dozen sandboxed demo iframes it would take a second measurement loop per frame to
 * even collect. Reading just this document keeps the cost to one `requestAnimationFrame` callback,
 * the same loop already idle whenever the meter is off.
 *
 * THE BADGE IS A REAL LIGHT-DOM ELEMENT, appended to `document.body` — NOT rendered inside the
 * panel's own shadow root the way the checkbox rows are. The panel is a closed affordance (a reader
 * opens it to flip a check, then it is out of the way again); a running frame-rate reading is the
 * opposite, something to glance at continuously while the panel stays shut, so it needs to survive
 * outside it and be reachable by a plain `document.querySelector` / screenshot / recording tool
 * without piercing a shadow boundary first.
 */

const BADGE_ID = "sk-devtools-fps-badge";
const STYLE_ID = "sk-devtools-fps-style";

function ensureFpsStyleTag(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${BADGE_ID} {
      position: fixed;
      top: 8px;
      left: 8px;
      z-index: 2147483001;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.75);
      color: #4ade80;
      font: 700 11px/1.4 ui-monospace, "SF Mono", monospace;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

export function createFpsMeter() {
  ensureFpsStyleTag();
  let rafId: number | null = null;
  let badge: HTMLDivElement | null = null;

  /** Smoothed over ~250ms windows, not once a frame — a per-frame delta swings ±dozens of fps on a
   *  single hitch and would read as noise, not a signal. */
  function tick(now: number): void {
    frames += 1;
    const elapsed = now - windowStart;
    if (elapsed >= 250) {
      if (badge) badge.textContent = `${Math.round((frames * 1000) / elapsed)} fps`;
      frames = 0;
      windowStart = now;
    }
    rafId = requestAnimationFrame(tick);
  }

  let frames = 0;
  let windowStart = 0;

  return {
    start(): void {
      if (badge) return;
      badge = document.createElement("div");
      badge.id = BADGE_ID;
      badge.textContent = "… fps";
      document.body.appendChild(badge);
      frames = 0;
      windowStart = performance.now();
      rafId = requestAnimationFrame(tick);
    },
    stop(): void {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      badge?.remove();
      badge = null;
    },
  };
}
