import type { ComponentContract } from "./contract.js";

export type BreadcrumbItem = {
  label: string;
  href?: string;
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
 * The trail back up. A collection, because every crumb is the same shape and the LAST one is special
 * — it is where you are, so it is not a link and it carries `aria-current="page"`.
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
    /** What sits between the crumbs. Punctuation, so it is `aria-hidden` wherever it lands. */
    separator: { type: "string", default: "/", attr: "data-separator", machineInput: true },
  },

  signatures: {
    Breadcrumb: {
      intent: ["where-am-i", "path-back-up", "hierarchy-trail"],
      host: { element: "nav" },
      options: ["label", "separator"],
      slots: {
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
                  {
                    element: "span",
                    part: "separator",
                    whenNotLast: true,
                    attrs: { "aria-hidden": "true" },
                    textFromOption: "separator",
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
