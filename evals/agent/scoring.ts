import { emitMarkup, emitReactSource } from "@skryensya/ai-compiler/emit";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { EvalCase } from "../case.js";
import type { ToolCallRecord } from "./mcp-tools.js";

/** The shape `validate_ui`'s tool result actually carries (`ok()` in packages/mcp/src/index.ts). */
interface ValidateUiResult {
  valid: boolean;
  problems: Array<{ path: string; message: string; severity: string }>;
  emitted: { vanilla: string; react: string } | null;
  css: string[];
}

export interface CaseScore {
  caseId: string;
  lang: "es" | "en";
  /** The exact prompt sent, for a report that stands alone without cross-referencing the case file. */
  prompt: string;
  /** Every tool name the agent called, in order: the shape of its own workflow, not ours. */
  toolSequence: string[];
  /** The full trace behind `toolSequence`: every call's args and result/error, for a human to read. */
  calls: ToolCallRecord[];
  /**
   * PASS/FAIL, the only thing that decides the run's exit code: did the agent's LAST `validate_ui`
   * call come back valid? Everything else below is diagnostic, never punitive; see the module doc
   * in `harness.ts` for why an exact-markup mismatch does not fail a case.
   */
  valid: boolean;
  /** Why `valid` is false: no `validate_ui` call at all, or its last call's own `problems`. */
  reason?: string;
  /** The tree the agent's last `validate_ui` call actually sent, for a human to read back. */
  finalTree?: UsageTree;
  /** The code `validate_ui` emitted for `finalTree`, only present when `valid` is true. */
  emitted?: { vanilla: string; react: string };
  /** Every stylesheet `finalTree` needs, only present when `valid` is true  -  for the viewer app. */
  css?: string[];
  /**
   * Whether the agent's own emitted markup matches what the reference tree in the case file emits.
   * `undefined` when `valid` is false (nothing to compare). A `false` here is NOT a failure: two
   * valid trees can express the same intent through different signatures, and the reference tree is
   * one example, not the only correct answer.
   */
  matchesReferenceMarkup?: boolean;
}

/**
 * Scores one case from its tool-call log. Never calls a model itself: `harness.ts` already ran the
 * conversation; this only reads what came out of it.
 */
export function scoreCase(evalCase: EvalCase, lang: "es" | "en", calls: ToolCallRecord[]): CaseScore {
  const prompt = evalCase.prompt[lang];
  const toolSequence = calls.map((call) => call.name);
  const validateCalls = calls.filter((call) => call.name === "validate_ui");
  const last = validateCalls.at(-1);

  if (!last) {
    return {
      caseId: evalCase.id,
      lang,
      prompt,
      toolSequence,
      calls,
      valid: false,
      reason: "never called validate_ui",
    };
  }

  if (last.error) {
    return {
      caseId: evalCase.id,
      lang,
      prompt,
      toolSequence,
      calls,
      valid: false,
      reason: `validate_ui call failed: ${last.error}`,
    };
  }

  const result = last.result as ValidateUiResult;
  const finalTree = (last.args as { tree?: UsageTree } | undefined)?.tree;

  if (!result.valid) {
    return {
      caseId: evalCase.id,
      lang,
      prompt,
      toolSequence,
      calls,
      valid: false,
      finalTree,
      reason: result.problems.map((problem) => `${problem.path}: ${problem.message}`).join("; "),
    };
  }

  const referenceMarkup = emitMarkup(evalCase.tree);
  const referenceReact = emitReactSource(evalCase.tree).component;
  const matchesReferenceMarkup =
    result.emitted?.vanilla === referenceMarkup && result.emitted.react === referenceReact;

  return {
    caseId: evalCase.id,
    lang,
    prompt,
    toolSequence,
    calls,
    valid: true,
    finalTree,
    emitted: result.emitted ?? undefined,
    css: result.css,
    matchesReferenceMarkup,
  };
}
