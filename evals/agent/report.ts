import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { CaseScore } from "./scoring.js";

/*
 * Everything a batch of `run-agent.ts` scores gets turned into files someone can actually open and
 * react to  -  the point of asking for this at all: reading a PASS/FAIL line in a terminal doesn't let
 * you see whether the tree the agent composed is one you'd want to ship.
 *
 * Two formats, two audiences: a `.md` per case is for a person to open and read (in an editor, on
 * GitHub, wherever); the matching `.json` is for `apps/eval-viewer` to read and RENDER the tree live,
 * not re-parse markup out of prose. Neither is derived from the other  -  both come straight from the
 * same `CaseScore`, so they can't drift.
 */

export interface RunMeta {
  runId: string;
  provider: string;
  model: string;
}

/** Directory-safe timestamp, close enough to ISO to sort correctly by name. */
export function newRunId(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function truncate(value: string, max = 4000): string {
  return value.length > max ? `${value.slice(0, max)}\n… (${value.length - max} more characters)` : value;
}

function codeBlock(lang: string, content: string): string {
  return `\`\`\`${lang}\n${content}\n\`\`\``;
}

function callTraceMd(score: CaseScore): string {
  if (score.calls.length === 0) return "_No tool calls at all._";
  return score.calls
    .map((call, index) => {
      const outcome = call.error
        ? `**error:** ${truncate(call.error, 800)}`
        : codeBlock("json", truncate(JSON.stringify(call.result, undefined, 2), 3000));
      return (
        `**${index + 1}. \`${call.name}\`**\n\n` +
        `args:\n${codeBlock("json", JSON.stringify(call.args, undefined, 2))}\n\n` +
        `result:\n${outcome}`
      );
    })
    .join("\n\n---\n\n");
}

function caseMd(meta: RunMeta, score: CaseScore): string {
  const verdict = score.valid ? "✅ PASS" : "❌ FAIL";
  const lines = [
    `# ${score.caseId} [${score.lang}]`,
    "",
    `**Verdict:** ${verdict}${score.matchesReferenceMarkup === false ? " (differs from reference tree)" : ""}`,
    `**Provider:** ${meta.provider} (${meta.model})`,
    "",
    "## Prompt",
    "",
    score.prompt,
    "",
  ];

  if (!score.valid) {
    lines.push("## Why it failed", "", score.reason ?? "(no reason recorded)", "");
  }

  if (score.finalTree) {
    lines.push("## Final tree", "", codeBlock("json", JSON.stringify(score.finalTree, undefined, 2)), "");
  }

  if (score.emitted) {
    lines.push(
      "## Emitted  -  Vanilla",
      "",
      codeBlock("html", score.emitted.vanilla),
      "",
      "## Emitted  -  React",
      "",
      codeBlock("tsx", score.emitted.react),
      "",
    );
  }

  lines.push("## Tool call trace", "", callTraceMd(score), "");

  return lines.join("\n");
}

function indexMd(meta: RunMeta, scores: readonly CaseScore[]): string {
  const rows = scores.map((score) => {
    const verdict = score.valid
      ? score.matchesReferenceMarkup === false
        ? "✅ valid (differs)"
        : "✅ valid"
      : "❌ FAIL";
    const file = caseFileBase(score);
    return `| ${score.caseId} | ${score.lang} | ${verdict} | [detail](./${file}.md) |`;
  });

  const passed = scores.filter((score) => score.valid).length;

  return [
    `# Eval run ${meta.runId}`,
    "",
    `**Provider:** ${meta.provider} (${meta.model})`,
    `**Result:** ${passed}/${scores.length} valid`,
    "",
    "| Case | Lang | Verdict | Detail |",
    "|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}

function caseFileBase(score: Pick<CaseScore, "caseId" | "lang">): string {
  return `${score.caseId}.${score.lang}`;
}

/** Writes `evals/agent/runs/<runId>/` and returns its absolute path. */
export async function writeRunReport(meta: RunMeta, scores: readonly CaseScore[]): Promise<string> {
  const runDir = join(import.meta.dirname, "runs", meta.runId);
  await mkdir(runDir, { recursive: true });

  await writeFile(join(runDir, "index.md"), indexMd(meta, scores), "utf8");

  await Promise.all(
    scores.map(async (score) => {
      const base = caseFileBase(score);
      await writeFile(join(runDir, `${base}.md`), caseMd(meta, score), "utf8");
      await writeFile(
        join(runDir, `${base}.json`),
        JSON.stringify({ runId: meta.runId, provider: meta.provider, model: meta.model, ...score }, undefined, 2),
        "utf8",
      );
    }),
  );

  return runDir;
}
