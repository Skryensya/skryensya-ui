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
