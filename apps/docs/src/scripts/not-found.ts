/*
 * WHAT THE READER ASKED FOR, AND THE NEAREST REAL PAGES TO IT.
 *
 * A 404 is a static file: it is served for every path that does not exist, so it cannot be rendered
 * knowing which one it was. That makes these two the only things on the page that have to happen in
 * the browser, and they are the two worth having - "you asked for /componentes/buton" plus a short
 * list of pages that nearly match it is the difference between a dead end and a redirect the reader
 * performs themselves.
 *
 * THE MATCHER IS THE COMMAND PALETTE'S. `filterCommandPaletteEntries` is what ⌘K already ranks this
 * exact index with (`@skryensya/core/command-palette`), so a search from the 404 and a search from
 * the palette cannot disagree about what "menu" matches. Nothing here scores anything of its own.
 */
import { filterCommandPaletteEntries, type CommandPaletteEntry } from "@skryensya/core/command-palette";

const ROOT = "[data-docs-not-found]";
const PATH = "[data-docs-not-found-path]";
const PANEL = "[data-docs-not-found-suggestions]";
const LIST = "[data-docs-not-found-list]";

/**
 * The part of a failed path worth searching for: the last segment, minus the extension and the
 * separators. `/es/componentes/date-picker/` becomes `date picker` - the words a reader would have
 * typed into the palette, which is what the index is written in.
 */
function queryFromPath(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  return segment
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

/**
 * The best matches for a query, and the reason this is not one call: a wrong URL is usually a wrong
 * SPELLING, and the palette's matcher is prefix-and-substring, so `buton` finds nothing while `but`
 * finds Button. Dropping a character at a time turns a typo into its own prefix without inventing a
 * second, fuzzier scorer that could rank things differently from ⌘K. It stops at three characters,
 * where the results stop being about what was asked for.
 */
function suggest(index: readonly CommandPaletteEntry[], query: string, limit = 4): CommandPaletteEntry[] {
  for (let length = query.length; length >= 3; length -= 1) {
    const hits = filterCommandPaletteEntries(index, query.slice(0, length));
    if (hits.length > 0) return hits.slice(0, limit);
  }
  return [];
}

export function initNotFound(): void {
  const root = document.querySelector<HTMLElement>(ROOT);
  if (!root) return;

  const path = document.querySelector<HTMLElement>(PATH);
  /* `pathname` alone: a query string or a hash is not what failed to resolve, and echoing one back
     would put whatever the URL carried onto the page. `textContent`, never markup, for the same
     reason - this string comes from the address bar. */
  if (path) path.textContent = window.location.pathname;

  const panel = document.querySelector<HTMLElement>(PANEL);
  const list = document.querySelector<HTMLElement>(LIST);
  if (!panel || !list) return;

  const source = root.dataset.docsNotFound;
  if (!source) return;

  void fetch(source)
    .then((response) => (response.ok ? (response.json() as Promise<CommandPaletteEntry[]>) : null))
    .then((index) => {
      if (!index) return;
      const hits = suggest(index, queryFromPath(window.location.pathname));
      if (hits.length === 0) return;

      for (const hit of hits) {
        const item = document.createElement("li");
        item.className = "sk-nav-list__item";

        const link = document.createElement("a");
        link.className = "sk-nav-list__link sk-interactive";
        link.href = hit.href;

        /* The label in its own part, as `SidebarNav` writes it: the pattern's CSS lays the link out
         * as label + trailing, so bare text in the link is not the same anatomy. */
        const label = document.createElement("span");
        label.className = "sk-nav-list__label";
        label.textContent = hit.label;
        link.append(label);

        /* The section a hit belongs to, as the list's own trailing slot: two pages can share a name
         * across sections ("Overview"), and the trailing text is what tells them apart. */
        const where = hit.section ?? hit.group;
        if (where) {
          const trailing = document.createElement("span");
          trailing.className = "sk-nav-list__trailing";
          trailing.textContent = where;
          link.append(trailing);
        }

        item.append(link);
        list.append(item);
      }

      panel.hidden = false;
    })
    .catch(() => {
      /* No suggestions is a complete page: the rail carries the whole index and ⌘K is one key away.
       * A failed fetch here must not be reported as if the site were broken. */
    });
}
