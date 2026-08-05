import type { ComponentContract } from "./contract.js";

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

/*
 * Rows of things, and three ways a row can behave: inert, navigating, or acting.
 *
 * The interactive ones put the ANCHOR or the BUTTON around the whole row rather than a link inside
 * it, so the focus target and the click target are the row itself, which is what a pointer already
 * suggests and a keyboard otherwise cannot reach.
 */
export const listContract = {
  id: "list",
  css: "@skryensya/core/components/list.css",
  parts: listParts,

  options: {
    /**
     * Only `compact` means anything: the CSS selects on it and the comfortable default is the bare
     * class. So this has no default to serialize: writing one would be an attribute nothing reads.
     */
    density: { type: "enum", values: ["compact"], attr: "data-density" },
    /** Dividers are the default; this turns them off, which is why the attribute reads `none`. */
    dividers: { type: "boolean", default: true, attr: "data-dividers" },
    href: { type: "string", attr: "href" },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
  },

  signatures: {
    List: {
      intent: ["rows", "list-of-records", "settings-rows", "inbox"],
      host: { element: "ul" },
      options: ["density"],
      slots: { children: { accepts: "signature", required: true, of: ["ListItemPlain", "ListItem", "ListItemLink"] } },
      template: { element: "ul", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/list", name: "List" },
    },

    OrderedList: {
      intent: ["ordered-rows", "steps-with-rich-row-anatomy", "ranked-records"],
      host: { element: "ol" },
      options: ["density"],
      slots: { children: { accepts: "signature", required: true, of: ["ListItemPlain", "ListItem", "ListItemLink"] } },
      template: { element: "ol", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/list", name: "OrderedList" },
    },

    ListItemPlain: {
      intent: ["plain-list-row", "text-only-ui-row"],
      host: { element: "li" },
      options: ["disabled"],
      parents: ["List", "OrderedList"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "li", part: "item", host: true, slot: "children" },
      react: { from: "@skryensya/react/list", name: "ListItemPlain" },
    },

    ListItem: {
      intent: ["one-row", "inert-row"],
      host: { element: "li" },
      options: ["disabled"],
      parents: ["List", "OrderedList"],
      slots: {
        leading: { accepts: "signature", of: ["Icon", "Avatar.initials"] },
        title: { accepts: "text", required: true },
        description: { accepts: "text" },
        trailing: { accepts: "node" },
      },
      template: {
        element: "li",
        part: "item",
        host: true,
        children: [
          { element: "span", part: "leading", whenGiven: "leading", slot: "leading" },
          {
            element: "span",
            part: "content",
            children: [
              { element: "span", part: "title", slot: "title" },
              { element: "span", part: "description", whenGiven: "description", slot: "description" },
            ],
          },
          { element: "span", part: "trailing", whenGiven: "trailing", slot: "trailing" },
        ],
      },
      react: { from: "@skryensya/react/list", name: "ListItem" },
    },

    ListItemLink: {
      intent: ["row-that-navigates", "tappable-row"],
      host: { element: "a" },
      options: ["href"],
      requires: ["href"],
      parents: ["List", "OrderedList"],
      slots: {
        leading: { accepts: "signature", of: ["Icon", "Avatar.initials"] },
        title: { accepts: "text", required: true },
        description: { accepts: "text" },
        trailing: { accepts: "node" },
      },
      template: {
        element: "li",
        part: "item",
        children: [
          {
            element: "a",
            part: "action",
            also: ["sk-interactive"],
            host: true,
            children: [
              { element: "span", part: "leading", whenGiven: "leading", slot: "leading" },
              {
                element: "span",
                part: "content",
                children: [
                  { element: "span", part: "title", slot: "title" },
                  { element: "span", part: "description", whenGiven: "description", slot: "description" },
                ],
              },
              { element: "span", part: "trailing", whenGiven: "trailing", slot: "trailing" },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/list", name: "ListItemLink" },
    },
  },
} as const satisfies ComponentContract;
