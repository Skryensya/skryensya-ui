import { commentThreadParts, type CommentVoteState } from "@skryensya/core/comment-thread";
import { forwardRef, useState, type FormEvent, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "./icon.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * Five components, not one: see `comment-thread.ts`'s own banner for why. Callbacks live on the
 * piece that owns the control (`CommentVote` takes `onVote`, `CommentActions` takes `onReply` and
 * `onDelete`) rather than being threaded down through a recursive data prop, which is what lets a
 * consumer close over their own comment id instead of this component plumbing one for them.
 */

export type CommentThreadProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  /** The thread's accessible name. */
  label: string;
  /** The "post a new top-level comment" box. Omitted renders none. */
  composer?: ReactNode;
};

export function CommentThread({ children, className, composer, label, ...props }: CommentThreadProps) {
  return (
    <div {...props} aria-label={label} className={cx(commentThreadParts.root, className)}>
      {composer ? <div className={commentThreadParts.composerSlot}>{composer}</div> : null}
      {children}
    </div>
  );
}

export type CommentProps = Omit<HTMLAttributes<HTMLElement>, "children" | "id"> & {
  children: ReactNode;
  /** The person, in the gutter. Structural, not decoration: the thread line descends from it. */
  avatar?: ReactNode;
  /** The name. The avatar is its own prop above, not part of this one. */
  author: ReactNode;
  /** Pre-formatted ("hace 3h"). This component never computes relative time. */
  timestamp?: ReactNode;
  /** This comment's identity, for whatever the consumer's own handlers report back. */
  id?: string;
  /** Gives this comment a fold control. Off by default; the simplest comment has none. */
  collapsible?: boolean;
  collapseLabel?: string;
  /** The action row, usually a `CommentActions`. */
  actions?: ReactNode;
  /** This comment's own replies: more `Comment`s. */
  replies?: ReactNode;
  /** A composer the reply trigger opens. Pass `replyOpen` to control it, or let the row's own
   *  trigger drive it through `CommentActions`. */
  replyComposer?: ReactNode;
  /** Whether the reply composer shows. Uncontrolled when omitted. */
  replyOpen?: boolean;
};

export function Comment({
  actions,
  author,
  avatar,
  children,
  className,
  collapseLabel = "Ocultar respuestas",
  collapsible = false,
  id,
  replies,
  replyComposer,
  replyOpen = false,
  timestamp,
  ...props
}: CommentProps) {
  /* Folds the REPLIES, not the comment. A thread gets long because of what hangs off a comment, not
   * because of the comment itself, and hiding what someone said in order to skip past the argument
   * under it loses the thing you were reading to find. */
  const [repliesHidden, setRepliesHidden] = useState(false);

  return (
    <article
      {...props}
      className={cx(commentThreadParts.comment, className)}
      data-collapsible={collapsible ? "" : undefined}
      data-value={id}
    >
      <div className={commentThreadParts.commentSelf}>
        <div className={commentThreadParts.commentGutter}>
          {avatar === undefined ? null : (
            <span className={commentThreadParts.commentAvatar} data-sk-comment-avatar="">
              {avatar}
            </span>
          )}
          {collapsible && replies !== undefined ? (
            <button
              aria-expanded={!repliesHidden}
              className={cx(commentThreadParts.commentCollapse, "sk-button sk-interactive")}
              data-icon-only=""
              data-size="sm"
              onClick={() => setRepliesHidden((current) => !current)}
              type="button"
            >
              <span aria-hidden="true">
                <span data-state="closed">
                  <Icon name="add" size="sm" />
                </span>
                <span data-state="open">
                  <Icon name="remove" size="sm" />
                </span>
              </span>
              <span className="sk-visually-hidden">{collapseLabel}</span>
            </button>
          ) : null}
        </div>
        <div className={commentThreadParts.commentContent}>
          <div className={commentThreadParts.commentHeader}>
            <div className={commentThreadParts.commentAuthor} data-sk-comment-author="">
              {author}
            </div>
            {timestamp === undefined ? null : (
              <div className={commentThreadParts.commentTimestamp} data-sk-comment-timestamp="">
                {timestamp}
              </div>
            )}
          </div>
          <div className={commentThreadParts.commentBody}>{children}</div>
          {actions}
        </div>
      </div>
      {/* Outside `__self` so opening it never moves the fold control; see the contract. */}
      {replyComposer === undefined ? null : (
        <div className={commentThreadParts.commentReplySlot} hidden={!replyOpen}>
          {replyComposer}
        </div>
      )}
      {replies === undefined ? null : (
        <div className={commentThreadParts.commentReplies} hidden={repliesHidden}>
          {replies}
        </div>
      )}
    </article>
  );
}

export type CommentActionsProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Whatever leads the row. A `CommentVote`, a Badge, a timestamp. */
  children?: ReactNode;
  /** Renders the reply trigger. */
  reply?: boolean;
  replyLabel?: ReactNode;
  onReply?: () => void;
  /** Whether the reply box this row's trigger opens is showing. */
  replyOpen?: boolean;
  /** Renders the delete trigger. Ownership is the consumer's to decide. */
  deletable?: boolean;
  deleteLabel?: ReactNode;
  onDelete?: () => void;
};

