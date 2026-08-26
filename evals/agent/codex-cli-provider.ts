import { spawn } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { EvalCase } from "../case.js";
import { assertServerBuilt, type ToolCallRecord } from "./mcp-tools.js";
import { scoreCase, type CaseScore } from "./scoring.js";
import { evalSystemPrompt } from "./system-prompt.js";

/*
 * Codex CLI provider: the OpenAI equivalent of `claude-code-provider.ts`. It measures the real
 * `codex exec` agent loop, using the user's Codex/ChatGPT CLI login when present, against the same
 * skryensya-ui MCP server the API-backed harness uses.
 *
 * Isolation mirrors the Claude path but uses Codex's own config surface. Each run gets:
 *   - a fresh cwd, so repo files and reference trees are not reachable;
 *   - a fresh CODEX_HOME with only our MCP server configured, so user/global MCPs cannot leak in;
 *   - the user's Codex auth file copied into that CODEX_HOME, equivalent to Claude reusing its login;
 *   - read-only sandbox, because this eval is composition through MCP tools, not code edits.
 *
 * Codex's JSONL event schema is documented as intentionally event/version dependent, so extraction below
 * is defensive: it accepts the stable facts a Codex MCP event must contain (an MCP-ish item, a tool name,
 * args, and a result) rather than one brittle path. A future Codex release that renames event wrappers
 * should still work; a release that changes the MCP item payload itself will fail by recording no calls,
 * which scoring reports as the provider never reaching a valid validate_ui call.
 */

const MCP_SERVER_NAME = "skryensya-ui";
const MCP_TOOL_PREFIX = `mcp__${MCP_SERVER_NAME}__`;

const mcpServerEntry = fileURLToPath(new URL("../../packages/mcp/dist/index.js", import.meta.url));

interface StreamEvent {
  type?: string;
  item?: unknown;
  [key: string]: unknown;
}

export interface CodexCliOptions {
  model?: string;
  verbose?: boolean;
}

export async function runCaseWithCodexCli(
  evalCase: EvalCase,
  lang: "es" | "en",
  options: CodexCliOptions = {},
): Promise<CaseScore> {
  const events = await spawnCodex(evalCase.prompt[lang], options);
  const calls = extractRecords(events);

  if (options.verbose) {
    console.log(`  [${evalCase.id}/${lang}] tools called: ${calls.map((c) => c.name).join(" -> ") || "(none)"}`);
  }

  return scoreCase(evalCase, lang, calls);
}

async function spawnCodex(prompt: string, options: CodexCliOptions): Promise<StreamEvent[]> {
  assertServerBuilt();

  const root = await mkdtemp(join(tmpdir(), "skryensya-codex-eval-"));
  const cwd = join(root, "workspace");
  const codexHome = join(root, "codex-home");

  try {
    await mkdir(cwd, { recursive: true });
    await mkdir(codexHome, { recursive: true });
    await writeFile(join(codexHome, "config.toml"), codexConfig(), "utf8");
    await seedCodexAuth(codexHome);

    const args = [
      "exec",
      "--json",
      "--sandbox",
      "read-only",
      "--skip-git-repo-check",
    ];
    if (options.model) args.push("--model", options.model);
    args.push(`${evalSystemPrompt}\n\nUser request:\n${prompt}`);

    return await new Promise<StreamEvent[]>((resolve, reject) => {
      const child = spawn("codex", args, {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, CODEX_HOME: codexHome },
      });

      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk: Buffer) => (stdout += chunk));
      child.stderr.on("data", (chunk: Buffer) => (stderr += chunk));
      child.on("error", (error) => {
        reject(new Error(`Could not spawn \`codex\`: ${error.message}. Is it installed and on PATH?`));
      });
      child.on("close", (code) => {
        const lines = stdout.split("\n").filter((line) => line.trim().length > 0);
        const events = lines.map((line) => JSON.parse(line) as StreamEvent);

        if (events.length === 0) {
          reject(new Error(`codex exec exited ${code} with no JSONL output.\n${stderr.slice(0, 1000)}`));
          return;
        }
        if (code !== 0) {
          reject(new Error(`codex exec exited ${code}.\n${stderr.slice(0, 1000)}\n${stdout.slice(0, 1000)}`));
          return;
        }
        resolve(events);
      });
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function seedCodexAuth(codexHome: string): Promise<void> {
  const source = join(process.env.CODEX_HOME ?? join(homedir(), ".codex"), "auth.json");
  try {
    await copyFile(source, join(codexHome, "auth.json"));
  } catch {
    /*
     * Leave the provider's real availability check to `codex exec`: API-key auth can still arrive
     * through Codex-supported environment variables, and if neither auth path exists the spawned CLI
     * reports the exact login failure for this installed version.
     */
  }
}

function codexConfig(): string {
  const entry = JSON.stringify(mcpServerEntry);
  return `[mcp_servers.${MCP_SERVER_NAME}]
command = "node"
args = [${entry}]
startup_timeout_sec = 10
tool_timeout_sec = 60
required = true
enabled_tools = ["get_catalog", "get_examples", "get_contract", "validate_ui"]
default_tools_approval_mode = "approve"
`;
}
const SKRYENSYA_TOOL: Record<string, true> = {
  get_catalog: true,
  get_examples: true,
  get_contract: true,
  validate_ui: true,
};

function extractRecords(events: readonly StreamEvent[]): ToolCallRecord[] {
  const records: ToolCallRecord[] = [];

  for (const event of events) {
    if (event.type !== "item.completed" || event.item === null || typeof event.item !== "object") continue;
    const item = event.item as Record<string, unknown>;
    if (item.type !== "mcp_tool_call" || item.server !== MCP_SERVER_NAME || item.status === "in_progress") continue;

    const rawTool = item.tool;
    if (typeof rawTool !== "string") continue;
    const name = rawTool.startsWith(MCP_TOOL_PREFIX) ? rawTool.slice(MCP_TOOL_PREFIX.length) : rawTool;
    if (SKRYENSYA_TOOL[name] !== true) continue;

    const args = item.arguments ?? {};
    const error = item.error;
    if (error !== null && error !== undefined) {
      records.push({
        name,
        args,
        error:
          error !== null && typeof error === "object" && typeof (error as { message?: unknown }).message === "string"
            ? (error as { message: string }).message
            : JSON.stringify(error),
      });
      continue;
    }

    const result = item.result;
    if (result === null || result === undefined) {
      records.push({ name, args, error: "MCP tool call completed without a result" });
      continue;
    }

    records.push(toRecord({ name, args }, result));
  }

  return records;
}

function toRecord(call: { name: string; args: unknown }, content: unknown): ToolCallRecord {
  const payload =
    content !== null && typeof content === "object" && "content" in content
      ? (content as { content?: unknown }).content
      : content;
  const text =
    typeof payload === "string"
      ? payload
      : Array.isArray(payload) &&
          payload[0] !== null &&
          typeof payload[0] === "object" &&
          (payload[0] as { type?: unknown }).type === "text" &&
          typeof (payload[0] as { text?: unknown }).text === "string"
        ? (payload[0] as { text: string }).text
        : undefined;

  if (text === undefined) return { name: call.name, args: call.args, result: content };

  try {
    return { name: call.name, args: call.args, result: JSON.parse(text) };
  } catch {
    return { name: call.name, args: call.args, error: `unparseable tool result: ${text.slice(0, 200)}` };
  }
}
