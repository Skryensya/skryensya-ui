import { buildSearchIndex } from "../../../lib/search-index";
import { archiveHref } from "../../../lib/docs-versions";

/* The Spanish half of the archive's index. See the note in `../search-index.json.ts`. */
const VERSION = "0.0.1-dev";

export function GET(): Response {
  const entries = buildSearchIndex("es").map((entry) => ({
    ...entry,
    href: archiveHref(entry.href, "es", VERSION),
  }));
  return Response.json(entries, { headers: { "cache-control": "no-cache" } });
}
