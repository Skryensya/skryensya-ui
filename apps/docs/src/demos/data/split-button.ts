import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/** The variants of the default action, which is everything the split half of the button offers. */
export const splitButtonMenuItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "save-copy" }, slots: { label: t("demo.splitButton.copy") } },
  { options: { value: "save-template" }, slots: { label: t("demo.splitButton.template") } },
];

/** Archive is a lower-emphasis action than Save — pairs with `variant: "subtle"`. */
export const splitButtonSubtleMenuItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "archive-mute" }, slots: { label: t("demo.splitButton.subtleItem1") } },
  { options: { value: "archive-thread" }, slots: { label: t("demo.splitButton.subtleItem2") } },
];

/** Download sits over media — pairs with `variant: "translucent"`, meant for photo/hero backdrops. */
export const splitButtonTranslucentMenuItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "download-hires" }, slots: { label: t("demo.splitButton.translucentItem1") } },
  { options: { value: "download-original" }, slots: { label: t("demo.splitButton.translucentItem2") } },
];

/** Share is chromeless, optional — pairs with `variant: "ghost"`. */
export const splitButtonGhostMenuItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "share-link" }, slots: { label: t("demo.splitButton.ghostItem1") } },
  { options: { value: "share-email" }, slots: { label: t("demo.splitButton.ghostItem2") } },
];

/** Delete is destructive — pairs with `variant: "danger"`. */
export const splitButtonDangerMenuItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "delete-forever" }, slots: { label: t("demo.splitButton.dangerItem1") } },
  { options: { value: "delete-trash" }, slots: { label: t("demo.splitButton.dangerItem2") } },
];
