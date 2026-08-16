import type { Translate } from "../../i18n";

/*
 * THE FIXTURE EVERY TREEGRID TEST ALREADY USES — core's `treegrid.test.ts`, vanilla's, and react's
 * all reason about this exact inbox shape (Inbox expanded with two messages, Drafts collapsed with
 * one hidden message, Sent a top-level leaf), so the demo on this page is provably the same
 * composition the test suites already exercise, not a second shape nobody tested.
 */

export const treegridColumns = (t: Translate) => [
  t("demo.treegrid.subject"),
  t("demo.treegrid.from"),
] as const;

export const treegridRows = (t: Translate) => [
  {
    value: "inbox",
    level: 1,
    setSize: 3,
    posInset: 1,
    expanded: true,
    cells: [t("demo.treegrid.inbox"), "—"],
  },
  {
    value: "alice",
    level: 2,
    setSize: 2,
    posInset: 1,
    cells: [t("demo.treegrid.meeting"), "Alice"],
  },
  {
    value: "bob",
    level: 2,
    setSize: 2,
    posInset: 2,
    cells: [t("demo.treegrid.lunch"), "Bob"],
  },
  {
    value: "drafts",
    level: 1,
    setSize: 3,
    posInset: 2,
    expanded: false,
    cells: [t("demo.treegrid.drafts"), "—"],
  },
  {
    value: "untitled",
    level: 2,
    setSize: 1,
    posInset: 1,
    cells: [t("demo.treegrid.untitled"), t("demo.treegrid.me")],
  },
  {
    value: "sent",
    level: 1,
    setSize: 3,
    posInset: 3,
    cells: [t("demo.treegrid.sent"), "—"],
  },
] as const;
