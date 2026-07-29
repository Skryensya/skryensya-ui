import type { ComponentContract, OptionValue, SignatureOptionsOf } from "./contract.js";

/*
 * A PATTERN, by decision 8's rule: the navbar and the sidebar need this exact structure, a list of
 * destinations, each an icon, a label and optional trailing metadata, so shipping it once is the
 * point. That the two differ by orientation is a variant, not a second structure — which is why
 * orientation is an option below and not a second signature.
 *
 * Named for its role, never for the thing it currently sits in (decision 2). `sk-sidebar__link`
 * named a tenant: the list was never the sidebar's, it is a guest there. It is deliberately NOT
 * called a menu: `role="menu"` means an application menu with menuitem children, and this is a
 * list of links.
 */
export const navListParts = {
  root: "sk-nav-list",
  group: "sk-nav-list__group",
  groupLabel: "sk-nav-list__group-label",
  list: "sk-nav-list__list",
  item: "sk-nav-list__item",
  link: "sk-nav-list__link",
  label: "sk-nav-list__label",
  trailing: "sk-nav-list__trailing",
} as const;

export type NavListPart = keyof typeof navListParts;
export type NavListPartClass = (typeof navListParts)[NavListPart];

/*
 * The contract this pattern exists to demonstrate: eight parts, three signatures, and a template
 * that says how the first becomes the second.
 *
 * React writes `<NavList><NavListGroup><NavListLink>` — three elements. Authored markup writes
 * `<nav> <div group> <ul list> <li item> <a link>` — five. Before the templates below, the rule that
 * held the two together lived as a paragraph in a JSON file ("a NavListLink is always inside a
 * NavListGroup… skipping it produces `<nav><li>`, invalid markup"). It is now `parents`, plus a
 * template that puts the `<ul>` there whether or not the group is labelled.
 */
export const navListContract = {
  id: "nav-list",
  css: "@skryensya/core/patterns/nav-list.css",
  parts: navListParts,

  options: {
    orientation: {
      type: "enum",
      values: ["vertical", "horizontal"],
      default: "vertical",
      attr: "data-orientation",
    },
    href: {
      type: "string",
      attr: "href",
    },
    /** The current page. `aria-current="page"` is what the styling hooks follow, not a class. */
    current: {
      type: "boolean",
      default: false,
      attr: "aria-current",
      trueValue: "page",
    },
  },

  signatures: {
    NavList: {
      intent: ["navigation", "list-of-destinations", "sidebar-navigation", "navbar-navigation"],
      host: { element: "nav" },
      options: ["orientation"],
      slots: {
        children: { accepts: "signature", required: true, of: ["NavListGroup"] },
      },
      template: {
        element: "nav",
        part: "root",
        host: true,
        slot: "children",
      },
      react: { from: "@skryensya/react/nav-list", name: "NavList" },
    },

    NavListGroup: {
      intent: ["group-of-destinations", "labeled-navigation-section"],
      host: { element: "div" },
      options: [],
      parents: ["NavList"],
      slots: {
        label: { accepts: "node" },
        children: { accepts: "signature", required: true, of: ["NavListLink"] },
      },
      /*
       * The `<ul>` is the whole reason this signature exists: a `<li>` needs a list to sit inside,
       * and NavList itself only renders the landmark. An unlabelled group still supplies it — which
       * is why the label node is conditional and the list node is not.
       */
      template: {
        element: "div",
        part: "group",
        host: true,
        children: [
          {
            element: "div",
            part: "groupLabel",
            whenGiven: "label",
            slot: "label",
          },
          {
            element: "ul",
            part: "list",
            labelledBySlot: "label",
            slot: "children",
          },
        ],
      },
      react: { from: "@skryensya/react/nav-list", name: "NavListGroup" },
    },

    NavListLink: {
      intent: ["destination", "single-destination", "current-page"],
      host: { element: "a" },
      options: ["href", "current"],
      parents: ["NavListGroup"],
      requires: ["href"],
      slots: {
        /** Decorative: the label names the link, so the icon carries no label of its own. */
        icon: { accepts: "node" },
        children: { accepts: "text", required: true },
        /** Trailing metadata: a count, a badge. Pinned to the end, hidden when a host collapses. */
        trailing: { accepts: "node" },
      },
      template: {
        element: "li",
        part: "item",
        children: [
          {
            element: "a",
            part: "link",
            also: ["sk-interactive"],
            host: true,
            children: [
              { whenGiven: "icon", slot: "icon" },
              { element: "span", part: "label", slot: "children" },
              { element: "span", part: "trailing", whenGiven: "trailing", slot: "trailing" },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/nav-list", name: "NavListLink" },
    },
  },

  a11y: [
    {
      signatures: ["NavList"],
      when: { landmarkCount: "many" },
      requiresOneOf: ["aria-label", "aria-labelledby"],
      because:
        "A page with a second nav needs each landmark named; the platform's own rule, not this system's.",
    },
  ],
} as const satisfies ComponentContract;

export type NavListOrientation = OptionValue<typeof navListContract.options.orientation>;
export type NavListOptions = SignatureOptionsOf<typeof navListContract, "NavList">;
export type NavListLinkOptions = SignatureOptionsOf<typeof navListContract, "NavListLink">;
