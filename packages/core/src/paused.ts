/*
 * PAUSED COMPONENTS: still built, still tested, no longer advertised.
 *
 * A component that is not ready to be recommended has two bad endings. Deleting it throws away
 * working code, its tests, its contract and its history, and whoever wants it back rebuilds it from
 * a diff. Leaving it in place is worse in the other direction: the sidebar offers it, the catalogue
 * describes it, `get_catalog` publishes its signatures to an agent that will happily compose it, and
 * every one of those is a promise the kit is not ready to keep.
 *
 * So there is a third state, and this list is it. A paused component keeps everything that makes it
 * real (the contract in `registry.ts`, both bindings, its tests, its stylesheet, its docs page at
 * its own URL, its demos validating on every build) and loses only the places that RECOMMEND it:
 *
 *   docs navigation    `apps/docs/src/lib/navigation.ts` drops the entry, which takes the sidebar,
 *                      the component index, the landing page and the search index with it.
 *   MCP catalogue      `ai-compiler`'s `buildManifest` leaves it out of both compiled artifacts, so
 *                      `get_catalog` never lists it and `get_contract` cannot be asked for it.
 *   playground         `playground-catalogue.ts` skips its demos, so it is not a preset to open.
 *   package barrels    `@skryensya/react` and `@skryensya/vanilla` stop re-exporting it. The deep
 *                      subpath (`@skryensya/react/data-grid`) still resolves, which is what keeps
 *                      the docs page and the previews rendering while the entry is paused.
 *
 * VALIDATION IS DELIBERATELY NOT ON THAT LIST. `validate_ui` still accepts a paused family, because
 * the docs page for it renders its own demos through the same validator and the gates run over
 * them. Pausing is a statement about what the kit RECOMMENDS, not about what it can still prove.
 *
 * UNPAUSING IS DELETING A LINE HERE, plus restoring the two barrel exports the entry names. Nothing
 * else moved, so nothing else has to move back.
 */

export type PausedComponent = {
  /** Contract family id, exactly as `registry.ts` keys it and `get_contract` would answer to. */
  readonly family: string;
  /**
   * Canonical docs route, in the default locale's vocabulary. Stored rather than derived from
   * `family`: the two agree today, and a component whose page is named differently from its
   * contract would otherwise be paused in one surface and live in the other, silently.
   */
  readonly docs: string;
  /** When it was paused, so a reader knows whether this is a recent call or an old one. */
  readonly since: string;
  /** Why, in one line. The entry is a decision, and a decision with no reason cannot be revisited. */
  readonly why: string;
};

/*
 * TYPED AS THE WIDE ARRAY, not `as const`. Literal types here would make `Set(pausedComponents.map(
 * (c) => c.family)).has(someContractId)` a type error at every call site that asks "is this one
 * paused?", which is the only question anyone asks of this list.
 */
export const pausedComponents: readonly PausedComponent[] = [
  {
    family: "data-grid",
    docs: "/components/data-grid",
    since: "2026-09-18",
    why: "Set aside while the catalogue is trimmed. Table and Treegrid cover the cases people actually ask for, and 2D cell navigation is not settled enough to recommend.",
  },
];

const pausedFamilies = new Set<string>(pausedComponents.map((component) => component.family));
const pausedRoutes = new Set<string>(pausedComponents.map((component) => component.docs));

/** Is this contract family paused? Keyed the way the registry and the compiled artifacts are. */
export const isPausedFamily = (family: string): boolean => pausedFamilies.has(family);

/** Is this docs route paused? Takes the canonical (default locale) path, as `navigation.ts` writes it. */
export const isPausedRoute = (href: string): boolean => pausedRoutes.has(href);

/**
 * Is this component slug paused? The slug is the last segment of a component route, which is also
 * how the demos directory names its modules, so the playground can ask without holding a route.
 */
export const isPausedSlug = (slug: string): boolean => pausedRoutes.has(`/components/${slug}`);
