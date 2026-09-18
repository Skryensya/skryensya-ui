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
 * file and the megabyte of compiled kit is not inlined into the page's HTML.
 *
 * WHY BUNDLES AND NOT SOURCE. Handing Sandpack the source tree would make the sandbox re-resolve
 * every bare specifier in it (`@skryensya/core/button`, `@zag-js/select`, …) with no node_modules to
 * resolve them against. What is bundled here has no unresolved imports left except the ones the
 * sandbox really can install: React, and only for the React binding.
 *
 * A MODULE GRAPH PER BINDING, and the reason is Babel's. Sandpack transpiles what it is handed, in
 * the browser, on every boot - and it walks the graph from the ENTRY, so a module nothing imports is
 * never touched. As a single 1.16MB file every React subpath pulled the whole kit through Babel:
 * measured at 30-45s before a three-button example appeared, with `[BABEL] the code generator has
 * deoptimised … exceeds the max of 500KB` in the sandbox console. Split per subpath, that same
 * example transpiles 33KB.
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

const playground = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(playground, "..", "..");
const out = join(playground, "public", "sandbox");

// Wiped rather than merged: a rename upstream would otherwise leave the old file being served.
rmSync(out, { force: true, recursive: true });
mkdirSync(out, { recursive: true });

const size = (file) => `${(statSync(join(out, file)).size / 1024).toFixed(0)}KB`;

/*
 * `import.meta` DOES NOT SURVIVE THE TRIP. Sandpack's bundler transpiles what it is handed to
 * CommonJS, where `import.meta` is a syntax error, and the whole preview dies with "Cannot use
 * 'import.meta' outside a module" - reported against the module that contained it, not the line.
 * The kit reads it in exactly one place: the dev-only guard behind Button's icon-only
 * accessible-name warning.
 *
 * Resolved to DEV rather than defined away, because a playground is where that warning earns its
 * keep: someone deleting an `aria-label` to see what happens should be told what happened.
 *
 * A plugin on the finished chunk rather than `define`, which this Vite ignores for
 * `import.meta.env` in library mode - an app build has an env plugin doing the substitution and a
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
 * - so `import.meta.env?.DEV` becomes `{}.env?.DEV`, which is `undefined`, which turns the kit's
 * dev-only warnings OFF inside the sandbox. That is a real, small loss: Button's icon-only
 * accessible-name error is exactly the kind of thing a reader editing code should be told about.
 *
 * It is left as it is because the alternatives are worse: `transform.define` does not reach it
 * (rolldown replaces the whole `import.meta` before a define could match `import.meta.env.DEV`),
 * and going back to ESM output re-breaks React's interop, which is the bug CJS exists to fix here.
 * The Vanilla graph is CJS too, so the same applies there.
 */

console.log("sandbox bundles:");

/*
 * THE ENTRIES ARE THE EXPORTS MAP, one output module per published subpath.
 *
 * The barrel (`src/index.ts`) is a curated list and it is allowed to be: it is what a consumer gets
 * from `@skryensya/react`, and it does not have to name everything every subpath does. The SANDBOX
 * needs every subpath, because that is what the emitted snippets import - and a name published on a
 * subpath but absent from the barrel is `undefined` at the point of use, which is what "Element type
 * is invalid" means and exactly what `@skryensya/react/tile`'s `TileContent` did.
 *
 * SPLIT, NOT INLINED, and the vanilla graph below makes the same choice. Rollup
 * gives each entry its own file and lifts what several of them share into common chunks, so the
 * sandbox's Babel only ever sees the closure of the subpaths an example actually imports: 33KB for
 * button + icon + layout, 369KB for the heaviest single component there is (the editor), against
 * 1.16MB for every example when this was one file. `.` is an entry too, so a reader who types the
 * bare specifier still gets the barrel - it simply costs nothing until they do.
 */
const reactPackage = JSON.parse(
  readFileSync(join(repo, "packages", "react", "package.json"), "utf8"),
);

