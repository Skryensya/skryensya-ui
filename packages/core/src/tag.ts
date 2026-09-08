import type { ComponentContract } from "./contract.js";

/*
 * TAG, a keyword or facet. It may be inert/removable (`span`) or navigational (`a href`).
 *
 * Where Badge is a read-only status label, a Tag classifies content the user can act on: filters,
 * chips, applied facets. A link tag navigates to that facet or keyword. A removable tag dismisses an
 * applied facet. Those two jobs are deliberately separate: a link tag cannot be dismissible because
 * an anchor must not contain a nested remove button or hide two different actions in one target.
 *
 * `remove` is a MODIFIER, not a standalone control: it goes on a real small icon-only button
 * (`sk-button sk-interactive` + `data-size="sm" data-icon-only data-variant="ghost"`), and the tag
 * stylesheet only shrinks it to the chip. Tag ships no interaction of its own.
 */
export type TagTone = "neutral" | "accent" | "success" | "warning" | "danger";

export const tagParts = {
  root: "sk-tag",
  label: "sk-tag__label",
  remove: "sk-tag__remove",
} as const;

export type TagPart = keyof typeof tagParts;
export type TagPartClass = (typeof tagParts)[TagPart];

/*
 * A label the user can act on, and the reason it is not a Badge: a tag can be removed or navigate to
 * a facet. Navigation uses a link host; dismissal uses a separate Button. They never combine.
 */
export const tagContract = {
  id: "tag",
  css: "@skryensya/core/components/tag.css",
  parts: tagParts,

  options: {
    tone: {
      type: "enum",
      values: ["neutral", "accent", "success", "warning", "danger"],
      default: "neutral",
      attr: "data-tone",
    },
    /**
     * Whether the tag can be dismissed. Structure, not behaviour: the contract owns whether the
     * control EXISTS, and what happens when it is used stays the binding's (`onRemove`).
     */
    removable: { type: "boolean", default: false, attr: "data-removable", trueValue: "" },
    /** The remove control's accessible name. It is an icon-only button, so it has no other. */
    removeLabel: { type: "string", default: "Remove", attr: "aria-label" },
    /** Destination for a navigable tag. Present only on `Tag.link`; link tags cannot be removable. */
    href: { type: "string", attr: "href" },
  },

  signatures: {
    Tag: {
      intent: ["removable-label", "filter-chip", "applied-filter", "keyword"],
      host: { element: "span", when: { href: "absent" } },
      options: ["tone", "removable", "removeLabel"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "span",
        part: "root",
        host: true,
        children: [
          { element: "span", part: "label", slot: "children" },
          /*
           * A real Button, not a chip-shaped lookalike: the state layer, the focus ring and the hit
           * target come with it, and `close` is the system's icon for dismissing, never a literal ×.
           * System-owned structure, like a checkbox's indicators, so it lives in the template.
           */
          {
            element: "button",
            part: "remove",
            also: ["sk-button", "sk-interactive"],
            whenGiven: "removable",
            options: ["removeLabel"],
            attrs: {
              type: "button",
              "data-variant": "ghost",
              "data-tone": "neutral",
              "data-size": "sm",
              "data-icon-only": "",
              "data-sk-button": "",
            },
            children: [{ element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "md" } }],
          },
        ],
      },
      react: { from: "@skryensya/react/tag", name: "Tag" },
    },

    "Tag.link": {
      intent: ["tag-link", "navigable-keyword", "facet-link"],
      host: { element: "a", when: { href: "present" } },
      options: ["tone", "href"],
      requires: ["href"],
      forbids: ["removable", "removeLabel"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "a",
        part: "root",
        also: ["sk-interactive"],
        host: true,
        children: [{ element: "span", part: "label", slot: "children" }],
      },
      react: { from: "@skryensya/react/tag", name: "Tag" },
    },
  },
} as const satisfies ComponentContract;
