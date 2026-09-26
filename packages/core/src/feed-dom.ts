import { tabbables } from "./focus-trap.js";

/*
 * FEED, the DOM half both bindings run. Kept out of `feed.ts` because that file is a contract the
 * compiler imports, and the compiler has no DOM. Same split as `toolbar-dom.ts`.
 *
 * Everything here answers a question ABOUT THE DOM that the two bindings must answer identically:
 * which elements are this feed's articles, which article holds focus, and where focus lands when
 * Ctrl+Home/Ctrl+End leave the stream. The key math itself is `resolveFeedKey` in `feed.ts`.
 */

/**
 * This feed's own articles, in document order.
 *
 * NOT `:scope > [role="article"]`: an author may wrap articles in a layout element, and APG's own
 * example nests figures and footers inside them. NOT a bare descendant query either, or a Feed
 * inside a Feed would lend its articles to its ancestor and both would count wrong. The rule that
 * is right in every case is ownership: an article belongs to the nearest feed above it.
 */
export function feedArticles(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[role="article"]')).filter(
    (article) => article.closest('[role="feed"]') === root,
  );
}

/**
 * The article focus is in: the element itself, or the article containing it.
 *
 * A link or a button inside a post is still "in" that post, so Page Down from a post's own Reply
 * button moves to the next post rather than doing nothing. Returns `undefined` when focus is in
 * the feed but between articles (the root itself, a toolbar above the stream).
 */
export function feedArticleOf(
  articles: readonly HTMLElement[],
  element: Element | null,
): HTMLElement | undefined {
  if (!element) return undefined;
  return articles.find((article) => article === element || article.contains(element));
}

/**
 * Puts every article in the Tab sequence, or takes them all back out.
 *
 * `tabindex="0"` on each, which is what WAI's feed example does and NOT the roving `0`/`-1` every
 * other composite in this catalogue uses. The difference is deliberate and it is the pattern's:
 * a feed is a document to read, not a widget with one value, so Tab walking post to post is the
 * correct reading order rather than a cost to collapse. Page Down is the shortcut over it.
 *
 * Off, the attribute is REMOVED rather than set to `-1`. An article that was never focusable
 * should go back to having no opinion about focus at all, so `keyboard` flipping off leaves the
 * markup exactly as a feed that never had it.
 */
export function applyFeedArticleTabStops(
  articles: readonly HTMLElement[],
  focusable: boolean,
): void {
  for (const article of articles) {
    if (focusable) article.setAttribute("tabindex", "0");
    else article.removeAttribute("tabindex");
  }
}

/**
 * The nearest focusable element before or after the feed, skipping everything inside it.
 *
 * The pattern's words are "the first focusable element before the feed" and "after the feed", so
 * this is a document-order question over the whole document, not a feed-subtree one.
 *
 * "First ... before the feed" reads as nearest, not as the document's first: the reader is leaving
 * the stream backwards and expects the control just above it, the way Shift+Tab out of the first
 * article would have got there.
 *
 * "Focusable" is `focus-trap.ts`'s `tabbables`, the kit's one tab-order list, which also explains
 * why visibility is never read from `offsetParent` (jsdom lays nothing out; a browser rejects
 * anything under `position: fixed`, which a sticky header before the feed very often is).
 */
export function feedExitTarget(
  root: HTMLElement,
  edge: "before" | "after",
): HTMLElement | undefined {
  const candidates = tabbables(root.ownerDocument.documentElement).filter(
    (element) => !root.contains(element),
  );

  if (edge === "after") {
    return candidates.find(
      (element) =>
        (root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    );
  }
  // The LAST one that precedes the feed: nearest, walking backwards.
  let nearest: HTMLElement | undefined;
  for (const element of candidates) {
    if ((root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING) === 0) break;
    nearest = element;
  }
  return nearest;
}