export function CommentActions({
  children,
  className,
  deletable = false,
  deleteLabel = "Eliminar",
  onDelete,
  onReply,
  reply = false,
  replyLabel = "Responder",
  replyOpen = false,
  ...props
}: CommentActionsProps) {
  return (
    <div {...props} className={cx(commentThreadParts.actions, className)}>
      {children}
      {reply ? (
        <button
          aria-expanded={replyOpen}
          className={cx(commentThreadParts.actionsReply, "sk-button sk-interactive")}
          data-size="sm"
          data-variant="ghost"
          onClick={onReply}
          type="button"
        >
          {replyLabel}
        </button>
      ) : null}
      {deletable ? (
        <button
          className={cx(commentThreadParts.actionsDelete, "sk-button sk-interactive")}
          data-size="sm"
          data-variant="ghost"
          onClick={onDelete}
          type="button"
        >
          <span aria-hidden="true">
            <Icon name="delete" size="md" />
          </span>
          <span>{deleteLabel}</span>
        </button>
      ) : null}
    </div>
  );
}

export type CommentVoteProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
  /** The tally, pre-formatted and rendered as-is. */
  count: ReactNode;
  /** The viewer's own past vote. Never inferred from the count. */
  voted?: CommentVoteState;
  voteUpLabel?: string;
  voteDownLabel?: string;
  onVote?: (direction: "up" | "down") => void;
};

export function CommentVote({
  className,
  count,
  onVote,
  voteDownLabel = "Votar en contra",
  voteUpLabel = "Votar a favor",
  voted = "none",
  ...props
}: CommentVoteProps) {
  return (
    <div {...props} className={cx(commentThreadParts.vote, className)} data-voted={voted}>
      <button
        aria-pressed={voted === "up"}
        className={cx(commentThreadParts.voteUp, "sk-button sk-interactive")}
        data-icon-only=""
        data-size="sm"
        data-variant="ghost"
        onClick={() => onVote?.("up")}
        type="button"
      >
        <span aria-hidden="true">
          <Icon name="vote-up" size="md" />
        </span>
        <span className="sk-visually-hidden">{voteUpLabel}</span>
      </button>
      <span className={commentThreadParts.voteCount}>{count}</span>
      <button
        aria-pressed={voted === "down"}
        className={cx(commentThreadParts.voteDown, "sk-button sk-interactive")}
        data-icon-only=""
        data-size="sm"
        data-variant="ghost"
        onClick={() => onVote?.("down")}
        type="button"
      >
        <span aria-hidden="true">
          <Icon name="vote-down" size="md" />
        </span>
        <span className="sk-visually-hidden">{voteDownLabel}</span>
      </button>
    </div>
  );
}

export type CommentTemplateProps = {
  /** One `Comment`, as the blueprint every runtime-created one is cloned from. */
  children: ReactNode;
};

/*
 * The `<template>` a consumer clones to add a comment at runtime; see `comment-thread.ts` for why
 * this is a blueprint rather than a `renderComment(data)`. Inert in React, which re-renders instead,
 * and shipped anyway so a tree authored once means the same thing in both bindings.
 */
export function CommentTemplate({ children }: CommentTemplateProps) {
  return <template>{children}</template>;
}

export type CommentComposerProps = {
  /** Any control at all: a FormField around a Textarea, a bare Input, an Editor. This component
   *  ships none of them, which is the whole point of it being a slot. */
  children: ReactNode;
  className?: string;
  submitLabel?: ReactNode;
  /** Renders the cancel control. An always-open composer has nothing to cancel back to. */
  cancellable?: boolean;
  cancelLabel?: ReactNode;
  /** The written body, already trimmed. Nothing is submitted when it is empty. */
  onSubmit?: (body: string) => void;
  /**
   * Cancel pressed. `body` is what was written, already trimmed: empty means there was nothing to
   * lose, and anything else means a draft is at stake and the consumer should confirm before
   * closing. This component asks nothing on its own, the same restraint delete keeps.
   */
  onCancel?: (body: string) => void;
};

/*
 * Reads the written body by querying the control the consumer passed, rather than by a ref or a
 * name they have to wire: the same technique the Vanilla enhancer uses on its own delegated
 * `submit` listener, so both bindings read a reply the same way whatever control is inside.
 */
export const CommentComposer = forwardRef<HTMLFormElement, CommentComposerProps>(function CommentComposer(
  { cancelLabel = "Cancelar", cancellable = false, children, className, onCancel, onSubmit, submitLabel = "Publicar" },
  ref,
) {
  const read = (form: HTMLFormElement) => {
    const control = form.querySelector<HTMLTextAreaElement | HTMLInputElement>(
      "textarea, input:not([type=submit])",
    );
    return (control?.value ?? "").trim();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = read(form);
    if (!body) return;
    onSubmit?.(body);
    form.reset();
  };

  return (
    <form className={cx(commentThreadParts.composer, className)} onSubmit={handleSubmit} ref={ref}>
      {children}
      <div className={commentThreadParts.composerActions}>
        {cancellable ? (
          <button
            className={cx(commentThreadParts.composerCancel, "sk-button sk-interactive")}
            data-size="sm"
            data-variant="ghost"
            onClick={(event) => onCancel?.(read(event.currentTarget.form!))}
            type="button"
          >
            {cancelLabel}
          </button>
        ) : null}
        <button
          className={cx(commentThreadParts.composerSubmit, "sk-button sk-interactive")}
          data-size="sm"
          data-variant="accent"
          type="submit"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
});
