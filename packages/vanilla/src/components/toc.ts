import { tocAttrs } from "@skryensya/core/toc";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${tocAttrs.root}]`;

type Cleanup = () => void;

/*
 * THE SCROLL-SPY IS ALL THAT IS LEFT HERE. This used to also own a `matchMedia` that pinned the
 * `<details>` open and took its `<summary>` out of the tab order past `wide` — machinery that existed
 * only because the component shipped two shapes and JavaScript had to pick one per breakpoint. The
 * index is always open now (`toc.ts`), so there is no state to sync and nothing to decide: what is
 * left is the one thing that is genuinely behaviour rather than appearance, moving `aria-current`
 * as the reader scrolls, which no stylesheet can express.
 */

/** Marks the section the reader is in. A no-op below two links: nothing to "spy" on one destination. */
function connectSpy(root: HTMLElement): Cleanup {
  const links = [...root.querySelectorAll<HTMLAnchorElement>("a[href^='#']")];
  if (links.length < 2) return () => {};

  const byId = new Map(links.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
  const headings = [...byId.keys()]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  if (headings.length < 2) return () => {};

  /* The band is the top slice of the viewport under a sticky header: a heading is "current" from
   * when it reaches that band until the next one does. Marking every heading merely on screen would
   * light up half the list on a short page, so the FIRST one in document order inside the band wins. */
  const onScreen = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target.id);
        else onScreen.delete(entry.target.id);
      }

      const current = headings.find((heading) => onScreen.has(heading.id))?.id;

      /* Nothing in the band means "between sections" or at either end of the page. That is not
       * "nowhere", so the last answer stands rather than being cleared. */
      if (!current) return;

      for (const [id, link] of byId) {
        if (id === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    },
    { rootMargin: "-72px 0px -70% 0px" },
  );

  for (const heading of headings) observer.observe(heading);
  return () => observer.disconnect();
}

/** Binds one authored Toc: the scroll-spy that marks `aria-current`. */
export function connectToc(root: HTMLElement): Cleanup {
  return connectSpy(root);
}

export const mountToc = createConnectMount({
  key: "toc",
  rootSelector,
  connect: connectToc,
});
