#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./create-server.js";

/*
 * The stdio entry point: one process, one client, exactly what `.mcp.json` starts (`node
 * dist/index.js`). The four tools themselves live in `create-server.ts`, shared with `http.ts`'s
 * own Streamable HTTP transport  -  this file's only job is wiring the ONE server this process needs
 * to the ONE transport it speaks.
 */
async function main(): Promise<void> {
  const server = createServer();
  await server.connect(new StdioServerTransport());
}

main().catch((error: unknown) => {
  console.error("skryensya-ui MCP server failed to start:", error);
  process.exit(1);
});
