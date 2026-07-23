/*
 * TAG, a keyword or facet, optionally removable.
 *
 * Where Badge is a read-only status label, a Tag classifies content the user can act on: filters,
 * chips, applied facets. When it carries a remove affordance the label and the remove button are
 * two separate targets, so the accessible name of the remove control names the tag it removes.
 */
export type TagTone = "neutral" | "accent" | "success" | "warning" | "danger";

export const tagParts = {
  root: "ds-tag",
  label: "ds-tag__label",
  remove: "ds-tag__remove",
} as const;

export type TagPart = keyof typeof tagParts;
export type TagPartClass = (typeof tagParts)[TagPart];
