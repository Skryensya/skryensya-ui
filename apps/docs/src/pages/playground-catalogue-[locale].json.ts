import type { APIRoute } from "astro";
import { playgroundCatalogue } from "../lib/playground-catalogue";
import { reactSandboxSource, vanillaSandboxSource } from "../lib/playground-sources";
import { locales, useTranslations, type Locale } from "../i18n";

/*
 * THE CATALOGUE, AS A FILE THE PAGE FETCHES rather than props baked into its HTML.
 *
 * Every preset carries two whole programs — the React entry and the Vanilla document — and there are
 * well over a hundred of them. Handed to the island as props, they are serialised into the page: the
 * playground's HTML went from ~330KB to 794KB the moment the catalogue stopped being one component.
 *
 * As a static JSON endpoint they are an ordinary asset instead: the browser caches it, a second
 * visit pays nothing, the HTML goes back to being the page, and the island already fetches the kit's
 * bundles next to it so this costs no new machinery. Same reasoning, same trade, as
 * `scripts/build-sandbox-bundles.mjs`.
 *
 * ONE FILE PER LOCALE, because the trees are built with the site's own `t`: the labels inside a
 * demo ("Guardar", "Save") are part of the emitted source, so es and en are genuinely two files.
 */
export function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export const GET: APIRoute = ({ params }) => {
  const t = useTranslations(params.locale as Locale);

  const components = playgroundCatalogue(t).map((component) => ({
    id: component.id,
    label: component.label,
    docs: component.docs,
    examples: component.examples.map((example) => ({
      id: example.id,
      label: example.label,
      react: reactSandboxSource(example.tree),
      vanilla: vanillaSandboxSource(example.tree, `${component.label} · ${example.label}`),
    })),
  }));

  return new Response(JSON.stringify(components), {
    headers: { "content-type": "application/json" },
  });
};
