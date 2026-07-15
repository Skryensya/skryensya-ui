/*
 * Zero-dependency static server for the demo. Serves this app directory and follows the
 * node_modules/@allison/tokens symlink pnpm creates for the workspace package, so the demo
 * consumes the tokens exactly as a real npm consumer would (via node_modules), over http.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const ROOT = import.meta.dirname;
const PORT = process.env.PORT || 4173;
const TYPES = {
  ".html": "text/html", ".css": "text/css", ".mjs": "text/javascript",
  ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml",
};

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const rel = normalize(url === "/" ? "/index.html" : url).replace(/^(\.\.[/\\])+/, "");
  const file = join(ROOT, rel);
  try {
    const body = await readFile(file); // readFile follows the workspace symlink transparently
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("404 Not Found");
  }
}).listen(PORT, () => {
  console.log(`demo → http://localhost:${PORT}  ·  proposals at /proposals/state-layers.html`);
});
