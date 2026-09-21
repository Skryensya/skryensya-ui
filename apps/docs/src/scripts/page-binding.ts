/*
 * THE COMPONENT PAGE'S ONE Vanilla | React SWITCH, in the masthead.
 *
 * There is exactly one binding preference on this site: `data-sk-component-preview-pref` on
 * `<html>`, seeded before first paint by `Base.astro` and persisted to localStorage by
 * `docs-binding.ts`, which listens for `componentPreviewBindingChangeEvent`. Every ComponentPreview
 * READS that preference and shows the matching half; none of them publishes onto it any more, because
 * none of them carries a switch. This is the only thing on a component page that writes it, which is
 * the point: the reader is asked once, at the top, rather than by each of a dozen demos and again by
 * the Installation tab.
 *
 * WHICH HALF IS VISIBLE IS CSS, not this file: `site.css` for the Installation tab's two halves,
 * `component-preview.css` for each preview's. Both halves
 * are in the document either way, so switching costs no request, the hidden half is still reachable
 * by the browser's own find-in-page, and there is no state here that could disagree with the
 * attribute the stylesheet is reading.
 */
import { segmentedEvents } from "@skryensya/core/segmented";
import {
  componentPreviewAttrs,
  componentPreviewBindingChangeEvent,
} from "@skryensya/core/component-preview";

type Binding = "vanilla" | "react";

const TABS = "[data-sk-page-binding-tabs]";

const isBinding = (value: unknown): value is Binding => value === "vanilla" || value === "react";

let bound = false;

/*
 * Move the widget from the OUTSIDE by clicking the option a reader would have clicked, the same
 * lever `component-preview.ts`'s own `selectSegmentedOption` uses and for the same reason: Segmented
 * owns `aria-checked`, the sliding indicator and the roving tabindex, and exposes no setter. The
 * guard is what keeps the instance that STARTED a change from re-clicking its own current option and
 * dispatching a second valueChange inside the first.
 */
function select(tabs: HTMLElement, value: Binding): void {
  if (tabs.getAttribute("data-value") === value) return;
  tabs.querySelector<HTMLElement>(`[data-sk-segmented-option][data-value="${value}"]`)?.click();
}

export function initPageBinding(): void {
  const tabs = document.querySelector<HTMLElement>(TABS);
  if (!tabs) return;

  /* Adopt the preference the head script already wrote, in case this page was restored from the
     back/forward cache with a value another tab has since changed. */
  const pref = document.documentElement.getAttribute(componentPreviewAttrs.documentBinding);
  if (isBinding(pref)) select(tabs, pref);

  if (bound) return;
  bound = true;

  /* The reader used the switch. */
  document.addEventListener(segmentedEvents.valueChange, (event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.matches?.(TABS)) return;
    const value = (event as CustomEvent<{ value: string }>).detail?.value;
    if (!isBinding(value)) return;
    if (document.documentElement.getAttribute(componentPreviewAttrs.documentBinding) === value) return;

    document.documentElement.setAttribute(componentPreviewAttrs.documentBinding, value);
    document.dispatchEvent(
      new CustomEvent(componentPreviewBindingChangeEvent, { detail: { value } }),
    );
  });

  /*
   * And a last listener for anything else that publishes onto the wire  -  another tab's storage
   * sync, or a consumer page that still ships a per-preview switch. Nothing on a component page does
   * today, which is why this is cheap to keep: it is what stops this switch from being the one
   * widget that can fall out of step with the preference it writes.
   */
  document.addEventListener(componentPreviewBindingChangeEvent, (event) => {
    const value = (event as CustomEvent<{ value: string }>).detail?.value;
    const current = document.querySelector<HTMLElement>(TABS);
    if (current && isBinding(value)) select(current, value);
  });
}
