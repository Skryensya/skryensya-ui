import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { EvalCase } from "../case.js";
import type { ToolCallRecord } from "./mcp-tools.js";
import { scoreCase, type CaseScore } from "./scoring.js";
import { evalSystemPrompt } from "./system-prompt.js";

/*
 * THE OTHER WAY TO DRIVE G6: instead of a hand-rolled agent loop (`harness.ts`), spawn the actual
 * `claude` CLI headless (`claude -p`) and let it use its OWN agent loop against the SAME server.
 *
 * Runs from a FRESH TEMP DIRECTORY, not the repo root. Measured live: from the repo root, `Read`
 * (the one built-in tool `--permission-mode dontAsk` lets through unconditionally, per the platform's
 * own read-only command set; `Bash`, `Write` and everything else got a real `permission_denied`
 * event, confirmed in the stream) was enough for the agent to read this very repo's source directly,
 * once even reading the eval case file's OWN reference tree before calling a single MCP tool. A
 * repo-root run cannot tell "composed it right" from "found the answer lying around", so it isn't
 * one. `--mcp-config` here is INLINE JSON naming the server by its ABSOLUTE built path
 * (`packages/mcp/dist/index.js`), not `.mcp.json`: that file's own `args` entry is repo-relative,
 * and would silently fail to resolve from anywhere else.
 *
 * `--strict-mcp-config` still matters even alone in a scratch directory: without it, every OTHER
 * MCP server in the runner's own `~/.claude` (this repo's own figma/gmail/etc.) would also be
 * sitting in the model's tool list. From a scratch directory, `Read` still exists but has nothing of
 * this repo left to find.
 *
 * This runs WITHOUT `--bare`: it uses the session's own subscription login, not a separate
 * `ANTHROPIC_API_KEY` (see `providers.ts`'s `claudeCodeProvider`); that is the one thing that makes
 * this provider worth having alongside `harness.ts`'s API-key-metered path).
 */

const MCP_SERVER_NAME = "skryensya-ui";
const MCP_TOOL_PREFIX = `mcp__${MCP_SERVER_NAME}__`;

const mcpServerEntry = fileURLToPath(new URL("../../packages/mcp/dist/index.js", import.meta.url));
const mcpConfigInline = JSON.stringify({
  mcpServers: { [MCP_SERVER_NAME]: { command: "node", args: [mcpServerEntry] } },
});

interface StreamContentBlock {
  type: string;
  [key: string]: unknown;
}

interface StreamEvent {
  type: string;
  message?: { content?: StreamContentBlock[] };
  [key: string]: unknown;
}

export interface ClaudeCodeOptions {
  model?: string;
  verbose?: boolean;
}

export async function runCaseWithClaudeCode(
  evalCase: EvalCase,
  lang: "es" | "en",
  options: ClaudeCodeOptions = {},
): Promise<CaseScore> {
  const events = await spawnClaude(evalCase.prompt[lang], options);
  const calls = extractRecords(events);

  if (options.verbose) {
    console.log(`  [${evalCase.id}/${lang}] tools called: ${calls.map((c) => c.name).join(" -> ") || "(none)"}`);
  }

  return scoreCase(evalCase, lang, calls);
}

