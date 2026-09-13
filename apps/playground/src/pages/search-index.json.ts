import { docsSearchIndex } from "../lib/docs-search-index";

/* `no-cache`, like the docs endpoint it mirrors: the index is derived from `navigation.ts` and must
 * not lag the catalog. */
export function GET(): Response {
  return Response.json(docsSearchIndex("en"), { headers: { "cache-control": "no-cache" } });
}
