import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * One visual weight, four tones, and no way to dismiss any of them. Callout is purely
 * informational: it shows something, it does not run anything, so there is no `dismissible` here to
 * demonstrate. The one interactive piece a Callout can carry is a recovery action, and the contract
 * narrows its `variant` to `subtle`/`danger` so it never reads as a second, competing action button.
 */

/** The default: surface and border, no semantic paint, and no action, ever. */
export const calloutNeutralTree = (t: Translate): UsageTree => ({
  contract: "callout",
  signature: "Callout",
  options: { tone: "neutral" },
  slots: { title: t("demo.callout.neutral.title") },
  children: t("demo.callout.neutral.body"),
});

/** A title beside the content it explains: a condition worth naming, not just describing. */
export const calloutInfoTree = (t: Translate): UsageTree => ({
  contract: "callout",
  signature: "Callout",
  options: { tone: "info" },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "info" } },
    title: t("demo.callout.info.title"),
  },
  children: t("demo.callout.info.body"),
});

/** A recovery path as a plain Link: a destination, not a command. */
export const calloutWarningTree = (t: Translate): UsageTree => ({
  contract: "callout",
  signature: "Callout",
  options: { tone: "warning" },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "warning" } },
    title: t("demo.callout.warning.title"),
    actions: {
      contract: "typography",
      signature: "Link",
      options: { href: "/billing" },
      children: t("demo.callout.warning.action"),
    },
  },
  children: t("demo.callout.warning.body"),
});

/** A recovery action as a Button: `translucent`, which blends with the callout's colored background. */
export const calloutSuccessTree = (t: Translate): UsageTree => ({
  contract: "callout",
  signature: "Callout",
  options: { tone: "success" },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "success" } },
    actions: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "translucent" },
      children: t("demo.callout.success.action"),
    },
  },
  children: t("demo.callout.success.body"),
});
