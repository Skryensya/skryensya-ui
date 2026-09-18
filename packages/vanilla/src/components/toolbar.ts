import { resolveToolbarKey, toolbarAttrs } from "@skryensya/core/toolbar";
import { applyToolbarTabStop, toolbarStopOf, toolbarStops } from "@skryensya/core/toolbar-dom";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * TOOLBAR: one tab stop and arrow keys between controls, the APG toolbar pattern.
 *
 * What counts as a stop (a nested composite such as Segmented or Tabs is ONE) is `toolbarStops`
 * in core, shared with React. The roving tabindex is re-applied on every `focusin` rather than only
 * at mount, so controls a script adds later (the Editor builds its buttons after mounting) fall
 * into line the first time focus enters the bar.
 */
function connect(root: HTMLElement): () => void {
  const orientation = root.dataset.orientation === "vertical" ? "vertical" : "horizontal";
  root.setAttribute("role", "toolbar");
  root.setAttribute("aria-orientation", orientation);
  const loopFocus = root.dataset.loopFocus !== "false";

  applyToolbarTabStop(toolbarStops(root), undefined);

  const onFocusIn = (event: FocusEvent) => {
    const stops = toolbarStops(root);
    const stop = toolbarStopOf(stops, event.target as Element);
    if (stop) applyToolbarTabStop(stops, stop);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    // A composite child (Segmented, Tabs) that already moved focus itself calls
    // preventDefault() before this listener sees the bubbled event; skip so its own arrow-key
    // handling isn't re-applied a second time by the ancestor toolbar.
    if (event.defaultPrevented) return;
    const stops = toolbarStops(root);
    const current = stops.indexOf(toolbarStopOf(stops, document.activeElement) as HTMLElement);
    const action = resolveToolbarKey({
      key: event.key,
      currentIndex: current,
      itemCount: stops.length,
      orientation,
      loopFocus,
    });
    if (action.kind === "none") return;
    event.preventDefault();
    const next = stops[action.index];
    if (!next) return;
    applyToolbarTabStop(stops, next);
    next.focus();
  };

  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("keydown", onKeyDown);
  return () => {
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("keydown", onKeyDown);
  };
}

export const mountToolbar = createConnectMount({
  key: "toolbar",
  rootSelector: rootSelectorFor(toolbarAttrs),
  connect,
});
