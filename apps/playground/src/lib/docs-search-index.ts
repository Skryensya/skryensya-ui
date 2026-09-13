import { buildSearchIndex } from "../../../docs/src/lib/search-index";
import type { Locale } from "../i18n";

/*
 * THE PALETTE'S RESULTS LIVE IN THE OTHER APP.
 *
 * `Base.astro` is the docs layout, reused here so the playground wears the same chrome, and it asks
 * for `/search-index.json` on every page. This app has no such route, so the fetch 404'd and ⌘K came
 * up empty: a search box that is visible, focusable and permanently useless.
 *
 * Every entry it returns is a DOCS route (`/components/button`, `/es/fundamentos`), and since the
 * split those are not routes here. So each href is prefixed. The default is empty, because the
 * deployment puts both behind one host and a bare path is then already correct; in development it
 * points at the port the docs actually serve. `PUBLIC_DOCS_URL` overrides both, and is the mirror of
 * `PUBLIC_PLAYGROUND_URL` on the docs side.
 */
const docsOrigin =
  import.meta.env.PUBLIC_DOCS_URL ?? (import.meta.env.DEV ? "http://localhost:4173" : "");

export function docsSearchIndex(locale: Locale) {
  return buildSearchIndex(locale).map((entry) => ({
    ...entry,
    href: entry.href.startsWith("/") ? `${docsOrigin}${entry.href}` : entry.href,
  }));
}
