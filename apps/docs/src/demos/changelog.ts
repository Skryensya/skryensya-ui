import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Four entries covering four of the five kinds, which is what makes the rail worth looking at: the
 * dot is the only place the kind appears before a reader has read anything, so a demo with one kind
 * would show a component that could not be told from a plain list.
 *
 * The DATES ARE WRITTEN TWICE on purpose and the demo would be dishonest otherwise. The option is
 * the machine's `YYYY-MM-DD` and the slot is the same day as a reader reads it; a demo that showed
 * only one of them would hide the single thing about this contract that an author has to get right.
 * They are not formatted here for the same reason the contract does not format them: this file has a
 * `Translate`, not a locale, and `Intl` needs the locale. The strings come from the translations,
 * where each language already writes its own date the way that language writes dates.
 *
 * The last entry omits `target`, because most first-publication entries have none: they are about
 * the whole contract rather than about one option inside it.
 */
export const changelogTree = (t: Translate): UsageTree => ({
  contract: "changelog",
  signature: "Changelog",
  attrs: { "aria-label": t("demo.changelog.label") },
  children: [
    {
      contract: "changelog",
      signature: "ChangelogEntry",
      options: { date: "2026-08-04", kind: "breaking" },
      slots: {
        date: t("demo.changelog.breaking.date"),
        kind: t("demo.changelog.kind.breaking"),
        target: "valueChange",
      },
      children: t("demo.changelog.breaking.body"),
    },
    {
      contract: "changelog",
      signature: "ChangelogEntry",
      options: { date: "2026-08-01", kind: "fixed" },
      slots: {
        date: t("demo.changelog.fixed.date"),
        kind: t("demo.changelog.kind.fixed"),
        target: "content",
      },
      children: t("demo.changelog.fixed.body"),
    },
    {
      contract: "changelog",
      signature: "ChangelogEntry",
      options: { date: "2026-07-30", kind: "changed" },
      slots: {
        date: t("demo.changelog.changed.date"),
        kind: t("demo.changelog.kind.changed"),
        target: "collapsible",
      },
      children: t("demo.changelog.changed.body"),
    },
    {
      contract: "changelog",
      signature: "ChangelogEntry",
      options: { date: "2026-07-29", kind: "added" },
      slots: {
        date: t("demo.changelog.added.date"),
        kind: t("demo.changelog.kind.added"),
      },
      children: t("demo.changelog.added.body"),
    },
  ],
});
