import type { ComponentContract } from "./contract.js";

/*
 * TOC, "On this page": the index of the document.
 *
 * Chrome of nothing but itself: a disclosure shell around a nested list of links to the headings
 * of whatever it sits beside. What made this NOT a component for a long time was that its markup
 * lived in the docs site and its behaviour lived beside it; one binding, no contract, exactly the
 * shape `contracts/NOT-PUBLISHED.md` names for `dialog`/`command-palette` before they got their
 * missing half.
 *
 * `NavList` was the other candidate shape and does not fit: its `current` is written once, statically,
 * by whoever composes the tree (the page you are ON). Here `current` moves on its own while the reader
 * scrolls; a scroll-spy the composition cannot state up front, because it is not know at
 * compose time which heading is "current" once a human starts reading. That is machine behaviour, not
 * a value an author picks, which is exactly the line that already separates every contract that owns a
 * Zag machine from the CSS-only patterns beside it.
 *
 * ONE SHAPE, ALWAYS OPEN. This used to ship a native `<details>` closed by default, which a consumer
 * with a spare column turned into a rail by declaring `data-sk-toc-rail`. Two shapes out of one
 * contract, and the seam showed everywhere: the rail's entire appearance sat behind BOTH that
 * attribute and a `min-width: 72rem` query, so the component's own documentation could never render
 * the form the docs site itself runs on. A preview frame is 1022px wide and the gate is 1152px, so
 * the example was structurally incapable of showing it. The attribute was also never part of this
 * contract (not in `tocAttrs`, not an option, not in the template): a magic string re-typed in the
 * stylesheet, the enhancer and every consumer that wanted the rail.
 *
 * So the rail IS the component now. There is no disclosure, no `<summary>`, no chevron and nothing to
 * open: the list is always visible, and what stays behind `wide` is only what genuinely needs a spare
 * column: `position: sticky` and the fixed inline size (`toc.css`). A host with no room gets the same
 * compact index in normal flow, which is a layout answer rather than a second shape of this one.
 */
export const tocParts = {
  root: "sk-toc",
  title: "sk-toc__title",
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
              /*
               * Written by the scroll-spy at runtime; an author may also seed the first one.
               * `"location"`, not `"true"`: ARIA reserves that token for exactly this case: "an
               * item representing the current position within a reader's environment", which is
               * more precise than the generic true/false pair for a scroll-spy TOC.
               */
              current: {
                type: "boolean",
                default: false,
                attr: "aria-current",
                trueValue: "location",
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
            element: "nav",
            part: "nav",
            options: ["title"],
            children: [
              /* The visible caption, inside the `<nav>` it names rather than above it: with no
               * `<summary>` left to hold it there is no reason for it to sit outside the landmark
               * whose contents it describes. The `<nav>` still carries `title` as its `aria-label`
               * (`options` above), so the name reaches assistive tech whether or not this renders. */
              { element: "h2", part: "title", textFromOption: "title" },
              {
                element: "ul",
                part: "list",
                /* `list-style: none` (toc.css) drops the implicit list role in Safari/VoiceOver. */
                attrs: { role: "list" },
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
      react: { from: "@skryensya/react/toc", name: "Toc" },
    },
  },
} as const satisfies ComponentContract;
