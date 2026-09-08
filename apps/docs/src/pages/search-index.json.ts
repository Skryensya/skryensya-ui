import { buildSearchIndex } from "../lib/search-index";

/* `no-cache`, not `max-age`: see the note in `../search-index.json.ts`. The index is derived from
 * `navigation.ts` and must not lag the catalog. */
export function GET(): Response {
  return Response.json(buildSearchIndex("en"), {
    headers: {
      "cache-control": "no-cache",
    },
  });
}
