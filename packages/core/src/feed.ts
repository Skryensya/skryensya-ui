import type { ComponentContract } from "./contract.js";

/*
 * FEED. A scrollable stream of independent content units (posts, comments), each announced with
 * its position and set size so a screen reader user knows where they are without reading the whole
 * stream.
 *
 * WAI-ARIA APG is explicit that "the feed pattern is not based on a desktop GUI widget so the
 * `feed` role is not associated with any well-established keyboard conventions". Confirmed
 * fetching the pattern page, not assumed. Page Down/Page Up/Ctrl+End/Ctrl+Home are
 * RECOMMENDATIONS, not requirements, unlike every other roving-tabindex pattern in this catalogue
 * (`Treegrid`, `DataGrid`, `Toolbar`).
 *
 * So the keyboard model is OPT-IN, behind `keyboard`, and off by default: v1 shipped purely
 * static on the argument that a model the spec does not ask for should not be forced on every
 * consumer, and that argument still holds for a five-post activity panel. What changed is that
 * refusing to BUILD it left a long stream with no way to move through it at all, which the spec
 * does not ask for either. A default of `false` keeps every tree written before this exactly as
 * it was, byte for byte.
 *
 * The key math is `resolveFeedKey` at the bottom of this file and the DOM half is `feed-dom.ts`,
 * the same three-way split `toolbar.ts` uses: pure resolver in core, imperative binding in
 * `@skryensya/vanilla`, declarative one in `@skryensya/react`. Neither binding does index
 * arithmetic of its own, so the two cannot drift.
 */
export const feedParts = {
  root: "sk-feed",
  article: "sk-feed__article",
  articleLabel: "sk-feed__article-label",
} as const;

export type FeedPart = keyof typeof feedParts;
export type FeedPartClass = (typeof feedParts)[FeedPart];

/** The markup contract: what the Vanilla enhancer looks for. Selectors are derived, never retyped. */
export const feedAttrs = {
  root: "data-sk-feed",
} as const;

