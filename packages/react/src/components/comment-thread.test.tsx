import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

    const gutter = ui.container.querySelector(".sk-comment__gutter")!;
    expect(gutter.querySelector(".sk-comment__avatar img")).toBeTruthy();
    // The name stays in the header, not folded in with the avatar.
    expect(ui.getByText("Ada").className).toContain("sk-comment__author");
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
