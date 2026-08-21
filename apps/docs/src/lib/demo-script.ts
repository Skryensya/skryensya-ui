import ts from "typescript";

/*
 * A demo's script, as authored (TypeScript) and as run (JavaScript).
 *
 * The two are not the same text and cannot be: `demos/scripts/*.ts` are real source files the
 * compiler checks, and the preview's `<script type="module">` runs in a browser with no TypeScript
 * compiler. So the tab shows the file and the frame runs this. That is the same bargain the React
 * binding already makes: what a page shows is TSX, what a browser executes is what a compiler made
 * of it.
 *
 * Stripping is all that happens. `transpileModule` compiles one file with no program and no type
 * information, which is exactly the job: types out, statements untouched, no bundling, no polyfills,
 * and no chance of the running demo drifting from the source printed above it.
 */
export function compileDemoScript(source: string): string {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      // The comments are half of what these files say; a demo is read more often than it is run.
      removeComments: false,
      /*
       * Imports come out exactly as written. Without this, TypeScript ELIDES an import whose binding
       * it cannot see used — and a page-authored snippet that shows `import { mountCodePreview }`
       * beside a string that mentions it would have lost the line it exists to teach, then gained an
       * `export {}` in its place to stay a module.
       */
      verbatimModuleSyntax: true,
    },
  });

  return outputText.trimEnd();
}

/** Places a compiled script inside the `<script type="module">` it is being written into. */
export function indentScript(source: string, by = "      "): string {
  return source
    .split("\n")
    .map((line) => (line.trim() === "" ? line : `${by}${line}`))
    .join("\n");
}
