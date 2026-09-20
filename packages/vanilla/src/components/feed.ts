import { feedAttrs, resolveFeedKey } from "@skryensya/core/feed";
import { applyFeedArticleTabStops, feedArticleOf, feedArticles, feedExitTarget } from "@skryensya/core/feed-dom";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * FEED: the APG feed pattern's OPTIONAL keyboard model, and nothing else.
 *
 * Everything else a feed promises (`role`, the name, `aria-posinset`/`aria-setsize`, `aria-busy`)
 * is authored markup that needs no enhancer, which is why this file did not exist until the
 * keyboard model did. The mount is unconditional but the wiring is not: a feed without
 * `data-keyboard` is left exactly as authored, so the option really is opt-in rather than
 * "opt-in unless something happens to import this module".
 *
 * The key math is `resolveFeedKey` and the DOM reading is `feed-dom.ts`, both in core and both
 * shared with React, so neither binding decides on its own what Page Down means.
 */
function connect(root: HTMLElement): () => void {
  /* The ownership filter in `feedArticles` asks each article which feed is nearest above it, so a
     root missing its role would own nothing. Authored markup carries it; this is the same
     defensive write the Toolbar enhancer makes for the same reason. */
  root.setAttribute("role", "feed");

  if (root.dataset.keyboard !== "true") return () => {};

  const refresh = () => {
    const articles = feedArticles(root);
    applyFeedArticleTabStops(articles, true);
    return articles;
  };
  refresh();

  /*
   * ARTICLES THAT ARRIVE LATER STILL JOIN THE TAB SEQUENCE.
   *
   * An infinite feed appends posts while the reader is somewhere else entirely, usually on the
   * "load more" button BELOW the stream. Toolbar gets away with re-applying on `focusin` because
   * focus is already in the bar when its controls change; here focus is outside and moving
   * forward, so it would never re-enter to trigger that pass and the new posts would be the only
   * ones Tab could not reach. Watching the subtree is what makes "the feed grew" and "the feed is
   * navigable" the same event.
   */
  const observer = new MutationObserver(() => refresh());
  observer.observe(root, { childList: true, subtree: true });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const articles = feedArticles(root);
    const current = articles.indexOf(feedArticleOf(articles, document.activeElement) as HTMLElement);
    const action = resolveFeedKey({
      key: event.key,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      currentIndex: current,
      itemCount: articles.length,
    });
    if (action.kind === "none") return;

    if (action.kind === "exit") {
      const target = feedExitTarget(root, action.edge);
      /* Nothing focusable on that side is not an error, and it is not a reason to eat the key
         either: the reader asked to leave and the page has nowhere to send them, so let
         Ctrl+Home keep its native meaning and scroll instead. */
      if (!target) return;
      event.preventDefault();
      target.focus();
      return;
    }

    const next = articles[action.index];
    if (!next) return;
    event.preventDefault();
    next.focus();
  };

  root.addEventListener("keydown", onKeyDown);
  return () => {
    observer.disconnect();
    root.removeEventListener("keydown", onKeyDown);
    applyFeedArticleTabStops(feedArticles(root), false);
  };
}

export const mountFeed = createConnectMount({
  key: "feed",
  rootSelector: rootSelectorFor(feedAttrs),
  connect,
});
