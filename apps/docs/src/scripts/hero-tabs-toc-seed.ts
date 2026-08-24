/*
 * The pure-DOM building blocks of the hero-tabs ToC, shared by its two authors: the `is:inline`
 * script right after `<Toc>` in `Base.astro` (the FIRST fill. A hand-written copy of this file,
 * since `is:inline` cannot `import`) and `hero-tabs-toc.ts` (every fill AFTER that, on tab switch,
 * which can afford the import because it only has to be ready by the reader's first click).
 */

const FLAT_LEVEL = "h2";
const NESTED_LEVEL = "h3";

/*
 * By VALUE, never by `:not([hidden])`; see `hero-tabs-toc.ts` for why (the machine's `hidden` patch
 * lands a tick behind `data-value`, which never does).
 */
export function panelForHeroTab(tabsRoot: Element, value: string): HTMLElement | null {
  return tabsRoot.querySelector<HTMLElement>(
    `:scope > [data-sk-tabs-content][data-value="${value}"]`,
  );
}

/** A stable id from the heading's own text; mirrors the build-time slugger exactly. */
function ensureId(heading: HTMLElement): string {
  if (heading.id) return heading.id;
  const base =
    (heading.textContent || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "seccion";
  let id = base;
  let n = 2;
  while (document.getElementById(id)) id = `${base}-${n++}`;
  heading.id = id;
  return id;
}

/** Fills the ToC's list from one panel's own `h3`/`h4` headings, and flips it ready. */
export function buildHeroTabsToc(tocRoot: Element, panel: HTMLElement): void {
  const list = tocRoot.querySelector("ul");
  if (!list) return;
  list.replaceChildren();

  const headings = [...panel.querySelectorAll<HTMLElement>(":scope > h3, :scope > h4")];
  if (headings.length < 1) {
    tocRoot.setAttribute("data-empty", "");
    tocRoot.setAttribute("data-ready", "");
    return;
  }
  tocRoot.removeAttribute("data-empty");

  for (const heading of headings) {
    const id = ensureId(heading);
    const level = heading.tagName === "H3" ? FLAT_LEVEL : NESTED_LEVEL;

    const item = document.createElement("li");
    item.className = "sk-toc__item";
    item.setAttribute("data-level", level);

    const link = document.createElement("a");
    link.className = "sk-toc__link sk-interactive";
    link.href = `#${id}`;
    link.textContent = heading.textContent;

    item.append(link);
    list.append(item);
  }

  // Same "land at top" convention the build-time index seeds: a hash in the URL means the browser
  // is about to scroll somewhere specific, so guessing "first" here would be a wrong answer the
  // spy would have to correct on screen a frame later.
  if (!window.location.hash) {
    const first = list.querySelector("a");
    if (first) first.setAttribute("aria-current", "true");
  }

  tocRoot.setAttribute("data-ready", "");
}
