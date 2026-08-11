import report from "@artifacts/test-results.json";

/*
 * THE TEST RESULTS, AS THE PAGE READS THEM.
 *
 * Source is `artifacts/test-results.json`, written by `scripts/build-test-report.mjs` from a real
 * `vitest run --reporter=json`, not a status hand-typed next to each description. A hand-typed
 * "passed" would still say passed after the test broke; this can only say what the last real run
 * said. Keyed by `[repoPath][it-title]`, so it stays a lookup rather than a second list to keep in
 * sync with `*Page.astro`'s `tests={[...]}` prop by hand.
 *
 * Unlike `contract-reference.ts`'s manifest read, a miss here does not throw: the artifact is a
 * separate, by-hand build step (not part of `turbo check`), so a fresh checkout that has not run it
 * yet would otherwise break every page with a Tests tab. `testStatus` returns "unknown" instead, and
 * `TestCoverage.astro` renders that as a neutral, unrun icon rather than a false pass or a crash.
 */

type Status = "passed" | "failed" | "skipped" | "todo";

type Report = {
  readonly generatedAt: string;
  readonly results: Readonly<Record<string, Readonly<Record<string, Status>>>>;
};

const compiled = report as unknown as Report;

const warned = new Set<string>();

/** `"unknown"` covers both a file the report never ran and an `it()` title that drifted from the one
 *  a `*Page.astro` quotes; the console warning is what tells a build which of the two it is. */
export function testStatus(file: string, name: string): Status | "unknown" {
  const status = compiled.results[file]?.[name];
  if (status) return status;

  const key = `${file}::${name}`;
  if (!warned.has(key)) {
    warned.add(key);
    console.warn(
      `[docs] test-results.json has no entry for "${name}" in ${file}. Run \`node scripts/build-test-report.mjs\`, ` +
        "or check the name matches the real it() title verbatim.",
    );
  }
  return "unknown";
}
