import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { commentThreadEvents } from "@skryensya/core/comment-thread";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountCommentThread } from "./comment-thread.js";

/*
 * Hand-written trims of what `comment-thread.ts`'s own templates emit. Two of them, because the
 * point of the rewrite is that the pieces work apart: one full thread, and one bare Comment with
 * no thread around it at all.
 */

const collapseButton = `<button type="button" class="sk-comment__collapse sk-button sk-interactive" data-sk-comment-collapse aria-expanded="true" data-icon-only data-size="sm">
  <span aria-hidden="true">
    <span data-state="closed"><span data-sk-icon="add" data-sk-icon-size="sm"></span></span>
    <span data-state="open"><span data-sk-icon="remove" data-sk-icon-size="sm"></span></span>
  </span>
  <span class="sk-visually-hidden">Ocultar respuestas</span>
</button>`;

const vote = (voted: string, count: string) => `<div class="sk-comment-vote" data-sk-comment-vote data-voted="${voted}">
  <button type="button" class="sk-comment-vote__up sk-button sk-interactive" data-sk-comment-vote-up data-icon-only data-size="sm" data-variant="ghost"${voted === "up" ? ' aria-pressed="true"' : ""}>
    <span aria-hidden="true"><span data-sk-icon="vote-up" data-sk-icon-size="md"></span></span>
    <span class="sk-visually-hidden">Votar a favor</span>
  </button>
  <span class="sk-comment-vote__count" data-sk-comment-vote-count>${count}</span>
  <button type="button" class="sk-comment-vote__down sk-button sk-interactive" data-sk-comment-vote-down data-icon-only data-size="sm" data-variant="ghost">
    <span aria-hidden="true"><span data-sk-icon="vote-down" data-sk-icon-size="md"></span></span>
    <span class="sk-visually-hidden">Votar en contra</span>
  </button>
</div>`;

const composer = (id: string) => `<form class="sk-comment-composer" data-sk-comment-composer>
  <div class="sk-form-field">
    <label class="sk-form-field__label" for="${id}">Comentario</label>
    <textarea class="sk-input" id="${id}"></textarea>
  </div>
  <div class="sk-comment-composer__actions">
    <button type="button" class="sk-comment-composer__cancel sk-button sk-interactive" data-sk-comment-composer-cancel data-size="sm" data-variant="ghost">Cancelar</button>
    <button type="submit" class="sk-comment-composer__submit sk-button sk-interactive" data-sk-comment-composer-submit data-size="sm" data-variant="accent">Publicar</button>
  </div>
</form>`;

function thread() {
  document.body.innerHTML = `<div class="sk-comment-thread" data-sk-comment-thread aria-label="Comentarios">
    <div class="sk-comment-thread__composer-slot">${composer("nuevo")}</div>
    <article class="sk-comment" data-sk-comment data-value="c1" data-collapsible>
      <div class="sk-comment__self">
        <div class="sk-comment__gutter">
          <span class="sk-comment__avatar"><span class="sk-avatar" data-size="sm" role="img" aria-label="Ada"><span class="sk-avatar__fallback" aria-hidden="true">Ad</span></span></span>
          ${collapseButton}
        </div>
        <div class="sk-comment__content">
          <div class="sk-comment__header">
            <div class="sk-comment__author">Ada</div>
            <div class="sk-comment__timestamp">hace 3h</div>
          </div>
          <div class="sk-comment__body" data-sk-comment-body>Primer comentario</div>
          <div class="sk-comment-actions" data-sk-comment-actions>
            ${vote("up", "4")}
            <button type="button" class="sk-comment-actions__reply sk-button sk-interactive" data-sk-comment-reply aria-expanded="false" data-size="sm" data-variant="ghost">Responder</button>
            <button type="button" class="sk-comment-actions__delete sk-button sk-interactive" data-sk-comment-delete data-size="sm" data-variant="ghost">
              <span aria-hidden="true"><span data-sk-icon="delete" data-sk-icon-size="md"></span></span>
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
      <div class="sk-comment__reply-slot" data-sk-comment-reply-slot hidden>${composer("respuesta-c1")}</div>
      <div class="sk-comment__replies" data-sk-comment-replies>
        <article class="sk-comment" data-sk-comment data-value="c1-r1">
          <div class="sk-comment__self">
            <div class="sk-comment__gutter">
              <span class="sk-comment__avatar"><span class="sk-avatar" data-size="sm" role="img" aria-label="Grace"><span class="sk-avatar__fallback" aria-hidden="true">Gr</span></span></span>
            </div>
            <div class="sk-comment__content">
              <div class="sk-comment__header">
                <div class="sk-comment__author">Grace</div>
              </div>
              <div class="sk-comment__body" data-sk-comment-body>Una respuesta anidada</div>
              <div class="sk-comment-actions" data-sk-comment-actions>${vote("none", "0")}</div>
            </div>
          </div>
        </article>
      </div>
    </article>
    <article class="sk-comment" data-sk-comment data-value="c2">
      <div class="sk-comment__self">
        <div class="sk-comment__content">
          <div class="sk-comment__header"><div class="sk-comment__author">Linus</div></div>
          <div class="sk-comment__body" data-sk-comment-body>Segundo comentario</div>
        </div>
      </div>
    </article>
  </div>`;
  mountCommentThread(document);
  return document.querySelector<HTMLElement>("[data-sk-comment-thread]")!;
}

