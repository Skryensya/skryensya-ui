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
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
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
const TARGETS = demandedFiles(root);

interface VitestJsonReport {
  testResults: {
    assertionResults: { title: string; status: string }[];
  }[];
}

const results: Record<string, Record<string, string>> = {};

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
