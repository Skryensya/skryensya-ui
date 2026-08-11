import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { evalCases } from "./index.js";

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
}

if (failures.length > 0) {
  console.error(`\n  EVAL_INVALID: ${failures.length} case(s) no longer compose\n`);
  for (const failure of failures) console.error(`    ${failure}`);
  console.error("");
  process.exit(1);
}

console.log(`  evals: ${evalCases.length} cases, all valid against G0-G3`);
