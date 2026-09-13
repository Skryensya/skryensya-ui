import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { stateAttrs, stateLabels } from "./data/state-layer";

/** The six states on a bare tile: the state layer with nothing else painting over it. */
export const stateLayerBareTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  attrs: { class: "sl-tiles" },
  children: stateLabels(t).map((item) => ({
    contract: "button",
    signature: "Button.action",
    attrs: stateAttrs("sl-tile", item),
    children: item.label,
  })),
});

/** The same six, on a tile that sets `currentColor`: the layer tints itself from the text colour. */
export const stateLayerCurrentColorTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  attrs: { class: "sl-tiles" },
  children: stateLabels(t).map((item) => ({
    contract: "button",
    signature: "Button.action",
    attrs: stateAttrs("sl-tile sl-current-tile", item),
    children: item.label,
  })),
});

/*
 * A small piece of real UI rather than a swatch row: a list where one row is selected, one is hovered
 * and one is disabled, all at once. That is the case the tiles above cannot show, because the point
 * is how the states read NEXT TO each other.
 */
export const stateLayerLabTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  attrs: { class: "sl-lab" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      attrs: { class: "sl-lab__caption" },
      children: t("demo.stateLayer.caption"),
    },
    {
      contract: "layout",
      signature: "Stack",
      attrs: { class: "sl-list" },
      children: [
        {
          contract: "button",
          signature: "Button.action",
          attrs: { class: "sl-item", "aria-selected": "true" },
          children: t("demo.stateLayer.inbox"),
        },
        {
          contract: "button",
          signature: "Button.action",
          attrs: { class: "sl-item", "data-peek": "hover" },
          children: t("demo.stateLayer.archive"),
        },
        {
          contract: "button",
          signature: "Button.action",
          attrs: { class: "sl-item", "aria-disabled": "true" },
          children: t("demo.stateLayer.drafts"),
        },
      ],
    },
    {
      contract: "layout",
      signature: "Inline",
      attrs: { class: "sl-actions" },
      children: [
        { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.button.save") },
        { contract: "button", signature: "Button.action", options: { variant: "solid" }, children: t("demo.button.cancel") },
      ],
    },
  ],
});
