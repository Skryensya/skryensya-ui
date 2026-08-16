import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import {
  flyoutDensityItems,
  flyoutLanguageItems,
  flyoutPlanItems,
  flyoutRadiusItems,
  flyoutRegionItems,
} from "./data/flyout";

/*
 * Every Flyout demo is now a tree. The contract owns closed/open/item indicators and its
 * `defaultValue` maps to the machine value in Vanilla and the array-shaped React prop.
 *
 * The lists themselves are data: see `data/flyout.ts`.
 */

/**
 * The plain picker. A constant, not a factory: `Plan` is spelled the same in both languages and the
 * three tiers are product names, so there is nothing here for a `t` to do.
 */
export const flyoutTree: UsageTree = {
  contract: "flyout",
  signature: "Flyout",
  slots: { label: "Plan", items: flyoutPlanItems },
};

/**
 * The narrow-rail case, and the only demo whose WIDTH is the subject.
 *
 * That width comes from the rail the control sits in, not from the component, so it is
 * `measure="13.5rem"` on the page and not a wrapper in the tree: the snippet a reader copies must
 * not carry the consumer's layout.
 */
export const flyoutRailTree = (t: Translate): UsageTree => ({
  contract: "flyout",
  signature: "Flyout",
  slots: { label: t("demo.flyout.density"), items: flyoutDensityItems(t) },
});

/**
 * Two pickers, one open at a time: the exclusivity is a document event, so it needs two real
 * Flyouts and nothing else.
 *
 * The first one IS the rail demo, reused. The two hand-written copies this replaced had already
 * drifted apart: the HTML listed five densities and the TSX beside it listed three, on both pages.
 */
export const flyoutExclusiveTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    flyoutRailTree(t),
    {
      contract: "flyout",
      signature: "Flyout",
      slots: { label: t("demo.flyout.radius"), items: flyoutRadiusItems(t) },
    },
  ],
});

/** One unavailable region. `disabled` is an option of the ITEM, not of the picker. */
export const flyoutDisabledItemTree = (t: Translate): UsageTree => ({
  contract: "flyout",
  signature: "Flyout",
  slots: { label: t("demo.flyout.region"), items: flyoutRegionItems(t) },
});

/** The same picker with `disabled` on the ROOT: it neither opens nor changes value. */
export const flyoutDisabledTree: UsageTree = {
  contract: "flyout",
  signature: "Flyout",
  options: { disabled: true },
  slots: { label: "Plan", items: flyoutPlanItems },
};

/** Ten options, so the panel hits its max height and scrolls. */
export const flyoutLongTree = (t: Translate): UsageTree => ({
  contract: "flyout",
  signature: "Flyout",
  slots: { label: t("demo.flyout.language"), items: flyoutLanguageItems },
});

export const flyoutPlaceholderTree = (t: Translate): UsageTree => ({
  contract: "flyout",
  signature: "Flyout",
  options: {
    placeholder: t("demo.flyout.placeholder"),
    defaultValue: "__no-selection__",
  },
  slots: { label: t("demo.flyout.plan"), items: flyoutPlanItems },
});
