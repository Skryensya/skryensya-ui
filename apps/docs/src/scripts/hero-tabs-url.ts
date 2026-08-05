/*
 * THE HERO TAB LIVES IN THE URL, so a reader can link to the tab they are talking about.
 *
 * "Mirá la sección de instalación" is a link to a page plus a sentence telling you what to click
 * once you get there. This makes it just a link: `/componentes/accordion?tab=install` opens on that
 * panel, and every switch rewrites the address bar so whatever is on screen is what gets copied.
 *
 * A QUERY PARAM, NOT THE HASH. The hash is already spoken for on these pages: the ToC rail builds
 * `#heading` links into whichever panel is open (`hero-tabs-toc.ts`), and headings like
 * `#details-nativo` are linked from the prose. Putting the tab there too would mean one slot
 * answering two questions. Kept apart, they compose instead: `?tab=usage#details-nativo` opens the
 * Usage panel AND lands on that heading.
 *
 * SCOPED TO `.docs-component-hero-tabs`, the one tab bar a component page has at its top. Every
 * other `[data-sk-tabs]` on these pages belongs to a ComponentPreview (HTML/JS, one per demo), and
 * there is no single answer to "which preview does `?tab=` mean" — so they stay out of the URL.
 *
 * RUNS BEFORE HYDRATION. `Tabs.svelte` reads the authored `data-value` at mount and hands it to the
 * machine as `defaultValue`, so writing the attribute here is enough to open the right panel: no
 * click to simulate, no switch to watch flash past. That is also why this is imported ahead of
 * `initHeroTabsToc()` in `Base.astro`; that one reads the same attribute to decide which panel's
 * headings to index, and would otherwise build the rail for the wrong one.
 */

/** The address-bar name for "which tab". */
const PARAM = "tab";

const heroTabs = (): HTMLElement | null => {
  const list = document.querySelector(".docs-component-hero-tabs");
  return list?.closest<HTMLElement>("[data-sk-tabs]") ?? null;
};

/** The values this bar actually offers, so a hand-edited `?tab=` cannot open a panel that is not there. */
function offeredValues(root: HTMLElement): Set<string> {
  const triggers = root.querySelectorAll<HTMLElement>("[data-sk-tabs-trigger]");
  return new Set(
    [...triggers]
      .filter((trigger) => !trigger.hasAttribute("data-disabled") && trigger.getAttribute("aria-disabled") !== "true")
      .map((trigger) => trigger.getAttribute("data-value") ?? "")
      .filter(Boolean),
  );
}

export function initHeroTabsUrl(): void {
  const root = heroTabs();
  if (!root) return;

  const offered = offeredValues(root);
  if (offered.size === 0) return;

  /* Captured BEFORE the URL gets a say: this is the tab the page opens on with a bare link, and the
     one value that therefore needs no `?tab=` to describe it. */
  const authoredDefault = root.getAttribute("data-value");

  const requested = new URL(window.location.href).searchParams.get(PARAM);
  /* An unknown value is left alone rather than corrected: the param may not even be ours, and the
     authored default is already the right answer for a link we cannot read. */
  if (requested && offered.has(requested)) {
    root.setAttribute("data-value", requested);

    /*
     * The panels are ALREADY showing the right one by now: the prepaint script in `Base.astro` read
     * the same parameter and emitted a rule for it before first paint. This writes the matching
     * `hidden` attributes so the DOM says in markup what the stylesheet is saying in paint, which
     * is what a screen reader and `hero-tabs-toc.ts` both read, and what the machine will find
     * already correct when it hydrates.
     */
    for (const panel of root.querySelectorAll<HTMLElement>(":scope > [data-sk-tabs-content]")) {
      panel.toggleAttribute("hidden", panel.getAttribute("data-value") !== requested);
    }
  }

  root.addEventListener("sk-value-change", (event) => {
    /*
     * `sk-value-change` BUBBLES, and every ComponentPreview inside these panels is itself a
     * `[data-sk-tabs]` firing the same event with its own vocabulary (`html`, `js`). Without this
     * guard, switching a demo's source tab would write `?tab=js` onto the page's hero bar.
     */
    if (event.target !== root) return;

    const value = (event as CustomEvent<{ value: string }>).detail?.value;
    if (!value || !offered.has(value)) return;

    const url = new URL(window.location.href);
    // The default tab needs no parameter: a reader sitting on it should get the plain page URL.
    if (value === authoredDefault) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, value);

    /*
     * `replaceState`, not `push`: a tab is which face of one document you are looking at, not a
     * place you travelled to. Pushing would make Back walk through the tabs you sampled instead of
     * leaving the page, which is what a reader means by Back on a docs page. The hash is untouched,
     * so a heading anchor survives a tab switch.
     */
    window.history.replaceState(window.history.state, "", url);
  });
}
