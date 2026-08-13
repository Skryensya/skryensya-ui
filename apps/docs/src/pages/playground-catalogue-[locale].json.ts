import type { APIRoute } from "astro";
import { catalogueIndex } from "../lib/playground-catalogue-endpoints";
import { locales, useTranslations, type Locale } from "../i18n";

/*
 * THE RAIL'S OWN VIEW OF THE CATALOGUE: every component, every example, labels only.
 *
 * This used to also carry every example's source in both bindings — two whole programs per preset,
 * well over a hundred of them, ~515KB regardless of which one component a reader actually opened.
 * The rail only ever reads `id`/`label` to draw its tree (see `nodes` in `Playground.tsx`), so that
 * source has no business being in the file the page fetches on mount. It now lives one hop away, in
 * `playground-catalogue-[locale]-[component].json.ts`, fetched only for the component currently
 * selected. Same trade as `scripts/build-sandbox-bundles.mjs` splitting the compiled kit: an ordinary
 * static asset the browser caches, sized to what a first paint actually needs.
 *
 * ONE FILE PER LOCALE, because the trees are built with the site's own `t`: the labels inside a
 * demo ("Guardar", "Save") are part of the emitted source, so es and en are genuinely two files.
 */
export function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export const GET: APIRoute = ({ params }) => {
  const locale = params.locale as Locale;
  const t = useTranslations(locale);

  return new Response(JSON.stringify(catalogueIndex(locale, t)), {
    headers: { "content-type": "application/json" },
  });
};
