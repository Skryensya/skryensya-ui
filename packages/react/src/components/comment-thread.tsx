import { commentThreadParts, type CommentVoteState } from "@skryensya/core/comment-thread";
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Icon } from "./icon.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/**
 * Whether a composer is currently a sheet, mirroring the Vanilla enhancer's own `sheetMedia`.
 *
 * Reads `--breakpoint-desktop` off the element rather than hard-coding a width, so the two bindings
 * and the stylesheet all take the number from one place. `useState` + an effect rather than reading
 * during render: `window` does not exist while Astro renders this on the server, and a render that
 * measured the viewport would hydrate against a client that measured a different one.
 */
function useIsSheet(ref: { current: HTMLElement | null }): boolean {
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const bp = getComputedStyle(el).getPropertyValue("--breakpoint-desktop").trim() || "52rem";
    const query = window.matchMedia(`(width < ${bp})`);
    const sync = () => setSheet(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [ref]);

  return sheet;
}

/**
 * Opens and closes a `<dialog>` imperatively, because there is no declarative way to say "modal".
 *
 * `open` as a JSX prop only ever produces the non-modal, in-flow dialog; the top layer, the
 * `::backdrop`, the focus trap and the inert background all come from `showModal()`, which is a
 * method call. So this is one of the places a React binding has to reach for the DOM, and the effect
 * is the honest home for it. Closing first is required, not defensive: `showModal()` on an already
 * open dialog throws `InvalidStateError`, which is exactly what crossing the breakpoint with the box
 * open would otherwise do.
 */
function useDialogMode(
  ref: { current: HTMLDialogElement | null },
  { open, modal }: { open: boolean; modal: boolean },
): void {
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    /* Asked of the class React just rendered, not of `:modal`: the two say the same thing (the class
     * goes on exactly when this opens modally) and the class is the fact the stylesheet acts on, so
     * both layers read one state. It also works where `:modal` does not exist, which is every test
     * environment jsdom backs. */
    const isModal = box.classList.contains("sk-vaul");
    if (open && box.open && isModal === modal) return;
    if (box.open) box.close();
    if (!open) return;
    if (modal) box.showModal();
    else box.show();
  }, [ref, open, modal]);
}

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
  /** What the mobile trigger says, where the composer is a sheet. */
  composerTriggerLabel?: string;
};

