import { tocAttrs } from "@skryensya/core/toc";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${tocAttrs.root}]`;

type Cleanup = () => void;

/** Keeps a consumer-declared rail open and inert where its layout has room. */
function connectDisclosure(root: HTMLElement): Cleanup {
  if (!root.hasAttribute("data-sk-toc-rail")) return () => {};

  const disclosure = root.querySelector<HTMLDetailsElement>(
    `[${tocAttrs.disclosure}]`,
  );
  if (!disclosure) return () => {};

  const wide =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--breakpoint-wide")
      .trim() || "72rem";
  const rail = window.matchMedia(`(min-width: ${wide})`);
  const sync = () => {
    disclosure.open = rail.matches;
    const summary = disclosure.querySelector<HTMLElement>("summary");
    if (summary) summary.tabIndex = rail.matches ? -1 : 0;
  };

  sync();
  rail.addEventListener("change", sync);
  return () => rail.removeEventListener("change", sync);
}

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

/** Binds one authored Toc: the disclosure/rail switch and the scroll-spy that marks `aria-current`. */
export function connectToc(root: HTMLElement): Cleanup {
  const disposeDisclosure = connectDisclosure(root);
  const disposeSpy = connectSpy(root);
  return () => {
    disposeDisclosure();
    disposeSpy();
  };
}

export const mountToc = createConnectMount({
  key: "toc",
  rootSelector,
  connect: connectToc,
});
