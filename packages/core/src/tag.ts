import type { ComponentContract } from "./contract.js";

/*
 * TAG, a keyword or facet, optionally removable.
 *
 * Where Badge is a read-only status label, a Tag classifies content the user can act on: filters,
 * chips, applied facets. When it carries a remove affordance the label and the remove button are
 * two separate targets, so the accessible name of the remove control names the tag it removes.
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
 * A label the user can act on, and the reason it is not a Badge: a tag can be removed, and the
 * control that removes it is a REAL Button — the state layer, the focus ring and the hit target come
 * with it, which a chip-shaped lookalike would have to reinvent and get wrong.
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
  },

  signatures: {
    Tag: {
      intent: ["removable-label", "filter-chip", "applied-filter", "keyword"],
      host: { element: "span" },
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
           * target come with it, and `close` is the system's icon for dismissing — never a literal ×.
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
  },
} as const satisfies ComponentContract;
