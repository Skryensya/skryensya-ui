import { spawnSync } from "node:child_process";
import { anthropicText } from "@tanstack/ai-anthropic";
import { openaiText } from "@tanstack/ai-openai";
import type { AnyTextAdapter } from "@tanstack/ai";
import type { EvalCase } from "../case.js";
import { runCase } from "./harness.js";
import { runCaseWithClaudeCode } from "./claude-code-provider.js";
import type { CaseScore } from "./scoring.js";

/*
 * ONE SHAPE, MANY WAYS TO RUN A MODEL. G6 asks whether AN AGENT arrives at a correct composition
 * from the prompt and the three MCP tools alone; it says nothing about which model, or even which
 * agent loop. Locking this harness to one API-key provider would answer a narrower question than
 * the one F7 exists to ask, so a `Provider` is just "given one case, produce a scored run"; an
 * Anthropic or OpenAI call through TanStack AI's `chat()` (`harness.ts`) and the real `claude` CLI
 * headless (`claude-code-provider.ts`) are both that, and nothing about `run-agent.ts` needs to know
 * which is which. Adding a `codex` provider later, or an OpenRouter one, is one more entry here.
 */
export type ProviderId = "anthropic" | "openai" | "claude-code";

export type Availability = { ok: true } | { ok: false; reason: string };

export interface Provider {
  id: ProviderId;
  label: string;
  defaultModel: string;
  availability: () => Availability;
  run: (evalCase: EvalCase, lang: "es" | "en", model: string, verbose: boolean) => Promise<CaseScore>;
}

function tanstackProvider(
  id: ProviderId,
  label: string,
  envVar: string,
  defaultModel: string,
  createAdapter: (model: string) => AnyTextAdapter,
): Provider {
  return {
    id,
    label,
    defaultModel,
    availability: () => (process.env[envVar] ? { ok: true } : { ok: false, reason: `${envVar} not set` }),
    run: (evalCase, lang, model, verbose) =>
      runCase(evalCase, lang, { adapter: createAdapter(model), verbose }),
  };
}

function hasClaudeCli(): boolean {
  return spawnSync("claude", ["--version"], { stdio: "ignore" }).status === 0;
}

const claudeCodeProvider: Provider = {
  id: "claude-code",
  label: "Claude Code CLI (claude -p, subscription login)",
  /*
   * Informational default only: `claude -p` without `--model` uses whatever model the session is
   * already on. Passed through as `--model` when `--model` is given on this script's own CLI.
   */
  defaultModel: "claude-sonnet-5",
  availability: () => (hasClaudeCli() ? { ok: true } : { ok: false, reason: "`claude` CLI not found on PATH" }),
  run: (evalCase, lang, model, verbose) => runCaseWithClaudeCode(evalCase, lang, { model, verbose }),
};

export const providers: Record<ProviderId, Provider> = {
  anthropic: tanstackProvider(
    "anthropic",
    "Anthropic (TanStack AI, ANTHROPIC_API_KEY)",
    "ANTHROPIC_API_KEY",
    "claude-sonnet-5",
    (model) => anthropicText(model as Parameters<typeof anthropicText>[0]),
  ),
  openai: tanstackProvider(
    "openai",
    "OpenAI (TanStack AI, OPENAI_API_KEY)",
    "OPENAI_API_KEY",
    "gpt-5.1-codex",
    (model) => openaiText(model as Parameters<typeof openaiText>[0]),
  ),
  "claude-code": claudeCodeProvider,
};

export function isProviderId(value: string): value is ProviderId {
  return value in providers;
}

/** The first provider that reports itself available, in declaration order. Null when none is. */
export function detectProvider(): ProviderId | null {
  for (const id of Object.keys(providers) as ProviderId[]) {
    if (providers[id].availability().ok) return id;
  }
  return null;
}
