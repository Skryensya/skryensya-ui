/*
 * HIT-AREA TINT — a real stylesheet rule, not a JS-measured/positioned overlay.
 *
 * An earlier version measured every `.sk-interactive` element in JS (`getBoundingClientRect`,
 * `getComputedStyle`) and drew a separately-positioned `<div>` over each one, kept in sync with
 * scroll/resize/mutation through JS listeners. Two real problems came from that: it always trailed
 * the real element by at least one JS tick (visible as lag while scrolling), and it was WRONG for
 * anything that wraps — a link broken across two lines has ONE bounding-box rect in JS, the union of
 * both lines, so the overlay drew one oversized box spanning both instead of two boxes matching what
 * a reader can actually see and click. That is exactly what looked broken for the TOC and the
 * sidebar's component links, which wrap constantly in a narrow rail.
 *
 * This tints the REAL elements instead, with a stylesheet rule scoped behind an attribute so it
 * paints nothing until toggled on. The browser's own renderer keeps it perfectly in sync with
 * scroll, resize and reflow — nothing here ever recomputes a position — and `outline`/
 * `background-image` on a wrapped inline element already paint PER LINE FRAGMENT natively, which is
 * the correct picture a JS bounding-box rect could never give.
 *
 * The `::after` half only ever paints where a component ALREADY declares one (`content: ""` — see
 * `.sk-button::after` in button.css): the selector is inert everywhere else, so this still needs no
 * per-component list and no JS check for which elements widen their hit area and which do not — the
 * cascade itself is what decides.
 */

const ATTR = "data-sk-devtools-hit-areas";
const STYLE_ID = "sk-devtools-hit-area-style";
const TINT = "rgba(236, 72, 153, 0.28)";
const OUTLINE = "1px solid rgba(236, 72, 153, 0.9)";

function ensureStyleTag(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  // `background-image`, not `background`: a component's own `--sk-*-bg` hook is a `background-color`
  // (or a `background` shorthand further down the cascade), and the shorthand here would clobber it
  // instead of layering over it. A gradient between two identical stops is the standard way to tint
  // without touching whatever color is already there.
  style.textContent = `
    html[${ATTR}] .sk-interactive {
      outline: ${OUTLINE};
      outline-offset: -1px;
      background-image: linear-gradient(${TINT}, ${TINT});
    }
    html[${ATTR}] .sk-interactive::after {
      background: ${TINT};
      outline: ${OUTLINE};
    }
  `;
  document.head.appendChild(style);
}

export function createHitAreaOverlay() {
  return {
    start(): void {
      ensureStyleTag();
      document.documentElement.setAttribute(ATTR, "");
    },
    stop(): void {
      document.documentElement.removeAttribute(ATTR);
    },
  };
}
