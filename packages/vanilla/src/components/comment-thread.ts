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
  composerSlot: `[${commentThreadAttrs.composerSlot}]`,
  composerTrigger: `[${commentThreadAttrs.composerTrigger}]`,
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
  const box = form.closest("dialog");
  if (!(box instanceof HTMLDialogElement) || !box.open) return;
  /*
   * The thread's OWN composer is the exception, and forgetting it deletes the box from the page.
   * A reply box is always closable - it lives behind a trigger that can bring it back - but the
   * thread's composer is always-open in flow above the breakpoint, where there is nothing to close
   * back to and no trigger showing. So it only closes while it is actually a sheet.
   */
  if (box.matches(SELECTOR.composerSlot) && !isSheet(box)) return;
  box.close();
}

function toggleDisclosure(trigger: HTMLElement, targets: readonly (Element | null)[], open: boolean): void {
  trigger.setAttribute("aria-expanded", String(open));
  for (const target of targets) {
    if (target instanceof HTMLElement) target.hidden = !open;
  }
}

/* ── The composer boxes, in flow or as a Vaul ─────────────────────────────────────────────────── */

/**
 * Where the two presentations part, read from the SAME custom property the stylesheet uses
 * (`--breakpoint-desktop`, semantic/_breakpoints.scss) rather than typed here. `vaul.ts` reads it
 * exactly this way and for the same reason: a literal in the JS and a literal in the CSS are two
 * numbers that agree until someone retunes the scale. `(width < …)` is the exact complement of the
 * stylesheet's `(min-width: …)`, so the two never disagree, not even on the boundary pixel.
 */
function sheetMedia(el: HTMLElement): MediaQueryList {
  const bp = getComputedStyle(el).getPropertyValue("--breakpoint-desktop").trim() || "52rem";
  return window.matchMedia(`(width < ${bp})`);
}

/**
 * Opens a box in the presentation the current width asks for: modal (a block-end Vaul) below the
 * breakpoint, in flow above it.
 *
 * The guard is not defensive noise. `showModal()` on a dialog that is ALREADY open throws
 * `InvalidStateError`, and this is called both by a trigger and by the breakpoint listener, so an
 * open box crossing the line has to be shut before it can be reopened in the other mode. Closing
 * first is also what keeps the two modes from being half-applied: a dialog cannot be modal and
 * in-flow at once, and there is no attribute to switch between them.
 */
function openBox(box: HTMLDialogElement, modal: boolean): void {
  if (box.open) box.close();
  setSheet(box, modal);
  if (modal) box.showModal();
  else box.show();
}

/**
 * Says whether this box is currently a Vaul, in the one way the stylesheet can read.
 *
 * The class is the whole bridge between the two layers: a dialog cannot be modal and in flow at
 * once, so which presentation applies is decided here, in JavaScript, and no media query could
 * reach it. `patterns/vaul.css` then paints the panel, the edge, the slide, the backdrop and the
 * drag, and `comment-thread.css` only reassigns the hooks that make it a composer. Set BEFORE the
 * dialog opens, so the pattern's `@starting-style` has the right rules in place to animate from.
 */
function setSheet(box: HTMLDialogElement, modal: boolean): void {
  box.classList.toggle("sk-vaul", modal);
}

/**
 * Whether this box is currently a sheet, asked of the class rather than of `:modal`.
 *
 * The two say the same thing here, because this enhancer is the only thing that opens these boxes
 * and it always sets the class in the same breath as choosing the mode. The class is the better
 * question anyway: it is the fact the STYLESHEET acts on, so reading it is reading the same state
 * the paint reads, with no chance of the two disagreeing. It also keeps this working where `:modal`
 * does not exist - jsdom parses `<dialog>` and reflects `open` but has no modality at all, so a test
 * asking `:modal` would be asking about a distinction that environment cannot make.
 */
function isSheet(box: HTMLDialogElement): boolean {
  return box.classList.contains("sk-vaul");
}

/** This comment's own reply box, or the thread's own composer box for a thread root. */
function boxOf(root: HTMLElement, scope: Element | null): HTMLDialogElement | null {
  const box = scope
    ? own<HTMLElement>(scope, SELECTOR.replySlot)
    : root.querySelector<HTMLElement>(SELECTOR.composerSlot);
  return box instanceof HTMLDialogElement ? box : null;
}

