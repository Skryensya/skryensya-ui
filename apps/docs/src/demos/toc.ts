import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { tocIconItems, tocItems, tocNestedItems } from "./data/toc";
import { namePart } from "./annotation-parts";

/* Plain, nested (h2/h3) and icon-bearing Toc compositions shared by both locales. The entries
 * themselves are data: see `data/toc.ts`. */

/*
 * Icon-bearing rows so every part the contract paints (icon included) is on screen to name. The
 * specimen is frozen; the live indexes start below.
 */
export const tocAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("tocPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "toc",
      signature: "Toc",
      options: { title: t("demo.toc.title") },
      slots: { items: tocIconItems(t) },
    },
    items: [
      namePart(".sk-toc", "block-start"),
      namePart(".sk-toc__nav", "inline-start"),
      namePart(".sk-toc__title", "inline-end"),
      namePart(".sk-toc__list", "inline-start", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-toc__item", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-toc__link", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-toc__icon", "inline-start"),
      namePart(".sk-toc__label", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

export const tocPlainTree = (t: Translate): UsageTree => ({
  contract: "toc",
  signature: "Toc",
  options: { title: t("demo.toc.title") },
  slots: { items: tocItems(t) },
});

export const tocNestedTree = (t: Translate): UsageTree => ({
  contract: "toc",
  signature: "Toc",
  options: { title: t("demo.toc.title") },
  slots: { items: tocNestedItems(t) },
});

export const tocIconsTree = (t: Translate): UsageTree => ({
  contract: "toc",
  signature: "Toc",
  options: { title: t("demo.toc.title") },
  slots: { items: tocIconItems(t) },
});
