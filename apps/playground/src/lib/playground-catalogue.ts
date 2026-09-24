import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { isPausedSlug } from "@skryensya/core/paused";
import { snippets } from "@skryensya/snippets";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { componentNavigation } from "./navigation";
import { docsHref } from "./docs-origin";
import { treeAnchorId } from "../../../docs/src/lib/tree-anchor";
import { cardCopy } from "../../../docs/src/examples/card-data";
import { localizePath, type Locale, type Translate } from "../i18n";

/*
 * WHAT THE PLAYGROUND OFFERS, and where it comes from.
 *
 * Every preset here is a usage tree a component page ALREADY renders. That is the whole point: the
 * playground is not a second set of examples to keep in step with the first, it is the same trees
 * opened in an editor. A demo that changes on the Button page changes here with it.
 *
 * READ FROM THE DEMOS DIRECTORY, not listed by hand. The first version of this file named one
 * component and seven of its examples explicitly, which was fine for one component and would have
 * been ~140 lines of copying for the rest - and every one of those lines a chance to fall behind the
 * demo it names. A glob has no such lines: a demo that lands in `src/demos/` is in the playground the
 * moment it validates, and one that is deleted leaves with no edit here.
 *
 * VALIDATED, NOT TRUSTED. Each candidate goes through the same validator `validate_ui` and the gates
 * run, and anything with an error is dropped rather than shipped broken. That is not theoretical:
 * it is what caught `command-palette`'s `variant: "secondary"`, a variant the Button contract does
 * not have, silently rendering as the default on the docs page.
 */
export type PlaygroundExample = {
  /** Stable, URL-safe, and the thing the tree links to. Derived from the export's name. */
  readonly id: string;
  readonly label: string;
  readonly tree: UsageTree;
  /** The docs page that renders THIS tree, opened on its usage tab and scrolled to the demo. */
  readonly docs: string;
};

export type PlaygroundComponent = {
  readonly id: string;
  readonly label: string;
  /** Where the prose for this component lives. The playground runs it; the page explains it. */
  readonly docs: string;
  readonly examples: readonly PlaygroundExample[];
};

/*
 * Every demo module, eagerly, because this runs at BUILD time: the browser never sees the trees, it
 * gets the emitted sources. `query: "?url"` would defeat that; the modules themselves are wanted.
 */
/*
 * `*.test.ts` IS EXCLUDED BY THE PATTERN, not by filtering the result: `eager` is resolved at
 * COMPILE time, so a `.filter()` on the returned object runs long after Vite has already emitted the
 * import and the module has already executed. `demos/trees.test.ts` calls `describe()` at module
 * scope, and executing it outside a test run throws "Cannot read properties of undefined (reading
 * 'config')" from vitest's `initSuite`, which turns this whole endpoint into a 500. The demos
 * directory is a source directory that happens to hold one test, and only the glob can say so.
 */
const modules = import.meta.glob<Record<string, unknown>>(
  ["../../../docs/src/demos/*.ts", "!../../../docs/src/demos/*.test.ts"],
  { eager: true },
);

/*
 * EVERY DEMO IS CALLED WITH `t` ALONE, and that is a rule the demos keep, not a table kept here.
 *
 * A table of extra arguments (hrefs, a locale, options) used to live here, one entry per factory
 * that needed more than `t`. It could only ever fall behind: every demo added after it was written
 * either threw or produced a tree with `href: undefined`, and both are dropped below without a
 * word, which is how Combobox, Megamenu, three NavLists and a dozen more went missing. Each factory
 * now defaults everything past `t` (`placeholderHrefs`, `localeOf(t)`), and
 * `docs/src/demos/playground-ready.test.ts` fails the moment a new one does not.
 */

/*
 * The modules whose factories take something other than `t` FIRST.
 *
 * `demos/card.ts` builds from `CardCopy`, the per-locale card data the Card page hands in, not from
 * the dictionary: its words live in `examples/card-data.ts`. Called with `t` like every other module
 * it produced no tree at all, so Card, which has no component of its own, never reached the rail.
 * Keyed by module and resolved per locale, so the Spanish playground shows the Spanish cards.
 */
const MODULE_ARGUMENTS: Record<string, (locale: Locale) => readonly unknown[]> = {
  card: (locale) => [cardCopy[locale]],
};

/** `../demos/image-frame.ts` → `image-frame`. */
const moduleId = (path: string) => path.split("/").pop()!.replace(/\.ts$/, "");

