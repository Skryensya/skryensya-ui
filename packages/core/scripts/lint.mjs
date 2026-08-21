/*
 * Stylesheet-native token validator, the SHELL.
 *
 * The design system is authored as CSS plus Sass where CSS has no macro, so the enforcement
 * layer reads the source stylesheets directly, via scripts/parse.mjs, the same parser the docs
 * site's token reference consumes. Sharing it is deliberate (ADR-19): a reference generated from
 * a different reading of the source than the one the rules are checked against could describe a
 * system nobody validates.
 *
 * This file does three things and no judging: it PARSES (parse.mjs), it asks the rules to JUDGE
 * (checks.mjs → runChecks), and it REPORTS and exits. The rules moved to checks.mjs so they could
 * be tested in isolation, corpus in, Problem[] out, instead of running as import side-effects that
 * ended in process.exit and had no test surface. See scripts/checks.test.mjs.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CSS_DIR, parseTokens } from "./parse.mjs";
import { runChecks } from "./checks.mjs";

const PKG_ROOT = join(import.meta.dirname, "..");

const corpus = parseTokens(CSS_DIR);

// The contrast contract is data (ADR-19); an absent file skips the check rather than failing.
let pairs = null;
try {
  pairs = JSON.parse(readFileSync(join(PKG_ROOT, "contrast-pairs.json"), "utf8")).pairs;
} catch {
  pairs = null;
}

const problems = runChecks(corpus, pairs);

if (problems.length === 0) {
  console.log("✓ lint passed, refs, tiers, modes, contrast and names clean");
  process.exit(0);
}
const byRule = {};
for (const p of problems) (byRule[p.rule] ??= []).push(p);
console.error(`✗ ${problems.length} problem(s):\n`);
for (const [rule, items] of Object.entries(byRule)) {
  console.error(`  [${rule}]`);
  for (const p of items) console.error(`    ${p.where}: ${p.msg}`);
  console.error("");
}
process.exit(1);
