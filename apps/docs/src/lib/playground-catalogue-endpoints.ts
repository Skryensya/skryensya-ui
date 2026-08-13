import { playgroundCatalogue, type PlaygroundComponent } from "./playground-catalogue";
import { reactSandboxSource, vanillaSandboxSource } from "./playground-sources";
import type { Locale, Translate } from "../i18n";

/*
 * ONE MAPPING, TWO SHAPES, so the index route and the per-component detail route can never drift
 * apart the way two independent copies of this loop would. `playground-catalogue-[locale].json.ts`
 * calls `catalogueIndex` for the rail (labels only, no source); the per-component detail route calls
 * `catalogueDetail` for exactly the one component a reader selected (full source, both bindings).
 */

export type CatalogueIndexExample = { readonly id: string; readonly label: string };
export type CatalogueIndexComponent = {
  readonly id: string;
  readonly label: string;
  readonly docs: string;
  readonly examples: readonly CatalogueIndexExample[];
};

export type CatalogueDetailExample = CatalogueIndexExample & {
  readonly react: string;
  readonly vanilla: string;
};
export type CatalogueDetailComponent = Omit<CatalogueIndexComponent, "examples"> & {
  readonly examples: readonly CatalogueDetailExample[];
};

/*
 * Memoized per locale: `getStaticPaths` on the detail route below fans out to one request per
 * (locale, component) pair, and `playgroundCatalogue` re-evaluates and re-validates every demo's
 * tree on each call. Without this, that work — cheap once — happens once per component instead of
 * once per locale.
 */
const catalogueByLocale = new Map<Locale, readonly PlaygroundComponent[]>();

function catalogueFor(locale: Locale, t: Translate): readonly PlaygroundComponent[] {
  const cached = catalogueByLocale.get(locale);
  if (cached) return cached;

  const computed = playgroundCatalogue(t);
  catalogueByLocale.set(locale, computed);
  return computed;
}

/** Every component, labels only — what the rail tree needs to draw itself. */
export function catalogueIndex(locale: Locale, t: Translate): readonly CatalogueIndexComponent[] {
  return catalogueFor(locale, t).map((component) => ({
    id: component.id,
    label: component.label,
    docs: component.docs,
    examples: component.examples.map((example) => ({ id: example.id, label: example.label })),
  }));
}

/** One component, full source for both bindings — what the sandbox needs once it is selected. */
export function catalogueDetail(
  locale: Locale,
  t: Translate,
  componentId: string,
): CatalogueDetailComponent | null {
  const component = catalogueFor(locale, t).find((entry) => entry.id === componentId);
  if (!component) return null;

  return {
    id: component.id,
    label: component.label,
    docs: component.docs,
    examples: component.examples.map((example) => ({
      id: example.id,
      label: example.label,
      react: reactSandboxSource(example.tree),
      vanilla: vanillaSandboxSource(example.tree, `${component.label} · ${example.label}`),
    })),
  };
}
