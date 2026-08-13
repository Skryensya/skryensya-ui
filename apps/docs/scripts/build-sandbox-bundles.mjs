#!/usr/bin/env node
/*
 * THE KIT, BUILT FOR A SANDBOX THAT CANNOT INSTALL IT.
 *
 * The playground runs real `@skryensya/*` code inside Sandpack, and Sandpack installs dependencies
 * from npm. These packages are not published: a workspace protocol means nothing to a bundler
 * running in someone else's browser, so `dependencies: { "@skryensya/react": "*" }` would resolve
 * to a 404 and the sandbox would show a module-not-found where a Button should be.
 *
 * So the kit is compiled here, once, into files the sandbox is HANDED rather than fetches. They land
 * in `public/sandbox/` as ordinary static assets, which means the browser caches them like any other
 * file and the 400KB of React binding is not inlined into the page's HTML.
 *
 * WHY BUNDLES AND NOT SOURCE. Handing Sandpack the source tree would make the sandbox re-resolve
 * every bare specifier in it (`@skryensya/core/button`, `@zag-js/select`, …) with no node_modules to
 * resolve them against. One file per binding has no unresolved imports left except the ones the
 * sandbox really can install: React, and only for the React binding.
 *
 * Run before `astro dev` and `astro build`; both scripts do it for you.
 */
import { build } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const docs = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(docs, "..", "..");
const out = join(docs, "public", "sandbox");

// Wiped rather than merged: a rename upstream would otherwise leave the old file being served.
rmSync(out, { force: true, recursive: true });
mkdirSync(out, { recursive: true });

const size = (file) => `${(statSync(join(out, file)).size / 1024).toFixed(0)}KB`;

/** One entry, one file, no code splitting: the sandbox loads it with a single import. */
/*
 * `import.meta` DOES NOT SURVIVE THE TRIP. Sandpack's bundler transpiles what it is handed to
 * CommonJS, where `import.meta` is a syntax error, and the whole preview dies with "Cannot use
 * 'import.meta' outside a module" — reported against the module that contained it, not the line.
 * The kit reads it in exactly one place: the dev-only guard behind Button's icon-only
 * accessible-name warning.
 *
 * Resolved to DEV rather than defined away, because a playground is where that warning earns its
 * keep: someone deleting an `aria-label` to see what happens should be told what happened.
 *
 * A plugin on the finished chunk rather than `define`, which this Vite ignores for
 * `import.meta.env` in library mode — an app build has an env plugin doing the substitution and a
 * library build deliberately does not, because a library's env belongs to its consumer.
 */
const resolveImportMeta = {
  name: "sandbox-resolve-import-meta",
  enforce: "post",
  renderChunk(code) {
    return code.includes("import.meta.env")
      ? code.replaceAll("import.meta.env", "({ DEV: true })")
      : null;
  },
};

/*
 * A NOTE ON THE `import.meta` WARNING this build prints for `button.tsx`.
 *
 * The React bundle is CJS (see below), and rolldown rewrites `import.meta` to `{}` there by itself
 * — so `import.meta.env?.DEV` becomes `{}.env?.DEV`, which is `undefined`, which turns the kit's
 * dev-only warnings OFF inside the sandbox. That is a real, small loss: Button's icon-only
 * accessible-name error is exactly the kind of thing a reader editing code should be told about.
 *
 * It is left as it is because the alternatives are worse: `transform.define` does not reach it
 * (rolldown replaces the whole `import.meta` before a define could match `import.meta.env.DEV`),
 * and going back to ESM output re-breaks React's interop, which is the bug CJS exists to fix here.
 * The plugin above still does the job for the VANILLA bundle, which is ESM.
 */

async function bundle({ entry, file, external = [], plugins = [], format = "es" }) {
  await build({
    configFile: false,
    logLevel: "warn",
    plugins: [...plugins, resolveImportMeta],
    // Not `false` by accident: `publicDir` defaults to `<root>/public`, which IS the directory
    // being written into, so leaving it on copies the site's own assets in beside the bundles.
    publicDir: false,
    /*
     * `import.meta` DOES NOT SURVIVE THE TRIP. Sandpack's bundler transpiles what it is given to
     * CommonJS, where `import.meta` is a syntax error, and the whole preview dies with
     * "Cannot use 'import.meta' outside a module" — not at the line that used it, at the module that
     * contained it. The kit reads it in exactly one place: the dev-only guard behind Button's
     * icon-only accessible-name warning.
     *
     * Resolved to DEV rather than defined away, because a playground is the one place that warning
     * is most useful: someone deleting an `aria-label` to see what happens should be told what
     * happened. A production consumer's own bundler still decides this for itself.
     */
    define: { "import.meta.env": JSON.stringify({ DEV: true }) },
    build: {
      emptyOutDir: false,
      outDir: out,
      lib: { entry, formats: [format], fileName: () => file },
      rollupOptions: {
        external,
        /*
         * Inside `rollupOptions` and not beside it: Vite 8 treats `rolldownOptions` as the same key,
         * so a second object REPLACES this one — which silently dropped `inlineDynamicImports` and
         * split the vanilla bundle back into sixty chunks. Cost twenty minutes; worth the line.
         */
        transform: {},
        /*
         * ONE FILE, and this is what makes it one. The vanilla registry loads each enhancer with a
         * dynamic `import()` so a page pays only for the components it authored; a bundler honours
         * that by splitting, which here would mean sixty sibling chunks the sandbox has no way to
         * fetch. Inlining trades the site's lazy loading for the sandbox's single import, which is
         * the right trade in a sandbox and the wrong one everywhere else.
         *
         * Vite prints a deprecation notice pointing at `codeSplitting: false`; this Rolldown does
         * not accept that key yet, so the notice is ahead of the build it is printed by.
         */
        output: { inlineDynamicImports: true },
      },
      minify: true,
      // The sandbox is a browser; nothing here is being published for a bundler to re-process.
      target: "es2022",
    },
  });
  console.log(`  ${file}  ${size(file)}`);
}

