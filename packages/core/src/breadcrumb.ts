import type { ComponentContract } from "./contract.js";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  /**
   * The page you are on. When true, this item is NEVER a link, even if `href` is also given: it
   * is the one label the trail exists to answer "where am I" (never truncated or muted the way an
   * ancestor crumb is, see breadcrumb.css), matching WAI-ARIA's Breadcrumb pattern, which allows
   * the current item to be plain text rather than a link.
   */
  current?: boolean;
};

export const breadcrumbParts = {
  root: "sk-breadcrumb",
  list: "sk-breadcrumb__list",
  item: "sk-breadcrumb__item",
  link: "sk-breadcrumb__link",
  current: "sk-breadcrumb__current",
  separator: "sk-breadcrumb__separator",
  /*
   * The "…" that stands in for the crumbs a narrow trail has no room for. Ancestor levels only,
   * never the first crumb (the trail's anchor) or the current one (the label it exists to show):
   * see `collapsibleBreadcrumbRange` below, the one place that range is computed. What it opens is
   * a real `Menu` (`core/menu.ts`), not a bespoke panel — there is no `collapsePanel` part here for
   * the same reason there is no second stylesheet for it: the trigger is this component's, the
   * dropdown is Menu's.
   */
  collapseTrigger: "sk-breadcrumb__collapse-trigger",
} as const;

/**
 * Which item indices a narrow trail may hide behind the "…" disclosure: everything except the
 * first crumb (where the trail starts) and the last one (the page you are on, the one label the
 * trail exists to show in full). Both bindings collapse the SAME range so neither invents its own
 * notion of "middle" — the vanilla enhancer re-derives it from the rendered `<li>` count instead of
 * importing this directly (it works off compiled markup, not the item array), but the rule is this.
 */
export function collapsibleBreadcrumbRange(
  itemCount: number,
): { start: number; end: number } | null {
  // Fewer than 4 items means at most one crumb sits between first and last — collapsing it would
  // save no space worth a disclosure, so there is nothing to hide.
  if (itemCount < 4) return null;
  return { start: 1, end: itemCount - 2 };
}

/*
 * The trail back up. A collection, because every crumb is the same shape and the LAST one is special:
 * it is where you are, so it is not a link and it carries `aria-current="page"`.
 *
 * The separator is `aria-hidden`: it is punctuation between the crumbs, and a screen reader reading
 * "slash" four times has learned nothing about the hierarchy.
 */
export const breadcrumbContract = {
  id: "breadcrumb",
  css: "@skryensya/core/components/breadcrumb.css",
  parts: breadcrumbParts,

  options: {
    /** Names the landmark. A page with a second nav needs each one told apart. */
    label: { type: "string", default: "Migas de pan", attr: "aria-label" },
    /**
     * What the "…" disclosure trigger is called, for the trail whose enhancer collapses ancestor
     * levels to fit. Unused (never rendered) on a trail short enough that nothing ever collapses.
     */
    collapsedLabel: {
      type: "string",
      default: "Mostrar niveles ocultos",
      attr: "data-collapsed-label",
    },
  },

  signatures: {
    Breadcrumb: {
      intent: ["where-am-i", "path-back-up", "hierarchy-trail"],
      host: { element: "nav" },
      options: ["label", "collapsedLabel"],
      slots: {
        /*
         * What sits between the crumbs, as CONTENT rather than as a string option.
         *
         * It was a string, and a chevron between the crumbs (which the stylesheet has a rule for,
         * `.sk-breadcrumb__separator .sk-icon`) was the one separator no tree could say. Text is
         * still a separator (`·`, `›`), so the slot takes either; what it does not take is arbitrary
         * markup, because punctuation with a heading in it is not punctuation.
         *
         * Absent, the `/` comes from the template (`whenMissing` below), which is where a default
         * that is markup has to live. React spells the same default as its `separator` prop's.
         */
        separator: { accepts: "node", of: ["Icon"] },
        items: {
          accepts: "items",
          required: true,
          item: {
            options: {
              href: { type: "string", attr: "href" },

              /** The page you are on. Not a link, and announced as the current one. */
              current: { type: "boolean", default: false, attr: "aria-current", trueValue: "page" },
            },
            slots: { label: { accepts: "text", required: true } },
          },
        },
      },
      template: {
        element: "nav",
        part: "root",
        host: true,
        /*
         * The enhancer's attachment point (`registry.ts`'s `[data-sk-breadcrumb]`). Present on every
         * trail, not only a long one — the enhancer itself is what decides, per resize, whether
         * there is anything to collapse; a short trail just never grows the disclosure.
         */
        attrs: { "data-sk-breadcrumb": "" },
        children: [
          {
            element: "ol",
            part: "list",
            /* `list-style: none` (breadcrumb.css) drops the implicit list role in Safari/VoiceOver. */
            attrs: { role: "list" },
            children: [
              {
                element: "li",
                part: "item",
                repeat: "items",
                children: [
                  {
                    element: "a",
                    part: "link",
                    whenItemGiven: "href",
                    whenItemMissing: "current",
                    itemOptions: ["href"],
                    attrsFromItemSlot: { title: "label" },
                    itemSlot: "label",
                  },
                  {
                    element: "span",
                    part: "current",
                    whenItemMissing: "href",
                    itemOptions: ["current"],
                    itemSlot: "label",
                  },
                  /*
                   * The current page keeps its `href` as authored data, but it is never rendered as
                   * a link: it is the one label the trail exists to answer "where am I", never
                   * truncated or muted like an ancestor crumb (see breadcrumb.css), and WAI-ARIA's
                   * Breadcrumb pattern explicitly allows the current item to be plain text — only a
                   * LINK to the current page needs `aria-current="page"`, non-links get it for free
                   * either way. Same `part` as the href-less span above; together the two cover
                   * "not a link" whether or not the author happened to also give it a destination.
                   */
                  {
                    element: "span",
                    part: "current",
                    whenItemAllGiven: ["href", "current"],
                    itemOptions: ["current"],
                    itemSlot: "label",
                  },
                  // Two nodes, one condition each: the separator the author slotted, or the one the
                  // system owns when they slotted none.
                  {
                    element: "span",
                    part: "separator",
                    whenNotLast: true,
                    whenGiven: "separator",
                    attrs: { "aria-hidden": "true" },
                    slot: "separator",
                  },
                  {
                    element: "span",
                    part: "separator",
                    whenNotLast: true,
                    whenMissing: "separator",
                    attrs: { "aria-hidden": "true" },
                    text: "/",
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/breadcrumb", name: "Breadcrumb" },
    },
  },
} as const satisfies ComponentContract;
