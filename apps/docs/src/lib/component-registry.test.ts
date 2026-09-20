import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { pausedComponents } from "@skryensya/core/paused";
import { componentNavigation } from "./navigation";

/*
 * A COMPONENT PAGE IS REACHABLE, AND DESCRIBED.
 *
 * Adding one costs eight files, and only three of them fail a build when you forget: the page
 * itself, the i18n shard's spread (a closed `UIKey` union catches that), and the catalogue lookup
 * that throws. The other five are convention, and two of them are these: `navigation.ts` decides
 * whether the page is reachable from the sidebar and the search index at all, and
 * `component-catalog.ts` supplies the explorer's one-line description. Miss either and the build
 * stays green while the page becomes unreachable or undescribed.
 *
 * This asserts the three lists agree. It found no drift when written, which is the point: the
 * registries were consistent by care, and this is what keeps them that way without the care.
 */
const pagesDir = join(process.cwd(), "src/pages/components");
const libDir = join(process.cwd(), "src/lib");

const hrefs = (file: string, pattern: RegExp) =>
  new Set([...readFileSync(join(libDir, file), "utf8").matchAll(pattern)].map((m) => m[1]!));

const navigation = hrefs("navigation.ts", /href:\s*"(\/components\/[a-z0-9-]+)"/g);
const catalogue = hrefs("component-catalog.ts", /"(\/components\/[a-z0-9-]+)":/g);

/*
 * Two routes under `components/` are deliberately in neither list, and naming them here is the
 * point: a future reader sees that the absence was decided, not forgotten.
 *   - `details` is a 301 redirect to Accordion's native-details section, not a page.
 *   - `primitives` documents tier-1 tokens, which is a foundation and not a component.
 *   - `popup` is a 301 into Popover's `#popup` section: it documented `Popover.bare` under a second
 *     name, so it was one family with two pages rather than two components.
 */
const NOT_COMPONENTS = new Set([
  "/components/details",
  "/components/primitives",
  "/components/popup",
]);

const routes = readdirSync(pagesDir)
  .filter((f) => f.endsWith(".astro") && f !== "index.astro")
  .map((f) => `/components/${f.replace(/\.astro$/, "")}`)
  .filter((href) => !NOT_COMPONENTS.has(href));

describe("the component registries", () => {
  it("found enough routes to be worth checking", () => {
    expect(routes.length).toBeGreaterThan(70);
  });

  it("lists every component route in the navigation", () => {
    expect(routes.filter((href) => !navigation.has(href))).toEqual([]);
  });

  it("describes every component route in the catalogue", () => {
    expect(routes.filter((href) => !catalogue.has(href))).toEqual([]);
  });

  it("has no entry pointing at a route that does not exist", () => {
    const all = new Set([...routes, ...NOT_COMPONENTS]);
    expect([...navigation].filter((h) => !all.has(h))).toEqual([]);
    expect([...catalogue].filter((h) => !all.has(h))).toEqual([]);
  });
});

/*
 * A PAUSED COMPONENT LEAVES EVERY RAIL AT ONCE.
 *
 * Pausing is one filter in `navigation.ts` feeding four renderers, and the reason it is one filter
 * is that a component hidden from the sidebar but still listed in the component index, or still
 * reachable through search, is not hidden: it is inconsistent, which reads as a bug rather than as
 * a decision. `componentNavigation` is the list all four build from, so asserting on it asserts on
 * all four.
 *
 * The route is checked to still EXIST in the same breath. That is the whole difference between
 * pausing and deleting: the page is built, its demos run, and the link still opens. A paused entry
 * whose page had quietly gone away would make this list a graveyard instead of a pause.
 */
describe("a paused component", () => {
  const advertised = new Set(componentNavigation.flatMap((group) => group.items.map((i) => i.href)));

  it.each(pausedComponents.map((component) => component.docs))("%s is not in the navigation", (docs) => {
    expect(advertised.has(docs)).toBe(false);
  });

  it.each(pausedComponents.map((component) => component.docs))("%s still has its page", (docs) => {
    expect(routes.includes(docs) || NOT_COMPONENTS.has(docs)).toBe(true);
  });

  it("does not hide anything the catalogue has not decided to hide", () => {
    const paused = new Set(pausedComponents.map((component) => component.docs));
    expect(routes.filter((href) => !advertised.has(href) && !paused.has(href))).toEqual([]);
  });
});
