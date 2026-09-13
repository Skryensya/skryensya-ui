import { buildSearchIndex } from "../../lib/search-index";
import { archiveHref } from "../../lib/docs-versions";

/*
 * THE ARCHIVE'S OWN SEARCH INDEX.
 *
 * Without this, ⌘K inside `/v0.0.1-dev/` answers with the LIVING site's routes, so the one control
 * a reader uses to move around is also the one that silently drops them out of the version they
 * chose. A real cut ships this for free (the archive is a whole build, endpoint included); the
 * prototype ships it by hand, from the same builder, with every href run through `archiveHref`.
 *
 * A result the archive does not hold keeps pointing at the living page, exactly as the rail does:
 * search can leave the archive, but only towards something that exists.
 */
const VERSION = "0.0.1-dev";

export function GET(): Response {
  const entries = buildSearchIndex("en").map((entry) => ({
    ...entry,
    href: archiveHref(entry.href, "en", VERSION),
  }));
  return Response.json(entries, { headers: { "cache-control": "no-cache" } });
}
