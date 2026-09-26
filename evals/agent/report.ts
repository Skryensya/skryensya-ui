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
  workflow: string;
  server: string;
}

/** Aggregates over one run, the numbers two workflows are compared on. Written to `summary.json`. */
export interface RunSummary {
  runs: number;
  passed: number;
  valid: number;
  usedDiscovery: number;
  usedExample: number;
  meanToolCalls: number;
  meanCatalogPages: number;
  meanDiscoveryCallsBeforeFirstValidate: number;
  meanRepairLoops: number;
  /** Valid trees that broke an invariant: what validity alone would have passed. */
  validButWrong: number;
  meanContractCalls: number;
  meanContractBatchCalls: number;
  meanDiscoverCandidates: number;
  /** Mean best discovery rank of the final trees' non-layout signatures, over those discovery returned. */
  meanDiscoveryRank: number | null;
  /** How many of those signatures discovery never returned at all. */
  missedByDiscovery: number;
}

export function summarize(scores: readonly CaseScore[]): RunSummary {
  const allRanks = scores.flatMap((score) => Object.values(score.metrics.discoveryRanks));
  const ranks = allRanks.filter((rank): rank is number => rank !== null);
  const mean = (pick: (score: CaseScore) => number) =>
    scores.length === 0 ? 0 : Math.round((scores.reduce((sum, score) => sum + pick(score), 0) / scores.length) * 100) / 100;
  return {
    runs: scores.length,
    passed: scores.filter((score) => score.passed).length,
    valid: scores.filter((score) => score.valid).length,
    usedDiscovery: scores.filter((score) => score.metrics.usedDiscovery).length,
    usedExample: scores.filter((score) => score.metrics.usedExample).length,
    meanToolCalls: mean((score) => score.metrics.toolCalls),
    meanCatalogPages: mean((score) => score.metrics.catalogPages),
    meanDiscoveryCallsBeforeFirstValidate: mean((score) => score.metrics.discoveryCallsBeforeFirstValidate),
    meanRepairLoops: mean((score) => score.metrics.repairLoops),
    validButWrong: scores.filter((score) => score.valid && !score.passed).length,
    meanContractCalls: mean((score) => score.metrics.contractCalls),
    meanContractBatchCalls: mean((score) => score.metrics.contractBatchCalls),
    meanDiscoverCandidates: mean((score) => score.metrics.discoverCandidates),
    meanDiscoveryRank: ranks.length === 0 ? null : Math.round((ranks.reduce((a, b) => a + b, 0) / ranks.length) * 100) / 100,
    missedByDiscovery: allRanks.filter((rank) => rank === null).length,
  };
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
  const verdict = score.passed ? "✅ PASS" : "❌ FAIL";
  const lines = [
    `# ${score.caseId} [${score.lang}]`,
    "",
    `**Verdict:** ${verdict}${score.matchesReferenceMarkup === false ? " (differs from reference tree)" : ""}`,
    `**Provider:** ${meta.provider} (${meta.model}), workflow \`${meta.workflow}\``,
    `**Selected:** ${score.metrics.selected ?? "(none)"}; tool calls ${score.metrics.toolCalls}, catalogue pages ` +
      `${score.metrics.catalogPages}, discover_ui ${score.metrics.discoverCalls}, repair loops ` +
      `${score.metrics.repairLoops}, examples read ${score.metrics.examplesRead.join(", ") || "none"}`,
    "",
    "## Prompt",
    "",
    score.prompt,
    "",
  ];

  if (!score.passed) {
    lines.push("## Why it failed", "", score.reason ?? "(no reason recorded)", "");
  }
  if (score.brokenInvariants.length > 0) {
    lines.push("## Broken invariants", "", ...score.brokenInvariants.map((broken) => `- ${broken}`), "");
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
    const verdict = score.passed
      ? score.matchesReferenceMarkup === false
        ? "✅ pass (differs)"
        : "✅ pass"
      : score.valid
        ? "❌ valid, wrong choice"
        : "❌ FAIL";
    const file = caseFileBase(score);
    const m = score.metrics;
    return (
      `| ${score.caseId} | ${score.lang} | ${verdict} | ${m.selected ?? ""} | ${m.toolCalls} | ${m.catalogPages} | ` +
      `${m.discoverCalls} | ${m.contractCalls} / ${m.contractBatchCalls} | ${m.discoveryCallsBeforeFirstValidate} | ${m.repairLoops} | ${m.usedExample ? "yes" : ""} | ` +
      `[detail](./${file}.md) |`
    );
  });

  const summary = summarize(scores);

  return [
    `# Eval run ${meta.runId}`,
    "",
    `**Provider:** ${meta.provider} (${meta.model})`,
    `**Workflow:** ${meta.workflow} (\`${meta.server}\`)`,
    `**Result:** ${summary.passed}/${summary.runs} passed, ${summary.valid}/${summary.runs} valid`,
    `**Means:** ${summary.meanToolCalls} tool calls, ${summary.meanCatalogPages} catalogue pages, ` +
      `${summary.meanDiscoveryCallsBeforeFirstValidate} discovery calls before the first validate_ui, ` +
      `${summary.meanRepairLoops} repair loops, ${summary.meanContractCalls} get_contract + ` +
      `${summary.meanContractBatchCalls} get_contracts, ${summary.meanDiscoverCandidates} discovery candidates read, ` +
      `chosen signatures at discovery rank ${summary.meanDiscoveryRank ?? "n/a"} (${summary.missedByDiscovery} never returned)`,
    `**Valid but wrong:** ${summary.validButWrong} (valid trees an invariant rejected)`,
    "",
    "| Case | Lang | Verdict | Selected | Calls | Catalog pages | discover_ui | Contracts (single / batch) | Before 1st validate | Repairs | Example used | Detail |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|",
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
  await writeFile(join(runDir, "summary.json"), JSON.stringify({ ...meta, ...summarize(scores) }, undefined, 2), "utf8");

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
