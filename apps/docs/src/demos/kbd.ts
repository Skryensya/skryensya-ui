import type { UsageTree } from "@skryensya/core/usage-tree";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import type { Translate } from "../i18n";

/*
 * Four keys. A constant, not a factory: there is nothing here to translate; a glyph and the words
 * printed on a physical keyboard are the same in both languages, so a `t` argument would only be a
 * parameter nobody uses.
 */
export const kbdTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    { contract: "kbd", signature: "Kbd", children: "⌘" },
    { contract: "kbd", signature: "Kbd", children: "K" },
    { contract: "kbd", signature: "Kbd", children: "Esc" },
    { contract: "kbd", signature: "Kbd", children: "↵" },
  ],
};

export const kbdAccentTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    { contract: "kbd", signature: "Kbd", options: { tone: "accent" }, children: "⌘" },
    { contract: "kbd", signature: "Kbd", options: { tone: "accent" }, children: "K" },
    { contract: "kbd", signature: "Kbd", options: { tone: "accent" }, children: "Esc" },
    { contract: "kbd", signature: "Kbd", options: { tone: "accent" }, children: "↵" },
  ],
};

/*
 * One part, and a combination is several of it side by side: `⌘` and `K` are two `<kbd>`, not one
 * with a plus sign in it. Ringing every key rather than the row says that.
 */
export const kbdAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("kbdPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "layout",
      signature: "Inline",
      options: { gap: "xs" },
      children: [
        { contract: "kbd", signature: "Kbd", children: "⌘" },
        { contract: "kbd", signature: "Kbd", children: "K" },
      ],
    },
    items: [
      namePart(".sk-kbd", "block-start", { match: "all", ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});
