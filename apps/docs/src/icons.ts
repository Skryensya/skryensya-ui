/*
 * The site's icons.
 *
 * The site brings no geometry of its own: it binds a published set, which is the path it documents.
 * Lucide is the site's choice, not the system's: core names no tenants (decision 2), so there is no
 * "official" set, there are three published ones and you choose.
 *
 * Changing sets is changing the two lines below. No call site moves, and that is exactly what the
 * stable vocabulary buys.
 */
import { renderIconBox, type IconData, type IconSet, type IconSize, type StableIconName } from "@skryensya/core/icon";
import { lucideIcons } from "@skryensya/icons-lucide";
import { materialIcons } from "@skryensya/icons-material";
import { phosphorIcons } from "@skryensya/icons-phosphor";

/*
 * THE SET AND ITS ID ARE THE SAME FACT, and that is why they come from the same place.
 *
 * `siteIcons` is the geometry that `iconMarkup` serializes at build; `siteIconSet` is the id written
 * on `<html>` so CSS and preview frames can name the same set. Keeping both beside each other avoids
 * a runtime icon-swap module in the docs shell: the chrome ships already painted in the site set.
 */
export const siteIconSet = "lucide";
export const siteIcons = lucideIcons;

/** The three published sets, so the page shows them side by side instead of asserting they exist. */
export const allSets: readonly { id: string; label: string; licence: string; set: IconSet }[] = [
  { id: "lucide", label: "Lucide", licence: "ISC", set: lucideIcons },
  { id: "phosphor", label: "Phosphor", licence: "MIT", set: phosphorIcons },
  { id: "material", label: "Material Symbols", licence: "Apache-2.0", set: materialIcons },
];

/*
 * The site's serializer: the only string encoding of the markup contract, over `renderIconBox`.
 *
 * The system does NOT ship this (decision 15): a vanilla consumer writes the `<svg>` by hand, and what
 * the system documents is exactly this shape. Here it lives as a site helper, and the two public
 * entry points, stable role and own geometry, are one-line adapters over it, instead of two string
 * templates that could drift apart. The box (class, viewBox, size, a11y, precedence) is computed by
 * core; the site only serializes it to a string.
 */
function svgString(
  icon: IconData,
  dataIcon: string,
  { size, className, extraAttrs }: { size?: IconSize; className?: string; extraAttrs?: Readonly<Record<string, string>> } = {},
): string {
  const { presentation, box, body } = renderIconBox({ icon, dataIcon, size, className });
  const serialize = (pairs: [string, string][]) => pairs.map(([k, v]) => `${k}="${v}"`).join(" ");
  // presentation, then the consumer's extra attrs (between set and box, as in the other bindings),
  // and finally the box, which wins.
  const attrs = [
    serialize(presentation),
    ...(extraAttrs ? [serialize(Object.entries(extraAttrs) as [string, string][])] : []),
    serialize(box),
  ].filter(Boolean);

  return `<svg ${attrs.join(" ")}>${body}</svg>`;
}

/**
 * The markup contract for a stable role. An icon is decorative by default: in a trigger with text, the
 * text already names the action.
 */
export function iconMarkup(
  name: StableIconName,
  { className, size, set = siteIcons }: { className?: string; size?: IconSize; set?: IconSet } = {},
): string {
  return svgString(set[name], name, { size, className });
}

/**
 * Markup for own geometry, same shape as `iconMarkup`, but the name is not a stable role, so
 * the site's icon-set swap leaves it alone (`applyIconSet` skips unknown `data-icon` keys).
 */
export function iconDataMarkup(
  name: string,
  icon: IconData,
  {
    className,
    size,
    attrs: extraAttrs,
  }: { className?: string; size?: IconSize; attrs?: Readonly<Record<string, string>> } = {},
): string {
  return svgString(icon, name, { size, className, extraAttrs });
}

const strokeAttrs = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

/*
 * An icon OUTSIDE the set, the only thing that is opt-in. There is no SetIcon: this is geometry passed
 * as `data`, and the coupling to the project is visible at the call site, which is the point.
 */
export const sparkle: IconData = {
  viewBox: "0 0 24 24",
  attrs: { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linejoin": "round" },
  body: `<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />`,
};

/* Four corners opening out: "view fullscreen", not a device class. */
export const screenFullscreen: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />`,
};


/* Lucide Sun / Moon / Monitor lived here for the docs theme toggle; they are now the stable
 * roles mode-light / mode-dark / mode-system in the published sets. */

/* Contrast toggle glyphs, a two-state pair that cross-fades in place:
 * an empty ring for normal, and the same ring with its inner half filled for high, so the
 * fill visibly appears the moment contrast turns on. The filled half uses currentColor while the ring
 * stays stroked. */
export const contrastNormal: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<circle cx="12" cy="12" r="10" />`,
};

export const contrastHigh: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<circle cx="12" cy="12" r="10" /><path d="M12 6a6 6 0 0 1 0 12z" fill="currentColor" stroke="none" />`,
};

/* The header's language picker stopped being own geometry: `language` is now a stable role (see
 * `stableIconNames` in core), the three published sets draw it, and `LanguageMenu.astro` asks for it
 * with `iconMarkup("language")` like any other role. */

/* Playback transport for the /motion samples, another pair of two states that swap in the same slot.
 * They are not stable roles: play/pause is a player's vocabulary, not the system's, so it comes in as
 * the page's own geometry (decision 15) instead of forcing the three published sets to draw it. */
export const play: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<polygon points="6 3 20 12 6 21 6 3" />`,
};

export const pause: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />`,
};
