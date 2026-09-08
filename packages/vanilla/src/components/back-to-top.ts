import {
  backToTopAttrs,
  backToTopParseThreshold,
  backToTopScrollBehavior,
  backToTopShouldReveal,
} from "@skryensya/core/back-to-top";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${backToTopAttrs.root}]`;

type Cleanup = () => void;

/*
 * BACK TO TOP, the DOM shell around `@skryensya/core/back-to-top`'s two pure decisions.
 *
 * The enhancer owns exactly the parts that touch the platform: which scroller to watch, toggling the
 * `hidden` attribute as it crosses the threshold (rAF-throttled, one write per frame), and the
 * `scrollTo` on click with an optional focus move after it. "Is it past the threshold" and "does the
 * scroll animate" are the pure module's; this file measures and acts.
 */
export function connectBackToTop(root: HTMLElement): Cleanup {
  const threshold = backToTopParseThreshold(root.getAttribute("data-threshold"));

  const selector = root.getAttribute("data-scroller");
  /* A named scroller that is not on the page yet is not an error worth throwing over - fall back to
     the window, the same scroller the un-configured control watches. */
  const scroller: Window | HTMLElement =
    (selector && document.querySelector<HTMLElement>(selector)) || window;
  const isWindow = scroller === window;

  const readTop = (): number =>
    isWindow
      ? window.scrollY || document.documentElement.scrollTop || 0
      : (scroller as HTMLElement).scrollTop;

  let frame = 0;
  const sync = (): void => {
    frame = 0;
    root.toggleAttribute("hidden", !backToTopShouldReveal(readTop(), threshold));
  };
  const onScroll = (): void => {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onClick = (): void => {
    const behavior = backToTopScrollBehavior(reducedMotion.matches);
    const options: ScrollToOptions = { top: 0, left: 0, behavior };
    if (isWindow) window.scrollTo(options);
    else (scroller as HTMLElement).scrollTo(options);

    /* The optional focus move: without it the reader's focus is left on a control that is about to
       hide itself. With `target`, the next Tab continues from the top instead. `preventScroll` so
       this does not start a second scroll racing the one above. */
    const targetSelector = root.getAttribute("data-target");
    if (!targetSelector) return;
    const destination = document.querySelector<HTMLElement>(targetSelector);
    destination?.focus({ preventScroll: true });
  };

  /* `Window` and `HTMLElement` share no single `addEventListener` overload the compiler will accept
     off the union, but both are `EventTarget`, which has the one signature this needs. */
  const scrollTarget: EventTarget = scroller;
  scrollTarget.addEventListener("scroll", onScroll, { passive: true });
  root.addEventListener("click", onClick);
  sync();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    scrollTarget.removeEventListener("scroll", onScroll);
    root.removeEventListener("click", onClick);
  };
}

export const mountBackToTop = createConnectMount({
  key: "back-to-top",
  rootSelector,
  connect: connectBackToTop,
});
