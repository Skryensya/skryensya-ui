import { avatarInitials } from "@skryensya/core/avatar";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate, UIKey } from "../i18n";

/*
 * FOUR DEMOS, in the order the page teaches them: one comment, that comment with its action row, a
 * short thread with replies, and a deep one that stresses the connector.
 *
 * No standalone composer among them: a form is a different subject and `FormField`/`Input` have
 * their own pages. A composer still appears where it belongs, as the box the Reply trigger opens.
 *
 * The last three are LIVE. `comment-thread-actions.ts` plays the app: it confirms a deletion,
 * moves the vote count, and appends the reply. None of that is the component's, which is the point
 * of showing it - the thread reports what happened and stops.
 *
 * There is no `demos/data/` fixture, unlike TreeView's: replies recurse by COMPOSITION, so a thread
 * is a tree of signatures rather than an array of entries, and the shape belongs here.
 */

/*
 * The avatar is its OWN slot, not content inside `author`: the thread line descends from it. This
 * returns both halves so a demo never sets one without the other. One palette hue per person, the
 * same reasoning `avatar.ts`'s demo picks distinct hues over one repeated default.
 */
const person = (t: Translate, key: UIKey, hue: string): { avatar: UsageTree; author: string } => {
  const name = t(key);
  return {
    avatar: {
      contract: "avatar",
      signature: "Avatar.initials",
      options: { size: "sm", name },
      attrs: { style: `--sk-avatar-bg: var(--palette-${hue}); --sk-avatar-fg: var(--palette-white);` },
      children: avatarInitials(name),
    },
    author: name,
  };
};

const vote = (voted: "up" | "down" | "none", count: string): UsageTree => ({
  contract: "comment-thread",
  signature: "CommentVote",
  options: { voted },
  slots: { count },
});

const actions = (voted: "up" | "down" | "none", count: string, extra: Record<string, boolean> = {}): UsageTree => ({
  contract: "comment-thread",
  signature: "CommentActions",
  options: { reply: true, ...extra },
  slots: { children: vote(voted, count) },
});

/** The box the Reply trigger opens. It ships no control, so the demo passes one. */
const replyComposer = (t: Translate): UsageTree => ({
  contract: "comment-thread",
  signature: "CommentComposer",
  options: { submitLabel: t("demo.commentThread.send"), cancellable: true },
  children: {
    contract: "form-field",
    signature: "FormField",
    /* The label is clipped, not dropped: the comment right above the box already says what this
     * field is, so showing the word again is noise a reader has to skip. A screen reader still
     * reads it, which is the whole difference between `labelHidden` and no label. */
    options: { labelHidden: true },
    slots: { label: t("demo.commentThread.replyFieldLabel") },
    children: {
      contract: "input",
      signature: "Textarea",
      options: { placeholder: t("demo.commentThread.replyPlaceholder") },
    },
  },
});

/*
 * The confirmation the DELETE trigger does not ship. `comment-thread.ts` is explicit that a
 * consumer who wants one composes `Dialog` (`alert`) around their own handler; this is that
 * composition, and the demo script opens it.
 */
const confirmDialog = (t: Translate): UsageTree => ({
  contract: "dialog",
  signature: "Dialog",
  options: { alert: true },
  attrs: { id: "comment-demo-confirm" },
  slots: {
    title: t("demo.commentThread.deleteTitle"),
    children: t("demo.commentThread.deleteBody"),
    footer: [
      {
        contract: "button",
        signature: "Button.action",
        options: { variant: "ghost" },
        attrs: { type: "submit", value: "cancel", autofocus: "" },
        children: t("demo.commentThread.deleteCancel"),
      },
      {
        contract: "button",
        signature: "Button.action",
        options: { variant: "danger" },
        attrs: { type: "submit", value: "confirm" },
        children: t("demo.commentThread.deleteConfirm"),
      },
    ],
  },
});

/*
 * The DISCARD confirmation, separate from the delete one on purpose: they ask different questions
 * about different things, and one dialog re-labelled per use is a dialog whose title a reader stops
 * trusting. Only ever raised for a composer that HAS something in it - the enhancer does not fire
 * for an empty one, so this never asks about nothing.
 */
