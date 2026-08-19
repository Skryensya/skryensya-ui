import type { APIRoute } from "astro";
import { catalogueDetail, catalogueIndex } from "../lib/playground-catalogue-endpoints";
import { locales, useTranslations, type Locale } from "../i18n";

/*
 * ONE COMPONENT'S SOURCE, fetched only once a reader selects it.
 *
 * The index route beside this one (`playground-catalogue-[locale].json.ts`) gives `Playground.tsx`
 * enough to draw the rail; it carries no example source. This is the other half: the React entry and
 * the Vanilla document for every example of exactly one component, requested by id
 * (`leafId`/`component.id` in `Playground.tsx` — already URL-safe, same ids the rail tree uses).
 *
 * `getStaticPaths` fans out over every locale × component id so this is prerendered like the index,
 * not computed per-request.
 */
export function getStaticPaths() {
  return locales.flatMap((locale) => {
    const t = useTranslations(locale);
    return catalogueIndex(locale, t).map((component) => ({
      params: { locale, component: component.id },
    }));
  });
}

export const GET: APIRoute = ({ params }) => {
  const locale = params.locale as Locale;
  const t = useTranslations(locale);
  const component = catalogueDetail(locale, t, params.component as string);

  if (!component) return new Response("Not found", { status: 404 });

  return new Response(JSON.stringify(component), {
    headers: { "content-type": "application/json" },
  });
};
