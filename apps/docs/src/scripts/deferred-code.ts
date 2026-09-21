/*
 * HYDRATES `DeferredCode.astro`'s parked content the moment its panel becomes visible.
 *
 * WHAT COUNTS AS VISIBLE is `offsetParent !== null`, which is false for anything inside a
 * `display: none` ancestor and true as soon as that ancestor is shown. That one test covers every
 * way this site hides a panel  -  a tab that is not current, the binding half nobody picked, a source
 * tab behind another  -  without this module having to know about any of them.
 *
 * WHEN TO LOOK, rather than an observer per wrapper. `display: none` gives an element no box, so
 * IntersectionObserver never fires for one; a MutationObserver would have to watch attributes and
 * classes across the whole document to catch a panel opening. Both cost more than the thing they
 * are guarding. Instead this listens for the handful of events that reveal anything on a component
 * page, and after each one sweeps for wrappers that are now visible. A sweep is one
 * `querySelectorAll` over a handful of nodes; the events are all reader actions.
 */
import { initCopyButtons } from "./copy-button.js";

const WRAPPER = "[data-sk-deferred-code]:not([data-sk-deferred-ready])";

/** Reveal events: the tab strip, the shared binding preference, and Vaul opening a drawer. */
const REVEALS = ["sk:tabsvaluechange", "sk:segmentedvaluechange", "sk:vaulopenchange", "sk:componentpreviewbindingchange"];

let pending = false;

function hydrate(wrapper: HTMLElement): void {
  const template = wrapper.querySelector("template[data-sk-deferred-source]");
  if (!(template instanceof HTMLTemplateElement)) return;
  wrapper.setAttribute("data-sk-deferred-ready", "");
  wrapper.append(template.content.cloneNode(true));
}

export function sweepDeferredCode(): void {
  const parked = [...document.querySelectorAll<HTMLElement>(WRAPPER)];
  if (!parked.length) return;

  const woken = parked.filter((w) => w.offsetParent !== null);
  if (!woken.length) return;
  for (const wrapper of woken) hydrate(wrapper);

  /*
   * The clones carry CodePreview roots and CopyButtons that no enhancer has seen: they were not in
   * the document when the page mounted. Both are idempotent and find their own roots, so re-running
   * them adopts the new nodes and leaves every other instance alone.
   */
  void import("@skryensya/vanilla/code-preview").then(({ mountCodePreview }) => mountCodePreview());
  initCopyButtons();
}

/* Reveals arrive in bursts (a tab change moves a panel, a binding change moves several), so the
   sweep is coalesced to one per frame rather than run per event. */
function scheduleSweep(): void {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    sweepDeferredCode();
  });
}

let bound = false;

export function initDeferredCode(): void {
  /* Anything visible at load is hydrated now: a wrapper on a panel that happens to be open is a
     compose-time mistake rather than a state, and it must not wait for an event that never comes. */
  sweepDeferredCode();

  if (bound) return;
  bound = true;
  for (const type of REVEALS) document.addEventListener(type, scheduleSweep, { passive: true });
}
