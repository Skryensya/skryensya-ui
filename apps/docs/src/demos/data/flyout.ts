import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * EVERY LIST A FLYOUT DEMO OFFERS. The compositions in `flyout.ts` differ by one option each
 * (`disabled`, a placeholder, a rail width); what actually distinguishes them to a reader is which
 * of these lists they are showing.
 */

/** One option of a Flyout: the value the contract keys on, and the words the reader sees. */
type Choice = { value: string; label: string; disabled?: boolean };

/** The `items` collection, which stays DATA on both sides: React repeats it, the template expands it. */
const items = (choices: readonly Choice[]): readonly ItemInput[] =>
  choices.map(({ value, label, disabled }) => ({
    options: disabled ? { value, disabled: true } : { value },
    slots: { label },
  }));

/**
 * Tier names, written rather than translated: `Starter`, `Pro` and `Enterprise` are product names,
 * so this one is a constant and not a function of `t`.
 */
export const flyoutPlanItems = items([
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
]);

/** Five densities, the list the rail demo narrows around. */
export const flyoutDensityItems = (t: Translate): readonly ItemInput[] =>
  items([
    { value: "0.5", label: t("demo.flyout.densityCondensed") },
    { value: "0.6", label: t("demo.flyout.densityDense") },
    { value: "0.8", label: t("demo.flyout.densityCompact") },
    { value: "1", label: t("demo.flyout.densityComfortable") },
    { value: "1.2", label: t("demo.flyout.densitySpacious") },
  ]);

export const flyoutRadiusItems = (t: Translate): readonly ItemInput[] =>
  items([
    { value: "0", label: t("demo.flyout.radiusSquare") },
    { value: "0.5", label: t("demo.flyout.radiusSubtle") },
    { value: "1", label: t("demo.flyout.radiusSoft") },
    { value: "1.5", label: t("demo.flyout.radiusStrong") },
    { value: "2", label: t("demo.flyout.radiusRound") },
  ]);

/** One unavailable region. `disabled` is an option of the ITEM, not of the picker. */
export const flyoutRegionItems = (t: Translate): readonly ItemInput[] =>
  items([
    { value: "eu", label: t("demo.flyout.regionEurope") },
    { value: "us", label: t("demo.flyout.regionAmericas") },
    { value: "apac", label: t("demo.flyout.regionApac"), disabled: true },
    { value: "latam", label: t("demo.flyout.regionLatam") },
  ]);

/**
 * Ten options, so the panel hits its max height and scrolls.
 *
 * The languages are written as ENDONYMS and never translated: `Português` is `Português` on both
 * pages, and a list of language names that changes with the page's own language is a list that has
 * to be maintained twice. The English page used to say `Spanish` for `es`.
 */
export const flyoutLanguageItems = items([
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "nl", label: "Nederlands" },
  { value: "pl", label: "Polski" },
  { value: "sv", label: "Svenska" },
  { value: "ja", label: "日本語" },
]);
