import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * Tile's own demos. Peer pages (Link, Button, Checkbox, …) keep the trees that teach their
 * semantic contract; this file owns the ones that teach Tile as a pattern: shared title/description
 * anatomy, ExpandableTile as itself, and thin wrappers so TilePage can localize copy that the peer
 * demos leave in English.
 */

export { tileCheckboxTree } from "./checkbox";
export { tileSwitchTree } from "./switch";
export { tileRadioGroupTree } from "./radio-group";

const tileContent = (title: string, description: string): UsageTree => ({
  contract: "tile",
  signature: "TileContent",
  slots: { title, description },
});

/** Navigate: the whole face is an `<a href>`. */
export const tileLinkDemoTree = (t: Translate, href: string): UsageTree => ({
  contract: "tile",
  signature: "TileLink",
  options: { href },
  children: tileContent(t("demo.tile.link.title"), t("demo.tile.link.description")),
});

/** Act: the whole face is a `<button type="button">`. */
export const tileButtonDemoTree = (t: Translate): UsageTree => ({
  contract: "tile",
  signature: "TileButton",
  children: tileContent(t("demo.tile.button.title"), t("demo.tile.button.description")),
});

/*
 * ONE ExpandableTile, open by default so `sk-tile__expandable-content` exists on screen. Accordion
 * coordinates several of these; this demo is the leaf itself. TileContent + TileChevron inside the
 * trigger is the same composition Accordion.Trigger uses.
 */
export const expandableTileTree = (t: Translate): UsageTree => ({
  contract: "tile",
  signature: "ExpandableTile",
  options: { defaultOpen: true },
  children: [
    {
      contract: "tile",
      signature: "ExpandableTileTrigger",
      children: [
        tileContent(t("demo.tile.expandable.title"), t("demo.tile.expandable.description")),
        { contract: "tile", signature: "TileChevron" },
      ],
    },
    {
      contract: "tile",
      signature: "ExpandableTileContent",
      children: t("demo.tile.expandable.body"),
    },
  ],
});

/*
 * ExpandableTile open: trigger, content cluster, chevron and panel. Title and description go
 * outside (offset) so the ring does not strike through the glyphs; the panel and chevron keep inset.
 */
export const tileAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("tilePage.anatomyLabel"), inert: true },
  slots: {
    subject: expandableTileTree(t),
    items: [
      namePart(".sk-tile", "block-start"),
      namePart(".sk-tile__trigger", "inline-start"),
      namePart(".sk-tile__content", "inline-start", { ringPlacement: "offset", ringDistance: 6 }),
      namePart(".sk-tile__title", "inline-end", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-tile__description", "inline-end", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-tile__chevron", "inline-end"),
      namePart(".sk-tile__expandable-content", "block-end"),
    ],
  },
});
