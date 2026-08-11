import { validateUsageTree } from "@skryensya/ai-compiler/validate";
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
 * been ~140 lines of copying for the rest — and every one of those lines a chance to fall behind the
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
const modules = import.meta.glob<Record<string, unknown>>("../demos/*.ts", { eager: true });

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

      const problems = validateUsageTree(tree as UsageTree).problems;
      if (problems.some((problem) => problem.severity === "error")) continue;

      const label = humanise(exportName, id);
      examples.push({ id: slugify(label) || exportName.toLowerCase(), label, tree: tree as UsageTree });
    }

    if (examples.length === 0) continue;

    const page = componentPages.get(id);
    components.push({
      id,
      label: page?.label ?? humanise(id, ""),
      docs: page?.href ?? `/componentes/${id}`,
      examples: examples.sort((a, b) => a.label.localeCompare(b.label, "es")),
    });
  }

  return components.sort((a, b) => a.label.localeCompare(b.label, "es"));
}
