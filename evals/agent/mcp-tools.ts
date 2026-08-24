import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createMCPClient } from "@tanstack/ai-mcp";
import { stdioTransport } from "@tanstack/ai-mcp/stdio";
import type { McpServerTool, MCPClient } from "@tanstack/ai-mcp";

/*
 * The REAL server, over the REAL transport: `packages/mcp/dist/index.js`, spawned via stdio exactly
 * as `.mcp.json` spawns it for an actual client. A harness that talked to the compiler or the
 * manifest directly would be testing something this repo doesn't actually ship: `get_catalog`,
 * `get_contract` and `validate_ui` as MCP tools, reached over stdio, are the product.
 *
 * One process per case (see `runCase` in `harness.ts`), not one shared across the run: each case is
 * an independent conversation, and a fresh process is the cheapest way to guarantee one case's tool
 * calls can never leak into another's; the same isolation `evals/README.md` already assumes.
 */
const serverEntry = fileURLToPath(
  new URL("../../packages/mcp/dist/index.js", import.meta.url),
);

export function assertServerBuilt(): void {
  if (existsSync(serverEntry)) return;
  throw new Error(
    `skryensya-ui MCP server is not built: ${serverEntry} does not exist.\n` +
      "Run `pnpm --filter @skryensya/mcp build` first.",
  );
}

/**
 * One tool call, exactly as it crossed the wire: what the agent sent, what the server returned.
 *
 * `result` is the server's JSON payload, ALREADY PARSED (the wire form is a single MCP text block,
 * which `@tanstack/ai-mcp` collapses to a JSON string; scoring wants the object, not a second
 * `JSON.parse` scattered through it). `error` is set instead of `result` when the call itself failed
 * (a schema rejection at the MCP layer, say): the model still sees the failure and can retry; this
 * record is only for scoring to see it too.
 */
export interface ToolCallRecord {
  name: string;
  args: unknown;
  result?: unknown;
  error?: string;
}

/**
 * Connects to the real server and returns its tools wrapped to log every call, plus the log they
 * write into and a `close()` to tear the process down.
 *
 * Wrapping `execute` (rather than parsing `chat()`'s return value afterward) is what lets scoring
 * see the EXACT tree the agent sent to `validate_ui`, not a reconstruction of it: `chat()`'s
 * non-streaming mode collapses the run to a final string, and the tool traffic is the only place
 * the intermediate composition still exists.
 */
export async function connectServerTools(): Promise<{
  client: MCPClient;
  tools: McpServerTool[];
  calls: ToolCallRecord[];
  close: () => Promise<void>;
}> {
  assertServerBuilt();

  const client = await createMCPClient({
    transport: stdioTransport({ command: "node", args: [serverEntry] }),
  });

  const calls: ToolCallRecord[] = [];
  const discovered = (await client.tools()) as McpServerTool[];

  const tools = discovered.map((tool) => {
    if (!tool.execute) return tool;
    const original = tool.execute as (a: unknown, c?: unknown) => unknown;
    return {
      ...tool,
      execute: async (args: unknown, context?: unknown) => {
        try {
          const raw = await original(args, context);
          // Every response from this server is one JSON text block (see `ok()`/`problem()` in
          // packages/mcp/src/index.ts); the MCP client collapses that to a plain string.
          const result = typeof raw === "string" ? JSON.parse(raw) : raw;
          calls.push({ name: tool.name, args, result });
          return raw;
        } catch (error) {
          calls.push({ name: tool.name, args, error: error instanceof Error ? error.message : String(error) });
          throw error;
        }
      },
    };
  });

  return {
    client,
    tools,
    calls,
    close: () => client.close(),
  };
}
