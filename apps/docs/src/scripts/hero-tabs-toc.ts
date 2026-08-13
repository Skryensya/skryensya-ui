/*
 * The reactive half of the hero-tabs ToC (pages piloting `.docs-component-hero-tabs`, now every
 * component page): rebuilding the list and its scroll-spy on every tab switch. The initial fill is
 * an `is:inline` script in `Base.astro`, right after `<Toc>`, which runs during HTML parsing itself
 * — long before this module's own `@skryensya/vanilla` import could resolve. This one only has to
 * be ready by the reader's FIRST click, which is later than first paint by definition.
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
  tabsRoot.addEventListener("sk-value-change", (event) => {
    const value = (event as CustomEvent<{ value: string }>).detail?.value;
    const next = value ? panelForHeroTab(tabsRoot, value) : null;
    if (!next) return;
    buildHeroTabsToc(tocRoot, next);
    if (disposeSpy) disposeSpy();
    else destroyMount(tocRoot);
    disposeSpy = connectToc(tocRoot);
  });
}