const discardDialog = (t: Translate): UsageTree => ({
  contract: "dialog",
  signature: "Dialog",
  options: { alert: true },
  attrs: { id: "comment-demo-discard" },
  slots: {
    title: t("demo.commentThread.discardTitle"),
    children: t("demo.commentThread.discardBody"),
    footer: [
      {
        contract: "button",
        signature: "Button.action",
        options: { variant: "ghost" },
        attrs: { type: "submit", value: "cancel", autofocus: "" },
        children: t("demo.commentThread.discardKeep"),
      },
      {
        contract: "button",
        signature: "Button.action",
        options: { variant: "danger" },
        attrs: { type: "submit", value: "confirm" },
        children: t("demo.commentThread.discardConfirm"),
      },
    ],
  },
});

/*
 * WHO THE READER IS, carried on the wrapper so the demo script can read it back: the words are
 * translations and a script must not hold any. `deletable` on a comment is this demo's stand-in for
 * "mine" - the contract has no opinion about ownership, which is the app's to decide, so a demo
 * showing delete on every comment would have been claiming otherwise.
 */
/*
 * The blueprint the script clones to add a reply. Authored once, here, so the runtime-created
 * comment is the contract's own anatomy rather than a guess at it: whatever `Comment` emits today is
 * exactly what a clone of this is. Same shape `toast.ts` uses for its own `ToastTemplate`.
 */
const commentTemplate = (t: Translate): UsageTree => ({
  contract: "comment-thread",
  signature: "CommentTemplate",
  children: {
    contract: "comment-thread",
    signature: "Comment",
    slots: {
      avatar: {
        contract: "avatar",
        signature: "Avatar.initials",
        options: { size: "sm", name: t("demo.commentThread.author1") },
        children: "AD",
      },
      author: t("demo.commentThread.author1"),
      timestamp: t("demo.commentThread.now"),
      children: "",
      actions: {
        contract: "comment-thread",
        signature: "CommentActions",
        options: { reply: true, deletable: true },
        slots: { children: vote("none", "0") },
      },
      replyComposer: replyComposer(t),
    },
  },
});

const interactive = (t: Translate, children: readonly UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: {
    /*
     * The stage is a WRAPPING FLEX ROW (`component-preview.css`'s `__frame-body`), so a specimen is
     * a flex item and sizes to its own content: a thread of short messages collapsed to the width
     * of its longest line and read as a narrow column in a wide frame. A conversation is a block,
     * not a chip, so it says so. Same class of problem `progress.ts` documents for its own stack.
     */
    style: "inline-size: 100%",
    "data-comment-demo-me": t("demo.commentThread.author1"),
    "data-comment-demo-initials": "AD",
    "data-comment-demo-now": t("demo.commentThread.now"),
    "data-comment-demo-avatar": "--sk-avatar-bg: var(--palette-blue-600); --sk-avatar-fg: var(--palette-white);",
  },
  children: [...children, confirmDialog(t), discardDialog(t), commentTemplate(t)],
});

type CommentInput = {
  id?: string;
  who: [UIKey, string];
  time: UIKey;
  body: UIKey;
  actions?: UsageTree;
  replies?: UsageTree | readonly UsageTree[];
};

/** One comment. `collapsible` is implied by having replies: a fold control with nothing to fold is
 *  chrome attached to nothing, and the contract refuses to render it there anyway. */
const comment = (t: Translate, node: CommentInput): UsageTree => ({
  contract: "comment-thread",
  signature: "Comment",
  options: {
    ...(node.id ? { commentId: node.id } : {}),
    ...(node.replies ? { collapsible: true } : {}),
  },
  slots: {
    ...person(t, node.who[0], node.who[1]),
    timestamp: t(node.time),
    children: t(node.body),
    ...(node.actions ? { actions: node.actions, replyComposer: replyComposer(t) } : {}),
    ...(node.replies ? { replies: node.replies } : {}),
  },
});

const thread = (t: Translate, children: readonly UsageTree[]): UsageTree => ({
  contract: "comment-thread",
  signature: "CommentThread",
  options: { label: t("demo.commentThread.label") },
  slots: { children },
});

