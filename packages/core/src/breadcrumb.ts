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
} as const;

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
  },

  signatures: {
    Breadcrumb: {
      intent: ["where-am-i", "path-back-up", "hierarchy-trail"],
      host: { element: "nav" },
      options: ["label"],
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
        children: [
          {
            element: "ol",
            part: "list",
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
