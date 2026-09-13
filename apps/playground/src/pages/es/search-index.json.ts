import { docsSearchIndex } from "../../lib/docs-search-index";

/* `no-cache`, like the docs endpoint it mirrors. */
export function GET(): Response {
  return Response.json(docsSearchIndex("es"), { headers: { "cache-control": "no-cache" } });
}
