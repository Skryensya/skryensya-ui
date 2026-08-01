import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The bare surface — `Popover.bare`, which is what this page calls a popup.
 *
 * It is not a second component and this file is the proof: the same contract, one signature down,
 * with the title, the description and the close control left out. What goes inside is the
 * composition's business, which is the whole reason the surface has no semantics of its own.
 *
 * The authored version carried two inline anchor names. The stylesheet scopes one now, so nothing
 * here mentions anchoring.
 */
export const popupTree = (t: Translate): UsageTree => ({
  contract: "popover",
  signature: "Popover.bare",
  options: { panelId: "filters-popup", bare: true, arrow: true },
  slots: {
    trigger: t("demo.popup.trigger"),
    children: {
      contract: "selection",
      signature: "Checkbox",
      options: { name: "active" },
      slots: { label: t("demo.popup.onlyActive") },
    },
  },
});
