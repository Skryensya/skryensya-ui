/*
 * WHICH TEST FILES THE DOCS ACTUALLY DEMAND, read from the pages rather than kept beside them.
 *
 * `scripts/build-test-report.ts` used to carry a hand-written `TARGETS` array naming every test file
 * to run. It is the same fact the pages already state: a `*Page.astro` that shows a Tests tab names
 * its file in `tests={[{ file, … }]}`, and a file no page names is a file the report has no reason to
 * run. Two statements of one fact, and the hand-written one had drifted three entries past the pages
 * by the time this was written.
 *
 * DERIVING IT CLOSES THE GAP DOWNWARD, which is the direction worth noting: the array had 109 entries
 * against the 106 the pages demand, and the three extra were `theme-toggle`, `toolbar` (react) and
 * `toolbar` (vanilla) - suites being run for a tab nobody was showing. Nothing was missing. So the
 * failure this removes is cheap; the one it prevents is not, because a page that starts quoting a new
 * file and forgets the array renders a "not run" clock that looks exactly like a test that genuinely
 * has not run.
 *
 * SELF-CONTAINED ON PURPOSE. `scripts/tsconfig.json` is `strict` and `apps/docs` is not, so this file
 * is imported into two TypeScript programs with different settings. It reaches for `node:fs` and
 * nothing else - no `../i18n`, no Astro, no docs types - so neither program can manufacture an error
 * in the other's half.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** A test file one or more pages ask the report to run, split the way the report invokes vitest. */
export type DemandedFile = {
  /** Workspace-relative package directory, e.g. `packages/react`. The report's `cwd`. */
  readonly pkg: string;
  /** Package-relative path, e.g. `src/components/button.test.tsx`. The argument vitest receives. */
  readonly file: string;
};

/**
 * The `tests={[ … ]}` literal, bracket-matched rather than regexed to its end.
 *
 * A regex cannot find the closing bracket: the prop contains nested arrays (`tests: [ … ]` inside
 * each entry), so the first `]` is never the right one. Matching depth is the only way to read the
 * whole literal, and reading only part of it would silently drop a page's later files.
 */
function testsBlock(source: string): string | undefined {
  const at = source.indexOf("tests={[");
  if (at === -1) return undefined;

  let depth = 0;
  for (let i = source.indexOf("[", at); i < source.length; i++) {
    if (source[i] === "[") depth++;
    else if (source[i] === "]" && --depth === 0) return source.slice(at, i + 1);
  }
  return undefined;
}

/**
 * Every test file any `*Page.astro` names, deduped, sorted.
 *
 * Deduped because two pages may document one suite and the report must not run it twice; sorted so
 * the report's console output and `artifacts/test-results.json` are stable across machines.
 *
 * `repoRoot` is passed rather than derived: the two callers sit at different depths (the report in
 * `scripts/`, the docs build in `apps/docs/`), and a module that guesses its own distance from the
 * root is a module that breaks when someone moves it.
 */
export function demandedFiles(repoRoot: string): readonly DemandedFile[] {
  const pagesDir = join(repoRoot, "apps", "docs", "src", "components", "pages");
  const seen = new Set<string>();

  for (const page of readdirSync(pagesDir).filter((name) => name.endsWith("Page.astro"))) {
    const block = testsBlock(readFileSync(join(pagesDir, page), "utf8"));
    if (block === undefined) continue;

    for (const match of block.matchAll(/\bfile:\s*"((?:[^"\\]|\\.)*)"/g)) {
      seen.add(match[1]!.replace(/\\(.)/g, "$1"));
    }
  }

  return [...seen].sort().map((path) => {
    /*
     * `packages/react/src/components/button.test.tsx` splits after the workspace directory, which is
     * always two segments. BOTH ROOTS COUNT: 103 of the files quoted today live under `packages/*`
     * and three under `apps/docs` (`CardPage.test.ts`, `ChartsPage.test.ts`,
     * `examples/card-sources.test.ts`). Assuming `packages/` alone is what the first run of this
     * function did, and it threw on the first of those three - which is the behaviour to keep.
     *
     * A path outside both roots throws rather than inventing a `cwd`, because a silent partial read
     * is the failure this module exists to end.
     */
    const segments = path.split("/");
    const root = segments[0];
    if (segments.length < 3 || (root !== "packages" && root !== "apps")) {
      throw new Error(
        `A *Page.astro names the test file "${path}", which is under neither packages/ nor apps/. ` +
          `The report runs vitest from a workspace directory and cannot resolve this one.`,
      );
    }
    return { pkg: segments.slice(0, 2).join("/"), file: segments.slice(2).join("/") };
  });
}