console.log("sandbox bundles:");

const reactPackage = JSON.parse(
  readFileSync(join(repo, "packages", "react", "package.json"), "utf8"),
);
const subpaths = Object.keys(reactPackage.exports)
  .filter((entry) => entry !== ".")
  .map((entry) => entry.replace(/^\.\//, ""))
  .sort();

writeFileSync(join(out, "react-subpaths.json"), JSON.stringify(subpaths));
console.log(`  react-subpaths.json  ${subpaths.length} entries`);


/*
 * THE ENTRY IS GENERATED FROM THE EXPORTS MAP, not `src/index.ts`.
 *
 * The barrel is a curated list and it is allowed to be: it is what a consumer gets from
 * `@skryensya/react`, and it does not have to name everything every subpath does. The SANDBOX needs
 * everything, because a subpath there is served by a file that re-exports this bundle, and a name
 * the bundle never had is `undefined` at the point of use — which is what "Element type is invalid"
 * means, and it is exactly what `@skryensya/react/tile`'s `TileContent` did: published on the
 * subpath, absent from the barrel.
 *
 * So the union of every published module is bundled instead. 63 modules behind 82 subpaths; the
 * exports map is the source, so a subpath that exists for a consumer exists here.
 */
const modules = [
  ...new Set(
    Object.entries(reactPackage.exports)
      .filter(([subpath]) => subpath !== ".")
      .map(([, target]) => target.default),
  ),
];

const entryFile = join(out, ".react-entry.ts");
writeFileSync(
  entryFile,
  modules
    .map((module) => `export * from ${JSON.stringify(join(repo, "packages", "react", module))};`)
    .join("\n"),
);

/*
 * React ITSELF is left out. Sandpack installs react/react-dom from npm for its own template, and a
 * second copy bundled in here would be a second React in one page: every hook in the kit would throw
 * on its first render. Same failure the docs site already documents in `astro.config.mjs`, one realm
 * further out.
 *
 * AND THE FORMAT IS CJS, which is the fix for the error this shipped with first. As ESM, Sandpack
 * transpiles the bundle itself, and its interop turns the `import * as React from "react"` that Zag
 * pulls in into a namespace whose hooks are missing: every example using `Icon` died with
 * `(0, e.useContext) is not a function`. CJS is what an npm package puts behind `main` — it is what
 * the local-dependencies guide's own tsup setup emits — so the bundler consumes it directly and the
 * interop is Rollup's, at build time, where it is correct and testable.
 */
await bundle({
  entry: entryFile,
  file: "skryensya-react.js",
  format: "cjs",
  external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
});

rmSync(entryFile, { force: true });

/*
 * Vanilla, self-contained: the enhancers, their Zag machines and the Svelte runtime that hosts the
 * machine-backed ones. Nothing is external because nothing here is the sandbox's to provide, and
 * `.svelte` is why this uses Vite rather than esbuild alone.
 *
 * The entry is the SITE's (`src/sandbox/entry.ts`), not the package's: it binds an icon set, and
 * which set is a consumer's decision the kit does not make for anyone.
 */
await bundle({
  entry: join(docs, "src", "sandbox", "entry.ts"),
  file: "skryensya-vanilla.js",
  plugins: [svelte({ emitCss: false })],
});

/*
 * THE SUBPATHS THE REACT PACKAGE PUBLISHES, so the sandbox can resolve the specifier a consumer
 * really writes.
 *
 * Sandpack takes an unpublished package as files under `/node_modules/<name>/`, with a
 * `package.json` and a `main` (its own guide: "Providing local dependencies"). That gives it
 * `@skryensya/react`. It says nothing about SUBPATHS, and every emitted snippet uses one —
 * `@skryensya/react/button` is what the docs show and what belongs in an app.
 *
 * So the list is exported here and the playground writes one re-export file per entry beside the
 * bundle. Taken from the package's own exports map rather than typed out: a subpath that exists for
 * a consumer exists in the sandbox, including for code the reader writes themselves after opening it.
 */
/*
 * THE FOUNDATION, copied rather than rebuilt: `@skryensya/core` already publishes exactly this file
 * (built above, in `build-css.mjs`) for the no-toolchain path, and a second recipe for "everything
 * before a component" would be a second answer that can disagree with the first.
 */
copyFileSync(join(repo, "packages", "core", "dist", "foundation.css"), join(out, "foundation.css"));
console.log(`  foundation.css  ${size("foundation.css")}`);

/*
 * PER-COMPONENT CSS, copied file-for-file rather than bundled, so the sandbox can link only what a
 * given example uses instead of every component's stylesheet unconditionally (the previous
 * `skryensya.css` bundle, 250KB regardless of whether the reader opened Accordion or Table).
 *
 * `css/components/*.css` and `css/patterns/*.css` already declare their own cross-file dependencies
 * via native `@import url("./sibling.css")` — always to a sibling in the SAME directory (calendar
 * imports button, date-picker imports calendar, layout imports box/wrapper/image-frame; nothing
 * crosses between components and patterns). Copied here as-is — still readable CSS; minifying them
 * is an easy follow-up, not required for the size win — alongside a manifest resolving each file's
 * transitive `@import` closure, so `Playground.tsx` can fetch exactly the files a name it detects in
 * an example's source actually needs.
 */
const IMPORT_RE = /@import\s+url\(["']\.\/([\w-]+\.css)["']\)\s*;/g;

/*
 * CROSS-CUTTING DEPENDENCIES, invisible to `@import` AND to the compiled CSS itself. `copy-button.ts`
 * composes onto `"sk-button"` and borrows `patterns/anchored.css`'s positioning (via `anchoredParts`)
 * for its feedback flag, the same way `menu.ts`, `tooltip.ts`, `popover.ts`, `select.ts` and
 * `combobox.ts` do — and none of their CSS files `@import` either one: a real page imports both once
 * for every floating/button-shaped component on it (`CopyButtonPage.astro`, `ComponentPreview.astro`),
 * so a per-file `@import` would just be the same two files copy-pasted into a dozen components.
 *
 * Nor does the COMPILED CSS reliably say so either: `menu.css` and `select.css` only set the custom
 * properties `patterns/anchored.css`'s own selectors read (`--sk-anchored-position-area`, …) and
 * never write a `.sk-anchor` selector themselves, so grepping the stylesheet under-detects. The
 * CONTRACT (`packages/core/src/<name>.ts`) is where the composition is actually decided — its
 * template's `also` list names `"sk-button"` or `anchoredParts` — so that is the source read here.
 *
 * The sandbox has no page to do this importing for it: each example gets only what
 * `Playground.tsx`'s `detectPartNames` resolves through THIS manifest, so a component whose contract
 * reaches for one of these without its demo happening to also import Button (or a name that resolves
 * to `patterns/anchored.css`) rendered with no `.sk-button` chrome and no anchor positioning at all —
 * a bare unstyled `<button>`.
 */
const coreSrcDir = join(repo, "packages", "core", "src");
const CROSS_CUTTING = [
  { rule: /"sk-button"/, provides: "components/button.css" },
  { rule: /anchoredParts|"sk-anchor(?:ed)?"/, provides: "patterns/anchored.css" },
];

function contractCrossDeps(stem) {
  const file = join(coreSrcDir, `${stem}.ts`);
  if (!existsSync(file)) return [];
  const code = readFileSync(file, "utf8");
  return CROSS_CUTTING.filter(({ rule }) => rule.test(code)).map(({ provides }) => provides);
}

function readCssGroup(group) {
  const srcDir = join(repo, "packages", "core", "css", group);
  const destDir = join(out, "css", group);
  mkdirSync(destDir, { recursive: true });

  const files = readdirSync(srcDir).filter((f) => f.endsWith(".css"));
  const entries = new Map();

  for (const file of files) {
    const css = readFileSync(join(srcDir, file), "utf8");
    copyFileSync(join(srcDir, file), join(destDir, file));
    const key = `${group}/${file}`;
    const deps = new Set([...css.matchAll(IMPORT_RE)].map((m) => `${group}/${m[1]}`));
    for (const provides of contractCrossDeps(file.replace(/\.css$/, ""))) {
      if (provides !== key) deps.add(provides);
    }
    entries.set(key, deps);
  }

  return { group, files, entries };
}

const componentsCss = readCssGroup("components");
const patternsCss = readCssGroup("patterns");

/* One graph across both groups: a cross-cutting edge from `components/copy-button.css` points at
   `patterns/anchored.css`, so the closure below has to walk both at once. */
const depsOf = new Map([...componentsCss.entries, ...patternsCss.entries]);

function closure(key, seen = new Set()) {
  if (seen.has(key)) return seen;
  seen.add(key);
  for (const dep of depsOf.get(key) ?? []) closure(dep, seen);
  return seen;
}

const cssManifest = {};
for (const { group, files } of [componentsCss, patternsCss]) {
  for (const file of files) {
    cssManifest[file.replace(/\.css$/, "")] = [...closure(`${group}/${file}`)].sort();
  }
}

writeFileSync(join(out, "css-manifest.json"), JSON.stringify(cssManifest));
console.log(
  `  css/  ${componentsCss.files.length} components + ${patternsCss.files.length} patterns, css-manifest.json  ${Object.keys(cssManifest).length} entries`,
);
