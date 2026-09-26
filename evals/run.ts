import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { evalCases } from "./index.js";
import { brokenInvariants, malformedInvariants } from "./invariants.js";

/*
 * THE FIRST SLICE OF F7, and only that slice: re-validates every case's hand-composed tree against
 * G0-G3, the same gate `validate_ui` runs. It proves a case that used to compose still does; it does
 * NOT prove an agent would arrive at that tree from the prompt alone with no other help, which is
 * what G6 actually asks (see evals/README.md). Wiring an agent into this loop is later work.
 */

const ids = new Set<string>();
const duplicates: string[] = [];
for (const evalCase of evalCases) {
  if (ids.has(evalCase.id)) duplicates.push(evalCase.id);
  ids.add(evalCase.id);
}

if (duplicates.length > 0) {
  console.error(`\n  EVAL_DUPLICATE_ID: ${duplicates.join(", ")}\n`);
  process.exit(1);
}

const failures: string[] = [];

for (const evalCase of evalCases) {
  const { problems } = validateUsageTree(evalCase.tree);
  const errors = problems.filter((problem) => problem.severity === "error");
  for (const error of errors) {
    failures.push(`${evalCase.id} · ${error.path}: ${error.message}`);
  }
  // A reference tree that breaks its own case's invariants means the invariant is wrong, or cannot
  // be met, and every live run would then fail for a reason no agent could fix.
  for (const broken of brokenInvariants(evalCase.tree, evalCase.invariants)) {
    failures.push(`${evalCase.id} · invariant: ${broken}`);
  }
  for (const malformed of malformedInvariants(evalCase.invariants)) {
    failures.push(`${evalCase.id} · malformed invariant: ${malformed}`);
  }
  /*
   * A counterexample is a VALID tree that is wrong for this intent. If it stops validating it proves
   * nothing about the invariants; if it breaks none of them, the invariants would pass that wrong
   * answer in a live run.
   */
  for (const [at, counter] of (evalCase.counterexamples ?? []).entries()) {
    const where = `${evalCase.id} · counterexample ${at + 1} (${counter.because})`;
    const counterErrors = validateUsageTree(counter.tree).problems.filter((problem) => problem.severity === "error");
    for (const error of counterErrors) failures.push(`${where} does not validate: ${error.path}: ${error.message}`);
    if (brokenInvariants(counter.tree, evalCase.invariants).length === 0) failures.push(`${where} breaks no invariant`);
  }
  for (const [at, alternative] of (evalCase.alternatives ?? []).entries()) {
    const where = `${evalCase.id} · alternative ${at + 1} (${alternative.because})`;
    const errors = validateUsageTree(alternative.tree).problems.filter((problem) => problem.severity === "error");
    for (const error of errors) failures.push(`${where} does not validate: ${error.path}: ${error.message}`);
    for (const broken of brokenInvariants(alternative.tree, evalCase.invariants)) failures.push(`${where} breaks: ${broken}`);
  }
}

if (failures.length > 0) {
  console.error(`\n  EVAL_INVALID: ${failures.length} case(s) no longer compose\n`);
  for (const failure of failures) console.error(`    ${failure}`);
  console.error("");
  process.exit(1);
}

const counters = evalCases.reduce((sum, evalCase) => sum + (evalCase.counterexamples?.length ?? 0), 0);
const alternatives = evalCases.reduce((sum, evalCase) => sum + (evalCase.alternatives?.length ?? 0), 0);
console.log(
  `  evals: ${evalCases.length} cases, all valid against G0-G3; ${counters} counterexamples, each valid and each ` +
    `caught; ${alternatives} alternative answer(s), each valid and each passing`,
);
