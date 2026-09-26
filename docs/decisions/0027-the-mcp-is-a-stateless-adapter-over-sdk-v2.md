---
num: 27
title: The MCP server is a stateless protocol adapter on SDK v2, shipped as one Docker image
short: "Stateless MCP adapter"
summary: >-
  `packages/mcp` stops holding knowledge about the kit and becomes a protocol frontend over
  `@skryensya/ai-compiler/agent`. It moves to the MCP TypeScript SDK v2, serves stdio and Streamable
  HTTP from one server factory, keeps no session state, returns structured output validated against
  declared schemas, and is deployed as `Dockerfile.mcp` on Dokploy. Authorization is a replaceable
  token verifier, so standards-based OAuth is a swap rather than a rewrite.
---

## The problem

The server had grown its own copies of what the compiler already knew. A tree walker existed twice,
one of them wrong about collection entries. A stylesheet resolver that ignored `hookSheets` and
`compose[].sheets` returned an incomplete CSS list for 11 of 45 canonical trees: valid markup,
silently unstyled. Deleting `packages/mcp` would have deleted knowledge, not a frontend.

Its transport was the monolithic v1 SDK, a hand-rolled HTTP router with permissive CORS on every
origin, a string comparison for the bearer token, and results serialized as JSON inside a text block
that no client could validate.

## The decision

**The server is an adapter.** Every deterministic operation (catalogue pages, contracts, examples,
discovery, validation with emission and the stylesheet closure) lives in
`@skryensya/ai-compiler/agent`, which knows nothing of MCP or zod and stamps provenance on every
result. `packages/mcp` declares the tools once (`tools.ts`), describes the wire in zod
(`schemas.ts`), and registers the declarations against the service. Core gains no protocol
dependency.

**SDK v2, one factory, no sessions.** `serveStdio` and `createMcpHandler` both call the same
`createServer`. HTTP builds a fresh server per request and holds nothing between requests; the
compiled artifact is frozen at load, so concurrent requests share read-only data and nothing else.
Clients of the 2025 protocol are served by the SDK's own stateless fallback from the same factory;
there is no hand-written legacy protocol.

**Structured output.** Every tool declares an `outputSchema`; results travel as `structuredContent`,
validated by the SDK, and as the same JSON in a text block for clients that predate structured output.
Compile-time checks pin each output schema to the service type it describes. Invalid arguments are
answered through the service too, as a provenance-stamped error rather than the SDK's bare text.

**Authorization is a verifier.** `MCP_HTTP_TOKEN` is checked through the SDK's bearer machinery with
a constant-time verifier. OAuth protected-resource authorization means replacing that verifier with
one that validates access tokens from an existing identity provider and serving the SDK's metadata
documents. No authorization server is written here.

**Browser and rebinding defences use the SDK's helpers.** Host and Origin are checked against
allowlists (localhost by default on a loopback bind, `MCP_ALLOWED_HOSTS` and `MCP_ALLOWED_ORIGINS`
otherwise); CORS is reflected only for an allowed origin, never `*`.

**One image.** `Dockerfile.mcp`, built from the repository root, runs Node 24 as an unprivileged
user with a Docker health check on `/healthz`, and is deployed on Dokploy behind its Traefik.

## What was rejected

**Session state.** Nothing in any tool needs memory between calls, and sessions would tie a client to
a replica.

**Keeping the v1 SDK.** It works, and it is the line the SDK has moved off; the v2 serving entries
are what give both protocol eras from one factory without hand-written compatibility.

**Moving the protocol schemas into Core** to remove the zod/TypeScript duplication. Core would gain
a schema library for one consumer's wire format. The duplication is contained instead: compile-time
pins fail the build when a schema and its type disagree.

**Railway.** Configured first, then replaced by Dokploy with the existing Docker image, which also
keeps one artifact for every host that runs containers.

## Cost

Two schema languages still describe one shape, held together by compile-time pins rather than
derivation. The Docker image pins its npm dependencies by exact version beside the lockfile, and
the two must move together.
