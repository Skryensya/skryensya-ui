// @ts-check
import { defineConfig } from "astro/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { NodePackageImporter } from "sass";

/*
 * The site still renders no Svelte UI: it hydrates authored markup with @skryensya/vanilla and React
 * remains documentation-only. The compiler plugin is needed because Vanilla's machine-backed enhancers
 * now keep their private implementation in `.svelte` source files; it compiles that implementation
 * while preserving the consumer's light-DOM markup contract.
 */
export default defineConfig({
  // Static output: the site is content, and every dimension (brand, mode, contrast, density)
  // resolves in the browser from custom properties, there is nothing for a server to decide.
  output: "static",

  // The package importer lets our own Sass `@use "@skryensya/core/breakpoints"` resolve through the
  // package's exports map, the same bare-specifier contract the JS imports use (ADR-19), so the
  // docs consume the breakpoint source the way any Sass consumer would.
  vite: {
    plugins: [svelte()],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          importers: [new NodePackageImporter()],
        },
      },
    },
  },
});
