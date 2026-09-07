import { commentThreadAttrs, commentThreadEvents } from "@skryensya/core/comment-thread";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * COMMENT THREAD, a plain-DOM enhancer with no Zag machine to borrow - same reasoning
 * `checkbox-group.ts` gives for its own: vote/reply/delete are one click, one dispatched event,
 * nothing here for a state machine to own. Collapse and "is the reply box open" ARE local state, but
 * they are exactly `NavListGroup`'s `aria-expanded` + `hidden` pair, copied per node rather than
 * reached for a machine.
 *
 * THREE ROOTS, NOT ONE, because the pieces are usable apart (`comment-thread.ts`'s banner): a
 * standalone `Comment` with a fold control, or a standalone `CommentComposer` with no thread around
 * it, would never be wired by an enhancer that only ever mounted on a thread. The nearest matching
 * ancestor owns an interaction - `owns()` below is just `closest(rootSelector) === root` - so a
 * comment nested three deep inside a thread is handled once, by itself, and never also by the two
 * roots above it. The event still `bubbles`, so a consumer listening on the thread hears every one.
 *
 * VOTE AND DELETE DO NOT MUTATE THE DOM THEMSELVES. `data-voted`/`aria-pressed` stay whatever the
 * consumer's own markup (or last re-render) put there; a click only dispatches. This mirrors React
 * exactly: there, `voted` is a PROP the consumer owns, never local state, so a click calls back and
 * waits for new props rather than flipping its own paint. "Data-driven, no backend" means the vote
 * COUNT and the vote STATE are the consumer's data, not this component's - the same restraint that
 * keeps the composer from deciding what happens after a reply is sent.
 */

const SELECTOR = {
  thread: `[${commentThreadAttrs.root}]`,
  comment: `[${commentThreadAttrs.comment}]`,
  composer: `[${commentThreadAttrs.composer}]`,
  composerCancel: `[${commentThreadAttrs.composerCancel}]`,
  voteUp: `[${commentThreadAttrs.voteUp}]`,
  voteDown: `[${commentThreadAttrs.voteDown}]`,
  reply: `[${commentThreadAttrs.reply}]`,
  delete: `[${commentThreadAttrs.delete}]`,
  collapse: `[${commentThreadAttrs.collapse}]`,
  replySlot: `[${commentThreadAttrs.replySlot}]`,
  body: `[${commentThreadAttrs.body}]`,
  actions: `[${commentThreadAttrs.actions}]`,
  replies: `[${commentThreadAttrs.replies}]`,
} as const;

/** Every element this enhancer will mount on. Order is irrelevant; `owns()` settles who handles what. */
const ROOTS = `${SELECTOR.thread}, ${SELECTOR.comment}, ${SELECTOR.composer}`;

/**
 * The nearest comment's id, or `null` outside any - which is exactly what a root composer's reply
 * should report as its parent. Deliberately NOT scoped to the mounted root: ownership was already
 * settled by `owns()`, and a composer that is its own root still needs to see the comment it sits
 * inside, which a root-scoped lookup would have hidden from it.
 */
function commentId(el: Element): string | null {
  return el.closest<HTMLElement>(SELECTOR.comment)?.dataset.value ?? null;
}

/**
 * This comment's OWN match, at whatever depth, never a nested reply's: a comment's markup contains
 * other comments' markup verbatim, so a plain `querySelector` finds the wrong one the moment a
 * thread has replies. Asked as "whose comment is this?" rather than as `:scope >` because the parts
 * do not all sit at the same depth - the replies hang off the article, the actions and the reply box
 * live inside `__self > __content` - and a depth-counting selector breaks the next time the template
 * grows a wrapper. Same own-scope rule `checkbox-group.ts` keeps for its own items.
 */
function own<T extends Element>(comment: Element, selector: string): T | null {
  for (const el of comment.querySelectorAll<T>(selector)) {
    if (el.closest(SELECTOR.comment) === comment) return el;
  }
  return null;
}

/**
 * Whichever control the consumer passed, because the composer ships none: a Textarea, a single-line
 * Input, or a `contenteditable` surface (an Editor). `:not([type=submit])` keeps the composer's own
 * buttons from being mistaken for the field when the control is an input.
 */
function controlOf(form: HTMLFormElement): HTMLElement | null {
  return form.querySelector<HTMLElement>("textarea, input:not([type=submit]), [contenteditable]");
}

function readControl(form: HTMLFormElement): string {
  const control = controlOf(form);
  return control instanceof HTMLTextAreaElement || control instanceof HTMLInputElement
    ? control.value
    : (control?.textContent ?? "");
}

function clearControl(form: HTMLFormElement): void {
  form.reset();
  const control = controlOf(form);
  if (control?.isContentEditable) control.textContent = "";
}

/**
 * Shuts the reply box this composer sits in, and un-presses the trigger that opened it. A thread's
 * own composer has no trigger and no slot, so this is a no-op there, which is correct: an
 * always-open box has nothing to close back to.
 */
function closeComposer(form: HTMLFormElement): void {
  const comment = form.closest<HTMLElement>(SELECTOR.comment);
  const slot = comment && own<HTMLElement>(comment, SELECTOR.replySlot);
  const trigger = comment && own<HTMLElement>(comment, SELECTOR.actions)?.querySelector<HTMLElement>(SELECTOR.reply);
  if (trigger && slot) toggleDisclosure(trigger, [slot], false);
}

function toggleDisclosure(trigger: HTMLElement, targets: readonly (Element | null)[], open: boolean): void {
  trigger.setAttribute("aria-expanded", String(open));
  for (const target of targets) {
    if (target instanceof HTMLElement) target.hidden = !open;
  }
}

function connect(root: HTMLElement): () => void {
  const owns = (el: Element | null): el is HTMLElement =>
    el instanceof HTMLElement && el.closest(ROOTS) === root;

  /*
   * CANCELABLE, so a consumer can veto rather than only observe. `preventDefault()` on an event that
   * has an after-effect stops that effect: the one that matters is `reply`, where the enhancer
   * otherwise clears the box and closes it the instant it dispatches - and a consumer whose POST
   * fails has already lost what the person wrote. `vote` and `delete` change nothing on their own,
   * so vetoing them is a no-op the platform still lets you express.
   *
   * Returns whether the default survived, which is what the handlers below branch on.
   */
  const emit = (name: string, detail: unknown) =>
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable: true, detail }));

  const onClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const voteUp = target.closest<HTMLElement>(SELECTOR.voteUp);
    if (owns(voteUp)) {
      emit(commentThreadEvents.vote, { direction: "up", id: commentId(voteUp) });
      return;
    }

    const voteDown = target.closest<HTMLElement>(SELECTOR.voteDown);
    if (owns(voteDown)) {
      emit(commentThreadEvents.vote, { direction: "down", id: commentId(voteDown) });
      return;
    }

    const del = target.closest<HTMLElement>(SELECTOR.delete);
    if (owns(del)) {
      emit(commentThreadEvents.delete, { id: commentId(del) });
      return;
    }

    const collapse = target.closest<HTMLElement>(SELECTOR.collapse);
    if (owns(collapse)) {
      const comment = collapse.closest<HTMLElement>(SELECTOR.comment);
      const replies = comment && own<HTMLElement>(comment, SELECTOR.replies);
      if (!replies) return;
      /* Folds the REPLIES, not the comment. A thread gets long because of what hangs off a comment,
       * not because of the comment itself, so hiding the body in order to skip the argument under it
       * would lose the thing the reader was following. Body and actions stay put. */
      const open = collapse.getAttribute("aria-expanded") !== "true";
      toggleDisclosure(collapse, [replies], open);
      return;
    }

      /*
     * CANCEL. An empty composer just closes: there is nothing to lose, and a dialog about nothing is
     * a dialog a reader learns to dismiss without reading. With a draft in it the enhancer refuses
     * to decide - it dispatches and stops, exactly as delete does - so the app can confirm before
     * anything is thrown away. Closing after that confirmation is the app's call too, which is why
     * nothing here closes the box.
     */
    const cancel = target.closest<HTMLElement>(SELECTOR.composerCancel);
    if (owns(cancel)) {
      const form = cancel.closest<HTMLFormElement>(SELECTOR.composer);
      if (!form) return;
      const body = readControl(form).trim();
      if (body) {
        emit(commentThreadEvents.discard, { body, parentId: commentId(form) });
        return;
      }
      /* An empty box closes itself and dispatches NOTHING. `discard` promises it only fires when a
       * draft is at stake; firing it empty would make every consumer check the body before deciding
       * whether to ask, which is the check this event exists to have already made. */
      closeComposer(form);
      return;
    }

    const reply = target.closest<HTMLElement>(SELECTOR.reply);
    if (owns(reply)) {
      const comment = reply.closest<HTMLElement>(SELECTOR.comment);
      const slot = comment && own<HTMLElement>(comment, SELECTOR.replySlot);
      if (!slot) return;
      const open = reply.getAttribute("aria-expanded") !== "true";
      toggleDisclosure(reply, [slot], open);
      // Whatever control the consumer put in there: this composer ships none of its own.
      if (open) slot.querySelector<HTMLElement>("textarea, input, [contenteditable]")?.focus();
    }
  };

  const onSubmit = (event: SubmitEvent) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches(SELECTOR.composer) || !owns(form)) return;
    event.preventDefault();

    const body = readControl(form).trim();
    if (!body) return;

    // Cleared and closed only if nobody objected: see `emit` above.
    if (!emit(commentThreadEvents.reply, { body, parentId: commentId(form) })) return;
    clearControl(form);
    closeComposer(form);
  };

  root.addEventListener("click", onClick);
  root.addEventListener("submit", onSubmit);
  return () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("submit", onSubmit);
  };
}

export const mountCommentThread = createConnectMount({
  key: "comment-thread",
  rootSelector: ROOTS,
  connect,
});
