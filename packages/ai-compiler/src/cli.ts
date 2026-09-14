import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checkBindingConformance } from "./conformance.js";
import { checkStylingHooks } from "./hooks.js";
import { buildManifest, canonical } from "./manifest.js";
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
 * Then the styling hooks. A contract that declares an override surface the stylesheet does not have
 * is advertising something a consumer cannot use, and the failure reaches them as silence.
 */
const badHooks = checkStylingHooks();

if (badHooks.length > 0) {
  console.error("\n  HOOK_MISMATCH: nothing emitted\n");
  for (const problem of badHooks) {
    console.error(`    ${problem.sheet}  [${problem.rule}]`);
    console.error(`      ${problem.message}\n`);
  }
  process.exit(1);
}

/*
 * Then the snippets. They are published compositions, so a snippet naming a signature that changed
 * is the same failure as an overlay naming one: a tree an agent is invited to copy, teaching
 * something the catalogue no longer does.
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

/*
 * The two halves go to disk as they came back. They used to be completed here - `{ ...(index as
 * object), sourceHash }` - because `buildManifest` returned them without their own hash, which is
 * what forced three casts into the writer of a value the compiler had just built itself.
 */
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "ai-index.json"), canonical(index));
writeFileSync(join(outDir, "ai-manifest.json"), canonical(manifest));

const families = Object.keys(manifest.contracts).length;
console.log(`  ai-index.json + ai-manifest.json: ${families} families, sourceHash ${sourceHash}`);
