import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * EVERY TITLE A PAGE QUOTES IS A TITLE A TEST ACTUALLY HAS.
 *
 * The Tests tab is keyed on the verbatim `it(...)` title: `tests={[{ file, tests: [{ name }] }]}`
 * on a `*Page.astro`, matched by string against `artifacts/test-results.json`. Four things have to
 * agree by hand, and when they stop agreeing all three failure modes render as the same neutral
 * "not run" clock, so nobody sees it. Seven rows had drifted before this file existed: four naming
 * a test file absent from `TARGETS`, three quoting a title that had been reworded.
 *
 * CHECKED AGAINST THE TEST SOURCES, NOT AGAINST THE REPORT, on purpose. The report is deliberately
 * outside `check` (CONTRIBUTING: "a stale report should degrade one tab, not fail the whole
 * build"), and gating on it would turn every un-regenerated rename into a red build, which is the
 * thing that decision refuses. Reading the `it(...)` titles straight from the file is independent
 * of when the report was last built and still catches the only error that is always an error: a
 * page claiming a test that does not exist.
 */
const root = join(process.cwd(), "..", "..");
const pagesDir = join(process.cwd(), "src/components/pages");

/** The `tests={[...]}` literal, bracket-matched so nested arrays do not end it early. */
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

/** Every path a page names through `testFiles={[…]}`, deduped: the derived half of the tab. */
const derivedFiles = [
  ...new Set(
    readdirSync(pagesDir)
      .filter((f) => f.endsWith("Page.astro"))
      .flatMap((page) => {
        const source = readFileSync(join(pagesDir, page), "utf8");
        const at = source.indexOf("testFiles={[");
        if (at === -1) return [];
        const close = source.indexOf("]", at);
        return [...source.slice(at, close).matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) =>
          m[1]!.replace(/\\(.)/g, "$1"),
        );
      }),
  ),
];

const quoted: { page: string; file: string; name: string }[] = [];
for (const page of readdirSync(pagesDir).filter((f) => f.endsWith("Page.astro"))) {
  const block = testsBlock(readFileSync(join(pagesDir, page), "utf8"));
  if (!block) continue;
  let file: string | undefined;
  for (const match of block.matchAll(/\b(file|name):\s*"((?:[^"\\]|\\.)*)"/g)) {
    const value = match[2]!.replace(/\\(.)/g, "$1");
    if (match[1] === "file") file = value;
    else if (file) quoted.push({ page, file, name: value });
  }
}

/** Titles a test file declares. Both quote styles; a template literal is not a lookup key anyway. */
function titlesIn(file: string): Set<string> {
  const source = readFileSync(join(root, file), "utf8");
  return new Set(
    [...source.matchAll(/\bit(?:\.\w+)?\(\s*(["'])((?:[^\\]|\\.)*?)\1/g)].map((m) =>
      m[2]!.replace(/\\(.)/g, "$1"),
    ),
  );
}

/*
 * THE TAB NOW HAS TWO SHAPES, and this file guards both.
 *
 *   `testFiles={[…]}`  derived: the page names paths and every `it()` in them becomes a row. There is
 *                      nothing to keep in step, so the only thing to check is that the paths resolve.
 *   `tests={[…]}`      quoted: still correct for a test file SHARED by several pages
 *                      (`layout.test.tsx` covers Box, Stack, Grid and Wrapper), where deriving would
 *                      show each of them the other three's tests. Those keep the verbatim key, and
 *                      keep needing the drift check below.
 */
describe("the Tests tab", () => {
  it("still has pages on each shape, so neither check is covering nothing", () => {
    /*
     * A floor, not a count. It used to read `> 500`, because every page quoted every title it showed;
     * 67 pages have since moved to `testFiles` and the quoted rows are down to the shared-file pages
     * alone. Asserting presence rather than a number is what keeps this from going stale again the
     * next time a page moves.
     */
    expect(quoted.length, "no page quotes a title any more").toBeGreaterThan(0);
    expect(derivedFiles.length, "no page names a test file").toBeGreaterThan(0);
  });

  it("names only test files that exist and declare titles", () => {
    const broken = derivedFiles.filter((file) => titlesIn(file).size === 0);
    expect(broken).toEqual([]);
  });

  const byFile = new Map<string, typeof quoted>();
  for (const row of quoted) byFile.set(row.file, [...(byFile.get(row.file) ?? []), row]);

  for (const [file, rows] of byFile) {
    it(`${file} declares every title quoted for it`, () => {
      const titles = titlesIn(file);
      /* A file whose titles cannot be read at all is a parser problem, not a drift problem: say so
       * rather than reporting all of its rows as missing. */
      expect(titles.size, `no it(...) titles parsed out of ${file}`).toBeGreaterThan(0);
      const missing = rows.filter((r) => !titles.has(r.name)).map((r) => `${r.page}: "${r.name}"`);
      expect(missing).toEqual([]);
    });
  }
});
