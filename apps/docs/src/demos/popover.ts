import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * A profile card behind a trigger, from the contract published for it.
 *
 * The authored version this replaces carried two inline anchor names —
 * `style="--sk-anchored-name: --profile-anchor"` on the trigger and on the panel — because until
 * recently nothing else could name an anchor without JS. The stylesheet scopes one static name now,
 * so the composition says nothing about anchoring at all, which is the point: where a panel opens is
 * the component's business, not the page's.
 */
export const popoverTree = (t: Translate): UsageTree => ({
  contract: "popover",
  signature: "Popover",
  options: { panelId: "profile-popover", arrow: true, closeLabel: t("demo.popover.close") },
  slots: {
    trigger: t("demo.popover.trigger"),
    title: "Ada Lovelace",
    description: t("demo.popover.description"),
    children: t("demo.popover.body"),
  },
});
