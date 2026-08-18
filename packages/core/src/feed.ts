import type { ComponentContract } from "./contract.js";

/*
 * FEED — a scrollable stream of independent content units (posts, comments), each announced with
 * its position and set size so a screen reader user knows where they are without reading the whole
 * stream. WAI-ARIA APG is explicit that "the feed role is not associated with any well-established
 * keyboard conventions" — confirmed fetching the pattern page, not assumed — Page Up/Page Down/
 * Ctrl+Home/Ctrl+End are RECOMMENDATIONS, not requirements, unlike every other roving-tabindex
 * pattern in this catalogue (`Treegrid`, `DataGrid`, `Toolbar`). No demo needs infinite-scroll
 * paging today, so this v1 stays purely static/presentational — no machine, no enhancer, the same
 * shape `Table`/`Progress`/`Meter` already have — rather than building a keyboard model the spec
 * itself does not ask for.
 */
export const feedParts = {
  root: "sk-feed",
  article: "sk-feed__article",
  articleLabel: "sk-feed__article-label",
} as const;

export type FeedPart = keyof typeof feedParts;
export type FeedPartClass = (typeof feedParts)[FeedPart];

export const feedContract = {
  id: "feed",
  css: "@skryensya/core/components/feed.css",
  parts: feedParts,

  options: {
    /** The feed's accessible name. `role="feed"` carries no implicit one. */
    label: { type: "string", attr: "aria-label" },
    /**
     * Set while more articles are loading (e.g. an infinite-scroll fetch in flight) — WAI's own
     * wording: "aria-busy is set to true before a DOM change... set to false immediately after".
     * That "set to false", not omitted, is why `falseValue` is explicit: unlike a presence-only
     * boolean, this is a tri-state ARIA attribute meant to always be readable, and the React
     * binding already writes `aria-busy={busy}` unconditionally — omitting it here would have made
     * every non-busy feed a divergence from the binding that was never wrong.
     */
    busy: { type: "boolean", default: false, attr: "aria-busy", trueValue: "true", falseValue: "false" },
    /** This article's 1-based position in the feed. */
    posInset: { type: "number", attr: "aria-posinset" },
    /** Total articles currently loaded (or the whole feed's length, if known) — WAI allows `-1`
     *  when the true count is undetermined (an infinite-scroll feed with no known end). */
    setSize: { type: "number", attr: "aria-setsize" },
  },

  signatures: {
    Feed: {
      intent: ["content-stream", "infinite-scroll", "activity-feed", "comment-stream"],
      host: { element: "div" },
      options: ["label", "busy"],
      requires: ["label"],
      slots: { children: { accepts: "signature", required: true, of: ["FeedArticle"] } },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "feed" },
        slot: "children",
      },
      react: { from: "@skryensya/react/feed", name: "Feed" },
    },

    FeedArticle: {
      intent: ["feed-item", "post", "comment"],
      host: { element: "article" },
      options: ["posInset", "setSize"],
      requires: ["posInset", "setSize"],
      parents: ["Feed"],
      slots: {
        /** What names this article to a screen reader — an author, a headline, a timestamp. */
        label: { accepts: "node", required: true },
        children: { accepts: "node", required: true },
      },
      template: {
        element: "article",
        part: "article",
        host: true,
        attrs: { role: "article" },
        labelledBySlot: "label",
        // A real wrapping element, not the slot placed bare — `aria-labelledby` needs a node with
        // an id to point at, the same reason `Dialog`'s own `title` slot is a real `<h2>`, never
        // just the slot's content dropped in directly.
        children: [
          { element: "div", part: "articleLabel", slot: "label" },
          { slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/feed", name: "FeedArticle" },
    },
  },
} as const satisfies ComponentContract;
