// @ts-check
import { defineConfig } from "astro/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import react from "@astrojs/react";
import { NodePackageImporter } from "sass";
import { readFileSync } from "node:fs";

/*
 * EVERY ZAG MACHINE THE KIT USES, pre-bundled up front, read off `@skryensya/core`'s own manifest so
 * a machine added there is covered here without anyone remembering to.
 *
 * The rail and search are kit components, so the island reaches `@skryensya/core/machines` and, from
 * it, a dozen `@zag-js/<machine>` packages. Left to on-demand discovery, Vite found them one at a
 * time on a reader's first load, re-optimized for each, and invalidated every module already served
 * under the old hash: the page answered "504 Outdated Optimize Dep", the island failed to hydrate
 * ("Failed to fetch dynamically imported module: .../Playground.tsx"), and a load took ~30s before
 * it gave up. The nested `a > b` form is what lets this app name a dependency it only has through
 * `@skryensya/core`; a bare `@zag-js/tabs` would not resolve from here.
 */
const coreManifest = JSON.parse(readFileSync(new URL("../../packages/core/package.json", import.meta.url), "utf8"));
const zagMachines = Object.keys({ ...coreManifest.dependencies, ...coreManifest.peerDependencies })
  .filter((name) => name.startsWith("@zag-js/"))
  .map((name) => `@skryensya/core > ${name}`);

export default defineConfig({
  integrations: [react()],
  output: "static",
  compressHTML: false,
  vite: {
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-dom/client",
        /*
         * Sandpack and Zag are peers/transitives behind this app's React islands. Pre-bundling them
         * with the same React instance keeps the standalone playground from re-optimizing after first
         * navigation and remounting the editor with a stale dispatcher.
         */
        "@zag-js/react",
        "@codesandbox/sandpack-react",
        ...zagMachines,
      ],
    },
    plugins: [svelte()],
    worker: {
      format: "es",
      plugins: () => [svelte()],
    },
    css: {
      preprocessorOptions: {
        scss: {
          importers: [new NodePackageImporter()],
        },
      },
    },
  },
});
