// @ts-check
import { defineConfig } from "astro/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import react from "@astrojs/react";
import { NodePackageImporter } from "sass";

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
