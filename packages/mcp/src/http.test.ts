import { type ChildProcess, spawn } from "node:child_process";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { Client as LegacyClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport as LegacyHttpTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "./create-server.js";
import { createHttpApp, httpConfigFromEnv, type HttpApp, type HttpConfig } from "./http-app.js";
import { toolNames } from "./tools.js";

/*
 * The HTTP surface, tested two ways: in-process (the app built from a config on port 0, fast and
 * precise about each gate), and as the shipped binary under plain node (what the Docker image
 * starts). The tools themselves are `server.test.ts`'s job; this file is about the route,
 * the gates, statelessness and the process lifecycle.
 */

const base: HttpConfig = {
  host: "127.0.0.1",
  port: 0,
  allowedHosts: ["localhost", "127.0.0.1", "[::1]"],
  allowedOrigins: ["localhost", "127.0.0.1", "[::1]"],
  maxBodyBytes: 1_000_000,
};

async function start(config: Partial<HttpConfig> = {}): Promise<{ app: HttpApp; url: string; logs: string[] }> {
  const logs: string[] = [];
  const app = createHttpApp({ ...base, ...config }, createServer, (line) => logs.push(line));
  await new Promise<void>((resolve) => app.server.listen(0, "127.0.0.1", resolve));
  const { port } = app.server.address() as AddressInfo;
  return { app, url: `http://127.0.0.1:${port}`, logs };
}

const rpc = (body: unknown, headers: Record<string, string> = {}) => ({
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...headers },
  body: JSON.stringify(body),
});

async function connect(url: string, headers: Record<string, string> = {}): Promise<Client> {
  const client = new Client({ name: "http-tests", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${url}/mcp`), { requestInit: { headers } }));
  return client;
}

describe("configuration from the environment", () => {
  it("binds 0.0.0.0 in production and loopback otherwise, on PORT", () => {
    expect(httpConfigFromEnv({ NODE_ENV: "production", PORT: "4321" })).toMatchObject({ host: "0.0.0.0", port: 4321 });
    expect(httpConfigFromEnv({})).toMatchObject({ host: "127.0.0.1", port: 8787 });
    expect(httpConfigFromEnv({ HOST: "0.0.0.0" }).host).toBe("0.0.0.0");
  });

  it("checks Host against localhost on a loopback bind, and against MCP_ALLOWED_HOSTS when set", () => {
    expect(httpConfigFromEnv({}).allowedHosts).toContain("localhost");
    expect(httpConfigFromEnv({ NODE_ENV: "production" }).allowedHosts).toEqual([]);
    expect(httpConfigFromEnv({ MCP_ALLOWED_HOSTS: "a.example, b.example" }).allowedHosts).toEqual(["a.example", "b.example"]);
  });

  it("reads the token and never invents one", () => {
    expect(httpConfigFromEnv({}).token).toBeUndefined();
    expect(httpConfigFromEnv({ MCP_HTTP_TOKEN: "  " }).token).toBeUndefined();
    expect(httpConfigFromEnv({ MCP_HTTP_TOKEN: "s3cret" }).token).toBe("s3cret");
  });

  it("refuses a nonsense PORT", () => {
    expect(() => httpConfigFromEnv({ PORT: "eighty" })).toThrow(/PORT/);
  });
});

describe("routes and gates", () => {
  let server: Awaited<ReturnType<typeof start>>;
  beforeAll(async () => (server = await start()));
  afterAll(() => server.app.shutdown(100));

  it("answers /healthz with a small 2xx and no MCP content", async () => {
    const response = await fetch(`${server.url}/healthz`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("serves the full tool inventory at /mcp", async () => {
    const client = await connect(server.url);
    try {
      expect((await client.listTools()).tools.map((tool) => tool.name)).toEqual([...toolNames]);
      const result = await client.callTool({ name: "discover_ui", arguments: { query: "switch" } });
      expect((result.structuredContent as { sourceHash: string }).sourceHash).toMatch(/^[0-9a-f]{16}$/);
    } finally {
      await client.close();
    }
  });

  it("still serves a 2025-era client through the stateless fallback", async () => {
    const legacy = new LegacyClient({ name: "v1-http", version: "1.0.0" });
    await legacy.connect(new LegacyHttpTransport(new URL(`${server.url}/mcp`)));
    try {
      const result = await legacy.callTool({ name: "get_contract", arguments: { id: "button" } });
      expect(JSON.parse((result.content as { text: string }[])[0]!.text).id).toBe("button");
    } finally {
      await legacy.close();
    }
  });

  it("answers 405 to a session GET: there are no sessions", async () => {
    expect((await fetch(`${server.url}/mcp`, { method: "GET", headers: { Accept: "text/event-stream" } })).status).toBe(405);
  });

  it("answers 404 anywhere else", async () => {
    expect((await fetch(`${server.url}/whatever`, { method: "POST" })).status).toBe(404);
  });

  it("refuses a browser Origin that is not allowlisted, and reflects one that is (never *)", async () => {
    const evil = await fetch(`${server.url}/mcp`, rpc({ jsonrpc: "2.0", id: 1, method: "ping" }, { Origin: "https://evil.example" }));
    expect(evil.status).toBe(403);
    const local = await fetch(`${server.url}/mcp`, { method: "OPTIONS", headers: { Origin: "http://localhost:6274" } });
    expect(local.status).toBe(204);
    expect(local.headers.get("access-control-allow-origin")).toBe("http://localhost:6274");
  });

  it("refuses a Host that is not allowlisted (DNS rebinding)", async () => {
    const { request } = await import("node:http");
    const status = await new Promise<number>((resolve, reject) => {
      const req = request(`${server.url}/mcp`, { method: "POST", headers: { Host: "attacker.example", "Content-Type": "application/json" } }, (res) => {
        res.resume();
        resolve(res.statusCode!);
      });
      req.on("error", reject);
      req.end("{}");
    });
    expect(status).toBe(403);
  });

  it("answers malformed JSON with a parse error and no stack trace", async () => {
    const response = await fetch(`${server.url}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: "{not json",
    });
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("-32700");
    expect(text).not.toMatch(/at \w+ \(|node:internal|\.ts:\d+/);
  });
});