const reactEntries = Object.fromEntries(
  Object.entries(reactPackage.exports).map(([subpath, target]) => [
    subpath === "." ? "index" : subpath.replace(/^\.\//, ""),
    join(repo, "packages", "react", target.default),
  ]),
);

/* Built into a directory this script then reads and deletes: what the browser fetches is the JSON
 * below, one cacheable asset, and 200-odd sibling files in `public/` would be 200 requests plus a
 * second way to get the same bytes. */
const reactModulesDir = join(out, ".react-modules");

await build({
  configFile: false,
  logLevel: "warn",
  plugins: [resolveImportMeta],
  publicDir: false,
  define: { "import.meta.env": JSON.stringify({ DEV: true }) },
  build: {
    emptyOutDir: false,
    outDir: reactModulesDir,
    minify: true,
    target: "es2022",
    /*
     * React ITSELF is left out. Sandpack installs react/react-dom from npm for its own template, and
     * a second copy bundled in here would be a second React in one page: every hook in the kit would
     * throw on its first render. Same failure the docs site documents in its `astro.config.mjs`, one
     * realm further out.
     *
     * AND THE FORMAT IS CJS, which is the fix for the error this shipped with first. As ESM, Sandpack
     * transpiles the bundle itself, and its interop turns the `import * as React from "react"` that
     * Zag pulls in into a namespace whose hooks are missing: every example using `Icon` died with
     * `(0, e.useContext) is not a function`. CJS is what an npm package puts behind `main` - it is
     * what the local-dependencies guide's own tsup setup emits - so the bundler consumes it directly
     * and the interop is Rollup's, at build time, where it is correct and testable.
     */
    lib: { entry: reactEntries, formats: ["cjs"] },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
      /* Inside `rollupOptions` and not beside it: Vite 8 treats `rolldownOptions` as the same key, so
       * a second object REPLACES this one. */
      transform: {},
      output: {
        /* `[name].js` and nothing else: the file name IS the subpath, so `@skryensya/react/button`
         * resolves to `/node_modules/@skryensya/react/button.js` by ordinary node resolution, with no
         * re-export shim in between. The chunks are hashed because they are nobody's public name. */
        entryFileNames: "[name].js",
        chunkFileNames: "chunk-[name]-[hash].js",
      },
    },
  },
});

/** Every emitted file, keyed by the path it will be mounted at inside the sandbox's node_modules. */
const reactModules = {};
const collectModules = (dir, prefix = "") => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) collectModules(path, `${prefix}${entry.name}/`);
    else if (entry.name.endsWith(".js")) reactModules[`${prefix}${entry.name}`] = readFileSync(path, "utf8");
  }
};
collectModules(reactModulesDir);
rmSync(reactModulesDir, { force: true, recursive: true });

writeFileSync(join(out, "react-modules.json"), JSON.stringify(reactModules));
console.log(
  `  react-modules.json  ${Object.keys(reactModules).length} modules, ${size("react-modules.json")}`,
);

/*
 * VANILLA, AS INSTALLED: the same module-graph shape as React, for the same reason.
 *
 * The Vanilla example is what a consumer writes (`index.html` plus a `main.js` importing
 * `@skryensya/vanilla/auto` and `@skryensya/icons-lucide`), resolved by the sandbox's bundler through
 * `node_modules` the way their Vite resolves it. It used to be one inlined file behind an import map
 * in the visible document, which is not how the installation page tells anyone to consume the kit.
 *
 * Two packages in ONE build, so what they share (core) is lifted into chunks once rather than
 * duplicated. Keys are paths under `/node_modules/@skryensya/`: `vanilla/auto.js`,
 * `icons-lucide/index.js`, and chunks inside `vanilla/_chunks/`, reached by relative `require`.
 * CJS for the reason the React build gives. Nothing is external: the Svelte runtime and the Zag
 * machines are the kit's to provide, and `.svelte` is why this is Vite.
 */
