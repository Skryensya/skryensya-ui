#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createServer } from "./create-server.js";

/*
 * The stdio entry point: what `.mcp.json` starts (`node dist/index.js`). `serveStdio` owns the
 * connection: the opening exchange picks the protocol era (2026-07-28, or the 2025 `initialize`
 * handshake an older client sends), and ONE instance from the shared factory serves the connection.
 *
 * Nothing here may write to stdout: stdout IS the protocol. Diagnostics go to stderr.
 */
serveStdio(createServer, {
  onerror: (error) => console.error("skryensya-ui MCP (stdio):", error.message),
});
