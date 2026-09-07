import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * ONE CHOICE MODEL, TWO CONTROLS: the native radio group and the tile one are the same decision
 * rendered at two sizes, and both lists live here so that stays true.
 */

/** Plan names are product nouns and stay written, so this list needs no locale. */
export const radioGroupItems: readonly ItemInput[] = [
  { options: { value: "basic" }, slots: { label: "Basic" } },
  { options: { value: "pro" }, slots: { label: "Professional" } },
  { options: { value: "enterprise" }, slots: { label: "Enterprise" } },
];

/** The same choice as tiles: each label is a whole TileContent rather than a word. */
export const tileRadioGroupItems = (t: Translate): readonly ItemInput[] => [
  {
    options: { value: "starter" },
    slots: {
      label: {
        contract: "tile",
        signature: "TileContent",
        slots: {
          title: t("demo.radioGroup.starter.title"),
          description: t("demo.radioGroup.starter.body"),
        },
      },
    },
  },
  {
    options: { value: "pro" },
    slots: {
      label: {
        contract: "tile",
        signature: "TileContent",
        slots: {
          title: t("demo.radioGroup.pro.title"),
          description: t("demo.radioGroup.pro.body"),
        },
      },
    },
  },
  {
    options: { value: "basic" },
    slots: {
      label: {
        contract: "tile",
        signature: "TileContent",
        slots: {
          title: t("demo.radioGroup.basic.title"),
          description: t("demo.radioGroup.basic.body"),
        },
      },
    },
  },
];