/** `buttonIconOnlyTree` in `button` → `Icon only`. The export name is the only name there is. */
function humanise(exportName: string, componentId: string): string {
  const camel = componentId.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  const stripped = exportName
    .replace(/Tree$/, "")
    .replace(new RegExp(`^${camel}`), "")
    .replace(/^demo/i, "");
  const words = (stripped || exportName.replace(/Tree$/, ""))
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** `buttonIconOnlyTree` → `icon-only`, for the tree's node id and the URL. */
const slugify = (label: string) =>
  label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/*
 * WHICH DOCS PAGE RENDERS WHICH DEMO, read off the pages' own imports.
 *
 * Guessing the page from the module name (`demos/tabs.ts` -> `/components/tabs`) is right for most of
 * the catalogue and wrong exactly where it matters: `demos/layout.ts` feeds Grid, Stack, Inline and
 * Box, `demos/typography.ts` feeds Text and Heading, and neither `/components/layout` nor
 * `/components/typography` exists, so "See the docs" opened a 404. The page that imports
 * `stackTree` is the page that shows it, so that is the question asked.
 *
 * Two hops, because a route file is usually a one-line wrapper (`<GridPage />`) and the imports live
 * in the page component it renders. Only default-locale routes are read; `localizePath` finds the
 * other language's address from there. `debug/` pages import demos too and are not destinations.
 */
const pageComponentSources = import.meta.glob<string>("../../../docs/src/components/pages/*.astro", {
  eager: true,
  query: "?raw",
  import: "default",
});
const routeSources = import.meta.glob<string>(
  ["../../../docs/src/pages/**/*.astro", "!../../../docs/src/pages/es/**", "!../../../docs/src/pages/debug/**"],
  { eager: true, query: "?raw", import: "default" },
);

/** Every demo export an Astro source imports, as `module:exportName`. */
function importedDemos(source: string): Set<string> {
  const found = new Set<string>();
  for (const match of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["'][^"']*\/demos\/([\w-]+)(?:\.ts)?["']/g)) {
    for (const name of match[1]!.split(",")) {
      const exported = name.trim().split(/\s+as\s+/)[0];
      if (exported) found.add(`${match[2]}:${exported}`);
    }
  }
  return found;
}

const demosByPageComponent = new Map(
  Object.entries(pageComponentSources).map(([path, source]) => [path.split("/").pop()!, importedDemos(source)]),
);

/** `../../../docs/src/pages/components/grid.astro` -> `/components/grid`, and every demo it shows. */
const demoRoutes = Object.entries(routeSources).map(([path, source]) => {
  const route = `/${path.split("/docs/src/pages/")[1]!.replace(/\.astro$/, "").replace(/(^|\/)index$/, "")}`;
  const demos = importedDemos(source);
  for (const match of source.matchAll(/import\s+\w+\s+from\s*["'][^"']*\/([\w-]+\.astro)["']/g)) {
    for (const demo of demosByPageComponent.get(match[1]!) ?? []) demos.add(demo);
  }
  return { route: route.replace(/\/$/, "") || "/", demos };
});

/**
 * The route that renders `module:exportName`. When more than one does (Card borrows a chart demo),
 * the page named after the module wins, then a component page over any other.
 */
function routeFor(moduleName: string, exportName: string): string | undefined {
  const key = `${moduleName}:${exportName}`;
  const candidates = demoRoutes.filter((entry) => entry.demos.has(key)).map((entry) => entry.route);
  const rank = (route: string) => (route.endsWith(`/${moduleName}`) ? 0 : route.startsWith("/components/") ? 1 : 2);
  return candidates.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))[0];
}

