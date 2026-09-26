import type { UsageTree } from "@skryensya/core/usage-tree";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import type { Translate } from "../i18n";

/*
 * Role names and sizes are the same in every language, so these are constants: a `t` argument
 * would only be a parameter nobody uses.
 */

/** Five roles at large size: the vocabulary, not the drawings. */
export const iconTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  children: [
    { contract: "icon", signature: "Icon", options: { name: "search", size: "lg" } },
    { contract: "icon", signature: "Icon", options: { name: "settings", size: "lg" } },
    { contract: "icon", signature: "Icon", options: { name: "warning", size: "lg" } },
    { contract: "icon", signature: "Icon", options: { name: "check", size: "lg" } },
    { contract: "icon", signature: "Icon", options: { name: "close", size: "lg" } },
  ],
};

/** The three named sizes of one hook. */
export const iconSizeTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  children: [
    { contract: "icon", signature: "Icon", options: { name: "check", size: "sm" } },
    { contract: "icon", signature: "Icon", options: { name: "check" } },
    { contract: "icon", signature: "Icon", options: { name: "check", size: "lg" } },
  ],
};

/*
 * One part per glyph. What is authored is `<span data-sk-icon>`; what gets drawn here, and ringed, is
 * the `<svg class="sk-icon">` it becomes once the icon enhancer mounts.
 */
export const iconAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("iconPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "layout",
      signature: "Inline",
      options: { gap: "md" },
      children: [
        { contract: "icon", signature: "Icon", options: { name: "search", size: "lg" } },
        { contract: "icon", signature: "Icon", options: { name: "settings", size: "lg" } },
        { contract: "icon", signature: "Icon", options: { name: "check", size: "lg" } },
      ],
    },
    items: [
      namePart(".sk-icon", "block-start", { match: "all", ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});
