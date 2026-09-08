import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Comment, CommentActions, CommentComposer, CommentThread, CommentVote } from "./comment-thread.js";
import { FormField } from "./form-field.js";
import { Input, Textarea } from "./input.js";

describe("Comment", () => {
  it("renders an author, a timestamp and a body with no thread, actions or replies around it", () => {
    const ui = render(
      <Comment author="Ada" timestamp="hace 3h">
        Primer comentario
      </Comment>,
    );

    expect(ui.container.querySelectorAll("article.sk-comment")).toHaveLength(1);
    expect(ui.getByText("Ada").className).toContain("sk-comment__author");
    expect(ui.getByText("hace 3h").className).toContain("sk-comment__timestamp");
    expect(ui.getByText("Primer comentario").className).toContain("sk-comment__body");
    // The simplest piece of the set really is the simplest: no chrome it was never given.
    expect(ui.container.querySelectorAll("button")).toHaveLength(0);
  });

  it("puts the avatar in the gutter, apart from the name, so the thread line can hang off it", () => {
    const ui = render(
      <Comment author="Ada" avatar={<img alt="Ada" src="/ada.png" />} timestamp="hace 3h">
        Hola
      </Comment>,
    );

    const profile = ui.container.querySelector(".sk-comment__profile")!;
    expect(profile.querySelector(".sk-comment__avatar img")).toBeTruthy();
    // The name stays in the identity surface rather than being folded in with the avatar.
    expect(ui.getByText("Ada").className).toContain("sk-comment__author");
  });

  it("makes the avatar and author one profile link only when given a profile URL", () => {
    const ui = render(
      <Comment author="Ada" avatar={<img alt="Ada" src="/ada.png" />} profileHref="/profiles/ada">
        Hola
      </Comment>,
    );

    const profile = ui.getByRole("link", { name: "Ada" });
    expect(profile.getAttribute("href")).toBe("/profiles/ada");
    expect(profile.querySelector(".sk-comment__avatar img")).toBeTruthy();
    expect(profile.querySelector(".sk-comment__author")?.textContent).toBe("Ada");

    ui.rerender(
      <Comment author="Ada" avatar={<img alt="Ada" src="/ada.png" />}>
        Hola
      </Comment>,
    );
    expect(ui.queryByRole("link", { name: /Ada/ })).toBeNull();
  });

  it("takes composed content in the author slot, not only a string", () => {
    const ui = render(
      <Comment author={<em>Ada</em>} timestamp="hace 3h">
        Hola
      </Comment>,
    );

    expect(ui.container.querySelector(".sk-comment__author em")).toBeTruthy();
  });

  it("renders no fold control unless it is collapsible AND has replies to fold", () => {
    const ui = render(<Comment author="Ada">Hola</Comment>);
    expect(ui.queryByRole("button", { name: "Ocultar respuestas" })).toBeNull();

    // Collapsible but childless: there is nothing to fold, so still no control.
    ui.rerender(
      <Comment author="Ada" collapsible>
        Hola
      </Comment>,
    );
    expect(ui.queryByRole("button", { name: "Ocultar respuestas" })).toBeNull();

    ui.rerender(
      <Comment author="Ada" collapsible replies={<Comment author="Grace">Una respuesta</Comment>}>
        Hola
      </Comment>,
    );
    expect(ui.getByRole("button", { name: "Ocultar respuestas" })).toBeTruthy();
  });

  /* The fold node is a real Button at the scale's smallest published size, NOT a face this
   * component shrinks for itself. Asserted because that is exactly what regressed before: the
   * measurement used to live in comment-thread's own CSS, where nothing could see it drift. */
  it("draws the fold control as an icon-only Button at the xs size", () => {
    const ui = render(
      <Comment author="Ada" collapsible replies={<Comment author="Grace">Una respuesta</Comment>}>
        Hola
      </Comment>,
    );

    const fold = ui.getByRole("button", { name: "Ocultar respuestas" });
    expect(fold.getAttribute("data-size")).toBe("xs");
    expect(fold.hasAttribute("data-icon-only")).toBe(true);
    expect(fold.classList.contains("sk-button")).toBe(true);
    expect(fold.classList.contains("sk-interactive")).toBe(true);
  });

  it("folds the REPLIES and leaves the comment itself readable", () => {
    const ui = render(
      <Comment
        actions={<CommentActions reply />}
        author="Ada"
        collapsible
        replies={<Comment author="Grace">Una respuesta</Comment>}
      >
        Primer comentario
      </Comment>,
    );

    const fold = ui.getByRole("button", { name: "Ocultar respuestas" });
    fireEvent.click(fold);

    expect(fold.getAttribute("aria-expanded")).toBe("false");
    expect(ui.container.querySelector<HTMLElement>(".sk-comment__replies")!.hidden).toBe(true);
    // What the comment SAYS stays put: a thread gets long because of what hangs off a comment, not
    // because of the comment, so folding must not take the thing being read away.
    expect(ui.container.querySelector<HTMLElement>(".sk-comment__body")!.hidden).toBe(false);
    expect(ui.getByRole("button", { name: "Responder" })).toBeTruthy();
  });

  it("nests replies as Comments of the same shape, at any depth", () => {
    const ui = render(
      <Comment
        author="Ada"
        replies={
          <Comment author="Grace" replies={<Comment author="Linus">Nieta</Comment>}>
            Hija
          </Comment>
        }
      >
        Raíz
      </Comment>,
    );

    expect(ui.container.querySelectorAll("article.sk-comment")).toHaveLength(3);
    expect(ui.getByText("Nieta")).toBeTruthy();
  });
});

