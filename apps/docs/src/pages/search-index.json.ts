import { buildSearchIndex } from "../lib/search-index";

export function GET(): Response {
  return Response.json(buildSearchIndex("es"), {
    headers: {
      "cache-control": "public, max-age=3600",
    },
  });
}
