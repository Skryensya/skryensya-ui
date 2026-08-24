/*
 * FOCUS ORDER — a number badge per focusable element, in DOCUMENT order.
 *
 * Real tab order is DOM order EXCEPT for a positive `tabindex`, which jumps the element ahead
 * regardless of where it sits in the markup. This design system has no published component that
 * ships a positive `tabindex` (the one deliberate `tabindex="-1"` pattern — a skip link's landing
 * target — is explicitly EXCLUDED below, it is a focus target, never a tab stop) — so CSS counters,
 * which only ever count in document order, give the right answer for everything this system
 * actually renders. A page that hand-authors a positive `tabindex` would see a wrong number here;
 * that is a call this file does not need to get right, because DOM order already matches recommended
 * practice and the number exists to catch OTHER classes of bugs (an element skipped entirely, one
 * included twice, a dialog that should have trapped focus but did not).
 *
 * Pure CSS counters + generated content, the same shape as the density scope's outline+label: no
 * JS measures a position, so nothing here can trail a scroll or resize by a frame, and it costs
 * nothing when the attribute is not set. It is also what lets this work inside a component-preview
 * `srcdoc` iframe for free — the frame clones the parent's stylesheets, where a JS overlay measuring
 * parent-document rects could never annotate a child document's own controls.
 *
 * `::after`, NOT `::before`, and that choice is the whole reason this tool is usable. The state layer
 * (`patterns/state-layer.css`) owns `.sk-interactive::before` — it IS the hover/press/focus tint for
 * every button, tab, menu item and list row in the system. Painting a badge there does not sit on top
 * of that tint, it REPLACES it: measured on /componentes/button, 184 of the 195 rendered focusables on
 * that page carry a state-layer `::before`, so turning this on used to silently kill interaction
 * feedback nearly page-wide — a debug tool breaking the very thing a reader might be inspecting.
 * `::after` is occupied on 75 of the same 195, almost all of them `.sk-button`'s own touch-target
 * expander (`button.css`), which is `content: ""` with no paint of its own: replacing it costs an
 * invisible hit-area extension for as long as the toggle is on, and nothing a reader can see.
 *
 * KNOWN INTERACTION: "Hit areas" (`overlay.ts`) also paints `.sk-interactive::after`. With both
 * toggles on, whichever stylesheet lands later wins the `background`, so badges may show in the
 * hit-area tint instead of amber and buttons stop reporting their expanded touch area. The number
 * itself still reads correctly (nothing else sets `content`), and both tools are single-purpose
 * enough that running them together is rare — left as-is rather than adding cross-tool state.
 */

export const FOCUS_ORDER_ATTR = "data-sk-devtools-focus-order";
const STYLE_ID = "sk-devtools-focus-order-style";

/** Also read by `apps/docs`'s Base.astro, whose early copy of this rule must match exactly. */
export const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
] as const;

function scoped(selectors: readonly string[], suffix: string): string {
  return selectors.map((selector) => `html[${FOCUS_ORDER_ATTR}] ${selector}${suffix}`).join(",\n    ");
}

/**
 * The single source for this rule. `apps/docs`'s `Base.astro` renders it into the `<head>` under the
 * SAME `STYLE_ID` at build time, so a preview iframe cloning that head gets the badges without
 * waiting for this module to load — and `ensureFocusOrderStyleTag()` below then finds that tag and
 * no-ops. Exported as text rather than re-typed there: the two used to be hand-kept copies, with a
 * comment saying so, which is a fork that drifts the first time either side is touched.
 */
export const FOCUS_ORDER_CSS = `
    html[${FOCUS_ORDER_ATTR}] {
      counter-reset: sk-devtools-focus-order;
    }
    ${scoped(FOCUSABLE_SELECTORS, "")} {
      position: relative;
      counter-increment: sk-devtools-focus-order;
    }
    ${scoped(FOCUSABLE_SELECTORS, "::after")} {
      content: counter(sk-devtools-focus-order);
      position: absolute;
      /*
       * INSET, not hung off the corner at -8px. A badge outside its element's box is clipped away
       * entirely by any ancestor that scrolls or hides its overflow — measured on a single docs page,
       * 11 focusables sit inside one — and a number you cannot see is the one failure this tool
       * cannot afford. Sitting just inside the corner costs a few pixels of the control's own face
       * and is visible everywhere.
       */
      inset-block-start: 0;
      inset-inline-start: 0;
      /*
       * Both far edges released explicitly. ".sk-button::after" — the pseudo this badge borrows — is
       * a touch-target expander that sets the SHORTHANDS "inset-block" and "inset-inline", so it has
       * already pinned all four sides. Setting only the two start edges leaves its end edges in
       * force, and a box pinned left AND right stretches: measured, every button's badge spanned the
       * control's full width as one long amber bar. "auto" hands sizing back to the content.
       *
       * (No backticks in any comment inside this string: it is a template literal, and one would
       * end it — the same trap this repo's fullscreen-preview page documents for its own srcdoc.)
       */
      inset-block-end: auto;
      inset-inline-end: auto;
      inline-size: auto;
      min-inline-size: 16px;
      block-size: 16px;
      padding: 0 3px;
      border-radius: 999px;
      background: #f59e0b;
      color: #1c1917;
      /* The badge lands on whatever the page happens to paint underneath — a white card, a filled
       * primary button, a dark code block. A hairline ring keeps its edge findable on all of them
       * without needing to know which. */
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
      font: 700 10px/16px ui-monospace, "SF Mono", monospace;
      text-align: center;
      z-index: 2147483000;
      pointer-events: none;
    }
  `;

export function ensureFocusOrderStyleTag(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = FOCUS_ORDER_CSS;
  document.head.appendChild(style);
}

export function createFocusOrderOverlay() {
  ensureFocusOrderStyleTag();
  return {
    start(): void {
      document.documentElement.setAttribute(FOCUS_ORDER_ATTR, "");
    },
    stop(): void {
      document.documentElement.removeAttribute(FOCUS_ORDER_ATTR);
    },
  };
}