const ADA: [UIKey, string] = ["demo.commentThread.author1", "blue-600"];
const GRACE: [UIKey, string] = ["demo.commentThread.author2", "red-600"];
const LINUS: [UIKey, string] = ["demo.commentThread.author3", "emerald-600"];
const MARGARET: [UIKey, string] = ["demo.commentThread.author4", "sky-600"];
const ALAN: [UIKey, string] = ["demo.commentThread.author5", "blue-700"];
const BARBARA: [UIKey, string] = ["demo.commentThread.author6", "red-700"];

/** THE SIMPLEST PIECE: who, when, and what they said. No thread, no chrome, no fold control. */
export const commentAloneTree = (t: Translate): UsageTree => ({
  ...comment(t, { who: ADA, time: "demo.commentThread.time1", body: "demo.commentThread.body1" }),
  // Fills the stage for the same reason the interactive demos do; see `interactive` above.
  attrs: { style: "inline-size: 100%" },
});

/** THE SAME COMMENT plus its row: a vote group, and the reply and delete triggers. */
export const commentActionsTree = (t: Translate): UsageTree =>
  interactive(t, [
    comment(t, {
    id: "c1",
    who: ADA,
    time: "demo.commentThread.time1",
    body: "demo.commentThread.body1",
    actions: actions("up", "4", { deletable: true }),
    }),
  ]);

/** A SHORT THREAD: three comments, one of them answered. */
export const commentThreadTree = (t: Translate): UsageTree =>
  interactive(t, [
    thread(t, [
    comment(t, {
      id: "c1",
      who: ADA,
      time: "demo.commentThread.time1",
      body: "demo.commentThread.body1",
      actions: actions("up", "4", { deletable: true }),
      replies: comment(t, {
        id: "c1-r1",
        who: GRACE,
        time: "demo.commentThread.time2",
        body: "demo.commentThread.body2",
        actions: actions("none", "1"),
      }),
    }),
    comment(t, {
      id: "c2",
      who: LINUS,
      time: "demo.commentThread.time3",
      body: "demo.commentThread.body3",
      actions: actions("none", "0"),
    }),
    /* No actions at all: a read-only comment drags no chrome it never renders. */
    comment(t, { id: "c3", who: MARGARET, time: "demo.commentThread.time4", body: "demo.commentThread.body4" }),
    ]),
  ]);

/*
 * THE STRESS TEST: four levels deep, siblings at several of them, and a branch that ends without
 * actions. It is here because the connector is drawn per reply rather than measured - `:first-child`
 * reaches back to the fold control, `:last-child` clips at its own elbow - and the only way to see
 * that those rules hold at depth, with siblings above and below, is to render it.
 */
export const commentDeepTree = (t: Translate): UsageTree =>
  interactive(t, [
    thread(t, [
    comment(t, {
      id: "d1",
      who: ADA,
      time: "demo.commentThread.time1",
      body: "demo.commentThread.body1",
      actions: actions("up", "12", { deletable: true }),
      replies: [
        comment(t, {
          id: "d1-1",
          who: GRACE,
          time: "demo.commentThread.time2",
          body: "demo.commentThread.body2",
          actions: actions("none", "3"),
          replies: [
            comment(t, {
              id: "d1-1-1",
              who: LINUS,
              time: "demo.commentThread.time3",
              body: "demo.commentThread.body3",
              actions: actions("down", "1"),
              replies: comment(t, {
                id: "d1-1-1-1",
                who: ALAN,
                time: "demo.commentThread.time5",
                body: "demo.commentThread.body5",
                actions: actions("none", "0"),
              }),
            }),
            comment(t, {
              id: "d1-1-2",
              who: MARGARET,
              time: "demo.commentThread.time4",
              body: "demo.commentThread.body4",
              actions: actions("none", "2"),
            }),
          ],
        }),
        comment(t, {
          id: "d1-2",
          who: BARBARA,
          time: "demo.commentThread.time6",
          body: "demo.commentThread.body6",
          actions: actions("up", "5"),
        }),
      ],
    }),
    comment(t, {
      id: "d2",
      who: LINUS,
      time: "demo.commentThread.time3",
      body: "demo.commentThread.body7",
      actions: actions("none", "0"),
      replies: comment(t, {
        id: "d2-1",
        who: ADA,
        time: "demo.commentThread.time5",
        body: "demo.commentThread.body8",
        actions: actions("none", "0", { deletable: true }),
      }),
    }),
    ]),
  ]);
