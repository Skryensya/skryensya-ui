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
    const source = readFileSync(join(pagesDir, page), "utf8");

    /*
     * BOTH SHAPES, because the tab has two and the report has to run whatever either one names.
     *
     * Reading only `tests={[…]}` is not a hypothetical gap: migrating 67 pages to `testFiles` took
     * this function from 106 files to 4 in one change, which would have quietly stopped the report
     * running almost every suite the docs display. The rows would still have rendered - as "not run"
     * clocks, the failure mode this whole module exists to remove.
     */
    const block = testsBlock(source);
    if (block !== undefined) {
      for (const match of block.matchAll(/\bfile:\s*"((?:[^"\\]|\\.)*)"/g)) {
        seen.add(match[1]!.replace(/\\(.)/g, "$1"));
      }
    }

    const at = source.indexOf("testFiles={[");
    if (at !== -1) {
      const close = source.indexOf("]", at);
      for (const match of source.slice(at, close).matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
        seen.add(match[1]!.replace(/\\(.)/g, "$1"));
      }
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

/** One row of the Tests tab: a real `it()` title, and whatever prose a page has authored for it. */
export type SuiteRow = {
  /** The title exactly as the test file declares it. THE key `test-results.json` is written under. */
  readonly title: string;
  /** Authored, translated prose. Absent until someone writes it. */
  readonly description?: string;
};

export type Suite = {
  /** Repo-relative, exactly as the report keys it. */
  readonly file: string;
  /** Declaration order, as the file reads. */
  readonly rows: readonly SuiteRow[];
  /**
   * Titles this reader deliberately does not treat as rows: a template literal or an `it.each` has no
   * fixed string to look up, and `tests-prop.test.ts` already conceded the point ("a template literal
   * is not a lookup key anyway"). Reported rather than dropped silently, so an author can see that a
   * test exists and is simply not addressable here.
   */
  readonly skipped: number;
};

/**
 * Every title `file` declares, in declaration order.
 *
 * THE POINT OF READING THEM RATHER THAN QUOTING THEM: the title and the test move together. A page
 * that quotes a title gets a "not run" clock the moment someone rewords it - indistinguishable, to a
 * reader, from a test that genuinely did not run. Seven rows had drifted that way before
 * `tests-prop.test.ts` was written to catch it, and that check is a regex over two file formats
 * precisely because neither side was a value anything could import.
 *
 * Reads the TEST SOURCE, never `artifacts/test-results.json`. That keeps CONTRIBUTING's rule intact:
 * "a stale report should degrade one tab, not fail the whole build". A missing report still renders
 * every row with a neutral clock; a missing test file is a build error, because a page naming a test
 * that does not exist is always wrong.
 */
export function suite(repoRoot: string, file: string): Suite {
  const source = readFileSync(join(repoRoot, file), "utf8");

  const quoted = [...source.matchAll(/\bit(?:\.\w+)?\(\s*(["'])((?:[^\\]|\\.)*?)\1/g)].map((match) =>
    match[2]!.replace(/\\(.)/g, "$1"),
  );
  const templated = [...source.matchAll(/\bit(?:\.\w+)?\(\s*`/g)].length;

  if (quoted.length === 0 && templated === 0) {
    throw new Error(
      `No it(...) titles in ${file}. A page names it as a test file, so either the path is wrong or ` +
        `the file stopped declaring tests.`,
    );
  }

  return { file, rows: quoted.map((title) => ({ title })), skipped: templated };
}
