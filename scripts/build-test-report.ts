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

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Every test file a `*Page.astro` currently quotes via `tests={[...]}`. Add a line here when a
 *  second page adopts the Tests tab. */
const TARGETS = [
  { pkg: "packages/react", file: "src/components/accordion.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/accordion.svelte.test.ts" },
  { pkg: "packages/react", file: "src/components/skip-link.test.tsx" },
  { pkg: "packages/react", file: "src/components/avatar.test.tsx" },
  { pkg: "packages/react", file: "src/components/badge.test.tsx" },
  { pkg: "packages/react", file: "src/components/button.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/button.test.ts" },
  { pkg: "packages/react", file: "src/components/callout.test.tsx" },
  { pkg: "packages/react", file: "src/components/carousel.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/carousel.svelte.test.ts" },
  { pkg: "packages/react", file: "src/components/changelog.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/tile-checkbox.svelte.test.ts" },
  { pkg: "packages/vanilla", file: "src/components/code-preview.test.ts" },
  { pkg: "packages/react", file: "src/components/combobox.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/combobox.test.ts" },
  { pkg: "packages/vanilla", file: "src/components/component-preview.test.ts" },
  { pkg: "packages/react", file: "src/components/image-frame.test.tsx" },
  { pkg: "packages/react", file: "src/components/input.test.tsx" },
  { pkg: "packages/react", file: "src/components/form-field.test.tsx" },
  { pkg: "packages/react", file: "src/components/kbd.test.tsx" },
  { pkg: "packages/react", file: "src/components/list.test.tsx" },
  { pkg: "packages/react", file: "src/components/loader.test.tsx" },
  { pkg: "packages/react", file: "src/components/navbar.test.tsx" },
  { pkg: "packages/react", file: "src/components/pagination.test.tsx" },
  { pkg: "packages/react", file: "src/components/placeholder.test.tsx" },
  { pkg: "packages/react", file: "src/components/process-list.test.tsx" },
  { pkg: "packages/react", file: "src/components/progress.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/tile-radio-group.svelte.test.ts" },
  { pkg: "packages/vanilla", file: "src/components/segmented.test.ts" },
  { pkg: "packages/react", file: "src/components/sidebar.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/sidebar.test.ts" },
  { pkg: "packages/react", file: "src/components/steps.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/tile-switch.svelte.test.ts" },
  { pkg: "packages/react", file: "src/components/table.test.tsx" },
  { pkg: "packages/react", file: "src/components/tabs.test.tsx" },
  { pkg: "packages/react", file: "src/components/tag.test.tsx" },
  { pkg: "packages/core", file: "src/theme-toggle.test.ts" },
  { pkg: "packages/vanilla", file: "src/components/toast.test.ts" },
  { pkg: "packages/react", file: "src/components/tooltip.test.tsx" },
  { pkg: "packages/react", file: "src/components/layout.test.tsx" },
  { pkg: "packages/react", file: "src/components/typography.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/calendar.svelte.test.ts" },
  { pkg: "packages/vanilla", file: "src/components/date-picker.svelte.test.ts" },
  { pkg: "packages/vanilla", file: "src/components/time-field.svelte.test.ts" },
  { pkg: "packages/react", file: "src/components/dialog.test.tsx" },
  { pkg: "packages/react", file: "src/components/vaul.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/vaul-gesture.test.ts" },
  { pkg: "packages/react", file: "src/components/select.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/select.test.ts" },
  { pkg: "packages/react", file: "src/components/slider.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/slider.test.ts" },
  { pkg: "packages/react", file: "src/components/stat.test.tsx" },
  { pkg: "packages/react", file: "src/components/tile.test.tsx" },
  { pkg: "packages/react", file: "src/components/toc.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/tree-view.test.ts" },
  { pkg: "packages/vanilla", file: "src/components/treegrid.test.ts" },
  { pkg: "packages/react", file: "src/components/treegrid.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/toolbar.test.ts" },
  { pkg: "packages/react", file: "src/components/toolbar.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/slider-range.test.ts" },
  { pkg: "packages/react", file: "src/components/slider-range.test.tsx" },
  { pkg: "packages/react", file: "src/components/meter.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/data-grid.test.ts" },
  { pkg: "packages/react", file: "src/components/data-grid.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/nav-list.test.ts" },
  { pkg: "packages/react", file: "src/components/nav-list.test.tsx" },
  { pkg: "packages/react", file: "src/components/feed.test.tsx" },
  { pkg: "packages/react", file: "src/components/comment-thread.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/comment-thread.test.ts" },
  { pkg: "packages/core", file: "src/menubar.test.ts" },
  { pkg: "packages/react", file: "src/components/menubar.test.tsx" },
  { pkg: "packages/react", file: "src/components/command-palette.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/command-palette.test.ts" },
  { pkg: "packages/react", file: "src/components/icon.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/menu.test.ts" },
  { pkg: "packages/react", file: "src/components/menu.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/number-field.test.ts" },
  { pkg: "packages/react", file: "src/components/number-field.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/megamenu.test.ts" },
  { pkg: "packages/react", file: "src/components/megamenu.test.tsx" },
  { pkg: "packages/react", file: "src/components/tree-view.test.tsx" },
  { pkg: "packages/react", file: "src/components/component-preview.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/file-upload.test.ts" },
  { pkg: "packages/react", file: "src/components/file-upload.test.tsx" },
  { pkg: "packages/react", file: "src/components/empty-state.test.tsx" },
  { pkg: "packages/react", file: "src/components/split-button.test.tsx" },
  { pkg: "packages/core", file: "src/folder.test.ts" },
  { pkg: "packages/react", file: "src/components/folder.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/folder.test.ts" },
  { pkg: "packages/react", file: "src/components/popover.test.tsx" },
  { pkg: "packages/core", file: "src/qr-code.test.ts" },
  { pkg: "packages/react", file: "src/components/qr-code.test.tsx" },
  { pkg: "apps/docs", file: "src/examples/card-sources.test.ts" },
  { pkg: "apps/docs", file: "src/components/pages/CardPage.test.ts" },
  { pkg: "apps/docs", file: "src/components/pages/ChartsPage.test.ts" },
  { pkg: "packages/charts", file: "src/react/chart.test.tsx" },
  { pkg: "packages/react", file: "src/components/breadcrumb.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/breadcrumb.test.ts" },
  { pkg: "packages/react", file: "src/components/back-to-top.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/back-to-top.test.ts" },
  { pkg: "packages/react", file: "src/components/marquee.test.tsx" },
  { pkg: "packages/vanilla", file: "src/components/marquee.test.ts" },
];

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
