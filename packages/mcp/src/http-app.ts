import { timingSafeEqual } from "node:crypto";
import { createServer as createNodeServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { toNodeHandler } from "@modelcontextprotocol/node";
import {
  bearerAuthChallengeResponse,
  createMcpHandler,
  OAuthError,
  OAuthErrorCode,
  validateHostHeader,
  validateOriginHeader,
  verifyBearerToken,
  type AuthInfo,
  type McpServerFactory,
  type OAuthTokenVerifier,
} from "@modelcontextprotocol/server";

/*
 * THE HTTP SURFACE, as a function of its configuration so tests can build one in-process on port 0
 * and `http.ts` can build the real one from the environment. Routes:
 *
 *   GET  /healthz   200, a few bytes. Touches no tool, no catalogue, no auth. A process that answers
 *                   it has already loaded and verified the artifact at startup (`manifest.ts` throws
 *                   before the listener exists otherwise), so "healthy" means "can serve".
 *   *    /mcp       The MCP endpoint, served by the SDK's `createMcpHandler`: modern (2026-07-28)
 *                   per-request exchanges, plus the SDK's own stateless fallback for 2025-era
 *                   clients. One server instance per request, no session, nothing kept between.
 *   *    otherwise  404.
 *
 * In front of /mcp, in this order: Host allowlist, Origin allowlist, body size limit, then the
 * bearer gate. Each rejection is a small JSON body with no stack trace; the detail goes to stderr.
 */

export type HttpConfig = {
  readonly host: string;
  readonly port: number;
  /** When set, every /mcp request needs `Authorization: Bearer <token>`. */
  readonly token?: string;
  /** Hostnames the Host header may name. Empty means Host is not checked. */
  readonly allowedHosts: readonly string[];
  /** Origin hostnames a browser caller may come from. Requests without Origin always pass. */
  readonly allowedOrigins: readonly string[];
  readonly maxBodyBytes: number;
};

const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);
const LOCALHOST_NAMES = ["localhost", "127.0.0.1", "[::1]"];

const list = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

/*
 * THE DEFAULTS, derived so the common deployments need no configuration beyond a port:
 *
 *   - HOST: 0.0.0.0 in production (a container is reached through its network
 *     interface, never on its loopback); 127.0.0.1 otherwise, so a laptop does not expose it.
 *   - Allowed hosts: explicit MCP_ALLOWED_HOSTS wins. Otherwise a loopback bind allows the localhost
 *     names (the DNS-rebinding defence the SDK documents). A public bind without the variable checks
 *     no Host: behind a reverse proxy (Dokploy's Traefik) the public name is not knowable here, and
 *     guessing wrong would refuse every legitimate request. Deployments should set it.
 *   - Allowed origins: explicit MCP_ALLOWED_ORIGINS, else the localhost names. Non-browser MCP
 *     clients send no Origin and always pass; a browser on another origin is refused unless listed.
 */
export function httpConfigFromEnv(env: NodeJS.ProcessEnv): HttpConfig {
  const production = env.NODE_ENV === "production";
  // Blank is unset: `HOST=` would otherwise bind every interface, on a laptop too.
  const host = env.HOST?.trim() || (production ? "0.0.0.0" : "127.0.0.1");
  const port = integerFromEnv(env, "PORT", 8787, 0, 65_535);

  const explicitHosts = list(env.MCP_ALLOWED_HOSTS);
  const allowedHosts = explicitHosts.length > 0 ? explicitHosts : LOOPBACK.has(host) ? LOCALHOST_NAMES : [];

  const explicitOrigins = list(env.MCP_ALLOWED_ORIGINS);
  const token = env.MCP_HTTP_TOKEN?.trim();

  return {
    host,
    port,
    ...(token ? { token } : {}),
    allowedHosts,
    allowedOrigins: explicitOrigins.length > 0 ? explicitOrigins : LOCALHOST_NAMES,
    maxBodyBytes: integerFromEnv(env, "MCP_MAX_BODY_BYTES", 1_000_000, MIN_BODY_BYTES, MAX_BODY_BYTES),
  };
}

/*
 * The body limit's sane range. Below 1KiB not even an `initialize` request fits; above 64MiB the
 * limit has stopped protecting anything a usage tree could need. Outside it, the value is a typo.
 */
const MIN_BODY_BYTES = 1_024;
const MAX_BODY_BYTES = 64 * 1_024 * 1_024;

/*
 * A whole number from the environment, or startup fails saying which variable and why. `Number()`
 * alone was too forgiving to be a parser: `MCP_MAX_BODY_BYTES=1mb` is NaN, and `size > NaN` is never
 * true, so a typo silently REMOVED the limit; `-1` refused every request; `PORT=` read as 0, a random
 * port. Digits only, so `1e6` and `0x10` are refused rather than guessed at. Blank is unset.
 */
