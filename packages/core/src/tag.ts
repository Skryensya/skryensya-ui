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
