/*
 * THE TOOL'S ICON SET, and there is exactly one.
 *
 * Binding a set is a consumer decision the kit refuses to make for anyone (decision 15), so each app
 * makes it once, in a file of its own. This app has three places icons come out, and until now they
 * did not all read this file: the chrome below the `<head>` (through `mountIcons`), the React island
 * that draws the rail, and the sandbox's own Vanilla documents (`src/sandbox/entry.ts`). The middle
 * one is drawn INSIDE the island, where an app's choice does not reach on its own, so it used to
 * fall through to whatever `@skryensya/react`'s `Icon` defaulted to, and the chrome was set to match
 * that default rather than the other way round. The set was picked by the package, not by the app.
 *
 * Both halves of that are fixed now. The package's default is Lucide, which is what the
 * documentation beside this tool has always drawn, and the island is wrapped in an
 * `IconSetProvider` bound to THIS constant (`Playground.tsx`), so the choice below is the app's and
 * reaches all three places whatever the package's default happens to be.
 */
import { lucideIcons } from "@skryensya/icons-lucide";

/** Written on `<html data-icon-set>`, so CSS and anything reading the document name the same set. */
export const toolIconSet = "lucide";
export const toolIcons = lucideIcons;

/*
 * THE GLYPHS THE STABLE VOCABULARY DOES NOT HAVE, drawn as project geometry.
 *
 * `Icon`'s `data` prop is the documented path for exactly this (`core/src/icon.ts`: `name` is a
 * system role that survives a change of set, `data` is the consumer's own geometry, coupled on
 * purpose). "The code and the preview, side by side", "one above the other" and "restart this
 * preview" are this tool's own actions, not roles the kit should invent names for and then owe in
 * every icon set it publishes.
 *
 * DRAWN AS LUCIDE DRAWS, which is what makes them sit beside the rest of this tool's chrome rather
 * than beside it: the 24 grid, `fill: none`, a 2px `currentColor` stroke, round caps and joins. The
 * geometry below is Lucide's own (`columns-2`, `rows-2`, `rotate-ccw`, ISC), carried here instead of
 * imported because these three are not stable roles and the set exports only the vocabulary.
 */
const LUCIDE_ATTRS = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

/** Two panes side by side: what the button offers when the panes are stacked. */
export const splitVerticalIcon = {
  viewBox: "0 0 24 24",
  attrs: LUCIDE_ATTRS,
  body: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>',
} as const;

/** One pane above the other: what it offers when they are side by side. */
export const splitHorizontalIcon = {
  viewBox: "0 0 24 24",
  attrs: LUCIDE_ATTRS,
  body: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 12h18"/>',
} as const;

/*
 * RELOAD, as one circular arrow rather than the vocabulary's two.
 *
 * The stable name `refresh` is a CYCLE in every set this kit binds (Lucide's own `refresh-cw`: two
 * arrows chasing each other), which is the right glyph for "sync" or "swap" and reads as one of
 * those next to a preview. What this control does is restart one thing, and the single circular
 * arrow is what every browser's own reload button has meant for twenty years.
 *
 * COUNTER-CLOCKWISE (`rotate-ccw`), because an arrow that sweeps back the way it came reads as
 * "again, from the start", which is what this button does to the preview.
 */
export const reloadIcon = {
  viewBox: "0 0 24 24",
  attrs: LUCIDE_ATTRS,
  body:
    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
} as const;
