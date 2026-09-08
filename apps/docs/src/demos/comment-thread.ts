import { avatarInitials } from "@skryensya/core/avatar";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate, UIKey } from "../i18n";

/*
 * FIVE DEMOS, in the order the page teaches them: one comment, that comment with its action row, a
 * short thread with replies, that same shape with folding turned off, and a deep one that stresses
 * the connector.
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
 * THE SKELETON'S OWN SHAPE, built from `Placeholder` rather than a blank `Comment`. A `Comment`
 * with no real author or body would be lying about what those slots mean - they are the contract's
 * home for content that EXISTS, not for content that has not arrived yet. `Placeholder` says that
 * honestly instead: a circle where the avatar goes, a couple of text bars for the header, and
 * a paragraph for the body, none of it announced (`aria-hidden`, per `placeholder.ts`). Every size
 * is named rather than measured: `size: "sm"` is the same scale the `sm` Avatar below reads, and
 * `text: "sm"` the same type pair its metadata reads, so swapping one for the other cannot jump.
 */
const skeletonLine = (width: string): UsageTree => ({
  contract: "placeholder",
  signature: "Placeholder",
  options: { text: "sm", width },
});

const commentSkeletonRow = (): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", wrap: false },
  children: [
    /* `size: "sm"` rather than a hand-written token: the circle and the Avatar it stands in for now
     * read the same scale, so the two can no longer be set to different sizes by accident. */
    { contract: "placeholder", signature: "Placeholder.circle", options: { size: "sm" } },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "xs" },
      attrs: { style: "flex: 1 1 0%; min-inline-size: 0" },
      children: [
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm", wrap: false },
          children: [skeletonLine("28%"), skeletonLine("14%")],
        },
        /* The body is prose, so it is a paragraph rather than two lines that happen to sit together:
         * the ragged last line is the stylesheet's, not this demo's to guess at. */
        {
          contract: "placeholder",
          signature: "Placeholder.paragraph",
          options: { text: "sm", lines: 2, lastLine: "68%" },
        },
      ],
    },
  ],
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
        options: { tone: "danger" },
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
        options: { tone: "danger" },
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
  /** Overrides the implied default below. Set `false` on a comment WITH replies to keep them
   *  always visible and drop the fold control entirely, rather than merely collapsed-by-default. */
  collapsible?: boolean;
};

/** One comment. `collapsible` is implied by having replies: a fold control with nothing to fold is
 *  chrome attached to nothing, and the contract refuses to render it there anyway. */
const comment = (t: Translate, node: CommentInput): UsageTree => ({
  contract: "comment-thread",
  signature: "Comment",
  options: {
    ...(node.id ? { commentId: node.id } : {}),
    ...((node.collapsible ?? Boolean(node.replies)) ? { collapsible: true } : {}),
  },
  slots: {
    ...person(t, node.who[0], node.who[1]),
    timestamp: t(node.time),
    children: t(node.body),
    ...(node.actions ? { actions: node.actions, replyComposer: replyComposer(t) } : {}),
    ...(node.replies ? { replies: node.replies } : {}),
  },
});

const thread = (
  t: Translate,
  children: readonly UsageTree[],
  { composer = false }: { composer?: boolean } = {},
): UsageTree => ({
  contract: "comment-thread",
  signature: "CommentThread",
  options: { label: t("demo.commentThread.label") },
  slots: { children, ...(composer ? { composer: replyComposer(t) } : {}) },
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

/*
 * A SHORT THREAD: three comments, one of them answered, and the thread's own composer.
 *
 * That composer is here so the narrow-viewport preset has something to show: below
 * `--breakpoint-desktop` it is the box that becomes a Vaul and grows a trigger, and with no composer
 * on the thread there is nothing to demonstrate that with. Above the breakpoint it is simply the
 * "write a new comment" box sitting where it always did.
 */
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
    ], { composer: true }),
  ]);

/*
 * THE SAME DEPTH AS THE STRESS TEST BELOW, with folding turned off at every level that has
 * replies: `collapsible: false` on each of them, so no fold control renders anywhere in the tree
 * and nothing in it can ever be hidden. One level deep would not show the difference from the
 * short thread above - the point here is that the connector still runs cleanly at depth with no
 * control interrupting it, which only shows up once there is real nesting to draw.
 */
