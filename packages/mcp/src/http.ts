#!/usr/bin/env node
import { createServer } from "./create-server.js";
import { createHttpApp, httpConfigFromEnv } from "./http-app.js";

/*
 * The Streamable HTTP entry point: `pnpm --filter @skryensya/mcp start:http`, or `node dist/http.js`
 * once built. The same tools `index.ts` serves over stdio, answered at /mcp, stateless: the SDK
 * builds one server per request from the shared factory, nothing survives the request, so any
 * number of replicas can sit behind a load balancer with no affinity.
 *
 * Configuration is environment only (see packages/mcp/README.md): HOST, PORT, NODE_ENV,
 * MCP_HTTP_TOKEN, MCP_ALLOWED_HOSTS, MCP_ALLOWED_ORIGINS, MCP_MAX_BODY_BYTES. Importing
 * `create-server.js` loads and verifies the compiled artifact, so a missing or mismatched artifact
 * stops the process here, before it ever listens or answers /healthz.
 */
const config = httpConfigFromEnv(process.env);
const app = createHttpApp(config, createServer);

app.server.listen(config.port, config.host, () => {
  const address = app.server.address();
  const port = typeof address === "object" && address ? address.port : config.port;
  console.log(`skryensya-ui MCP listening on http://${config.host}:${port}/mcp`);
  console.log(
    config.token
      ? "Auth: bearer token required (MCP_HTTP_TOKEN)."
      : "Auth: none. Anyone who can reach this port can call the tools (they are read-only).",
  );
  console.log(
    config.allowedHosts.length > 0 ? `Host allowlist: ${config.allowedHosts.join(", ")}` : "Host header: not checked.",
  );
});

let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    console.log(`${signal}: draining in-flight requests.`);
    app.shutdown().then(
      () => process.exit(0),
      (error: unknown) => {
        console.error("shutdown failed:", error);
        process.exit(1);
      },
    );
  });
}
