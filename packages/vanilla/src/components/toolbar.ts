import { resolveToolbarKey } from "@skryensya/core/toolbar";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const controlsSelector =
  "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])";

/*
 * A toolbar item can itself be a composite widget (Segmented's radiogroup, Tabs' tablist): it
 * already owns a roving tabindex, so only ONE of its members has tabindex="0" and the rest are
 * "-1". Filtering those out is what makes the composite a single stop for the toolbar's own
 * roving focus, instead of the toolbar visiting every one of its internal options too: the
 * nested-composite pattern from the ARIA APG toolbar practice, not a plain flat button row.
 */
function isStop(element: HTMLElement): boolean {
  return element.getAttribute("tabindex") !== "-1";
}

function connect(root: HTMLElement): () => void {
  const orientation =
    root.dataset.orientation === "vertical" ? "vertical" : "horizontal";
  root.setAttribute("role", "toolbar");
  root.setAttribute("aria-orientation", orientation);
  const onKeyDown = (event: KeyboardEvent) => {
    // A composite child (Segmented, Tabs) that already moved focus itself calls
    // preventDefault() before this listener sees the bubbled event; skip so its own arrow-key
    // handling isn't re-applied a second time by the ancestor toolbar.
    if (event.defaultPrevented) return;
    const controls = Array.from(
      root.querySelectorAll<HTMLElement>(controlsSelector),
    ).filter(isStop);
    const current = controls.indexOf(document.activeElement as HTMLElement);
    const action = resolveToolbarKey({
      key: event.key,
      currentIndex: current,
      itemCount: controls.length,
      orientation,
      loopFocus: root.hasAttribute("data-loop-focus"),
    });
    if (action.kind === "none") return;
    event.preventDefault();
    controls[action.index]?.focus();
  };
  root.addEventListener("keydown", onKeyDown);
  return () => root.removeEventListener("keydown", onKeyDown);
}
export const mountToolbar = createConnectMount({
  key: "toolbar",
  rootSelector: "[data-sk-toolbar]",
  connect,
});