export const commentThreadFixedTree = (t: Translate): UsageTree =>
  interactive(t, [
    thread(t, [
    comment(t, {
      id: "f1",
      who: ADA,
      time: "demo.commentThread.time1",
      body: "demo.commentThread.body1",
      actions: actions("up", "12", { deletable: true }),
      collapsible: false,
      replies: [
        comment(t, {
          id: "f1-1",
          who: GRACE,
          time: "demo.commentThread.time2",
          body: "demo.commentThread.body2",
          actions: actions("none", "3"),
          collapsible: false,
          replies: [
            comment(t, {
              id: "f1-1-1",
              who: LINUS,
              time: "demo.commentThread.time3",
              body: "demo.commentThread.body3",
              actions: actions("down", "1"),
              collapsible: false,
              replies: comment(t, {
                id: "f1-1-1-1",
                who: ALAN,
                time: "demo.commentThread.time5",
                body: "demo.commentThread.body5",
                actions: actions("none", "0"),
              }),
            }),
            comment(t, {
              id: "f1-1-2",
              who: MARGARET,
              time: "demo.commentThread.time4",
              body: "demo.commentThread.body4",
              actions: actions("none", "2"),
            }),
          ],
        }),
        comment(t, {
          id: "f1-2",
          who: BARBARA,
          time: "demo.commentThread.time6",
          body: "demo.commentThread.body6",
          actions: actions("up", "5"),
        }),
      ],
    }),
    comment(t, {
      id: "f2",
      who: LINUS,
      time: "demo.commentThread.time3",
      body: "demo.commentThread.body7",
      actions: actions("none", "0"),
      collapsible: false,
      replies: comment(t, {
        id: "f2-1",
        who: ADA,
        time: "demo.commentThread.time5",
        body: "demo.commentThread.body8",
        actions: actions("none", "0", { deletable: true }),
      }),
    }),
    ]),
  ]);

/*
 * THE STRESS TEST: four levels deep, siblings at several of them, and a branch that ends without
 * actions. It is here because the connector is drawn per reply rather than measured - `:first-child`
 * reaches back to the fold control, `:last-child` clips at its own elbow - and the only way to see
 * that those rules hold at depth, with siblings above and below, is to render it.
 */
/*
 * THE PLACEHOLDER ALONE: what a reader sees before anything has arrived. Announced ONCE, with
 * `Loader.status`, rather than per row - three skeletons each narrating "loading" would say it
 * three times over, which is worse than the silence a screen reader would otherwise find here.
 */
export const commentSkeletonTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 100%" },
  children: [
    { contract: "loader", signature: "Loader.status", options: { label: t("demo.commentThread.loadingLabel") } },
    commentSkeletonRow(),
    commentSkeletonRow(),
    commentSkeletonRow(),
  ],
});

/*
 * THE BLUEPRINT FOR A COMMENT LOADED BY SCROLLING, separate from `commentTemplate` above: that one
 * carries the reply row this thread's own comments never render, and ships pre-filled with a fixed
 * identity because the reply script only ever rewrites the body. This one is rewritten in full
 * (author, avatar initials, body) by `comment-thread-infinite-scroll.ts`, so what it ships with
 * barely matters - it exists only so the clone has the contract's real anatomy to write into.
 */
const scrollCommentTemplate = (t: Translate): UsageTree => ({
  contract: "comment-thread",
  signature: "CommentTemplate",
  children: {
    contract: "comment-thread",
    signature: "Comment",
    slots: {
      avatar: {
        contract: "avatar",
        signature: "Avatar.initials",
        options: { size: "sm", name: t("demo.commentThread.author4") },
        children: "MA",
      },
      author: t("demo.commentThread.author4"),
      timestamp: t("demo.commentThread.now"),
      children: "",
    },
  },
});

/*
 * COMMENTS ALREADY LOADED, PLUS THE SHAPE OF WHAT IS NOT THERE YET, side by side rather than one
 * replacing the other: scrolling to the end of what arrived reveals the skeleton's own row right
 * where the next comment will land (`data-comment-demo-skeleton`, authored hidden), and the script
 * swaps it for a real `Comment` cloned from the blueprint above. Neither step is this component's -
 * `CommentThread` never learns that pages, or a scrollbar, exist. The two people waiting to arrive
 * are baked in as `data-*` (a demo script cannot import a translation), reusing the same Margaret
 * and Barbara the deep-thread demo above already introduces.
 */
export const commentThreadInfiniteScrollTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: {
    style: "inline-size: 100%; max-block-size: 22rem; overflow-y: auto; padding-inline-end: 0.5rem",
    "data-comment-demo-scroll": "",
    "data-comment-demo-queue-a-author": t("demo.commentThread.author4"),
    "data-comment-demo-queue-a-body": t("demo.commentThread.body4"),
    "data-comment-demo-queue-b-author": t("demo.commentThread.author6"),
    "data-comment-demo-queue-b-body": t("demo.commentThread.body6"),
  },
  children: [
    thread(t, [
      comment(t, { id: "s1", who: ADA, time: "demo.commentThread.time1", body: "demo.commentThread.body1" }),
      comment(t, { id: "s2", who: GRACE, time: "demo.commentThread.time2", body: "demo.commentThread.body2" }),
      comment(t, { id: "s3", who: LINUS, time: "demo.commentThread.time3", body: "demo.commentThread.body3" }),
    ]),
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      attrs: { "data-comment-demo-skeleton": "", hidden: "" },
      children: [
        {
          contract: "loader",
          signature: "Loader.status",
          options: { label: t("demo.commentThread.loadingMoreLabel") },
        },
        commentSkeletonRow(),
      ],
    },
    scrollCommentTemplate(t),
  ],
});

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
