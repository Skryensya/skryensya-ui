/*
 * COMPOSITION GUIDE VALIDATOR, the shell.
 *
 * It reads the meta-schema and each AI guide, asks checks.mjs (gate 0: is the guide coherent with
 * itself) and gate1.mjs (gate 1: do the artefacts it names actually exist and import) to judge,
 * reports and exits. Gate 1 only runs once gate 0 passes for a schema — a schema whose own shape
 * is broken has nothing meaningful to resolve yet.
 *
 * Usage:  node docs/ai/validate.mjs [id …]     (no args = every schema in schemas/)
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { unsupportedKeywords, validateSchema } from "./checks.mjs";
import { checkArtifacts } from "./gate1.mjs";
import { buildWorld } from "./gate1-world.mjs";

const SCHEMA_DIR = join(import.meta.dirname, "schemas");
const read = (f) => JSON.parse(readFileSync(join(SCHEMA_DIR, f), "utf8"));

const meta = read("_meta.json");
const world = buildWorld();

// Before judging any instance: the meta document must be entirely within the subset this validator
// implements. An unimplemented keyword does not fail loudly, it passes silently, so a schema could
// look validated while a rule went unchecked.
const unsupported = unsupportedKeywords(meta);
if (unsupported.length) {
  console.error(`✗ _meta.json uses ${unsupported.length} keyword(s) checks.mjs does not implement:\n`);
  for (const k of unsupported) console.error(`    ${k}`);
  console.error("\n  Implement them in checks.mjs (and add them to SUPPORTED), or remove them from the meta-schema.");
  process.exit(1);
}

const requested = process.argv.slice(2);
const files = readdirSync(SCHEMA_DIR)
  .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  .filter((f) => requested.length === 0 || requested.includes(f.replace(/\.json$/, "")));

if (files.length === 0) {
  console.error(requested.length ? `✗ no schema matches ${requested.join(", ")}` : "✗ no schemas found");
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  const schema = read(file);
  const shapeProblems = validateSchema(schema, meta);
  // Gate 1 needs surfaces/composes to already be well-formed; a gate-0 failure has nothing
  // meaningful to resolve, so it would only add noise on top of the real problem.
  const artifactProblems = shapeProblems.length === 0 ? checkArtifacts(schema, world) : [];
  const problems = [...shapeProblems, ...artifactProblems];

  if (problems.length === 0) {
    console.log(`✓ ${file}`);
    continue;
  }
  failed += 1;
  console.error(`✗ ${file} — ${problems.length} problem(s):\n`);
  const byRule = {};
  for (const p of problems) (byRule[p.rule] ??= []).push(p);
  for (const [rule, items] of Object.entries(byRule)) {
    console.error(`  [${rule}]`);
    for (const p of items) console.error(`    ${p.where}: ${p.msg}`);
    console.error("");
  }
}

if (failed === 0) console.log(`\n✓ ${files.length} composition guide(s) valid (gate 0 + gate 1)`);
process.exit(failed ? 1 : 0);