const comment = (id: string) => document.querySelector<HTMLElement>(`[data-value="${id}"]`)!;

afterEach(() => {
  for (const root of document.querySelectorAll<HTMLElement>("[data-sk-ready]")) destroyMount(root);
  document.body.innerHTML = "";
});

describe("CommentThread vanilla enhancer", () => {
  it("dispatches vote with the comment's id and the clicked direction, and never mutates the paint itself", () => {
    const root = thread();
    const onVote = vi.fn();
    root.addEventListener(commentThreadEvents.vote, onVote as EventListener);

    const group = comment("c1").querySelector<HTMLElement>("[data-sk-comment-vote]")!;
    const downvote = group.querySelector<HTMLButtonElement>("[data-sk-comment-vote-down]")!;
    fireEvent.click(downvote);

    expect(onVote).toHaveBeenCalledTimes(1);
    expect((onVote.mock.calls[0][0] as CustomEvent).detail).toEqual({ direction: "down", id: "c1" });
    // Untouched: the vote is the consumer's data, not this enhancer's to flip.
    expect(group.getAttribute("data-voted")).toBe("up");
  });

  it("attributes a nested reply's vote to the reply, not to the comment above it", () => {
    const root = thread();
    const onVote = vi.fn();
    root.addEventListener(commentThreadEvents.vote, onVote as EventListener);

    fireEvent.click(comment("c1-r1").querySelector<HTMLButtonElement>("[data-sk-comment-vote-up]")!);

    // Once, and for the reply: the nearest root owns it, and the event still reaches the thread.
    expect(onVote).toHaveBeenCalledTimes(1);
    expect((onVote.mock.calls[0][0] as CustomEvent).detail).toEqual({ direction: "up", id: "c1-r1" });
  });

  it("dispatches delete only where the delete trigger exists", () => {
    const root = thread();
    expect(comment("c2").querySelector("[data-sk-comment-delete]")).toBeNull();

    const onDelete = vi.fn();
    root.addEventListener(commentThreadEvents.delete, onDelete as EventListener);
    fireEvent.click(comment("c1").querySelector<HTMLButtonElement>("[data-sk-comment-delete]")!);

    expect((onDelete.mock.calls[0][0] as CustomEvent).detail).toEqual({ id: "c1" });
  });

  it("toggles the reply composer's aria-expanded and hidden state, scoped to its own comment", () => {
    thread();
    const trigger = comment("c1").querySelector<HTMLButtonElement>("[data-sk-comment-reply]")!;
    const slot = comment("c1").querySelector<HTMLElement>("[data-sk-comment-reply-slot]")!;
    expect(slot.hidden).toBe(true);

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(slot.hidden).toBe(false);

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(slot.hidden).toBe(true);
  });

  it("collapse folds the REPLIES and leaves the comment itself readable", () => {
    thread();
    const c1 = comment("c1");
    const collapse = c1.querySelector<HTMLButtonElement>("[data-sk-comment-collapse]")!;
    const own = (selector: string) => {
      for (const el of c1.querySelectorAll<HTMLElement>(selector)) {
        if (el.closest("[data-sk-comment]") === c1) return el;
      }
      throw new Error(`no own ${selector}`);
    };

    fireEvent.click(collapse);

    expect(collapse.getAttribute("aria-expanded")).toBe("false");
    expect(own("[data-sk-comment-replies]").hidden).toBe(true);
    // What the comment SAYS stays put: a thread gets long because of what hangs off a comment,
    // not because of the comment, so folding must not take the thing being read away.
    expect(own("[data-sk-comment-body]").hidden).toBe(false);
    expect(own("[data-sk-comment-actions]").hidden).toBe(false);
  });

  it("submits a reply with the enclosing comment's id as parentId, resets it and closes the box", () => {
    const root = thread();
    const onReply = vi.fn();
    root.addEventListener(commentThreadEvents.reply, onReply as EventListener);

    const trigger = comment("c1").querySelector<HTMLButtonElement>("[data-sk-comment-reply]")!;
    fireEvent.click(trigger);
    const slot = comment("c1").querySelector<HTMLElement>("[data-sk-comment-reply-slot]")!;
    const textarea = slot.querySelector<HTMLTextAreaElement>("textarea")!;
    textarea.value = "una respuesta";

    fireEvent.submit(slot.querySelector("form")!);

    expect((onReply.mock.calls[0][0] as CustomEvent).detail).toEqual({ body: "una respuesta", parentId: "c1" });
    expect(textarea.value).toBe("");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(slot.hidden).toBe(true);
  });

  it("cancel on an EMPTY composer just closes it: nothing to lose, nothing to ask", () => {
    const root = thread();
    const onDiscard = vi.fn();
    root.addEventListener(commentThreadEvents.discard, onDiscard as EventListener);

    const trigger = comment("c1").querySelector<HTMLButtonElement>("[data-sk-comment-reply]")!;
    fireEvent.click(trigger);
    const slot = comment("c1").querySelector<HTMLElement>("[data-sk-comment-reply-slot]")!;
    expect(slot.hidden).toBe(false);

    fireEvent.click(slot.querySelector<HTMLButtonElement>("[data-sk-comment-composer-cancel]")!);

    expect(slot.hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(onDiscard).not.toHaveBeenCalled();
  });

  it("cancel on a composer WITH a draft dispatches discard and leaves the box open for the app", () => {
    const root = thread();
    const onDiscard = vi.fn();
    root.addEventListener(commentThreadEvents.discard, onDiscard as EventListener);

    const trigger = comment("c1").querySelector<HTMLButtonElement>("[data-sk-comment-reply]")!;
    fireEvent.click(trigger);
    const slot = comment("c1").querySelector<HTMLElement>("[data-sk-comment-reply-slot]")!;
    const textarea = slot.querySelector<HTMLTextAreaElement>("textarea")!;
    textarea.value = "algo a medio escribir";

    fireEvent.click(slot.querySelector<HTMLButtonElement>("[data-sk-comment-composer-cancel]")!);

    expect((onDiscard.mock.calls[0][0] as CustomEvent).detail).toEqual({
      body: "algo a medio escribir",
      parentId: "c1",
    });
    // Untouched: throwing a draft away is the consumer's call, so the enhancer reports and stops.
    expect(slot.hidden).toBe(false);
    expect(textarea.value).toBe("algo a medio escribir");
  });

  it("a vetoed reply keeps the draft and the box: preventDefault stops the after-effect", () => {
    const root = thread();
    root.addEventListener(commentThreadEvents.reply, (event) => event.preventDefault());

    const trigger = comment("c1").querySelector<HTMLButtonElement>("[data-sk-comment-reply]")!;
    fireEvent.click(trigger);
    const slot = comment("c1").querySelector<HTMLElement>("[data-sk-comment-reply-slot]")!;
    const textarea = slot.querySelector<HTMLTextAreaElement>("textarea")!;
    textarea.value = "algo que el servidor podria rechazar";

    fireEvent.submit(slot.querySelector("form")!);

    // Nothing was thrown away: a consumer whose POST failed still has what the person wrote.
    expect(textarea.value).toBe("algo que el servidor podria rechazar");
    expect(slot.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("submits the thread's own composer with parentId null", () => {
    const root = thread();
    const onReply = vi.fn();
    root.addEventListener(commentThreadEvents.reply, onReply as EventListener);

    const form = document.querySelector<HTMLFormElement>(".sk-comment-thread__composer-slot form")!;
    form.querySelector<HTMLTextAreaElement>("textarea")!.value = "hola";
    fireEvent.submit(form);

    expect((onReply.mock.calls[0][0] as CustomEvent).detail).toEqual({ body: "hola", parentId: null });
  });

  it("ignores an empty reply: no event, form left alone", () => {
    const root = thread();
    const onReply = vi.fn();
    root.addEventListener(commentThreadEvents.reply, onReply as EventListener);

    fireEvent.submit(document.querySelector<HTMLFormElement>(".sk-comment-thread__composer-slot form")!);

    expect(onReply).not.toHaveBeenCalled();
  });
});

describe("the pieces on their own", () => {
  it("folds the replies of a standalone Comment that has no thread around it", () => {
    document.body.innerHTML = `<article class="sk-comment" data-sk-comment data-value="solo" data-collapsible>
      <div class="sk-comment__self">
        <div class="sk-comment__gutter">${collapseButton}</div>
        <div class="sk-comment__content">
          <div class="sk-comment__header"><div class="sk-comment__author">Ada</div></div>
          <div class="sk-comment__body" data-sk-comment-body>Un comentario suelto</div>
        </div>
      </div>
      <div class="sk-comment__replies" data-sk-comment-replies>
        <article class="sk-comment" data-sk-comment data-value="solo-r1">
          <div class="sk-comment__self"><div class="sk-comment__content">
            <div class="sk-comment__header"><div class="sk-comment__author">Grace</div></div>
            <div class="sk-comment__body" data-sk-comment-body>Una respuesta</div>
          </div></div>
        </article>
      </div>
    </article>`;
    // Two: the comment and its reply. Every comment is its own mount root, which is what lets the
    // nearest one own an interaction instead of the outermost handling everything.
    expect(mountCommentThread(document)).toBe(2);

    const collapse = document.querySelector<HTMLButtonElement>("[data-sk-comment-collapse]")!;
    fireEvent.click(collapse);

    expect(collapse.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector<HTMLElement>("[data-sk-comment-replies]")!.hidden).toBe(true);
    // Its own body is untouched.
    expect(document.querySelector<HTMLElement>("[data-sk-comment-body]")!.hidden).toBe(false);
  });

  it("submits a standalone CommentComposer, reporting no parent", () => {
    document.body.innerHTML = composer("solo");
    expect(mountCommentThread(document)).toBe(1);

    const form = document.querySelector<HTMLFormElement>("form")!;
    const onReply = vi.fn();
    form.addEventListener(commentThreadEvents.reply, onReply as EventListener);
    form.querySelector<HTMLTextAreaElement>("textarea")!.value = "sin hilo";

    fireEvent.submit(form);

    expect((onReply.mock.calls[0][0] as CustomEvent).detail).toEqual({ body: "sin hilo", parentId: null });
  });

  it("reads a single-line input as readily as a textarea, since the composer ships neither", () => {
    document.body.innerHTML = `<form class="sk-comment-composer" data-sk-comment-composer>
      <div class="sk-form-field">
        <label class="sk-form-field__label" for="uno">Comentario</label>
        <input class="sk-input" id="uno" type="text">
      </div>
      <button type="submit" class="sk-comment-composer__submit sk-button sk-interactive" data-sk-comment-composer-submit>Publicar</button>
    </form>`;
    mountCommentThread(document);

    const form = document.querySelector<HTMLFormElement>("form")!;
    const onReply = vi.fn();
    form.addEventListener(commentThreadEvents.reply, onReply as EventListener);
    form.querySelector<HTMLInputElement>("input")!.value = "desde un input";

    fireEvent.submit(form);

    expect((onReply.mock.calls[0][0] as CustomEvent).detail).toEqual({ body: "desde un input", parentId: null });
  });

  it("reads a contenteditable surface too, so an Editor can be the control", () => {
    document.body.innerHTML = `<form class="sk-comment-composer" data-sk-comment-composer>
      <div contenteditable="true">desde un editor</div>
      <button type="submit" class="sk-comment-composer__submit sk-button sk-interactive" data-sk-comment-composer-submit>Publicar</button>
    </form>`;
    mountCommentThread(document);

    const form = document.querySelector<HTMLFormElement>("form")!;
    const onReply = vi.fn();
    form.addEventListener(commentThreadEvents.reply, onReply as EventListener);

    fireEvent.submit(form);

    expect((onReply.mock.calls[0][0] as CustomEvent).detail).toEqual({ body: "desde un editor", parentId: null });
  });
});