function connect(root: HTMLElement): () => void {
  const owns = (el: Element | null): el is HTMLElement =>
    el instanceof HTMLElement && el.closest(ROOTS) === root;

  const sheet = sheetMedia(root);

  /**
   * The boxes THIS root answers for, and only those.
   *
   * A thread owns its own composer; a comment owns its own reply box. Scoping it this way rather
   * than querying the whole subtree is what keeps a thread from also re-opening every nested
   * comment's box on a breakpoint change: every comment is its own enhancer root (see the banner),
   * so each box is handled exactly once, by the piece it belongs to.
   */
  const ownBoxes = (): HTMLDialogElement[] => {
    const boxes = [
      root.matches(SELECTOR.thread) ? boxOf(root, null) : null,
      root.matches(SELECTOR.comment) ? boxOf(root, root) : null,
    ];
    return boxes.filter((box): box is HTMLDialogElement => box !== null);
  };

  /**
   * Puts every owned box into the presentation this width asks for. Runs at mount and on every
   * crossing of the breakpoint, so a window dragged across the line re-presents live.
   *
   * The thread's composer is the only box with an opinion of its own about being open: in flow it
   * is always there, as a sheet it waits behind its trigger. A reply box is only ever re-presented,
   * never opened or closed here - whether it is open is the reader's business, not the width's.
   */
  const syncSheets = () => {
    const modal = sheet.matches;
    for (const box of ownBoxes()) {
      const isComposer = box.matches(SELECTOR.composerSlot);
      if (isComposer && !modal) {
        if (!box.open || isSheet(box)) openBox(box, false);
        continue;
      }
      if (isComposer && modal) {
        if (box.open && !isSheet(box)) box.close();
        /* A CLOSED box still has to know what it will be when it opens: the class is what the
         * stylesheet reads, and setting it only at open time would leave the pattern's
         * `@starting-style` with nothing to animate from on the very first open. */
        setSheet(box, true);
        continue;
      }
      if (box.open && isSheet(box) !== modal) openBox(box, modal);
      else if (!box.open) setSheet(box, modal);
    }
  };

  /**
   * Keeps whichever trigger opened a box honest about it, however it closed: the cancel control, but
   * also ESC and a tap on the backdrop, which the platform handles without telling anyone. Without
   * this the reply trigger kept saying `aria-expanded="true"` after a reader dismissed the sheet.
   */
  const syncTrigger = (box: HTMLDialogElement) => {
    const comment = box.closest<HTMLElement>(SELECTOR.comment);
    const trigger = comment
      ? own<HTMLElement>(comment, SELECTOR.actions)?.querySelector<HTMLElement>(SELECTOR.reply)
      : root.querySelector<HTMLElement>(SELECTOR.composerTrigger);
    trigger?.setAttribute("aria-expanded", String(box.open));
  };

  /* `close` is the only half the platform announces: a dialog fires nothing when it opens, so every
   * opening path below calls `syncTrigger` for itself. */
  const onBoxClose = (event: Event) => {
    if (event.target instanceof HTMLDialogElement) syncTrigger(event.target);
  };

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
      const box = boxOf(root, comment);
      if (!box) return;
      if (box.open) {
        box.close();
        return;
      }
      openBox(box, sheet.matches);
      syncTrigger(box);
      /*
       * Only in flow. `showModal()` already moves focus into the dialog by itself, and the platform
       * picks the first focusable, which is the consumer's own control; focusing it again here would
       * be a second focus move in the same frame for no gain. Opened in flow nothing focuses
       * anything, so the reader would be left where they clicked.
       */
      if (!isSheet(box)) focusControl(box);
      return;
    }

    const composerTrigger = target.closest<HTMLElement>(SELECTOR.composerTrigger);
    if (owns(composerTrigger)) {
      const box = boxOf(root, null);
      if (!box || box.open) return;
      openBox(box, sheet.matches);
      syncTrigger(box);
    }
  };

  /** Whatever control the consumer put in there: this composer ships none of its own. */
  function focusControl(box: HTMLElement): void {
    box.querySelector<HTMLElement>("textarea, input, [contenteditable]")?.focus();
  }

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

  /*
   * A click on the backdrop dismisses. The backdrop IS the dialog's own box (the panel is painted by
   * its padding box), so a click landing outside the panel's rectangle but on the dialog is a click
   * on the backdrop: the same test `vaul.ts` makes, and it needs no second element to own it. Only
   * while modal - in flow there is no backdrop, and the box's own rectangle is the box.
   */
  const onBackdropClick = (event: MouseEvent) => {
    const box = event.target;
    if (!(box instanceof HTMLDialogElement) || !isSheet(box)) return;
    const at = box.getBoundingClientRect();
    const outside =
      event.clientX < at.left || event.clientX > at.right || event.clientY < at.top || event.clientY > at.bottom;
    if (outside) box.close();
  };

  const boxes = ownBoxes();
  for (const box of boxes) {
    box.addEventListener("close", onBoxClose);
    box.addEventListener("click", onBackdropClick);
  }
  syncSheets();
  for (const box of boxes) syncTrigger(box);
  sheet.addEventListener("change", syncSheets);

  root.addEventListener("click", onClick);
  root.addEventListener("submit", onSubmit);
  return () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("submit", onSubmit);
    sheet.removeEventListener("change", syncSheets);
    for (const box of boxes) {
      box.removeEventListener("close", onBoxClose);
      box.removeEventListener("click", onBackdropClick);
    }
  };
}

export const mountCommentThread = createConnectMount({
  key: "comment-thread",
  rootSelector: ROOTS,
  connect,
});
