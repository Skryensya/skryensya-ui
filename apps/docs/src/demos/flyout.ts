import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The six Flyout demos that the contract can say. Two things it cannot, both found by writing them:
 *
 * 1. NO SLOT FOR THE INDICATOR GEOMETRY. The React binding takes `indicator`, `openIndicator` and
 *    `itemIndicator` ("decorative geometry supplied by the consumer's bound icon set"), and the part
 *    template paints the wrappers for all three — `[data-state="closed"]`, `[data-state="open"]`,
 *    `.sk-flyout__item-indicator` — but the contract publishes no slot to fill them. So an emitted
 *    Flyout is a legal Flyout with empty indicators: no chevron on the trigger, no check on the
 *    chosen item. Every icon-bearing family solved this the same way (Alert, EmptyState, Toast and
 *    SidebarTrigger each declare `icon: { accepts: "signature", of: ["Icon"] }`); Flyout needs three
 *    of those, the last one on the ITEM shape.
 *
 * 2. `defaultValue` REACHES NEITHER BINDING. The contract maps it to `data-default-value`, and the
 *    Vanilla enhancer reads `root.dataset.value` — so the attribute lands and is ignored. React gets
 *    it worse: `FlyoutProps.defaultValue` is `string[]`, the option is `type: "string"`, so
 *    `defaultValue?.[0]` on `"pro"` is `"p"`, which matches nothing and falls through to the
 *    placeholder. Tabs, TimeField and Slider all have the working shape — one option `value`, with
 *    `attr: "data-value"` and `prop: "defaultValue"` — and Flyout should have it too.
 *
 *    Until it does, no tree here sets a starting value: both bindings independently fall back to the
 *    FIRST option, which is the one preselection they agree on. It costs these demos nothing (none
 *    of them is about which value is chosen) and it keeps the snippet honest — a reader who pastes
 *    `defaultValue="pro"` gets a picker showing "Select option".
 *
 * The seventh demo, Placeholder, stays authored on the page for the same reason #2 exists: the
 * placeholder is only visible when the current value matches no item, and setting such a value is
 * exactly what a tree cannot do. See the page for its markup.
 */

/** One option of a Flyout: the value the contract keys on, and the words the reader sees. */
type Choice = { value: string; label: string; disabled?: boolean };

/** The `items` collection, which stays DATA on both sides — React repeats it, the template expands it. */
const items = (choices: readonly Choice[]) =>
  choices.map(({ value, label, disabled }) => ({
    options: disabled ? { value, disabled: true } : { value },
    slots: { label },
  }));

/** Tier names, written rather than translated: `Starter`, `Pro` and `Enterprise` are product names. */
const plans: readonly Choice[] = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

/**
 * The plain picker. A constant, not a factory: `Plan` is spelled the same in both languages and the
 * three tiers are product names, so there is nothing here for a `t` to do.
 */
export const flyoutTree: UsageTree = {
  contract: "flyout",
  signature: "Flyout",
  slots: { label: "Plan", items: items(plans) },
};

/**
 * The narrow-rail case, and the only demo whose WIDTH is the subject.
 *
 * That width comes from the rail the control sits in, not from the component, so it is
 * `measure="13.5rem"` on the page and not a wrapper in the tree — the snippet a reader copies must
 * not carry the consumer's layout.
 */
export const flyoutRailTree = (t: Translate): UsageTree => ({
  contract: "flyout",
  signature: "Flyout",
  slots: {
    label: t("demo.flyout.density"),
    items: items([
      { value: "0.5", label: t("demo.flyout.densityCondensed") },
      { value: "0.6", label: t("demo.flyout.densityDense") },
      { value: "0.8", label: t("demo.flyout.densityCompact") },
      { value: "1", label: t("demo.flyout.densityComfortable") },
      { value: "1.2", label: t("demo.flyout.densitySpacious") },
    ]),
  },
});

/**
 * Two pickers, one open at a time — the exclusivity is a document event, so it needs two real
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
      slots: {
        label: t("demo.flyout.radius"),
        items: items([
          { value: "0", label: t("demo.flyout.radiusSquare") },
          { value: "0.5", label: t("demo.flyout.radiusSubtle") },
          { value: "1", label: t("demo.flyout.radiusSoft") },
          { value: "1.5", label: t("demo.flyout.radiusStrong") },
          { value: "2", label: t("demo.flyout.radiusRound") },
        ]),
      },
    },
  ],
});

/** One unavailable region. `disabled` is an option of the ITEM, not of the picker. */
export const flyoutDisabledItemTree = (t: Translate): UsageTree => ({
  contract: "flyout",
  signature: "Flyout",
  slots: {
    label: t("demo.flyout.region"),
    items: items([
      { value: "eu", label: t("demo.flyout.regionEurope") },
      { value: "us", label: t("demo.flyout.regionAmericas") },
      { value: "apac", label: t("demo.flyout.regionApac"), disabled: true },
      { value: "latam", label: t("demo.flyout.regionLatam") },
    ]),
  },
});

/** The same picker with `disabled` on the ROOT: it neither opens nor changes value. */
export const flyoutDisabledTree: UsageTree = {
  contract: "flyout",
  signature: "Flyout",
  options: { disabled: true },
  slots: { label: "Plan", items: items(plans) },
};

/**
 * Ten options, so the panel hits its max height and scrolls.
 *
 * The languages are written as ENDONYMS and never translated: `Português` is `Português` on both
 * pages, and a list of language names that changes with the page's own language is a list that has
 * to be maintained twice. The English page used to say `Spanish` for `es`.
 */
export const flyoutLongTree = (t: Translate): UsageTree => ({
  contract: "flyout",
  signature: "Flyout",
  slots: {
    label: t("demo.flyout.language"),
    items: items([
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
    ]),
  },
});
