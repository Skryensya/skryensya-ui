import type { ComponentContract, OptionValue, SignatureOptionsOf } from "./contract.js";

/*
 * A PATTERN, by decision 8's rule: the navbar and the sidebar need this exact structure, a list of
 * destinations, each an icon, a label and optional trailing metadata, so shipping it once is the
 * point. That the two differ by orientation is a variant, not a second structure, which is why
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
 * React writes `<NavList><NavListGroup><NavListLink>`: three elements. Authored markup writes
 * `<nav> <div group> <ul list> <li item> <a link>`: five. Before the templates below, the rule that
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
    /**
     * Turns a group's static label into a disclosure button — the WAI-ARIA APG "Disclosure
     * (Navigation)" pattern: a button with `aria-expanded`/`aria-controls` toggling a nested list
     * of links, explicitly NOT `role="menu"` (same reasoning the file banner already states for
     * `NavList` itself — a menu implies keyboard behavior a navigation list does not owe).
     */
    collapsible: { type: "boolean", default: false, attr: "data-collapsible", trueValue: "", machineInput: true },
    /**
     * Starts expanded — hiding navigation by default is the wrong default, unlike `Accordion`'s.
     * Read once; after that the enhancer/binding owns it. Deliberately no `default` here (unlike
     * every other boolean option in this codebase): a default would make this option — and its
     * `data-default-open` attribute — emit on EVERY group, collapsible or not, since an option
     * with a default always has a resolved value to write. Both bindings already treat the
     * attribute's ABSENCE as "open", so nothing is lost by leaving it unauthored on the common,
     * non-collapsible case.
     */
    defaultOpen: { type: "boolean", attr: "data-default-open", trueValue: "", machineInput: true },
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
      intent: ["group-of-destinations", "labeled-navigation-section", "collapsible-navigation-section"],
      host: { element: "div" },
      options: ["collapsible", "defaultOpen"],
      parents: ["NavList"],
      slots: {
        label: { accepts: "node" },
        children: { accepts: "signature", required: true, of: ["NavListLink"] },
      },
      /*
       * The `<ul>` is the whole reason this signature exists: a `<li>` needs a list to sit inside,
       * and NavList itself only renders the landmark. An unlabelled, non-collapsible group still
       * supplies it, which is why both label nodes below are conditional and the list node is not.
       *
       * Two DIFFERENT label nodes, not one node with a conditional attribute: a static label is a
       * `<div>` (nothing to activate), a collapsible one is a `<button>` (something WAI requires be
       * a real control) — the element itself changes, which `attrsWhen` cannot say, only two
       * template nodes gated by `whenGiven`/`whenMissing` can (same technique `Breadcrumb`'s
       * link-vs-span split already uses for the same kind of either/or).
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
            whenMissing: "collapsible",
            slot: "label",
          },
          {
            element: "button",
            part: "groupLabel",
            also: ["sk-interactive"],
            whenGiven: "collapsible",
            attrs: { type: "button" },
            // The REAL `aria-expanded` (and `aria-controls`, which needs a generated id) is the
            // enhancer/binding's, same as `data-default-open` is only ever read once — this is
            // just the honest INITIAL render before either attaches, so a no-JS or pre-hydration
            // paint never asserts a state opposite the one the list is actually showing.
            // `notEquals: "false"` (not `equals: "true"`) so the OPEN default holds even when the
            // author never sets `defaultOpen` at all — it carries no `default` of its own (see the
            // option's comment), so "unauthored" and "explicitly true" must read the same way here.
            attrsWhen: [
              { option: "defaultOpen", notEquals: "false", attrs: { "aria-expanded": "true" } },
              { option: "defaultOpen", equals: "false", attrs: { "aria-expanded": "false" } },
            ],
            mount: "data-sk-nav-list-group-trigger",
            slot: "label",
          },
          // Two `<ul>` nodes, not one with a conditional attribute: `mount` and the `hidden`
          // toggle only mean anything for the collapsible case, and adding either to the ORIGINAL
          // static node — even harmlessly, even always-false — would change what a non-collapsible
          // group (the common case, unchanged since before this option existed) emits.
          {
            element: "ul",
            part: "list",
            /* `list-style: none` (patterns/nav-list.css) drops the implicit list role in Safari/
             * VoiceOver. */
            attrs: { role: "list" },
            labelledBySlot: "label",
            whenMissing: "collapsible",
            slot: "children",
          },
          {
            element: "ul",
            part: "list",
            whenGiven: "collapsible",
            mount: "data-sk-nav-list-group-list",
            attrs: { role: "list" },
            attrsWhen: [{ option: "defaultOpen", equals: "false", attrs: { hidden: "" } }],
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