export const feedContract = {
  id: "feed",
  category: "content",
  css: "@skryensya/core/components/feed.css",
  parts: feedParts,
  hooks: [
    "--sk-feed-article-label-gap",
    "--sk-feed-article-padding",
    "--sk-feed-gap",
  ],

  options: {
    /** The feed's accessible name. `role="feed"` carries no implicit one. */
    label: { type: "string", attr: "aria-label" },
    /**
     * Set while more articles are loading (e.g. an infinite-scroll fetch in flight). WAI's own
     * wording: "aria-busy is set to true before a DOM change... set to false immediately after".
     * That "set to false", not omitted, is why `falseValue` is explicit: unlike a presence-only
     * boolean, this is a tri-state ARIA attribute meant to always be readable, and the React
     * binding already writes `aria-busy={busy}` unconditionally. Omitting it here would have made
     * every non-busy feed a divergence from the binding that was never wrong.
     */
    busy: { type: "boolean", default: false, attr: "aria-busy", trueValue: "true", falseValue: "false" },
    /**
     * Opt into the APG keyboard recommendations: each article joins the Tab sequence
     * (`tabindex="0"`, as WAI's own feed example does), Page Down/Page Up step between articles,
     * and Ctrl+Home/Ctrl+End leave the feed at either end.
     *
     * Written only when ON, the mirror of Toolbar's `loopFocus`: there the default is `true` and
     * only `"false"` is written, here the default is `false` and only `"true"` is. Either way the
     * attribute is absent exactly when the binding's own default applies, so hand-authored markup
     * and React agree without the author having to know which way the default runs.
     */
    keyboard: { type: "boolean", default: false, attr: "data-keyboard", trueValue: "true" },
    /** This article's 1-based position in the feed. */
    posInset: { type: "number", min: 1, integer: true, attr: "aria-posinset" },
    /** Total articles currently loaded (or the whole feed's length, if known). WAI allows `-1`
     *  when the true count is undetermined (an infinite-scroll feed with no known end). */
    setSize: { type: "number", min: -1, integer: true, attr: "aria-setsize" },
  },

  a11y: [
    {
      signatures: ["Feed"],
      when: { label: "absent" },
      requiresOneOf: ["label"],
      because:
        'role="feed" carries no implicit name. Without one, a screen reader enters a stream of ' +
        "articles with nothing saying what the stream is about.",
    },
  ],

  signatures: {
    Feed: {
      intent: ["content-stream", "infinite-scroll", "activity-feed", "comment-stream"],
      host: { element: "div" },
      options: ["label", "busy", "keyboard"],
      requires: ["label"],
      slots: {
        children: {
          accepts: "signature",
          required: true,
          of: ["FeedArticle"],
          /* What each article tells a screen reader ("3 of 20") has to agree across the feed. */
          positions: { posInset: "posInset", setSize: "setSize" },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "feed" },
        slot: "children",
      },
      /* Only reached when `keyboard` is on: the enhancer's first act is to read the attribute and
         return an empty teardown when it is absent. Mounting unconditionally is what keeps the
         markup one shape, so turning the option on never means also remembering a second attr. */
      mount: "data-sk-feed",
      react: { from: "@skryensya/react/feed", name: "Feed" },
    },

    FeedArticle: {
      intent: ["feed-item", "post", "comment"],
      host: { element: "article" },
      options: ["posInset", "setSize"],
      requires: ["posInset", "setSize"],
      parents: ["Feed"],
      slots: {
        /** What names this article to a screen reader. An author, a headline, a timestamp. */
        label: { accepts: "node", required: true },
        children: { accepts: "node", required: true },
      },
      template: {
        element: "article",
        part: "article",
        host: true,
        attrs: { role: "article" },
        labelledBySlot: "label",
        // A real wrapping element, not the slot placed bare: `aria-labelledby` needs a node with
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

/* ------------------------------------------------------------------------------------------------ *
 * Shared behaviour. The pure key math here, the DOM reading in `feed-dom.ts`, the imperative
 * binding in `@skryensya/vanilla` and the declarative one in `@skryensya/react`: the same split
 * `toolbar.ts` documents, and for the same reason. Two bindings that each write their own
 * "which article does Page Down mean" are two chances to disagree about it.
 * ------------------------------------------------------------------------------------------------ */

export type FeedAction =
  /** Focus the article at `index`. */
  | { readonly kind: "move"; readonly index: number }
  /** Leave the feed: focus the nearest focusable element before or after it. */
  | { readonly kind: "exit"; readonly edge: "before" | "after" }
  /** Not ours. The binding does not call `preventDefault`, so the browser still scrolls. */
  | { readonly kind: "none" };

/**
 * Which article a key moves to, given where focus is now.
 *
 * `currentIndex` is `-1` when focus is in the feed but not in any article (the root itself, or a
 * control between two of them). Page Down then means "the first one", which is what a reader
 * tabbing into an empty-ish header and pressing it expects; Page Up means nothing, because there
 * is nothing above.
 *
 * AT EITHER END, A STEP IS `none`, NOT A CLAMP TO WHERE FOCUS ALREADY IS. The binding only calls
 * `preventDefault` for an action it handles, so Page Down on the last article keeps its native
 * meaning and scrolls the page. Clamping would have swallowed the key and left the reader on a
 * feed that appears frozen. The pattern says nothing about wrapping, and a stream is not a
 * carousel, so it does not wrap either.
 */
export function resolveFeedKey(params: {
  readonly key: string;
  /** Held for the Home/End pair only. Page Down/Up with it down belong to the browser's tab strip. */
  readonly ctrlKey: boolean;
  /** Accepted beside `ctrlKey`: macOS has no Ctrl+Home convention, and Cmd+Home is the local spelling. */
  readonly metaKey?: boolean;
  readonly currentIndex: number;
  readonly itemCount: number;
}): FeedAction {
  const { key, ctrlKey, metaKey = false, currentIndex, itemCount } = params;
  if (itemCount < 1) return { kind: "none" };

  if (ctrlKey || metaKey) {
    if (key === "Home") return { kind: "exit", edge: "before" };
    if (key === "End") return { kind: "exit", edge: "after" };
    return { kind: "none" };
  }

  if (key === "PageDown") {
    const next = currentIndex + 1;
    return next < itemCount ? { kind: "move", index: next } : { kind: "none" };
  }
  if (key === "PageUp") {
    const previous = currentIndex - 1;
    return previous >= 0 ? { kind: "move", index: previous } : { kind: "none" };
  }
  return { kind: "none" };
}
