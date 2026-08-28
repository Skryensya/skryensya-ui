#!/usr/bin/env node
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./create-server.js";

/*
 * The same four tools `index.ts` serves over stdio, reachable over a network instead: `pnpm
 * --filter @skryensya/mcp start:http` (or `node dist/http.js` once built) listens on HOST:PORT and
 * answers Streamable HTTP at POST /mcp. Point a tunnel at it (`cloudflared tunnel --url
 * http://localhost:8787`, `ngrok http 8787`) for a public HTTPS URL an MCP client anywhere can use,
 * or reach it directly on a LAN/VPN without one.
 *
 * STATELESS (`sessionIdGenerator: undefined`), on purpose: this server carries no state of its own
 * between calls (every tool reads the same compiled manifest, `snippets`, `recipes`  -  nothing a
 * client's session would need remembered), the same reason stdio already spins up a fresh, isolated
 * process per client with nothing shared between them. A FRESH `McpServer` AND a fresh transport
 * per request, not one shared server: the SDK's own stateless example does the same (see that
 * file's own comment) because one low-level protocol `Server` cannot serve two concurrent
 * transports at once, and concurrent requests are the whole point of a server other people share.
 * `createServer()` is cheap (four `registerTool` calls against already-computed static data), so
 * paying it per request costs nothing a shared instance would meaningfully save.
 *
 * NO AUTH by default, matching stdio's own model: stdio's access control is "whoever can spawn this
 * process", HTTP's default is "whoever can reach this host and port"  -  a deliberate choice for a
 * server whose four tools are already read-only against public, non-secret data (a compiled
 * component manifest, published snippets and recipes) with no side effect and nothing to leak.
 * Setting `MCP_HTTP_TOKEN` turns that off: every request then needs `Authorization: Bearer
 * <token>`, for whoever binds this past localhost and wants a real gate rather than "reachable, but
 * only if you already have the URL."
 */
const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "127.0.0.1";
const TOKEN = process.env.MCP_HTTP_TOKEN;

const JSON_RPC_METHOD_NOT_ALLOWED = {
  jsonrpc: "2.0" as const,
  error: { code: -32000, message: "Method not allowed." },
  id: null,
};

function setCors(res: ServerResponse): void {
  // Permissive on purpose: the same read-only, non-secret surface the "NO AUTH by default" note
  // above describes. A browser-based MCP client is a real, unprivileged caller here, not a threat
  // this header would be the thing guarding against.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
}

function isAuthorized(req: IncomingMessage): boolean {
  if (!TOKEN) return true;
  const header = req.headers.authorization;
  return header === `Bearer ${TOKEN}`;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(text) });
  res.end(text);
}

const httpServer = createHttpServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  if (req.url !== "/mcp") {
    sendJson(res, 404, { error: "Not found.", detail: "The only route this server answers is POST /mcp." });
    return;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: "Unauthorized.", detail: "Missing or invalid Authorization: Bearer <token>." });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, JSON_RPC_METHOD_NOT_ALLOWED);
    return;
  }

  try {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    await transport.handleRequest(req, res);
    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      sendJson(res, 500, {
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`skryensya-ui MCP server listening on http://${HOST}:${PORT}/mcp`);
  if (!TOKEN) {
    console.log("MCP_HTTP_TOKEN is not set: every request is answered with no authorization check.");
  }
});

process.on("SIGINT", () => {
  httpServer.close(() => process.exit(0));
});
process.on("SIGTERM", () => {
  httpServer.close(() => process.exit(0));
});
