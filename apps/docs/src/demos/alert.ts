import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * All four alerts convert. Two of them did not until the contract grew the dismiss control it had a
 * part class for (`dismissible` / `dismissLabel`, the same pair Toast declares) and until `actions`
 * admitted a Link — a recovery path is often a destination, not a command.
 */

/** The default: surface and border, no semantic paint, and a dismiss the consumer owns. */
export const alertNeutralTree = (t: Translate): UsageTree => ({
  contract: "alert",
  signature: "Alert",
  options: { tone: "neutral", dismissible: true, dismissLabel: t("demo.alert.dismiss") },
  slots: { title: t("demo.alert.neutral.title") },
  children: t("demo.alert.neutral.body"),
});

/** Full panel with a title: a condition that needs explanation beside the content. */
export const alertBannerTree = (t: Translate): UsageTree => ({
  contract: "alert",
  signature: "Alert",
  options: { tone: "info", presentation: "banner" },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "info" } },
    title: t("demo.alert.banner.title"),
  },
  children: t("demo.alert.banner.body"),
});

/** The side bar keeps the tone signal and gives the recovery link the room to be read. */
export const alertAccentTree = (t: Translate): UsageTree => ({
  contract: "alert",
  signature: "Alert",
  options: {
    tone: "warning",
    presentation: "accent",
    dismissible: true,
    dismissLabel: t("demo.alert.dismiss"),
  },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "warning" } },
    title: t("demo.alert.accent.title"),
    actions: {
      contract: "typography",
      signature: "Link",
      options: { href: "/billing" },
      children: t("demo.alert.accent.action"),
    },
  },
  children: t("demo.alert.accent.body"),
});

/** No panel, no title: a short confirmation next to a block that already has structure. */
export const alertInlineTree = (t: Translate): UsageTree => ({
  contract: "alert",
  signature: "Alert",
  options: { tone: "success", presentation: "inline" },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "success" } },
  },
  children: t("demo.alert.inline.body"),
});
