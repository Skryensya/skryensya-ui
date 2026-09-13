import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Ten rows of filler, long enough that the box actually scrolls: that is the whole point, because a
 * scrollbar demo with nothing to scroll shows nothing. The two trees differ only in the class, which
 * is what the page is comparing (always-visible against reveal-on-hover).
 */
const rows = (t: Translate): readonly string[] => [
  t("demo.scrollbar.length"),
  t("demo.scrollbar.state"),
  "Render: vanilla",
  "Binding: React",
  t("demo.scrollbar.contract"),
  t("demo.scrollbar.gate"),
  t("demo.scrollbar.sourceHash"),
  t("demo.scrollbar.preview"),
  t("demo.scrollbar.scroll"),
  "Thumb: visible",
];

const scrollDemo = (t: Translate, className: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  attrs: { class: className, tabindex: "0" },
  children: [...rows(t)],
});

export const scrollbarAlwaysTree = (t: Translate): UsageTree =>
  scrollDemo(t, "sk-scrollbar demo-scroll");

export const scrollbarRevealTree = (t: Translate): UsageTree =>
  scrollDemo(t, "sk-scrollbar demo-scroll sk-scrollbar--reveal");
