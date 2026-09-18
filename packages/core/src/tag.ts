import type { ComponentContract } from "./contract.js";

/*
 * TAG, a keyword or facet. It may be inert/removable (`span`) or navigational (`a href`).
 *
 * Where Badge is a read-only status label, a Tag classifies content the user can act on: filters,
 * chips, applied facets, or a keyword chip in a list that is not itself a status. A link tag
 * navigates to that facet or keyword. A removable tag dismisses an applied facet. Those two jobs
 * are deliberately separate: a link tag cannot be dismissible because an anchor must not contain a
 * nested remove button or hide two different actions in one target.
 *
 * `remove` is a MODIFIER, not a standalone control: it goes on a real small icon-only button
 * (`sk-button sk-interactive` + `data-size="sm" data-icon-only data-variant="ghost"`), and the tag
 * stylesheet only shrinks it to the chip. The remove control is system-owned Button+Icon
 * (`compose` + `also`); Tag ships no enhancer: React maps `onRemove` to the
 * declared `remove` event; authored markup listens to the button's native `click` (or to
 * `sk:tagremove` when a binding dispatches it).
 */
export type TagTone = "neutral" | "accent" | "success" | "warning" | "danger";

export const tagParts = {
  root: "sk-tag",
  label: "sk-tag__label",
  remove: "sk-tag__remove",
} as const;

export type TagPart = keyof typeof tagParts;
export type TagPartClass = (typeof tagParts)[TagPart];

/** Dispatched on the host when the remove control is activated. React also exposes `onRemove`. */
export const tagEvents = {
  remove: "sk:tagremove",
} as const;

/*
 * A label the user can act on, and the reason it is not a Badge: a tag can be removed or navigate to
 * a facet. Navigation uses a link host; dismissal uses a separate Button. They never combine.
 * An inert keyword chip (no href, not removable) is still a Tag when it classifies content rather
 * than reporting system status, that is what `keyword` covers; counts and status roles are Badge.
 */
export const tagContract = {
  id: "tag",
  category: "content",
  css: "@skryensya/core/components/tag.css",
  parts: tagParts,
  hooks: [
    "--sk-tag-bg",
    "--sk-tag-border",
    "--sk-tag-fg",
    "--sk-tag-gap",
    "--sk-tag-height",
    "--sk-tag-remove-size",
  ],
  events: tagEvents,
  eventDetails: {
    remove: { detail: {}, reactProp: "onRemove", reactDetail: "void", source: "root", trigger: "remove" },
  },

  options: {
    tone: {
      type: "enum",
      values: ["neutral", "accent", "success", "warning", "danger"],
      default: "neutral",
      attr: "data-tone",
    },
    /**
     * Whether the remove control EXISTS. Structure only: the contract owns presence; activation is
     * the `remove` event (`onRemove` in React). Bindings must not infer this from a handler alone.
     */
    removable: { type: "boolean", default: false, attr: "data-removable", trueValue: "" },
    /** The remove control's accessible name. It is an icon-only button, so it has no other. */
    removeLabel: { type: "string", default: "Remove", attr: "aria-label" },
    /** Destination for a navigable tag. Present only on `Tag.link`; link tags cannot be removable. */
    href: { type: "string", attr: "href" },
  },

  a11y: [
    {
      when: { removable: true },
      requiresOneOf: ["removeLabel"],
      because:
        "The remove control is icon-only; each removable tag needs a distinct accessible name for the facet it clears.",
      signatures: ["Tag"],
    },
  ],

  signatures: {
    Tag: {
      intent: ["removable-label", "filter-chip", "applied-filter", "keyword"],
      host: { element: "span", when: { href: "absent" } },
      options: ["tone", "removable", "removeLabel"],
      /** Host id / a11y names; remove control chrome stays template realization, not forwarded attrs. */
      forward: ["id", "aria-*"],
      /*
       * Remove control is system-owned Button + close Icon (`also` paints the classes). Compose is
       * the machine-readable statement of that borrow (Dialog close same pattern).
       */
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      slots: { children: { accepts: "text", required: true } },
      template: {
        element: "span",
        part: "root",
        host: true,
        children: [
          { element: "span", part: "label", slot: "children" },
          /*
           * System-owned Button+Icon realization (not a public compose slot): state layer, focus ring
           * and hit target come from Button; `close` is the system's dismiss icon. Bindings may
           * render the real Button/Icon components; emitted markup writes these classes and attrs.
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
      /** Link host attrs the contract does not map (same channel as Button.navigation). */
      forward: ["id", "target", "rel", "download", "aria-*"],
      slots: { children: { accepts: "text", required: true } },
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
