import { emitMarkup, emitReactSource } from "@skryensya/ai-compiler/emit";
import { signaturesIn } from "@skryensya/ai-compiler/usage-walk";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { EvalCase } from "../case.js";
import { brokenInvariants } from "../invariants.js";
import type { ToolCallRecord } from "./mcp-tools.js";

/** The shape `validate_ui`'s result carries (`ValidateOutcome` in @skryensya/ai-compiler/agent). */
interface ValidateUiResult {
  valid: boolean;
  problems: Array<{ path: string; message: string; severity: string }>;
  emitted: { vanilla: string; react: string } | null;
  css: string[];
}

/*
 * HOW THE AGENT GOT THERE, recorded so two workflows can be compared on the same cases: the
 * catalogue-first one and discovery. Diagnostic only; none of these fails a case.
 */
export interface WorkflowMetrics {
  toolCalls: number;
  /** `get_catalog` calls, i.e. catalogue pages read. */
  catalogPages: number;
  usedDiscovery: boolean;
  discoverCalls: number;
  validateCalls: number;
  /** `validate_ui` calls after the first: each one is a repair loop. */
  repairLoops: number;
  /** Calls to discover_ui, get_catalog, get_examples or get_contract before the first validate_ui. */
  discoveryCallsBeforeFirstValidate: number;
  /** Example ids fetched with `get_examples(id)`. */
  examplesRead: string[];
  /** Whether the final tree uses a signature from an example the agent read. */
  usedExample: boolean;
  /** The final tree's root, `contract/signature`. */
  selected?: string;
  /** Every signature the final tree uses. */
  signatures: string[];
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
  /**
   * The verdict: `valid` AND every semantic invariant of the case holds. A valid tree that picked
   * the wrong control (a Checkbox for an immediate setting) is structurally fine and still wrong.
   */
  passed: boolean;
  /** Invariants the final tree breaks, in words. Empty when all hold or the case declares none. */
  brokenInvariants: string[];
  metrics: WorkflowMetrics;
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
  const base = { caseId: evalCase.id, lang, prompt, toolSequence, calls };

  if (!last || last.error) {
    return {
      ...base,
      valid: false,
      passed: false,
      brokenInvariants: [],
      metrics: metricsOf(calls, undefined),
      reason: last ? `validate_ui call failed: ${last.error}` : "never called validate_ui",
    };
  }

  const result = last.result as ValidateUiResult;
  const finalTree = (last.args as { tree?: UsageTree } | undefined)?.tree;
  const metrics = metricsOf(calls, finalTree);

  if (!result.valid) {
    return {
      ...base,
      valid: false,
      passed: false,
      brokenInvariants: [],
      metrics,
      finalTree,
      reason: result.problems.map((problem) => `${problem.path}: ${problem.message}`).join("; "),
    };
  }

  const broken = finalTree ? brokenInvariants(finalTree, evalCase.invariants) : [];
  const referenceMarkup = emitMarkup(evalCase.tree);
  const referenceReact = emitReactSource(evalCase.tree).component;
  const matchesReferenceMarkup =
    result.emitted?.vanilla === referenceMarkup && result.emitted.react === referenceReact;

  return {
    ...base,
    valid: true,
    passed: broken.length === 0,
    brokenInvariants: broken,
    metrics,
    ...(broken.length > 0 ? { reason: `valid, but ${broken.join("; ")}` } : {}),
    finalTree,
    emitted: result.emitted ?? undefined,
    css: result.css,
    matchesReferenceMarkup,
  };
}

const DISCOVERY_TOOLS = new Set(["discover_ui", "get_catalog", "get_examples", "get_contract"]);

function metricsOf(calls: readonly ToolCallRecord[], finalTree: UsageTree | undefined): WorkflowMetrics {
  const count = (name: string) => calls.filter((call) => call.name === name).length;
  const firstValidate = calls.findIndex((call) => call.name === "validate_ui");
  const beforeValidate = firstValidate === -1 ? calls : calls.slice(0, firstValidate);
  const validateCalls = count("validate_ui");
  const examplesRead = calls
    .filter((call) => call.name === "get_examples" && typeof (call.args as { id?: unknown })?.id === "string")
    .map((call) => (call.args as { id: string }).id);
  const signatures = finalTree ? [...signaturesIn(finalTree)] : [];

  const exampleSignatures = new Set(
    calls
      .filter((call) => call.name === "get_examples" && (call.result as { tree?: UsageTree } | undefined)?.tree)
      .flatMap((call) => signaturesIn((call.result as { tree: UsageTree }).tree)),
  );
  // "Used" means the final tree shares a non-layout signature with an example the agent read.
  const layout = new Set(["Stack", "Inline", "Grid", "Box", "Text", "Heading"]);

  return {
    toolCalls: calls.length,
    catalogPages: count("get_catalog"),
    usedDiscovery: count("discover_ui") > 0,
    discoverCalls: count("discover_ui"),
    validateCalls,
    repairLoops: Math.max(0, validateCalls - 1),
    discoveryCallsBeforeFirstValidate: beforeValidate.filter((call) => DISCOVERY_TOOLS.has(call.name)).length,
    examplesRead,
    usedExample: signatures.some((id) => exampleSignatures.has(id) && !layout.has(id)),
    ...(finalTree ? { selected: `${finalTree.contract}/${finalTree.signature}` } : {}),
    signatures,
  };
}
