import type { ComponentContract } from "./contract.js";

/*
 * TOC, "En esta página": the index of the document.
 *
 * Chrome of nothing but itself: a disclosure shell around a nested list of links to the headings
 * of whatever it sits beside. What made this NOT a component for a long time was that its markup
 * lived in the docs site and its behaviour lived beside it; one binding, no contract, exactly the
 * shape `contracts/NOT-PUBLISHED.md` names for `copy-button`/`dialog`/`command-palette` before they
 * got their missing half.
 *
 * `NavList` was the other candidate shape and does not fit: its `current` is written once, statically,
 * by whoever composes the tree (the page you are ON). Here `current` moves on its own while the reader
 * scrolls; a scroll-spy the composition cannot state up front, because it is not know at
 * compose time which heading is "current" once a human starts reading. That is machine behaviour, not
 * a value an author picks, which is exactly the line that already separates every contract that owns a
 * Zag machine from the CSS-only patterns beside it.
 *
 * A consumer's layout may opt into `data-sk-toc-rail`; only then does the shared stylesheet turn
 * this disclosure into an always-open rail at `wide`. Plain consumers keep the native disclosure at
 * every width, so the component never guesses that its host has a column to spare.
 */
export const tocParts = {
  root: "sk-toc",
  disclosure: "sk-toc__inner",
  summary: "sk-toc__summary",
  title: "sk-toc__title",
  chevron: "sk-toc__chevron",
  nav: "sk-toc__nav",
  list: "sk-toc__list",
  item: "sk-toc__item",
  link: "sk-toc__link",
  icon: "sk-toc__icon",
  label: "sk-toc__label",
} as const;

export type TocPart = keyof typeof tocParts;
export type TocPartClass = (typeof tocParts)[TocPart];

export const tocAttrs = {
  root: "data-sk-toc",
  disclosure: "data-sk-toc-disclosure",
} as const;

export type TocAttr = keyof typeof tocAttrs;
export type TocAttrName = (typeof tocAttrs)[TocAttr];

export const tocContract = {
  id: "toc",
  css: "@skryensya/core/components/toc.css",
  parts: tocParts,

  options: {
    /** The caption above the list, and the accessible name of the `<nav>` beside it. */
    title: { type: "string", attr: "aria-label" },
  },

  signatures: {
    Toc: {
      intent: ["table-of-contents", "in-page-navigation", "document-index"],
      host: { element: "aside" },
      mount: tocAttrs.root,
      options: ["title"],
      slots: {
        items: {
          accepts: "items",
          required: true,
          item: {
            options: {
              href: { type: "string", attr: "href" },
              /** Heading depth: styling hook only; the emitter draws no anatomy from it. */
              level: {
                type: "enum",
                values: ["h2", "h3"],
                default: "h2",
                attr: "data-level",
              },
              /** Written by the scroll-spy at runtime; an author may also seed the first one. */
              current: {
                type: "boolean",
                default: false,
                attr: "aria-current",
                trueValue: "true",
                machineInput: true,
              },
            },
            slots: {
              children: { accepts: "text", required: true },
              /** Decorative: the label already names the destination. */
              icon: { accepts: "node" },
            },
          },
        },
      },
      template: {
        element: "aside",
        part: "root",
        host: true,
        children: [
          {
            element: "details",
            part: "disclosure",
            mount: tocAttrs.disclosure,
            children: [
              {
                element: "summary",
                part: "summary",
                also: ["sk-interactive"],
                children: [
                  { element: "h2", part: "title", textFromOption: "title" },
                  {
                    element: "span",
                    part: "chevron",
                    attrs: { "aria-hidden": "true" },
                  },
                ],
              },
              {
                element: "nav",
                part: "nav",
                options: ["title"],
                children: [
                  {
                    element: "ul",
                    part: "list",
                    children: [
                      {
                        element: "li",
                        part: "item",
                        repeat: "items",
                        itemOptions: ["level"],
                        children: [
                          {
                            element: "a",
                            part: "link",
                            also: ["sk-interactive"],
                            itemOptions: ["href", "current"],
                            children: [
                              {
                                element: "span",
                                part: "icon",
                                whenItemSlotGiven: "icon",
                                itemSlot: "icon",
                              },
                              {
                                element: "span",
                                part: "label",
                                itemSlot: "children",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/toc", name: "Toc" },
    },
  },
} as const satisfies ComponentContract;
