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
  /** Shared state-layer class; composed via `also`, not owned as a list part. */
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
  category: "data",
  css: "@skryensya/core/components/list.css",
  /* Own anatomy only. `sk-interactive` is composed via `also` (and lives in the base bundle); claiming
     it as a part would make list.css the unique owner the moment Button stopped claiming it too. */
  parts: {
    root: listParts.root,
    item: listParts.item,
    action: listParts.action,
    leading: listParts.leading,
    content: listParts.content,
    title: listParts.title,
    description: listParts.description,
    trailing: listParts.trailing,
  },
  hooks: [
    "--sk-list-description-fg",
    "--sk-list-description-font-size",
    "--sk-list-disabled-fg",
    "--sk-list-divider-color",
    "--sk-list-fg",
    "--sk-list-leading-fg",
    "--sk-list-row-gap",
    "--sk-list-row-min-height",
    "--sk-list-row-padding-x",
    "--sk-list-row-padding-y",
    "--sk-list-row-radius",
    "--sk-list-title-fg",
    "--sk-list-title-font-size",
    "--sk-list-title-font-weight",
    "--sk-list-trailing-fg",
  ],

  options: {
    /**
     * Only `compact` means anything: the CSS selects on it and the comfortable default is the bare
     * class. So this has no default to serialize: writing one would be an attribute nothing reads.
     */
    density: { type: "enum", values: ["compact"], attr: "data-density" },
    /*
     * Dividers are the default; this turns them off, which is why the attribute reads `none`.
     *
     * `falseValue` is what makes that sentence true of the EMITTER as well as of the CSS and the
     * React prop, which both already spelled it. Without it a tree asking for `dividers: false`
     * emitted no attribute at all and the rules stayed on: the option was declared, exposed by no
     * signature, and unserializable, all three of which are now fixed together. True writes nothing,
     * per the `falseValue`-without-`trueValue` rule in the emitter.
     */
    dividers: { type: "boolean", default: true, attr: "data-dividers", falseValue: "none" },
    href: { type: "string", attr: "href" },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
  },

  signatures: {
    List: {
      intent: ["rows", "list-of-records", "settings-rows", "inbox"],
      host: { element: "ul" },
      /*
       * `dividers` was declared above and exposed by NO signature, so the option existed in the
       * contract, in the CSS and as a React prop, and was unreachable from a usage tree: an authored
       * list could turn the rules off and an emitted one could not. Nothing new is published here;
       * the signature just stops hiding what the contract already says.
       */
      options: ["density", "dividers"],
      slots: {
        children: {
          accepts: "signature",
          required: true,
          of: ["ListItemPlain", "ListItem", "ListItemLink", "ListItemButton"],
        },
      },
      /*
       * `role="list"` compensates for `list-style: none` (list.css): WebKit drops the implicit
       * `list`/`listitem` role from VoiceOver the moment list-style is removed, a real, documented
       * Safari bug unrelated to this system's own CSS choices. Every other engine already keeps the
       * native role; the explicit role is a no-op there and the fix everywhere else.
       */
      template: { element: "ul", part: "root", host: true, attrs: { role: "list" }, slot: "children" },
      react: { from: "@skryensya/react/list", name: "List" },
    },

    OrderedList: {
      intent: ["ordered-rows", "steps-with-rich-row-anatomy", "ranked-records"],
      host: { element: "ol" },
      options: ["density", "dividers"],
      slots: {
        children: {
          accepts: "signature",
          required: true,
          of: ["ListItemPlain", "ListItem", "ListItemLink", "ListItemButton"],
        },
      },
      template: { element: "ol", part: "root", host: true, attrs: { role: "list" }, slot: "children" },
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
      /** Link host attrs the row does not own as options (Button.navigation peer). */
      forward: ["id", "target", "rel", "download", "aria-*"],
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

    ListItemButton: {
      intent: ["row-that-acts", "tappable-action-row"],
      host: { element: "button" },
      /*
       * Same `disabled` option as inert rows, remapped on the button host to the native attribute
       * (and `aria-disabled` for the stylesheet). Inert `ListItem` / `ListItemPlain` keep
       * `data-disabled` on the `<li>`; a real `<button>` needs the platform spelling.
       */
      options: ["disabled"],
      /* Form association and a11y names the row button does not own as options (Button.action peer). */
      forward: ["id", "name", "form", "aria-*"],
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
            element: "button",
            part: "action",
            also: ["sk-interactive"],
            host: true,
            attrs: { type: "button" },
            optionAttrs: { disabled: "disabled" },
            attrsWhen: [{ option: "disabled", equals: "true", attrs: { "aria-disabled": "true" } }],
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
      react: { from: "@skryensya/react/list", name: "ListItemButton" },
    },
  },
} as const satisfies ComponentContract;
