import { anthropicText } from "@tanstack/ai-anthropic";
import { openaiText } from "@tanstack/ai-openai";
import type { AnyTextAdapter } from "@tanstack/ai";

/*
 * ONE SHAPE, MANY PROVIDERS. G6 asks whether AN AGENT arrives at a correct composition from the
 * prompt and the three MCP tools alone; it says nothing about which model. Locking this harness to
 * Anthropic would answer a narrower question than the one F7 exists to ask, so every provider is
 * the same `chat({ adapter, ... })` call underneath; only which adapter differs.
 *
 * Adding a third provider (OpenRouter, Gemini, whatever) is one more entry here, not a rewrite.
 */
export type ProviderId = "anthropic" | "openai";

export interface ProviderConfig {
  /** Env var this provider's adapter reads its API key from. Checked before spending a request. */
  envVar: string;
  /** Used when `--model` is omitted. Kept current, not "whatever shipped first". */
  defaultModel: string;
  createAdapter: (model: string) => AnyTextAdapter;
}

export const providers: Record<ProviderId, ProviderConfig> = {
  anthropic: {
    envVar: "ANTHROPIC_API_KEY",
    defaultModel: "claude-sonnet-5",
    /*
     * The adapter factories are typed against a const model-id union (kept in sync with each
     * provider's catalogue by their own `sync-provider-models` script), which a CLI-supplied
     * `--model` string cannot satisfy statically. The cast is the boundary where a runtime input
     * meets that compile-time union; an unknown id still fails loudly, just at the provider's API
     * call instead of at `tsc`.
     */
    createAdapter: (model) => anthropicText(model as Parameters<typeof anthropicText>[0]),
  },
  openai: {
    envVar: "OPENAI_API_KEY",
    defaultModel: "gpt-5.1-codex",
    createAdapter: (model) => openaiText(model as Parameters<typeof openaiText>[0]),
  },
};

export function isProviderId(value: string): value is ProviderId {
  return value in providers;
}

/** The first provider with an API key set, in declaration order. Null when none is configured. */
export function detectProvider(): ProviderId | null {
  for (const id of Object.keys(providers) as ProviderId[]) {
    if (process.env[providers[id].envVar]) return id;
  }
  return null;
}
