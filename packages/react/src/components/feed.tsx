import { feedParts } from "@skryensya/core/feed";
import { useId, type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type FeedProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  label: string;
  /** Set while more articles are loading (an infinite-scroll fetch in flight). */
  busy?: boolean;
};

/*
 * A purely presentational stream — see `feed.ts`'s own banner for why: WAI-ARIA APG says the
 * `feed` role has no well-established keyboard convention, so there is no machine here to run.
 */
export function Feed({ busy = false, children, className, label, ...props }: FeedProps) {
  return (
    <div {...props} aria-busy={busy} aria-label={label} className={cx(feedParts.root, className)} role="feed">
      {children}
    </div>
  );
}

export type FeedArticleProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  /** Names this article — an author, a headline, a timestamp. Rendered, not just referenced. */
  label: ReactNode;
  /** This article's 1-based position in the feed. */
  posInset: number;
  /** Total articles currently loaded, or the whole feed's length if known. `-1` when the true
   *  count is undetermined (an infinite-scroll feed with no known end), per WAI's own allowance. */
  setSize: number;
};

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
