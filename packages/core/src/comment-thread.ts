import type { ComponentContract } from "./contract.js";

/*
 * COMMENT THREAD, as five pieces rather than one component with everything folded into it.
 *
 * `Comment` alone is the simplest thing here: an author, when they said it, and what they said. It
 * needs no thread around it, which is the point - quoting one comment somewhere else in an app is a
 * real thing to want, and a signature that could only exist as an entry of a collection could not
 * do it. `CommentActions`, `CommentVote` and `CommentComposer` are each their own signature for the
 * same reason: a read-only comment should not drag chrome it never renders, and WHO may vote, reply
 * or delete is composition rather than a handful of flags on one monolith.
 *
 * REPLIES RECURSE BY COMPOSITION, not as a data collection: `Comment.replies` accepts `Comment`,
 * the same self-referencing signature slot `NavListLink.nested` already takes for its own
 * sub-destinations. That is what lets EVERY slot at EVERY depth take composed content - an Avatar
 * beside the name, rich text in the body - which a collection could not: a collection entry is
 * DATA, and the React emitter can only literal-serialize data, so a composed subtree inside one
 * silently flattened to its text (`flattenItem`). The cost is honest and stated here: rendering a
 * thread from an API means the consumer writes the recursive map themselves. There is no one-prop
 * shortcut, deliberately.
 *
 * NO `role="feed"`, NO `role="tree"`, NO `<ol>`/`<li>` scaffolding. WAI's feed pattern is linear and
 * pairs with infinite-scroll paging (`aria-posinset`/`aria-setsize` over the whole loaded set); WAI's
 * tree pattern is a SELECTABLE roving-tabindex collection, and comments are read-only content with
 * actions, not a picklist. What is left is what HTML already had: nested `<article>`, the spec's own
 * worked example for a comment thread. `docs/aria-apg-audit.md`'s prior finding on `TreeView` is why
 * no `aria-level` is hand-authored either - the tree pattern requires explicit level/posinset/setsize
 * only when the full tree is NOT in the DOM (virtualized), and when it is, the browser computes the
 * hierarchy from real nesting. `Treegrid` had to author level because a flat `<tr>` cannot nest; an
 * `<article>` can. Dropping the list scaffolding is also what makes `Comment` valid standalone: an
 * `<li>` outside a list is not.
 *
 * THE COMPOSER SHIPS NO INPUT. Its `children` slot takes any signature at all - no `of` - exactly
 * as `FormField`'s own children slot does, and for the same reason that file gives: naming the one
 * control it usually holds makes the name a lie the first time it holds another. A plain field, a
 * Textarea, an Editor: all of them are the consumer's to pass, and none of them is this contract's
 * to decide.
 *
 * EVERY CONTROL IS A REAL `sk-button`. The face, the radius, the focus ring, the state paint and the
 * touch target come from `button.css`; the only thing these parts move is the `--sk-button-fg` tone,
 * because a comment's chrome must not read louder than the comment.
 *
 * BEHAVIOUR is the bindings' (`comment-thread.ts` in vanilla, `comment-thread.tsx` in React) and the
 * consumer's: this contract never calls a network, never persists a draft, never resolves an
 * `@`-mention. Vote/reply/delete hand every action back out.
 */

export const commentThreadParts = {
  /** The thread container. */
  root: "sk-comment-thread",
  composerSlot: "sk-comment-thread__composer-slot",

  comment: "sk-comment",
  commentSelf: "sk-comment__self",
  commentContent: "sk-comment__content",
  commentGutter: "sk-comment__gutter",
  commentAvatar: "sk-comment__avatar",
  commentHeader: "sk-comment__header",
  commentAuthor: "sk-comment__author",
  commentTimestamp: "sk-comment__timestamp",
  commentCollapse: "sk-comment__collapse",
  commentBody: "sk-comment__body",
  commentReplies: "sk-comment__replies",
  commentReplySlot: "sk-comment__reply-slot",

  actions: "sk-comment-actions",
  actionsReply: "sk-comment-actions__reply",
  actionsDelete: "sk-comment-actions__delete",

  vote: "sk-comment-vote",
  voteUp: "sk-comment-vote__up",
  voteDown: "sk-comment-vote__down",
  voteCount: "sk-comment-vote__count",

  composer: "sk-comment-composer",
  composerActions: "sk-comment-composer__actions",
  composerCancel: "sk-comment-composer__cancel",
  composerSubmit: "sk-comment-composer__submit",
} as const;

