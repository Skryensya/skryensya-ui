import { canonicalPath } from "../i18n";
import type { IconSize } from "@skryensya/core/icon";
import { iconDataMarkup, iconMarkup } from "../icons";
import { componentIcons } from "./generated/component-icons";

/**
 * The glyph for a component page, from a localized href, or `null` for a page that is not a
 * component (a guide, a foundation). A string entry is a stable role and follows the site's set;
 * geometry is Lucide's, generated (see `scripts/generate-component-icons.ts`).
 */
export function findComponentIconMarkup(
  href: string,
  options: { size?: IconSize; className?: string } = {},
): string | null {
  const canonical = canonicalPath(href);
  const icon = componentIcons[canonical];
  if (!icon) return null;
  return typeof icon === "string"
    ? iconMarkup(icon, options)
    : iconDataMarkup(`component-${canonical.split("/").pop()}`, icon, options);
}

/**
 * The same, for a row that MUST have one: the catalogue. A component with no entry is a build error,
 * like a missing description, so a new component cannot land in the catalogue without a glyph.
 */
export function componentIconMarkup(href: string): string {
  const markup = findComponentIconMarkup(href);
  if (!markup) {
    throw new Error(`Missing component catalog icon for ${canonicalPath(href)}: add it to scripts/generate-component-icons.ts`);
  }
  return markup;
}
