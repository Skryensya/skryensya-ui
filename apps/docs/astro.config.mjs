// @ts-check
import { defineConfig } from "astro/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { NodePackageImporter } from "sass";

/*
 * The site still renders no Svelte UI: authored ComponentPreview demos run in srcdoc frames and
 * hydrate with @skryensya/vanilla; React remains documentation-only. Vanilla's machine-backed
 * enhancers keep private implementations in `.svelte` files, so both the page graph and the isolated
 * frame worker graph need the compiler while preserving consumer-authored light DOM.
 */
export default defineConfig({
  // Static output: the site is content, and every dimension (brand, mode, contrast, density)
  // resolves in the browser from custom properties, there is nothing for a server to decide.
  output: "static",

  /*
   * Spanish is the default and keeps its BARE paths (`prefixDefaultLocale: false`): every URL the
   * site has today keeps working, and English is additive under `/en/`. Routes are real files —
   * `src/pages/**` is Spanish, `src/pages/en/**` is English — because a docs page is prose, and prose
   * is translated, not parameterised.
   *
   * `redirectToDefaultLocale: false` leaves `/` as the Spanish home rather than bouncing it, and
   * `fallback` is deliberately absent: an untranslated page should 404 in English instead of silently
   * serving Spanish under an `/en/` URL that then looks translated to a crawler.
   */
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  // Keep authored whitespace. Prose routinely wraps an inline element (<a>, <strong>, <em>, <code>)
  // onto its own line, and the newline before it is the word space. compressHTML collapses that
  // run to nothing instead of a single space, gluing the styled word to the text before it, so we
  // opt out and let the browser fold the authored whitespace the normal way.
  compressHTML: false,

  // The package importer lets our own Sass `@use "@skryensya/core/breakpoints"` resolve through the
  // package's exports map, the same bare-specifier contract the JS imports use (ADR-19), so the
  // docs consume the breakpoint source the way any Sass consumer would.
  vite: {
    plugins: [svelte()],
    worker: {
      // The srcdoc loads this URL as a module. ESM preserves the registry's selector-gated dynamic
      // imports; the default IIFE format folds every Vanilla enhancer into each preview's bootstrap.
      format: "es",
      plugins: () => [svelte()],
    },
    css: {
      preprocessorOptions: {
        scss: {
          // No `api: "modern-compiler"`: Vite 6 made the modern compiler the default and dropped
          // the option, so declaring it now only fails the type check.
          importers: [new NodePackageImporter()],
        },
      },
    },
  },
});