export type CommentThreadPart = keyof typeof commentThreadParts;
export type CommentThreadPartClass = (typeof commentThreadParts)[CommentThreadPart];

export const commentThreadAttrs = {
  root: "data-sk-comment-thread",
  comment: "data-sk-comment",
  collapse: "data-sk-comment-collapse",
  /*
   * The FILLABLE slots, addressable the same way the rest already is. A consumer building a comment
   * at runtime (clone a `CommentTemplate`, write the fields, mount) needs to find these, and without
   * them the only handle was the part class - `.sk-comment__author` - which is the stylesheet's, not
   * the contract's, and moves whenever the paint does. Data attributes address, part classes paint:
   * that split was already this file's convention and these three were simply missing from it.
   */
  avatar: "data-sk-comment-avatar",
  author: "data-sk-comment-author",
  timestamp: "data-sk-comment-timestamp",
  body: "data-sk-comment-body",
  replies: "data-sk-comment-replies",
  replySlot: "data-sk-comment-reply-slot",
  actions: "data-sk-comment-actions",
  reply: "data-sk-comment-reply",
  delete: "data-sk-comment-delete",
  vote: "data-sk-comment-vote",
  voteUp: "data-sk-comment-vote-up",
  voteDown: "data-sk-comment-vote-down",
  voteCount: "data-sk-comment-vote-count",
  composer: "data-sk-comment-composer",
  composerCancel: "data-sk-comment-composer-cancel",
  composerSubmit: "data-sk-comment-composer-submit",
} as const;

export type CommentThreadAttr = keyof typeof commentThreadAttrs;
export type CommentThreadAttrName = (typeof commentThreadAttrs)[CommentThreadAttr];

/** One viewer's own vote on one comment. Never derived from the count. */
export type CommentVoteState = "up" | "down" | "none";

/**
 * What the Vanilla enhancer re-announces on the thread root, mirroring `checkboxGroupEvents`
 * (`selection.ts`): a plain-DOM enhancer has no machine to hand a consumer a typed callback from,
 * so it dispatches and the consumer's own listener does the rest.
 */
export const commentThreadEvents = {
  vote: "sk:commentvote",
  reply: "sk:commentreply",
  delete: "sk:commentdelete",
  /**
   * Cancel pressed on a composer that HAS something written in it. An empty one just closes - there
   * is nothing to lose and asking would be a dialog about nothing - so this only ever fires when a
   * draft is actually at stake, and the consumer decides whether to confirm before it goes.
   */
  discard: "sk:commentdiscard",
} as const;

/**
 * Writes a vote onto a rendered `CommentVote`, after the consumer's own logic (or their server) has
 * decided what it should now be. The enhancer never does this itself: the count and the viewer's own
 * vote are the consumer's data, not the component's, which is the same split `CheckboxGroup` keeps.
 *
 * It exists because THREE things have to agree and nothing was enforcing it: `data-voted` paints the
 * accent, and the two buttons' `aria-pressed` announce the state. Written by hand they drifted apart
 * twice during this component's own development - once painting a vote a screen reader called
 * unpressed, once the reverse. Mirrors `setIconState` (`icon-state-button.ts`), which is the same
 * shape for the same reason: a small imperative helper for a consumer's own behaviour script.
 *
 * `count` is left alone when omitted, so a consumer who only wants to move the highlight can.
 */
export function setCommentVote(
  group: HTMLElement,
  state: { voted: CommentVoteState; count?: string },
): void {
  group.dataset.voted = state.voted;
  const up = group.querySelector(`[${commentThreadAttrs.voteUp}]`);
  const down = group.querySelector(`[${commentThreadAttrs.voteDown}]`);
  up?.setAttribute("aria-pressed", String(state.voted === "up"));
  down?.setAttribute("aria-pressed", String(state.voted === "down"));
  if (state.count === undefined) return;
  const output = group.querySelector(`[${commentThreadAttrs.voteCount}]`);
  if (output) output.textContent = state.count;
}

