import { type ChildProcess, spawn } from "node:child_process";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/*
 * Contract tests through a REAL client over Streamable HTTP, the same discipline `server.test.ts`
 * uses for stdio: what is being tested is the thing an agent actually talks to over a network
 * (the transport, the route, the auth gate), not the four tools themselves  -  those already have
 * their own exhaustive suite in `server.test.ts`, run against the identical `createServer()` this
 * file's own server also calls. Duplicating that suite here would test `createServer()` twice and
 * `http.ts` not at all.
 */

async function waitForPort(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      await fetch(url, { method: "OPTIONS" });
      return;
    } catch {
      if (Date.now() > deadline) throw new Error(`Timed out waiting for ${url}`);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

function spawnHttpServer(command: string, args: readonly string[], env: Record<string, string>): ChildProcess {
  return spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: ["ignore", "ignore", "inherit"],
  });
}

describe("over Streamable HTTP", () => {
  const PORT = 8799;
  const URL = `http://127.0.0.1:${PORT}/mcp`;
  let proc: ChildProcess;
  let client: Client;

  beforeAll(async () => {
    proc = spawnHttpServer("npx", ["tsx", join(import.meta.dirname, "http.ts")], { PORT: String(PORT) });
    await waitForPort(URL, 15_000);

    client = new Client({ name: "http-contract-tests", version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new globalThis.URL(URL)));
  }, 30_000);

  afterAll(async () => {
    await client.close();
    proc.kill();
  });

  it("exposes the same four tools stdio does", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      "get_catalog",
      "get_contract",
      "get_examples",
      "validate_ui",
    ]);
  });

  it("answers a real tool call, stamped with the same provenance stdio returns", async () => {
    const result = await client.callTool({ name: "get_catalog", arguments: {} });
    const content = result.content as { type: string; text: string }[];
    const payload = JSON.parse(content[0]!.text);

    expect(payload.sourceHash).toMatch(/^[0-9a-f]{16}$/);
    expect(payload.contracts.length).toBeGreaterThan(0);
  });

  it("validates a tree and returns emitted code, the same as stdio", async () => {
    const result = await client.callTool({
      name: "validate_ui",
      arguments: {
        tree: {
          contract: "button",
          signature: "Button.navigation",
          options: { variant: "accent", href: "/docs" },
          children: "Documentación",
        },
      },
    });
    const content = result.content as { type: string; text: string }[];
    const payload = JSON.parse(content[0]!.text);

    expect(payload.valid).toBe(true);
    expect(payload.emitted.vanilla).toContain('class="sk-button sk-interactive"');
  });

  it("rejects GET with 405, there is no server-initiated stream in stateless mode", async () => {
    const response = await fetch(URL, { method: "GET" });
    expect(response.status).toBe(405);
  });

  it("rejects DELETE with 405, there is no session to end in stateless mode", async () => {
    const response = await fetch(URL, { method: "DELETE" });
    expect(response.status).toBe(405);
  });

  it("answers 404 for any path other than /mcp", async () => {
    const response = await fetch(`http://127.0.0.1:${PORT}/whatever`, { method: "POST" });
    expect(response.status).toBe(404);
  });

  it("allows a browser-based caller in, permissive CORS on a read-only, non-secret surface", async () => {
    const response = await fetch(URL, { method: "OPTIONS" });
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });
});

describe("with MCP_HTTP_TOKEN set", () => {
  const PORT = 8798;
  const URL = `http://127.0.0.1:${PORT}/mcp`;
  const TOKEN = "test-secret-token";
  let proc: ChildProcess;

  beforeAll(async () => {
    proc = spawnHttpServer("npx", ["tsx", join(import.meta.dirname, "http.ts")], {
      PORT: String(PORT),
      MCP_HTTP_TOKEN: TOKEN,
    });
    await waitForPort(URL, 15_000);
  }, 30_000);

  afterAll(() => {
    proc.kill();
  });

  it("rejects a request with no Authorization header", async () => {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    expect(response.status).toBe(401);
  });

  it("rejects a request with the wrong token", async () => {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer wrong" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    expect(response.status).toBe(401);
  });

  it("accepts a request carrying the real token, through a real client", async () => {
    const client = new Client({ name: "http-auth-test", version: "1.0.0" });
    try {
      await client.connect(
        new StreamableHTTPClientTransport(new globalThis.URL(URL), {
          requestInit: { headers: { Authorization: `Bearer ${TOKEN}` } },
        }),
      );
      const { tools } = await client.listTools();
      expect(tools.length).toBe(4);
    } finally {
      await client.close();
    }
  });
});

describe("the shipped binary", () => {
  /*
   * Same reason `server.test.ts`'s own "the shipped binary" case exists: the tests above run
   * `http.ts` through tsx, not what a real deploy starts (`node dist/http.js`, plain node, no
   * workspace links resolved). The source passing every test while the built server cannot even
   * start is exactly the gap that case is there to make visible instead of discovering in a
   * session.
   */
  it("starts under plain node and answers", async () => {
    const PORT = 8797;
    const URL = `http://127.0.0.1:${PORT}/mcp`;
    const proc = spawnHttpServer("node", [join(import.meta.dirname, "..", "dist", "http.js")], {
      PORT: String(PORT),
    });

    try {
      await waitForPort(URL, 15_000);

      const client = new Client({ name: "http-binary-check", version: "1.0.0" });
      try {
        await client.connect(new StreamableHTTPClientTransport(new globalThis.URL(URL)));
        const { tools } = await client.listTools();
        expect(tools.map((tool) => tool.name).sort()).toEqual([
          "get_catalog",
          "get_contract",
          "get_examples",
          "validate_ui",
        ]);
      } finally {
        await client.close();
      }
    } finally {
      proc.kill();
    }
  }, 30_000);
});