function integerFromEnv(env: NodeJS.ProcessEnv, name: string, fallback: number, min: number, max: number): number {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const value = /^\d+$/.test(raw) ? Number(raw) : Number.NaN;
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be a whole number from ${min} to ${max}, got "${env[name]}".`);
  }
  return value;
}

/*
 * A static shared secret, verified through the SDK's own bearer machinery rather than a string
 * comparison of the header. That is the seam for real authorization: replace this verifier with one
 * that introspects or validates an OAuth access token, serve `oauthMetadataResponse` for the
 * protected-resource metadata, and the rest of this file does not change.
 */
function staticTokenVerifier(expected: string): OAuthTokenVerifier {
  const want = Buffer.from(expected);
  return {
    async verifyAccessToken(token: string): Promise<AuthInfo> {
      const got = Buffer.from(token);
      if (got.length !== want.length || !timingSafeEqual(got, want)) {
        throw new OAuthError(OAuthErrorCode.InvalidToken, "Invalid bearer token.");
      }
      // The SDK refuses a token with no expiry. A static secret has none, so each verification is
      // valid for the one request it authorizes.
      return { token, clientId: "static-token", scopes: [], expiresAt: Math.floor(Date.now() / 1000) + 60 };
    },
  };
}

function sendJson(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}): void {
  const text = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": String(Buffer.byteLength(text)), ...headers });
  res.end(text);
}

async function sendResponse(res: ServerResponse, response: Response): Promise<void> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => (headers[key] = value));
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
}

class BodyTooLarge extends Error {}

/** Reads the body up to `limit` bytes, refusing early on a Content-Length that already says more. */
async function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  const declared = Number(req.headers["content-length"]);
  if (Number.isFinite(declared) && declared > limit) throw new BodyTooLarge();
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) throw new BodyTooLarge();
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

function corsHeaders(origin: string | undefined): Record<string, string> {
  if (!origin) return {};
  // Only ever reflected for an origin the allowlist already admitted; never `*`.
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Mcp-Method, Mcp-Name",
    "Access-Control-Expose-Headers": "Mcp-Session-Id, WWW-Authenticate",
    Vary: "Origin",
  };
}

export type HttpApp = {
  readonly server: Server;
  /** Stops accepting, lets in-flight requests finish for up to `graceMs`, then closes the rest. */
  readonly shutdown: (graceMs?: number) => Promise<void>;
};

export function createHttpApp(
  config: HttpConfig,
  factory: McpServerFactory,
  log: (message: string) => void = (message) => console.error(message),
): HttpApp {
  const handler = createMcpHandler(factory, {
    legacy: "stateless",
    // Reporting only; the SDK has already answered the client without internals.
    onerror: (error) => log(`mcp: ${error.message}`),
  });
  const serveMcp = toNodeHandler(handler, { onerror: (error) => log(`mcp adapter: ${error.message}`) });
  const bearer = config.token ? { verifier: staticTokenVerifier(config.token) } : undefined;

  const server = createNodeServer(async (req, res) => {
    const path = (req.url ?? "/").split("?")[0];
    try {
      if (path === "/healthz") {
        if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { error: "Method not allowed." }, { Allow: "GET, HEAD" });
        return sendJson(res, 200, { status: "ok" });
      }

      if (path !== "/mcp") {
        return sendJson(res, 404, { error: "Not found.", detail: "The MCP endpoint is /mcp." });
      }

      if (config.allowedHosts.length > 0) {
        const host = validateHostHeader(req.headers.host, [...config.allowedHosts]);
        if (!host.ok) {
          log(`refused host: ${host.message}`);
          return sendJson(res, 403, { error: "Forbidden.", detail: "Host not allowed." });
        }
      }

      const originHeader = req.headers.origin;
      const origin = validateOriginHeader(originHeader, [...config.allowedOrigins]);
      if (!origin.ok) {
        log(`refused origin: ${origin.message}`);
        return sendJson(res, 403, { error: "Forbidden.", detail: "Origin not allowed." });
      }
      const cors = corsHeaders(originHeader);
      for (const [name, value] of Object.entries(cors)) res.setHeader(name, value);

      if (req.method === "OPTIONS") {
        res.writeHead(204).end();
        return;
      }

      let authInfo: AuthInfo | undefined;
      if (bearer) {
        try {
          authInfo = await verifyBearerToken(req.headers.authorization, bearer);
        } catch (error) {
          return await sendResponse(res, bearerAuthChallengeResponse(error));
        }
      }

      let parsedBody: unknown;
      if (req.method === "POST") {
        const raw = await readBody(req, config.maxBodyBytes);
        try {
          parsedBody = raw.length > 0 ? JSON.parse(raw.toString("utf8")) : undefined;
        } catch {
          return sendJson(res, 400, { jsonrpc: "2.0", error: { code: -32700, message: "Parse error." }, id: null });
        }
      }

      (req as IncomingMessage & { auth?: AuthInfo }).auth = authInfo;
      await serveMcp(req, res, parsedBody);
    } catch (error) {
      if (error instanceof BodyTooLarge) {
        return sendJson(res, 413, { error: "Payload too large.", detail: `The limit is ${config.maxBodyBytes} bytes.` });
      }
      // The detail stays in the log. A remote client gets no stack and no internals.
      log(`unhandled: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
      if (!res.headersSent) sendJson(res, 500, { jsonrpc: "2.0", error: { code: -32603, message: "Internal server error." }, id: null });
      else res.end();
    }
  });

  // Slow-client protection that node:http leaves open by default.
  server.headersTimeout = 30_000;
  server.requestTimeout = 60_000;

  const shutdown = async (graceMs = 10_000) => {
    const closed = new Promise<void>((resolve) => server.close(() => resolve()));
    server.closeIdleConnections();
    const timer = setTimeout(() => server.closeAllConnections(), graceMs);
    timer.unref();
    await handler.close();
    await closed;
    clearTimeout(timer);
  };

  return { server, shutdown };
}
