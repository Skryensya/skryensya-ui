import { emitMarkup } from "@skryensya/ai-compiler/emit";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { describe, expect, it } from "vitest";
import { useTranslations, type Translate } from "../i18n";

/*
 * EVERY ANATOMY DIAGRAM NAMES SOMETHING THAT IS THERE.
 *
 * An anatomy is an `Annotated` whose items point at CSS selectors inside its subject. A selector
 * that matches nothing is not an error anywhere: the enhancer draws no ring, the legend still lists
 * the name, and the page teaches a part the reader cannot find. `trees.test.ts` proves each tree is
 * valid against its contracts, which says nothing about this.
 *
 * So: emit the subject's markup, collect its classes, and require every class a part's selector
 * names to be among them. Classes only, because that is what every anatomy in this directory points
 * at; attribute qualifiers (`[data-state=open]`) are left to the rendered page.
 */
const t: Translate = useTranslations("es");

const modules = import.meta.glob(["./**/*.ts", "!./scripts/**", "!./**/*.test.ts"], {
  eager: true,
}) as Record<string, Record<string, unknown>>;

type AnnotatedTree = UsageTree & {
  slots: { subject: UsageTree; items: readonly { options: { for: string } }[] };
};

const isAnnotated = (value: unknown): value is AnnotatedTree =>
  typeof value === "object" &&
  value !== null &&
  (value as UsageTree).contract === "annotation" &&
  (value as UsageTree).signature === "Annotated";

const anatomies: [string, AnnotatedTree][] = [];
for (const [file, exports] of Object.entries(modules)) {
  for (const [name, value] of Object.entries(exports)) {
    if (!/AnatomyTree$/.test(name)) continue;
    const tree = typeof value === "function" ? (value as (t: Translate, ...rest: unknown[]) => unknown)(t, "/demo") : value;
    if (isAnnotated(tree)) anatomies.push([`${file}#${name}`, tree]);
  }
}

/*
 * Parts an enhancer or machine CREATES in the browser, so no static markup can contain them. Each is
 * checked on the rendered page instead. Listed by name, not by prefix, so a typo in a new diagram is
 * still caught: only these exact classes are excused.
 */
const RENDERED_AT_RUNTIME = new Set([
  // Calendar's machine builds the header and the grid from its value.
  "sk-calendar__header",
  "sk-calendar__previous",
  "sk-calendar__view-trigger",
  "sk-calendar__next",
  "sk-calendar__table",
  "sk-calendar__table-header",
  "sk-calendar__table-body",
  "sk-calendar__cell",
  "sk-calendar__cell-trigger",
  // Carousel's machine adds its controls and one dot per slide.
  "sk-carousel__controls",
  "sk-carousel__button",
  "sk-carousel__autoplay",
  "sk-carousel__dots",
  "sk-carousel__dot",
  // The editor's toolbar buttons come from its command list.
  "sk-editor__toolbar-button",
  // The treegrid enhancer adds a disclosure button to each expandable row.
  "sk-treegrid__disclosure",
  // Diagram's enhancer draws every connector, line and arrowhead from the authored edge list.
  "sk-diagram__arrow",
  // Annotated's enhancer draws each item's leader (or bracket) into the overlay.
  "sk-annotated__leader",
]);

const classesIn = (markup: string): Set<string> => {
  const classes = new Set([...markup.matchAll(/class="([^"]*)"/g)].flatMap((match) => match[1]!.split(/\s+/).filter(Boolean)));
  // The icon enhancer replaces every `data-sk-icon` span with `<svg class="sk-icon">`.
  if (markup.includes("data-sk-icon=")) classes.add("sk-icon");
  return classes;
};

/*
 * The hand-written figures (`anatomyFigureHtml`), for the specimens a tree cannot express: a menu
 * frozen open, a lightbox on one photo. Same rule, read straight off the markup: every `data-for`
 * names classes the figure's own specimen carries.
 */
const htmlAnatomies: [string, string][] = [];
for (const [file, exports] of Object.entries(modules)) {
  for (const [name, value] of Object.entries(exports)) {
    if (!/AnatomyHtml$/.test(name) || typeof value !== "function") continue;
    const html = (value as (t: Translate) => unknown)(t);
    if (typeof html === "string") htmlAnatomies.push([`${file}#${name}`, html]);
  }
}

describe("anatomy diagrams", () => {
  it("finds the anatomy trees", () => {
    expect(anatomies.length).toBeGreaterThan(40);
  });

  it.each(anatomies)("%s names only parts its subject renders", (_id, tree) => {
    const present = classesIn(emitMarkup(tree.slots.subject));
    const missing = tree.slots.items.flatMap(({ options }) =>
      [...options.for.matchAll(/\.([\w-]+)/g)]
        .map((match) => match[1]!)
        .filter((name) => !present.has(name) && !RENDERED_AT_RUNTIME.has(name)),
    );
    expect(missing).toEqual([]);
  });

  it("finds the hand-written anatomies", () => {
    expect(htmlAnatomies.length).toBeGreaterThan(5);
  });

  it.each(htmlAnatomies)("%s names only parts its specimen renders", (_id, html) => {
    const present = classesIn(html);
    const missing = [...html.matchAll(/data-for="([^"]*)"/g)].flatMap((match) =>
      [...match[1]!.matchAll(/\.([\w-]+)/g)]
        .map((part) => part[1]!)
        .filter((name) => !present.has(name) && !RENDERED_AT_RUNTIME.has(name)),
    );
    expect(missing).toEqual([]);
  });
});
