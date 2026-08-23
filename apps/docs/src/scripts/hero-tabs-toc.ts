/*
 * The reactive half of the hero-tabs ToC: rebuilding the list and its scroll-spy on every tab
 * switch. The default (`usage`) list is compiled with the page (`indexHeroTabPanel`); an
 * `is:inline` script in `Base.astro` only rewrites it for a `?tab=` deep link. This module only
 * has to be ready by the reader's FIRST click.
 */
import { destroyMount } from "@skryensya/vanilla/runtime";
import { connectToc } from "@skryensya/vanilla/toc";
import { buildHeroTabsToc, panelForHeroTab } from "./hero-tabs-toc-seed";

export function initHeroTabsToc(): void {
  const heroTabs = document.querySelector(".docs-component-hero-tabs");
  const tocRoot = document.querySelector<HTMLElement>("[data-sk-toc]");
  if (!heroTabs || !tocRoot) return;
  const tabsRoot = heroTabs.closest<HTMLElement>("[data-sk-tabs]");
  if (!tabsRoot) return;

  /*
   * The spy that lights up `aria-current` (`connectToc`, `@skryensya/vanilla/toc`) binds to
   * whatever links the `<ul>` holds the moment it connects; it never re-scans on its own. A tab
   * switch replaces those links wholesale, so the OLD spy has to be torn down and a fresh one
   * bound to the new list, or it keeps watching headings that are no longer even in the visible
   * panel. The site's own auto-init already mounted an instance against the SEEDED list (the
   * `is:inline` fill in `Base.astro` ran during parsing, long before this module even loaded), so
   * the very FIRST switch tears that one down (`destroyMount`, since this script never owned that
   * one's cleanup); every switch after that owns its own, returned by `connectToc` itself.
   */
  let disposeSpy: (() => void) | undefined;
  let swapGeneration = 0;

  const applyPanel = (panel: HTMLElement) => {
    buildHeroTabsToc(tocRoot, panel);
    if (disposeSpy) disposeSpy();
    else destroyMount(tocRoot);
    disposeSpy = connectToc(tocRoot);
  };

  tabsRoot.addEventListener("sk-value-change", (event) => {
    const value = (event as CustomEvent<{ value: string }>).detail?.value;
    const next = value ? panelForHeroTab(tabsRoot, value) : null;
    if (!next) return;
    const generation = ++swapGeneration;

    void (async () => {
      if (!prefersReducedMotion() && getComputedStyle(tocRoot).opacity !== "0") {
        tocRoot.setAttribute("data-toc-swap", "");
        await whenOpacitySettles(tocRoot);
      }
      if (generation !== swapGeneration) return;
      applyPanel(next);
      tocRoot.removeAttribute("data-toc-swap");
    })();
  });
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Resolves on the root's opacity transition, or shortly after if the event never fires. */
function whenOpacitySettles(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      element.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
      resolve();
    };
    const onEnd = (event: TransitionEvent) => {
      if (event.target === element && event.propertyName === "opacity") done();
    };
    element.addEventListener("transitionend", onEnd);
    const timer = window.setTimeout(done, 250);
  });
}
