import type { ComponentContract } from "./contract.js";

export type TextTone = "primary" | "secondary" | "tertiary" | "danger";
export type TextSize = "caption" | "sm" | "body" | "lg";
export type TextWeight = "body" | "emphasis" | "label";
/**
 * Visual size for Heading. Document rungs mirror h1–h6; h5/h6 share the h4 floor.
 * `sm` / `md` / `lg` / `display` remain as aliases of h3 / h2 / h1 / display-sm.
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
export type LinkTone = "primary";
/* A text link is always underlined, the only WCAG 1.4.1-safe treatment, so there is no underline
 * option to choose. Default paint matches surrounding prose; `primary` is the brand-colored call-out.
 * Standalone links that don't need an underline aren't `sk-link` (see typography.css). */

export const typographyParts = {
  text: "sk-text",
  heading: "sk-heading",
  link: "sk-link",
} as const;

export type TypographyPart = keyof typeof typographyParts;
export type TypographyPartClass = (typeof typographyParts)[TypographyPart];

/*
 * Text, headings and links: three signatures, one family, because they are the same decision made
 * three ways — what this piece of writing IS.
 *
 * A heading's `as` and its `size` are deliberately separate: the level is document structure and the
 * size is appearance, and tying them would force an h3 to look like an h3 on a page where it should
 * not. The link is always underlined; that is not configurable, because an underline is how a link is
 * recognised without colour.
 */
export const typographyContract = {
  id: "typography",
  css: "@skryensya/core/components/typography.css",
  parts: typographyParts,

  options: {
    tone: {
      type: "enum",
      values: ["primary", "secondary", "tertiary", "danger"],
      default: "primary",
      attr: "data-tone",
    },
    size: { type: "enum", values: ["caption", "sm", "body", "lg"], default: "body", attr: "data-size" },
    weight: { type: "enum", values: ["body", "emphasis", "label"], default: "body", attr: "data-weight" },
    headingSize: {
      type: "enum",
      values: ["display-lg", "display-md", "display-sm", "h1", "h2", "h3", "h4", "h5", "h6", "sm", "md", "lg", "display"],
      default: "h2",
      attr: "data-size",
      prop: "size",
    },
    /** No block-start margin. For a heading that opens a box, where the box already spaces it. */
    flush: { type: "boolean", default: false, attr: "data-flush", trueValue: "" },
    href: { type: "string", attr: "href" },
    /**
     * Link's accent. Spelled `linkTone` here because Text already owns `tone` over a wider enum;
     * the binding still calls it `tone` / `data-tone`. Only `primary` — a link is either the
     * surrounding text colour or the action colour, never a status colour.
     */
    linkTone: {
      type: "enum",
      values: ["primary"],
      attr: "data-tone",
      prop: "tone",
    },
  },

  signatures: {
    Text: {
      intent: ["paragraph", "body-copy", "caption", "secondary-text"],
      host: { element: "p" },
      options: ["tone", "size", "weight"],
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
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "output", host: true, slot: "children" },
      react: { from: "@skryensya/react/typography", name: "Output" },
    },

    Heading: {
      intent: ["section-title", "page-title", "heading"],
      host: { element: "h2" },
      options: ["headingSize", "flush"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "h2", part: "heading", host: true, slot: "children" },
      react: { from: "@skryensya/react/typography", name: "Heading" },
    },

    Link: {
      intent: ["inline-link", "link-in-a-sentence"],
      host: { element: "a" },
      options: ["href", "linkTone"],
      requires: ["href"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "a", part: "link", also: ["sk-interactive"], host: true, slot: "children" },
      react: { from: "@skryensya/react/typography", name: "Link" },
    },
  },
} as const satisfies ComponentContract;