describe("request size", () => {
  it("refuses a body over the limit with 413", async () => {
    const { app, url } = await start({ maxBodyBytes: 1_000 });
    try {
      const response = await fetch(`${url}/mcp`, rpc({ jsonrpc: "2.0", id: 1, method: "ping", params: { pad: "x".repeat(5_000) } }));
      expect(response.status).toBe(413);
    } finally {
      await app.shutdown(100);
    }
  });
});

describe("with MCP_HTTP_TOKEN set", () => {
  const TOKEN = "test-secret-token";
  let server: Awaited<ReturnType<typeof start>>;
  beforeAll(async () => (server = await start({ token: TOKEN })));
  afterAll(() => server.app.shutdown(100));

  it("rejects no token and a wrong token with a Bearer challenge", async () => {
    for (const headers of [{}, { Authorization: "Bearer wrong" }, { Authorization: `Basic ${TOKEN}` }]) {
      const response = await fetch(`${server.url}/mcp`, rpc({ jsonrpc: "2.0", id: 1, method: "tools/list" }, headers));
      expect(response.status).toBe(401);
      expect(response.headers.get("www-authenticate")).toMatch(/^Bearer/);
    }
  });

  it("accepts the real token through a real client", async () => {
    const client = await connect(server.url, { Authorization: `Bearer ${TOKEN}` });
    try {
      expect((await client.listTools()).tools.length).toBe(toolNames.length);
    } finally {
      await client.close();
    }
  });

  it("keeps /healthz open, so a platform health check needs no secret", async () => {
    expect((await fetch(`${server.url}/healthz`)).status).toBe(200);
  });
});

describe("statelessness under concurrency", () => {
  /*
   * Twenty clients at once, each asking a different question. Every answer has to be the answer to
   * ITS question: a shared server instance or a mutable cache would show up here as a crossed or
   * rejected response.
   */
  it("answers concurrent calls independently and identically to sequential ones", async () => {
    const { app, url } = await start();
    const queries = ["switch", "checkbox", "accordion", "tabs", "pagination", "dialog", "tooltip", "table", "slider", "avatar"];
    try {
      const clients = await Promise.all(Array.from({ length: 20 }, () => connect(url)));
      const answers = await Promise.all(
        clients.map((client, at) => client.callTool({ name: "discover_ui", arguments: { query: queries[at % queries.length], limit: 3 } })),
      );
      const sequential = await connect(url);
      for (const [at, answer] of answers.entries()) {
        const expected = await sequential.callTool({ name: "discover_ui", arguments: { query: queries[at % queries.length], limit: 3 } });
        expect(answer.structuredContent).toEqual(expected.structuredContent);
      }
      await Promise.all([...clients, sequential].map((client) => client.close()));
    } finally {
      await app.shutdown(100);
    }
  }, 30_000);
});

describe("the shipped binary", () => {
  function spawnBinary(env: Record<string, string>): ChildProcess {
    return spawn("node", [join(import.meta.dirname, "..", "dist", "http.js")], {
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
  }

  async function waitFor(url: string, timeoutMs = 15_000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      try {
        if ((await fetch(url)).ok) return;
      } catch {
        if (Date.now() > deadline) throw new Error(`Timed out waiting for ${url}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  it("binds 0.0.0.0 in production, answers, and drains cleanly on SIGTERM", async () => {
    const port = 8796;
    const proc = spawnBinary({ NODE_ENV: "production", PORT: String(port), MCP_ALLOWED_HOSTS: "127.0.0.1" });
    let stdout = "";
    proc.stdout!.on("data", (chunk) => (stdout += chunk));
    try {
      await waitFor(`http://127.0.0.1:${port}/healthz`);
      expect(stdout).toContain(`http://0.0.0.0:${port}/mcp`);

      const client = await connect(`http://127.0.0.1:${port}`);
      expect((await client.listTools()).tools.map((tool) => tool.name)).toEqual([...toolNames]);
      await client.close();

      const exited = new Promise<number | null>((resolve) => proc.on("exit", resolve));
      proc.kill("SIGTERM");
      expect(await exited).toBe(0);
      expect(stdout).toContain("SIGTERM: draining");
    } finally {
      proc.kill("SIGKILL");
    }
  }, 30_000);
});
