import { feedParts, feedContract, resolveFeedKey } from "@skryensya/core/feed";
import { applyFeedArticleTabStops, feedArticleOf, feedArticles, feedExitTarget } from "@skryensya/core/feed-dom";
import { useEffect, useId, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";

/* Derived, never restated: the defaults live in the contract. */
const { busy: busyOption, keyboard: keyboardOption } = feedContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type FeedProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  label: string;
  /** Set while more articles are loading (an infinite-scroll fetch in flight). */
  busy?: boolean;
  /**
   * Opt into the APG keyboard recommendations: articles join the Tab sequence, Page Down/Page Up
   * step between them, Ctrl+Home/Ctrl+End leave the feed. Off by default; see `feed.ts` for why
   * the pattern makes this a recommendation rather than a requirement.
   */
  keyboard?: boolean;
};

/*
 * The keyboard half is core's, not this file's: `resolveFeedKey` decides what a key means and
 * `feed-dom.ts` decides which elements are this feed's articles and where Ctrl+Home lands. Both
 * are the very same functions the Vanilla enhancer calls, which is the whole point. Toolbar's own
 * history is the argument: the two bindings each hand-wrote the identical index math, React's file
 * claiming it "mirrors exactly" vanilla's so the two "can never disagree", and that was a
 * statement about discipline rather than about the code being one copy.
 */
export function Feed({
  busy = busyOption.default,
  children,
  className,
  keyboard = keyboardOption.default,
  label,
  ...props
}: FeedProps) {
  const ref = useRef<HTMLDivElement>(null);

  /*
   * Every render, with no dependency array, the same choice Toolbar makes: children ARE the
   * article list, so a feed that just loaded ten more posts has ten elements that need to join
   * the Tab sequence and no prop changed to say so. This is what the Vanilla enhancer needs a
   * MutationObserver for; here the render IS the notification.
   */
  useEffect(() => {
    if (ref.current) applyFeedArticleTabStops(feedArticles(ref.current), keyboard);
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event);
    if (!keyboard || event.defaultPrevented || !ref.current) return;
    const articles = feedArticles(ref.current);
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
      const target = feedExitTarget(ref.current, action.edge);
      /* Nowhere to go is not a reason to eat the key: let it keep its native meaning and scroll. */
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

  return (
    <div
      {...props}
      aria-busy={busy}
      aria-label={label}
      className={cx(feedParts.root, className)}
      /* Written only when on, so the attribute is absent exactly when the default applies and
         authored markup and React agree without either knowing which way the default runs. */
      data-keyboard={keyboard ? "true" : undefined}
      onKeyDown={onKeyDown}
      ref={ref}
      role="feed"
    >
      {children}
    </div>
  );
}

export type FeedArticleProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  /** Names this article. An author, a headline, a timestamp. Rendered, not just referenced. */
  label: ReactNode;
  /** This article's 1-based position in the feed. */
  posInset: number;
  /** Total articles currently loaded, or the whole feed's length if known. `-1` when the true
   *  count is undetermined (an infinite-scroll feed with no known end), per WAI's own allowance. */
  setSize: number;
};

/*
 * No `keyboard` prop and no context reading it: whether an article is focusable is written onto
 * the DOM by the Feed above it, through the same `applyFeedArticleTabStops` the enhancer calls.
 * A prop here would be a second source of truth for one fact, and the binding that got it from
 * context would be the only one of the two doing it that way.
 */
export function FeedArticle({ children, className, label, posInset, setSize, ...props }: FeedArticleProps) {
  const labelId = useId();
  return (
    <article
      {...props}
      aria-labelledby={labelId}
      aria-posinset={posInset}
      aria-setsize={setSize}
      className={cx(feedParts.article, className)}
      role="article"
    >
      <div className={feedParts.articleLabel} id={labelId}>
        {label}
      </div>
      {children}
    </article>
  );
}