export type CommentVoteDetails = { id: string | null; direction: "up" | "down" };
export type CommentReplyDetails = { parentId: string | null; body: string };
export type CommentDeleteDetails = { id: string | null };
/** `parentId` is the comment being answered, or `null` for a thread's own composer. */
export type CommentDiscardDetails = { parentId: string | null; body: string };

/** The icon-only `sm` Button shape every control here wears. */
const iconButtonAttrs = { "data-icon-only": "", "data-size": "sm", "data-variant": "ghost" } as const;
const textButtonAttrs = { "data-size": "sm", "data-variant": "ghost" } as const;

/**
 * A decorative glyph, wrapped so the button's own accessible name is the only one announced. `md`
 * because that is the glyph a `sm` Button paints (`button.css` sizes `.sk-button[data-size="sm"]
 * .sk-icon` at `--size-icon-md`); saying `sm` here drew a 16px placeholder that jumped on mount.
 */
const icon = (name: string, size: "sm" | "md" = "md") => ({
  element: "span",
  attrs: { "aria-hidden": "true" },
  children: [{ element: "span", attrs: { "data-sk-icon": name, "data-sk-icon-size": size } }],
});

export const commentThreadContract = {
  id: "comment-thread",
  css: "@skryensya/core/components/comment-thread.css",
  parts: commentThreadParts,

  options: {
    /** The thread's accessible name. A thread with no name is a stack of text with no subject. */
    label: { type: "string", attr: "aria-label" },
    /** This comment's identity, reported back by whichever action fires. */
    commentId: { type: "string", prop: "id", attr: "data-value" },
    /**
     * Gives this comment a fold control. Off by default: the simplest comment is an author, a time
     * and a body, and a chevron on a comment nobody can fold is chrome with nothing behind it. Same
     * shape `NavListGroup.collapsible` already takes for its own disclosure.
     */
    collapsible: { type: "boolean", default: false, attr: "data-collapsible", trueValue: "" },
    collapseLabel: { type: "string", default: "Ocultar respuestas", attr: "data-collapse-label" },
    /** The viewer's own past vote. Painted from the group, never inferred from the count. */
    voted: { type: "enum", values: ["up", "down", "none"], default: "none", attr: "data-voted" },
    voteUpLabel: { type: "string", default: "Votar a favor", attr: "data-vote-up-label" },
    voteDownLabel: { type: "string", default: "Votar en contra", attr: "data-vote-down-label" },
    /** Renders the reply trigger. Absent, the row simply has no reply control. */
    reply: { type: "boolean", default: false, attr: "data-reply", trueValue: "" },
    replyLabel: { type: "string", default: "Responder", attr: "data-reply-label" },
    /** Renders the delete trigger. Ownership is the consumer's to decide, not this contract's. */
    deletable: { type: "boolean", default: false, attr: "data-deletable", trueValue: "" },
    deleteLabel: { type: "string", default: "Eliminar", attr: "data-delete-label" },
    submitLabel: { type: "string", default: "Publicar", attr: "data-submit-label" },
    /** Renders the composer's cancel control. A thread's own always-open composer has nothing to
     *  cancel back to, so this is opt-in rather than always there. */
    cancellable: { type: "boolean", default: false, attr: "data-cancellable", trueValue: "" },
    cancelLabel: { type: "string", default: "Cancelar", attr: "data-cancel-label" },
  },

  signatures: {
    /*
     * The container. Holds the top-level comments and, when a viewer may post, one composer.
     */
    CommentThread: {
      intent: ["comment-thread", "threaded-replies", "nested-comments", "discussion"],
      host: { element: "div" },
      options: ["label"],
      requires: ["label"],
      mount: commentThreadAttrs.root,
      slots: {
        /** The "post a new top-level comment" box. Absent when the viewer cannot post. */
        composer: { accepts: "signature", of: ["CommentComposer"] },
        children: { accepts: "signature", required: true, of: ["Comment"] },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "div", part: "composerSlot", whenGiven: "composer", slot: "composer" },
          { slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/comment-thread", name: "CommentThread" },
    },

    /*
     * ONE COMMENT, and the simplest piece of the set: it needs no thread, no actions and no replies
     * to be complete. Everything past the author, the time and the body is a slot the consumer
     * either fills or does not.
     */
    Comment: {
      intent: ["comment", "reply", "post", "discussion-entry"],
      host: { element: "article" },
      options: ["commentId", "collapsible", "collapseLabel"],
      parents: ["CommentThread", "Comment", "CommentTemplate"],
      slots: {
        /**
         * The person, in the gutter. Its OWN slot rather than something composed into `author`,
         * because here it is STRUCTURAL and not decoration: the thread line descends from the
         * avatar down to the replies, so the template has to know where it is. A slot the author
         * fills with whatever they want (an `Avatar`, an initial, a status dot), just in a place
         * the layout can rely on. Optional: with no avatar the gutter carries only the fold
         * control, and with neither it collapses to nothing.
         */
        avatar: { accepts: "node" },
        /** The name. Free composition; the avatar is its own slot above, not part of this one. */
        author: { accepts: "node", required: true },
        /** Pre-formatted ("hace 3h"). This contract never computes relative time, nor owns its i18n. */
        timestamp: { accepts: "text" },
        children: { accepts: "node", required: true },
        /** The action row, usually a `CommentActions`. `node`, so any chrome at all can sit here. */
        actions: { accepts: "node" },
        /** This comment's own replies. The same signature, one level down. */
        replies: { accepts: "signature", of: ["Comment"] },
        /** A composer the reply trigger opens, hidden until it does. */
        replyComposer: { accepts: "signature", of: ["CommentComposer"] },
      },
      mount: commentThreadAttrs.comment,
      /*
       * `__self` WRAPS the comment's own row - gutter plus everything it says - and the replies sit
       * outside it. That split is what lets the thread line span exactly the right thing: the gutter
       * is a flex sibling of the content, so it stretches to the content's height on its own, and
       * the line drawn in it stops where the comment stops instead of running down through the
       * replies. Each reply then draws its OWN incoming segment and elbow (see comment-thread.css),
       * all sharing the parent avatar's centre line, which is how the rail stays continuous at any
       * depth without anything measuring anything.
       *
       * The earlier attempt hung the line off the article with `grid-row: 1 / -1`, which does not
       * span implicit rows: `-1` resolves to line 1 when no rows are explicit, so the gutter
       * measured 72px inside a 228px comment and the line stopped above the body.
       */
      template: {
        element: "article",
        part: "comment",
        host: true,
        children: [
          {
            element: "div",
            part: "commentSelf",
            children: [
              {
                element: "div",
                part: "commentGutter",
                children: [
                  {
                    element: "span",
                    part: "commentAvatar",
                    mount: commentThreadAttrs.avatar,
                    whenGiven: "avatar",
                    slot: "avatar",
                  },
                  /*
                   * TWO conditions, expressed as a node inside a node because each template node
                   * carries one: the outer asks "are there replies?", the inner "did the author ask
                   * for a fold control?". It adds no element (a node with no `element` puts its
                   * children where it stands), so the AND costs nothing in the DOM. A control that
                   * folds replies must not exist where there are none - it would be a handle
                   * attached to nothing, and clicking it would do nothing visible.
                   */
                  {
                    whenGiven: "replies",
                    children: [{
                    element: "button",
                    part: "commentCollapse",
                    /* The BASE variant, not `ghost`: this control sits ON the line, so it needs an
                     * opaque fill to interrupt it and read as a node rather than be crossed out.
                     * Ghost's own `--sk-button-bg: transparent` also out-specifies any override a
                     * component could write (`.sk-button[data-variant="ghost"]` is 0,2,0), so
                     * asking for the filled face by NOT asking for ghost is the honest way to get
                     * it. Pill radius because a node on a line is a dot, not a rounded square. */
                    also: ["sk-button", "sk-interactive"],
                    mount: commentThreadAttrs.collapse,
                    whenGiven: "collapsible",
                    attrs: { type: "button", "aria-expanded": "true", "data-icon-only": "", "data-size": "sm" },
                    children: [
                      {
                        element: "span",
                        attrs: { "aria-hidden": "true" },
                        children: [
                          /* `sm` from the SET, not a size computed in CSS: the fold node is smaller
                           * than any Button face, and sizing its glyph with a ratio meant the icon
                           * stopped being one of the scale's own steps. */
                          { element: "span", attrs: { "data-state": "closed" }, children: [icon("add", "sm")] },
                          { element: "span", attrs: { "data-state": "open" }, children: [icon("remove", "sm")] },
                        ],
                      },
                      { element: "span", also: ["sk-visually-hidden"], textFromOption: "collapseLabel" },
                    ],
                    }],
                  },
                ],
              },
              {
                element: "div",
                part: "commentContent",
                children: [
                  {
                    element: "div",
                    part: "commentHeader",
                    children: [
                      { element: "div", part: "commentAuthor", mount: commentThreadAttrs.author, slot: "author" },
                      {
                        element: "div",
                        part: "commentTimestamp",
                        mount: commentThreadAttrs.timestamp,
                        whenGiven: "timestamp",
                        slot: "timestamp",
                      },
                    ],
                  },
                  { element: "div", part: "commentBody", mount: commentThreadAttrs.body, slot: "children" },
                  { whenGiven: "actions", slot: "actions" },
                ],
              },
            ],
          },
          /*
           * OUTSIDE `__self`, between the comment and its replies. Inside it, opening the box grew
           * the comment's own row, and the fold control - which rides at the bottom of the gutter,
           * level with the actions - was dragged down with it: measured at 188px of travel under the
           * cursor that had just pressed Reply. Out here the box changes nothing about the comment's
           * own height, so the control stays where the reader left it. It is also where a reply in
           * progress belongs: after what is being answered, before what has already been said.
           */
          {
            element: "div",
            part: "commentReplySlot",
            mount: commentThreadAttrs.replySlot,
            whenGiven: "replyComposer",
            attrs: { hidden: "" },
            slot: "replyComposer",
          },
          {
            element: "div",
            part: "commentReplies",
            mount: commentThreadAttrs.replies,
            whenGiven: "replies",
            slot: "replies",
          },
        ],
      },
      react: { from: "@skryensya/react/comment-thread", name: "Comment" },
    },

    /*
     * THE ACTION ROW. Reply and delete are options because their triggers carry the mount hooks the
     * enhancer answers to; anything else a consumer wants in the row goes through `children`, which
     * is also where a `CommentVote` sits.
     */
    CommentActions: {
      intent: ["comment-actions", "vote-reply-delete", "action-row"],
      host: { element: "div" },
      options: ["reply", "replyLabel", "deletable", "deleteLabel"],
      slots: {
        /** Whatever leads the row. A `CommentVote`, a Badge, a timestamp. */
        children: { accepts: "node" },
      },
      mount: commentThreadAttrs.actions,
      template: {
        element: "div",
        part: "actions",
        host: true,
        children: [
          { whenGiven: "children", slot: "children" },
          {
            element: "button",
            part: "actionsReply",
            also: ["sk-button", "sk-interactive"],
            mount: commentThreadAttrs.reply,
            whenGiven: "reply",
            attrs: { type: "button", "aria-expanded": "false", ...textButtonAttrs },
            textFromOption: "replyLabel",
          },
          {
            element: "button",
            part: "actionsDelete",
            also: ["sk-button", "sk-interactive"],
            mount: commentThreadAttrs.delete,
            whenGiven: "deletable",
            attrs: { type: "button", ...textButtonAttrs },
            children: [icon("delete"), { element: "span", textFromOption: "deleteLabel" }],
          },
        ],
      },
      react: { from: "@skryensya/react/comment-thread", name: "CommentActions" },
    },

    /*
     * THE VOTE GROUP, its own signature so it can be used outside a comment at all - the same
     * up/count/down cluster answers for a poll or a suggestion just as readily.
     */
    CommentVote: {
      intent: ["vote", "upvote-downvote", "score"],
      host: { element: "div" },
      options: ["voted", "voteUpLabel", "voteDownLabel"],
      slots: {
        /** The tally, pre-formatted. Visible text, so a slot: an option only ever becomes an attribute. */
        count: { accepts: "text", required: true },
      },
      mount: commentThreadAttrs.vote,
      template: {
        element: "div",
        part: "vote",
        host: true,
        children: [
          {
            element: "button",
            part: "voteUp",
            also: ["sk-button", "sk-interactive"],
            mount: commentThreadAttrs.voteUp,
            attrs: { type: "button", ...iconButtonAttrs },
            /* `aria-pressed` tracks the option, so authored markup announces the viewer's own vote
             * instead of always saying "not pressed". The PAINT reads `data-voted` off the group
             * (see comment-thread.css): a static `aria-pressed` was why an already-voted comment
             * looked unvoted everywhere except React. */
            attrsWhen: [{ option: "voted", equals: "up", attrs: { "aria-pressed": "true" } }],
            children: [icon("vote-up"), { element: "span", also: ["sk-visually-hidden"], textFromOption: "voteUpLabel" }],
          },
          { element: "span", part: "voteCount", mount: commentThreadAttrs.voteCount, slot: "count" },
          {
            element: "button",
            part: "voteDown",
            also: ["sk-button", "sk-interactive"],
            mount: commentThreadAttrs.voteDown,
            attrs: { type: "button", ...iconButtonAttrs },
            attrsWhen: [{ option: "voted", equals: "down", attrs: { "aria-pressed": "true" } }],
            children: [icon("vote-down"), { element: "span", also: ["sk-visually-hidden"], textFromOption: "voteDownLabel" }],
          },
        ],
      },
      react: { from: "@skryensya/react/comment-thread", name: "CommentVote" },
    },

    /*
     * A BLUEPRINT for a comment the app will create later, and the answer to "how does a Vanilla
     * consumer add a reply without hand-building one". `ToastTemplate` (`content.ts`) is the same
     * signature for the same reason, and the shape a consumer follows is the same too: author one
     * `Comment` inside this, clone `template.content.firstElementChild`, write the fields through
     * the `data-sk-comment-*` hooks, append it, then mount the new subtree (`initComponents`).
     *
     * A blueprint rather than a `renderComment(data)` on purpose. This system's line is that the
     * CONTRACT defines markup and a binding only patches attributes on markup that already exists;
     * a render function would put the Vanilla binding in the business of generating anatomy, and
     * make a second source of it to keep in step with this template. A `<template>` keeps the one
     * source: whatever `Comment` emits today is exactly what a clone of it is.
     */
    CommentTemplate: {
      intent: ["comment-blueprint", "dynamic-comment-template", "reply-template"],
      host: { element: "template" },
      options: [],
      slots: { children: { accepts: "signature", of: ["Comment"], required: true } },
      template: { element: "template", host: true, slot: "children" },
      react: { from: "@skryensya/react/comment-thread", name: "CommentTemplate" },
    },

    /*
     * THE WRITE BOX, WHICH SHIPS NO INPUT. `children` takes any signature - a FormField around a
     * Textarea, a bare Input, an Editor - because which control a comment is written in is the
     * consumer's decision, and a contract that named one would be wrong the first time someone
     * wanted another. Usable with no thread around it: a standalone "leave a comment" box.
     */
    CommentComposer: {
      intent: ["comment-composer", "reply-box", "new-comment-form"],
      host: { element: "form" },
      options: ["submitLabel", "cancellable", "cancelLabel"],
      slots: {
        /** Any control at all. No `of`, on purpose. */
        children: { accepts: "signature", required: true },
      },
      mount: commentThreadAttrs.composer,
      /*
       * No surface of its own. The control it is handed already draws one - a `Textarea` has a
       * border, a fill and a radius - so wrapping it in a second box put a frame around a frame and
       * said nothing the field had not already said. What this signature contributes is the
       * arrangement: the control, and the actions under it.
       */
      template: {
        element: "form",
        part: "composer",
        host: true,
        children: [
          { slot: "children" },
          {
            element: "div",
            part: "composerActions",
            children: [
              /*
               * Cancel sits BEFORE submit, which is the order every dialog in this system already
               * uses (see `Dialog`'s own footer): the affirmative action is last, closest to where
               * the eye finishes and the thumb rests.
               */
              {
                element: "button",
                part: "composerCancel",
                also: ["sk-button", "sk-interactive"],
                mount: commentThreadAttrs.composerCancel,
                whenGiven: "cancellable",
                attrs: { type: "button", "data-size": "sm", "data-variant": "ghost" },
                textFromOption: "cancelLabel",
              },
              {
                element: "button",
                part: "composerSubmit",
                also: ["sk-button", "sk-interactive"],
                mount: commentThreadAttrs.composerSubmit,
                attrs: { type: "submit", "data-size": "sm", "data-variant": "accent" },
                textFromOption: "submitLabel",
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/comment-thread", name: "CommentComposer" },
    },
  },
} as const satisfies ComponentContract;
