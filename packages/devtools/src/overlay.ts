/*
 * HIT-AREA TINT. A real stylesheet rule, not a JS-measured/positioned overlay.
 *
 * An earlier version measured every `.sk-interactive` element in JS (`getBoundingClientRect`,
 * `getComputedStyle`) and drew a separately-positioned `<div>` over each one, kept in sync with
 * scroll/resize/mutation through JS listeners. Two real problems came from that: it always trailed
 * the real element by at least one JS tick (visible as lag while scrolling), and it was WRONG for
 * anything that wraps. A link broken across two lines has ONE bounding-box rect in JS, the union of
 * both lines, so the overlay drew one oversized box spanning both instead of two boxes matching what
 * a reader can actually see and click. That is exactly what looked broken for the TOC and the
 * sidebar's component links, which wrap constantly in a narrow rail.
 *
 * This tints the REAL elements instead, with a stylesheet rule scoped behind an attribute so it
 * paints nothing until toggled on. The browser's own renderer keeps it perfectly in sync with
 * scroll, resize and reflow: nothing here ever recomputes a position, and `background-image` on a
 * wrapped inline element already paints PER LINE FRAGMENT natively, which is the correct picture a
 * JS bounding-box rect could never give. Fill only, no outline: a border on every fragment of a
 * multi-line link reads as a grid of boxes, not a tint.
 *
 * The `::after` half only ever paints where a component ALREADY declares one (`content: ""`. See
 * `.sk-button::after` in button.css): the selector is inert everywhere else, so this still needs no
 * per-component list and no JS check for which elements widen their hit area and which do not. The
 * cascade itself is what decides.
 */

/** Also read by `apps/docs`'s `component-preview-frame.ts`, to mirror the same attribute into every
 *  preview `srcdoc` iframe; see this module's own header comment for why that mirroring needs it. */
export const HIT_AREA_ATTR = "data-sk-devtools-hit-areas";
const STYLE_ID = "sk-devtools-hit-area-style";
const TINT = "rgba(236, 72, 153, 0.28)";

/*
 * Called from `createHitAreaOverlay()` below at PANEL MOUNT, not lazily on first `start()`: every
 * component-preview `srcdoc` iframe on this docs site clones the parent's `<head>` stylesheets
 * exactly ONCE, at ITS OWN boot (`cloneParentStyles()`). Some are `loading="lazy"` and boot well
 * after page load, on their own schedule. Injecting this tag as early as the panel itself mounts,
 * rather than waiting for a reader to actually check "Hit areas" first, is what gives even a late,
 * lazily-booting iframe a real chance of catching it in its one clone pass. The RULE itself stays
 * inert until the attribute is set, so being present early costs nothing either way.
 */
export function ensureHitAreaStyleTag(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  // `background-image`, not `background`: a component's own `--sk-*-bg` hook is a `background-color`
  // (or a `background` shorthand further down the cascade), and the shorthand here would clobber it
  // instead of layering over it. A gradient between two identical stops is the standard way to tint
  // without touching whatever color is already there.
  style.textContent = `
    html[${HIT_AREA_ATTR}] .sk-interactive {
      background-image: linear-gradient(${TINT}, ${TINT});
    }
    html[${HIT_AREA_ATTR}] .sk-interactive::after {
      background: ${TINT};
    }
  `;
  document.head.appendChild(style);
}

export function createHitAreaOverlay() {
  ensureHitAreaStyleTag();
  return {
    start(): void {
      document.documentElement.setAttribute(HIT_AREA_ATTR, "");
    },
    stop(): void {
      document.documentElement.removeAttribute(HIT_AREA_ATTR);
    },
  };
}
