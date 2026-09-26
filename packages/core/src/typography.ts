import type { ComponentContract } from "./contract.js";

export type TextTone = "primary" | "secondary" | "tertiary" | "danger";
export type TextSize = "caption" | "sm" | "body" | "lg";
export type TextWeight = "body" | "emphasis" | "label";
export type TextRole = "eyebrow" | "subtitle";
/**
 * Visual size for Heading. Document rungs mirror h1–h6; h5/h6 share the h4 floor.
 * `sm` / `md` / `lg` / `display` remain as aliases of h3 / h2 / h1 / display-sm. They are kept for
 * existing markup only: new compositions use the rungs, which say the same thing without the
 * inversion (`sm` is an h3, not the smallest heading).
 */
export type HeadingSize =
  | "display-lg"
  | "display-md"
  | "display-sm"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "sm"
  | "md"
  | "lg"
  | "display";
export type LinkTone = "accent";
/* A text link is always underlined, the only WCAG 1.4.1-safe treatment, so there is no underline
 * option to choose. Default paint matches surrounding prose; `accent` is the brand-colored call-out.
 * Standalone links that don't need an underline aren't `sk-link` (see typography.css). */

export const typographyParts = {
  text: "sk-text",
  code: "sk-code",
  heading: "sk-heading",
  link: "sk-link",
} as const;

export type TypographyPart = keyof typeof typographyParts;
export type TypographyPartClass = (typeof typographyParts)[TypographyPart];

/*
 * Text, headings and links: three signatures, one family, because they are the same decision made
 * three ways: what this piece of writing IS.
 *
 * A heading's `as` and its `size` are deliberately separate: the level is document structure and the
 * size is appearance, and tying them would force an h3 to look like an h3 on a page where it should
 * not. The link is always underlined; that is not configurable, because an underline is how a link is
 * recognised without colour.
 */
export const typographyContract = {
  id: "typography",
  category: "content",
  css: "@skryensya/core/components/typography.css",
  parts: typographyParts,
  hooks: [
    "--sk-heading-fg",
    "--sk-heading-font-size",
    "--sk-heading-font-weight",
    "--sk-heading-line-height",
    "--sk-link-fg",
    "--sk-text-fg",
    "--sk-text-font-size",
    "--sk-text-font-weight",
    "--sk-text-line-height",
  ],

  options: {
    tone: {
      type: "enum",
      values: ["primary", "secondary", "tertiary", "danger"],
      default: "primary",
      attr: "data-tone",
    },
    size: { type: "enum", values: ["caption", "sm", "body", "lg"], default: "body", attr: "data-size" },
    weight: { type: "enum", values: ["body", "emphasis", "label"], default: "body", attr: "data-weight" },
    /*
     * A preset for a recurring job in a title block: `eyebrow` is the kicker above a heading,
     * `subtitle` the deck under it. The stylesheet had both for a long time and the contract did
     * not, so a tree could only reach them through a raw `data-role` attribute nothing validated.
     * A role sets size, weight and tone together and wins over those three, so combining them is
     * spelling a decision twice. Not `role`: that name is ARIA's.
     */
    textRole: { type: "enum", values: ["eyebrow", "subtitle"], attr: "data-role" },
    headingSize: {
      type: "enum",
      values: ["display-lg", "display-md", "display-sm", "h1", "h2", "h3", "h4", "h5", "h6", "sm", "md", "lg", "display"],
      deprecatedValues: { sm: "h3", md: "h2", lg: "h1", display: "display-sm" },
      default: "h2",
      attr: "data-size",
      prop: "size",
    },
    /*
     * The heading's LEVEL, as its element. Separate from `headingSize` on purpose: the level is the
     * document's outline and the size is appearance, so an h3 can look like an h2 without lying to
     * a screen reader's heading list.
     */
    headingElement: {
      type: "enum",
      values: ["h1", "h2", "h3", "h4", "h5", "h6"],
      default: "h2",
      element: true,
      prop: "as",
    },
    /** Text's element: `span` inside a line (a label, a button, another Text), `div` for a block with blocks in it. */
    textElement: { type: "enum", values: ["p", "div", "span"], default: "p", element: true, prop: "as" },
    /** No block-start margin. For a heading that opens a box, where the box already spaces it. */
    flush: { type: "boolean", default: false, attr: "data-flush", trueValue: "" },
    href: { type: "string", attr: "href" },
    /** Space-separated ids of the inputs an Output's result is calculated from. `htmlFor` in React. */
    outputFor: { type: "string", attr: "for", prop: "htmlFor" },
    /**
     * Link's accent. Spelled `linkTone` here because Text already owns `tone` over a wider enum;
     * the binding still calls it `tone` / `data-tone`. Only `accent`; a link is either the
     * surrounding text colour or the action colour, never a status colour.
     */
    linkTone: {
      type: "enum",
      values: ["accent"],
      attr: "data-tone",
      prop: "tone",
    },
  },

  signatures: {
    Text: {
      intent: ["paragraph", "body-copy", "caption", "secondary-text"],
      host: { element: "p" },
      options: ["tone", "size", "weight", "textRole", "textElement"],
      excludes: { textRole: ["size", "tone", "weight"] },
      slots: { children: { accepts: "node", required: true } },
      template: { element: "p", part: "text", host: true, slot: "children" },
      react: { from: "@skryensya/react/typography", name: "Text" },
    },

    Strong: {
      intent: ["strong-importance", "emphasis-inside-text"],
      host: { element: "strong" },
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "strong", host: true, slot: "children" },
      react: { from: "@skryensya/react/typography", name: "Strong" },
    },

    Output: {
      intent: ["calculated-result", "inline-live-result"],
      host: { element: "output" },
      options: ["outputFor"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "output", host: true, slot: "children" },
      react: { from: "@skryensya/react/typography", name: "Output" },
    },

    /*
     * INLINE CODE: a literal in the middle of a sentence; a path, a flag, a property name.
     *
     * It did not exist until now, and the absence was only visible from a tree: the accordion demo's
     * prose wraps `/status` in a `<code>` that no signature could emit, so converting that page
     * had to drop the monospace. `Strong` was the nearest thing available and it is the wrong
     * claim; a path is not emphasis.
     *
     * A BLOCK of code is a different component (`code-preview`), with its own scrolling, copy
     * control and language label. This is the one that lives inside a paragraph.
     */
    Code: {
      intent: ["inline-code", "a-path-in-a-sentence", "a-flag-or-property-name"],
      host: { element: "code" },
      options: [],
      slots: { children: { accepts: "text", required: true } },
      template: { element: "code", part: "code", host: true, slot: "children" },
      react: { from: "@skryensya/react/typography", name: "Code" },
    },

    Heading: {
      intent: ["section-title", "page-title", "heading", "headline"],
      host: { element: "h2" },
      options: ["headingSize", "headingElement", "flush"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "h2", part: "heading", host: true, slot: "children" },
      react: { from: "@skryensya/react/typography", name: "Heading" },
    },

    Link: {
      intent: ["inline-link", "link-in-a-sentence"],
      host: { element: "a" },
      options: ["href", "linkTone"],
      requires: ["href"],
      /** Link host attrs beyond href/tone (Button.navigation peer). */
      forward: ["id", "target", "rel", "download", "aria-*"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "a", part: "link", also: ["sk-interactive"], host: true, slot: "children" },
      react: { from: "@skryensya/react/typography", name: "Link" },
    },
  },
} as const satisfies ComponentContract;
