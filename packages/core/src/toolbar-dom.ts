/*
 * TOOLBAR, the DOM half both bindings run. Kept out of `toolbar.ts` because that file is a contract
 * the compiler imports, and the compiler has no DOM.
 */
/* ------------------------------------------------------------------------------------------------ *
 * THE ONE TAB STOP. Shared DOM reading, because the rule for what counts as a stop is the part that
 * must never differ between bindings, and it is a question about the DOM.
 * ------------------------------------------------------------------------------------------------ */

/** What the toolbar can move focus to: enabled native controls. */
export const toolbarControlsSelector = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])";

/** Widgets that run their own roving focus. Inside the bar each one is ONE stop (decision 27). */
const compositeSelector = [
  "radiogroup", "tablist", "listbox", "menubar", "grid", "tree", "treegrid",
].map((role) => `[role="${role}"]`).join(",");

/**
 * The toolbar's stops, in document order: every standalone control, and one member per nested
 * composite. That member is the composite's own current stop (`tabindex="0"`), or failing that its
 * checked or selected member, or its first: once the toolbar has parked the composite at `-1`, the
 * checked radio is still the right place to come back to.
 */
export function toolbarStops(root: HTMLElement): HTMLElement[] {
  const stops: HTMLElement[] = [];
  const composites = new Set<Element>();
  for (const control of Array.from(root.querySelectorAll<HTMLElement>(toolbarControlsSelector))) {
    const composite = control.parentElement?.closest(compositeSelector);
    if (!composite || composite === root || !root.contains(composite)) {
      stops.push(control);
      continue;
    }
    if (composites.has(composite)) continue;
    composites.add(composite);
    const members = [...composite.querySelectorAll<HTMLElement>(toolbarControlsSelector)];
    const representative =
      members.find((member) => member.getAttribute("tabindex") === "0") ??
      members.find((member) => member.matches('[aria-checked="true"], [aria-selected="true"]')) ??
      members[0];
    if (representative) stops.push(representative);
  }
  return stops;
}

/** The stop an element belongs to: itself, or the stop standing for the composite it sits in. */
export function toolbarStopOf(stops: readonly HTMLElement[], element: Element | null): HTMLElement | undefined {
  if (!element) return undefined;
  return stops.find((stop) => stop === element || (stop.parentElement?.closest(compositeSelector)?.contains(element) ?? false));
}

/**
 * Roving tabindex: `active` (or the first stop) is the only one Tab reaches. A composite's other
 * members are left as the composite set them; its representative is parked like any other stop.
 */
export function applyToolbarTabStop(stops: readonly HTMLElement[], active: HTMLElement | undefined): void {
  const current = active && stops.includes(active) ? active : stops[0];
  for (const stop of stops) stop.setAttribute("tabindex", stop === current ? "0" : "-1");
}

