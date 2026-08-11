import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * TWO RELEASES, AND ONE OF THEM HAS NOT SHIPPED, which is the only pair that shows what this
 * contract is for. A demo of one dated release would be a list with a heading; the second one, with
 * no date, is where the rail's dot goes hollow and where `0.2.0-dev` says both which version the
 * work is heading for and that it has not got there — the state every changelog in this repo is
 * actually in today.
 *
 * ALL FIVE KINDS ARE HERE, one per entry, because every kind now wears its own tone and the badge
 * column is the first thing a reader scans. A demo showing four of them would be a legend with a
 * hole in it: nothing on the page would say what the fifth colour means, and the one it left out
 * would be `chore` — the quiet one, which is exactly the tone a reader needs to have seen before
 * they can trust that a grey badge means "not for you" rather than "unlabelled".
 *
 * The DATE IS WRITTEN TWICE on purpose and the demo would be dishonest otherwise. The option is the
 * machine's `YYYY-MM-DD` and the slot is the same day as a reader reads it; a demo that showed only
 * one of them would hide the single thing about this contract that an author has to get right. It is
 * not formatted here for the same reason the contract does not format it: this file has a
 * `Translate`, not a locale, and `Intl` needs the locale. The string comes from the translations,
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
      signature: "ChangelogRelease",
      slots: { version: "0.2.0-dev" },
      children: [
        {
          contract: "changelog",
          signature: "ChangelogEntry",
          options: { kind: "breaking" },
          slots: {
            kind: t("demo.changelog.kind.breaking"),
            title: t("demo.changelog.breaking.title"),
            target: "valueChange",
          },
          children: t("demo.changelog.breaking.body"),
        },
        {
          contract: "changelog",
          signature: "ChangelogEntry",
          options: { kind: "bugfix" },
          slots: {
            kind: t("demo.changelog.kind.bugfix"),
            title: t("demo.changelog.bugfix.title"),
            target: "content",
          },
          children: t("demo.changelog.bugfix.body"),
        },
      ],
    },
    {
      contract: "changelog",
      signature: "ChangelogRelease",
      options: { date: "2026-07-29" },
      slots: { version: "0.1.0", date: t("demo.changelog.date") },
      children: [
        {
          contract: "changelog",
          signature: "ChangelogEntry",
          options: { kind: "rework" },
          slots: {
            kind: t("demo.changelog.kind.rework"),
            title: t("demo.changelog.rework.title"),
            target: "collapsible",
          },
          children: t("demo.changelog.rework.body"),
        },
        /*
         * `chore` carries no `kind` OPTION, and that is the fifth thing this demo is showing: the
         * contract defaults to `chore`, so an entry that names no kind is a quiet one. Written out
         * here it would prove nothing that the four above do not; left off, it proves the default.
         * The label still has to be slotted, because the word is never colour alone.
         */
        {
          contract: "changelog",
          signature: "ChangelogEntry",
          slots: { kind: t("changelog.kind.chore"), title: t("demo.changelog.chore.title") },
          children: t("demo.changelog.chore.body"),
        },
        {
          contract: "changelog",
          signature: "ChangelogEntry",
          options: { kind: "feature" },
          slots: {
            kind: t("demo.changelog.kind.feature"),
            title: t("demo.changelog.feature.title"),
          },
          children: t("demo.changelog.feature.body"),
        },
      ],
    },
  ],
});
