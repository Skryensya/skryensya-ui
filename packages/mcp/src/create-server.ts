import { McpServer } from "@modelcontextprotocol/server";
import { createAgentService, type AgentResult } from "@skryensya/ai-compiler/agent";
import { snippets } from "@skryensya/snippets";
import { instructions } from "./instructions.js";
import { pair } from "./manifest.js";
import { reportingInput, type Checked } from "./schemas.js";
import { tools } from "./tools.js";

/*
 * THE SERVER FACTORY, shared by both transports: `index.ts` (stdio, one instance per connection) and
 * `http.ts` (Streamable HTTP, one instance per request under the SDK's stateless `createMcpHandler`).
 * Both hand this function to the SDK and let it decide when to call it, which is what keeps the
 * modern 2026-07-28 protocol and the stateless 2025 fallback serving the same tools.
 *
 * This file is a protocol adapter and nothing else. The service below holds the domain knowledge;
 * the loop registers `tools.ts`'s declarations against it and turns an `AgentResult` into an MCP
 * result. There is no per-server state: the service is built once per process from an artifact
 * that `manifest.ts` froze, so a thousand concurrent requests share read-only data and nothing else.
 */

const service = createAgentService(pair, snippets);

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "skryensya-ui",
      version: "2.0.0",
      description:
        "Compose interfaces with @skryensya/ui: discover candidate signatures, read their contracts, " +
        "then propose a usage tree and receive the emitted code for either binding.",
    },
    { instructions },
  );

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: reportingInput(tool.input),
        outputSchema: tool.output,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      // `checked` is `reportingInput`'s verdict on the arguments. The cast only restores the type
      // the heterogeneous `tools` tuple erased.
      async (args: unknown) => {
        const checked = args as Checked<unknown>;
        return toCallResult(
          checked.ok
            ? (tool.run as (s: typeof service, a: unknown) => AgentResult<object>)(service, checked.data)
            : service.invalidInput(tool.name, checked.issues),
        );
      },
    );
  }

  return server;
}

/*
 * One result, two views. `structuredContent` is the value, validated by the SDK against the tool's
 * `outputSchema` before it leaves. The text block is the same value serialized, which is what the
 * MCP spec asks for so a client that predates structured output still reads it, and what every
 * client of the previous server parsed. Compact JSON, not indented: the indentation was a third of
 * the bytes, and bytes are what tripped Claude Code's large-result threshold.
 *
 * Errors keep provenance and are machine-readable too; the SDK skips output validation for them.
 */
function toCallResult(result: AgentResult<object>) {
  const value = result.value as Record<string, unknown>;
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
    structuredContent: value,
    ...(result.ok ? {} : { isError: true }),
  };
}