async function spawnClaude(prompt: string, options: ClaudeCodeOptions): Promise<StreamEvent[]> {
  const args = [
    "-p",
    prompt,
    "--append-system-prompt",
    evalSystemPrompt,
    "--mcp-config",
    mcpConfigInline,
    "--strict-mcp-config",
    "--allowedTools",
    `mcp__${MCP_SERVER_NAME}`,
    "--permission-mode",
    "dontAsk",
    "--output-format",
    "stream-json",
    "--verbose",
  ];
  if (options.model) args.push("--model", options.model);

  // Isolated per call: nothing of this repo is reachable from here, so Bash/Read/grep have nothing
  // to find, and the only path to a correct composition is the three MCP tools.
  const cwd = await mkdtemp(join(tmpdir(), "skryensya-eval-"));

  try {
    return await new Promise<StreamEvent[]>((resolve, reject) => {
      const child = spawn("claude", args, {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        /*
         * Claude Code caps any MCP tool result at 25,000 tokens by default (`MAX_MCP_OUTPUT_TOKENS`),
         * a HARD rejection: without this, `get_catalog`'s ~110KB payload and a `validate_ui` response
         * for a complex composition (`paginated-data-table`, ~94KB) both tripped it, and the agent
         * never saw the result at all. Raising the cap removes that at its source.
         *
         * A SEPARATE, lower, fixed threshold still persists a large result to a file instead of
         * inlining it (Claude Code's own doc: "the warning threshold is fixed"), and no env var moves
         * it: `get_catalog` still triggers this every time, regardless of the cap above. Measured
         * live, this costs turns (a `Read` on the saved file) but not correctness or fairness. It's
         * the agent reading back its OWN tool's output, not repo source; confirmed the agent still
         * converges on a correct `validate_ui` call afterward. Left as a real, load-bearing cost of
         * this provider rather than something to route around further.
         */
        env: { ...process.env, MAX_MCP_OUTPUT_TOKENS: "100000" },
      });

      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk: Buffer) => (stdout += chunk));
      child.stderr.on("data", (chunk: Buffer) => (stderr += chunk));
      child.on("error", (error) => {
        reject(new Error(`Could not spawn \`claude\`: ${error.message}. Is it installed and on PATH?`));
      });
      child.on("close", (code) => {
        const events = stdout
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line) => JSON.parse(line) as StreamEvent);

        if (events.length === 0) {
          reject(new Error(`claude -p exited ${code} with no output.\n${stderr.slice(0, 1000)}`));
          return;
        }
        resolve(events);
      });
    });
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

/**
 * Pairs each `tool_use` block for one of OUR three tools with its `tool_result`, by the id the
 * stream itself uses to correlate them. Every other tool_use (ToolSearch, Read: the platform's own
 * tools, still available even though only `mcp__skryensya-ui` is pre-approved) is not ours to score
 * and is left out.
 */
function extractRecords(events: StreamEvent[]): ToolCallRecord[] {
  const pending = new Map<string, { name: string; args: unknown }>();
  const records: ToolCallRecord[] = [];

  for (const event of events) {
    const blocks = event.message?.content ?? [];

    if (event.type === "assistant") {
      for (const block of blocks) {
        if (
          block.type === "tool_use" &&
          typeof block.name === "string" &&
          block.name.startsWith(MCP_TOOL_PREFIX) &&
          typeof block.id === "string"
        ) {
          pending.set(block.id, { name: block.name.slice(MCP_TOOL_PREFIX.length), args: block.input });
        }
      }
    } else if (event.type === "user") {
      for (const block of blocks) {
        if (block.type !== "tool_result" || typeof block.tool_use_id !== "string") continue;
        const call = pending.get(block.tool_use_id);
        if (!call) continue;
        records.push(toRecord(call, block.content));
      }
    }
  }

  return records;
}

/**
 * Normal MCP shape: `content` is `[{ type: "text", text: "<json>" }]` (one text block, same as the
 * TanStack path parses in `mcp-tools.ts`). A synthetic Claude Code error, for example "exceeds maximum
 * allowed tokens" for `get_catalog`'s ~110KB payload, arrives as a plain string instead; treated as
 * a failed call, same as a thrown MCP error is on the other path.
 */
function toRecord(call: { name: string; args: unknown }, content: unknown): ToolCallRecord {
  const text =
    Array.isArray(content) && content[0]?.type === "text" && typeof content[0].text === "string"
      ? content[0].text
      : undefined;

  if (text === undefined) {
    return {
      name: call.name,
      args: call.args,
      error: typeof content === "string" ? content : JSON.stringify(content),
    };
  }

  try {
    return { name: call.name, args: call.args, result: JSON.parse(text) };
  } catch {
    return { name: call.name, args: call.args, error: `unparseable tool result: ${text.slice(0, 200)}` };
  }
}
