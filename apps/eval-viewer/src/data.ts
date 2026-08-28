import type { UsageTree } from "@skryensya/core/usage-tree";
import { evalCases } from "../../../evals/index.js";

/*
 * Reads `evals/agent/runs/**\/*.json` straight off disk at dev time  -  no backend, no build step of
 * its own. Every case-run file `writeRunReport` (evals/agent/report.ts) writes is one JSON module;
 * `import.meta.glob` with `eager: true` loads the available JSON modules once. The viewer keeps the
 * hot path cheap by rendering compact run cards first and lazily mounting preview iframes only near
 * the viewport; the enormous MCP catalogue/contract payloads stay behind collapsed trace details.
 *
 * Grouped by CASE (the prompt), not by run: browsing "by run" answered "what did this one batch do",
 * which is the wrong question once there's more than one provider/model to compare  -  you end up
 * hunting the same case across several run folders by hand. Grouped by case, every execution of one
 * prompt (however many models, languages or runs produced it) sits together  -  "how did sonnet do
 * here vs. haiku" is one page, not a cross-reference  -  sorted newest-first within that page, so the
 * most recent attempt at a case is always the first row, not buried behind older ones alphabetized
 * by model.
 */


export interface ToolCallRecord {
  name: string;
  args: unknown;
  result?: unknown;
  error?: string;
}

export interface CaseRun {
  runId: string;
  provider: string;
  model: string;
  caseId: string;
  lang: "es" | "en";
  prompt: string;
  toolSequence: string[];
  calls: ToolCallRecord[];
  valid: boolean;
  reason?: string;
  finalTree?: UsageTree;
  emitted?: { vanilla: string; react: string; reactData?: unknown };
  css?: string[];
  matchesReferenceMarkup?: boolean;
}

export interface CaseGroup {
  caseId: string;
  promptEs: string;
  promptEn: string;
  /** Every execution of this case found on disk, most recent run first. */
  executions: CaseRun[];
}

const modules = import.meta.glob<CaseRun>("../../../evals/agent/runs/*/*.json", {
  eager: true,
  import: "default",
});

const allExecutions = Object.values(modules);

export function loadExecutions(): CaseRun[] {
  return [...allExecutions].sort(
    (a: CaseRun, b: CaseRun) =>
      b.runId.localeCompare(a.runId) ||
      a.caseId.localeCompare(b.caseId) ||
      a.model.localeCompare(b.model) ||
      a.lang.localeCompare(b.lang),
  );
}

/**
 * Every case the corpus KNOWS about (`evals/index.ts`), not just the ones with a run on disk. A case
 * nobody has executed yet is still worth seeing on the list  -  "this prompt exists and nobody has
 * tried it with any model" is exactly the kind of gap a reviewer of this corpus wants surfaced, not
 * hidden until the first run happens to fill it in.
 */
export function loadCaseGroups(): CaseGroup[] {
  const byCaseId = new Map<string, CaseRun[]>();
  for (const execution of allExecutions) {
    const list = byCaseId.get(execution.caseId) ?? [];
    list.push(execution);
    byCaseId.set(execution.caseId, list);
  }

  return evalCases.map((evalCase): CaseGroup => ({
    caseId: evalCase.id,
    promptEs: evalCase.prompt.es,
    promptEn: evalCase.prompt.en,
    // `runId` is a `toISOString()`-derived, fixed-width timestamp (`report.ts`'s `newRunId`), so
    // lexicographic order on it IS chronological order  -  no parsing needed just to sort.
    executions: (byCaseId.get(evalCase.id) ?? []).sort(
      (a, b) => b.runId.localeCompare(a.runId) || a.model.localeCompare(b.model) || a.lang.localeCompare(b.lang),
    ),
  }));
}

export function findCaseGroup(caseId: string): CaseGroup | undefined {
  return loadCaseGroups().find((group) => group.caseId === caseId);
}

export function findExecution(caseId: string, runId: string, lang: "es" | "en"): CaseRun | undefined {
  return allExecutions.find(
    (execution) => execution.caseId === caseId && execution.runId === runId && execution.lang === lang,
  );
}
