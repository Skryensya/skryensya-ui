import { createConnectMount } from "../runtime/svelte-hydrate.js";

const controlsSelector =
  "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])";
function connect(root: HTMLElement): () => void {
  const orientation =
    root.dataset.orientation === "vertical" ? "vertical" : "horizontal";
  root.setAttribute("role", "toolbar");
  root.setAttribute("aria-orientation", orientation);
  const onKeyDown = (event: KeyboardEvent) => {
    const previous = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    if (![previous, next, "Home", "End"].includes(event.key)) return;
    const controls = Array.from(
      root.querySelectorAll<HTMLElement>(controlsSelector),
    );
    if (!controls.length) return;
    const current = controls.indexOf(document.activeElement as HTMLElement);
    let index =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? controls.length - 1
          : current + (event.key === next ? 1 : -1);
    if (root.hasAttribute("data-loop-focus"))
      index = (index + controls.length) % controls.length;
    else index = Math.max(0, Math.min(index, controls.length - 1));
    event.preventDefault();
    controls[index]?.focus();
  };
  root.addEventListener("keydown", onKeyDown);
  return () => root.removeEventListener("keydown", onKeyDown);
}
export const mountToolbar = createConnectMount({
  key: "toolbar",
  rootSelector: "[data-sk-toolbar]",
  connect,
});