describe("CommentVote", () => {
  it("reports the direction clicked and reflects the viewer's own past vote", () => {
    const onVote = vi.fn();
    const ui = render(<CommentVote count="4" onVote={onVote} voted="up" />);

    expect(ui.getByRole("button", { name: "Votar a favor" }).getAttribute("aria-pressed")).toBe("true");
    expect(ui.getByRole("button", { name: "Votar en contra" }).getAttribute("aria-pressed")).toBe("false");
    // The paint reads the group, so authored markup and React agree on one attribute.
    expect(ui.container.querySelector(".sk-comment-vote")?.getAttribute("data-voted")).toBe("up");
    expect(ui.getByText("4").className).toContain("sk-comment-vote__count");

    fireEvent.click(ui.getByRole("button", { name: "Votar en contra" }));
    expect(onVote).toHaveBeenCalledWith("down");
  });
});

describe("CommentActions", () => {
  it("renders only the triggers it was given, and reports each", () => {
    const onReply = vi.fn();
    const onDelete = vi.fn();
    const ui = render(<CommentActions />);
    expect(ui.container.querySelectorAll("button")).toHaveLength(0);

    ui.rerender(<CommentActions deletable onDelete={onDelete} onReply={onReply} reply />);
    fireEvent.click(ui.getByRole("button", { name: "Responder" }));
    fireEvent.click(ui.getByRole("button", { name: "Eliminar" }));

    expect(onReply).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});

describe("CommentComposer", () => {
  it("submits the body of whatever control it was given, then resets it", () => {
    const onSubmit = vi.fn();
    const ui = render(
      <CommentComposer onSubmit={onSubmit}>
        <FormField label="Comentario">
          <Textarea />
        </FormField>
      </CommentComposer>,
    );

    const textarea = ui.getByLabelText("Comentario") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "  una respuesta  " } });
    fireEvent.submit(ui.container.querySelector("form")!);

    expect(onSubmit).toHaveBeenCalledWith("una respuesta");
    expect(textarea.value).toBe("");
  });

  it("reads a single-line Input just as readily as a Textarea, since it ships neither", () => {
    const onSubmit = vi.fn();
    const ui = render(
      <CommentComposer onSubmit={onSubmit}>
        <FormField label="Comentario">
          <Input />
        </FormField>
      </CommentComposer>,
    );

    fireEvent.change(ui.getByLabelText("Comentario"), { target: { value: "desde un input" } });
    fireEvent.submit(ui.container.querySelector("form")!);

    expect(onSubmit).toHaveBeenCalledWith("desde un input");
  });

  it("submits nothing when the control is empty", () => {
    const onSubmit = vi.fn();
    const ui = render(
      <CommentComposer onSubmit={onSubmit}>
        <FormField label="Comentario">
          <Textarea />
        </FormField>
      </CommentComposer>,
    );

    fireEvent.submit(ui.container.querySelector("form")!);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("CommentThread", () => {
  it("names the thread and renders its composer above the comments", () => {
    const ui = render(
      <CommentThread
        composer={
          <CommentComposer>
            <FormField label="Comentario">
              <Textarea />
            </FormField>
          </CommentComposer>
        }
        label="Comentarios"
      >
        <Comment author="Ada">Primero</Comment>
        <Comment author="Grace">Segundo</Comment>
      </CommentThread>,
    );

    expect(ui.getByLabelText("Comentarios").className).toContain("sk-comment-thread");
    expect(ui.container.querySelectorAll("article.sk-comment")).toHaveLength(2);
    expect(ui.getByRole("button", { name: "Publicar" })).toBeTruthy();
  });
});

/*
 * THE SHEET. `matchMedia` is stubbed to "no" by `test-setup.ts` - the in-flow presentation every
 * test above asserts against - so a test that wants a phone says so before rendering. jsdom has no
 * modality (`showModal` is `show` under another name), so what is asserted is the state both the
 * binding and the stylesheet act on: the `sk-vaul` class and the `open` attribute.
 */
describe("CommentThread on a narrow viewport", () => {
  const asPhone = () =>
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }));

  afterEach(() => vi.unstubAllGlobals());

  const composer = (
    <CommentComposer>
      <FormField label="Comentario">
        <Textarea />
      </FormField>
    </CommentComposer>
  );

  it("hands the thread's own composer to a trigger and opens it as a sheet", () => {
    asPhone();
    const ui = render(
      <CommentThread composer={composer} label="Comentarios">
        <Comment author="Ada">Primero</Comment>
      </CommentThread>,
    );

    const box = ui.container.querySelector<HTMLDialogElement>("dialog.sk-comment-thread__composer-slot")!;
    expect(box.open).toBe(false);
    expect(box.className).toContain("sk-vaul");

    fireEvent.click(ui.getByRole("button", { name: "Escribir un comentario" }));
    expect(box.open).toBe(true);
  });

  it("keeps that composer open in flow above the breakpoint, with no sheet class", () => {
    const ui = render(
      <CommentThread composer={composer} label="Comentarios">
        <Comment author="Ada">Primero</Comment>
      </CommentThread>,
    );

    const box = ui.container.querySelector<HTMLDialogElement>("dialog.sk-comment-thread__composer-slot")!;
    expect(box.open).toBe(true);
    expect(box.className).not.toContain("sk-vaul");
    /*
     * The trigger IS rendered, and whether it shows is CSS's decision (comment-thread.css hides it
     * above the 52rem breakpoint). This used to assert its absence, on the reasoning that a control
     * with nothing to do is one a keyboard has to tab through - which is not true of the mechanism
     * actually used: `display: none` takes an element out of the tab order and out of the
     * accessibility tree, so there is nothing to tab to. `comment-thread-trigger.spec.ts` measures
     * exactly that in a real browser, since jsdom applies no stylesheet and cannot answer it here.
     *
     * Rendering it unconditionally is what keeps the two bindings on one DOM: authored markup emits
     * the trigger at every width, and gating the React one on a JS-measured viewport made them
     * disagree at the same width.
     */
    expect(ui.getByRole("button", { name: "Escribir un comentario" })).toBeTruthy();
  });

  it("opens a reply box as a sheet, and says so on the trigger", () => {
    asPhone();
    const ui = render(
      <Comment author="Ada" replyComposer={composer} replyOpen>
        Primero
      </Comment>,
    );

    const box = ui.container.querySelector<HTMLDialogElement>("dialog.sk-comment__reply-slot")!;
    expect(box.open).toBe(true);
    expect(box.className).toContain("sk-vaul");
  });

  it("says a reply trigger opens a dialog, in both presentations", () => {
    const ui = render(<CommentActions reply replyLabel="Responder" />);
    expect(ui.getByRole("button", { name: "Responder" }).getAttribute("aria-haspopup")).toBe("dialog");
  });
});
