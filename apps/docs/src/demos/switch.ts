import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * TileSwitch stays authored: its title and description use tile parts that no published signature
 * emits, so a usage tree cannot preserve that demo's anatomy.
 */
export const switchTree = (t: Translate): UsageTree => ({
  contract: "switch",
  signature: "Switch",
  options: { name: "deploy-automatically" },
  children: t("demo.switch.deployAutomatically"),
});
