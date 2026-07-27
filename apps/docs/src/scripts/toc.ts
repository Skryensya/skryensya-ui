/*
 * "En esta página": one responsive disclosure controller plus the scroll spy.
 *
 * The list is still built synchronously in Base.astro so the reserved rail never arrives after
 * paint. Shape is shared here instead: both the real docs shell and ComponentPreview call the same
 * controller, so a TOC switches between rail and disclosure at the same breakpoint in every realm.
 */

/** Keeps every authored TOC closed as a disclosure and open as a wide rail. */
export function initTocDisclosure(root: ParentNode = document): () => void {
  const disclosures = [
    ...root.querySelectorAll<HTMLDetailsElement>(
      "[data-docs-toc-disclosure]",
    ),
  ];
  if (disclosures.length === 0) return () => {};

  const wide =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--breakpoint-wide")
      .trim() || "72rem";
  const rail = window.matchMedia(`(min-width: ${wide})`);
  const sync = () => {
    for (const disclosure of disclosures) {
      disclosure.open = rail.matches;
      const summary = disclosure.querySelector<HTMLElement>("summary");
      if (summary) summary.tabIndex = rail.matches ? -1 : 0;
    }
  };

  sync();
  rail.addEventListener("change", sync);
  return () => rail.removeEventListener("change", sync);
}

/** Marks the section you are reading. Idempotent: safe if the inline half never ran. */
export function initTocSpy() {
  const toc = document.querySelector<HTMLElement>("[data-docs-toc][data-ready]");
  const main = document.querySelector("main");
  if (!toc || !main) return;

  const links = [...toc.querySelectorAll<HTMLAnchorElement>("a[href^='#']")];
  if (links.length < 2) return;

  const byId = new Map(links.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
  const headings = [...byId.keys()]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  /* The band is the top slice of the viewport under the sticky header: a heading is "current" from
   * when it reaches that band until the next one does. Marking every heading merely on screen would
   * light up half the rail on a short page, so the FIRST one in document order inside the band wins. */
  const onScreen = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target.id);
        else onScreen.delete(entry.target.id);
      }

      const current = headings.find((heading) => onScreen.has(heading.id))?.id;

      /* Nothing in the band means "between sections", at the very top of the page, or mid-way
       * through a long one. It does NOT mean you are nowhere, so the last answer stands rather than
       * being cleared. Clearing here also fought the inline script's pre-mark: it set the first
       * section current before paint, and the first observer callback wiped it a frame later, which
       * is exactly the flicker this whole pass exists to remove. */
      if (!current) return;

      for (const [id, link] of byId) {
        if (id === current) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      }
    },
    { rootMargin: "-72px 0px -70% 0px" },
  );

  for (const heading of headings) observer.observe(heading);
}
