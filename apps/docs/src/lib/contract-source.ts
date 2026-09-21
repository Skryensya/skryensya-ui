const REPOSITORY_URL = "https://github.com/Skryensya/skryensya-ui";

/*
 * Most contracts live in the Core module named by their id. A few share a source module because
 * their contracts are deliberately declared together; these are source locations, not aliases.
 */
const contractSourceModules: Readonly<Record<string, string>> = {
  box: "layout",
  checkbox: "selection",
  "radio-group": "selection",
  switch: "selection",
  "table-pager": "pagination",
};

/**
 * Any workspace file, on GitHub, from the path the repo knows it by.
 *
 * Takes a WORKSPACE-RELATIVE path (`packages/react/src/components/accordion.test.tsx`), which is the
 * same spelling `test-results.json` keys its suites under and the same one a page hands
 * `TestCoverage`, so a caller never has to build one. `main` rather than the released tag: these
 * links are read while working on the repo, and a docs build is always ahead of the last tag.
 */
export function repositoryFileUrl(path: string): string {
  return `${REPOSITORY_URL}/blob/main/${path.replace(/^\/+/, "")}`;
}

/** The GitHub source file that declares a published Core contract. */
export function contractSourceUrl(id: string): string {
  const module = contractSourceModules[id] ?? id;
  return repositoryFileUrl(`packages/core/src/${module}.ts`);
}
