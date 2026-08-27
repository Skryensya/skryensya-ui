// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { NodePackageImporter } from "sass";

/*
 * Vanilla ComponentPreview demos still run in srcdoc frames and hydrate with @skryensya/vanilla.
 * The React binding is a real island now (@astrojs/react, client:load): a ComponentPreview's `react` slot
 * renders actual `@skryensya/react` components in the parent document, sitting next to the vanilla
 * iframe stage and toggled by the same binding switch. Vanilla's machine-backed enhancers keep
 * private implementations in `.svelte` files, so both the page graph and the isolated frame worker
 * graph still need the Svelte compiler while preserving consumer-authored light DOM.
 */
export default defineConfig({
  integrations: [react()],
  // Static output: the site is content, and every dimension (brand, mode, contrast, density)
  // resolves in the browser from custom properties, there is nothing for a server to decide.
  output: "static",

  // Every navigation is a full MPA load (no ClientRouter): `hover` fetches the destination HTML
  // into the cache before the click lands, so the page a reader is about to ask for is already
  // there when they ask for it. `prefetchAll` covers every internal `<a>` without opting each one
  // in by hand.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  /*
   * Spanish is the default and keeps its BARE paths (`prefixDefaultLocale: false`): every URL the
   * site has today keeps working, and English is additive under `/en/`. Routes are real files:
   * `src/pages/**` is Spanish, `src/pages/en/**` is English, because a docs page is prose, and prose
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
    /*
     * `@skryensya/react` is workspace SOURCE, served raw through `@fs/…` (no build step of its
     * own), while `@astrojs/react`'s island runtime is pre-bundled by Vite's dep optimizer. Left
     * alone, the two resolve `react`/`react-dom` to different served URLs (same package on disk,
     * two module instances in the browser), and any hook (Icon's `useContext`, Button's forwardRef)
     * throws "Invalid hook call" the moment it runs. `dedupe` alone does not fix this: it only
     * picks one INSTALLED copy when several exist, it does not force every importer through the
     * SAME served URL. `optimizeDeps.include` does: it pins react/react-dom into the shared
     * pre-bundle cache so `@fs`-served source and the island runtime both resolve to it.
     *
     * `@zag-js/react` is the same failure mode one hop further out: it has its own `react` import
     * that needs the SAME pre-bundle too. Left off this list, Vite only discovers it the first
     * time some page's island actually imports it, triggers an on-demand re-optimize +
     * page-reload mid-session, and whichever island already mounted before that reload lands with
     * a stale dispatcher: `Cannot read properties of null (reading 'useId')`/`'useState'`.
     *
     * The per-machine `@zag-js/<name>` packages (select, accordion, combobox, date-picker, …) do
     * NOT belong here: they're plain state-machine definitions with no `react` import of their
     * own (only `@skryensya/core/machines` touches them), and, critically, apps/docs never
     * depends on them directly, only `@skryensya/core` does. Vite's `optimizeDeps.include` can
     * only pre-bundle a specifier that resolves from the DECLARING project's own dependency graph;
     * naming one of these here just logs "Failed to resolve dependency" and does nothing.
     */
    resolve: {
      dedupe: ["react", "react-dom", "@skryensya/core"],
    },
    /*
     * `@skryensya/charts` is workspace source, same as `@skryensya/react`. Vite's SSR runner
     * externalizes node_modules packages by default, then tries to load their nested
     * `@skryensya/core/chart` import as a Node module. That subpath points at TypeScript, so
     * fetchModule throws `Cannot find module` and the Charts (and Card) islands never hydrate.
     * `noExternal` keeps the package in Vite's graph so the import is rewritten to an `@fs` URL
     * the way every other kit binding already is.
     */
    ssr: {
      noExternal: ["@skryensya/charts"],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        /*
         * The DEV runtime, and it is not a duplicate of the line above: dev compiles JSX to
         * `jsx-dev-runtime` while a build compiles it to `jsx-runtime`, so pinning only the second
         * leaves the one dev actually loads to on-demand discovery. That is precisely the
         * re-optimize + mid-session reload this comment already warns about, and it lands as
         * `dispatcher.getOwner is not a function` thrown from `framed.tsx`'s own `<iframe>`: the
         * island's React and the pre-bundled react-dom end up holding different
         * `ReactSharedInternals`, so the React preview never appears.
         */
        "react/jsx-dev-runtime",
        "react-dom/client",
        "@zag-js/react",
      ],
    },
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
