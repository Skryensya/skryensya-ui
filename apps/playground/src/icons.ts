/*
 * THE TOOL'S ICON SET, and why it is Phosphor and not the docs' Lucide.
 *
 * Binding a set is a consumer decision the kit refuses to make for anyone (decision 15), so each app
 * makes it once, in a file of its own. This app has three places icons come out: the chrome below
 * the `<head>` (this set, through `mountIcons`), the React island that draws the rail
 * (`@skryensya/react`'s `Icon`, whose default is Phosphor), and the sandbox's own Vanilla documents
 * (`src/sandbox/entry.ts`, which exports Phosphor for the same reason).
 *
 * Two of those three were already Phosphor and cannot cheaply be anything else - the island's icons
 * are drawn inside the island, where this app's choice does not reach without an `IconSetProvider`
 * around it. So the chrome follows them instead of dragging in a second set to draw four glyphs
 * beside a rail already drawn in the first. One tool, one set.
 */
import { phosphorIcons } from "@skryensya/icons-phosphor";

/** Written on `<html data-icon-set>`, so CSS and anything reading the document name the same set. */
export const toolIconSet = "phosphor";
export const toolIcons = phosphorIcons;

/*
 * THE TWO GLYPHS THE STABLE VOCABULARY DOES NOT HAVE, drawn as project geometry.
 *
 * `Icon`'s `data` prop is the documented path for exactly this (`core/src/icon.ts`: `name` is a
 * system role that survives a change of set, `data` is the consumer's own geometry, coupled on
 * purpose). "The code and the preview, side by side" and "one above the other" are this tool's
 * arrangement and nobody else's, so they are not a role the kit should invent a name for and then
 * owe in three icon sets.
 *
 * Drawn in Phosphor's own 256 grid at its regular weight so they sit beside the set the rest of
 * this tool draws with (`toolIconSet`), and stroked rather than filled for the same reason.
 */
const SPLIT_ATTRS = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "16",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

/** Two panes side by side: what the button offers when the panes are stacked. */
export const splitVerticalIcon = {
  viewBox: "0 0 256 256",
  attrs: SPLIT_ATTRS,
  body: '<rect x="40" y="48" width="176" height="160" rx="8"/><line x1="128" y1="48" x2="128" y2="208"/>',
} as const;

/** One pane above the other: what it offers when they are side by side. */
export const splitHorizontalIcon = {
  viewBox: "0 0 256 256",
  attrs: SPLIT_ATTRS,
  body: '<rect x="40" y="48" width="176" height="160" rx="8"/><line x1="40" y1="128" x2="216" y2="128"/>',
} as const;

/*
 * RELOAD, as one circular arrow rather than the vocabulary's two.
 *
 * The stable name `refresh` is a CYCLE in every set this kit binds (Phosphor's own
 * `arrows-clockwise`: two arrows chasing each other), which is the right glyph for "sync" or "swap"
 * and reads as one of those next to a preview. What this control does is restart one thing, and the
 * single circular arrow is what every browser's own reload button has meant for twenty years.
 *
 * Phosphor's `arrow-clockwise` at regular weight (MIT, the same library `@skryensya/icons-phosphor`
 * vendors and this tool draws the rest of its chrome with), carried here as project geometry because
 * "restart this preview" is this tool's action and not a role the kit owes three icon sets.
 */
export const reloadIcon = {
  viewBox: "0 0 256 256",
  attrs: { fill: "currentColor" },
  body: '<path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"/>',
} as const;
