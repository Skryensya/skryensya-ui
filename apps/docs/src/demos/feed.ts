import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Three posts. Each `FeedArticle` states its own `posInset`/`setSize`. A screen reader user
 * navigating past article 2 hears "2 of 3" without reading the other two first.
 */
export const feedTree = (t: Translate): UsageTree => {
  const posts = [
    { author: t("demo.feed.author1"), body: t("demo.feed.body1") },
    { author: t("demo.feed.author2"), body: t("demo.feed.body2") },
    { author: t("demo.feed.author3"), body: t("demo.feed.body3") },
  ];
  return {
    contract: "feed",
    signature: "Feed",
    options: { label: t("demo.feed.label") },
    children: posts.map((post, index) => ({
      contract: "feed",
      signature: "FeedArticle",
      options: { posInset: index + 1, setSize: posts.length },
      slots: { label: post.author },
      children: post.body,
    })),
  };
};
