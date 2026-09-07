/*
 * The browser's own `:focus-visible` heuristic always matches a text-editing surface
 * (`[contenteditable]`, `<input>`, `<textarea>`) on a plain pointer click, not only on keyboard
 * navigation — unlike a button, where a click never triggers `:focus-visible`. That is a
 * deliberate accessibility default (seeing where you landed matters even for a mouse user), and
 * it is why `.sk-input:focus-visible` (`input.css`) rings a real Textarea on click too. This
 * component's own content surface asked to differ from that sitewide default: no ring on a plain
 * click, only when focus arrives via keyboard. No CSS pseudo-class alone can express that
 * distinction, so this tracks it the same way a `:focus-visible` polyfill would — was the element
 * that just received focus the same one a `pointerdown` fired on, immediately before.
 */

/**
 * Marks `target` (inside `root`) with `data-focus-pointer` for exactly as long as its CURRENT
 * focus was caused by a pointer press rather than keyboard navigation — set on `focusin` only when
 * a `pointerdown` on that same element was the most recent pointer activity, cleared on
 * `focusout`. Typing afterward never flips it back: only a focus change can, so a reader who
 * clicks in and starts typing does not see a ring appear mid-keystroke.
 */
export function suppressPointerFocusRing(root: HTMLElement, targetSelector: string): () => void {
  let pointerTarget: EventTarget | null = null;

  const onPointerDown = (event: PointerEvent) => {
    const el = event.target instanceof Element ? event.target.closest(targetSelector) : null;
    pointerTarget = el;
  };

  const onFocusIn = (event: FocusEvent) => {
    const target = event.target;
    if (target instanceof Element && target === pointerTarget) {
      target.setAttribute("data-focus-pointer", "");
    }
  };

  const onFocusOut = (event: FocusEvent) => {
    if (event.target instanceof Element) event.target.removeAttribute("data-focus-pointer");
    pointerTarget = null;
  };

  root.addEventListener("pointerdown", onPointerDown, true);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);

  return () => {
    root.removeEventListener("pointerdown", onPointerDown, true);
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("focusout", onFocusOut);
  };
}