const packageEntries = (name, prefix) => {
  const pkg = JSON.parse(readFileSync(join(repo, "packages", name, "package.json"), "utf8"));
  return Object.entries(pkg.exports)
    .filter(([subpath, target]) => typeof target === "object" && target.default?.endsWith(".ts"))
    /* Published for the package's own tests, not for anyone's page. */
    .filter(([subpath]) => subpath !== "./test-setup")
    .map(([subpath, target]) => [
      `${prefix}/${subpath === "." ? "index" : subpath.replace(/^\.\//, "")}`,
      join(repo, "packages", name, target.default),
    ]);
};

const vanillaModulesDir = join(out, ".vanilla-modules");

await build({
  configFile: false,
  logLevel: "warn",
  plugins: [svelte({ emitCss: false }), resolveImportMeta],
  publicDir: false,
  define: { "import.meta.env": JSON.stringify({ DEV: true }) },
  build: {
    emptyOutDir: false,
    outDir: vanillaModulesDir,
    minify: true,
    /* Not es2022 like React: the Svelte runtime writes `??=`, and the Babel inside Sandpack's bundler
       stops at "Unexpected token" on it, so the syntax is lowered here where it can be. */
    target: "es2019",
    lib: {
      entry: Object.fromEntries([
        ...packageEntries("vanilla", "vanilla"),
        ...packageEntries("icons-lucide", "icons-lucide"),
      ]),
      formats: ["cjs"],
    },
    rollupOptions: {
      transform: {},
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "vanilla/_chunks/[name]-[hash].js",
      },
    },
  },
});

const vanillaModules = {};
const collectVanilla = (dir, prefix = "") => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) collectVanilla(path, `${prefix}${entry.name}/`);
    else if (entry.name.endsWith(".js")) vanillaModules[`${prefix}${entry.name}`] = readFileSync(path, "utf8");
  }
};
collectVanilla(vanillaModulesDir);
rmSync(vanillaModulesDir, { force: true, recursive: true });

writeFileSync(join(out, "vanilla-modules.json"), JSON.stringify(vanillaModules));
console.log(
  `  vanilla-modules.json  ${Object.keys(vanillaModules).length} modules, ${size("vanilla-modules.json")}`,
);

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
 * via native `@import url("./sibling.css")` - always to a sibling in the SAME directory (calendar
 * imports button, date-picker imports calendar, layout imports box/wrapper/image-frame; nothing
 * crosses between components and patterns). Copied here as-is - still readable CSS; minifying them
 * is an easy follow-up, not required for the size win - alongside a manifest resolving each file's
 * transitive `@import` closure, so `Playground.tsx` can fetch exactly the files a name it detects in
 * an example's source actually needs.
 */
/*
 * `./sibling.css` AND `../group/sheet.css`. The `./`-only form this used to require captured 5 of the
 * 11 `@import` edges in `packages/core/css` and missed all 6 that CROSS between `components/` and
 * `patterns/` (`menubar->nav-list`, `sidebar->splitter`, `table->splitter`, `treegrid->splitter`,
 * `copy-button->icon-toggle`, `icon-state-button->icon-toggle`, `theme-toggle->icon-toggle`) - while
 * the comment above it asserted that nothing crosses. It did; the regex simply could not see it.
 * Group 1 is the directory when the edge crosses, undefined when it does not.
 */
