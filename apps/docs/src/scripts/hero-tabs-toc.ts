/*
 * The ToC for pages piloting `.docs-component-hero-tabs` (currently only /componentes/accordion):
 * one section INDEX PER TAB, not per document. Every other page has its index read at build time
 * (`../lib/document-index.ts`) and ships it in the HTML; this one cannot, because which tab is open
 * is a fact about a reader. The build finds nothing to list here anyway: it reads the document's own
 * top-level headings, and every heading on this page lives inside a `.sk-tabs__content` panel,
 * several levels deeper. It marks the rail `pending` instead and leaves the list to this file.
 *
 * Each panel's OWN first heading (an `h2`) is the panel's outline title; visually hidden where
 * the tab strip already says it out loud ("Uso"), or real prose where it doubles as one (Style
 * hooks' own "Styling hooks", the a11y tab's own "Accesibilidad"); is deliberately NOT
 * listed here: the tab strip is that entry. Building starts one level below it, at `h3`, with a
 * nested `h4` rung for the one section that has one ("Details nativo"'s own two subsections).
 *
 * `data-level` on a `<li>` is PRESENTATIONAL, not the literal tag name; `toc.css` only ever
 * learned two rungs ("h2" = flat, "h3" = indented) because on every OTHER page the flat rung
 * really is an `<h2>`. Here the flat rung is an `<h3>` and the indented one an `<h4>`, so this
 * maps them onto the SAME two presentational values rather than teaching the stylesheet a third,
 * page-specific rung.
 */
import { destroyMount } from "@skryensya/vanilla/runtime";
import { connectToc } from "@skryensya/vanilla/toc";

const FLAT_LEVEL = "h2";
const NESTED_LEVEL = "h3";

/*
 * By VALUE, never by `:not([hidden])`; `hidden` is Svelte's own DOM patch, applied in an effect
 * reacting to the machine's state, and it lands on a LATER tick than the `sk-value-change` event
 * the machine's `onValueChange` callback fires synchronously. Reading `[hidden]` right after the
 * event caught the PREVIOUS panel every time; one tab switch behind what the reader just clicked.
 * `[data-sk-tabs]`'s own `data-value` is never late: it is authored directly in the HTML for the
 * initial tab and mirrored onto the same attribute by the machine from then on, so it is correct
 * exactly as at issue-time as the event's own `detail.value`.
 */
function panelFor(tabsRoot: Element, value: string): HTMLElement | null {
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

function buildList(tocRoot: Element, panel: HTMLElement): void {
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

export function initHeroTabsToc(): void {
  const heroTabs = document.querySelector(".docs-component-hero-tabs");
  const tocRoot = document.querySelector<HTMLElement>("[data-sk-toc]");
  if (!heroTabs || !tocRoot) return;
  const tabsRoot = heroTabs.closest<HTMLElement>("[data-sk-tabs]");
  if (!tabsRoot) return;

  const initialValue = tabsRoot.getAttribute("data-value");
  const initial = initialValue ? panelFor(tabsRoot, initialValue) : null;
  if (initial) buildList(tocRoot, initial);

  /*
   * The spy that lights up `aria-current` (`connectToc`, `@skryensya/vanilla/toc`) binds to
   * whatever links the `<ul>` holds the moment it connects; it never re-scans on its own. A tab
   * switch replaces those links wholesale, so the OLD spy has to be torn down and a fresh one
   * bound to the new list, or it keeps watching headings that are no longer even in the visible
   * panel. The very FIRST switch tears down the instance the site's own auto-init mounted
   * (`destroyMount`, since this script never owned that one's cleanup); every switch after that
   * owns its own, returned by `connectToc` itself.
   */
  let disposeSpy: (() => void) | undefined;
  tabsRoot.addEventListener("sk-value-change", (event) => {
    const value = (event as CustomEvent<{ value: string }>).detail?.value;
    const next = value ? panelFor(tabsRoot, value) : null;
    if (!next) return;
    buildList(tocRoot, next);
    if (disposeSpy) disposeSpy();
    else destroyMount(tocRoot);
    disposeSpy = connectToc(tocRoot);
  });
}
