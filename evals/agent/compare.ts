import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { evalCases } from "../index.js";
import { brokenInvariants } from "../invariants.js";
import { metricsOf, type CaseScore, type WorkflowMetrics } from "./scoring.js";

/*
 * Two runs of `run-agent.ts`, side by side, case by case: the way a workflow change is measured
 * rather than asserted (ADR-0028). Reads only what each run wrote to disk; calls no model.
 *
 *   pnpm --filter @skryensya/evals exec tsx agent/compare.ts <runDirBefore> <runDirAfter>
 *
 * Metrics are RECOMPUTED from each run's recorded calls, so a run written before a metric existed
 * is still comparable. Verdicts are shown twice: as recorded, and re-judged against the CURRENT
 * invariants, which is how a richer invariant shows the earlier passes it would have failed.
 * Workflow metrics stay diagnostic: a run that took more calls and passed is still a pass.
 */
type Row = Pick<CaseScore, "caseId" | "lang" | "passed" | "valid" | "calls" | "finalTree">;
type Judged = Row & { metrics: WorkflowMetrics; rejudged: string };

function load(dir: string): Map<string, Judged> {
  const rows = new Map<string, Judged>();
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".json") && name !== "summary.json")) {
    const row = JSON.parse(readFileSync(join(dir, file), "utf8")) as Row;
    const evalCase = evalCases.find((candidate) => candidate.id === row.caseId);
    const broken = row.valid && row.finalTree && evalCase ? brokenInvariants(row.finalTree as UsageTree, evalCase.invariants) : [];
    rows.set(`${row.caseId} [${row.lang}]`, {
      ...row,
      metrics: metricsOf(row.calls, row.finalTree as UsageTree | undefined),
      rejudged: !row.valid ? "FAIL" : broken.length === 0 ? "pass" : `wrong (${broken.length})`,
    });
  }
  return rows;
}

const [beforeDir, afterDir] = process.argv.slice(2).map((dir) => resolve(process.cwd(), dir));
if (!beforeDir || !afterDir) {
  console.error("usage: tsx agent/compare.ts <runDirBefore> <runDirAfter>");
  process.exit(1);
}

const before = load(beforeDir);
const after = load(afterDir);
const verdict = (row?: Judged) => (!row ? "-" : row.passed ? "pass" : row.valid ? "valid, wrong" : "FAIL");
const pair = <T,>(pick: (row: Judged) => T, a?: Judged, b?: Judged) => `${a ? pick(a) : "-"} → ${b ? pick(b) : "-"}`;
const ranks = (row: Judged) => {
  const values = Object.values(row.metrics.discoveryRanks);
  return values.length === 0 ? "-" : values.map((rank) => rank ?? "∅").join(",");
};

console.log("| Case | Recorded | Re-judged now | Calls | Catalog pages | get_contract + get_contracts | Discovery candidates | Ranks of chosen | Repairs |");
console.log("|---|---|---|---|---|---|---|---|---|");
for (const key of [...new Set([...before.keys(), ...after.keys()])].sort()) {
  const a = before.get(key);
  const b = after.get(key);
  console.log(
    `| ${key} | ${verdict(a)} → ${verdict(b)} | ${pair((r) => r.rejudged, a, b)} | ${pair((r) => r.metrics.toolCalls, a, b)} | ` +
      `${pair((r) => r.metrics.catalogPages, a, b)} | ${pair((r) => `${r.metrics.contractCalls}+${r.metrics.contractBatchCalls}`, a, b)} | ` +
      `${pair((r) => r.metrics.discoverCandidates, a, b)} | ${pair(ranks, a, b)} | ${pair((r) => r.metrics.repairLoops, a, b)} |`,
  );
}
