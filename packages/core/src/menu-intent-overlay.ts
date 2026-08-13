import { menuParts } from "./menu.js";

/*
 * SEEING @zag-js/menu's safety triangle, not implementing one.
 *
 * The machine already tracks this itself: while a submenu is open, `context.intentPolygon` is a
 * live polygon built from the submenu's real `DOMRect` and its resolved placement (so it is
 * already correct for left/right, RTL, and a flip), and `context.pointerRoutingMode` is
 * "locked" exactly while the pointer is inside it — the state that keeps a diagonal crossing over
 * a sibling item from stealing highlight or closing the submenu. Both are PUBLIC context keys
 * (`@zag-js/menu`'s `MenuSchema["context"]`), read the same way `menu.connect()` itself reads
 * `highlightedValue` or `open`.
 *
 * This module only draws what is already there: one reusable SVG polygon plus a status badge,
 * updated imperatively (`update()`) whenever a binding's machine subscription fires. It never
 * computes geometry and never decides anything about routing; it is output, not logic, which is
 * why it has no dependency on either binding and no test surface beyond "does the DOM it produces
 * match the numbers it was given."
 */

export type IntentPoint = { x: number; y: number };

export interface IntentOverlayUpdate {
  /** `context.get("intentPolygon")` from the SUBMENU's own service. Absent or empty hides the overlay. */
  polygon: readonly IntentPoint[] | null | undefined;
  /** `context.get("pointerRoutingMode") === "locked"` from the PARENT's service. */
  locked: boolean;
  /** Status text, e.g. "Pointer routing". */
  label: string;
  lockedText: string;
  freeText: string;
}

export interface IntentOverlayHandle {
  update(next: IntentOverlayUpdate): void;
  destroy(): void;
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * One handle per open submenu. Cheap to create (three elements, no listeners of its own — it never
 * reads the pointer directly, only what the machine already computed), so a binding creates one
 * when a submenu with `debugSafetyTriangle` opens and destroys it when that submenu closes.
 */
export function createIntentOverlay(doc: Document = document): IntentOverlayHandle {
  let svg: SVGSVGElement | null = null;
  let polygonEl: SVGPolygonElement | null = null;
  let badge: HTMLDivElement | null = null;
  let dot: HTMLSpanElement | null = null;
  let text: HTMLSpanElement | null = null;

  function mount() {
    if (svg) return;
    svg = doc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", menuParts.intentOverlay);
    svg.setAttribute("aria-hidden", "true");
    polygonEl = doc.createElementNS(SVG_NS, "polygon");
    polygonEl.setAttribute("class", menuParts.intentPolygon);
    svg.appendChild(polygonEl);
    doc.body.appendChild(svg);

    badge = doc.createElement("div");
    badge.setAttribute("class", menuParts.intentBadge);
    dot = doc.createElement("span");
    dot.setAttribute("class", menuParts.intentBadgeDot);
    text = doc.createElement("span");
    badge.append(dot, text);
    doc.body.appendChild(badge);
  }

  function update(next: IntentOverlayUpdate) {
    if (!next.polygon || next.polygon.length === 0) {
      svg?.remove();
      svg = null;
      badge?.remove();
      badge = null;
      return;
    }
    mount();
    const locked = String(next.locked);
    polygonEl!.setAttribute("points", next.polygon.map((p) => `${p.x},${p.y}`).join(" "));
    polygonEl!.setAttribute("data-locked", locked);
    badge!.setAttribute("data-locked", locked);
    text!.textContent = `${next.label}: ${next.locked ? next.lockedText : next.freeText}`;
  }

  function destroy() {
    svg?.remove();
    badge?.remove();
    svg = polygonEl = null;
    badge = dot = text = null;
  }

  return { update, destroy };
}
