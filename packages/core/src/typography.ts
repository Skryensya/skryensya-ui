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
