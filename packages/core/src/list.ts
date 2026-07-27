/*
 * LIST, a semantic collection of rows with real anatomy.
 *
 * The root is a native `<ul>` or `<ol>`; the value over a bare list is the row structure (leading /
 * content / trailing) and the interaction. A functional row is a real `<a>`/`<button>` (the `action`
 * part) carrying the interactive class, never an onClick on the `<li>`, so it keeps native focus and
 * keyboard and its feedback comes from the one state-layer mechanism.
 *
 * `interactive` is the state-layer class, exported here so a consumer composes it onto the action the
 * same way the class map names every other part.
 */

/** The native root element. Use `<ol>` when the order of otherwise equivalent rows is meaningful. */
export type ListElement = "ul" | "ol";

/** How dense the rows sit. */
export type ListDensity = "comfortable" | "compact";

export const listParts = {
  root: "sk-list",
  item: "sk-list__item",
  action: "sk-list__action",
  interactive: "sk-interactive",
  leading: "sk-list__leading",
  content: "sk-list__content",
  title: "sk-list__title",
  description: "sk-list__description",
  trailing: "sk-list__trailing",
} as const;

export type ListPart = keyof typeof listParts;
export type ListPartClass = (typeof listParts)[ListPart];
