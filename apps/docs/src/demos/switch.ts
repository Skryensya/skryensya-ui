import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";


/** Input, control, thumb and label: the native switch's painted parts. */
export const switchAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("switchPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "switch",
      signature: "Switch",
      options: { name: "deploy-automatically-anatomy", checked: true },
      children: t("demo.switch.deployAutomatically"),
    },
    items: [
      namePart(".sk-switch", "block-start"),
      namePart(".sk-switch__input", "inline-start"),
      namePart(".sk-switch__control", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-switch__thumb", "inline-end"),
      namePart(".sk-switch__label", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/* Native and tile switches share the same immediate on/off semantics. */
export const switchTree = (t: Translate): UsageTree => ({
  contract: "switch",
  signature: "Switch",
  options: { name: "deploy-automatically" },
  children: t("demo.switch.deployAutomatically"),
});

export const tileSwitchTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { gap: "md", columns: "2", responsive: true },
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
