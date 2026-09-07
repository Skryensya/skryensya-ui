/*
 * What an APP does with the three events the thread hands it. None of this is the component's:
 * `CommentThread` dispatches `sk:commentvote` / `sk:commentreply` / `sk:commentdelete` and never
 * touches the vote count, never confirms a deletion, never invents a reply. This file is the other
 * half of that bargain, written the way a consumer would write it, standing in for the server.
 *
 * One listener per event on `document` rather than one per thread: the events bubble, and two of
 * these demos are a single `Comment` with no thread around it at all.
 */

type VoteDetail = { id: string | null; direction: "up" | "down" };
type ReplyDetail = { parentId: string | null; body: string };
type DeleteDetail = { id: string | null };
type DiscardDetail = { parentId: string | null; body: string };

const comment = (id: string | null): HTMLElement | null =>
  id ? document.querySelector<HTMLElement>(`[data-sk-comment][data-value="${id}"]`) : null;

/** This comment's own node, never a nested reply's: a comment contains other comments verbatim. */
function own<T extends Element>(root: Element, selector: string): T | null {
  for (const el of root.querySelectorAll<T>(selector)) {
    if (el.closest("[data-sk-comment]") === root) return el;
  }
  return null;
}

/* ── Voting: the count is the app's data, so the app is what changes it ─────────────────────── */

document.addEventListener("sk:commentvote", (event) => {
  const { id, direction } = (event as CustomEvent<VoteDetail>).detail;
  const article = comment(id);
  const group = article && own<HTMLElement>(article, "[data-sk-comment-vote]");
  const output = group && group.querySelector<HTMLElement>("[data-sk-comment-vote-count]");
  if (!group || !output) return;

  /*
   * Written out by hand because a demo script cannot import (see `scripts/README.md`): it runs
   * through `Function`, which has no module scope. A real consumer calls `setCommentVote(group,
   * { voted, count })` from `@skryensya/core/comment-thread` instead, which is the same three
   * writes with no chance of the paint and the announcement disagreeing.
   */
  const previous = group.dataset.voted ?? "none";
  const next = previous === direction ? "none" : direction;
  const weight = (value: string) => (value === "up" ? 1 : value === "down" ? -1 : 0);

  output.textContent = String(Number(output.textContent ?? "0") - weight(previous) + weight(next));
  group.dataset.voted = next;
  // `data-voted` paints; `aria-pressed` announces. Both, or a screen reader and the screen disagree.
  group.querySelector("[data-sk-comment-vote-up]")?.setAttribute("aria-pressed", String(next === "up"));
  group.querySelector("[data-sk-comment-vote-down]")?.setAttribute("aria-pressed", String(next === "down"));
});

/* ── Deleting: confirmed first, and only ever a comment marked as the reader's own ──────────── */

/*
 * A real `Dialog` with `alert`, which is the composition the contract points at rather than a
 * confirm step baked into the component: `comment-thread.ts` says a consumer who wants one composes
 * `Dialog` around their own handler, and this is that consumer.
 */
const confirmDialog = document.getElementById("comment-demo-confirm");
let pendingDelete: string | null = null;

document.addEventListener("sk:commentdelete", (event) => {
  const { id } = (event as CustomEvent<DeleteDetail>).detail;
  pendingDelete = id;
  if (confirmDialog instanceof HTMLDialogElement) confirmDialog.showModal();
});

confirmDialog?.addEventListener("close", () => {
  if (!(confirmDialog instanceof HTMLDialogElement)) return;
  const target = confirmDialog.returnValue === "confirm" ? comment(pendingDelete) : null;
  pendingDelete = null;
  if (!target) return;

  /*
   * A deleted comment takes its replies with it, which is one of two defensible behaviours (the
   * other is a tombstone that keeps the thread readable). The point here is that the app chooses:
   * the component reported an id and stopped.
   */
  const parentReplies = target.parentElement;
  target.remove();
  // A replies block with nothing left in it would still draw its rail, pointing at nothing.
  if (parentReplies?.matches("[data-sk-comment-replies]") && parentReplies.children.length === 0) {
    parentReplies.remove();
  }
});

