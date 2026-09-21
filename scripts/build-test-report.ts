#!/usr/bin/env node
/*
 * Runs the real test files the docs' "Tests" tab quotes, and writes their pass/fail per-test to
 * `artifacts/test-results.json`. `TestCoverage.astro` reads that artifact and keys into it by
 * `[file][it-title]`; the it() title in each entry below has to match the real one verbatim, or the
 * lookup misses and the docs page falls back to a "not run" clock icon (see test-results.ts).
 *
 * Not wired into `turbo check`/`build`: unlike `ai-compiler`'s manifest (which every doc read
 * depends on), a stale test-results.json only degrades one tab's icons, not the page, so failing the
 * whole build over it would be the wrong trade. Run it by hand after touching a tracked test file:
 *
 *   node scripts/build-test-report.ts
 *   node scripts/build-test-report.ts --only button    # just the suites one page quotes
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { demandedFiles } from "../apps/docs/src/lib/test-suite.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/*
 * Every test file a `*Page.astro` quotes, DERIVED FROM THE PAGES rather than listed here.
 *
 * This used to be a hand-written array of 109 entries. The pages demanded 106, and the three extra
 * (`theme-toggle`, and `toolbar` in both bindings) were suites this script ran for a Tests tab that
 * no longer showed them. Nothing was missing in the other direction - the list was consistent by
 * care, the way `component-registry.test.ts` says the docs registries were - but care is what
 * `demandedFiles` stops being the mechanism.
 */
const ALL_TARGETS = demandedFiles(root);

/*
 * `--only <substring>[,<substring>…]` narrows the run to the suites a change actually touched, the
 * same lever `build-preview-heights.ts` already gives its own crawl and for the same reason: a full
 * pass is 109 vitest invocations, and re-running all of them to refresh two files is minutes of
 * waiting plus a diff nobody asked for.
 *
 * MERGED, NOT REPLACED, which is the whole reason this is safe: a narrowed run reads the existing
 * artifact and overwrites only the files it re-ran, so the suites it skipped keep the status they
 * were last measured at rather than silently dropping out of the tab.
 */
const onlyIndex = process.argv.indexOf("--only");
const only =
  onlyIndex === -1
    ? null
    : (process.argv[onlyIndex + 1] ?? "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

const TARGETS = only
  ? ALL_TARGETS.filter(({ pkg, file }) => only.some((needle) => `${pkg}/${file}`.includes(needle)))
  : ALL_TARGETS;

if (TARGETS.length === 0) {
  console.error(`  --only ${only?.join(",")} matched none of the ${ALL_TARGETS.length} suites the docs quote.`);
  process.exit(1);
}

interface VitestJsonReport {
  testResults: {
    assertionResults: { title: string; status: string }[];
  }[];
}

/* A narrowed run starts from what is already recorded; a full one starts from nothing, so a suite a
   page stopped quoting disappears instead of lingering. */
const previous = (() => {
  if (!only) return {};
  try {
    return (JSON.parse(readFileSync(join(root, "artifacts", "test-results.json"), "utf8")) as {
      results?: Record<string, Record<string, string>>;
    }).results ?? {};
  } catch {
    return {};
  }
})();

const results: Record<string, Record<string, string>> = { ...previous };

for (const { pkg, file } of TARGETS) {
  const cwd = join(root, pkg);
  const stdout = execFileSync("npx", ["vitest", "run", file, "--reporter=json"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const report = JSON.parse(stdout) as VitestJsonReport;
  const repoPath = `${pkg}/${file}`;
  const byTitle: Record<string, string> = {};
  for (const suite of report.testResults) {
    for (const assertion of suite.assertionResults) {
      byTitle[assertion.title] = assertion.status;
    }
  }
  results[repoPath] = byTitle;
  const passed = Object.values(byTitle).filter((s) => s === "passed").length;
  console.log(`  ${repoPath}: ${passed}/${Object.keys(byTitle).length} passed`);
}

mkdirSync(join(root, "artifacts"), { recursive: true });
writeFileSync(
  join(root, "artifacts", "test-results.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
);
console.log(`\n  artifacts/test-results.json written.`);