const IMPORT_RE = /@import\s+url\(["']\.(?:\.\/([\w-]+)|)\/([\w-]+\.css)["']\)\s*;/g;

/*
 * CROSS-CUTTING DEPENDENCIES, invisible to `@import` AND to the compiled CSS itself. `copy-button.ts`
 * composes onto `"sk-button"` and borrows `patterns/anchored.css`'s positioning (via `anchoredParts`)
 * for its feedback flag, the same way `menu.ts`, `tooltip.ts`, `popover.ts`, `select.ts` and
 * `combobox.ts` do - and none of their CSS files `@import` either one: a real page imports both once
 * for every floating/button-shaped component on it (`CopyButtonPage.astro`, `ComponentPreview.astro`),
 * so a per-file `@import` would just be the same two files copy-pasted into a dozen components.
 *
 * Nor does the COMPILED CSS reliably say so either: `menu.css` and `select.css` only set the custom
 * properties `patterns/anchored.css`'s own selectors read (`--sk-anchored-position-area`, …) and
 * never write a `.sk-anchor` selector themselves, so grepping the stylesheet under-detects. The
 * CONTRACT (`packages/core/src/<name>.ts`) is where the composition is actually decided - its
 * template's `also` list names `"sk-button"` or `anchoredParts` - so that is the source read here.
 *
 * The sandbox has no page to do this importing for it: each example gets only what
 * `Playground.tsx`'s `detectPartNames` resolves through THIS manifest, so a component whose contract
 * reaches for one of these without its demo happening to also import Button (or a name that resolves
 * to `patterns/anchored.css`) rendered with no `.sk-button` chrome and no anchor positioning at all -
 * a bare unstyled `<button>`.
 */
const coreSrcDir = join(repo, "packages", "core", "src");
const CROSS_CUTTING = [
  { rule: /"sk-button"/, provides: "components/button.css" },
  { rule: /anchoredParts|"sk-anchor(?:ed)?"/, provides: "patterns/anchored.css" },
  { rule: /iconToggleParts|"sk-icon-toggle"/, provides: "patterns/icon-toggle.css" },
];

/*
 * STYLESHEET -> THE MODULE THAT DECLARES IT, read from `css:` rather than guessed from the filename.
 *
 * The guess was `packages/core/src/<stem>.ts`, and it is wrong for every sheet whose contract lives in
 * a MULTI-CONTRACT module: `toast.css` is declared by `contentContract` in `content.ts`,
 * and `checkbox.css`/`radio-group.css`/`switch.css` by `selection.ts`. Four of the 92 sheets have no
 * file at their own name, so `contractCrossDeps` returned `[]` for them unconditionally - and
 * `contentContract` declares `also: ["sk-button", "sk-interactive"]`, which is why every toast in the
 * playground shipped with no `.sk-button` chrome at all.
 *
 * One module may declare several sheets (layout.ts) and one sheet is declared by exactly one module,
 * so the map is keyed by sheet and the scan is a single pass over core's source.
 */
const CSS_DECL_RE = /css:\s*"@skryensya\/core\/([\w-]+)\/([\w-]+)\.css"/g;

const declaringModule = new Map();
for (const file of readdirSync(coreSrcDir).filter((f) => f.endsWith(".ts") && !f.includes(".test."))) {
  const code = readFileSync(join(coreSrcDir, file), "utf8");
  for (const [, group, stem] of code.matchAll(CSS_DECL_RE)) {
    declaringModule.set(`${group}/${stem}`, code);
  }
}

function contractCrossDeps(group, stem) {
  const code = declaringModule.get(`${group}/${stem}`);
  if (code === undefined) return [];
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
    const deps = new Set(
      [...css.matchAll(IMPORT_RE)].map((m) => `${m[1] ?? group}/${m[2]}`),
    );
    for (const provides of contractCrossDeps(group, file.replace(/\.css$/, ""))) {
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

/*
 * WHAT SHIPS BEFORE ANY COMPONENT, read from `tokens.scss` rather than listed here.
 *
 * `foundation.css` is copied above as "everything a component's own CSS assumes is already there",
 * and for three sheets that is not true: `tokens.scss` pulls `state-layer`, `visually-hidden` and
 * `icon` in with a native `@import url("./patterns/…")`, and core's own `build-css.ts` STRIPS those
 * lines when it compiles `foundation.css` (they are only valid relative to `css/`, and it publishes
 * from `dist/`). Its sibling `tokens.css` inlines them for exactly that reason; `foundation.css` does
 * not, so the sandbox got the tokens of the state layer and none of its rules, and no `.sk-icon`
 * sizing at all - which is why an `<Icon>` rendered by a React component (Details' own chevron, and
 * every other one a component composes internally) came out invisible.
 *
 * Read from the same `@import` lines instead of retyping their names: a fourth base pattern upstream
 * is then already here.
 */
/* Its own regex, and not `IMPORT_RE` above: these edges are written from `css/` and so name their
   group (`./patterns/icon.css`), where a sheet importing a sibling never does (`./button.css`). */
const BASE_IMPORT_RE = /@import\s+url\(["']\.\/([\w-]+)\/([\w-]+\.css)["']\)/g;

const baseSheets = [
  ...new Set(
    [...readFileSync(join(repo, "packages", "core", "css", "tokens.scss"), "utf8").matchAll(BASE_IMPORT_RE)]
      .map((m) => `${m[1]}/${m[2]}`)
      .flatMap((key) => [...closure(key)]),
  ),
].sort();

/*
 * A PART CLASS -> THE SHEET THAT DECLARES IT, and not a filename that happens to match.
 *
 * This map used to be keyed by stylesheet STEM (`details` -> `components/details.css`), which works
 * only while a part is named after its own file. Most are not: `.sk-stack` and `.sk-inline` are
 * declared by `patterns/layout.css`, `.sk-heading` and `.sk-text` by `components/typography.css`,
 * `.sk-interactive` by `patterns/state-layer.css`. Every one of those resolved to NOTHING, so an
 * example composing a Stack of Headings got the component's sheet and no layout and no type - the
 * two bindings then disagreed on spacing, because each detected a different half of the same tree.
 *
 * The contracts are where a part's ownership is actually written (`parts: { stack: "sk-stack" }`
 * beside `css: "@skryensya/core/patterns/layout.css"`), so that is what is read. ONLY `parts`
 * objects: a class named in an `also` list is composition, not ownership, and taking those too made
 * `interactive` resolve to forty sheets and `button` to eighteen. Composition is already handled,
 * one layer down, by `CROSS_CUTTING` on the sheet itself.
 */
const PARTS_BLOCK_RE = /(?:const \w*[Pp]arts\s*=|\bparts:)\s*\{/g;
const CLASS_LITERAL_RE = /"(sk-[a-z0-9]+(?:-[a-z0-9]+)*)"/g;

/** The `{ … }` starting at `open`, by brace matching - a parts object may nest or spread. */
function objectAt(code, open) {
  let depth = 0;
  for (let i = open; i < code.length; i += 1) {
    if (code[i] === "{") depth += 1;
    else if (code[i] === "}") {
      depth -= 1;
      if (depth === 0) return code.slice(open, i + 1);
    }
  }
  return "";
}

const cssManifest = {};
const declare = (name, sheetKey) => {
  const closed = [...closure(sheetKey)];
  cssManifest[name] = [...new Set([...(cssManifest[name] ?? []), ...closed])].sort();
};

for (const file of readdirSync(coreSrcDir).filter((f) => f.endsWith(".ts") && !f.includes(".test."))) {
  const code = readFileSync(join(coreSrcDir, file), "utf8");
  const sheets = [...new Set([...code.matchAll(CSS_DECL_RE)].map((m) => `${m[1]}/${m[2]}.css`))];
  if (sheets.length === 0) continue;

  for (const match of [...code.matchAll(PARTS_BLOCK_RE)]) {
    const block = objectAt(code, match.index + match[0].length - 1);
    for (const [, className] of block.matchAll(CLASS_LITERAL_RE)) {
      for (const sheet of sheets) declare(className.slice(3), sheet);
    }
  }
}

/*
 * The stylesheet's own stem stays a key as well. Nothing in the client asks for one any more (part
 * names are read from the emitted markup), but a sheet whose contract declares no part object at all
 * would otherwise be unreachable by any name, which is a silent hole rather than a decision.
 */
for (const { group, files } of [componentsCss, patternsCss]) {
  for (const file of files) declare(file.replace(/\.css$/, ""), `${group}/${file}`);
}

writeFileSync(join(out, "css-manifest.json"), JSON.stringify({ base: baseSheets, parts: cssManifest }));
console.log(
  `  css/  ${componentsCss.files.length} components + ${patternsCss.files.length} patterns, css-manifest.json  ${Object.keys(cssManifest).length} part names, ${baseSheets.length} base`,
);