/** An absolute, localized docs address: on the usage tab, at the demo when the page carries its anchor. */
const docsUrl = (route: string, locale: Locale, tree?: UsageTree): string =>
  docsHref(`${localizePath(route, locale)}${route.startsWith("/components/") ? "?tab=usage" : ""}${tree ? `#${treeAnchorId(tree)}` : ""}`);

/** Component labels and destinations, from the same catalogue the site's own index is built from. */
const componentPages = new Map(
  componentNavigation
    .flatMap((group) => group.items)
    .map((item) => [item.href.split("/").pop()!, item] as const),
);

export function playgroundCatalogue(t: Translate, locale: Locale): readonly PlaygroundComponent[] {
  /*
   * ONE RAIL ENTRY PER COMPONENT, NOT PER DEMO MODULE.
   *
   * The rail used to be the directory listing: one entry per file in `demos/`. Most files ARE one
   * component, and the rest are exactly where that broke. `demos/layout.ts` feeds Box, Grid, Stack,
   * Inline, Footer, Hero and Layout grid, `demos/typography.ts` feeds Heading and Text, and so the
   * rail had "Layout" and "Typography" and none of the nine components a reader would look for.
   * Each example now goes to the component whose docs page renders it (`routeFor`, the same answer
   * "See the docs" already uses), and only a demo no component page shows stays under its module.
   */
  const groups = new Map<string, { examples: PlaygroundExample[]; claimed: Set<string>; firstModule: string }>();

  for (const [path, module] of Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))) {
    const id = moduleId(path);
    /*
     * A PAUSED COMPONENT IS NOT A PRESET. The glob is what makes this catalogue self-maintaining, and
     * that cuts both ways: a demo module keeps producing presets long after the kit stopped offering
     * the component, because nothing here reads the rail to decide WHETHER to include one, only to
     * label and link it. So the skip is explicit. `@skryensya/core/paused` holds the list.
     */
    if (isPausedSlug(id)) continue;
    const moduleArguments = MODULE_ARGUMENTS[id]?.(locale);

    for (const [exportName, value] of Object.entries(module)) {
      /* Only `*Tree` exports are examples, the same rule `playground-ready.test.ts` holds them to. A
         helper that happens to return a tree (`genericIcon`, the anatomy diagrams' placeholder icon)
         is a building block, and offered on its own it read as a component called "Anatomy subject". */
      if (!exportName.endsWith("Tree")) continue;
      let tree: unknown = value;

      if (typeof value === "function") {
        try {
          tree = moduleArguments ? value(...moduleArguments) : value(t);
        } catch {
          // Not a tree factory (a helper, a formatter): it simply is not a preset.
          continue;
        }
      }
      if (!tree || typeof tree !== "object" || !("contract" in tree)) continue;

      /*
       * ANATOMY DIAGRAMS ARE EXAMPLES TOO. They were skipped, on the argument that an inert specimen
       * is not something to run. But a diagram is a tree like any other, both bindings emit it, and
       * its source is the answer to "how do I draw one of these for MY component", which only the
       * playground can show by letting the reader edit it. Each lands under the component it
       * diagrams (its docs page is the one that renders it), labelled by its own name ("Anatomy").
       */
      const problems = validateUsageTree(tree as UsageTree).problems;
      if (problems.some((problem) => problem.severity === "error")) continue;

      const route = routeFor(id, exportName);
      const routed = route?.startsWith("/components/") ? route.split("/").pop()! : undefined;
      const componentId = routed && componentPages.has(routed) && !isPausedSlug(routed) ? routed : id;
      const group =
        groups.get(componentId) ??
        groups.set(componentId, { examples: [], claimed: new Set(), firstModule: id }).get(componentId)!;

      /*
       * THE PREFIX STRIP CAN COLLIDE, so the slug is claimed rather than assumed. `humanise` removes
       * the module prefix from the export name, which is what turns `buttonIconOnlyTree` into
       * "Icon only": but two exports can come out the same once stripped (in `demos/layout.ts`,
       * `gridTree` and `layoutGridTree` both read "Grid"), and now two MODULES can feed one
       * component. On a collision the FULL export name is used instead, which is unique within a
       * module, and then the module name, which makes it unique across them.
       */
      let label = humanise(exportName, id);
      let slug = slugify(label) || exportName.toLowerCase();
      if (group.claimed.has(slug)) {
        label = humanise(exportName, "");
        slug = slugify(label) || exportName.toLowerCase();
      }
      if (group.claimed.has(slug)) {
        label = `${label} (${id})`;
        slug = `${slug}-${id}`;
      }
      group.claimed.add(slug);
      const docsRoute = route ?? componentPages.get(componentId)?.href;
      group.examples.push({
        id: slug,
        label,
        tree: tree as UsageTree,
        docs: docsRoute ? docsUrl(docsRoute, locale, tree as UsageTree) : "",
      });
    }
  }

  const components: PlaygroundComponent[] = [];
  for (const [id, { examples }] of groups) {
    if (examples.length === 0) continue;
    const page = componentPages.get(id);
    components.push({
      id,
      label: page?.label ?? humanise(id, ""),
      /* The component's own page when it has one, else wherever its first example lives. Never a
       * guessed `/components/${id}`: that is the 404 this used to open for layout and typography. */
      docs: page?.href ? docsUrl(page.href, locale) : (examples.find((example) => example.docs)?.docs ?? ""),
      examples: examples.sort((a, b) => a.label.localeCompare(b.label, "es")),
    });
  }

  /*
   * THE EXAMPLE SOURCE THAT IS NOT PER-COMPONENT.
   *
   * The glob above reaches `docs/src/demos/`, which is organised one module per component, and that
   * shape is the rail. `@skryensya/snippets` is the other place this repo keeps established trees,
   * and it is not per-component by design: a snippet is a few families composed into one small piece
   * of UI. Left out, the playground offered every Button variant and nothing that showed Button
   * inside anything.
   *
   * It arrives as a package rather than a glob because that is what it already is: the compiler
   * validates it on every build, so a tree that stopped matching its contract fails there instead
   * of turning up broken here.
   */
  const snippetExamples = snippets
    .filter((snippet) => !validateUsageTree(snippet.tree).problems.some((p) => p.severity === "error"))
    .map((snippet) => ({
      id: snippet.id,
      label: humanise(snippet.id, ""),
      tree: snippet.tree,
      docs: docsUrl("/components", locale),
    }));

  if (snippetExamples.length > 0) {
    components.push({
      id: "snippets",
      label: t("nav.snippets"),
      /* No page of its own yet, so the nearest honest destination is the catalogue it composes. */
      docs: docsUrl("/components", locale),
      examples: [...snippetExamples].sort((a, b) => a.label.localeCompare(b.label, "es")),
    });
  }

  return components.sort((a, b) => a.label.localeCompare(b.label, "es"));
}
