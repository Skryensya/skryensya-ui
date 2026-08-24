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
    /**
     * Renders a STATIC label (`collapsible` absent) as a real `<h3>` instead of a plain `<div>` —
     * for a group sitting inside a large panel (`Megamenu`'s own columns being the motivating case)
     * where a screen reader's own heading-navigation is how a reader orients among several groups at
     * once, the same reason any other long region gets real headings rather than merely-bold text.
     * Absent by default: an ordinary sidebar/navbar `NavList` group is one of very few on the page
     * and does not need heading-navigation to be found. Has no effect on a COLLAPSIBLE group's label
     * — that one is already a real, focusable `<button>`, a stronger landmark than a heading would
     * add — nor without a `label`: a heading with nothing in it is worse than none, so pair the two.
     */
    heading: { type: "boolean", default: false, attr: "data-heading", trueValue: "" },
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
      options: ["collapsible", "defaultOpen", "heading"],
      /*
       * Three legal homes, not one: `NavList` for a top-level section, `NavListLink` for a
       * destination's own sub-destinations (its `nested` slot, below), and `MegamenuTrigger` for
       * one column of a mega-menu panel (`megamenu.ts`'s own `columns` slot, `of: ["NavListGroup",
       * "ImageFrame"]`) — the same group of links, just standing where a links column goes instead
       * of a sidebar section. The template stays IDENTICAL in all three — this signature does not
       * know which parent placed it — because what changes is only where the `<div>` lands
       * (`<nav><ul>`, inside a `<li>` beside the `<a>` it nests under, or inside a mega-menu's own
       * panel), never what it renders.
       */
      parents: ["NavList", "NavListLink", "MegamenuTrigger"],
      slots: {
        label: { accepts: "node" },
        children: { accepts: "signature", required: true, of: ["NavListLink"] },
      },
      /*
       * The `<ul>` is the whole reason this signature exists: a `<li>` needs a list to sit inside,
       * and NavList itself only renders the landmark. An unlabelled, non-collapsible group still
       * supplies it, which is why both label nodes below are conditional and the list node is not.
       *
       * THREE label nodes, not one node with a conditional attribute: a static label is a `<div>`
       * (nothing to activate) or a real `<h3>` (`heading`, for a group inside a large panel that
       * wants heading-navigation — see that option's own doc), a collapsible one is a `<button>`
       * (something WAI requires be a real control) — the element itself changes, which `attrsWhen`
       * cannot say, only template nodes gated by `whenGiven`/`whenMissing` can (same technique
       * `Breadcrumb`'s link-vs-span split already uses for the same kind of either/or). The two
       * static nodes are mutually exclusive by construction: `whenMissing` accepts a list meaning
       * NONE of them given, so the plain `<div>` only ever appears when `heading` was NOT requested.
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
            whenMissing: ["collapsible", "heading"],
            slot: "label",
          },
          {
            // Gated on `heading` alone, not also on `label`: the composition-level condition
            // fields (`whenGiven`/`whenMissing`) can express ANY-of within one field, never an AND
            // across two DIFFERENT options — see `heading`'s own doc for why pairing the two is left
            // to the author rather than enforced here.
            element: "h3",
            part: "groupLabel",
            whenGiven: "heading",
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
        /**
         * This destination's OWN sub-destinations, one level of nesting at a time — a
         * `NavListGroup` sitting inside the same `<li>`, after the link rather than the label
         * slot NavList's own groups fill. `<li>` accepts arbitrary flow content, so `<a>` followed
         * by a nested `<div class="group"><ul>…</ul></div>` is valid, unlike nesting a group
         * straight inside another group's `<ul>` (a `<div>` is not a legal `<ul>` child, only
         * `<li>` is — the reason this is a new slot on the LINK and not a widened `children` on
         * `NavListGroup` itself).
         */
        nested: { accepts: "signature", of: ["NavListGroup"] },
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
          { whenGiven: "nested", slot: "nested" },
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