export function CommentThread({
  children,
  className,
  composer,
  composerTriggerLabel = "Escribir un comentario",
  label,
  ...props
}: CommentThreadProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDialogElement>(null);
  const sheet = useIsSheet(rootRef);
  const [open, setOpen] = useState(false);

  /* In flow the composer is simply always there; as a sheet it waits behind its trigger. That is the
   * one asymmetry between the two presentations, and it is why this box ships `open` while a reply
   * box ships closed: there is nothing to close an always-visible composer back to. */
  useDialogMode(boxRef, { open: sheet ? open : true, modal: sheet });

  return (
    <div
      {...props}
      aria-label={label}
      className={cx(commentThreadParts.root, className)}
      /* The contract lands this option on the host; the binding has to as well. */
      data-composer-trigger-label={composerTriggerLabel}
      ref={rootRef}
    >
      {composer ? (
        <>
          {/*
            * ALWAYS RENDERED, never `sheet ? … : null`. Whether the trigger is SHOWN is already a
            * CSS decision (comment-thread.css: `display: none`, flipped to `inline-flex` under the
            * 52rem breakpoint), and authored markup emits it unconditionally for exactly that
            * reason. Gating the element on a JS-measured viewport made the two bindings render a
            * different DOM at the same width, which is what G2 caught; `sheet` still decides
            * MODALITY above, which is a behaviour CSS cannot make.
            */}
          <button
            /* The SAME expression the box gets (`sheet ? open : true`): in flow the composer is
             * always showing, so a trigger reporting `false` there announced the opposite of what
             * is on screen. Only as a sheet does `open` mean anything. */
            aria-expanded={sheet ? open : true}
            aria-haspopup="dialog"
            className={`${commentThreadParts.composerTrigger} sk-button sk-interactive`}
            data-size="sm"
            data-variant="ghost"
            onClick={() => setOpen(true)}
            type="button"
          >
            {composerTriggerLabel}
          </button>
          <dialog
            className={cx(commentThreadParts.composerSlot, sheet ? "sk-vaul" : undefined)}
            data-edge="block-end"
            onClose={() => setOpen(false)}
            ref={boxRef}
          >
            <div aria-hidden="true" className={commentThreadParts.sheetHandle} data-part="handle" />
            {composer}
          </dialog>
        </>
      ) : null}
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
  /** Makes the author's avatar and name one link to this profile URL. */
  profileHref?: string;
  /** Pre-formatted ("3h ago"). This component never computes relative time. */
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
  profileHref,
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

  const rootRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDialogElement>(null);
  const sheet = useIsSheet(rootRef);
  useDialogMode(boxRef, { open: replyOpen, modal: sheet });

  return (
    <article
      {...props}
      className={cx(commentThreadParts.comment, className)}
      /* The contract lands `collapseLabel` here (`attr: "data-collapse-label"`), so the binding has
       * to as well or the same tree renders two different DOMs. */
      data-collapse-label={collapseLabel}
      data-collapsible={collapsible ? "" : undefined}
      data-value={id}
      ref={rootRef}
    >
      <div className={commentThreadParts.commentSelf}>
        {profileHref === undefined ? (
          <div className={commentThreadParts.commentProfile}>
            {avatar === undefined ? null : (
              <span className={commentThreadParts.commentAvatar} data-sk-comment-avatar="">
                {avatar}
              </span>
            )}
            <div className={commentThreadParts.commentAuthor} data-sk-comment-author="">
              {author}
            </div>
          </div>
        ) : (
          <a
            className={`${commentThreadParts.commentProfile} sk-interactive`}
            href={profileHref}
          >
            {avatar === undefined ? null : (
              <span aria-hidden="true" className={commentThreadParts.commentAvatar} data-sk-comment-avatar="">
                {avatar}
              </span>
            )}
            <div className={commentThreadParts.commentAuthor} data-sk-comment-author="">
              {author}
            </div>
          </a>
        )}
        {timestamp === undefined ? null : (
          <div className={commentThreadParts.commentHeader}>
            <div className={commentThreadParts.commentTimestamp} data-sk-comment-timestamp="">
              {timestamp}
            </div>
          </div>
        )}
        <div className={commentThreadParts.commentGutter}>
          {collapsible && replies !== undefined ? (
            <button
              aria-expanded={!repliesHidden}
              className={cx(commentThreadParts.commentCollapse, "sk-button sk-interactive")}
              data-icon-only=""
              data-size="xs"
              onClick={() => setRepliesHidden((current) => !current)}
              type="button"
            >
              {/* TWO levels of `aria-hidden`, which is what the contract emits: one span wrapping
                  both faces, and one more inside each from the `icon()` helper. Neither is
                  redundant to the other for the DOM comparison, and collapsing them to one is what
                  made the bindings nest differently for the identical tree. */}
              <span aria-hidden="true">
                <span data-state="closed">
                  <span aria-hidden="true">
                    <Icon name="add" size="sm" />
                  </span>
                </span>
                <span data-state="open">
                  <span aria-hidden="true">
                    <Icon name="remove" size="sm" />
                  </span>
                </span>
              </span>
              <span className="sk-visually-hidden">{collapseLabel}</span>
            </button>
          ) : null}
        </div>
        <div className={commentThreadParts.commentContent}>
          <div className={commentThreadParts.commentBody}>{children}</div>
          {actions}
        </div>
      </div>
      {/* Outside `__self` so opening it never moves the fold control; see the contract. */}
      {replyComposer === undefined ? null : (
        <dialog
          className={cx(commentThreadParts.commentReplySlot, sheet ? "sk-vaul" : undefined)}
          data-edge="block-end"
          ref={boxRef}
        >
          <div aria-hidden="true" className={commentThreadParts.sheetHandle} data-part="handle" />
          {replyComposer}
        </dialog>
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
    <div
      {...props}
      className={cx(commentThreadParts.actions, className)}
      /* Every option this signature declares lands on its host in the contract, so it lands here
       * too. Presence-only for the booleans, which is how the emitter writes them. */
      data-deletable={deletable ? "" : undefined}
      data-delete-label={typeof deleteLabel === "string" ? deleteLabel : undefined}
      data-reply={reply ? "" : undefined}
      data-reply-label={typeof replyLabel === "string" ? replyLabel : undefined}
    >
      {children}
      {reply ? (
        <button
          aria-expanded={replyOpen}
          aria-haspopup="dialog"
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
        /* ghost + danger: quiet, and unmistakably destructive. The pair the Button contract could
           not express until emphasis and tone became separate axes; before that this was a plain
           ghost with its ink overridden in comment-thread.css. */
        <button
          className={cx(commentThreadParts.actionsDelete, "sk-button sk-interactive")}
          data-size="sm"
          data-tone="danger"
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
    <div
      {...props}
      className={cx(commentThreadParts.vote, className)}
      data-vote-down-label={typeof voteDownLabel === "string" ? voteDownLabel : undefined}
      data-vote-up-label={typeof voteUpLabel === "string" ? voteUpLabel : undefined}
      data-voted={voted}
    >
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
    <form
      className={cx(commentThreadParts.composer, className)}
      /* Both land on this host in the contract, so both land here. */
      data-cancel-label={typeof cancelLabel === "string" ? cancelLabel : undefined}
      data-cancellable={cancellable ? "" : undefined}
      data-submit-label={typeof submitLabel === "string" ? submitLabel : undefined}
      onSubmit={handleSubmit}
      ref={ref}
    >
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
          data-tone="accent"
          type="submit"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
});
