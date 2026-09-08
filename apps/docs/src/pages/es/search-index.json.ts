import { buildSearchIndex } from "../../lib/search-index";

/*
 * `no-cache`, not `max-age`: this index is DERIVED from `navigation.ts`, so it changes exactly when
 * a component is added or renamed - which is precisely when someone opens the palette to find it. A
 * one-hour `max-age` meant the palette silently lagged the catalog for up to an hour (and, in a
 * built site, for an hour after every deploy). The payload is small and gzips well; revalidating
 * every open is the right trade for a search index that must never be stale.
 */
export function GET(): Response {
  return Response.json(buildSearchIndex("es"), {
    headers: {
      "cache-control": "no-cache",
    },
  });
}
