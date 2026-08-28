import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkBindingConformance } from "./conformance.js";
import { buildManifest, canonical } from "./manifest.js";
import { checkRecipes } from "./recipes.js";
import { checkSnippets } from "./snippets.js";

/*
 * `ai:contract:build`. Emits the artifacts and refuses to emit anything at all when two sources
 * disagree: the compiler does not decide silently between two truths (decision 28), it names both
 * origins and stops.
 */

const root = process.argv[2] ?? process.cwd();
const overlayDir = join(root, "contracts", "semantic");
const changelogDir = join(root, "contracts", "changelog");
const outDir = join(root, "artifacts");

const { index, manifest, conflicts, sourceHash } = buildManifest(overlayDir, changelogDir);

// G1 first: a manifest whose bindings do not realize it would describe a contract nobody keeps.
const drift = checkBindingConformance(root);

if (drift.length > 0) {
  console.error("\n  BINDING_DRIFT: nothing emitted\n");
  for (const problem of drift) {
    console.error(`    ${problem.file}:${problem.line}`);
    console.error(`      ${problem.message}\n`);
  }
  process.exit(1);
}

/*
 * Then the recipes. They are published compositions, so a recipe naming a signature that changed is
 * the same failure as an overlay naming one: a screen an agent is invited to copy, teaching
 * something the catalogue no longer does.
 */
const badRecipes = checkRecipes();

if (badRecipes.length > 0) {
  console.error("\n  RECIPE_INVALID: nothing emitted\n");
  for (const problem of badRecipes) console.error(`    ${problem}`);
  console.error("");
  process.exit(1);
}

/*
 * Then the snippets: one scope below recipes, same reasoning. A snippet naming a signature that
 * changed is the same failure  -  a tree an agent is invited to copy, teaching something the
 * catalogue no longer does.
 */
const badSnippets = checkSnippets();

if (badSnippets.length > 0) {
  console.error("\n  SNIPPET_INVALID: nothing emitted\n");
  for (const problem of badSnippets) console.error(`    ${problem}`);
  console.error("");
  process.exit(1);
}

if (conflicts.length > 0) {
  console.error("\n  CONTRACT_CONFLICT: nothing emitted\n");
  for (const conflict of conflicts) console.error(`    ${conflict}`);
  console.error("");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "ai-index.json"), canonical({ ...(index as object), sourceHash }));
writeFileSync(join(outDir, "ai-manifest.json"), canonical({ ...(manifest as object), sourceHash }));

const families = Object.keys((manifest as { contracts: object }).contracts).length;
console.log(`  ai-index.json + ai-manifest.json: ${families} families, sourceHash ${sourceHash}`);
