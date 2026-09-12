import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";


/** Feed, article and article label: two posts so the stack and labels both read. */
export const feedAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("feedPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "feed",
      signature: "Feed",
      options: { label: t("demo.feed.label") },
      children: [
        {
          contract: "feed",
          signature: "FeedArticle",
          options: { posInset: 1, setSize: 2 },
          slots: { label: t("demo.feed.author1") },
          children: t("demo.feed.body1"),
        },
        {
          contract: "feed",
          signature: "FeedArticle",
          options: { posInset: 2, setSize: 2 },
          slots: { label: t("demo.feed.author2") },
          children: t("demo.feed.body2"),
        },
      ],
    },
    items: [
      namePart(".sk-feed", "block-start"),
      namePart(".sk-feed__article", "inline-start"),
      namePart(".sk-feed__article-label", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

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
