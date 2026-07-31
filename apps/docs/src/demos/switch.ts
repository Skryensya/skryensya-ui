import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Native and tile switches share the same immediate on/off semantics. */
export const switchTree = (t: Translate): UsageTree => ({
  contract: "switch",
  signature: "Switch",
  options: { name: "deploy-automatically" },
  children: t("demo.switch.deployAutomatically"),
});

export const tileSwitchTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", inlineAlign: "stretch", equal: true },
  children: [
    {
      contract: "tile",
      signature: "TileSwitch",
      options: { name: "auto-deploy", defaultChecked: true },
      children: {
        contract: "tile",
        signature: "TileContent",
        slots: {
          title: t("demo.switch.auto.title"),
          description: t("demo.switch.auto.body"),
        },
      },
    },
    {
      contract: "tile",
      signature: "TileSwitch",
      options: { name: "public-url" },
      children: {
        contract: "tile",
        signature: "TileContent",
        slots: {
          title: t("demo.switch.public.title"),
          description: t("demo.switch.public.body"),
        },
      },
    },
  ],
});
