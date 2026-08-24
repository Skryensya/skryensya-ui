/*
 * Shared by BOTH providers: `harness.ts`'s `systemPrompts` and `claude-code-provider.ts`'s
 * `--append-system-prompt`, so the measurement is the same framing regardless of which agent loop
 * runs it.
 *
 * Not invented from scratch: it extends the MCP server's own `description`/`instructions`
 * (`packages/mcp/src/index.ts`, "Compose interfaces with @skryensya/ui...") rather than duplicating
 * that workflow guidance. The one thing neither field says, and a bare tool list doesn't imply on
 * its own: that the user's message IS the product intent to compose, not a question to answer.
 *
 * Measured live (2026-08-24), not assumed: without this, the prompt "A short survey with a
 * single-choice question among three alternatives" got answered as an actual survey question
 * ("Which coffee brewing method do you prefer?"), never touching a tool. Two other cases
 * (`switch-immediate-setting` in both languages) showed the same pattern.
 */
export const evalSystemPrompt =
  "You are composing an interface with @skryensya/ui. The user's message describes a UI to build, " +
  'not a question to answer or content to write: even a short, plain sentence like "a short survey ' +
  'with a single-choice question among three alternatives" is a product intent to compose as a ' +
  "usage tree, never a literal request to fulfill in prose. Compose it with the three tools: " +
  "get_catalog to find the right signature, get_contract to read how it's configured, validate_ui " +
  "to check the tree and receive the emitted code.";
