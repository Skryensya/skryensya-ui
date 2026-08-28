import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

/*
 * Same two plugins as `packages/ai-gates/vite.config.ts`, for the same reason: `@skryensya/vanilla`
 * ships source, not a bundle (its own "build" is `svelte-check`, a type checker), because its
 * enhancers are Svelte components underneath (decision 24). Any consumer that imports it, this app
 * included, compiles it itself.
 *
 * `server.fs.allow` reaches up to the monorepo root: `src/data.ts`'s `import.meta.glob` reads
 * `evals/agent/runs/**\/*.json`, and `src/frame/kit-css.ts` reads `packages/core/css/**`, both
 * outside this app's own directory in a sibling package. Vite denies serving files outside the
 * project root by default; without this, every run's JSON and every kit stylesheet 404s.
 *
 * `src/frame/document.ts` imports `entry.tsx` as `?worker&url` (exactly what `apps/docs`'s own
 * preview frame does, see its astro.config.mjs) to get a self-contained ESM bundle loadable from an
 * iframe's `srcdoc`, which has no relationship to this document's own Vite client.
 *
 * `worker.plugins` still gets `svelte()` for vanilla's Svelte-backed enhancers, but NOT `react()`:
 * two dead ends before landing on the real fix are worth naming so the next person doesn't retread
 * them.
 *  - `worker.plugins` (react OR not) governs PRODUCTION bundling of a worker entry only. In DEV,
 *    files `entry.tsx` imports (`@skryensya/react/render-tree` and everything it renders) are still
 *    requested and transformed through the MAIN per-file pipeline regardless  -  a request log
 *    confirmed `render-tree.tsx` arriving via a plain `/@fs/...` URL, never a worker-scoped one.
 *  - `react({ exclude: [...] })` on the main pipeline, aimed at excluding `packages/react/src` from
 *    Fast Refresh instrumentation, did not stop it either: the plugin runs TWO separate JSX code
 *    paths (`jsxRefreshExclude` for esbuild's transform, a different `filter` for the Babel-based
 *    refresh transform) and only one of the two apparently honored `exclude` for our target files.
 * The actual fix is in `frame/document.ts`: the iframe's `srcDoc` manually injects the same
 * bootstrap `@vitejs/plugin-react`'s own `transformIndexHtml` hook writes into every OTHER page it
 * serves (`RefreshRuntime.injectIntoGlobalHook`, `$RefreshReg$`, `$RefreshSig$`,
 * `__vite_plugin_react_preamble_installed__`). That hook is what a hand-built `srcDoc` string skips
 * by construction, and it's the ONE thing Fast Refresh's injected runtime actually checks for before
 * running  -  supplying it directly is the same fix Vite's own docs give for any non-standard HTML
 * entry point, not a workaround specific to this app.
 *
 * `optimizeDeps.entries` forces `entry.tsx` into the SAME initial dependency-scan pass as
 * `index.html`. Confirmed live, this is load-bearing, not defensive: on a genuinely cold, single
 * navigation (no forced reload), the FIRST case a reader opens 504'd almost every request on the
 * page  -  react, react-dom, and every `@zag-js/*` package `@skryensya/vanilla`'s enhancers pull in  - 
 * because Vite's initial esbuild scan never follows a `?worker&url` import to discover what it needs,
 * so those deps were only ever discovered the moment the iframe's entry script actually ran,
 * triggering a SECOND, later optimize pass that invalidated every request already in flight under the
 * first pass's hash. This was tried once before, and abandoned because it appeared to coincide with
 * the Fast Refresh preamble error  -  it didn't cause that error, the preamble fix above just didn't
 * exist yet at the time. With both fixes in place together, a single cold load works.
 */
const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  plugins: [react(), svelte()],
  worker: {
    format: "es",
    plugins: () => [svelte()],
  },
  optimizeDeps: {
    entries: ["index.html", "src/frame/entry.tsx"],
  },
  server: {
    port: 4190,
    strictPort: false,
    fs: { allow: [workspaceRoot] },
  },
});
