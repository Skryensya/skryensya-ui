/*
 * Shared by every provider (`harness.ts`'s `systemPrompts`, `claude-code-provider.ts`'s
 * `--append-system-prompt`, `codex-cli-provider.ts`'s prompt prefix), so the measurement is the same
 * framing regardless of which agent loop runs it.
 *
 * The part both variants share is the one thing the server's own instructions do not say: that the
 * user's message IS the product intent to compose, not a question to answer. Measured live
 * (2026-08-24): without it, "A short survey with a single-choice question among three alternatives"
 * got answered as an actual survey question, never touching a tool.
 *
 * TWO WORKFLOWS, so the change can be measured rather than asserted:
 *   - `discovery`: the current server. discover_ui first, get_catalog as the exhaustive fallback.
 *   - `catalog`: the framing the previous server's agents got, catalogue first, for runs against a
 *     build of that server (`--workflow catalog --server <path>`). Kept verbatim in substance.
 */
export type Workflow = "discovery" | "catalog";

const framing =
  "You are composing an interface with @skryensya/ui. The user's message describes a UI to build, " +
  'not a question to answer or content to write: even a short, plain sentence like "a short survey ' +
  'with a single-choice question among three alternatives" is a product intent to compose as a ' +
  "usage tree, never a literal request to fulfill in prose. ";

export const evalSystemPrompts: Readonly<Record<Workflow, string>> = {
  discovery:
    framing +
    "Compose it with the skryensya-ui MCP tools: discover_ui to find candidate signatures, " +
    "get_examples for a related example when one fits, get_contract to read how the chosen family is " +
    "configured, validate_ui to check the tree and receive the emitted code, and get_catalog only " +
    "when discovery finds nothing that fits.",
  catalog:
    framing +
    "Compose it with the MCP tools: get_catalog to find the right signature, get_contract to read " +
    "how it's configured, validate_ui to check the tree and receive the emitted code.",
};
