import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { recipes } from "@skryensya/recipes";
import { snippets } from "@skryensya/snippets";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { componentNavigation } from "./navigation";
import type { Translate } from "../i18n";

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
 * The demos that take more than a `t`.
 *
 * Most tree factories are `(t) => UsageTree`. A handful take a second argument because the page that
 * renders them has real destinations or a real locale to hand in, and calling those with nothing
 * produces a tree that fails validation for a reason that is the CALLER's, not the demo's. The
 * values below are the shapes those factories destructure, with the same placeholder hrefs the
 * emitted snippets already use elsewhere: inside a sandbox they go nowhere, and what the example is
 * about is the SHAPE of a link, not its target.
 */
const HREF = "#";
const EXTRA_ARGUMENTS: Record<string, unknown> = {
  breadcrumbMultiTree: { projects: HREF, kit: HREF },
  breadcrumbIconTree: HREF,
  breadcrumbLongTree: HREF,
  breadcrumbTwoTree: HREF,
  buttonAsLinkTree: HREF,
  listFullTree: [HREF, HREF, HREF],
  listLinksTree: [HREF, HREF, HREF],
  navListTree: { home: HREF, reports: HREF },
  navbarTree: { home: HREF, projects: HREF, reports: HREF, team: HREF },
  sidebarTree: { home: HREF, reports: HREF },
  tableDensityTree: 0.8,
  timeFieldTree: { locale: "es-DO", name: "hora" },
  timeFieldNativeTree: { locale: "es-DO", name: "hora" },
};

/** `../demos/image-frame.ts` → `image-frame`. */
const moduleId = (path: string) => path.split("/").pop()!.replace(/\.ts$/, "");

/** `buttonIconOnlySmTree` in `button` → `Icon only sm`. The export name is the only name there is. */
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

/** `buttonIconOnlySmTree` → `icon-only-sm`, for the tree's node id and the URL. */
const slugify = (label: string) =>
  label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Component labels and destinations, from the same catalogue the site's own index is built from. */
const componentPages = new Map(
  componentNavigation
    .flatMap((group) => group.items)
    .map((item) => [item.href.split("/").pop()!, item] as const),
);

export function playgroundCatalogue(t: Translate): readonly PlaygroundComponent[] {
  const components: PlaygroundComponent[] = [];

  for (const [path, module] of Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))) {
    const id = moduleId(path);
    const examples: PlaygroundExample[] = [];
    /** Slugs already taken inside THIS component, so a second one cannot reuse an id. */
    const claimed = new Set<string>();

    for (const [exportName, value] of Object.entries(module)) {
      const extra = EXTRA_ARGUMENTS[exportName];
      let tree: unknown = value;

      if (typeof value === "function") {
        try {
          tree = extra === undefined ? value(t) : value(t, extra);
        } catch {
          // Not a tree factory (a helper, a formatter): it simply is not a preset.
          continue;
        }
      }
      if (!tree || typeof tree !== "object" || !("contract" in tree)) continue;

      /*
       * ANATOMY DIAGRAMS ARE NOT EXAMPLES. A tree rooted in the `annotation` contract is a drawing
       * OF a component: a labelled specimen with `inert: true`, whose whole point is that it cannot
       * be interacted with. Handing one to an editor offers the reader a diagram to run, and its
       * source is mostly ring geometry and label placement rather than the component being taught.
       *
       * Matched on the ROOT CONTRACT and not on the export name (`*AnatomyTree`): the name is a
       * convention and conventions drift, while a tree that renders a diagram has no way to stop
       * being rooted in `annotation`. This also removes the Annotation component's own demos, which
       * is correct for the same reason: they are annotations.
       */
      if ((tree as UsageTree).contract === "annotation") continue;

      const problems = validateUsageTree(tree as UsageTree).problems;
      if (problems.some((problem) => problem.severity === "error")) continue;

      /*
       * THE PREFIX STRIP CAN COLLIDE, so the slug is claimed rather than assumed. `humanise` removes
       * the component prefix from the export name, which is what turns `buttonIconOnlyTree` into
       * "Icon only": but in `demos/layout.ts` both `gridTree` and `layoutGridTree` come out "Grid",
       * because stripping `layout` from the second leaves exactly the first. That shipped two rail
       * entries reading "Grid", two catalogue ids reading `grid`, and React warning about duplicate
       * keys on every render of the rail.
       *
       * On a collision the FULL export name is used instead, which is unique by construction: a
       * module cannot export the same name twice. So the second one reads "Layout grid", which is
       * also the more accurate name for it.
       */
      let label = humanise(exportName, id);
      let slug = slugify(label) || exportName.toLowerCase();
      if (claimed.has(slug)) {
        label = humanise(exportName, "");
        slug = slugify(label) || exportName.toLowerCase();
      }
      claimed.add(slug);
      examples.push({ id: slug, label, tree: tree as UsageTree });
    }

    if (examples.length === 0) continue;

    const page = componentPages.get(id);
    components.push({
      id,
      label: page?.label ?? humanise(id, ""),
      docs: page?.href ?? `/components/${id}`,
      examples: examples.sort((a, b) => a.label.localeCompare(b.label, "es")),
    });
  }

  /*
   * THE TWO EXAMPLE SOURCES THAT ARE NOT PER-COMPONENT.
   *
   * The glob above reaches `docs/src/demos/`, which is organised one module per component, and that
   * shape is the rail. `@skryensya/snippets` and `@skryensya/recipes` are the other two places this
   * repo keeps established trees, and they are not per-component by design: a snippet is a few
   * families composed into one small piece of UI, a recipe is a whole screen in four states. Left
   * out, the playground offered every Button variant and nothing that showed Button inside anything.
   *
   * They arrive as packages rather than a glob because that is what they already are: the compiler
   * validates both on every build, so a tree that stopped matching its contract fails there instead
   * of turning up broken here.
   */
  const snippetExamples = snippets
    .filter((snippet) => snippet.tree.contract !== "annotation")
    .filter((snippet) => !validateUsageTree(snippet.tree).problems.some((p) => p.severity === "error"))
    .map((snippet) => ({ id: snippet.id, label: humanise(snippet.id, ""), tree: snippet.tree }));

  if (snippetExamples.length > 0) {
    components.push({
      id: "snippets",
      label: t("nav.snippets"),
      /* No page of its own yet, so the nearest honest destination is the catalogue it composes. */
      docs: "/components",
      examples: [...snippetExamples].sort((a, b) => a.label.localeCompare(b.label, "es")),
    });
  }

  /* Reading order, not alphabetical, and the same order `/recipes` renders: a screen is nothing
     until it has come back, and the state that teaches the most is the one everybody skips. */
  const stateOrder = ["loading", "empty", "error", "success"] as const;
  const recipeExamples = recipes.flatMap((recipe) =>
    stateOrder
      .map((state) => ({ state, tree: recipe.states[state] }))
      .filter(({ tree }) => tree && tree.contract !== "annotation")
      .filter(({ tree }) => !validateUsageTree(tree).problems.some((p) => p.severity === "error"))
      .map(({ state, tree }) => ({
        id: `${recipe.id}-${state}`,
        label: `${humanise(recipe.id, "")} · ${state}`,
        tree,
      })),
  );

  if (recipeExamples.length > 0) {
    components.push({
      id: "recipes",
      label: t("nav.recipes"),
      docs: "/recipes",
      examples: recipeExamples,
    });
  }

  return components.sort((a, b) => a.label.localeCompare(b.label, "es"));
}
