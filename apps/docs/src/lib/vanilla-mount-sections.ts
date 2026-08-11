/*
 * THE THREE SECTIONS `VanillaMount.astro` ADDS TO A PAGE, named once so two readers can agree.
 *
 * The installation block is the one part of a docs page the page itself does not write: `Base.astro`
 * appends it after `<slot />`, so it is not in the document HTML the build-time index reads
 * (`./document-index.ts` only sees the page's own body). The old browser-side scan never had this
 * problem, it walked the finished DOM, and the first audit of the build-time index found exactly
 * this and nothing else: 31 pages missing exactly these three entries.
 *
 * Rather than teach the index about the layout's own furniture, the component that OWNS these
 * headings declares them here, and both readers use this list: `VanillaMount.astro` to render them
 * (with these ids, so the links land), and `Base.astro` to index them.
 *
 * The ids are plain slugs of the labels, not deduped against the page's own. That is the deliberate
 * difference from the headings inside the document: these three are the same three sections on
 * every page that has them, so a stable, predictable anchor is worth more than a collision guard
 * for labels ("Vanilla: instalar y montar") no page heading is going to reproduce.
 */
import type { Translate } from "../i18n";
import { slugify, type DocHeading } from "./document-index";

/**
 * In reading order. `level` is presentational, the two rungs `toc.css` knows, and matches the
 * default `headingLevel="h2"` shape: an `h2` for the block, an `h3` for each of its two ways in.
 */
export function vanillaMountSections(t: Translate, name: string): DocHeading[] {
  return [
    { label: t("vanilla.title"), level: "h2" as const },
    { label: t("vanilla.autoTitle"), level: "h3" as const },
    { label: t("vanilla.onlyTitle", { name }), level: "h3" as const },
  ].map((section) => ({ ...section, id: slugify(section.label) }));
}
