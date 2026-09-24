import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";


/** Feed, article and article label: two posts so the stack and labels both read. */
export const feedAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("feedPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
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
      namePart(".sk-feed", "block-start", { mark: "bracket" }),
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

/*
 * THE LABEL SLOT IS A NODE, NOT A STRING, and until this demo existed nothing on the page said so.
 *
 * Every other feed here passes `label: "María. Hace 2 horas"`, one string carrying two facts, and
 * a reader could reasonably conclude that is the shape. It is not: the slot accepts a tree, so the
 * identity line is an `Avatar` beside the name and the timestamp, which is what an activity feed
 * actually looks like. The name still ends up as the article's accessible name, because
 * `labelledBySlot` points at whatever the slot rendered.
 */
const activityArticle = (
  entry: { initials: string; author: string; when: string; body: string; tag?: string; tone?: "accent" | "success" },
  index: number,
  total: number,
): UsageTree => ({
  contract: "feed",
  signature: "FeedArticle",
  options: { posInset: index + 1, setSize: total },
  slots: {
    label: {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm", inlineAlign: "center" },
      children: [
        {
          contract: "avatar",
          signature: "Avatar.initials",
          options: { size: "sm", name: entry.author },
          children: entry.initials,
        },
        { contract: "typography", signature: "Strong", children: entry.author },
        {
          contract: "typography",
          signature: "Text",
          options: { size: "caption", tone: "secondary", textElement: "span" },
          children: entry.when,
        },
      ],
    },
  },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm", align: "start" },
    children: [
      { contract: "typography", signature: "Text", children: entry.body },
      ...(entry.tag
        ? [
            {
              contract: "tag",
              signature: "Tag",
              options: { tone: entry.tone ?? "neutral" },
              children: entry.tag,
            } satisfies UsageTree,
          ]
        : []),
    ],
  },
});

/** An activity feed as one would really be written: composed identity lines, bodies with a Tag. */
export const feedActivityTree = (t: Translate): UsageTree => {
  const entries = [
    {
      initials: "MP",
      author: t("demo.feed.author1"),
      when: t("demo.feed.when1"),
      body: t("demo.feed.activity1"),
      tag: t("demo.feed.tagRelease"),
      tone: "accent" as const,
    },
    {
      initials: "DS",
      author: t("demo.feed.author2"),
      when: t("demo.feed.when2"),
      body: t("demo.feed.activity2"),
    },
    {
      initials: "LT",
      author: t("demo.feed.author3"),
      when: t("demo.feed.when3"),
      body: t("demo.feed.activity3"),
      tag: t("demo.feed.tagClosed"),
      tone: "success" as const,
    },
  ];
  return {
    contract: "feed",
    signature: "Feed",
    /* The keyboard model on, because this is the demo long enough to want it: Page Down steps
       post to post and Ctrl+End leaves for whatever follows the stream. */
    options: { label: t("demo.feed.label"), keyboard: true },
    children: entries.map((entry, index) => activityArticle(entry, index, entries.length)),
  };
};

/*
 * BUSY, WHICH IS THE ONE STATE THE CONTRACT ALWAYS HAD AND THE PAGE NEVER SHOWED.
 *
 * `busy` writes `aria-busy="true"` on the root while the next batch is in flight. The skeletons
 * are `Placeholder`s, decorative by construction (`aria-hidden`), and the fact that something is
 * loading is announced ONCE by a `Loader.status` rather than by each row: three skeletons each
 * narrating "loading" says it three times, which is worse than the silence.
 *
 * The already-loaded post stays visible above them. That is the honest shape of an infinite feed
 * fetching more, and it is why `busy` sits on the feed rather than replacing it with a spinner.
 */
export const feedBusyTree = (t: Translate): UsageTree => ({
  contract: "feed",
  signature: "Feed",
  options: { label: t("demo.feed.label"), busy: true },
  children: [
    {
      contract: "feed",
      signature: "FeedArticle",
      options: { posInset: 1, setSize: -1 },
      slots: { label: t("demo.feed.author1") },
      children: t("demo.feed.body1"),
    },
    {
      contract: "feed",
      signature: "FeedArticle",
      options: { posInset: 2, setSize: -1 },
      slots: {
        label: {
          contract: "loader",
          signature: "Loader.status",
          options: { label: t("demo.feed.loadingLabel") },
        },
      },
      children: {
        contract: "placeholder",
        signature: "Placeholder.paragraph",
        options: { lines: 2 },
      },
    },
  ],
});

/*
 * AN UNKNOWN TOTAL, WHICH IS WHAT `setSize: -1` IS FOR.
 *
 * Every article says "-1", WAI's own value for a stream with no known end, so a screen reader
 * announces the position without inventing a total it cannot know. The button below appends the
 * next batch (`feed-load-more.ts`), and the enhancer's MutationObserver is what puts those new
 * articles in the Tab sequence without focus ever re-entering the feed.
 */
export const feedInfiniteTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 100%" },
  children: [
    {
      contract: "feed",
      signature: "Feed",
      options: { label: t("demo.feed.streamLabel"), keyboard: true },
      attrs: { "data-feed-demo": "stream" },
      children: [1, 2].map((position) => ({
        contract: "feed",
        signature: "FeedArticle",
        options: { posInset: position, setSize: -1 },
        slots: { label: t(`demo.feed.author${position}` as "demo.feed.author1") },
        children: t(`demo.feed.body${position}` as "demo.feed.body1"),
      })),
    },
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "soft" },
      /* The words the script writes into each new post travel as data, because a demo script
         cannot import and a string typed inside one would be built once per language. */
      attrs: {
        "data-feed-demo": "more",
        "data-feed-author": t("demo.feed.author3"),
        "data-feed-body": t("demo.feed.body3"),
      },
      children: t("demo.feed.loadMore"),
    },
  ],
});

/*
 * A FLAT COMMENT STREAM, and the boundary it draws.
 *
 * This is the shape `contracts/semantic/feed.yaml` is talking about when it sends nested,
 * actionable conversation to `CommentThread` instead: comments that are only read, in one flat
 * list, with no replies under them and no vote or reply controls, are a Feed. The moment one of
 * those appears the answer changes, and having both on the page is the only way that line stops
 * being a sentence in a yaml file.
 */
export const feedCommentsTree = (t: Translate): UsageTree => {
  const comments = [
    { author: t("demo.feed.commentAuthor1"), when: t("demo.feed.when1"), body: t("demo.feed.comment1") },
    { author: t("demo.feed.commentAuthor2"), when: t("demo.feed.when2"), body: t("demo.feed.comment2") },
  ];
  return {
    contract: "feed",
    signature: "Feed",
    options: { label: t("demo.feed.commentsLabel") },
    children: comments.map((comment, index) => ({
      contract: "feed",
      signature: "FeedArticle",
      options: { posInset: index + 1, setSize: comments.length },
      slots: {
        label: {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm", inlineAlign: "baseline" },
          children: [
            { contract: "typography", signature: "Strong", children: comment.author },
            {
              contract: "typography",
              signature: "Text",
              options: { size: "caption", tone: "secondary", textElement: "span" },
              children: comment.when,
            },
          ],
        },
      },
      children: { contract: "typography", signature: "Text", children: comment.body },
    })),
  };
};
