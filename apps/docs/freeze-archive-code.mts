/*
 * FREEZE THE CODE AN ARCHIVED PAGE SHOWS.
 *
 * A docs archive is supposed to show the code that version generated, and *generated* is the load
 * bearing word: a usage tree is not source, it is INPUT to the emitter, and both the emitter and the
 * contract it reads move forward with the repository. Emitting a tree while rendering an archived
 * page would print today's markup under yesterday's prose, which is the one thing the version axis
 * exists to prevent (ADR-0022).
 *
 * So the cut emits once and stores the STRINGS. This script is that step, standing in for the cut
 * script that does not exist yet: it reads the trees an archived page declares, emits both bindings
 * with the compiler as it is today, and writes the result beside them. Re-running it is a deliberate
 * act, the same way `scripts/build-test-report.ts` is deliberate: neither belongs in `check` or
 * `build`, because a build that silently re-freezes an archive has not frozen anything.
 *
 *   pnpm --filter @skryensya/docs exec tsx freeze-archive-code.mts
 *   pnpm --filter @skryensya/docs exec tsx freeze-archive-code.mts --check
 *
 * `--check` fails when the stored snippets no longer match what the compiler emits. That failure is
 * NOT a thing to fix by re-running: on a real archive it means the code drifted from the cut, and
 * the answer is to leave the archive alone. It exists for the prototype, where the archive and the
 * living site are still the same release.
 */
import { emitMarkup, emitReactSource } from "@skryensya/ai-compiler/emit";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { archivedButtonTrees } from "./src/components/pages/frozen/v0.0.1-dev/button.trees.ts";

const ARCHIVES = [
  {
    version: "0.0.1-dev",
    trees: archivedButtonTrees,
    source: "src/components/pages/frozen/v0.0.1-dev/button.trees.ts",
    out: "src/components/pages/frozen/v0.0.1-dev/button.emitted.json",
    /* The React component each snippet is wrapped in. Named per tree so the source reads like
     * something someone would actually paste, not like `ButtonExample` three times. */
    componentNames: { variants: "ButtonVariants", sizes: "ButtonSizes", link: "ButtonLink" } as Record<string, string>,
  },
];

const check = process.argv.includes("--check");
const here = import.meta.dirname;
let stale = false;

for (const archive of ARCHIVES) {
  const snippets = Object.fromEntries(
    Object.entries(archive.trees).map(([key, tree]) => [
      key,
      {
        /* `fillDefaults: false` for the same reason ComponentPreview uses it: the panel shows what an
         * author WRITES, not the fully expanded attribute set. */
        html: emitMarkup(tree, { fillDefaults: false }),
        react: emitReactSource(tree, { component: archive.componentNames[key] }).component,
      },
    ]),
  );

  const document = {
    /* Stamped, because the whole value of this file is that it is old on purpose. */
    version: archive.version,
    frozenFrom: archive.source,
    generatedAt: new Date().toISOString().slice(0, 10),
    snippets,
  };

  const path = join(here, archive.out);
  const next = `${JSON.stringify(document, null, 2)}\n`;
  const current = (() => {
    try {
      return readFileSync(path, "utf8");
    } catch {
      return "";
    }
  })();

  /* `generatedAt` is the one field allowed to differ: re-running on another day must not read as a
   * change to the code, or `--check` would fail every morning. */
  const withoutDate = (value: string) => value.replace(/"generatedAt": "[^"]*",\n/, "");

  if (check) {
    if (withoutDate(current) !== withoutDate(next)) {
      console.error(`  stale: ${archive.out} no longer matches what the compiler emits.`);
      stale = true;
    } else {
      console.log(`  ${archive.out}: matches the compiler.`);
    }
    continue;
  }

  writeFileSync(path, next);
  console.log(`  ${archive.out}: ${Object.keys(snippets).length} snippets, both bindings.`);
}

if (stale) process.exit(1);