/* ── Discarding a draft: only ever asked when there IS one ──────────────────────────────────── */

/*
 * A second dialog, not the delete one re-labelled: the two ask different questions about different
 * things, and a dialog whose title changes per use is one a reader stops reading. The enhancer only
 * fires this when the box has something in it - an empty one just closes - so this never asks about
 * nothing.
 */
const discardDialog = document.getElementById("comment-demo-discard");
let pendingDiscard: string | null = null;

document.addEventListener("sk:commentdiscard", (event) => {
  const { parentId } = (event as CustomEvent<DiscardDetail>).detail;
  pendingDiscard = parentId;
  if (discardDialog instanceof HTMLDialogElement) discardDialog.showModal();
});

discardDialog?.addEventListener("close", () => {
  if (!(discardDialog instanceof HTMLDialogElement)) return;
  const parent = discardDialog.returnValue === "confirm" ? comment(pendingDiscard) : null;
  pendingDiscard = null;
  if (!parent) return;

  // Confirmed: throw the draft away and shut the box, which is the pair the enhancer deliberately
  // left to the app so it could ask first.
  const slot = own<HTMLElement>(parent, "[data-sk-comment-reply-slot]");
  const textarea = slot?.querySelector("textarea");
  if (textarea instanceof HTMLTextAreaElement) textarea.value = "";
  if (slot) slot.hidden = true;
  own<HTMLElement>(parent, "[data-sk-comment-reply]")?.setAttribute("aria-expanded", "false");
});

/* ── Replying: cloned from the blueprint, never hand-built ──────────────────────────────────── */

document.addEventListener("sk:commentreply", (event) => {
  const { parentId, body } = (event as CustomEvent<ReplyDetail>).detail;
  const parent = comment(parentId);
  const template = document.querySelector<HTMLTemplateElement>("template");
  const fresh = template?.content.firstElementChild?.cloneNode(true);
  if (!parent || !(fresh instanceof HTMLElement)) return;

  /*
   * Four fields, addressed through the contract's own `data-sk-comment-*` hooks rather than through
   * part classes: those are the stylesheet's and move whenever the paint does. The words come from
   * the markup for the same reason they always do here - a translation never belongs in a script.
   */
  const identity = document.querySelector<HTMLElement>("[data-comment-demo-me]");
  fresh.dataset.value = `reply-${Date.now()}`;
  const write = (attr: string, text: string) => {
    const node = own<HTMLElement>(fresh, `[${attr}]`);
    if (node) node.textContent = text;
  };
  write("data-sk-comment-body", body);
  write("data-sk-comment-author", identity?.dataset.commentDemoMe ?? "");
  write("data-sk-comment-timestamp", identity?.dataset.commentDemoNow ?? "");

  let replies = own<HTMLElement>(parent, "[data-sk-comment-replies]");
  if (!replies) {
    // The parent had no replies until now, so it needs somewhere to put them.
    replies = document.createElement("div");
    replies.className = "sk-comment__replies";
    replies.setAttribute("data-sk-comment-replies", "");
    parent.append(replies);

    /*
     * And the control that folds them. The contract only renders one where replies already exist
     * (a handle attached to nothing is worse than no handle), so a comment answered for the first
     * time has to be given one - the bookkeeping a real app faces too. Cloned from an existing
     * control rather than built here, because its label is a translation.
     */
    const gutter = own<HTMLElement>(parent, ".sk-comment__gutter");
    const fold = document.querySelector("[data-sk-comment-collapse]");
    if (gutter && fold && !own(parent, "[data-sk-comment-collapse]")) {
      const control = fold.cloneNode(true) as HTMLElement;
      control.setAttribute("aria-expanded", "true");
      gutter.append(control);
      parent.setAttribute("data-collapsible", "");
    }
  }
  replies.append(fresh);
  // Newly inserted markup is not enhanced until something mounts it, the same last step
  // `toast-emit.ts` takes after appending its own clone.
  void window.skMount?.(fresh);
});
